from werkzeug.security import generate_password_hash
from random import randint, choice, uniform
from api.models import User, Recipe, Ingredient, RecipeIngredient, Comment, Media, Collection, RecipeScore, ShoppingListItem, UserStatus, DifficultyType, MediaType
from app import app, db
import os
from dotenv import load_dotenv
load_dotenv()


with app.app_context():
    db.drop_all()
    db.create_all()

    # Crear 3 usuarios
    users = [
        User(username="user4", email="alice@gmail.com", password=generate_password_hash('12345678'), status=UserStatus.active),
        User(username="user1", email="user1@mail.com", password=generate_password_hash('user123'), status=UserStatus.active),
        User(username="user2", email="user2@mail.com", password=generate_password_hash('user123'), status=UserStatus.active),
        User(username="user3", email="user3@mail.com", password=generate_password_hash('user123'), status=UserStatus.active)
    ]
    db.session.add_all(users)
    db.session.commit()

    # Crear 10 ingredientes
    ingredient_names = [
        "Harina", "Leche", "Huevo", "Azúcar", "Sal", "Aceite", "Tomate", "Queso", "Pollo", "Cebolla"
    ]
    allergens_list = ["gluten", "lactosa",
                      "", "", "", "", "", "lactosa", "", ""]
    ingredients = [
        Ingredient(name=ingredient_names[i], allergens=allergens_list[i])
        for i in range(10)
    ]
    db.session.add_all(ingredients)
    db.session.commit()

    # Crear 10 recetas
    recipes = []
    for i in range(10):
        recipe = Recipe(
            author=choice(users).id,
            title=f"Receta {i+1}",
            difficulty_type=choice(list(DifficultyType)),
            portions=randint(1, 6),
            prep_time=randint(10, 60),
            steps=f"Paso 1 de la receta {i+1}. Paso 2 de la receta {i+1}."
        )
        recipes.append(recipe)
    db.session.add_all(recipes)
    db.session.commit()

    # Crear 10 RecipeIngredient por receta (100 en total)
    recipe_ingredients = []
    for recipe in recipes:
        used_ingredients = set()
        for _ in range(10):
            ing = choice(ingredients)
            # Evitar ingredientes repetidos en la misma receta
            while ing.id in used_ingredients:
                ing = choice(ingredients)
            used_ingredients.add(ing.id)
            ri = RecipeIngredient(
                recipe_id=recipe.id,
                ingredient_id=ing.id,
                quantity=round(uniform(10, 500), 2),
                unit="g",
                calories=round(uniform(10, 300), 2),
                fat=round(uniform(0, 20), 2),
                saturated_fat=round(uniform(0, 10), 2),
                carbs=round(uniform(0, 50), 2),
                sugars=round(uniform(0, 20), 2),
                fiber=round(uniform(0, 10), 2),
                protein=round(uniform(0, 30), 2),
                salt=round(uniform(0, 5), 2),
                sodium=round(uniform(0, 2), 2)
            )
            recipe_ingredients.append(ri)
    db.session.add_all(recipe_ingredients)
    db.session.commit()

    # Crear 10 medios
    medias = [
        Media(
            recipe_id=recipes[i].id,
            type_media=MediaType.IMAGE,
            url=f"https://example.com/receta_{i+1}.jpg"
        ) for i in range(10)
    ]
    db.session.add_all(medias)
    db.session.commit()

    # Crear 10 comentarios
    comments = [
        Comment(
            user_id=choice(users).id,
            recipe_id=recipes[i].id,
            content=f"Comentario {i+1} sobre la receta {i+1}"
        ) for i in range(10)
    ]
    db.session.add_all(comments)
    db.session.commit()

    # Crear 10 puntuaciones
    scores = [
        RecipeScore(
            user_id=choice(users).id,
            recipe_id=recipes[i].id,
            score=randint(1, 5)
        ) for i in range(10)
    ]
    db.session.add_all(scores)
    db.session.commit()

    # Crear 10 colecciones
    collections = [
        Collection(
            user_id=choice(users).id,
            recipe_id=recipes[i].id
        ) for i in range(10)
    ]
    db.session.add_all(collections)
    db.session.commit()

    # Crear 10 items de lista de compras
    shopping_items = [
        ShoppingListItem(
            user_id=choice(users).id,
            ingredient_name=choice(ingredient_names),
            total_quantity=round(uniform(100, 1000), 2),
            unit="g"
        ) for _ in range(10)
    ]
    db.session.add_all(shopping_items)
    db.session.commit()

    print("Seed ejecutado correctamente.")
