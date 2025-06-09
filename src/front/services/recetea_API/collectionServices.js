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

    if (!resp.ok) throw new Error(data.error);
    return data;

  } catch (error) {
    return error;
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

    if (!resp.ok) throw new Error(data.error);
    return data;

  } catch (error) {
    return error;
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

    if (!resp.ok) throw new Error(data.error);
    return data;

  } catch (error) {
    return error;
  }
};

export default collectionService;
