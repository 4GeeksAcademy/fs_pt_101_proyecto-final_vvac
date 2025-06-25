import React from 'react';
import alimentosTop from '../assets/img/alimentosTop.jpg'
export const TopSection = () => {
    return (
        <div className="row m-0 justify-content-center row_home_top">
            <div className="col-12 position-relative p-4 top_home_img">

                <img
                    src={alimentosTop}
                    alt="Fondo"
                    className="w-100 h-100 object-fit-cover mx-auto p-4"
                />

                <div className="position-absolute top-50 end-0 translate-middle-y 
                text-white p-4 rounded-2 me-5 me-md-5 top_intro_text">

                    <h1 className="fw-bold text-warning display-5">Get to know Recetea</h1>
                    <h5 className="mb-0">Collect all your recipes in one place.</h5>
                    <h5 className="mb-0">Plan your menu and get your shopping list ready.</h5>
                    <h5 className="mb-0">Discover flavors you've never tried.</h5>
                    <h5 className="mb-0">Choose to eat healthier every day.</h5>

                </div>

            </div>
        </div>
    );
};
