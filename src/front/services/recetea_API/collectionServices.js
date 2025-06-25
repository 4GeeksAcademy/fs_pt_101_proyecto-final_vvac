const url = import.meta.env.VITE_BACKEND_URL;

const collectionService = {};

const authHeaders = () => ({
  'Authorization': 'Bearer ' + localStorage.getItem('token'),
  'Content-Type': 'application/json'
});

// Get current user's collection
collectionService.getUserCollections = async () => {
  try {
    const resp = await fetch(url + "/api/user/collection", {
      method: "GET",
      headers: authHeaders(),
    });

    const data = await resp.json();

    if (!resp.ok) {
      return { success: false, error: data.error };
    }

    return { success: true, ...data };

  } catch (error) {
     return { success: false, error: error.message }
  }
};

  
// Toggle recipe in collection
collectionServices.ToggleCollection = async (recipe_id) => {
  //primero ver si está o no
  //segundo, si está --> eliminar
  //         sino --> añadir

  
  try {
    const actualmente = await collectionServices.getUserCollections();

    //Funcion para saber si una receta se encuentra dentro de un listado de collections
    // some() —> devuelve true si encuentra alguna coincidencia
    const existe = (recipe_id) => {return actualmente.some((item) => item.recipe_id == recipe_id);}
    existe(recipe_id) ? await collectionServices.removeFromCollection(recipe_id) : await collectionServices.addToCollection(recipe_id)
    }
    catch {
      console.log("ERROR")
    }
};

// Add recipe to collection
collectionService.addToCollection = async (recipe_id) => {
  try {
    const resp = await fetch(url + "/api/user/collection/recipes/" + recipe_id, {
      method: "POST",
      headers: authHeaders(),
    });

    const data = await resp.json();

    if (!resp.ok) {
      return { success: false, error: data.error || 'Unknown error' };
    }

    return { success: true, ...data };

  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Remove recipe from collection
collectionService.removeFromCollection = async (recipe_id) => {
  try {
    const resp = await fetch(url + "/api/user/collection/recipes/" + recipe_id, {
      method: "DELETE",
      headers: authHeaders(),
    });

    const data = await resp.json();

    if (!resp.ok) {
      return { success: false, error: data.error || 'Unknown error' };
    }

    return { success: true, ...data };

  } catch (error) {
    return { success: false, error: error.message };
  }
};

export default collectionService;
