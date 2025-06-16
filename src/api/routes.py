"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Recipe, Ingredient, Comment, Media, UserStatus, Collection, RecipeIngredient, DifficultyType, MediaType, RecipeScore, ShoppingListItem
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from sqlalchemy import select, delete, func
from datetime import datetime, timezone
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from werkzeug.security import generate_password_hash, check_password_hash
from api.email_utils import send_email, get_serializer
from api.recipe_utils import convert_to_grams, get_ingredient_info, calculate_calories, calculate_carbs, calculate_fat, calculate_protein
import json


api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)

# Placeholder image URL for recipes without images
PLACEHOLDER_IMAGE_URL = "https://via.placeholder.com/400x300?text=No+Image"


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }

    return jsonify(response_body), 200

# From here starts all user related endpoints
# GET method for all users (use for test, comment it out after)


@api.route('/users', methods=['GET'])
def get_users():

    statement = select(User)

    users = db.session.execute(statement).scalars().all()

    return jsonify([user.serialize() for user in users]), 200

# POST to create a new user


@api.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.json

        if not data["email"] or not data["password"] or not data["username"]:
            return jsonify({"error": "Missing required information"}), 400

        # Check if user is registered
        stm = select(User).where(User.email == data["email"])
        user = db.session.execute(stm).scalar_one_or_none()

        if user:
            return jsonify({"error": "This email is already registered, please log in"}), 409

        # hash password to not show to others
        hashed_password = generate_password_hash(data["password"])

        new_user = User(
            username=data["username"],
            email=data["email"],
            password=hashed_password,
            status=UserStatus.active,  # Default status
            created_at=datetime.now(timezone.utc),
            # we will update this field on PUT method, created_at remains the same
            updated_at=datetime.now(timezone.utc)
        )
        db.session.add(new_user)
        db.session.commit()

        return jsonify({"success": True}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# POST to make authentication to log in
@api.route('/login', methods=['POST'])
def login():
    try:
        data = request.json

        if not data["email"] or not data["password"]:
            return jsonify({"error": "Missing required information"}), 400

        # Check if the user has an account
        email = data["email"].strip().lower()
        stmt = select(User).where(User.email == email)
        user = db.session.execute(stmt).scalar_one_or_none()

        if user is None:
            return jsonify({"error": "User not found, please sign up"}), 405

        # Check if the password matches the user
        if not user or not check_password_hash(user.password, data["password"]):
            return jsonify({"error": "Email or password not valid"}), 401

       # Generate str token as it's not possible to be a number
        token = create_access_token(identity=str(user.id))

        return jsonify({"success": True, "token": token}), 200

    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500


# GET to access the profile after logging in
@api.route('/user', methods=['GET'])
@jwt_required()  # Requires to request the token from the frontend
def get_user_profile():

    id = get_jwt_identity()
    stm = select(User).where(User.id == id)
    user = db.session.execute(stm).scalar_one_or_none()

    if not user:
        return jsonify({"success": False, 'msg': 'Something went wrong, try again.'})

    return jsonify({"success": True, 'user': user.serialize()})

# DELETE user account (we keep recipes posted and soft delete the user personal data and comments)


@api.route("/user", methods=["DELETE"])
@jwt_required()
def delete_user():

    user_id = get_jwt_identity()

    stmt = select(User).where(User.id == user_id)
    user = db.session.execute(stmt).scalar_one_or_none()
    if user is None:
        return jsonify({"error": "User not found"}), 404

    # Anonymize personal data but keep the recipes on the dabase.
    user.username = f"deleted_user_{user_id}"  # set username place holder
    # set email place holder
    user.email = f"deleted_user_{user_id}@example.com"
    user.password = generate_password_hash(f"User{user_id}NoLongerExists")
    user.status = UserStatus.deleted  # Mark as deleted status
    user.updated_at = datetime.now(timezone.utc)

    # We also delete the comments and fav list.
    delete_comment = delete(Comment).where(Comment.user_id == user_id)
    delete_collection = delete(Collection).where(Collection.user_id == user_id)
    db.session.execute(delete_comment)
    db.session.execute(delete_collection)

    db.session.commit()

    return jsonify({"message": "You account has been successfully erased"}), 200


@api.route("/user", methods=["PUT"])
@jwt_required()
def update_user():

    user_id = get_jwt_identity()
    data = data = request.json

    stmt = select(User).where(User.id == user_id)
    user = db.session.execute(stmt).scalar_one_or_none()

    if user is None:
        return jsonify({"error": "User not found"}), 404

   # The update does not requiere to add all fields on the body, just what you need to change
   # Sistem will not allow same email or username
    if ('email' in data):
        user.email = data["email"]
    if ('password' in data):
        user.password = generate_password_hash(data["password"])
    if ('username' in data):
        user.username = data["username"]
    ## (Alice) he actualizado esta funcion para evitar errores cuando no se pasa algun dato (email o password o username)
    ## Por otro lado, sí que se puede enviar el mismo correo... LOS CORREOS SON UNICOS Y LOS USERNAMES TB (por confirmar en backend!!)...
    ## El codigo que había:
    ### user.email = data["email"]
    ### user.password = generate_password_hash(data["password"])
    ### user.username = data["username"]
    user.updated_at = datetime.now(timezone.utc)

    db.session.commit()
    return jsonify(user.serialize()), 200


@api.route('/forgot-password', methods=['POST'])
def forgot_password():

    try:
        email = request.json.get('email')
        if not email:
            return jsonify({"error": "Email is required"}), 400

        user = db.session.query(User).filter_by(email=email).first()

        # Evitar revelar si el correo existe
        if not user or user.status != UserStatus.active:
            return jsonify({"message": "If that email exists, a reset link was sent."}), 200

        # Create token for limited time
        serializer = get_serializer()
        token = serializer.dumps(user.email, salt='password-reset')

        # Generates link to reset password
        reset_url = url_for('api.reset_password', token=token, _external=True)

        # Personalize email
        app_name = "Recetea"  # Customize this
        subject = f"{app_name} - Password Reset Request"
        body = f"""
            Hi {user.username},

            We received a request to reset your password for your {app_name} account.

            If you made this request, please reset your password by clicking the link below:

            {reset_url}

            This link will expire in 1 hour. If you didn’t request a password reset, you can ignore this email.

            Best,
            The {app_name} Team
            """

        # Sends email with reset link to user
        send_email(
            to=user.email,
            subject=subject,
            body=body
        )

        return jsonify({"message": f"If that email exists, a reset link was sent."}), 200

    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500


@api.route('/reset-password/<token>', methods=['POST'])
def reset_password(token):
    try:
        serializer = get_serializer()

        email = serializer.loads(token, salt='password-reset', max_age=3600)
        data = request.json
        new_password = data["password"]

        if not new_password:
            return jsonify({"error": "Add your new password"}), 400

        user = db.session.query(User).filter_by(email=email).first()

        if not user:
            return jsonify({"error": "User not found"}), 404

        user.password = generate_password_hash(new_password)
        user.updated_at = datetime.now(timezone.utc)
        db.session.commit()

        return jsonify({"message": "Password updated successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# End of user endpoints

# From here all recipe related endpoints
# GET all recipes(guests)


@api.route('/recipes', methods=['GET'])
def get_recipes():

    stmt = select(Recipe)
    recipes = db.session.execute(stmt).scalars().all()

    return jsonify([recipe.serialize() for recipe in recipes]), 200

# GET a specific recipe(guests)


@api.route('/recipes/<int:recipe_id>', methods=['GET'])
def get_recipe(recipe_id):

    stmt = select(Recipe).where(Recipe.id == recipe_id)
    recipe = db.session.execute(stmt).scalar_one_or_none()

    if recipe is None:
        return jsonify({"error": "Recipe not found"}), 404

    return jsonify(recipe.serialize()), 200

# GET all recipes created by an user(need to log in)


@api.route('/user/recipes', methods=['GET'])
@jwt_required()
def get_user_recipes():

    user_id = get_jwt_identity()
    stmt_user = select(User).where(User.id == user_id)
    user = db.session.execute(stmt_user).scalar_one_or_none()

    if user is None:
        return jsonify({"error": "User not found. Please try to log in again or sign up."}), 404

    stmt_recipe = select(Recipe).where(Recipe.author == user_id)
    recipes = db.session.execute(stmt_recipe).scalars().all()

    if not recipes:
        return jsonify({"message": "You haven't created any recipes yet."}), 200

    return jsonify([recipe.serialize() for recipe in recipes]), 200

# GET a specific recipe created by an user(need to log in)


@api.route('/user/recipes/<int:recipe_id>', methods=['GET'])
@jwt_required()
def get_user_recipe(recipe_id):

    user_id = get_jwt_identity()

    stmt = select(Recipe).where(
        Recipe.id == recipe_id, Recipe.author == user_id)
    recipe = db.session.execute(stmt).scalar_one_or_none()

    if recipe is None:
        return jsonify({"error": "Recipe not found or does not belong to the current user."}), 404

    return jsonify(recipe.serialize()), 200

# POST to create a new recipe(need to log in)


@api.route('/user/recipes', methods=['POST'])
@jwt_required()
def create_recipe():

    user_id = get_jwt_identity()

    try:
        data = request.json

        if not data["title"]:
            return jsonify({"error": "Please add a title to your recipe"}), 400

        if not data["difficulty_type"]:
            return jsonify({"error": "Please add a difficulty level to your recipe"}), 400

        if not data["portions"] or data["portions"] < 1:
            return jsonify({"error": "Please set a valid number of portions"}), 400

        if not data["steps"]:
            return jsonify({"error": "Please add all the steps and instructions needed to your recipe"}), 400

        if not data["ingredient"]:
            return jsonify({"error": "Please add all the igredients details to your recipe"}), 400

        # Conditions to turn the string value into the enum value in our database
        difficulty_map = {
            "Easy": DifficultyType.EASY,
            "Moderate": DifficultyType.MODERATE,
            "Hard": DifficultyType.HARD
        }

        setLevel = difficulty_map.get(data["difficulty_type"])
        if setLevel is None:
            return jsonify({"error": "Please choose from one of these options for difficulty level: Easy, Moderate or Hard."}), 400

        # Convert the steps into JSON to avoid issues on Frontend
        steps_data = data["steps"]

        if isinstance(steps_data, str):
            try:
                steps_list = json.loads(steps_data)
            except Exception:
                # fallback: treat it as single string step in a list
                steps_list = [steps_data]
        elif isinstance(steps_data, list):
            steps_list = steps_data
        else:
            return jsonify({"error": "Invalid steps format"}), 400

        steps_json = json.dumps(steps_list)

        # We add on frontend the control of blank space and lower cases
        new_recipe = Recipe(
            title=data["title"],
            author=user_id,
            difficulty_type=setLevel,
            prep_time=data["prep_time"],
            steps=steps_json,
            portions=data["portions"],
            published=datetime.now(timezone.utc)
        )
        db.session.add(new_recipe)
        db.session.flush()

        total_grams = 0

        for ing in data["ingredient"]:
            name = ing["name"]
            quantity = ing["quantity"]
            unit = ing["unit"]

            normalized_name = name.lower().strip()
            info = get_ingredient_info(normalized_name)

            if not info or not isinstance(info, dict):
                return jsonify({"error": f"Failed to fetch ingredient info for '{name}'"}), 400

            allergens_list = info.get("allergens", [])

            if not isinstance(allergens_list, list):
                allergens_list = []
            allergens_str = ",".join(
                a.strip() for a in allergens_list if isinstance(a, str) and a.strip())

            ingredient = db.session.query(Ingredient).filter(
                Ingredient.name == normalized_name).one_or_none()

            if not ingredient:
                ingredient = Ingredient(
                    name=name,
                    allergens=allergens_str
                )
                db.session.add(ingredient)
                db.session.flush()

            if allergens_str and ingredient.allergens != allergens_str:
                ingredient.allergens = allergens_str

            calories = info["calories"] if info else None
            fat = info["fat"] if info else None
            saturated_fat = info["saturated_fat"] if info else None
            carbs = info["carbs"] if info else None
            sugars = info["sugars"] if info else None
            fiber = info["fiber"] if info else None
            protein = info["protein"] if info else None
            salt = info["salt"] if info else None
            sodium = info["sodium"] if info else None

            grams = convert_to_grams(name, unit, quantity)
            total_grams += grams

            recipe_ing = RecipeIngredient(
                recipe_id=new_recipe.id,
                ingredient_id=ingredient.id,
                quantity=quantity,
                unit=unit,
                calories=calories,
                fat=fat,
                saturated_fat=saturated_fat,
                carbs=carbs,
                sugars=sugars,
                fiber=fiber,
                protein=protein,
                salt=salt,
                sodium=sodium
            )
            new_recipe.ingredients.append(recipe_ing)
            db.session.add(recipe_ing)

        new_recipe.total_grams = total_grams

        # Check for media if they added image to the recipe
        media_data = data["media"]

        if not media_data:
            # If no media was submitted, add a placeholder image
            placeholder_media = Media(
                recipe_id=new_recipe.id,
                type_media=MediaType.IMAGE,
                url=PLACEHOLDER_IMAGE_URL
            )
        db.session.add(placeholder_media)
        db.session.commit()

        return jsonify({"success": True, "recipe_id": new_recipe.id}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# PUT a specific recipe created by the user(need to log in)


@api.route('/user/recipes/<int:recipe_id>', methods=['PUT'])
@jwt_required()
def edit_recipe(recipe_id):

    user_id = get_jwt_identity()

    stmt = select(Recipe).where(
        Recipe.id == recipe_id, Recipe.author == user_id)
    recipe = db.session.execute(stmt).scalar_one_or_none()

    try:
        data = request.json

        if not data["title"]:
            return jsonify({"error": "Please add a title to your recipe"}), 400

        if not data["difficulty_type"]:
            return jsonify({"error": "Please add a difficulty level to your recipe"}), 400

        if not data["steps"]:
            return jsonify({"error": "Please add all the steps and instructions needed to your recipe"}), 400

        if not data["ingredient"]:
            return jsonify({"error": "Please add all the igredients details to your recipe"}), 400

        # Conditions to turn the string value into the enum value in our database
        if data["difficulty_type"] == "Easy":
            setLevel = DifficultyType.EASY

        elif data["difficulty_type"] == "Moderate":
            setLevel = DifficultyType.MODERATE

        elif data["difficulty_type"] == "Hard":
            setLevel = DifficultyType.HARD

        else:
            return jsonify({"error": "Please choose from one of these options for difficulty level: Easy, Moderate or Hard."}), 400

        # Convert the steps into JSON to avoid issues on Frontend
        steps_data = data["steps"]

        if isinstance(steps_data, str):
            try:
                steps_list = json.loads(steps_data)
            except Exception:
                # fallback: treat it as single string step in a list
                steps_list = [steps_data]
        elif isinstance(steps_data, list):
            steps_list = steps_data
        else:
            return jsonify({"error": "Invalid steps format"}), 400

        steps_json = json.dumps(steps_list)

        # We add on frontend the control of blank space and lower cases
        recipe.title = data["title"]
        recipe.author = user_id
        recipe.difficulty_type = setLevel
        recipe.prep_time = data["prep_time"]
        recipe.portions = data["portions"]
        recipe.steps = steps_json
        recipe.published = datetime.now(timezone.utc)
        db.session.flush()

        # We delete all the ingredients associted to recipe before adding the new ones
        delete_stmt = delete(RecipeIngredient).where(
            RecipeIngredient.recipe_id == recipe_id)
        db.session.execute(delete_stmt)
        db.session.flush()

        total_grams = 0

        for ing in data["ingredient"]:
            name = ing["name"]
            quantity = ing["quantity"]
            unit = ing["unit"]

            normalized_name = name.lower().strip()

            stmt = select(Ingredient).where(Ingredient.name == normalized_name)
            ingredient = db.session.execute(stmt).scalar_one_or_none()

            info = get_ingredient_info(normalized_name)
            calories = info["calories"] if info else 0
            fat = info["fat"] if info else 0
            saturated_fat = info["saturated_fat"] if info else 0
            carbs = info["carbs"] if info else 0
            sugars = info["sugars"] if info else 0
            fiber = info["fiber"] if info else 0
            protein = info["protein"] if info else 0
            salt = info["salt"] if info else 0
            sodium = info["sodium"] if info else 0
            allergens = ",".join(info["allergens"]) if info and info.get(
                "allergens") else ""

            if not ingredient:
                ingredient = Ingredient(
                    name=normalized_name,
                    allergens=allergens
                )
                db.session.add(ingredient)
                db.session.flush()

            if allergens and ingredient.allergens != allergens:
                ingredient.allergens = allergens
                db.session.flush()

            grams = convert_to_grams(name, unit, quantity)
            total_grams += grams

            recipe_ing = RecipeIngredient(
                recipe_id=recipe.id,
                ingredient_id=ingredient.id,
                quantity=quantity,
                unit=unit,
                calories=calories,
                fat=fat,
                saturated_fat=saturated_fat,
                carbs=carbs,
                sugars=sugars,
                fiber=fiber,
                protein=protein,
                salt=salt,
                sodium=sodium,
            )
            recipe.ingredients.append(recipe_ing)
            db.session.add(recipe_ing)

        recipe.total_grams = total_grams

        # Media handling
        media_data = data.get("media")

        if not media_data:
            placeholder_media = Media(
                recipe_id=recipe.id,
                type_media=MediaType.IMAGE,
                url=PLACEHOLDER_IMAGE_URL
            )
            db.session.add(placeholder_media)
        else:
            if isinstance(media_data, dict):
                media_data = [media_data]
            # Here you can add your media update logic for multiple media entries if needed

        db.session.commit()

        return jsonify({"success": True}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# DELETE recipe created by user


@api.route("/user/recipes/<int:recipe_id>", methods=["DELETE"])
@jwt_required()
def delete_one_recipe(recipe_id):

    user_id = get_jwt_identity()

    stmt = select(Recipe).where(
        Recipe.id == recipe_id, Recipe.author == user_id)
    recipe = db.session.execute(stmt).scalar_one_or_none()

    if recipe is None:
        return jsonify({"error": "Recipe not found"}), 404

    # Delte media from recipe
    delete_recipe_media = delete(Media).where(Media.recipe_id == recipe_id)
    db.session.execute(delete_recipe_media)

    # Delete recipe from asociation table
    delete_recipe_ingredients = delete(RecipeIngredient).where(
        RecipeIngredient.recipe_id == recipe_id)
    db.session.execute(delete_recipe_ingredients)

    # Delete the recipe itself
    delete_recipe = delete(Recipe).where(Recipe.id == recipe_id)
    db.session.execute(delete_recipe)

    db.session.commit()

    return jsonify({"message": "Recipe has been deleted successfully"}), 200

# Recipe endpoints end here

# ========================
# Media Endpoints
# ========================

# GET all media items(for test)


@api.route('/media', methods=['GET'])
def get_all_media():

    media_items = Media.query.all()

    return jsonify([m.serialize() for m in media_items]), 200


# GET media by ID(for test)
# We do not need one for user loged in as the recipe serialize the media associated to it
@api.route('/media/<int:media_id>', methods=['GET'])
def get_media_by_id(media_id):

    media = Media.query.get(media_id)

    if not media:
        return jsonify({"error": "Media not found"}), 404

    return jsonify(media.serialize()), 200

# POST new media item


@api.route('/user/recipes/<int:recipe_id>/media', methods=['POST'])
@jwt_required()
def add_media(recipe_id):

    user_id = get_jwt_identity()

    try:
        data = request.json

        # Only allow to add if the recipe belongs to user
        stmt = select(Recipe).where(
            Recipe.id == recipe_id, Recipe.author == user_id)
        recipe = db.session.execute(stmt).scalar_one_or_none()

        if recipe is None:
            return jsonify({"error":  "Recipe not found or not owned by user"}), 404

        # Ensure required fields are present
        if not data["type_media"] or not data["url"]:
            return jsonify({"error": "Missing data. Failed to upload media."}), 400

        # Convert the type_medi to match the enum in MediaTupe database
        if data["type_media"].lower() == "image":
            media_type = MediaType.IMAGE

        else:
            return jsonify({"error": "Invalid media type"}), 400

        placeholder_url = PLACEHOLDER_IMAGE_URL  # Replace with actual placeholder URL

        existing_placeholder = db.session.execute(
            select(Media).where(
                Media.recipe_id == recipe_id,
                Media.type_media == MediaType.IMAGE,
                Media.url == placeholder_url
            )
        ).scalar_one_or_none()

        if existing_placeholder:
            db.session.delete(existing_placeholder)

        new_media = Media(
            recipe_id=recipe_id,
            type_media=media_type,
            url=data["url"]
        )

        db.session.add(new_media)
        db.session.commit()
        return jsonify(new_media.serialize()), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# DELETE a media item
@api.route('/user/recipes/<int:recipe_id>/media/<int:media_id>', methods=['DELETE'])
@jwt_required()
def delete_media(recipe_id, media_id):

    user_id = get_jwt_identity()

    stmt_recipe = select(Recipe).where(
        Recipe.id == recipe_id, Recipe.author == user_id)
    recipe = db.session.execute(stmt_recipe).scalar_one_or_none()

    if recipe is None:
        return jsonify({"error": "Recipe not found"}), 404

    media_stmt = select(Media).where(Media.recipe_id ==
                                     recipe_id, Media.id == media_id)
    media = db.session.execute(media_stmt).scalar_one_or_none()

    if not media:
        return jsonify({"error": "Media not found"}), 404

    # Will only allow to delete the media of said recipe
    # The recipe only alows to edit if owned by the user
    if media.recipe_id != recipe_id:
        return jsonify({"error": "Media does not belong to this recipe"}), 403

    db.session.delete(media)
    db.session.flush()

    # Check if there is any media related to the recipe left
    remaining_media_stmt = select(Media).where(
        Media.recipe_id == recipe_id)  # ← Fix: Check all remaining media
    remaining_media = db.session.execute(
        remaining_media_stmt).scalars().first()

    # If none we add a placeholder image
    if not remaining_media:
        placeholder_media = Media(
            recipe_id=recipe_id,
            type_media=MediaType.IMAGE,
            url=PLACEHOLDER_IMAGE_URL
        )

        db.session.add(placeholder_media)

    db.session.commit()

    return jsonify({"message": "Image deleted. Upload a new image."}), 200

# =================================================================
# Comment endpoints
# =================================================================

# GET all comments(for test)


@api.route('/comments', methods=['GET'])
def get_all_comments():

    comments = Comment.query.all()

    return jsonify([comment.serialize() for comment in comments]), 200

# GET comment by ID(for test)


@api.route('/comments/<int:comment_id>', methods=['GET'])
def get_comments(comment_id):

    comment = Comment.query.get(comment_id)

    if comment is None:
        return jsonify({"error": "Comment not found"}), 404

    return jsonify(comment.serialize()), 200

# GET all comments by recipe ID


@api.route('/recipes/<int:recipe_id>/comments', methods=['GET'])
def get_comment(comment_id):

    comment = Comment.query.get(comment_id)

    if comment is None:
        return jsonify({"error": "Comment not found"}), 404

    return jsonify(comment.serialize()), 200

# POST new comment by recipe ID


@api.route('/user/recipes/<int:recipe_id>/comments', methods=['POST'])
@jwt_required()
def create_comment(recipe_id):

    user_id = get_jwt_identity()

    try:
        data = request.json

        stmt_recipe = select(Recipe).where(
            Recipe.id == recipe_id, Recipe.author == user_id)
        recipe = db.session.execute(stmt_recipe).scalar_one_or_none()

        if recipe is None:
            return jsonify({"error": "Recipe not found"}), 404

        if not data["content"]:
            return jsonify({"error": "Missing content"}), 400

        new_comment = Comment(
            user_id=user_id,
            recipe_id=recipe_id,
            content=data["content"]
        )

        db.session.add(new_comment)
        db.session.commit()

        return jsonify(new_comment.serialize()), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# PUT to update comment
@api.route('/user/recipes/<int:recipe_id>/comments/<int:comment_id>', methods=['PUT'])
@jwt_required()
def edit_comment(recipe_id, comment_id):

    user_id = get_jwt_identity()

    try:

        data = request.json

        stmt = select(Comment).where(
            Comment.recipe_id == recipe_id,
            Comment.user_id == user_id,
            Comment.id == comment_id
        )
        comment = db.session.execute(stmt).scalar_one_or_none()

        if comment is None:
            return jsonify({"error": "Comment not found"}), 404

        if "content" in data:
            comment.content = data["content"]

        db.session.commit()
        return jsonify(comment.serialize()), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# DELETE a comment
@api.route('user/recipes/<int:recipe_id>/comments/<int:comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(recipe_id, comment_id):

    user_id = get_jwt_identity()

    try:

        stmt = select(Comment).where(
            Comment.recipe_id == recipe_id,
            Comment.user_id == user_id,
            Comment.id == comment_id
        )

        comment = db.session.execute(stmt).scalar_one_or_none()

        if comment is None:
            return jsonify({"error": "Comment not found"}), 404

        db.session.delete(comment)
        db.session.commit()

        return jsonify({"message": "Comment deleted"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ===============================
# Ingredient Endpoints
# ===============================
# Only allowed for dev members, not fir users which is why we do not have frontend service file
# GET all ingredients(for test)


@api.route('/ingredients', methods=['GET'])
def get_all_ingredients():

    ingredients = Ingredient.query.all()

    return jsonify([ingredient.serialize() for ingredient in ingredients]), 200


# GET ingredient by ID(for test)
@api.route('/ingredients/<int:ingredient_id>', methods=['GET'])
def get_ingredient(ingredient_id):

    ingredient = Ingredient.query.get(ingredient_id)

    if not ingredient:
        return jsonify({"error": "Ingredient not found"}), 404

    return jsonify(ingredient.serialize()), 200

# POST new ingredient


@api.route('/user/ingredients', methods=['POST'])
@jwt_required()
def create_ingredient():

    user_id = get_jwt_identity()

    try:
        data = request.json

        stmt = select(User).where(User.id == user_id)
        user = db.session.execute(stmt).scalar_one_or_none()

        if user is None:
            return jsonify({"error": "User not found, please log in or sign up."}), 400

        if not data["name"]:
            return jsonify({"error": "Missing ingredient name."}), 400

        # Need to erase blank spaces before we send for query to avoid duplicates
        ingredient_name = data["name"].strip()

        # Need to add lower case to avoid duplicates
        stmt_ing = select(Ingredient).where(func.lower(
            Ingredient.name) == ingredient_name.lower())
        ing = db.session.execute(stmt_ing).scalar_one_or_none()

        if ing:
            return jsonify({"error": "Ingredient already on database."}), 400

        new_ingredient = Ingredient(
            name=ingredient_name
        )

        db.session.add(new_ingredient)
        db.session.commit()

        return jsonify(new_ingredient.serialize()), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# PUT to update ingredient


@api.route('/user/ingredients/<int:ingredient_id>', methods=['PUT'])
@jwt_required()
def update_ingredient(ingredient_id):

    user_id = get_jwt_identity()

    try:
        data = request.json

        stmt_user = select(User).where(User.id == user_id)
        user = db.session.execute(stmt_user).scalar_one_or_none()

        if user is None:
            return jsonify({"error": "User not found, please log in or sign up."}), 400

        if not data["name"]:
            return jsonify({"error": "Missing ingredient name."}), 400

        # Need to erase blank spaces before we send for query to avoid duplicates
        ingredient_name = data["name"].strip()

        # Need to add lower case to avoid duplicates
        # We check first if the ingredient is on database with same name but different id
        check_ing = select(Ingredient).where(
            func.lower(Ingredient.name) == ingredient_name.lower(),
            Ingredient.id != ingredient_id
        )
        similar = db.session.execute(check_ing).scalars().first()

        if similar:
            return jsonify({"error": "Another ingredient with this name already exists."}), 400

        # Query existing ingredient by ID to be updated
        stmt_ing = select(Ingredient).where(Ingredient.id == ingredient_id)
        ing = db.session.execute(stmt_ing).scalar_one_or_none()

        if not ing:
            return jsonify({"error": "Ingredient not found."}), 404

        # Edit existing ingredient
        ing.name = ingredient_name

        db.session.commit()

        return jsonify(ing.serialize()), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# DELETE an ingredient
@api.route('/user/ingredients/<int:ingredient_id>', methods=['DELETE'])
@jwt_required()
def delete_ingredient(ingredient_id):

    user_id = get_jwt_identity()

    stmt_user = select(User).where(User.id == user_id)
    user = db.session.execute(stmt_user).scalar_one_or_none()

    if user is None:
        return jsonify({"error": "User not found, please log in or sign up."}), 400

    ingredient = Ingredient.query.get(ingredient_id)

    if not ingredient:
        return jsonify({"error": "Ingredient not found"}), 404

    db.session.delete(ingredient)
    db.session.commit()

    return jsonify({"message": "Ingredient deleted"}), 200

# ========================================
# RecipeIngredient Endpoints (Join Table)
# ========================================

# GET all ingredients for a recipe (for test)


@api.route('/recipes/<int:recipe_id>/ingredients', methods=['GET'])
def get_recipe_ingredients(recipe_id):

    ingredients = RecipeIngredient.query.filter_by(recipe_id=recipe_id).all()

    return jsonify([ri.serialize() for ri in ingredients]), 200

# The GET by recipe ID method is on recipe endpoint
# The POST methos is on recipe. When we create a reipe we add the ingredients quantuty and unit
# The PUT of any ingrdient is also on recipe method when we edit
# The ingredient is deleted of the reicipe when we delete it or edit said recipe

# ========================================
# Collection Endpoints
# ========================================

# GET all saved collections for all users(for test)


@api.route('/collections', methods=['GET'])
def get_all_collections():

    collections = Collection.query.all()

    return jsonify([c.serialize() for c in collections]), 200

# GET collection of recipe of a specific user


@api.route('/user/collection', methods=['GET'])
@jwt_required()
def get_user_collections():

    user_id = get_jwt_identity()

    stmt_user = select(Collection).where(Collection.user_id == user_id)
    collection = db.session.execute(stmt_user).scalars().all()

    if user_id is None:
        return jsonify({"error": "User not found, please log in or sign up."}), 400

    # Añado este pequeño control por si no hay ninguna coleccion para el usuario dado, evitar el error.
    # return jsonify([c.serialize() for c in collection]), 200
    if collection is None:
        return '[]'
    else:
        return jsonify([c.serialize() for c in collection]), 200

# POST to save a recipe to a user's collection


@api.route('user/collection/recipes/<int:recipe_id>', methods=['POST'])
@jwt_required()
def add_to_collection(recipe_id):

    user_id = get_jwt_identity()

    try:
        stmt = select(Collection).where(
            Collection.user_id == user_id,
            Collection.recipe_id == recipe_id
        )
        collection = db.session.execute(stmt).scalar_one_or_none()

        # Check if recipe is already on the list
        if collection:
            return jsonify({"error": "Recipe already saved"}), 409

        add_recipe = Collection(
            recipe_id=recipe_id,
            user_id=user_id
        )

        db.session.add(add_recipe)
        db.session.commit()

        return jsonify(add_recipe.serialize()), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# DELETE a saved recipe from a user's collection


@api.route('user/collection/recipes/<int:recipe_id>', methods=['DELETE'])
@jwt_required()
def delete_from_collection(recipe_id):

    user_id = get_jwt_identity()

    stmt = select(Collection).where(
        Collection.user_id == user_id,
        Collection.recipe_id == recipe_id
    )
    collection = db.session.execute(stmt).scalar_one_or_none()

    if not collection:
        return jsonify({"error": "Collection not found"}), 404

    db.session.delete(collection)
    db.session.commit()

    return jsonify({"message": "Recipe removed from collection"}), 200

# ========================================
# RecipeScore Endpoints
# ========================================

# GET all saved scores(for test)


@api.route('/scores', methods=['GET'])
def get_all_scores():

    stmt = select(RecipeScore)
    scores = db.session.execute(stmt).scalars().all()

    return jsonify([c.serialize() for c in scores]), 200

# GET all saved scores for a recipe


@api.route('/recipes/<int:recipe_id>/scores', methods=['GET'])
def get_recipe_scores(recipe_id):

    ingredients = RecipeScore.query.filter_by(recipe_id=recipe_id).all()

    return jsonify([score.serialize() for score in ingredients]), 200

# We do not need to set for recipe as it's serrialized so it will be shown on recipe endpoint

# POST score on recipe


@api.route('/user/recipes/<int:recipe_id>/score', methods=['POST'])
@jwt_required()
def add_score(recipe_id):

    user_id = get_jwt_identity()

    try:

        stmt = select(RecipeScore).where(
            RecipeScore.user_id == user_id,
            RecipeScore.recipe_id == recipe_id
        )
        liked = db.session.execute(stmt).scalar_one_or_none()

        # Check if recipe is already on the list. If liked it will delete the like (decrease -1)
        if liked:
            db.session.delete(liked)
            db.session.commit()
            return jsonify({"message": "Like removed", "liked": False}), 200

        # Add it and sum +1 if not liked
        else:
            new_like = RecipeScore(
                user_id=user_id,
                recipe_id=recipe_id,
                score=1
            )

            db.session.add(new_like)
            db.session.commit()
            return jsonify({"message": "Like added", "liked": True}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# No need for delete as on POST we already delete the like if it exists

# ====================================
# Shopping List Endpoints
# ====================================

# GET list from authenticated user


@api.route('/user/shopping-list', methods=['GET'])
@jwt_required()
def get_shopping_list():
    user_id = get_jwt_identity()

    items = db.session.query(ShoppingListItem).filter_by(user_id=user_id).all()
    return jsonify([item.serialize() for item in items]), 200


# POST: add recipes to shopping list
@api.route('/user/shopping-list', methods=['POST'])
@jwt_required()
def add_to_shopping_list():
    user_id = get_jwt_identity()
    data = request.get_json()
    recipe_ids = data.get("recipe_ids", [])

    if not recipe_ids:
        return jsonify({"error": "Please provide at least one recipe ID"}), 400

    try:
        updated_list = add_recipes_to_shopping_list(recipe_ids, user_id)
        return jsonify(updated_list), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# DELETE ingredient from the list by ID
@api.route('/user/shopping-list/<int:item_id>', methods=['DELETE'])
@jwt_required()
def delete_shopping_item(item_id):
    user_id = get_jwt_identity()

    stmt = select(ShoppingListItem).where(ShoppingListItem.id ==
                                          item_id, ShoppingListItem.user_id == user_id)
    item = db.session.execute(stmt).scalar_one_or_none()

    if not item:
        return jsonify({"error": "Item not found or not owned by user"}), 404

    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Item deleted"}), 200


# DELETE all list from user
@api.route('/user/shopping-list', methods=['DELETE'])
@jwt_required()
def clear_shopping_list():
    user_id = get_jwt_identity()

    deleted = db.session.query(ShoppingListItem).filter_by(
        user_id=user_id).delete()
    db.session.commit()
    return jsonify({"message": f"{deleted} items deleted from shopping list"}), 200
