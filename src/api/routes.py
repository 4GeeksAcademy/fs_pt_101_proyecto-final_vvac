"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Recipe, Ingredient, Comment, Media, UserStatus, Collection, RecipeIngredient, DifficultyType
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from sqlalchemy import select, delete
from datetime import datetime, timezone
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from werkzeug.security import generate_password_hash, check_password_hash

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)


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
        
        #Check if user is registered
        stm = select(User).where(User.email==data["email"])
        user = db.session.execute(stm).scalar_one_or_none()

        if user:
            return jsonify({"error": "This email is already registered, please log in"}), 409
        
        #hash password to not show to others
        hashed_password = generate_password_hash(data["password"])

        new_user = User(
            username=data["username"],
            email=data["email"],
            password=hashed_password,
            status= UserStatus.active, #Default status
            created_at=datetime.now(timezone.utc),
            #we will update this field on PUT method, created_at remains the same
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
        
        #Check if the user has an account
        email = data["email"].strip().lower()
        stmt = select(User).where(User.email==email)
        user = db.session.execute(stmt).scalar_one_or_none()

        if user is None:
            return jsonify({"error": "User not found, please sign up"}), 405
        
        #Check if the password matches the user
        if not user or not check_password_hash(user.password, data["password"]):
            return jsonify({"error": "Email or password not valid"}), 401

       #Generate str token as it's not possible to be a number
        token = create_access_token(identity=str(user.id))
  
        return jsonify({"success": True, "token": token}), 200
    
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500


# GET to access the profile after logging in
@api.route('/user', methods=['GET'])
@jwt_required() # Requires to request the token from the frontend
def get_user_profile():

    id = get_jwt_identity()
    stm = select(User).where(User.id == id)
    user = db.session.execute(stm).scalar_one_or_none()
    
    if not user:
        return jsonify({"success": False, 'msg': 'Something went wrong, try again.'})

    return jsonify({"success": True, 'user':user.serialize()})

#DELETE user account (we keep recipes posted and soft delete the user personal data and comments)
@api.route("/user", methods=["DELETE"])
@jwt_required()
def delete_user():

    user_id = get_jwt_identity()

    stmt = select(User).where(User.id == user_id)
    user = db.session.execute(stmt).scalar_one_or_none()
    if user is None:
        return jsonify({"error": "User not found"}), 404

    # Anonymize personal data but keep the recipes on the dabase.
    user.username = f"deleted_user_{user_id}"  #set username place holder
    user.email =  f"deleted_user_{user_id}@example.com" # set email place holder
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

@api.route("/user/<int:user_id>", methods=["PUT"])
def update_user(user_id):

    user_id = get_jwt_identity()
    data = data = request.json

    stmt = select(User).where(User.id == user_id)
    user = db.session.execute(stmt).scalar_one_or_none()

    if user is None:
        return jsonify({"error": "User not found"}), 404
   
   # The update does not requiere to add all fields on the body, just what you need to change
   # Sistem will not allow same email or username
    user.email = data["email"]
    user.password = generate_password_hash(data["password"])
    user.username = data["username"]
    user.updated_at = datetime.now(timezone.utc)
    
    db.session.commit()
    return jsonify(user.serialize()), 200

#End of user endpoints

#From here all recipe related endpoints
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
@api.route('user/recipes', methods=['GET'])
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
@api.route('user/recipes/<int:recipe_id>', methods=['GET'])
@jwt_required() 
def get_user_recipe(recipe_id):

    user_id = get_jwt_identity()

    stmt = select(Recipe).where(Recipe.id == recipe_id, Recipe.author == user_id)
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
        
        if not data["steps"]:
            return jsonify({"error": "Please add all the steps and instructions needed to your recipe"}), 400

        if not data["ingredient"]:
            return jsonify({"error": "Please add all the igredients details to your recipe"}), 400

        #Conditions to turn the string value into the enum value in our database
        if data["difficulty_type"] == "Easy":
            setLevel = DifficultyType.EASY

        elif data["difficulty_type"] == "Moderate":
            setLevel = DifficultyType.MODERATE
            
        elif data["difficulty_type"] == "Hard":
            setLevel = DifficultyType.HARD

        else:
            return jsonify({"error": "Please choose from one of these options for difficulty level: Easy, Moderate or Hard."}), 400
        
        #We add on frontend the control of blank space and lower cases
        new_recipe = Recipe(
            title=data["title"],
            author=user_id,
            difficulty_type=setLevel,
            steps=data["steps"],
            published=datetime.now(timezone.utc)
        )
        db.session.add(new_recipe)
        db.session.flush()
    
        #Add ingredients to the recipe
        for ing in data["ingredient"]:
                name = ing["name"]
                quantity = ing["quantity"]
                unit = ing["unit"]

        stmt = select(Ingredient).where(Ingredient.name == name)
        ingredient = db.session.execute(stmt).scalar_one_or_none()

        #We add ingredient to database if it does not exist
        if ingredient is None:
            ingredient = Ingredient(name=name)
            db.session.add(ingredient)
            db.session.flush()

        recipe_ing = RecipeIngredient(
                recipe_id=new_recipe.id,
                ingredient_id=ingredient.id,
                quantity=quantity,
                unit=unit
            )
            
        db.session.add(recipe_ing)

        db.session.commit()

        return jsonify({"success": True}), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# PUT a specific recipe created by the user(need to log in)
@api.route('user/recipes/<int:recipe_id>', methods=['PUT'])
@jwt_required()
def edit_recipe(recipe_id):

    user_id = get_jwt_identity()

    stmt = select(Recipe).where(Recipe.id == recipe_id, Recipe.author == user_id)
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

        #Conditions to turn the string value into the enum value in our database
        if data["difficulty_type"] == "Easy":
            setLevel = DifficultyType.EASY

        elif data["difficulty_type"] == "Moderate":
            setLevel = DifficultyType.MODERATE
            
        elif data["difficulty_type"] == "Hard":
            setLevel = DifficultyType.HARD

        else:
            return jsonify({"error": "Please choose from one of these options for difficulty level: Easy, Moderate or Hard."}), 400
        
        #We add on frontend the control of blank space and lower cases
        recipe.title = data["title"]
        recipe.author = user_id
        recipe.difficulty_type = setLevel
        recipe.steps = data["steps"]
        recipe.published = datetime.now(timezone.utc)
        db.session.flush()

        #We delete all the ingredients associted to recipe before adding the new ones
        delete_stmt = delete(RecipeIngredient).where(RecipeIngredient.recipe_id == recipe_id)
        db.session.execute(delete_stmt)
        db.session.flush()
    
        #Add ingredients to the recipe
        for ing in data["ingredient"]:
            name = ing["name"]
            quantity = ing["quantity"]
            unit = ing["unit"]

        stmt = select(Ingredient).where(Ingredient.name == name)
        ingredient = db.session.execute(stmt).scalar_one_or_none()

        #We add ingredient to database if it does not exist
        if ingredient is None:
            ingredient = Ingredient(name=name)
            db.session.add(ingredient)
            db.session.flush()

        recipe_ing = RecipeIngredient(
            recipe_id=recipe.id,
            ingredient_id=ingredient.id,
            quantity=quantity,
            unit=unit
        )
            
        db.session.add(recipe_ing)

        db.session.commit()

        return jsonify({"success": True}), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
#DELETE recipe created by user
@api.route("/user/recipes/<int:recipe_id>", methods=["DELETE"])
@jwt_required()
def delete_one_recipe(recipe_id):

    user_id = get_jwt_identity()

    stmt = select(Recipe).where(Recipe.id == recipe_id, Recipe.author == user_id)
    recipe = db.session.execute(stmt).scalar_one_or_none()

    if recipe is None:
        return jsonify({"error": "Recipe not found"}), 404

    #Delete recipe from asociation table
    delete_recipe_ingredients = delete(RecipeIngredient).where(RecipeIngredient.recipe_id == recipe_id)
    db.session.execute(delete_recipe_ingredients)

    # Delete the recipe itself
    delete_recipe = delete(Recipe).where(Recipe.id == recipe_id)
    db.session.execute(delete_recipe)
    
    db.session.commit()

    return jsonify({"message": "Recipe has been deleted successfully"}), 200

#Recipe endpoints end here

# =================================================================
# Comment endpoints
# =================================================================

# GET all comments(for test)
@api.route('/comments', methods=['GET'])
def get_all_comments():
    comments = Comment.query.all()
    return jsonify([comment.serialize() for comment in comments]), 200

# GET comment by ID(for test)
@api.route('users/<int:user_id>/comments/<int:comment_id>', methods=['GET'])
def get_comments(comment_id):
    comment = Comment.query.get(comment_id)
    if comment is None:
        return jsonify({"error": "Comment not found"}), 404
    return jsonify(comment.serialize()), 200

# GET all comments by recipe ID (to load on page after we open a recipe)
@api.route('/recipes/<int:recipe_id>/comments', methods=['GET'])
def get_comments_by_recipe(recipe_id):
    stmt = select(Comment).where(Comment.recipe_id == recipe_id)
    comments = db.session.execute(stmt).scalars().all()

    return jsonify({
        "success": True,
        "comments": [comment.serialize() for comment in comments]
    }), 200



# POST new comment
@api.route('/recipes/<int:recipe_id>/comments', methods=['POST'])
@jwt_required()
def create_comment(recipe_id):
    user_id = get_jwt_identity()

    data = request.get_json()

    # Check if comment content is provided
    if "content" not in data:
        return jsonify({"error": "Missing content"}), 400

    # Check if the recipe exists
    recipe_stmt = select(Recipe).where(Recipe.id == recipe_id)
    recipe = db.session.execute(recipe_stmt).scalar_one_or_none()
    if not recipe:
        return jsonify({"error": "Recipe not found"}), 404

    # Optional: check if the user exists
    user_stmt = select(User).where(User.id == user_id)
    user = db.session.execute(user_stmt).scalar_one_or_none()
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Create and save the new comment
    new_comment = Comment(
        user_id=user_id,
        recipe_id=recipe_id,
        content=data["content"]
    )

    db.session.add(new_comment)
    db.session.commit()

    return jsonify(new_comment.serialize()), 201


#PUT to update comment
##Editar endpoint para incluir user_id, recipe_id y comment_id
@api.route('users/<int:user_id>/recipes/<int:recipe_id>/comments/<int:comment_id>', methods=['PUT'])
def update_comment(comment_id):
    comment = Comment.query.get(comment_id)
    if comment is None:
        return jsonify({"error": "Comment not found"}), 404

    data = request.get_json()
    if "content" in data:
        comment.content = data["content"]

    db.session.commit()
    return jsonify(comment.serialize()), 200


#DELETE a comment
##Editar endpoint para incluir user_id, recipe_id y comment_id
@api.route('users/<int:user_id>/recipes/<int:recipe_id>/comments/<int:comment_id>', methods=['DELETE'])
def delete_comment(comment_id):
    comment = Comment.query.get(comment_id)
    if comment is None:
        return jsonify({"error": "Comment not found"}), 404

    db.session.delete(comment)
    db.session.commit()
    return jsonify({"message": "Comment deleted"}), 200

# ===============================
# Ingredient Endpoints
# ===============================

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
@api.route('/ingredients', methods=['POST'])
def create_ingredient():
    data = request.get_json()

    # Validate required fields
    if not all(k in data for k in ("name")):
        return jsonify({"error": "Missing data"}), 400

    new_ingredient = Ingredient(
        name=data["name"],
         ##Sacar unit y quantity porque no es necesario y van en tabla de asociación
        quantity=data["quantity"],
        unit=data["unit"]
    )

    db.session.add(new_ingredient)
    db.session.commit()
    return jsonify(new_ingredient.serialize()), 201


# PUT to update ingredient
@api.route('/ingredients/<int:ingredient_id>', methods=['PUT'])
def update_ingredient(ingredient_id):
    ingredient = Ingredient.query.get(ingredient_id)
    if not ingredient:
        return jsonify({"error": "Ingredient not found"}), 404

    data = request.get_json()
    ingredient.name = data.get("name", ingredient.name)
    ##Sacar unit y quantity porque no es necesario y van en tabla de asociación
    ingredient.quantity = data.get("quantity", ingredient.quantity)
    ingredient.unit = data.get("unit", ingredient.unit)

    db.session.commit()
    return jsonify(ingredient.serialize()), 200


# DELETE an ingredient
@api.route('/ingredients/<int:ingredient_id>', methods=['DELETE'])
def delete_ingredient(ingredient_id):
    ingredient = Ingredient.query.get(ingredient_id)
    if not ingredient:
        return jsonify({"error": "Ingredient not found"}), 404

    db.session.delete(ingredient)
    db.session.commit()
    return jsonify({"message": "Ingredient deleted"}), 200

# ========================================
# RecipeIngredient Endpoints (Join Table)
# ========================================

## Podemos borrar esta tabla y dejar GET para hacer test debido a que recipe endpoint ya hace el post si es necesario
# GET all ingredients for a recipe (for test)
@api.route('/recipes/<int:recipe_id>/ingredients', methods=['GET'])
def get_recipe_ingredients(recipe_id):
    ingredients = RecipeIngredient.query.filter_by(recipe_id=recipe_id).all()
    return jsonify([ri.serialize() for ri in ingredients]), 200

# POST to add a new ingredient to a recipe
@api.route('/recipes/<int:recipe_id>/ingredients', methods=['POST'])
def add_ingredient_to_recipe(recipe_id):
    data = request.get_json()

    # Check for required fields
    if not all(k in data for k in ("ingredient_id", "quantity", "unit")):
        return jsonify({"error": "Missing data"}), 400

    new_link = RecipeIngredient(
        recipe_id=recipe_id,
        ingredient_id=data["ingredient_id"],
        quantity=data["quantity"],
        unit=data["unit"]
    )

    db.session.add(new_link)
    db.session.commit()
    return jsonify(new_link.serialize()), 201

# PUT to update quantity/unit for a recipe's ingredient
@api.route('/recipes/<int:recipe_id>/ingredients/<int:ingredient_id>', methods=['PUT'])
def update_recipe_ingredient(recipe_id, ingredient_id):
    ri = RecipeIngredient.query.get((recipe_id, ingredient_id))
    if not ri:
        return jsonify({"error": "Ingredient not found in recipe"}), 404

    data = request.get_json()
    ri.quantity = data.get("quantity", ri.quantity)
    ri.unit = data.get("unit", ri.unit)

    db.session.commit()
    return jsonify(ri.serialize()), 200


# DELETE an ingredient from a specific recipe
@api.route('/recipes/<int:recipe_id>/ingredients/<int:ingredient_id>', methods=['DELETE'])
def delete_recipe_ingredient(recipe_id, ingredient_id):
    ri = RecipeIngredient.query.get((recipe_id, ingredient_id))
    if not ri:
        return jsonify({"error": "Ingredient not found in recipe"}), 404

    db.session.delete(ri)
    db.session.commit()
    return jsonify({"message": "Ingredient removed from recipe"}), 200

# ========================================
# Collection Endpoints
# ========================================

# GET all saved collections for all users(for test)
@api.route('/collections', methods=['GET'])
def get_all_collections():
    collections = Collection.query.all()
    return jsonify([c.serialize() for c in collections]), 200


# GET collection of recipe of a specific user
@api.route('users/<int:user_id>/collections', methods=['GET'])
def get_user_collections(user_id):
    collections = Collection.query.filter_by(user_id=user_id).all()
    return jsonify([c.serialize() for c in collections]), 200


# POST to save a recipe to a user's collection
@api.route('users/<int:user_id>/collections', methods=['POST'])
def add_to_collection():
    data = request.get_json()

    if not all(k in data for k in ("user_id", "recipe_id")):
        return jsonify({"error": "Missing user_id or recipe_id"}), 400

    # Prevent duplicates
    exists = Collection.query.get((data["recipe_id"], data["user_id"]))
    if exists:
        return jsonify({"error": "Recipe already saved"}), 409

    new_entry = Collection(
        recipe_id=data["recipe_id"],
        user_id=data["user_id"]
    )

    db.session.add(new_entry)
    db.session.commit()
    return jsonify(new_entry.serialize()), 201


# PUT – Usually unnecessary for pure many-to-many, but provided here for consistency
# (to "transfer" a saved recipe from one user to another — rare use case)
## Sacarlo porque solo se añade o se quita de la colección
@api.route('/collections/<int:recipe_id>/<int:user_id>', methods=['PUT'])
def update_collection(recipe_id, user_id):
    collection = Collection.query.get((recipe_id, user_id))
    if not collection:
        return jsonify({"error": "Collection not found"}), 404

    data = request.get_json()
    new_user_id = data.get("user_id")
    new_recipe_id = data.get("recipe_id")

    if new_user_id and new_recipe_id:
        # Delete the old entry and create a new one
        db.session.delete(collection)
        new_collection = Collection(
            recipe_id=new_recipe_id,
            user_id=new_user_id
        )
        db.session.add(new_collection)
        db.session.commit()
        return jsonify(new_collection.serialize()), 200
    else:
        return jsonify({"error": "Missing new user_id or recipe_id"}), 400


# DELETE a saved recipe from a user's collection
@api.route('users/<int:user_id>/collections/<int:recipe_id>', methods=['DELETE'])
def delete_from_collection(recipe_id, user_id):
    collection = Collection.query.get((recipe_id, user_id))
    if not collection:
        return jsonify({"error": "Collection not found"}), 404

    db.session.delete(collection)
    db.session.commit()
    return jsonify({"message": "Recipe removed from collection"}), 200


# ========================
# Media Endpoints
# ========================

# GET all media items
@api.route('/media', methods=['GET'])
def get_all_media():
    media_items = Media.query.all()
    return jsonify([m.serialize() for m in media_items]), 200


# GET media by ID
@api.route('/media/<int:media_id>', methods=['GET'])
def get_media_by_id(media_id):
    media = Media.query.get(media_id)
    if not media:
        return jsonify({"error": "Media not found"}), 404
    return jsonify(media.serialize()), 200


# POST new media item
@api.route('/media', methods=['POST'])
def create_media():
    data = request.get_json()

    # Ensure required fields are present
    if not all(k in data for k in ("recipe_id", "type", "url")):
        return jsonify({"error": "Missing data"}), 400

    try:
        media_type = MediaType(data["type"])
    except ValueError:
        return jsonify({"error": "Invalid media type"}), 400

    new_media = Media(
        recipe_id=data["recipe_id"],
        type_media=media_type,
        url=data["url"]
    )

    db.session.add(new_media)
    db.session.commit()
    return jsonify(new_media.serialize()), 201


# PUT to update an existing media item
@api.route('/media/<int:media_id>', methods=['PUT'])
def update_media(media_id):
    media = Media.query.get(media_id)
    if not media:
        return jsonify({"error": "Media not found"}), 404

    data = request.get_json()

    # Optional fields
    if "url" in data:
        media.url = data["url"]
    if "type" in data:
        try:
            media.type_media = MediaType(data["type"])
        except ValueError:
            return jsonify({"error": "Invalid media type"}), 400

    db.session.commit()
    return jsonify(media.serialize()), 200


# DELETE a media item
@api.route('/media/<int:media_id>', methods=['DELETE'])
def delete_media(media_id):
    media = Media.query.get(media_id)
    if not media:
        return jsonify({"error": "Media not found"}), 404

    db.session.delete(media)
    db.session.commit()
    return jsonify({"message": "Media deleted"}), 200
