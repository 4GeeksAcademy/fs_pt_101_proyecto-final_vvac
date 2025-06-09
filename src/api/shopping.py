from sqlalchemy import func
from api.models import db, Ingredient, RecipeIngredient, ShoppingListItem

def add_recipes_to_shopping_list(recipe_ids: list[int], user_id: int):
    results = (
        db.session.query(
            Ingredient.name.label("ingredient_name"),
            RecipeIngredient.unit.label("unit"),
            func.sum(RecipeIngredient.quantity).label("total_quantity")
        )
        .join(RecipeIngredient.ingredient)
        .filter(RecipeIngredient.recipe_id.in_(recipe_ids))
        .group_by(Ingredient.name, RecipeIngredient.unit)
        .all()
    )

    for row in results:
        existing_item = ShoppingListItem.query.filter_by(
            user_id=user_id,
            ingredient_name=row.ingredient_name,
            unit=row.unit
        ).first()

        if existing_item:
            existing_item.total_quantity += float(row.total_quantity)
        else:
            new_item = ShoppingListItem(
                user_id=user_id,
                ingredient_name=row.ingredient_name,
                total_quantity=float(row.total_quantity),
                unit=row.unit
            )
            db.session.add(new_item)

    db.session.commit()

    return [item.serialize() for item in ShoppingListItem.query.filter_by(user_id=user_id).all()]
