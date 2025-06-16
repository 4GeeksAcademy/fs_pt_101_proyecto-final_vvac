// Import necessary hooks and functions from React.
import { useContext, useReducer, createContext } from "react";
import storeReducer, { initialStore } from "../store"  // Import the reducer and the initial state.
import { useEffect } from "react";

//services
import recipeServices from "../services/recetea_API/recipeServices.js"

// Create a context to hold the global state of the application
// We will call this global state the "store" to avoid confusion while using local states
const StoreContext = createContext()

// Define a provider component that encapsulates the store and warps it in a context provider to 
// broadcast the information throught all the app pages and components.
export function StoreProvider({ children }) {
    // Initialize reducer with the initial state.
    const [store, dispatch] = useReducer(storeReducer, initialStore())

    const loadRecipes = async () => {
        try {
            const data = await recipeServices.getAllRecipes();
           dispatch({ type: 'get_all_recipes', payload: data })

        } catch (error) {
            console.log(error);
        }
    }

    // Load the page once only
    useEffect (() => {
        const token = localStorage.getItem("token");
        const user = localStorage.getItem("user");

        if (token && user) {
        dispatch({
            type: "logIn",
            payload: { token, user: JSON.parse(user) },
        });
        }

        loadRecipes()
    }, [])


    // Provide the store and dispatch method to all child components.
    return <StoreContext.Provider value={{ store, dispatch }}>
        {children}
    </StoreContext.Provider>
}

// Custom hook to access the global state and dispatch function.
export default function useGlobalReducer() {
    const { dispatch, store } = useContext(StoreContext)
    return { dispatch, store };
}