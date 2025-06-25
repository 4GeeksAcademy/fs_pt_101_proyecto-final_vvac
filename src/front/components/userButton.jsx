import React, { useState, useEffect } from "react";

//hooks
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

//components
import { LogOut } from "../components/LogOut.jsx";

export const UserButton = () => {

    const { store, dispatch } = useGlobalReducer();

    return (
        <div className="btn-group border-0 ms-3 ms-auto">
            <button
                type="button"
                className="btn rounded-circle nav_user_btn border-0"
                aria-expanded="false"
                data-bs-toggle="dropdown"
            >
                <img
                    src={store.user?.photo_url}
                    alt="User"
                    className="user_img"
                    style={{ cursor: 'pointer' }}
                />
            </button>
            <ul className="dropdown-menu dropdown-menu-end nav_drop">
                <li><a className="dropdown-item fs-5" href="/profile">Profile</a></li>
                <li><a className="dropdown-item fs-5" href="/your-collection">My Recipes</a></li>
                <li><a className="dropdown-item fs-5" href="/meal-planner">Meal Planner</a></li>
                <li><hr className="dropdown-divider" /></li>
                <li className="dropdown-item fs-5"><LogOut /></li>
            </ul>
        </div>


    )
}
