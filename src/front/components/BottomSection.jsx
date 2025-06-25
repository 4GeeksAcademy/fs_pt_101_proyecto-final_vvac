import React from 'react';
import VeganDiet from '../assets/img/VeganDiet.jpg'
import GlutenFree from '../assets/img/GlutenFree.jpg'
import Proteic from '../assets/img/Proteic.jpg'
import lowCalorie from '../assets/img/low-calorie.jpg'
import FastRecipes from '../assets/img/FastRecipes.jpg'
import CheatMeals from '../assets/img/CheatMeals.jpg'


export const BottomSection = () => {
  return (

    <div className="container_bottom  w-100 ">
      <h2 className="title_Recipe_bottom text-center fw-bold mb-0 text-dark">Explore Our Meal Options</h2>
      <div className="scroll-bottom-row">
        <div className="card card_scroll_bottom h-100 shadow-sm " style={{ border: "10px solid #ca3e49" }}>
          <img
            src={VeganDiet}
            alt="img"
            className="card-img-bottom"
            style={{ height: '180px', objectFit: 'cover'}}
          />
          <div className="card_bottom w-100 bg-opacity-50">
            <h5 className="bottom_title text-center text-light fs-2 "> VEGAN DIET </h5>
            <p className='text-center fs-5 fw-bold'> Recipes made on plant-based ingredients.</p>
          </div>
        </div>

        <div className="card card_scroll_bottom h-100 shadow-sm" style={{ border: "10px solid #ca3e49" }}>
          <img
            src={GlutenFree}
            alt="img"
            className="card-img-bottom"
            style={{ height: '180px', objectFit: 'cover' }}
          />
          <div className="card_bottom w-100 bg-opacity-50">
            <h5 className="bottom_title text-center text-light fs-2 ">GLUTEN FREE</h5>
            <p className='text-center fs-5  fw-bold'>Caelic recipes without wheat, barley, or rye.</p>
          </div>
        </div>
        <div className="card card_scroll_bottom h-100 shadow-sm" style={{ border: "10px solid #ca3e49" }}>
          <img
            src={Proteic}
            alt="img"
            className="card-img-bottom"
            style={{ height: '180px', objectFit: 'cover'}}
          />
          <div className="card_bottom w-100 bg-opacity-50">
            <h5 className="bottom_title text-center text-light fs-2 ">HIGH PROTEIC</h5>
            <p className='text-center fs-5 fw-bold'>Meals rich in protein for muscle and energy.</p>
          </div>
        </div>
      </div>


      <div className="scroll-bottom-row">
        <div className=" card card_scroll_bottom h-100 shadow-sm" style={{ border: "10px solid #ca3e49" }}>
          <img
            src={lowCalorie}
            alt="img"
            className="card-img-bottom"
            style={{ height: '180px', objectFit: 'cover'}}
          />
          <div className="card_bottom w-100 bg-opacity-50">
            <h5 className="bottom_title text-center text-light fs-2 ">LOW CALORIES</h5>
            <p className='text-center fs-5 fw-bold'> Light recipes to help you stay in shape.</p>
          </div>
        </div>
        <div className="card card_scroll_bottom h-100 shadow-sm" style={{ border: "10px solid #ca3e49" }}>
          <img
            src={FastRecipes}
            alt="img"
            className="card-img-bottom"
            style={{ height: '180px', objectFit: 'cover'}}
          />
          <div className="card_bottom w-100 bg-opacity-50">
            <h5 className="bottom_title text-center text-light fs-2 ">FAST RECIPES</h5>
            <p className='text-center fs-5 fw-bold'>Quick meals in 30 minutes or less.</p>
          </div>
        </div>
        <div className="card card_scroll_bottom h-100 shadow-sm" style={{ border: "10px solid #ca3e49" }}>
          <img
            src={CheatMeals}
            alt="img"
            className="card-img-bottom"
            style={{ height: '180px', objectFit: 'cover'}}
          />
          <div className="card_bottom w-100 bg-opacity-50">
            <h5 className="bottom_title text-center text-light fs-2  ">CHEAT MEALS</h5>
            <p className='text-center fs-5 fw-bold'>Indulgent treats to enjoy without guilt.</p>
          </div>
        </div>
      </div>














    </div>
  )
}