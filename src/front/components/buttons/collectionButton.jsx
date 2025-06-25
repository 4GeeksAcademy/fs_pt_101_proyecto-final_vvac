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

        //We update the store to match the backend DB
        dispatch({ type: 'get_user_collection', payload: data.data });

        return data.data;
        
    })
    
    const addToCollection = async () => {

        //update store to latest list
        const updatedCollection = await getUserCollection();
        const exists = updatedCollection.some(item => item.recipe_id === Number(props.recipe_id));

        //if recpe_id is not found we will add it
        if(!exists){

            //fetch POST method to add to collection table
            const data = await collectionServices.addToCollection(props.recipe_id);

            if (data.success) {

                //Fetch again updated list with new recipe_id added
                const newList = await getUserCollection();

                //update store.collections
                dispatch({ type: 'update_collections', payload: newList });

            } else {
                console.error("Error from service:", data.error);
            }
        }
    };

    const removeFromCollection = async () => {

        const updatedCollection = await getUserCollection();

        const exists = updatedCollection.some(item => item.recipe_id === Number(props.recipe_id));

        if(exists){
            
            const data = await collectionServices.removeFromCollection(props.recipe_id);

            if (data.success) {

                //Fetch again updated list
                const newList = await getUserCollection();

                //update store.collections
                dispatch({ type: 'update_collections', payload: newList });

                console.log("Recipe was removed from collection: ", data);
                
            } else {
                console.error("Error from service:", data.error);
            }
        }
    };

    const isAdded = Array.isArray(store.collections) && store.collections.some(item => item.recipe_id === Number(props.recipe_id));
    
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
                        <FontAwesomeIcon icon={faBook} className="ms-4 fs-2 color_icons"/>
                        :
                        <FontAwesomeIcon icon={faBookMedical} className="ms-4 fs-2 color_icons" />
                    }
                </button>

                :

                <PopOver>
                    <button type="button" 
                    className="btn border-0">
                        <FontAwesomeIcon 
                        icon={faBook} 
                        className="ms-4 fs-2 color_icons"
                        />
                    </button>
                </PopOver>
            }
        </div>
    );
}