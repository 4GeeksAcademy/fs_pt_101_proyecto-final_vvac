
import requests

# Ingredient-specific unit-to-gram mappings
# Specific conversions for known ingredients
UNIT_CONVERSIONS = {
    "flour": {
        "cup": 120,
        "tablespoon": 7.5,
        "teaspoon": 2.5
    },
    "sugar": {
        "cup": 200,
        "tablespoon": 12.5,
        "teaspoon": 4.2
    },
    "butter": {
        "tablespoon": 14,
        "teaspoon": 4.7
    },
    "milk": {
        "cup": 240,
        "tablespoon": 15,
        "teaspoon": 5
    },
    "eggs": {
        "unit": 50  # 1 egg ≈ 50g
    }
}

# General fallback conversions if ingredient-specific not available
FALLBACK_UNIT_CONVERSIONS = {
    "cup": 240,
    "tablespoon": 15,
    "teaspoon": 5,
    "unit": 50,
    "grams": 1,
    "g": 1,
    "kg": 1000,
    "ml": 1,
    "l": 1000,
    "oz": 28.35,
    "pound": 453.6
}

COMMON_INGREDIENT_ALLERGENS = {
    "spaghetti": ["wheat", "gluten"],
    "pasta": ["wheat", "gluten"],
    "bread": ["wheat", "gluten"],
    "flour": ["wheat", "gluten"],
    "milk": ["milk", "lactose"],
    "cheese": ["milk", "lactose"],
    "butter": ["milk", "lactose"],
    "yogurt": ["milk", "lactose"],
    "egg": ["eggs"],
    "mayonnaise": ["eggs"],
    "shrimp": ["shellfish"],
    "crab": ["shellfish"],
    "lobster": ["shellfish"],
    "salmon": ["fish"],
    "tuna": ["fish"],
    "cod": ["fish"],
    "peanuts": ["peanuts"],
    "peanut butter": ["peanuts"],
    "almonds": ["tree nuts"],
    "cashews": ["tree nuts"],
    "walnuts": ["tree nuts"],
    "hazelnuts": ["tree nuts"],
    "soy": ["soy"],
    "soy sauce": ["soy"],
    "tofu": ["soy"],
    "sesame": ["sesame"],
    "tahini": ["sesame"],
    "mustard": ["mustard"],
    "mustard seeds": ["mustard"],
    "celery": ["celery"],
    "celery salt": ["celery"],
    "lupin": ["lupin"],
    "mussels": ["mollusks"],
    "oysters": ["mollusks"],
    "scallops": ["mollusks"],
    "dried apricots": ["sulfites"],
    "raisins": ["sulfites"],
    "wine": ["sulfites"]
}


def convert_to_grams(ingredient_name: str, unit: str, quantity: float) -> float:
    name = ingredient_name.lower()
    unit = unit.lower()

    if name in UNIT_CONVERSIONS and unit in UNIT_CONVERSIONS[name]:
        return UNIT_CONVERSIONS[name][unit] * quantity

    if unit in FALLBACK_UNIT_CONVERSIONS:
        return FALLBACK_UNIT_CONVERSIONS[unit] * quantity

    # Unknown unit fallback
    return 0


def get_common_allergens_fuzzy(name):
    name = name.lower()
    for key in COMMON_INGREDIENT_ALLERGENS:
        if key in name:
            return COMMON_INGREDIENT_ALLERGENS[key]
    return []


