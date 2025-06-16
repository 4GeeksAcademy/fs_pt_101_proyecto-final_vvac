const url = import.meta.env.VITE_BACKEND_URL;

const collectionServices = {};

const authHeaders = () => ({
  Authorization: "Bearer " + localStorage.getItem("token"),
  "Content-Type": "application/json",
});

// Get current user's collection
collectionServices.getUserCollections = async () => {
  try {
    const resp = await fetch(url + "/api/user/collection", {
      method: "GET",
      headers: authHeaders(),
    });

    const data = await resp.json();

    if (!resp.ok) throw new Error(data.error || data.message); //Test Alice --> incorporar 1nuevo error para llegar al catch del componente recipeCards!!
    return data;
  } catch (error) {
    return error;
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
collectionServices.addToCollection = async (recipe_id) => {
  try {
    const resp = await fetch(
      url + "/api/user/collection/recipes/" + recipe_id,
      {
        method: "POST",
        headers: authHeaders(),
      }
    );

    const data = await resp.json();

    if (!resp.ok) throw new Error(data.error);
    return data;
  } catch (error) {
    return error;
  }
};

// Remove recipe from collection
collectionServices.removeFromCollection = async (recipe_id) => {
  try {
    const resp = await fetch(
      url + "/api/user/collection/recipes/" + recipe_id,
      {
        method: "DELETE",
        headers: authHeaders(),
      }
    );

    const data = await resp.json();

    if (!resp.ok) throw new Error(data.error);
    return data;
  } catch (error) {
    return error;
  }
};

export default collectionServices;
