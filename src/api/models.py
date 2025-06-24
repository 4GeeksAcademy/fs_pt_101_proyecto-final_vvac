from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, Enum, DateTime, func, ForeignKey, Text, Float, Integer, Date, text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone
import enum

db = SQLAlchemy()

class UserStatus(enum.Enum): 
    active = "active"
    suspended = "suspended"
    deleted = "deleted"

class User(db.Model):
    __tablename__ = 'users'

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    photo_url: Mapped[str] = mapped_column(String, nullable=True)
    password: Mapped[str] = mapped_column(nullable=False)  # guarda como texto plano hasta que se hashee
    status: Mapped[UserStatus] = mapped_column(Enum(UserStatus), default=UserStatus.active, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    #Relatioship with other tables
    score: Mapped[list["RecipeScore"]] = relationship(back_populates="user")
    comments: Mapped[list["Comment"]] = relationship(back_populates="user")
    collection: Mapped[list["Collection"]] = relationship(back_populates="user")
    recipes: Mapped[list["Recipe"]] = relationship(back_populates="user")
    shopping_list: Mapped[list["ShoppingListItem"]] = relationship(back_populates="user")
    meal_plan: Mapped[list["MealPlanEntry"]] = relationship(back_populates="user")


    def serialize(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "photo_url": self.photo_url,
            "status": self.status.value,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            # No se serializa la contraseña
        }
    
class Comment(db.Model):
    __tablename__ = 'comments'

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'), nullable=False)
    recipe_id: Mapped[int] = mapped_column(ForeignKey('recipes.id'), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    published: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    #Relatioship with other tables
    user: Mapped["User"] = relationship(back_populates="comments")
    recipe: Mapped["Recipe"] = relationship(back_populates="comments")

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "recipe_id": self.recipe_id,
            "username": self.user.username,
            "user_photo": self.user.photo_url,
            "content": self.content,
            "timestamp": self.published.isoformat() if self.published else None
        }

class DifficultyType(enum.Enum):
    # Requires little to basic cooking skills and common ingredients.
    EASY = "Easy"
    # Requires more experience, more prep and cooking time.
    # Maybe some ingredients you don’t already have in your kitchen.
    MODERATE = "Moderate"
    # Challenging recipes that require more advanced skills, experience and maybe some special equipment.
    HARD = "Hard"
    
class Recipe(db.Model):
    __tablename__='recipes'

    id: Mapped[int] = mapped_column(primary_key=True)
    author: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    difficulty_type: Mapped[DifficultyType] = mapped_column(Enum(DifficultyType), nullable=False)
    portions: Mapped[int] = mapped_column(nullable=False, default=1)
    total_grams: Mapped[float] = mapped_column(Float, nullable=True)
    prep_time: Mapped[int] = mapped_column(nullable=True) #In minutes(covertion made at the frontend)
    steps: Mapped[str] = mapped_column(Text, nullable=False)
    published: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    #API Gemini call
    diet_label: Mapped[str] = mapped_column(String, nullable=True)

    #Relatioship with other tables
    user: Mapped["User"] = relationship(back_populates="recipes")
    media: Mapped[list["Media"]] = relationship(back_populates="recipe")
    score: Mapped[list["RecipeScore"]] = relationship(back_populates="recipe")
    ingredients: Mapped[list["RecipeIngredient"]] = relationship(back_populates="recipe") #cambio de ingredient a ingredients por reutilizacion en distintas recetas
    comments: Mapped[list["Comment"]] = relationship(back_populates="recipe")
    collection: Mapped[list["Collection"]] = relationship(back_populates="recipe")
    meal_plan_entries: Mapped[list["MealPlanEntry"]] = relationship(back_populates="recipe")

    def serialize(self):

        allergens = set()
        for recipe_ing in self.ingredients:
            if recipe_ing.ingredient.allergens:
                for allergen in recipe_ing.ingredient.allergens.split(","):
                    allergens.add(allergen.strip())

        return {
            "id": self.id,
            "title": self.title,
            "author": self.author,
            "username": self.user.username,
            "user_photo": self.user.photo_url,
            "media": [media.serialize() for media in self.media],
            "published": self.published.isoformat() if self.published else None,
            "difficulty_type": self.difficulty_type.value,
            "diet_label": self.diet_label,
            "portions": self.portions,
            "total_grams":self.total_grams,
            "prep_time": self.prep_time,
            "allergens": list(allergens),
            "ingredients": [recipe_ing.serialize() for recipe_ing in self.ingredients],
            "steps": self.steps,
            "comments": [comment.serialize() for comment in self.comments]
        }
    
class RecipeScore(db.Model):
    __tablename__='recipe_scores'

    user_id: Mapped["User"] = mapped_column(ForeignKey("users.id"), primary_key=True)
    recipe_id: Mapped["Recipe"] = mapped_column(ForeignKey("recipes.id"), primary_key=True)
    score: Mapped[int] = mapped_column(nullable=True) #On frontend we make the calculation for final score
    
    #Relatioship with other tables
    user: Mapped["User"] = relationship(back_populates="score")
    recipe: Mapped["Recipe"] = relationship(back_populates="score")

    def serialize(self):
        return {
            "user_id": self.user_id,
            "recipe_id": self.recipe_id,
            "score": self.score
        } 
    
class MediaType(enum.Enum):
    IMAGE = "image"

class Media(db.Model):
    __tablename__='medias'

    id: Mapped[int] = mapped_column(primary_key=True)
    recipe_id: Mapped[int] = mapped_column(ForeignKey("recipes.id"))
    type_media: Mapped[MediaType] = mapped_column(Enum(MediaType), nullable=False)
    url: Mapped[str] = mapped_column(Text, nullable=False)

    #Relatioship with other tables
    recipe: Mapped["Recipe"] = relationship(back_populates="media")
    
    def serialize(self):
        return {
            "id": self.id,
            "recipe_id":self.recipe_id,
            "type_media": self.type_media.value,
            "url": self.url
        }
    
class Collection(db.Model):
    __tablename__ = 'collections'

    recipe_id: Mapped["Recipe"] = mapped_column(ForeignKey("recipes.id"), primary_key=True)
    user_id: Mapped["User"] = mapped_column(ForeignKey("users.id"), primary_key=True)

    #Relatioship with other tables
    user: Mapped["User"] = relationship(back_populates="collection")
    recipe: Mapped["Recipe"] = relationship(back_populates="collection")

    def serialize(self):
        return {
            "recipe_id": self.recipe_id,
            "user_id": self.user_id,
            "username": self.user.username,
            "recipe_media": [media.serialize() for media in self.recipe.media],
            "recipe_title": self.recipe.title,
            "recipe_difficultty": self.recipe.difficulty_type.value,
            "prep_time": self.recipe.prep_time,
        }

class Ingredient(db.Model):
    __tablename__='ingredients'

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)

    #This is to store the allergens of each ingredient
    allergens: Mapped[str] = mapped_column(Text, nullable=True, default="")

    #Relatioship with other tables
    recipes: Mapped[list["RecipeIngredient"]] = relationship(back_populates="ingredient") #cambio recipe_ingredient por recipes para reutilizacion de ingredientes

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "allergens": self.allergens.split(",") if self.allergens else []
        } 
    
