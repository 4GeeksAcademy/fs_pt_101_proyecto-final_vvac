import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// hooks
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

//services
import recipeServices from "../services/recetea_API/recipeServices.js";
import collectionServices from "../services/recetea_API/collectionServices.js";

//components
import { EditRecipeButtons } from "../components/buttons/editRecipeButtons.jsx";
import { DeleteCollectionBtn } from "../components/buttons/deleteCollectionBtn.jsx";
import { TurnHome } from "../components/buttons/TurnHome";
import { LinksMenu } from "../components/LinksMenu";
import { RightMenu } from "../components/RightMenu";
import { UserRecipeCard } from "../components/UserRecipeCard.jsx";

export const MyRecipes = () => {
    const { dispatch, store } = useGlobalReducer();
    const [activeTab, setActiveTab] = useState("all");
    const [loadedTabs, setLoadedTabs] = useState({}); // track loaded tabs

    // Combine user recipes posted and collections
    const allRecipesMap = new Map();
    store.user_recipes?.forEach((r) => allRecipesMap.set(r.id, r));
    (Array.isArray(store.collections) ? store.collections : []).forEach((c) => {
        if (!allRecipesMap.has(c.id)) allRecipesMap.set(c.id, c);
    });
    const allCombined = Array.from(allRecipesMap.values());


    //makes published data user friendly
    const formatPublishedDate = (dateStr) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
    };

    const loadUserCollections = async () => {
        try {
            const data = await collectionServices.getUserCollections();
            if (data) {
                const collections = Array.isArray(data) ? data : data.data || [];
                dispatch({ type: "get_user_collection", payload: collections });
                setLoadedTabs((prev) => ({ ...prev, collections: true }));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const loadUserRecipes = async () => {
        try {
            const data = await recipeServices.getAllUserRecipes();
            if (data && (Array.isArray(data) || data.recipes)) {
                const recipes = Array.isArray(data) ? data : data.recipes;
                dispatch({ type: "get_user_recipes", payload: recipes });
                setLoadedTabs((prev) => ({ ...prev, "your-recipes": true }));
            }
        } catch (err) {
            console.error(err);
        }
    };


    // Load data from store to avoid slow the page
    useEffect(() => {
        //will load only the tab we open to make is less slow
        if (activeTab === "your-recipes" && !loadedTabs["your-recipes"]) {
            loadUserRecipes();
        }

        if (activeTab === "collections" && !loadedTabs.collections) {
            loadUserCollections();
        }

    }, [activeTab, dispatch, loadedTabs]);

    return (
        <div className="main-row-all">
            <div className="profile-container">
                <div className="container text-center sidebar-left-profile">
                    <div className="row align-items-start">
                        <div className="col-12 col-md-3">
                            <div className="d-flex align-items-start">
                                <TurnHome />
                                <LinksMenu />
                            </div>
                        </div>

                        <div className="col-12 col-md-9 main-column-content">
                            <div className="d-flex align-items-start flex-column mb-3 edit-perfil">
                                <h2 className="mb-3">Collection</h2>
                                <p>All, Your Recipes & Collections</p>

                                <ul className="nav nav-tabs">
                                    {["all", "your-recipes", "collections"].map((tab) => (
                                        <li className="nav-item" key={tab}>
                                            <button
                                                className={`nav-link ${activeTab === tab ? "active" : ""}`}
                                                onClick={() => setActiveTab(tab)}
                                            >
                                                {tab === "all"
                                                    ? "All"
                                                    : tab === "your-recipes"
                                                        ? "Your Recipes"
                                                        : "Collections"}
                                            </button>
                                        </li>
                                    ))}
                                </ul>

                                <div className="tab-content w-100">
                                    {activeTab === "all" && (
                                        <div className="tab-pane active">
                                            <div
                                                style={{ maxHeight: "70vh", overflowY: "auto" }}
                                                className="cards-grid d-flex flex-wrap justify-content-center"
                                            >
                                                {allCombined.map((recipe) => (
                                                    <UserRecipeCard
                                                        key={"a-" + recipe.id}
                                                        recipe_id={recipe.id}
                                                        url={recipe.media?.[0]?.url}
                                                        name={recipe.title}
                                                        published={formatPublishedDate(recipe.published) || ""}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {activeTab === "your-recipes" && (
                                        <div className="tab-pane active">
                                            <div
                                                style={{ maxHeight: "70vh", overflowY: "auto" }}
                                                className="cards-grid d-flex flex-wrap justify-content-center"
                                            >
                                                {store.user_recipes?.map((recipe) => {
                                                    return (
                                                        <UserRecipeCard
                                                            key={"u-" + recipe.id}
                                                            recipe_id={recipe.id}
                                                            url={recipe.media?.[0]?.url}
                                                            name={recipe.title}
                                                            published={formatPublishedDate(recipe.published) || ""}
                                                        >
                                                            <EditRecipeButtons
                                                                recipe_id={recipe.id}
                                                                loadUserRecipes = {loadUserRecipes}
                                                            />
                                                        </UserRecipeCard>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}
                                    {activeTab === "collections" && (
                                        <div className="tab-pane active">
                                            <div
                                                style={{ maxHeight: "70vh", overflowY: "auto" }}
                                                className="cards-grid d-flex flex-wrap justify-content-center"
                                            >
                                                {(Array.isArray(store.collections) ? store.collections : []).map((recipe) => (
                                                    <UserRecipeCard
                                                        key={"c-" + recipe.recipe_id}
                                                        recipe_id={recipe.recipe_id}
                                                        url={recipe.recipe_media?.[0]?.url}
                                                        name={recipe.recipe_title}
                                                        published={formatPublishedDate(recipe.published) || ""}>
                                                        <DeleteCollectionBtn 
                                                        recipe_id={recipe.recipe_id}
                                                        loadUserCollections={loadUserCollections}/>
                                                    </UserRecipeCard>
                                                ))}
                                            </div>
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
