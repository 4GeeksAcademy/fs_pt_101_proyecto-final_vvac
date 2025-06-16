import { useNavigate} from "react-router-dom";
import { useEffect } from "react";

//hooks
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

//services
import recipeServices from "../services/recetea_API/recipeServices.js"


export const RecipeCard = (props) => {

    const navigate = useNavigate()
    const {store, dispatch} = useGlobalReducer();

    const getOneRecipe = async () => recipeServices.getOneRecipe(props.recipe_id).then(data=>{
        dispatch({type: 'get_one_recipe', payload:data});
    })

    const handleClick = (e) => {
        navigate("/recipes/" + props.recipe_id)
        getOneRecipe()
    } 

    useEffect(() => {
        getOneRecipe();
    }, []);

    return(
        <div className="col-12 col-sm-6 col-md-5 col-lg-4 w-50">
            <div 
            className="card bg-dark text-white mx-2" 
            onClick={handleClick}>
                <img src={props.url} className="card-img recipe_img" alt="recipe_img"/>
                <div className="card-img-overlay img_bg_overlay">
                    <h2 className="card-title">{props.title}</h2>
                </div>
            </div>
        </div>
    )
}