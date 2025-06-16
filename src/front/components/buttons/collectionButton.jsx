import React, { useEffect, useRef, useState } from "react";

//hooks
import useGlobalReducer from "../../hooks/useGlobalReducer.jsx";

//services
import collectionServices from "../../services/recetea_API/collectionServices.js"

//components
import { PopOver } from './popOver.jsx';

//icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBook } from '@fortawesome/free-solid-svg-icons'
import { faBookMedical } from '@fortawesome/free-solid-svg-icons'

export const CollectionButton = (props) =>{

    const { store, dispatch } = useGlobalReducer()
    
    const getUserCollection = async () => collectionServices.getUserCollections().then(data => {

        if (!store.user?.id) return alert("Log in to save or remove recipes");

        //Need to map on the data list to find only the recipe_id to make easier to display later and filter
        const addedList = data.data.map(item => item.recipe_id);

        //We update the store to match the backend DB
        dispatch({ type: 'get_user_collection', payload: addedList });

        return addedList;
        
    })
    
    const addToCollection = async () => {

        //update store to latest list
        const updatedCollection = await getUserCollection();

        //if recpe_id is not found we will add it
        if(!updatedCollection.includes(Number(props.recipe_id))){

            //fetch POST method to add to collection table
            const data = await collectionServices.addToCollection(props.recipe_id);

            if (data.success) {

                //Fetch again updated list with new recipe_id added
                const newList = await getUserCollection();

                //update store.collections
                dispatch({ type: 'add_recipe', payload: newList });

                console.log("Recipe was added to collection");

            } else {
                console.error("Error from service:", data.error);
            }
        }
    };

    const removeFromCollection = async () => {

        const updatedCollection = await getUserCollection();

        if(updatedCollection.includes(Number(props.recipe_id))){
            
            const data = await collectionServices.removeFromCollection(props.recipe_id);

            if (data.success) {

                //Fetch again updated list
                const newList = await getUserCollection();

                //update store.collections
                dispatch({ type: 'remove_recipe', payload: newList });

                console.log("Recipe was removed from collection: ", data);
                
            } else {
                console.error("Error from service:", data.error);
            }
        }
    };

    const isAdded = store.collections?.includes(Number(props.recipe_id));
    
    //will reload only if user logs in or out from account
    useEffect(() => {
        if (store.user?.id) {
            getUserCollection();
        }
    }, [store.user?.id]);

    //will reload every time we change the collection list
    useEffect(() => {

        store.collections || [];

    }, [store.collections]);

    return(
        <div>
            {store.user?.id ?

                <button type="button" 
                className="btn border-0"
                onClick={() => isAdded ? removeFromCollection() : addToCollection()}>
                    {isAdded ? 
                        <FontAwesomeIcon icon={faBook} className="pe-3 buttons_recipe color_icons border-end border-secondary" />
                        :
                        <FontAwesomeIcon icon={faBookMedical} className="pe-3 buttons_recipe color_icons border-end border-secondary" />
                    }
                </button>

                :

                <PopOver>
                    <button type="button" 
                    className="btn border-0">
                        <FontAwesomeIcon icon={faBook} className="pe-3 buttons_recipe color_icons border-end border-secondary"/>
                    </button>
                </PopOver>
            }
        </div>
    );
}