import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";              

// hooks
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

// services
import recipeServices from "../services/recetea_API/recipeServices.js";

export const UserRecipeCard = (props) => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    // ← fallback URL y estado para el avatar
    const fallbackAvatarUrl = "https://cdn.pixabay.com/photo/2017/08/08/14/26/chef-2611516_1280.jpg";
    const [avatarSrc, setAvatarSrc] = useState(props.authorAvatar || fallbackAvatarUrl);

    // ← sincronizar estado si cambia props.authorAvatar
    useEffect(() => {
        setAvatarSrc(props.authorAvatar || fallbackAvatarUrl);
    }, [props.authorAvatar]);

    const name = props.name || props.title;
    const url = props.url || props.imageUrl;

    // Fetch of the comments by recipe_id
    const getOneUserRecipe = async () =>
        recipeServices.getOneUserRecipe(props.recipe_id).then((data) => {
            dispatch({ type: "get_user_recipe", payload: data });
        });

    const handleClick = () => {
        navigate("/recipes/" + props.id);
        getOneUserRecipe();
    };

    return (
        <div className="user-recipe-card mb-3 w-100 border rounded overflow-hidden">
            {/* Card container redesigned to full width */}
            <div className="d-flex flex-row bg-white">
                {/* Left: Image section */}
                <div className="card-img-container flex-shrink-0">
                    <img src={url} alt="recipe_img" className="card-image-collection" />
                </div>

                {/* Right: Info section */}
                <div className="card-info flex-grow-1 p-3 d-flex flex-column justify-content-between">
                    <div>
                        {/* Title and subtitle */}
                        <h5 className="card-title mb-1" onClick={handleClick}>
                            {name}
                        </h5>
                        <p className="card-subtitle text-muted mb-2">
                            {props.subtitle /* e.g. 'listado ingredientes' */}
                        </p>
                    </div>

                    <div className="d-flex align-items-center justify-content-between">
                        {/* Author info with URL fallback logic */}
                        <div className="d-flex align-items-center">
                            <img
                                src={avatarSrc}
                                alt="author"
                                className="rounded-circle author-avatar me-2"
                                onError={() => {
                                    // if avatar URL fails, set fallback
                                    setAvatarSrc(fallbackAvatarUrl);
                                }}
                            />
                            <small className="text-secondary">{props.authorName}</small>
                        </div>

                        {/* Published date */}
                        <small className="text-secondary">Guardada el {props.published}</small>
                    </div>
                </div>

                {/* Top-right actions */}
                <div className="position-absolute top-0 end-0 m-2 z-2">
                    {props.children}
                </div>
            </div>
        </div>
    );
};
