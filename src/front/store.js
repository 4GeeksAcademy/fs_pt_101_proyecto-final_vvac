export const initialStore = () => {
  return {
    token: localStorage.getItem("token") || null,
    user: JSON.parse(localStorage.getItem("user") && localStorage.getItem("user") !== "undefined" ? localStorage.getItem("user") : "{}"),
    recipes: [],
    recipe: null,
    collections: [],
    scores: [],
    shoppingList: [],
    comments: [],
    comment: [],
    user_recipes: [],
    selectedCalendarRecipe: null, // ✅ NUEVO: para integración con calendario
  };
};

export default function storeReducer(store, action = {}) {
  switch (action.type) {
    case "logout":
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return {
        ...store,
        user: {}, // reset user to empty object
        token: null, // reset token to null
      };

    case "logIn":
      return {
        ...store,
        token: action.payload.token,
        user: action.payload.user,
      };

    case "get_user":
      return {
        ...store,
        user: action.payload,
      };

    case "signUp":
      return {
        ...store,
      };

    case "forgotPasswd":
      return {
        ...store,
        user: action.payload, // El payload ya es el email directamente
      };

    case "resetPasswd":
      return {
        ...store,
      };

    case "updateUser":
      return {
        ...store,
        user: {
          ...store.user,
          ...action.payload.user,
        },
        token: action.payload.token || store.token,
      };

    case "updateProfileImage":
      const updatedUserWithImage = {
        ...store.user,
        photo_url: action.payload.photo_url,
      };
      localStorage.setItem("user", JSON.stringify(updatedUserWithImage));
      return {
        ...store,
        user: updatedUserWithImage,
      };

    case "get_all_recipes":
      return {
        ...store,
        recipes: action.payload,
      };

    case "get_one_recipe":
      return {
        ...store,
        recipe: action.payload,
      };

    case "get_recipe_score": {
      const { recipe_id, scores } = action.payload;
      return {
        ...store,
        scores: {
          ...store.scores,
          [recipe_id]: scores,
        },
      };
    }

    case "get_user_recipes":
      return {
        ...store,
        user_recipes: Array.isArray(action.payload) ? action.payload : [],
      };

    case "create_recipe": {
      return {
        ...store,
        recipes: action.payload,
      };
    }

    case "update_recipe": {
      const updatedRecipe = action.payload.recipe;
      const allRecipes = action.payload.recipes;
      return {
        ...store,
        recipe: updatedRecipe || store.recipe,
        recipes:
          allRecipes ||
          (updatedRecipe
            ? store.recipes.map((r) =>
                r.id === updatedRecipe.id ? updatedRecipe : r
              )
            : store.recipes),
      };
    }

    case "delete_recipe": {
      return {
        ...store,
        user_recipes: store.user_recipes.filter(
          (recipe) => recipe.id !== action.payload.id
        ),
      };
    }

    case "like": {
      const { recipe_id, user_id } = action.payload;
      const newScoreEntry = {
        recipe_id: recipe_id,
        user_id: user_id,
        score: 1,
      };
      return {
        ...store,
        scores: {
          ...store.scores,
          [recipe_id]: [
            ...(store.scores[recipe_id] ?? []).filter(
              (scoreItem) => String(scoreItem.user_id) !== String(user_id)
            ),
            newScoreEntry,
          ],
        },
      };
    }

    case "unlike": {
      const { recipe_id, user_id } = action.payload;
      return {
        ...store,
        scores: {
          ...store.scores,
          [recipe_id]: (store.scores[recipe_id] ?? []).filter(
            (score) => score.user_id !== user_id
          ),
        },
      };
    }

    case "remove_ingredient":
      return {
        ...store,
        shoppingList: store.shoppingList.filter((_, i) => i !== action.payload),
      };

    case "reset_shopping_list":
      return {
        ...store,
        shoppingList: [],
      };

    case "get_shopping_list":
      return {
        ...store,
        shoppingList: Array.isArray(action.payload)
          ? action.payload.filter(
              (item) =>
                item &&
                typeof item.ingredient_name === "string" &&
                typeof item.total_quantity === "number" &&
                typeof item.unit === "string"
            )
          : [],
      };

    case "get_user_collection": {
      return {
        ...store,
        collections: action.payload || [],
      };
    }

    case "update_collections": {
      return {
        ...store,
        collections: Array.isArray(action.payload) ? action.payload : [],
      };
    }

    case "get_all_comments": {
      return {
        ...store,
        comments: action.payload || [],
      };
    }

    case "add_comment": {
      return {
        ...store,
        comment: [action.payload, ...store.comment],
      };
    }

    case "edit_comment": {
      return {
        ...store,
        comment: [action.payload, ...store.comment],
      };
    }

    case "delete_comment": {
      return {
        ...store,
        comments: store.comments.filter(
          (comment) => comment.id !== action.payload
        ),
      };
    }
    case "set_hello":
      return {
        ...store,
        message: action.payload,
      };

    case "get_user_collections":
      return {
        ...store,
        collections: action.payload,
      };

    case "add_to_collection":
      return {
        ...store,
        collections: [...store.collections, action.payload],
      };

    case "remove_from_collection":
      return {
        ...store,
        collections: store.collections.filter((id) => id !== action.payload),
      };

    case "set_calendar_entry_recipe":
      return {
        ...store,
        selectedCalendarRecipe: action.payload,
      };

    default:
      throw Error("Unknown action.");
  }
}
