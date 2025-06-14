// Set the backend URL from the .env file
const url = import.meta.env.VITE_BACKEND_URL;

const shoppingListServices = {};

// Utility: Set headers with JWT token
const authHeaders = () => ({
  'Authorization': 'Bearer ' + localStorage.getItem('token'),
  'Content-Type': 'application/json'
});

// GET: Get all shopping list items for the logged-in user
shoppingListServices.getShoppingList = async () => {
  try {
    const resp = await fetch(`${url}user/shopping-list`, {
      method: "GET",
      headers: authHeaders(),
    });

    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error || data.message);
    return data;

  } catch (error) {
    console.error("Error fetching shopping list:", error);
    return error;
  }
};

// POST: Add recipes to the shopping list (send array of recipe IDs)
shoppingListServices.addRecipesToList = async (recipe_ids = []) => {
  try {
    const resp = await fetch(`${url}user/shopping-list`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ recipe_ids }),
    });

    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error || data.message);
    return data;

  } catch (error) {
    console.error("Error adding recipes to shopping list:", error);
    return error;
  }
};

// DELETE: Remove a single item from the shopping list by item ID
shoppingListServices.deleteItem = async (item_id) => {
  try {
    const resp = await fetch(`${url}user/shopping-list/${item_id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error || data.message);
    return data;

  } catch (error) {
    console.error("Error deleting shopping list item:", error);
    return error;
  }
};

// DELETE: Clear the entire shopping list for the logged-in user
shoppingListServices.clearList = async () => {
  try {
    const resp = await fetch(`${url}user/shopping-list`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error || data.message);
    return data;

  } catch (error) {
    console.error("Error clearing shopping list:", error);
    return error;
  }
};

export default shoppingListServices;
