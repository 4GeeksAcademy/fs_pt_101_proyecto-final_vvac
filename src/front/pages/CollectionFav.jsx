import { useState, useEffect } from "react";
import { TurnHome } from "../components/buttons/TurnHome";
import { LinksMenu } from "../components/LinksMenu";
import { RightMenu } from "../components/RightMenu";
import { CollectionCard } from "../components/CollectionCard"; // Ensure this path is correct
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import recipeServices from "../services/recetea_API/recipeServices.js";
import collectionServices from "../services/recetea_API/collectionServices.js";
import { useNavigate } from "react-router-dom";
import { UserRecipeCard } from "../components/UserRecipeCard.jsx";

export const CollectionFav = () => {
  const navigate = useNavigate();
  const { dispatch, store } = useGlobalReducer();

  const [activeTab, setActiveTab] = useState("all");

  // Raw/minimal data
  const [recipeItemsRaw, setRecipeItemsRaw] = useState([]);
  const [collectionItemsRaw, setCollectionItemsRaw] = useState([]);

  // For "All" tab with complete details
  const [allRecipes, setAllRecipes] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Helper function to format ingredients based on the structure provided by getOneRecipe
  const formatIngredients = (ingredients) => {
    if (Array.isArray(ingredients) && ingredients.length > 0) {
      // Assuming each ingredient is an object with an 'ingredient_name' property
      return ingredients.map(ing => ing.ingredient_name).join(', ');
    }
    // If it's already a string or empty, return as is or a default message
    return typeof ingredients === 'string' && ingredients.length > 0 ? ingredients : "Ingredients list not available";
  };

  // Helper function to format dates
  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleDateString('en-US') : '';
  };


  useEffect(() => {
    const fetchYourRaw = async () => {
      const resp = await recipeServices.getAllUserRecipes();
      const arr = Array.isArray(resp) ? resp : resp.recipes || [];
      return arr.map(r => ({ //Listado de ids
        id: r.id,
      }));
    };

    const fetchCollectionsRaw = async () => {
      const data = await collectionServices.getUserCollections();
      const formatted = (Array.isArray(data) ? data : data.data || []).map(item => ({
        id: item.recipe_id,
        userId: item.user_id,
        saved_at: item.saved_at, // Crucial for displaying "Saved on" date
      }));
      dispatch({ type: "get_user_collections", payload: formatted });
      return formatted;
    };

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        if (activeTab === "all") {
          // 1) Fetch raw data for user's own recipes and collections
          const [yourRaw, collRaw] = await Promise.all([
            recipeServices.getAllUserRecipes(), // Raw recipes from user
            collectionServices.getUserCollections(), // Raw collection items
          ]);

          // Extract IDs and relevant info, combine, and deduplicate
          const uniqueRecipesMap = new Map(); // Map to store unique full recipe objects

          // Add user's own recipes
          (Array.isArray(yourRaw) ? yourRaw : yourRaw.recipes || []).forEach(r => {
            uniqueRecipesMap.set(r.id, { ...r, type: 'created' }); // Mark as created
          });

          // Add collection recipes, prioritizing them if they overlap with created ones
          (Array.isArray(collRaw) ? collRaw : collRaw.data || []).forEach(c => {
            // Get full recipe details for collection items here if not already fetched
            // OR fetch them below in the main Promise.all for uniqueIds.
            // For now, just mark them as saved and store saved_at
            uniqueRecipesMap.set(c.recipe_id, {
              id: c.recipe_id, // Use recipe_id from collection item
              saved_at: c.saved_at, // Use saved_at from collection item
              type: 'saved', // Mark as saved
              // You might need to fetch more details for recipes only in collection here or later
            });
          });

          const uniqueIds = Array.from(uniqueRecipesMap.keys());

          // 3) For each unique ID, get full recipe details and normalize
          const fullRecipesPromises = uniqueIds.map(async id => {
            const recipeDetails = await recipeServices.getOneRecipe(id);
            const originalItem = uniqueRecipesMap.get(id); // Get original type/saved_at info

            // Return a normalized object for CollectionCard
            return {
              id: recipeDetails.id,
              imageUrl: recipeDetails.media?.[0]?.url || "",
              title: recipeDetails.title || recipeDetails.name || "Untitled Recipe",
              ingredientsList: formatIngredients(recipeDetails.ingredients), // Format ingredients
              authorName: recipeDetails.username || "Unknown",
              // Decide which date to show based on 'type' and if it's saved
              savedDate: originalItem.type === 'saved' ? formatDate(originalItem.saved_at || recipeDetails.created_at) : '', // Prefer saved_at from collection, fallback to created_at
              createdDate: originalItem.type === 'created' ? formatDate(recipeDetails.created_at) : '',
            };
          });

          const fullCombined = await Promise.all(fullRecipesPromises);
          setAllRecipes(fullCombined); // Set the fully processed data for "All" tab

        } else if (activeTab === "your-recipes") {
          const yourRaw = await recipeServices.getAllUserRecipes(); // Fetch all user recipes
          const userRecipeIds = (Array.isArray(yourRaw) ? yourRaw : yourRaw.recipes || []).map(r => r.id);

          const fullYourRecipesPromises = userRecipeIds.map(async id => {
            const recipeDetails = await recipeServices.getOneRecipe(id);
            return {
              id: recipeDetails.id,
              imageUrl: recipeDetails.media?.[0]?.url || "",
              title: recipeDetails.title || recipeDetails.name || "Untitled Recipe",
              ingredientsList: formatIngredients(recipeDetails.ingredients),
              authorName: recipeDetails.author?.username || "Unknown",
              savedDate: '', // Not a saved recipe for this view
              createdDate: formatDate(recipeDetails.created_at),
            };
          });
          const fullYourRecipes = await Promise.all(fullYourRecipesPromises);
          setRecipeItemsRaw(fullYourRecipes); // Store full details for 'your-recipes' tab

        } else if (activeTab === "collections") {
          // const collRaw = await collectionServices.getUserCollections();
          const collRaw = store.collections
          const collRecipeIdsAndDates = (Array.isArray(collRaw) ? collRaw : collRaw.data || []).map(item => ({
            id: item.recipe_id,
            saved_at: item.saved_at,
          }));

          const uniqueCollIds = Array.from(new Set(collRecipeIdsAndDates.map(c => c.id)));

          const fullCollPromises = uniqueCollIds.map(async id => {
            const recipeDetails = await recipeServices.getOneRecipe(id);
            const savedInfo = collRecipeIdsAndDates.find(item => item.id === id); // Find saved_at for this recipe
            return {
              id: recipeDetails.id,
              imageUrl: recipeDetails.media?.[0]?.url || "",
              title: recipeDetails.title || recipeDetails.name || "Untitled Recipe",
              ingredientsList: formatIngredients(recipeDetails.ingredients),
              authorName: recipeDetails.author?.username || "Unknown",
              savedDate: formatDate(savedInfo?.saved_at || recipeDetails.created_at), // Prefer saved_at, fallback to created_at
              createdDate: '', // Not a created recipe for this view
            };
          });
          const fullColl = await Promise.all(fullCollPromises);
          setCollectionItemsRaw(fullColl); // Store full details for 'collections' tab
        }
      } catch (err) {
        console.error("Error loading data:", err); // Log the error actual 
        setError("Error loading data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [activeTab, dispatch, store.user.id, store.collections]);

  // Generic render function for cards based on provided data
  const renderCards = (data, loadingMessage, errorMessage, noDataMessage) => {
    if (loading) return <p>{loadingMessage}</p>;
    if (error) return <p className="text-danger">{errorMessage}</p>;
    if (!data.length) return <p>{noDataMessage}</p>;

    return (
      <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <div className="cards-grid d-flex flex-wrap justify-content-center">
          {data.map((recipe) => (
            <UserRecipeCard
              key={recipe.id}
              recipe_id={recipe.id}
              url={recipe.imageUrl}
              name={recipe.title}
              published={recipe.published || ''}
            />
          ))}
        </div>
      </div>
    );
  };

    return (

        <div className="main-row-all vh-100">

            <div className="profile-container">

                {/* COLUMNA LATERAL IZQ */}

                <div className="container text-center sidebar-left-profile">
                    <div className="row align-items-start">
                        <div className="col-3">

                            <LinksMenu />

                        </div>

            <div className="col-12 col-md-6 main-column-content">
              <div className="d-flex align-items-start flex-column mb-3 edit-perfil">
                <h2 className="mb-3">Collection</h2>
                <p>All, Your Recipes & Collections</p>

                <ul className="nav nav-tabs">
                  {["all", "your-recipes", "collections"].map(tab => (
                    <li className="nav-item" key={tab}>
                      <button
                        className={`nav-link ${activeTab === tab ? "active" : ""}`}
                        onClick={() => setActiveTab(tab)}
                      >
                        {tab === "all" ? "All" : tab === "your-recipes" ? "Your Recipes" : "Collections"}
                      </button>
                    </li>
                  ))}
                </ul>

                <div className="tab-content w-100">
                  {activeTab === "all" && (
                    <div className="tab-pane active">
                      {renderCards(
                        allRecipes,
                        "Loading all your recipes...",
                        "Error loading data.",
                        "No recipes to display in “All”."
                      )}
                    </div>
                  )}
                  {activeTab === "your-recipes" && (
                    <div className="tab-pane active">
                      {renderCards(
                        recipeItemsRaw,
                        "Loading your personal recipes...",
                        "Error loading data.",
                        "You don't have any personal recipes yet."
                      )}
                    </div>
                  )}
                  {activeTab === "collections" && (
                    <div className="tab-pane active">
                      {renderCards(
                        collectionItemsRaw,
                        "Loading your collections...",
                        "Error loading data.",
                        "You have no items in your collection."
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-12 col-md-3 right-profile">
              <div className="d-grid row-gap-5 b-grids-right h-100">
                <RightMenu />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};