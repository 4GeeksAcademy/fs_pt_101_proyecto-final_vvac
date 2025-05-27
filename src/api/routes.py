"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Recipe, Ingredient, Comment, Media, UserStatus, Collection
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
        stmt = select(User).where(User.email==data["email"])
        user = db.session.execute(stmt).scalar_one_or_none()

        if user is None:
            return jsonify({"error": "User not found, please sign up"}), 405
        
        #Check if the password matches the user
        if not check_password_hash(user.password, data["password"]):
            return jsonify({"error": "Email or password not valid"}), 401

       #Generate str token as it's not possible to be a number
        token = create_access_token(identity=str(user.id))
  

        return jsonify({"success": True, "token": token}), 200
    
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500


# GET to access the profile after logging in
@api.route('/user', methods=['GET'])
@jwt_required() # Obliga a enviar el token desde el front
def get_user_profile():

    id = get_jwt_identity()
    stm = select(User).where(User.id == id)
    user = db.session.execute(stm).scalar_one_or_none()
    
    if not user:
        return jsonify({"success": False, 'msg': 'Something went wrong, try again.'})

    return jsonify({"success": True, 'user':user.serialize()})

#DELETE user account (we keep recipes posted and soft delete the user personal data and comments)
@api.route("/user/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    stmt = select(User).where(User.id == user_id)
    user = db.session.execute(stmt).scalar_one_or_none()
    if user is None:
        return jsonify({"error": "User not found"}), 404

    # Anonymize personal data but keep the recipes on the dabase.
    user.username = f"deleted_user_{user_id}"  #set username place holder
    user.email =  f"deleted_user_{user_id}@example.com" # set email place holder
    user.password = generate_password_hash("User{user_id}NoLongerExists")
    user.status = UserStatus.deleted  # Mark as deleted status
    user.updated_at = datetime.now(timezone.utc)

    # We also delete the comments and fav list.
    delete_comment = delete(Comment).where(Comment.user_id == user_id)
    delete_collection = delete(Collection).where(Collection.user_id == user_id)
    db.session.execute(delete_comment, delete_collection)

    db.session.commit()

    return jsonify({"message": "You account has been successfully erased"}), 200

@api.route("/user/<int:user_id>", methods=["PUT"])
def update_user(user_id):

    data = request.get_json()

    stmt = select(User).where(User.id == user_id)
    user = db.session.execute(stmt).scalar_one_or_none()

    if user is None:
        return jsonify({"error": "User not found"}), 404
   
   # The update does not requiere to add all fields on the body, just what you need to change
   # Sistem will not allow same email or username
    user.email = data.get("email", user.email)
    user.password = data.get("password", user.password)
    user.username = data.get("username", user.username)
    user.updated_at = datetime.now(timezone.utc)
    
    db.session.commit()
    return jsonify(user.serialize()), 200

#End of user endpoints

#From here all recipe related endpoints




# =================================================================
# Comment endpoints
# =================================================================

# GET all comments

@api.route('/comments', methods=['GET'])
def get_all_comments():
    comments = Comment.query.all()
    return jsonify([comment.serialize() for comment in comments]), 200

# GET comment by ID

@api.route('/comments/<int:comment_id>', methods=['GET'])
def get_comment(comment_id):
    comment = Comment.query.get(comment_id)
    if comment is None:
        return jsonify({"error": "Comment not found"}), 404
    return jsonify(comment.serialize()), 200


#POST new comment

@api.route('/comments', methods=['POST'])
def create_comment():
    data = request.get_json()

    if not all(key in data for key in ("user_id", "recipe_id", "content")):
        return jsonify({"error": "Missing data"}), 400

    new_comment = Comment(
        user_id=data["user_id"],
        recipe_id=data["recipe_id"],
        content=data["content"]
    )

    db.session.add(new_comment)
    db.session.commit()

    return jsonify(new_comment.serialize()), 201

#PUT to update comment

@api.route('/comments/<int:comment_id>', methods=['PUT'])
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

@api.route('/comments/<int:comment_id>', methods=['DELETE'])
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

# GET all ingredients
@api.route('/ingredients', methods=['GET'])
def get_all_ingredients():
    ingredients = Ingredient.query.all()
    return jsonify([ingredient.serialize() for ingredient in ingredients]), 200


# GET ingredient by ID
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
    if not all(k in data for k in ("name", "quantity", "unit")):
        return jsonify({"error": "Missing data"}), 400

    new_ingredient = Ingredient(
        name=data["name"],
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

# GET all ingredients for a recipe
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

# GET all saved collections for all users
@api.route('/collections', methods=['GET'])
def get_all_collections():
    collections = Collection.query.all()
    return jsonify([c.serialize() for c in collections]), 200


# GET all recipes saved by a user
@api.route('/users/<int:user_id>/collections', methods=['GET'])
def get_user_collections(user_id):
    collections = Collection.query.filter_by(user_id=user_id).all()
    return jsonify([c.serialize() for c in collections]), 200


# POST to save a recipe to a user's collection
@api.route('/collections', methods=['POST'])
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
@api.route('/collections/<int:recipe_id>/<int:user_id>', methods=['DELETE'])
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
