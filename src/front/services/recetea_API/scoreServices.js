const url = import.meta.env.VITE_BACKEND_URL;

const scoreService = {};

const authHeaders = () => ({
  'Authorization': 'Bearer ' + localStorage.getItem('token'),
  'Content-Type': 'application/json'
});

//Get all score of one recipe
scoreService.getRecipeScores = async (id) => {
  try {
    const resp = await fetch(url + "/api/recipes/" + id + "/scores", {
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
scoreService.toggleScore = async (id) => {
  try {
    const resp = await fetch(url + "/api/user/recipes/" + id + "/score", {
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

export default scoreService;
