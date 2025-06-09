import { useState, useEffect } from 'react';

//hooks
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

//services
import scoreService from "../services/recetea_API/scoreServices.js"

//icon
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons'
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons'

export const LikeButton = (props) => {

    const { store, dispatch } = useGlobalReducer();

    const popOverText = "You need to <strong>log in </strong> or <strong>register </strong> in order to like this recipe"

    // Get userId once, as it's static for the component's lifecycle
    const getUserIdFromToken = () => {
        const token = localStorage.getItem("token");
        if (!token) return null;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.sub; // Or `payload.user_id` depending on your token
        } catch (e) {
            console.error("Error decoding token:", e);
            return null;
        }
    };

    const userId = getUserIdFromToken();

    // Check if user is logged in and if true, determine if they have liked this specific recipe.
    const isLiked = store.scores?.some(
        (score) => score.recipe_id === props.recipe_id && score.user_id === userId
    );

    const getAllScores = async () => {
        try {
            // Fetch scores for the specific recipe
            const data = await scoreService.getRecipeScores(props.recipe_id);
            dispatch({ type: 'get_all_scores', payload: data });

        } catch (error) {
            console.error("Error fetching scores for recipe " + props.recipe_id + ":", error);
        }
    };

    const handleClick = async () => {
        if (!userId) {
            // Optional: Provide visual feedback to the user if they are not logged in
            console.warn("User not logged in. Cannot like recipe.");
            return;
        }
        try {
            // This `toggleScore` should handle adding/removing the like on the backend
            const data = await scoreService.toggleScore(props.recipe_id);
            // After toggling, re-fetch the scores for this specific recipe to update the UI
            await getAllScores();
        } catch (error) {
            console.error("Toggle like error for recipe " + props.recipe_id + ":", error);
        }
    };

    useEffect(() => {
        // When the component mounts or props.recipe_id changes, fetch the scores for this recipe.
        getAllScores();

        // Initialize Bootstrap popovers for the "not logged in" button.
        if (!store.user?.token) {
            const popoverEl = document.querySelector(`[data-bs-toggle="popover"][data-recipe-id="${props.recipe_id}"]`);
            if (popoverEl) {
                new bootstrap.Popover(popoverEl, {
                    trigger: 'hover focus',
                    customClass: "popover_text",
                    html: true,
                    content: popOverText
                });
            }
        }

        console.log("LikeButton mounted/updated for Recipe ID: " + props.recipe_id);
        console.log("Current User ID from token: " + userId);
    }, [props.recipe_id, store.user?.token, userId]);

    return(
        <div className="card-img-overlay">
            {store.user?.token ? 
                <button 
                type="button" 
                className="btn m-2 p-3 position-absolute bottom-0 end-0 bg-warning rounded-circle"
                onClick={handleClick}>
                    {isLiked ? 
                        <FontAwesomeIcon icon={faHeart} className='text-danger fs-2'/> 
                        : 
                        <FontAwesomeIcon icon={faHeartRegular} className='text-light fs-1'/>
                    }
                </button> 
                :
                <button 
                type="button" 
                className="btn m-2 p-3 position-absolute bottom-0 end-0 bg-warning rounded-circle" 
                data-bs-container="body" 
                data-bs-trigger="hover focus"
                data-bs-toggle="popover" 
                aria-label="Login required to like recipe"
                data-bs-placement="left" 
                data-bs-content={popOverText}
                data-recipe-id={props.recipe_id}>
                    <FontAwesomeIcon icon={faHeartRegular} className='text-light fs-1'/>
                </button>
            }
            <div className='rounded-circle like_btn text-light m-3 fs-6'>
                {(store.scores ?? []).length}
            </div>   
        
        </div>
    );
}