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

  //will make random number so we can sort recipe and shows differents suggestions to user
  const getRandomItems = (array, count) => {
    if (!Array.isArray(array)) return [];
    return [...array].sort(() => 0.5 - Math.random()).slice(0, count);
  };

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
    <div className="bg-light">
      <h2 className="title_Recipe_Scroller text-center fw-bold mb-0 text-dark">
        Some random recipes!!
      </h2>

      <div className="scroll-container d-flex p-3">
        {getRandomItems(store.recipes, 10).map((el) => (
          <HomeCard
            key={el.id}
            id={el.id}
            url={el.media?.[0]?.url}
            title={el.title}
          />
        ))}
      </div>
    </div>

  );
};