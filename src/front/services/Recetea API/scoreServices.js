const url = import.meta.env.VITE_BACKEND_URL;

const scoreService = {};

const authHeaders = () => ({
  'Authorization': 'Bearer ' + localStorage.getItem('token'),
  'Content-Type': 'application/json'
});

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
    return error;
  }
};

export default scoreService;
