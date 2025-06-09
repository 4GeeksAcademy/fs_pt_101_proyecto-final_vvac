import { useNavigate, useParams} from "react-router-dom";
import { useEffect} from "react";

//hooks
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

//services
import recipeServices from "../services/recetea_API/recipeServices.js"

//icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBook } from '@fortawesome/free-solid-svg-icons'
import { faSquareShareNodes } from '@fortawesome/free-solid-svg-icons'
import { faCartPlus } from '@fortawesome/free-solid-svg-icons'
import { faCalendarDays } from '@fortawesome/free-solid-svg-icons'
import { faClock } from '@fortawesome/free-regular-svg-icons'
import { faUtensils } from '@fortawesome/free-solid-svg-icons'
import { faUser } from '@fortawesome/free-solid-svg-icons'
import { LikeButton } from '../components/likeButton.jsx';

export const RecipeDetails = () => {

    const {store, dispatch} = useGlobalReducer();
    
    const { id } = useParams();
    const title = store.recipe?.title;
    const portions = store.recipe?.portions;

    const formattedDate = new Date(store.recipe?.published).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });

    const splitSteps = (steps) => {
        if (!steps) return [];

        let parsedSteps;

        try {
            parsedSteps = JSON.parse(steps);
        } catch (e) {
            parsedSteps = steps; // If parsing fails, treat it as a plain string
        }
        // If parsedSteps is an array, join it into a single string
        if (Array.isArray(parsedSteps)) {
            return parsedSteps.map(step => step.trim()).filter(step => step.length > 0);
        }

        return steps
            .split(/(?<=[.?!])\s+(?=[A-Z])|(?:\r?\n|^\d+[\.\)]|[-•]|\bStep\s*\d+:?)/gm)
            .map(step => step.trim())
            .filter(step => step.length > 0);
    };

    const stepsArray = splitSteps(store.recipe?.steps);    

    // Loops through the ingredients nutricional values and stores it to return the total of each
    //If value is null or none will be 0. Otherwise, will provide a sum of the values stored.
    const totalNutrition = store.recipe?.ingredients
    ? store.recipe.ingredients.reduce(
        (acc, item) => {
            acc.calories += item.calories || 0;
            acc.fat += item.fat || 0;
            acc.saturated_fat += item.saturated_fat || 0;
            acc.carbs += item.carbs || 0;
            acc.sugars += item.sugars || 0;
            acc.fiber += item.fiber || 0;
            acc.protein += item.protein || 0;
            acc.salt += item.salt || 0;
            acc.sodium += item.sodium || 0;
            return acc;
        },
        { 
            calories: 0, 
            fat: 0, 
            saturated_fat: 0,
            carbs: 0, 
            sugars: 0, 
            fiber: 0, 
            protein: 0, 
            salt: 0, 
            sodium: 0 
        }
    )
    : { 
        calories: 0, 
        fat: 0, 
        saturated_fat: 0,
        carbs: 0, 
        sugars: 0, 
        fiber: 0, 
        protein: 0, 
        salt: 0, 
        sodium: 0 
    };

    const getOneRecipe = async () => recipeServices.getOneRecipe(id).then(data=>{
        dispatch({type: 'get_one_recipe', payload:data});
    })

    useEffect(() => {
        getOneRecipe();
    }, []);

    return(
        <div className="container-fluid recipe_card_bg1 mx-auto">
            
            <div className="row recipe_card_bg2 my-4 p-4 mt-4">
                <div className="col-12 col-md-6 d-flex mt-2">

                    <div className="card-body">
                        {/* Recipe foto and like button overlayed */}
                        <div className="card bg-dark text-white overflow-auto">

                             {/* We set carousel in case there is more than one image */}
                            {store.recipe?.media?.length > 0 && (
                                <div id="recipeCarousel" className="carousel slide" data-bs-ride="carousel">
                                    <div className="carousel-inner">
                                    {store.recipe.media.map((item, index) => (
                                        <div key={index} className={`carousel-item ${index === 0 ? "active" : ""}`} data-bs-interval="6000">

                                            <img src={item.url} className="img-fluid d-block w-100 recipe_img" alt={`Recipe image ${index + 1}`}/>
                                            
                                        </div>
                                    ))}
                                    </div>
                                    {store.recipe.media.length > 1 && (
                                    <>
                                        {/* Navigation buttons */}
                                        <button className="carousel-control-prev" type="button" data-bs-target="#recipeCarousel" data-bs-slide="prev">
                                            <span className="carousel-control-prev-icon" aria-hidden="true" />
                                            <span className="visually-hidden">Previous</span>
                                        </button>
                                        <button className="carousel-control-next" type="button" data-bs-target="#recipeCarousel" data-bs-slide="next">
                                            <span className="carousel-control-next-icon" aria-hidden="true" />
                                            <span className="visually-hidden">Next</span>
                                        </button>
                                    </>
                                    )}
                                </div>
                            )}

                            <LikeButton recipe_id = {id}/>
                        </div>
                    </div>

                </div>
                <div className="col-12 col-md-6 mt-3 mt-md-0">
                    <div className="row p-2">
                        <div className="col-12">
                            <h1>{title}</h1>
                        </div>
                    </div>

                    <div className="border-bottom my-2 bg-secondary"></div>

                    <div className="row p-2">
                        <div className="col-12">
                            <div className="row text-center">

                                {/* User image profile */}
                                <div className="col-12 col-md-3 d-flex justify-content-center justify-content-md-end">
                                    <img src="https://i.pravatar.cc/400" className="float-start user_img" alt="user_img"/>
                                </div>
                                {/* Username */}
                                <div className="col-12 col-md-6 
                                d-flex mt-2 mt-sm-0 g-0 d-flex 
                                justify-content-center justify-content-md-start">
                                    <h5 className="align-self-end text-start">
                                         @{store.recipe?.username}
                                    </h5>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row p-2 recipe_card_prep my-4 justify-content-around ms-2">

                        {/* Prep time info */}
                        <div className="col-12 col-md-6 justify-content-center prep-border mt-2 mt-md-0 d-flex">
                            <FontAwesomeIcon icon={faClock} className='me-3 fs-3 text-light' />
                            <h6 className='mt-1 text-light fw-bold'>{store.recipe?.prep_time} minutes</h6>
                        </div>

                        {/* difficulty_type info */}
                        <div className="col-12 col-md-6 text-center justify-content-center text-capitalize mt-2 mt-md-0 d-flex">
                            <FontAwesomeIcon icon={faUtensils} className='me-3 fs-3 text-light' />
                            <h6 className='mt-1 text-light'>{store.recipe?.difficulty_type}</h6>
                        </div>

                    </div>

                    {/* All buttons: Shopping list, menu plan, share and add to collection */}
                    <div className="row ps-2">
                        <div className="col-12 d-flex">
                            <div className=" pe-3 fs-2 color_icons border-end border-secondary"><FontAwesomeIcon icon={faBook} /></div>
                            <div className="pe-3 ms-4 fs-2 color_icons border-end border-secondary"><FontAwesomeIcon icon={faSquareShareNodes} /></div>
                            <div className="pe-3 ms-4 fs-2 color_icons border-end border-secondary"><FontAwesomeIcon icon={faCartPlus} /></div>
                            <div className=" ms-4 fs-2 color_icons"><FontAwesomeIcon icon={faCalendarDays} /></div>
                        </div>
                    </div>

                    <div className="border-bottom my-3 bg-secondary"></div>

                    <div className="row">
                        <div className="col-12 text-capitalize">
                            <h6 className="mb-2">Allergens: </h6>
                            <p>{store.recipe?.allergens.join(", ")}</p>
                        </div>
                        <div className="col-12 d-flex">
                            <p className="ms-auto text_published align-self-end">Published on: {formattedDate}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row py-2">

                <div className="col-12 col-md-6 ingredients_bg">
                    
                    <div className="row">
                        <div className="col-12 mb-2 ms-4">
                            <h3>
                                Ingredients
                            </h3>
                        </div>
                    </div>
                        
                    <div className="row m-2">
                        <div className="col-4 col-md-6 d-flex">
                            <FontAwesomeIcon icon={faUser} className='color_icons fs-4'/>

                            <p className="ms-2 me-3 text_ing1 mt-1 color_icons fs-5">
                                {portions}
                            </p>
                        </div>

                        <div className="col-8 col-md-6 text-end">
                            <p className="text_ing1 fs-5 color_icons">
                                {(store.recipe?.total_grams / portions).toFixed(1)}g / portion
                            </p>
                        </div>
                    </div>
                            
                    <div className="row m-2">
                        <div className="col-12">
                            {/* Ingredient list */}
                            <ul>
                                {store.recipe?.ingredients?.map((ing, i) => (
                                    <li key={i} className="m-0 d-flex fs-5">
                                        <p className="text_ing1 me-1" >{ing.quantity} {ing.unit}</p>
                                        <p>of <span className='text-capitalized'>{ing.ingredient_name}</span></p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
                {/* Steps of the recipe */}
                <div className="col-12 col-md-6 p-4 steps_bg g-0 mb-2">
                    <div className="row m-2">
                        <div className="col-12">
                            <h3>Steps</h3>
                        </div>
                    </div>
                    <div className="row m-2">
                        <div className="col-12">
                            <ul className="list-group list-group-flush">
                                {stepsArray.map((step, i) => (
                                    <li key={i} className="list-group-item steps_bg mb-2 text_steps text-light fs-5">
                                        {step.trim()}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-12 col-md-6">{/* Nutricional table */}
                    <div className="card p-2 ms-auto my-3 my-md-0 mt-md-3">
                        <div className="card-body">
                            <div className="card-title nutricional_title">
                                <h5 className='fs-2'>Nutricional Vaue</h5>
                            </div>

                            <div className="border-bottom my-2 bg-secondary my-3"></div>
                            
                            <ul className="list-group list-group-flush">
                                <li className="text-end text-danger fw-bold fst-italic m-1 fs-4">
                                    {(totalNutrition.calories / portions).toFixed(0)} Kcal
                                </li>
                                <div className="row g-0 mt-3 fs-5">
                                    <div className="col-12 col-md-6">
                                    <li className="list-group-item bg-light d-flex justify-content-between">
                                        <span className="fw-bold">Total carbs:</span>
                                        {(totalNutrition.carbs / portions).toFixed(1)}
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between">
                                        <span className="fw-bold">Total fat:</span>
                                        {(totalNutrition.fat / portions).toFixed(1)}
                                    </li>
                                    <li className="list-group-item bg-light d-flex justify-content-between">
                                        <span className="fw-bold">Saturated fat:</span>
                                        {(totalNutrition.saturated_fat / portions).toFixed(1)}
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between">
                                        <span className="fw-bold">Sugars:</span>
                                        {(totalNutrition.sugars / portions).toFixed(1)}
                                    </li>
                                    </div>
                                    <div className="col-12 col-md-6">
                                    <li className="list-group-item bg-light d-flex justify-content-between">
                                        <span className="fw-bold">Fiber:</span>
                                        {(totalNutrition.fiber / portions).toFixed(1)}
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between">
                                        <span className="fw-bold">Protein:</span>
                                        {(totalNutrition.protein / portions).toFixed(1)}
                                    </li>
                                    <li className="list-group-item bg-light d-flex justify-content-between">
                                        <span className="fw-bold">Salt:</span>
                                        {(totalNutrition.salt / portions).toFixed(2)}
                                    </li>
                                    <li className="list-group-item d-flex justify-content-between">
                                        <span className="fw-bold">Sodium:</span>
                                        {(totalNutrition.sodium / portions).toFixed(2)}
                                    </li>
                                    </div>
                                </div>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                COMMENTS WILL BE ANOTHER COMPONENT
            </div>
            <div>
                Sugerencias
            </div>

        </div>
    );
}