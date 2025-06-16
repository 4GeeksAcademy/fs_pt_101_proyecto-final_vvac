import { useNavigate, useParams } from "react-router-dom";
import React, { useEffect, useRef } from "react";

//hooks
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

//services
import commentServices from "../services/recetea_API/commentServices.js"

export const Comments = (props) => {

    const { store, dispatch } = useGlobalReducer();

    // Fetch of the comments by recipe_id
    const getAllComments = async () => commentServices.getCommentsByRecipe(props.recipe_id).then(data => {
        dispatch({ type: 'get_all_comments', payload: data });
    })

    function getRandomColor() {
        return Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    }

    function getBrightness(hexColor) {
        const r = parseInt(hexColor.substring(0, 2), 16);
        const g = parseInt(hexColor.substring(2, 4), 16);
        const b = parseInt(hexColor.substring(4, 6), 16);
        return (299 * r + 587 * g + 114 * b) / 1000;
    }

    //Just like recipe page we will set the random placehold image to have
    //the first letter of user + random background. We will map outside so it applies to each comment
    //we also set to make the color of the letter change depending on the brightness
    const placeHolderImg = Array.isArray(store.comments) && ((comment) => {

        const randomColor = getRandomColor();
        const brightness = getBrightness(randomColor);

        //check bringhtness to stablish the letter color
        const textColor = brightness < 125 ? 'fff' : '000';

        const firstLetter = comment.username?.charAt(0).toUpperCase() || "R";
        const placeHolderImage = `https://ui-avatars.com/api/?name=${firstLetter}&background=${randomColor}&color=${textColor}`;

        return (
            <div className="row mb-4 ms-4" key={comment.id}>
                <div className="col-3 col-sm-2 col-md-1 col-lg-1 mt-1 me-1
                g-0 my-sm-1 d-flex justify-content-start">
                    <img
                    src={comment.user_photo || placeHolderImage}
                    className="float-start comment_img bg-info"
                    alt={comment.user_id}
                    />
                </div>
                <div className="col-8 col-sm-9 col-md-10 col-lg-9 border-bottom">
                    <h5 className="fs-4">{comment.username}</h5>
                    {store.user?.id === comment.user_id ? 
                        <div className="input-group border rounded comment_box">
                            <input value={comment.content} name="content" type="text" className="form-control" aria-label="Text input with segmented dropdown button"/>
                            <button type="button" className="btn btn-outline-secondary dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false">
                                <span className="visually-hidden">Toggle Dropdown</span>
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end">
                                <li><a className="dropdown-item" href="#">Edit</a></li>
                                <li><a className="dropdown-item" href="#">Delete</a></li>
                            </ul>
                        </div>
                        : 
                        <p className="fs-5 comment_box my-4">{comment.content}</p>
                    }
                </div>
            </div>
        );
    });    

    useEffect(() => {

        getAllComments()

    }, [props.recipe_id]);

    return(
        <div className="row comment_row">
            <h2 className="m-4">Comments</h2>
           {store.comments > 0 ?  {placeHolderImg} : ""}
        </div>
    );
}