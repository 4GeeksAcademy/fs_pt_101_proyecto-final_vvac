import { Link } from "react-router-dom";
import { TurnHome } from "../components/buttons/TurnHome";
import { LinksMenu } from "../components/LinksMenu";
import { RightMenu } from "../components/RightMenu";
import { useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { useNavigate } from "react-router-dom";


export const ShoppingList = () => {

    const navigate = useNavigate(); 
    
    const {store, dispatch} = useGlobalReducer();

    // const [newIngredient, setNewIngredient]

    //función para remover ingrediente y resetear la lista: 
    const removeIngredient = (idx) => {
        dispatch({type:'remove_ingredient', payload: idx })
    }

    const resetList = () => {
        dispatch({ type: 'reset_shopping_list' })
    }


    return (

        <div className="main-row-all vh-100">
                
                    <div className="profile-container">

                        {/* COLUMNA LATERAL IZQ */}

                        <div className="container text-center sidebar-left-profile">
                            <div className="row align-items-start">
                                <div className="col-12 col-md-3">

                                    <div className="d-flex align-items-start">
                                        <TurnHome />
                                        <LinksMenu />
                                    </div>

                                </div>
                                    
                                {/* COLUMNA PRINCIPAL  */}
                                <div className="col-6 main-column-content shopping-page">

                                    <div className="d-flex align-items-start flex-column mb-3">

                                    
                                        <h2 className="mb-3 shopping-header"><i className="fa-solid fa-cart-shopping cart-icon"></i>  Shopping List</h2>

                                        <p>Your ingredients list</p>
                                        
                                        {/* Pendiente centrar shopping list y buttons */}

                                        <div className="container justify-content-center shopping-button-list ">

                                            <ul className="shopping-list text-start">
                                                {store.shoppingList.length === 0 
                                                    ? <li className="empty-shopping-list"> You have no items in the list. </li>
                                                    : store.shoppingList.map((item, idx) => (
                                                        <li className="shopping-item" key={idx}>
                                                            <span className="item-text-shopping"> {item} </span>
                                                            <button className="remove-button" onClick={() => removeIngredient(idx)} aria-label={`Delete ${item}`}>
                                                                <i className="fa-solid fa-square-xmark"></i>
                                                            </button>
                                                        </li>
                                                        ))
                                                }
                                            </ul>
                                            <div className="reset-container">
                                                <button className="reset-button" onClick={resetList}>
                                                    Reset list
                                                </button>
                                            </div>
                                        
                                        </div>

                                    </div>
                                </div>


                                {/* COLUMNA LATERAL DERECHA */}
                                <div className="col-3 right-profile">

                                    <div className="d-grid row-gap-5 b-grids-right h-100">
                                        <RightMenu />

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
    )
}




