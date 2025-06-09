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

    const {store, dispatch} =useGlobalReducer();
    const [score, setScore] = useState([]);
    
    const popOverText = "You need to <strong>log in </strong> or <strong>register </strong> in order to like this recipe"

    // Select all elements with data-bs-toggle="popover"
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
    
    // Initialize popovers with dismiss on those buttons
    var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl, {
            trigger: 'hover focus',
            customClass: "popover_text",
            html: true
        });
    });

    const getAllScores = async () => {
        try {
            const data = await scoreService.getRecipeScores(props.recipe_id);
            dispatch({ type: 'get_all_scores', payload: data });
        } catch (error) {
            console.error("Error:", error);
        }
    };
    
    const handleClick = async () => {
        try {
            const data = await scoreService.toggleScore(props.recipe_id);

            // Update local component state based if already liked or not
            if (data.liked) {
                // If not liked will add to score table and sum +1
                setScore(prev => [...prev, props.recipe_id]);
            } else {
                //Otherwise, if already on table will filter to delete it and rest -1
                setScore(prev => prev.filter(id => id !== props.recipe_id));
            }

            // Update global store so other components can reflect this
            dispatch({
                type: data.liked ? 'like' : 'unlike',
                payload: { recipe_id: props.recipe_id, liked: data.liked }
            });
        }catch (error) {
            return error;
        }
    }

    useEffect(() => {
        getAllScores();
        popoverList
    }, []);

    return(
        <div className="card-img-overlay">
            {store.user?.id ? 
                <button 
                type="button" 
                className="btn m-2 p-3 position-absolute bottom-0 end-0 bg-warning rounded-circle"
                onClick={handleClick}>
                    {store.recipes?.id === props.recipe_id && store.score?.liked ? 
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
                data-bs-content={popOverText}>
                    <FontAwesomeIcon icon={faHeartRegular} className='text-light fs-1'/>
                </button>
            }
            <div className='rounded-circle like_btn text-light m-3 fs-6'>
                {(store.scores ?? []).length}
            </div>   
        
        </div>
    );
}