def get_ingredient_info(name):
    normalized_name = name.lower().strip()
    fallback_allergens = COMMON_INGREDIENT_ALLERGENS.get(normalized_name, [])

    search_url = "https://world.openfoodfacts.org/cgi/search.pl"
    params = {
        "search_terms": normalized_name,
        "search_simple": 1,
        "action": "process",
        "json": 1,
        "page_size": 10
    }

    try:
        response = requests.get(search_url, params=params, timeout=5)
        response.raise_for_status()

        data = response.json()
        products = data.get("products", [])

        required_keys = [
            "energy-kcal_100g", "carbohydrates_100g", "proteins_100g",
            "sugars_100g", "fiber_100g"
        ]

        selected_nutriments = {}
        selected_allergens_tags = []

        # Para fallback: guardar el producto con más nutrientes válidos encontrados
        best_nutriments = {}
        best_count = -1

        for p in products:
            product_name = p.get("product_name", "").lower().strip()
            nutriments = p.get("nutriments", {})

            # Contar cuántos nutrientes requeridos tiene con valor válido
            count_valid = sum(
                1 for key in required_keys if nutriments.get(key) not in [None, "", 0]
            )

            # Selección prioritaria: tiene todos los requeridos?
            if not selected_nutriments and count_valid == len(required_keys):
                selected_nutriments = nutriments

            # Para fallback: si no hay seleccionado con todos, actualizar el mejor según count_valid
            if count_valid > best_count:
                best_count = count_valid
                best_nutriments = nutriments

            if product_name == normalized_name:
                selected_allergens_tags = p.get("allergens_tags", [])
                break

        if not selected_nutriments:
            selected_nutriments = best_nutriments

        api_allergens = [
            a.replace("en:", "").replace("fr:", "").strip()
            for a in selected_allergens_tags
        ]
        combined_allergens = list(set(fallback_allergens + api_allergens))

        return {
            "calories": selected_nutriments.get("energy-kcal_100g", 0),
            "fat": selected_nutriments.get("fat_100g", 0),
            "saturated_fat": selected_nutriments.get("saturated-fat_100g", 0),
            "carbs": selected_nutriments.get("carbohydrates_100g", 0),
            "sugars": selected_nutriments.get("sugars_100g", 0),
            "fiber": selected_nutriments.get("fiber_100g", 0),
            "protein": selected_nutriments.get("proteins_100g", 0),
            "salt": selected_nutriments.get("salt_100g", 0),
            "sodium": selected_nutriments.get("sodium_100g", 0),
            "allergens": combined_allergens or fallback_allergens
        }

    except Exception:
        return {
            "calories": 0,
            "fat": 0,
            "saturated_fat": 0,
            "carbs": 0,
            "sugars": 0,
            "fiber": 0,
            "protein": 0,
            "salt": 0,
            "sodium": 0,
            "allergens": fallback_allergens
        }


def calculate_calories(grams, calories_per_100g):
    return (grams * calories_per_100g) / 100


def calculate_fat(grams, fat_per_100g):
    return (grams * fat_per_100g) / 100


def calculate_carbs(grams, carbs_per_100g):
    return (grams * carbs_per_100g) / 100


def calculate_protein(grams, protein_per_100g):
    return (grams * protein_per_100g) / 100


def calculate_salt(grams, salt_per_100g):
    return (grams * salt_per_100g) / 100


def calculate_sodium(grams, sodium_per_100g):
    return (grams * sodium_per_100g) / 100


def calculate_sugars(grams, sugars_per_100g):
    return (grams * sugars_per_100g) / 100


def calculate_fiber(grams, fiber_per_100g):
    return (grams * fiber_per_100g) / 100


def calculate_total_nutrition(ingredients):
    totals = {
        "calories": 0,
        "fat": 0,
        "saturated_fat": 0,
        "carbs": 0,
        "sugars": 0,
        "fiber": 0,
        "protein": 0,
        "salt": 0,
        "sodium": 0,
    }

    for ingredient in ingredients:
        totals["calories"] += ingredient.get("calories", 0)
        totals["fat"] += ingredient.get("fat", 0)
        totals["saturated_fat"] += ingredient.get("saturated_fat", 0)
        totals["carbs"] += ingredient.get("carbs", 0)
        totals["sugars"] += ingredient.get("sugars", 0)
        totals["fiber"] += ingredient.get("fiber", 0)
        totals["protein"] += ingredient.get("protein", 0)
        totals["salt"] += ingredient.get("salt", 0)
        totals["sodium"] += ingredient.get("sodium", 0)

    return totals
