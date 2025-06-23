import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// hooks
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

// services
import recipeServices from "../services/recetea_API/recipeServices.js";

// componentes
import { RecipeCard } from "./RecipeCard.jsx";

export const RecipeScroller = () => {
  const [recipes, setRecipes] = useState([]);
  const navigate = useNavigate();
  const { store, dispatch } = useGlobalReducer();

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const data = await recipeServices.getAllRecipes();
        setRecipes(data);
      } catch (err) {
        console.error('Error fetching recipes from service:', err);
      }
    };

    fetchRecipes();
  }, []);

  return (
    <div className="card_row_scroll my-5">
      <h2 className="title_Recipe_Scroller text-center fw-bold mb-0 text-dark">Some random recipes!!</h2>
      <div
        className="d-flex overflow-auto gap-3 pb-2 scrollbar-custom"
        style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
      >
        {recipes.map(recipe => (
          <div
            className="m-0 scroll_cards_bg border flex-shrink-0"
            style={{ width: '250px', scrollSnapAlign: 'start', cursor: 'pointer' }}
            key={recipe.id}
          >
            <RecipeCard 
              id={recipe.id} 
              url={recipe.img} 
              name={recipe.name} 
            />
          </div>
        ))}
      </div>
    </div>
  );
};