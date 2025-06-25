import { useNavigate } from "react-router-dom";

//hooks
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

//services
import recipeServices from "../services/recetea_API/recipeServices.js"

export const HomeCard = (props) => {

    const navigate = useNavigate();
    const { store, dispatch } = useGlobalReducer();

    const getOneRecipe = async () => recipeServices.getOneRecipe(props.id).then(data => {
        dispatch({ type: 'get_one_recipe', payload: data });
    });

    const handleClick = (e) => {
        navigate("/recipes/" + props.id);
        getOneRecipe();
    };

    const name = props.name || props.title;
    const url = props.url || props.imageUrl;

    return (
        <div className="m-2 scroll_cards_bg border" onClick={handleClick}>
            <div className="card bg-light text-white p-3 border-0 position-relative overflow-hidden">
                <img src={url} className="img-fluid card-img recipes_card_img border-0" alt="recipe_img" />
                <div className="card-img-overlay p-0 d-flex align-items-end">
                    <div className="w-100 bg-opacity-50 text-center title_suggestion_card m-3">
                        <p className="card-title text-light fs-3 p-3">{name}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
