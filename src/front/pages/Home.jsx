import React, { useEffect } from "react";

//hooks
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

//assets
import rigoImageUrl from "../assets/img/rigo-baby.jpg";

//components
import { RecipeCard } from "../components/RecipeCard.jsx";
import { LogIn } from "../components/LogIn.jsx";

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
			<div className="row">
				<h3>This is for test as we have pending the Home page</h3>
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
				<LogIn />
			</div>
		</div>
	);
}; 