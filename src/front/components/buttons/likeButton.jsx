import { useEffect } from 'react';

//hooks
import useGlobalReducer from "../../hooks/useGlobalReducer.jsx";

//services
import scoreService from "../../services/recetea_API/scoreServices.js"

//components
import { PopOver } from './popOver.jsx';

//icon
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons'
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons'

export const LikeButton = (props) => {

    const { store, dispatch } = useGlobalReducer()

    const getAllScores = async () => {
        try {
            const data = await scoreService.getRecipeScores(props.recipe_id);;

            //Make sure is an array before we save it on store
            const arrayScores = Array.isArray(data) ? data : (data.scores || []);

            dispatch({
                type: 'get_recipe_score',
                payload: { recipe_id: props.recipe_id, scores: arrayScores }
            });

        } catch (error) {
            console.error(`Error fetching scores for recipe ${props.recipe_id}:`, error);
        }
    };

    // Check if the current user has liked this specific recipe
    const isLiked = store.scores?.[props.recipe_id]?.some(
        (like) => String(like.user_id) === String(store.user?.id)
    );

    const handleLikes = async () => {
        
        if (!store.user?.id) return alert("Log in to save recipes");

        try {
            const data = await scoreService.toggleScore(props.recipe_id);

            if (data.liked) {
                dispatch({
                    type: 'like',
                    payload: { recipe_id: props.recipe_id, user_id: store.user?.id }
                });
                return data;

            } else {

                dispatch({
                    type: 'unlike',
                    payload: { recipe_id: props.recipe_id, user_id: store.user?.id }
                });
                return data;
            }
        } catch (error) {
            console.log(error);
            return error;
        }
    }



    useEffect(() => {

        getAllScores();

        // Re-run effect if recipe_id or user login status changes
    }, [props.recipe_id, dispatch, store.user?.id]);

    return (
        <div className="card-img-overlay">
            {store.user?.id ?
                <button
                    type="button"
                    className="btn m-3 position-absolute bottom-0 end-0 
                    bg-warning btn_overlay like_btn"
                    onClick={handleLikes}>
                    {isLiked ?
                        <FontAwesomeIcon icon={faHeart} className='text-danger fs-3' />
                        :
                        <FontAwesomeIcon icon={faHeartRegular} className='text-light fs-3' />
                    }
                </button>
                :
                <PopOver>
                    <button
                    type="button"
                    className="btn m-3 position-absolute bottom-0 end-0 
                    bg-warning btn_overlay like_btn">
                        <FontAwesomeIcon icon={faHeartRegular} className='text-light fs-3' />
                    </button>
                </PopOver>
            }
            <div className='rounded-circle like_btn2 text-light m-3 fs-6 btn_overlay'>
                {(store.scores[props.recipe_id]?.length ?? 0)}
            </div>

        </div>
    );
}