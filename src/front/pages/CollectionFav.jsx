import { useState, useEffect } from "react"
import { LinksMenu } from "../components/LinksMenu"
import { RightMenu } from "../components/RightMenu"
import { RecipeCard } from "../components/RecipeCard"
import useGlobalReducer from "../hooks/useGlobalReducer.jsx"
import recipeServices from "../services/recetea_API/recipeServices.js"
import collectionServices from "../services/recetea_API/collectionServices.js"

export const CollectionFav = () => {

    const { store, dispatch } = useGlobalReducer();

    //Datos para all, your recipes y saved

    const [activeTab, setActiveTab] = useState("all");
    const [allItems, setAllItems] = useState([]);
    const [recipeItems, setRecipeItems] = useState([]);
    const [savedItems, setSavedItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null)



    // Pendiente Fetch API en collectionServices....?

    const fetchAllItems = async () => {
        setLoading(true);
        setError(null);
        try {
            //petición con token y CORS, funcionará??

            const data = await collectionServices.getUserCollections();


            // const resp = await recipeServices.getAllRecipes();

            //Si la API devuelve correctamente...:

            const arr = Array.isArray(data.collection)
                ? data.collection
                : data.collection || [];
            setAllItems(arr)
            dispatch({ type: 'get_user_collections', payload: arr });
            // const arr = Array.isArray(resp) ? resp : resp.recipes || [];
            // const formatted = arr.map((p) => ({
            // code: p._id || p.code,
            // product_name: p.tittle || p.name,
            // image_front_small_url: p.media?.[0]?.url || "",
            // nutrition_grades: p.nutri_score || null,


            // setAllItems(formatted);
            // // Opcional: despacha al store global
            // dispatch({ type: "SET_ALL_RECIPES", payload: formatted });
        } catch (err) {
            console.error(err);
            setError("Failed to LOAD 'All recipes'!");
        } finally {
            setLoading(false);
        }
    };


    //-----------------------------------------
    //Recuperar "savedItems" de localStorage + guardarlos :
    //-----------------------------------------

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem("savedRecipes")) || []; setSavedItems(saved);
        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!SE HA RECUPERADO DEL LOCALSTORAGEEEEEE (saved)--------------> " + JSON.stringify(saved))
    }, []);

    const toggleSaveItem = (id) => {
        setSavedItems((prev) => {
            let updated;
            if (prev.includes(id)) {
                updated = prev.filter((code) => code !== id);
            } else {
                updated = [...prev, id];
            }
            localStorage.setItem("savedRecipes", JSON.stringify(updated));
            return updated;
        });
    };



    //---------------------------------------------
    //
    // Cargando all / your recipes con useEffect:
    //
    //---------------------------------------------

    useEffect(() => {
        if (activeTab === "all" && allItems.length === 0) {
            fetchAllItems();
        } else if (
            activeTab === "your-recipes" && recipeItems.length === 0
        ) {

            // Para cargar las recetas del usuario: 
            setLoading(true);
            setError(null);
            recipeServices
                .getAllUserRecipes()
                .then((resp) => {
                    console.log("a ver chato....................... " + Array.isArray(resp) + "    ççççç " + JSON.stringify(JSON.parse(resp)))
                    // const arr = Array.isArray(resp) ? resp : resp.recipes || [];
                    const arr = Array.isArray(resp) ? resp : JSON.parse(resp).recipes || [];
                    const formatted = arr.map((r) => ({
                        id: r.recipe_id,
                        name: r.title,
                        imageUrl: r.url?.[0]?.url || "", //Opción para aparecer imagen... Pero no termina de funcionar, pendiente fetch.
                        nutriScore: r.nutri_score || null,
                    }));
                    setRecipeItems(formatted);
                })
                .catch((err) => {
                    console.error(err);
                    setError("Failed to LOAD 'Your recipes'!");
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [activeTab])

    //---------------------------------------------
    //
    // Llamada a cartas renderizadas:
    //
    //---------------------------------------------

    const renderAllCards = () => {
        if (loading) return <p>Please wait, loading recipes...</p>;
        if (error) return <p className="text-danger">{error}</p>;
        if (!allItems.length)
            return <p>Sorry! No recipe found!</p>


        return (
            <div className="cards-grid">
                {allItems?.map((item) => {
                    return (
                        <RecipeCard
                            key={item.code}
                            id={item.code}
                            name={item.product_name || "No name..."}
                            imageUrl={item.image_front_small_url || ""}
                            nutriScore={item.nutrition_grades || null}
                            isSaved={savedItems.includes(item.code)}
                            onToggleSave={toggleSaveItem}
                            onClick={() => { console.log("Clicked detail for", item.code); }}   // PARA INCORPORAR PAGINA DE DETALLE RECETA, pendiente algo como navigate(`/recipe/${item.code}`) 

                        />
                    )
                })}
            </div>
        );
    };

    const renderYourRecipes = () => {
        if (loading) return <p>Please wait, loading YOUR recipes...</p>;
        if (error) return <p className="text-danger">{error}</p>;
        if (!recipeItems.length)
            return <p>Wait! You still have no personal recipe...</p>

        return (
            <div className="cards-grid">
                {recipeItems.map((item) => (
                    <RecipeCard
                        key={item.id}
                        id={item.id}
                        name={item.name}
                        imageUrl={item.imageUrl}
                        nutriScore={item.nutriScore}
                        isSaved={savedItems.includes(item.id)}
                        onToggleSave={toggleSaveItem}
                        onClick={() => { console.log("User recipe detail", item.id); }}  // PARA INCORPORAR PAGINA DE DETALLE RECETA DE USUARIO, pendiente navigate... 
                    />
                ))}
            </div>
        );
    };

    const renderSavedCards = () => {

        const merged = [
            ...allItems.map((i) => ({
                id: i.code,
                name: i.product_name || "Unnamed",
                imageUrl: i.image_front_small_url || "",
                nutriScore: i.nutrition_grades || null,
            })),
            ...recipeItems,
        ];
        const filtered = merged.filter((i) => savedItems.includes(i.id));
        if (!filtered.length)
            return (
                <>
                    <p>You don't have any saved recipes yet. Search "All" or "Your Recipes" and click (ICONO) to save.</p>
                </>
            );

        return (
            <div className="cards-grid">
                {filtered.map((item) => (
                    <RecipeCard
                        key={item.id}
                        id={item.id}
                        name={item.name}
                        imageUrl={item.imageUrl}
                        nutriScore={item.nutriScore}
                        isSaved={true}
                        onToggleSave={toggleSaveItem}
                        onClick={() => console.log("Detail for saved", item.id)}
                    />
                ))}
            </div>
        );
    };



    //--------------------------------------------------------------------
    //
    //FIN cards renderizadas, inicio pagina profile Collection (favorites): 
    //
    //--------------------------------------------------------------------

    return (

        <div className="main-row-all vh-100">

            <div className="profile-container">

                {/* COLUMNA LATERAL IZQ */}

                <div className="container text-center sidebar-left-profile">
                    <div className="row align-items-start">
                        <div className="col-3">

                            <LinksMenu />

                        </div>

                        {/* COLUMNA PRINCIPAL  */}
                        <div className="col-6 main-column-content">

                            <div className="d-flex align-items-start flex-column mb-3 edit-perfil">

                                <h2 className="mb-3">Collection</h2>
                                <p>All, Your Recipes & Saved </p>

                                {/* Nav tabs: */}

                                <ul className="nav nav-tabs ">
                                    <li className="nav-item">
                                        <button className={`nav-link ${activeTab === "all" ? "active" : ""}`} onClick={() => setActiveTab("all")} type="button">All</button>
                                    </li>
                                    <li className="nav-item">
                                        <button className={`nav-link ${activeTab === "your-recipes" ? "active" : ""}`} onClick={() => setActiveTab("your-recipes")} type="button">Your Recipes</button>
                                    </li>
                                    <li className="nav-item">
                                        <button className={`nav-link ${activeTab === "saved" ? "active" : ""}`} onClick={() => setActiveTab("saved")} type="button">Saved</button>
                                    </li>
                                </ul>

                                {/* //Contenido pestaña activa// */}

                                <div className="tab-content">
                                    {activeTab === "all" && (

                                        <div className="tab-pane active">
                                            {renderAllCards()}
                                        </div>

                                    )}

                                    {activeTab === "your-recipes" && (

                                        <div className="tab-pane active">
                                            {renderYourRecipes()}
                                        </div>

                                    )}

                                    {activeTab === "saved" && (

                                        <div className="tab-pane active">
                                            {renderSavedCards()}
                                        </div>

                                    )}



                                </div>



                            </div>
                        </div>


                        {/* COLUMNA LATERAL DERECHA */}
                        <div className="col-3 right-profile">

                            <div className="d-grid row-gap-5 b-grids-right h-100">
                                <RightMenu />

                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}