class RecipeIngredient(db.Model):
    __tablename__ = 'recipe_ingredients'

    recipe_id: Mapped[Recipe] = mapped_column(ForeignKey("recipes.id"), primary_key=True)
    ingredient_id: Mapped[Ingredient] = mapped_column(ForeignKey("ingredients.id"), primary_key=True)

    #Quantity and unit goes here as it will depend on the recipe
    quantity: Mapped[float] = mapped_column(Float, nullable=False)
    unit: Mapped[str] = mapped_column(String(50), nullable=False) #option in frontend

    #This if for nutricional value storage to avoid so many calls per recipe
    calories: Mapped[float] = mapped_column(Float, default=0)
    fat: Mapped[float] = mapped_column(Float, default=0)
    saturated_fat: Mapped[float] = mapped_column(Float, default=0)
    carbs: Mapped[float] = mapped_column(Float, default=0)
    sugars: Mapped[float] = mapped_column(Float, default=0)
    fiber: Mapped[float] = mapped_column(Float, default=0)
    protein: Mapped[float] = mapped_column(Float, default=0)
    salt: Mapped[float] = mapped_column(Float, default=0)
    sodium: Mapped[float] = mapped_column(Float, default=0) 

    #Relatioship with other tables
    recipe: Mapped["Recipe"] = relationship(back_populates="ingredients")
    ingredient: Mapped["Ingredient"] = relationship(back_populates="recipes")

    def serialize(self):
        return {
            "recipe_id": self.recipe_id,
            "ingredient_id": self.ingredient_id,
            "ingredient_name": self.ingredient.name,
            "quantity": self.quantity,
            "unit": self.unit,
            "calories": self.calories,
            "fat": self.fat,
            "saturated_fat": self.saturated_fat,
            "carbs": self.carbs,
            "protein": self.protein,
            "salt": self.salt,
            "sodium": self.sodium
        } 

class ShoppingListItem(db.Model):
    __tablename__ = 'shopping_list_items'

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)

    ingredient_name: Mapped[str] = mapped_column(String(255), nullable=False)
    total_quantity: Mapped[float] = mapped_column(Float, nullable=False)
    unit: Mapped[str] = mapped_column(String(50), nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped["User"] = relationship(back_populates="shopping_list")

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "ingredient_name": self.ingredient_name,
            "total_quantity": self.total_quantity,
            "unit": self.unit,
            "created_at": self.created_at.isoformat(timespec="seconds") if self.created_at else None
        }


class MealType(enum.Enum):
    BREAKFAST = "breakfast"
    MORNING_SNACK = "morning_snack"
    BRUNCH = "brunch"
    LUNCH = "lunch"
    AFTERNOON_SNACK = "afternoon_snack"
    DINNER = "dinner"
    SUPPER = "supper"
    SNACK = "snack"
    PRE_WORKOUT = "pre_workout"
    POST_WORKOUT = "post_workout"
    OTHER = "other"

class MealPlanEntry(db.Model):
    __tablename__ = 'meal_plan_entries'

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    recipe_id: Mapped[int] = mapped_column(ForeignKey("recipes.id"), nullable=False)
    meal_type: Mapped[MealType] = mapped_column(Enum(MealType), nullable=False)
    date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    user: Mapped["User"] = relationship(back_populates="meal_plan")
    recipe: Mapped["Recipe"] = relationship(back_populates="meal_plan_entries")

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "recipe_id": self.recipe_id,
            "recipe_title": self.recipe.title,
            "meal_type": self.meal_type.value,
            "date": self.date.date().isoformat()
        }

