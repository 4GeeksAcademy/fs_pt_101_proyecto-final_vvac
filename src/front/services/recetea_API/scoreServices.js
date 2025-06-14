const url = import.meta.env.VITE_BACKEND_URL;

const scoreService = {};

const authHeaders = () => ({
  'Authorization': 'Bearer ' + localStorage.getItem('token'),
  'Content-Type': 'application/json'
});

//Get all score of one recipe
scoreService.getRecipeScores = async (recipe_id) => {
  try {
    const resp = await fetch(url + "/api/recipes/" + recipe_id + "/scores", {
      method: "GET",
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await resp.json();

    if (!resp.ok) throw new Error(data.error);
    return data;

  } catch (error) {
    console.error("Error fetching scores:", error);
    return [];
  }
};

// Like/unlike a recipe
scoreService.toggleScore = async (recipe_id) => {
  try {
    const resp = await fetch(url + "/api/user/recipes/" + recipe_id + "/score", {
      method: "POST",
      headers: authHeaders(),
    });
    
    const data = await resp.json();

    if (!resp.ok) throw new Error(data.error);
    return data;

  } catch (error) {
    console.error("Error toggling score:", error);
    return {success: false, message: error.message}; 
  }
};

export default scoreService;
