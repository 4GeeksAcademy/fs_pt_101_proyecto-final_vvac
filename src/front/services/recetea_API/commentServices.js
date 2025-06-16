// This will set the url to the same we added to the env file
const url = import.meta.env.VITE_BACKEND_URL;

const commentServices = {};

// Utility: Add JWT token
const authHeaders = () => ({
  'Authorization': 'Bearer ' + localStorage.getItem('token'),
  'Content-Type': 'application/json'
});

// GET all comments by recipe ID (no token needed)
commentServices.getCommentsByRecipe = async (recipe_id) => {
  try {
    const resp = await fetch(url + "/api/recipes/" + recipe_id + "/comments", {
      method: "GET",
    });

    const data = await resp.json();

    if (!resp.ok) throw new Error(data.error || data.message);
    return data ? data : [];

  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
};

// POST a new comment (need to log in)
commentServices.createComment = async (recipe_id, content) => {
  try {
    const resp = await fetch(url + "users/recipes/" + recipe_id + "/comments", {
      method: "POST",
      headers: authHeaders(),
      //content field is required
      body: JSON.stringify({ content }),
    });

    const data = await resp.json();

    if (!resp.ok) throw new Error(data.error || data.message);
    return data;

  } catch (error) {
    console.error("Error creating comment:", error);
    return error;
  }
};

// PUT to update comment (need to log in)
commentServices.editComment = async (recipe_id, comment_id, content) => {
  try {
    const resp = await fetch(url + "users/recipes/" + recipe_id + "/comments/" + comment_id, {
      method: "PUT",
      headers: authHeaders(),
      //content field is required
      body: JSON.stringify({ content }),
    });
    const data = await resp.json();

    if (!resp.ok) throw new Error(data.error || data.message);
    return data;

  } catch (error) {
    console.error("Error editing comment:", error);
    return error;
  }
};

// DELETE a comment (need to log in)
commentServices.deleteComment = async (recipe_id, comment_id) => {
  try {
    const resp = await fetch(url + "users/recipes/" + recipe_id + "/comments/" + comment_id, {
      method: "DELETE",
      headers: authHeaders(),
    });

    const data = await resp.json();

    if (!resp.ok) throw new Error(data.error || data.message);
    return data;

  } catch (error) {
    console.error("Error deleting comment:", error);
    return error;
  }
};

export default commentServices;