import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// hooks
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

// services
import recipeServices from "../services/recetea_API/recipeServices.js";

// componentes
import { HomeCard } from "./HomeCard.jsx";

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
    <div className="card_row_scroll bg-light ">
      <h2 className="title_Recipe_Scroller text-center fw-bold mb-0 text-dark">Some random recipes!!</h2>
      <div
        className="d-flex overflow-auto gap-5 pb-2 pt-2 scrollbar-custom"
        style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
      >
        {recipes.map(recipe => (
          <div
            className="m-0 scroll_cards_bg border flex-shrink-0"
            style={{ width: '250px', scrollSnapAlign: 'start', cursor: 'pointer' }}
            key={recipe.id}
          >
            {recipes.length === 0 ? (
              <p>No recipes available yet.</p>
            ) : (
              recipes.map(recipe => (
                <div key={recipe.id}>
                  <HomeCard
                    id={recipe.id}
                    url={recipe.media?.[0]?.url}
                    title={recipe.title}
                  />
                </div>
              ))
            )}

          </div>
        ))}
      </div>
    </div>
  );
};