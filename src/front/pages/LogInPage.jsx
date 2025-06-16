import React from "react";

//components
import { LogIn } from "../components/LogIn.jsx";


export const LogInPage = () => {

    return(
       <div className="container-fluid logIn_background p-4">
            <h1 className="p-4 text-center logIn_title">Welcome to Recetea!</h1>
            <LogIn />
        </div>
    )
}