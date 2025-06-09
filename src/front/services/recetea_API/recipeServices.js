// This will set the url to the same we added to the env file
const url = import.meta.env.VITE_BACKEND_URL;

const recipeServices = {};

// Utility: Add JWT token
const authHeaders = () => ({
  'Authorization': 'Bearer ' + localStorage.getItem('token'),
  'Content-Type': 'application/json'
});

// Get all recipes (guests)
recipeServices.getAllRecipes = async () => {
    try {
        const resp = await fetch(url + "/api/recipes", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await resp.json();
        if (!resp.ok) throw new Error(data.error || data.message);
        return data;
    } catch (error) {
        console.error("Error fetching all recipes:", error);
        return error;
    }
};

// Get a specific recipe by ID (guests)
recipeServices.getOneRecipe = async (id) => {
    try {
        const resp = await fetch(url + "/api/recipes/" + id, {
            method: 'GET',
        });

        const data = await resp.json();
        if (!resp.ok) throw new Error(data.error || data.message);

        return data;

    } catch (error) {
        console.error("Error fetching recipe:" + id, error);
        return error;
    }
};

//For mis recetas option
//Get all recipes (need to log in)
recipeServices.getAllUserRecipes = async () => {
    try {
        const resp = await fetch(url + "/api/user/recipes", {
        method: 'GET',
        headers: authHeaders()
        });

        const data = await resp.json();
        if (!resp.ok) throw new Error(data.error || data.message);
        return data;
    } catch (error) {
        console.error("Error fetching user recipes:", error);
        return error;
    }
}

// GET a specific recipe (need to log in)
recipeServices.getOneUserRecipe = async (id) => {
    try {
        const resp = await fetch(url + "/api/user/recipes/" + id, {
        method: 'GET',
        headers: authHeaders()
        });

        const data = await resp.json();
        if (!resp.ok) throw new Error(data.error);
        return data;
    } catch (error) {
        console.error("Error fetching recipe:", error);
        return error;
    }
}

// POST a new recipe (need to log in)
recipeServices.createRecipe = async (recipeData) => {
    try {
        const resp = await fetch(url + "/api/user/recipes", {
        method: 'POST',
        headers: authHeaders(),
        //Need to have title, difficulty_type, steps and ingredients. Prep_time is optional.
        //The author and username fields will be filled automatically as well publised field.
        //The ingredients require quantity, name and unit fields filled. If does not exist on the dabatase will be added.
        body: JSON.stringify(recipeData)
        });

        const data = await resp.json();
        if (!resp.ok) throw new Error(data.error);
        return data;
    } catch (error) {
        console.error("Error creating recipe:", error);
        return error;
    }
}

// PUT to edit an existing recipe (need to log in and be the author of the recipe)
recipeServices.editRecipe = async (id, recipeData) => {
    try {
        const resp = await fetch(url + "/api/user/recipes/" + id, {
        method: 'PUT',
        headers: authHeaders(),
        //Same as the post body.
        body: JSON.stringify(recipeData)
        });

        const data = await resp.json();
        if (!resp.ok) throw new Error(data.error);
        return data;
    } catch (error) {
        console.error("Error editing recipe:", error);
        return error;
    }
}

  // DELETE a recipe created by the user (need to log in and be the author of the recipe)
recipeServices.deleteRecipe = async (id) => {
    try {
      const resp = await fetch(url + "/api/user/recipes/" + id, {
        method: 'DELETE',
        headers: authHeaders()
      });

      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error);
      return data;
    } catch (error) {
      console.error("Error deleting recipe:", error);
      return error;
    }
}

export default recipeServices;