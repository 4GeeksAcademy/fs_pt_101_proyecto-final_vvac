import { useNavigate, useParams } from "react-router-dom";
import React, { useEffect, useRef } from "react";

//hooks
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

//services
import recipeServices from "../services/recetea_API/recipeServices.js"

//icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBook } from '@fortawesome/free-solid-svg-icons'
import { faCartPlus } from '@fortawesome/free-solid-svg-icons'
import { faCalendarDays } from '@fortawesome/free-solid-svg-icons'
import { faClock } from '@fortawesome/free-regular-svg-icons'
import { faUtensils } from '@fortawesome/free-solid-svg-icons'
import { faUser } from '@fortawesome/free-solid-svg-icons'
import { LikeButton } from '../components/buttons/likeButton.jsx';
import { LogOut } from "../components/LogOut.jsx";
import { ShareButton } from "../components/buttons/shareButton.jsx";
import { NutricionalTable } from "../components/NutricionalTable.jsx";

export const RecipeDetails = () => {

    const { store, dispatch } = useGlobalReducer();
    const printRef = useRef();

    const { id } = useParams();
    const portions = store.recipe?.portions;

    // Convert published date into more user friendly
    const formattedDate = new Date(store.recipe?.published).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });

    // This will split the steps depending on the separation used
    //We should set on create recipe front end to store with a simple method easier to split later
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

    // Fetch of the recipe by recipe_id
    const getOneRecipe = async () => recipeServices.getOneRecipe(id).then(data => {
        dispatch({ type: 'get_one_recipe', payload: data });
    })

    console.log(store.user?.token);
    console.log("My store.user: ", store.user);
    

    useEffect(() => {
        getOneRecipe();
    }, [id]);

    return (
        <div className="container-fluid recipe_card_bg1 mx-auto" ref={printRef}>
            <LogOut />
            <div className="row recipe_card_bg2 my-4 p-4 mt-4 ">

                <div className="col-12 col-md-5 d-flex mt-2">

                    {/* Recipe foto and like button overlayed */}
                    <div className="card bg-dark text-white overflow-auto recipe_img border-0">

                        {/* We set carousel in case there is more than one image */}
                        {store.recipe?.media?.length > 0 && (
                            <div id="recipeCarousel" className="carousel slide" data-bs-ride="carousel">
                                <div className="carousel-inner">
                                    {store.recipe.media.map((item, index) => (
                                        <div key={index} className={`carousel-item ${index === 0 ? "active" : ""}`} data-bs-interval="6000">

                                            <img src={item.url}
                                                className="img-fluid d-block w-100 recipe_img"
                                                alt={`Recipe image ${index + 1}`}

                                            />

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

                        <LikeButton recipe_id={id} />
                    </div>

                </div>
                <div className="col-12 col-md-6 mt-3 mt-md-0">
                    <div className="row p-2">
                        <div className="col-12">
                            <h3>{store.recipe?.title}</h3>
                        </div>
                    </div>

                    <div className="border-bottom my-2 bg-secondary"></div>

                    <div className="row p-2">
                        <div className="col-12">
                            <div className="row text-center">

                                {/* User image profile */}
                                <div className="col-12 col-md-3 d-flex justify-content-center justify-content-md-end">
                                    <img src="https://i.pravatar.cc/400" className="float-start user_img" alt="user_img" />
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
                            <FontAwesomeIcon icon={faClock} className='me-3 fs-4 text-light' />
                            <h6 className='mt-1 text-light fw-bold'>{store.recipe?.prep_time} minutes</h6>
                        </div>

                        {/* difficulty_type info */}
                        <div className="col-12 col-md-6 text-center justify-content-center text-capitalize mt-2 mt-md-0 d-flex">
                            <FontAwesomeIcon icon={faUtensils} className='me-3 fs-4 text-light' />
                            <h6 className='mt-1 text-light'>{store.recipe?.difficulty_type}</h6>
                        </div>

                    </div>

                    {/* All buttons: Shopping list, menu plan, share and add to collection */}
                    <div className="row ps-2">
                        <div className="col-12 d-flex">
                            <div className=" pe-3 fs-2 color_icons border-end border-secondary"><FontAwesomeIcon icon={faBook} /></div>
                            <ShareButton
                                text="Check this out!"
                                url={window.location.href}
                                printRef={printRef}
                                recipe_id={id} />
                            <div className="pe-3 ms-4 fs-2 color_icons border-end border-secondary"><FontAwesomeIcon icon={faCartPlus} /></div>
                            <div className=" ms-4 fs-2 color_icons"><FontAwesomeIcon icon={faCalendarDays} /></div>
                        </div>
                    </div>

                    <div className="border-bottom my-2 bg-secondary"></div>

                    <div className="row">
                        {store.user?.user_id ? 
                        <div className="col-12 text-capitalize mt-1">
                            <h6 className="mb-2">Allergens: </h6>
                            <p>{store.recipe?.allergens.join(", ")}</p>
                        </div>
                        :
                        ""}
                        <div className="col-12 d-flex">
                            <p className="ms-auto text_published align-self-end">Published on: {formattedDate}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row py-2">

                <div className="col-12 col-md-6 ingredients_bg p-3">

                    <div className="row m-1">
                        <div className="col-12 mb-2 ms-3">
                            <h4>
                                Ingredients
                            </h4>
                        </div>
                    </div>

                    <div className="row m-2">
                        <div className="col-4 col-md-6 d-flex">
                            <FontAwesomeIcon icon={faUser} className='color_icons fs-5 ms-4' />

                            <p className="ms-2 me-3 text_ing1 mt-1 color_icons fs-6">
                                {portions}
                            </p>
                        </div>

                        <div className="col-8 col-md-6 text-end">
                            <p className="text_ing1 fs-6 color_icons me-3">
                                {(store.recipe?.total_grams / portions).toFixed(1)}g / portion
                            </p>
                        </div>
                    </div>

                    <div className="row m-3">
                        <div className="col-12">
                            {/* Ingredient list */}
                            <ul>
                                {store.recipe?.ingredients?.map((ing, i) => (
                                    <li key={i} className="m-0 d-flex fs-6">
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
                            <h4>Steps</h4>
                        </div>
                    </div>
                    <div className="row m-2">
                        <div className="col-12">
                            <ul className="list-group list-group-flush">
                                {stepsArray.map((step, i) => (
                                    <li key={i} className="list-group-item steps_bg mb-2 text_steps text-light fs-6">
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

                    {store.user?.user_id ? <NutricionalTable /> : ""}

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