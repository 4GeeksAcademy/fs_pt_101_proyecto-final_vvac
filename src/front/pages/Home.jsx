import React, { useEffect } from "react";

//hooks
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

//assets


//components
import { RecipeCard } from "../components/RecipeCard.jsx";
import { LogIn } from "../components/LogIn.jsx";
import { Navbar } from "../components/Navbar.jsx";
import { faAlignJustify } from "@fortawesome/free-solid-svg-icons";

export const Home = () => {

	const { store, dispatch } = useGlobalReducer()

	const loadMessage = async () => {
		try {
			const backendUrl = import.meta.env.VITE_BACKEND_URL

			if (!backendUrl) throw new Error("VITE_BACKEND_URL is not defined in .env file")

			const response = await fetch(backendUrl + "/api/hello")
			const data = await response.json()

			if (response.ok) dispatch({ type: "set_hello", payload: data.message })

			return data

		} catch (error) {
			if (error.message) throw new Error(
				`Could not fetch the message from the backend.
				Please check if the backend is running and the backend port is public.`
			);
		}

	}

	useEffect(() => {
		loadMessage()
	}, [])

	return (
			
		<div className="container-fluid">
			
			<div className="row" >
				<div className="col-md-12 text-center">
					<div className="container-home">
						
					</div>
				</div>
				
				<div className="scroll-container d-flex p-3">

					{/* maping over RecipeCards to create cards based on the data */}
					{
						store.recipes?.map((el) => <RecipeCard
							key={el.id}
							recipe_id={el.id}
							title={el.title}
							url={el.media?.[0]?.url}

						/>)
					}
				</div>
			</div>
		</div>

	);
};