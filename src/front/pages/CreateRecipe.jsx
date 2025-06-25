import { useState } from "react";
import { useNavigate } from "react-router-dom";

//hooks
import useGlobalReducer from "../hooks/useGlobalReducer";

//services
import recipeServices from "../services/recetea_API/recipeServices";
import mediaServices from "../services/recetea_API/mediaServices";

//components
import { TurnHome } from "../components/buttons/TurnHome";
import { LinksMenu } from "../components/LinksMenu";
import { AddRecipeMedia } from "../components/addRecipeMedia";

export const CreateRecipe = () => {

    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate()

    const difficultyOptions = ["Easy", "Moderate", "Hard"];
    const [images, setImages] = useState([]);

    const [recipe, setRecipe] = useState({
        title: "",
        difficulty_type: "",
        portions: 0,
        prep_time: 0,
        ingredients: [
            { id: 0, name: "", quantity: 0, unit: "" }
        ],
        steps: [{ id: 0, description: "" }],
        media: []
    });

    //handle changes of recipe details and converts to number the string 
    // of the portions and prep_time
    const handleChange = (e) => {
        const { name, value } = e.target;
        setRecipe({
            ...recipe,
            [name]: name === "portions" || name === "prep_time" ? Number(value) : value
        });
    };

    //handle changes of ingredientss details, converts to number quatity string
    const handleIngredientsChange = (index, e) => {
        const { name, value } = e.target;
        const updated = [...recipe.ingredients];
        updated[index][name] = (name === "quantity") ? Number(value) : value;
        setRecipe(prev => ({ ...prev, ingredients: updated }));
    };

    //handles changes of steps
    const handleStepChange = (index, e) => {
        const updated = [...recipe.steps];
        updated[index][e.target.name] = e.target.value;
        setRecipe(prev => ({ ...prev, steps: updated }));
    };

    //this adds the ingredientss to the list
    const addIngredients = () => {
        const newId = Math.max(0, ...recipe.ingredients.map(i => i.id)) + 1;
        setRecipe(prev => ({
            ...prev,
            ingredients: [...prev.ingredients, { id: newId, name: "", quantity: 0, unit: "" }]
        }));
    };

    //this wil remove ingredientss from list
    const removeIngredients = idToRemove => {
        setRecipe(prev => ({
            ...prev,
            ingredients: prev.ingredients.filter(i => i.id !== idToRemove)
        }));
    };

    //adds steps to list
    const addStep = () => {
        const newId = Math.max(0, ...recipe.steps.map(s => s.id)) + 1;
        setRecipe(prev => ({
            ...prev,
            steps: [...prev.steps, { id: newId, description: "" }]
        }));
    };

    //this will remove steps
    const removeStep = idToRemove => {
        setRecipe(prev => ({
            ...prev,
            steps: prev.steps.filter(s => s.id !== idToRemove)
        }));
    };

    //this will delete full details of the form to start from scratch
    const handleDiscard = () => {
        if (window.confirm("Discard all changes?")) {
            setRecipe({
                title: "",
                difficulty_type: "",
                portions: 0,
                prep_time: 0,
                ingredients: [{ id: 0, name: "", quantity: 0, unit: "" }],
                steps: [{ id: 0, description: "" }]
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // 1. Crear receta sin media (media vacío)
            const response = await recipeServices.createRecipe({
                ...recipe,
                media: [],
            });
            const newRecipeID = response.recipe_id;

            console.log(newRecipeID);


            // 2. Subir imágenes (ya sea URL o base64)
            for (const img of images) {
                if (img.url && img.url.trim()) {
                    console.log("Enviando URL:", img.url.trim());
                    const data = await mediaServices.addMediaToRecipe(newRecipeID, {
                        type_media: "image",
                        url: img.url.trim(),
                    });
                    console.log("Respuesta backend media:", data);
                }else{
                    alert("Could not post the image, please try again.");
                }
            }


            //call it here because the recipe image is also added
            dispatch({ type: "create_recipe", payload:response});

            //go back to collection to see their recipe on their my recipes list
            navigate("/your-collection")

        } catch (err) {
            console.error(err);
            alert("Could not post the recipe, please try again.");
        }
    };


    return (
        <div className="rct-create-recipe-wrapper fs-5">
            <div className="rct-create-recipe-container container-fluid">
                <div className="row g-0">
                    <div className="col-12 col-md-3 rct-left-sidebar">
                        {/* ——— TOGGLE (solo en xs y sm) ——— */}
                                <button
                                    className="btn btn-outline-secondary d-md-none mb-3"
                                    type="button"
                                    data-bs-toggle="collapse"
                                    data-bs-target="#sidebarMenu"
                                    aria-controls="sidebarMenu"
                                    aria-expanded="false"
                                    aria-label="Toggle navigation"
                                >
                                    <i className="fa fa-bars"></i>
                                </button>

                                {/* ——— SIDEBAR: colapsa en xs/sm, siempre abierto en md+ ——— */}
                                <div className="collapse d-md-block" id="sidebarMenu">
                                    <div className="d-flex flex-column flex-lg-row align-items-start gap-3 p-3">
                                        <LinksMenu />
                                    </div>
                                </div>
                            </div>

                    <div className="col-12 col-md-9 rct-main-content">
                        <form className="rct-recipe-form-area d-flex flex-column mb-3" onSubmit={handleSubmit}>
                            {/* Top bar */}
                            <AddRecipeMedia images={images} setImages={setImages} />

                            <div className="rct-top-section row g-0 mb-4">
                                <div className="col-12 col-md-6 d-flex justify-content-end mt-3 mt-md-0 ms-auto">
                                    <button type="button" className="btn btn-outline-danger me-2 fs-4" 
                                    onClick={() => navigate("/your-collection")}>
                                        Cancel
                                    </button>
                                    <button type="button" className="btn btn-outline-secondary me-2 fs-4" 
                                    onClick={handleDiscard}>
                                        Clear
                                    </button>
                                    <button type="submit" className="btn btn-success fs-4">Publish</button>
                                </div>
                            </div>

                            {/* Header */}
                            <div className="mb-4">
                                <input
                                    type="text"
                                    className="form-control form-control-lg mb-2"
                                    name="title"
                                    required
                                    autoFocus
                                    placeholder="Title: My favorite pumpkin cream"
                                    value={recipe.title}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Details */}
                            <div className="row g-3 mb-4">
                                <div className="col-md-4">
                                    <label className="form-label">Servings</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        name="portions"
                                        value={recipe.portions}
                                        onChange={handleChange}
                                        min="1"
                                        required
                                    />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Difficulty</label>
                                    <select
                                        className="form-select"
                                        name="difficulty_type"
                                        value={recipe.difficulty_type}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Difficulty</option>
                                        {difficultyOptions.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Prep Time (min)</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        name="prep_time"
                                        value={recipe.prep_time}
                                        onChange={handleChange}
                                        min="0"
                                    />
                                </div>
                            </div>

                            {/* Ingredientss */}
                            <div className="mb-4">
                                <h3>Ingredientss</h3>
                                {recipe.ingredients.map((ing, idx) => (
                                    <div key={ing.id} className="d-flex mb-2">
                                        <input
                                            type="number"
                                            className="form-control me-2"
                                            name="quantity"
                                            placeholder="Cantidad"
                                            value={ing.quantity}
                                            onChange={(e) => handleIngredientsChange(idx, e)}
                                        />
                                        <input
                                            type="text"
                                            className="form-control me-2"
                                            name="unit"
                                            placeholder="Unidad"
                                            value={ing.unit}
                                            onChange={(e) => handleIngredientsChange(idx, e)}
                                        />
                                        <input
                                            type="text"
                                            className="form-control me-2"
                                            name="name"
                                            placeholder="Ej: Harina de trigo"
                                            value={ing.name}
                                            onChange={(e) => handleIngredientsChange(idx, e)}
                                        />
                                        {recipe.ingredients.length > 1 && (
                                            <button type="button" className="btn btn-outline-danger" onClick={() => removeIngredients(ing.id)}>
                                                <i className="fa-solid fa-minus"></i>
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button type="button" className="btn btn-outline-success p-2 d-flex" onClick={addIngredients}>
                                    <i className="fa-solid fa-plus mx-2 mt-2"></i>
                                    <p className="fs-5">Add ingredientss</p>
                                </button>
                            </div>

                            {/* Steps */}
                            <div className="mb-4">
                                <h3>Steps</h3>
                                {recipe.steps.map((step, idx) => (
                                    <div key={step.id} className="mb-3">
                                        <label className="form-label">Step {idx + 1}</label>
                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            name="description"
                                            value={step.description}
                                            onChange={(e) => handleStepChange(idx, e)}
                                        />
                                        {recipe.steps.length > 1 && (
                                            <button type="button" className="btn btn-sm btn-outline-danger mt-1 d-flex" onClick={() => removeStep(step.id)}>
                                                <i className="fa-solid fa-trash mt-2 mx-2"></i>
                                                 <p className="fs-5">Remove</p>
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button type="button" className="btn btn-outline-success d-flex" onClick={addStep}>
                                    <i className="fa-solid fa-plus mt-2 mx-2"></i>
                                    <p className="fs-5">Add Steps</p>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
