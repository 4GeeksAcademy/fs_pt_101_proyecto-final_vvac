const url = import.meta.env.VITE_BACKEND_URL;

const scoreService = {};

const authHeaders = () => ({
  'Authorization': 'Bearer ' + localStorage.getItem('token'),
  'Content-Type': 'application/json'
});

//Get all scores (by Alice)
scoreService.getAllScores = async () => {
  try {
    const resp = await fetch(url + "/api/scores", {
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

//Get all scores from specific user (by Alice)
//Esta funcion devolverá iuna lista con las recetas que le gustan
//PRE: user_id: es la id del usuario para contar las recetas en like
//POST: contador: es una lista con las recipes_id que le gustan al usuario.

scoreService.getAllScoresUser = async (user_id) => {
  try {
    const resp = await fetch(url + "/api/scores", {
      method: "GET",
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const data = await resp.json();
    
    //aqui hay que contar.....
    const contador = data.filter(item => item.user_id == user_id).map(item => item.recipe_id);;

    if (!resp.ok) throw new Error(data.error);

    return contador;

  } catch (error) {
      console.error("Error fetching scores:", error);
    return [];
  }
};

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
