import { useEffect } from 'react';

//hooks
import useGlobalReducer from "../../hooks/useGlobalReducer.jsx";

//services
import scoreService from "../../services/recetea_API/scoreServices.js"

//icon
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons'
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons'
import { PopOver } from './popOver.jsx';

export const LikeButton = (props) => {

    const { store, dispatch } = useGlobalReducer()

    const getAllScores = async () => {
        try {
            const data = await scoreService.getRecipeScores(props.recipe_id);;

            const actualScoresArray = Array.isArray(data) ? data : (data.scores || []);

            console.log(data);

            dispatch({
                type: 'get_recipe_score',
                payload: { recipe_id: props.recipe_id, scores: actualScoresArray }
            });

        } catch (error) {
            console.error(`Error fetching scores for recipe ${props.recipe_id}:`, error);
        }
    };

    // Check if the current user has liked this specific recipe
    const isLiked = store.scores?.[props.recipe_id]?.some(
        (like) => String(like.user_id) === String(store.user?.user_id)
    );

    const handleLikes = async () => {
        if (!store.user?.user_id) {
            // Check if user is logged in and we have the store.user?.user_id
            console.warn("User not logged in. Cannot toggle like.");
            return window.alert("User is not logged in");
        }

        try {
            const data = await scoreService.toggleScore(props.recipe_id);

            if (data.liked) {
                dispatch({
                    type: 'like',
                    payload: { recipe_id: props.recipe_id, user_id: store.user?.user_id }
                });
                console.log(data);
                return data;

            } else {

                dispatch({
                    type: 'unlike',
                    payload: { recipe_id: props.recipe_id, user_id: store.user?.user_id }
                });

                console.log(data);
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
    }, [props.recipe_id, dispatch, store.user?.user_id]);

    // Debugging logs
    useEffect(() => {
        console.log(`User  ID: ${store.user?.user_id}`);
        console.log(`Scores:`, store.scores);
        console.log(`Is Liked: ${isLiked}`);
        console.log("user toke: " + store.user?.token);

    }, [store.user?.user_id, isLiked, store.scores]);

    return (
        <div className="card-img-overlay">
            {store.user?.user_id ?
                <button
                    type="button"
                    className="btn m-2 p-3 position-absolute bottom-0 end-0 bg-warning rounded-circle btn_overlay"
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
                        className="btn m-2 p-3 position-absolute bottom-0 end-0 bg-warning rounded-circle">
                        <FontAwesomeIcon icon={faHeartRegular} className='text-light fs-2' />
                    </button>
                </PopOver>
            }
            <div className='rounded-circle like_btn text-light m-3 fs-6 btn_overlay'>
                {(store.scores[props.recipe_id]?.length ?? 0)}
            </div>

        </div>
    );
}