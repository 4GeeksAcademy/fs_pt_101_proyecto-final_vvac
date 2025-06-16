import { useNavigate, useParams } from "react-router-dom";
import React, { useEffect, useRef } from "react";

//hooks
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

//services
import recipeServices from "../services/recetea_API/recipeServices.js"

//components
import { LogOut } from "../components/LogOut.jsx";
import { Comments } from "../components/Comments.jsx";
import { NutricionalTable } from "../components/NutricionalTable.jsx";

//buttons
import { LikeButton } from '../components/buttons/likeButton.jsx';
import { ShareButton } from "../components/buttons/shareButton.jsx";
import { CollectionButton } from "../components/buttons/collectionButton.jsx";

//icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCartPlus } from '@fortawesome/free-solid-svg-icons'
import { faCalendarDays } from '@fortawesome/free-solid-svg-icons'
import { faClock } from '@fortawesome/free-regular-svg-icons'
import { faUtensils } from '@fortawesome/free-solid-svg-icons'
import { faUser } from '@fortawesome/free-solid-svg-icons'
import collectionServices from "../services/recetea_API/collectionServices.js"

export const RecipeDetails = () => {

    const { store, dispatch } = useGlobalReducer();
    const printRef = useRef();

    const { id } = useParams();
    const portions = store.recipe?.portions;

    // Fetch of the recipe by recipe_id
    const getOneRecipe = async () => recipeServices.getOneRecipe(id).then(data => {
        dispatch({ type: 'get_one_recipe', payload: data });
    })   
    
    //Generats random color
    function getRandomColor() {
        return Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    }

    //Gets brightness based on random color
    function getBrightness(hexColor) {
        const r = parseInt(hexColor.substring(0, 2), 16);
        const g = parseInt(hexColor.substring(2, 4), 16);
        const b = parseInt(hexColor.substring(4, 6), 16);
        return (299 * r + 587 * g + 114 * b) / 1000;
    }

    //Takes first letter from username
    const firstLetter = store.recipe?.username?.charAt(0).toUpperCase() || "R"

    //check bringhtness to stablish the letter color
    const textColor = getBrightness(getRandomColor()) < 125 ? 'fff' : '000';

    //creates place holder image with random background and letter
    const placeHolderImage = `https://ui-avatars.com/api/?name=${firstLetter}&background=random&color=${textColor}`

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

    useEffect(() => {
        getOneRecipe();
    }, [id]);

    return (
        <div className="container-fluid recipe_card_bg1" ref={printRef}>
            <LogOut />
            <div className="row recipe_card_bg2 my-4 -2 p-4 mt-4">

                <div className="col-12 col-md-12 col-lg-7 col-xl-7 d-flex mt-2 my-4 justify-content-center">

                    {/* Recipe foto and like button overlayed */}
                    <div className="card bg-dark text-white overflow-auto recipe_img border-0">

                        {/* We set carousel in case there is more than one image */}
                        {store.recipe?.media?.length > 0 && (
                            <div id="recipeCarousel" className="carousel slide" data-bs-ride="carousel">
                                <div className="carousel-inner">
                                    {store.recipe.media.map((item, index) => (
                                        <div key={index} 
                                        className={`carousel-item ${index === 0 ? "active" : ""}`} 
                                        data-bs-interval="6000"> {/*Set timer carousel*/}

                                            <img src={item.url}
                                                className="img-fluid text-center d-block w-100 recipe_img"
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
                <div className="col-12 col-md-12 col-lg-5 col-xl-5 mt-3 mt-md-0">
                    <div className="row p-2">
                        <div className="col-12">
                            <h1 className="fs-1">{store.recipe?.title}</h1>
                        </div>
                    </div>

                    <div className="border-bottom my-2 bg-secondary mx-auto"></div>

                    <div className="row text-center p-2">

                        {/* User image profile */}
                        <div className="col-12 col-md-12 col-lg-3 col-xl-2
                        g-0 my-sm-1 d-flex justify-content-center justify-content-lg-end">
                            <img src={store.recipe?.user_photo || placeHolderImage} className="float-start user_img" alt="user_img" />
                        </div>

                        {/* Username */}
                        <div className="col-12 col-md-12 col-lg-8 col-lx-10
                        ms-sm-2 my-sm-1 d-flex mt-2 mt-sm-0 d-flex 
                        justify-content-center justify-content-lg-start">
                            <h5 className="align-self-end text-center text-md-start fs-3">
                                @{store.recipe?.username}
                            </h5>
                        </div>
                        
                    </div>

                    <div className="row p-1 my-4 ms-2 
                    recipe_card_prep justify-content-around text-light">

                        {/* Prep time info */}
                        <div className="col-12 col-md-12 col-lg-6 
                        justify-content-center prep_border p-2 p-md-2 p-lg-1 d-flex">
                            <FontAwesomeIcon icon={faClock} className='me-3 mt-1 icon_prep_type' />
                            <p className='pt-2 text_prep_type'>{store.recipe?.prep_time} minutes</p>
                        </div>

                        {/* difficulty_type info */}
                        <div className="col-12 col-md-12 col-lg-6 
                        justify-content-center text-capitalized p-1 p-md-2 p-lg-1 d-flex">
                            <FontAwesomeIcon icon={faUtensils} className='me-3 mt-1 icon_prep_type' />
                            <p className='pt-2 text_prep_type'>{store.recipe?.difficulty_type}</p>
                        </div>

                    </div>

                    {/* All buttons: Shopping list, menu plan, share and add to collection */}
                    <div className="row ps-2">
                        <div className="col-12 d-flex">
                            <CollectionButton recipe_id={id}/>
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
                            <h5 className="mb-2">Allergens: </h5>
                            <p className="fs-5">{store.recipe?.allergens.join(", ")}</p>
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

                <div className="col-12 col-md-12 col-lg-5 ingredients_bg p-3 mt-3 mx-auto">

                    <div className="row m-1">
                        <div className="col-12 mb-3 mb-md-2 ms-3">
                            <h4 className="title_ing_steps text-center text-lg-start">
                                Ingredients
                            </h4>
                        </div>
                    </div>

                    <div className="row m-2">
                        <div className="col-10 d-flex justify-content-around justify-content-lg-between mx-auto">

                            <div className="color_icons d-flex">
                                <FontAwesomeIcon icon={faUser} className='color_icons fs-4 me-2' />
                                <h1 className="text_ing1 p-0 mt-2 align-self-end">{portions}</h1>
                            </div>

                            <div className="mt-2 color_icons">
                                <p className="text_ing1">{(store.recipe?.total_grams / portions).toFixed(1)}g / portion</p>
                            </div>
                        </div>
                    </div>

                    <div className="row my-4 m-3">
                        <div className="col-12 mx-auto">
                            {/* Ingredient list */}
                            <ul>
                                {store.recipe?.ingredients?.map((ing, i) => (
                                    <li key={i} className="m-0 p-0 d-flex justify-content-center justify-content-lg-start">
                                        <p className="text_ing1 me-2" >{ing.quantity} {ing.unit}</p>
                                        <p className="text_ing_steps">of <span className='text-capitapzed'>{ing.ingredient_name}</span></p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
                {/* Steps of the recipe */}
                <div className="col-12 col-lg-6 p-4 steps_bg g-0 mb-2">
                    <div className="row m-2">
                        <div className="col-12">
                            <h4 className="title_ing_steps text-center text-lg-start">Steps</h4>
                        </div>
                    </div>
                    <div className="row m-2">
                        <div className="col-12">
                            <ul className="list-group list-group-flush">
                                {stepsArray.map((step, i) => (
                                    <li key={i} className="list-group-item py-3 text-light text-center text-lg-start 
                                    steps_bg border_steps text_ing_steps">
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

            <Comments recipe_id={id} />

            <div>
                Sugerencias
            </div>

        </div>
    );
}