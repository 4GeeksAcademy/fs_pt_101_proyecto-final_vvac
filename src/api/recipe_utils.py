
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
    "flour": ["gluten"],
    "milk": ["milk", "lactose"],
    "butter": ["milk", "lactose"],
    "eggs": ["egg"],
    "yogurt": ["milk", "lactose"],
    "cheese": ["milk"],
    "bread": ["gluten"],
    "peanuts": ["peanuts"],
    "almonds": ["tree-nuts"],
    "shrimp": ["crustaceans"],
    "soy": ["soybeans"],
    "wheat": ["gluten", "wheat"]
}

def convert_to_grams(ingredient_name: str, unit: str, quantity: float) -> float:
    name = ingredient_name.lower()
    unit = unit.lower()

    if name in UNIT_CONVERSIONS and unit in UNIT_CONVERSIONS[name]:
        return UNIT_CONVERSIONS[name][unit] * quantity

    if unit in FALLBACK_UNIT_CONVERSIONS:
        return FALLBACK_UNIT_CONVERSIONS[unit] * quantity

    # Unknown unit — safest fallback
    return 0

def get_common_allergens_fuzzy(name):
    name = name.lower()
    for key in COMMON_INGREDIENT_ALLERGENS:
        if key in name:
            return COMMON_INGREDIENT_ALLERGENS[key]
    return []

#Fetch of Open Foods API to request allergens and nutritional value
def get_ingredient_info(name):

    normalized_name = name.lower().strip()

    # Check first if we do not have in our fallback list
    fallback_allergens = COMMON_INGREDIENT_ALLERGENS.get(normalized_name, [])

    # Fetch from API if none found
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

        product = {}
        selected_nutriments = {}
        selected_allergens_tags = []

        for p in products:
            product_name = p.get("product_name", "").lower().strip()
            nutriments = p.get("nutriments", {})

            # Accept product with usable nutrition info
            if not selected_nutriments and any(
                nutriments.get(key) not in [None, "", 0]
                for key in ["energy-kcal_100g", "carbohydrates_100g", "proteins_100g"]
            ):
                selected_nutriments = nutriments

            # Prefer allergen info only from exact or close matches
            if product_name == normalized_name:
                selected_allergens_tags = p.get("allergens_tags", [])
                break

        nutriments = product.get("nutriments", {})

        api_allergens = [
            a.replace("en:", "").replace("fr:", "").strip()
            for a in selected_allergens_tags
        ]
        combined_allergens = list(set(fallback_allergens + api_allergens))

        return {
            "calories": selected_nutriments.get("energy-kcal_100g", 0),
            "fat": selected_nutriments.get("fat_100g", 0),
            "carbs": selected_nutriments.get("carbohydrates_100g", 0),
            "protein": selected_nutriments.get("proteins_100g", 0),
            "allergens": combined_allergens or fallback_allergens
        }
    
    except Exception:
        # Fallback only (in case of request failure)
        return {
            "calories": 0,
            "fat": 0,
            "carbs": 0,
            "protein": 0,
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