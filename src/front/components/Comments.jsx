import React, { useEffect, useState } from "react";

//hooks
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

//services
import commentServices from "../services/recetea_API/commentServices.js"

//icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons'

//components
import { CommentButtons } from "../components/buttons/commentButtons.jsx";

export const Comments = (props) => {

    const { store, dispatch } = useGlobalReducer();
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [comment, setComment] = useState({
        content: "",
    })

    // Fetch of the comments by recipe_id
    const getAllComments = async () => commentServices.getCommentsByRecipe(props.recipe_id).then(data => {
        dispatch({ type: 'get_all_comments', payload: data });
    })

    //add more recent comments first
    const sortByRecent = (comments) =>
        [...comments].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    
    const handleChange = e => {
        setComment({
            ...comment,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = await commentServices.createComment(props.recipe_id, comment.content)
        await getAllComments();

        //is we can POST the comment
        if (data.success) {

            dispatch({ type: 'add_comment', payload: data.data[0] });

            //erases the data to start blank space
            setComment({ content: "" });

        } else {
            window.alert(data.error || "Could not post your comment, please try again.")
        }
    }

    useEffect(() => {

        getAllComments()

    }, [props.recipe_id]);

    return (
        <div className="row comment_row p-4">
            <h2 className="m-4 fs-1">Comments</h2>

            <div className="col-12">
                <div className="row mb-4 ms-4 p-4">
                    <div className="col-12 col-sm-2 col-md-1 col-lg-1 mt-1 pt-2
                    g-0 my-sm-1 d-flex justify-content-start">
                        <img
                            src={store.user?.photo_url}
                            className="float-start comment_img border-0 mt-4"
                            alt={store.user?.id}
                        />
                    </div>

                    <div className="col-12 col-sm-9 col-md-10 col-lg-9 border-bottom">
                        <h5 className="fs-4">{store.user?.username}</h5>
                        {
                            // We set the textarea to frow but has a max.height so it's easier to see our comments
                            store.user?.id ?
                                <form onSubmit={handleSubmit}>
                                    <div className="row">
                                        <div className="col-11">
                                            <div className="input-group mb-4 text_box rounded">
                                                <textarea
                                                    className="form-control border-danger rounded"
                                                    name="content"
                                                    value={comment.content}
                                                    onChange={handleChange}
                                                    onInput={(e) => {
                                                        e.target.style.height = "auto";
                                                        //this will set a max-height for input box so it grows but without affectiing layout
                                                        //has to be in px or we would need to convert rem or % into px with a function
                                                        e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
                                                    }}
                                                    aria-label="With textarea"
                                                    //this will close any edit actions on place to focus on input
                                                    onFocus={() => setEditingCommentId(null)}></textarea>


                                            </div>
                                        </div>
                                        <div className="col-1 d-flex align-items-center justify-content-center mb-3">
                                            <button type="submit" className="btn border-0 text-start">
                                                <FontAwesomeIcon icon={faPaperPlane} className="send_btn fs-3" />
                                            </button>
                                        </div>
                                    </div>

                                </form>
                                :
                                // if not logged can only see other users comments
                                null
                        }
                    </div>
                </div>
            </div>
            <div className="col-12">
                {/* Check first if it's an array and will map it if we have a comment */}
                <div className={`comments_container ${store.comments.length > 6 ? 'scrollable' : ''}`}>
                    {Array.isArray(store.comments) && store.comments.length > 0
                        ? sortByRecent(store.comments).map((comment) => (
                            <div className="row mb-4 ms-4 p-4" key={comment.id}>

                                <div className="col-3 col-sm-2 col-md-1 col-lg-1 mt-1
                            g-0 my-sm-1 d-flex justify-content-start">
                                    <img
                                        src={comment.user_photo}
                                        className="float-start comment_img bg-info border-0 mt-1"
                                        alt={comment.user_id}
                                    />
                                </div>
                                {store.user?.id == comment?.user_id ?
                                    <CommentButtons
                                        recipe_id={comment.recipe_id}
                                        username={comment.username}
                                        user_id={comment.user_id}
                                        comment_id={comment.id}
                                        editingCommentId={editingCommentId}
                                        setEditingCommentId={setEditingCommentId}
                                        content={comment.content}
                                        user_photo={comment.user_photo}
                                    />
                                    :
                                    <div className="col-8 col-sm-9 col-md-10 col-lg-9 border-bottom">
                                        <h5 className="fs-4">{comment.username}</h5>
                                        <p className="fs-5 comment_box my-4">{comment.content}</p>
                                    </div>
                                }
                            </div>
                        ))

                        :
                        // Will return a phrase if empty
                        (<h5 className="m-4 fs-4">Be the first to comment on this recipe!</h5>)
                    }
                </div>

            </div>
        </div>
    );
}