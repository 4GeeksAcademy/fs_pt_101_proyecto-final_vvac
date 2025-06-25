 import { useNavigate, useParams } from "react-router-dom";
import React, { useEffect, useRef } from "react";

//hooks
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

//services
import recipeServices from "../services/recetea_API/recipeServices.js"

//components
import { Comments } from "../components/Comments.jsx";
import { NutricionalTable } from "../components/NutricionalTable.jsx";
import { RecipeCard } from "../components/RecipeCard.jsx";

//buttons
import { LikeButton } from '../components/buttons/likeButton.jsx';
import { ShareButton } from "../components/buttons/shareButton.jsx";
import { CollectionButton } from "../components/buttons/collectionButton.jsx";
import { AddToMealPlanButton } from "../components/buttons/AddToMealPlanButton.jsx";
import { AddIngredientsToListButton } from "../components/buttons/AddIngredientsToListButton.jsx";


//icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUtensils, faUser } from '@fortawesome/free-solid-svg-icons'
import { faClock } from '@fortawesome/free-regular-svg-icons'

export const RecipeDetails = () => {
    const { store, dispatch } = useGlobalReducer();
    const printRef = useRef();
    const navigate = useNavigate();
    const { id } = useParams();
    const portions = store.recipe?.portions;

    const getRecipe = async () => {
        recipeServices.getOneRecipe(id).then(data => {
            dispatch({ type: 'get_one_recipe', payload: data });
        });
    };

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
            parsedSteps = steps;
        }

        if (Array.isArray(parsedSteps)) {
            return parsedSteps
                .map(step => {
                    if (typeof step === "string") return step.trim();
                    if (typeof step === "object" && typeof step.description === "string") return step.description.trim();
                    return "";
                })
                .filter(step => step.length > 0);
        }

        return steps
            .split(/(?<=[.?!])\s+(?=[A-Z])|(?:\r?\n|^\d+[\.\)]|[-•]|\bStep\s*\d+:?)/gm)
            .map(step => step.trim())
            .filter(step => step.length > 0);
    };


    const stepsArray = splitSteps(store.recipe?.steps);

    //will make random number so we can sort recipe and shows differents suggestions to user
    const getRandomItems = (array, count) => {
        if (!Array.isArray(array)) return [];
        return [...array].sort(() => 0.5 - Math.random()).slice(0, count);
    };


    useEffect(() => {
        window.scrollTo(0, 0);
        getRecipe();
    }, [store.user?.id, id]);

    return (
        <div className="container-fluid recipe_card_bg1" ref={printRef}>
            <div className="row recipe_card_bg2 my-4 p-4 mt-4">
                <div className="col-12 col-md-12 col-lg-7 col-xl-7 d-flex mt-2 my-4 justify-content-center">
                    <div className="card bg-dark text-white overflow-auto recipe_img border-0">
                        {store.recipe?.media?.length > 0 && (
                            <div id="recipeCarousel" className="carousel slide" data-bs-ride="carousel">
                                <div className="carousel-inner">
                                    {store.recipe.media.map((item, index) => (
                                        <div key={index} className={`carousel-item ${index === 0 ? "active" : ""}`} data-bs-interval="6000">
                                            <img src={item.url} className="img-fluid text-center d-block w-100 recipe_img" alt={`Recipe image ${index + 1}`} />
                                        </div>
                                    ))}
                                </div>
                                {store.recipe.media.length > 1 && (
                                    <>
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
                            <h1 className="fs-1 fw-bold">{store.recipe?.title}</h1>
                        </div>
                    </div>

                    <div className="border-bottom my-2 bg-secondary mx-auto"></div>

                    <div className="row text-center p-2">
                        <div className="col-12 col-md-12 col-lg-3 col-xl-2 g-0 my-sm-1 d-flex justify-content-center justify-content-lg-end">
                            <img src={store.recipe?.user_photo} className="float-start user_img border-0" alt="user_img" />
                        </div>
                        <div className="col-12 col-md-12 col-lg-8 col-lx-10 ms-sm-2 my-sm-1 d-flex 
                        mt-2 mt-sm-0 d-flex justify-content-center justify-content-lg-start">
                            <h5 className="align-self-end text-center text-md-start fs-3">@{store.recipe?.username}</h5>
                        </div>
                    </div>

                    <div className="row p-1 my-4 ms-2 recipe_card_prep justify-content-around text-light">
                        <div className="col-12 col-md-12 col-lg-6 justify-content-center prep_border p-2 p-md-2 p-lg-1 d-flex">
                            <FontAwesomeIcon icon={faClock} className='me-3 mt-2 p-1 icon_prep_type' />
                            <p className='pt-2 text_prep_type'>{store.recipe?.prep_time} minutes</p>
                        </div>
                        <div className="col-12 col-md-12 col-lg-6 justify-content-center text-capitalized p-1 p-md-2 p-lg-1 d-flex">
                            <FontAwesomeIcon icon={faUtensils} className='me-3 mt-2 p-1 icon_prep_type' />
                            <p className='pt-2 text_prep_type'>{store.recipe?.difficulty_type}</p>
                        </div>
                    </div>

                    <div className="row ps-2">
                        <div className="col-12 d-flex">
                            <CollectionButton recipe_id={id} />
                            <ShareButton
                                text="Check this out!"
                                url={window.location.href}
                                printRef={printRef}
                                recipe_id={id} />
                            <AddIngredientsToListButton ingredientList={store.recipe?.ingredients || []} />
                            <AddToMealPlanButton recipe={store.recipe} />
                        </div>
                    </div>

                    <div className="border-bottom my-2 bg-secondary"></div>

                    <div className="row">
                        {store.user?.id && (
                            <div className="col-12 text-capitalize mt-1 order-1">
                                <h5 className="mb-2 fs-4 fw-bold">Allergens: </h5>
                                <p className="fs-5">{Array.isArray(store.recipe?.allergens) ? store.recipe.allergens.join(", ") : ""}</p>
                            </div>
                        )}
                        <div className="col-12 d-flex">
                            <p className="ms-auto text_published align-self-end">Published on: {formattedDate}</p>
                        </div>
                    </div>
                </div>

                {/* will show only 5 first labels to reduce in case we have recipe with far too many labels */}
                <div className="d-flex flex-wrap order-2 gap-2">
                    {store.recipe?.diet_label?.split(',').slice(0, 5).map((diet, i) => (
                        <span key={i} className="badge diet_label text-capitalize fs-5">{diet.trim()}</span>
                    ))}
                </div>
            </div>

            <div className="row py-2">
                <div className="col-12 col-md-12 col-lg-5 ingredients_bg p-3 mt-3 mx-auto">
                    <div className="row m-1">
                        <div className="col-12 mb-3 mb-md-2 ms-3">
                            <h4 className="title_ing_steps text-center text-lg-start">Ingredients</h4>
                        </div>
                    </div>
                    <div className="row m-2">
                        <div className="col-10 d-flex justify-content-around justify-content-lg-between mx-auto">
                            <div className="color_icons d-flex">
                                <FontAwesomeIcon icon={faUser} className='color_icons fs-4 me-2 mt-2' />
                                <h1 className="text_ing1 mb-4 align-self-end fs-4">{portions}</h1>
                            </div>
                            <div className="mt-1 color_icons">
                                <p className="text_ing1 fs-4">{(store.recipe?.total_grams / portions).toFixed(1)}g / portion</p>
                            </div>
                        </div>
                    </div>
                    <div className="row my-4 m-3">
                        <div className="col-12 mx-auto">
                            <ul>
                                {store.recipe?.ingredients?.map((ing, i) => (
                                    <li key={i} className="m-0 p-0 d-flex justify-content-center justify-content-lg-start">
                                        <p className="text_ing1 me-2 fs-4">{ing.quantity} {ing.unit}</p>
                                        <p className="text_ing_steps fs-4">of <span className='text-capitalize'>{ing.ingredient_name}</span></p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

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
                                    <li key={i} className="list-group-item py-3 text-light text-center 
                                    text-lg-start steps_bg border_steps text_ing_steps fs-4">
                                        {step.trim()}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-12 col-md-8 col-lg-6 mb-4">
                    {store.user?.id ? <NutricionalTable /> : ""}
                </div>
            </div>

            <Comments recipe_id={id} />

            <div className="row row_bg_suggestions">
                <h2 className="p-4 text-light fs-1">Latest Recipes</h2>
                <div className="col-12">
                    <div className="scroll-container d-flex p-3">

                        {/* maping over RecipeCards to create cards based on the data */}
                        {getRandomItems(store.recipes, 10).map((el) => (
                            <RecipeCard
                                key={el.id}
                                id={el.id}
                                url={el.media?.[0]?.url}
                                title={el.title}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
