import React from 'react';
import logo from "../assets/img/recetea-logo.png"; 

 export const Footer = () => {
  return (
    <footer className="container-fluid  bg-light text-dark mt-0 pt-0 pb-2">
      <div className="align-items-center  d-flex justify-content-between">
        <div className=" align-items-center">
          <img src={logo} alt="Logo" className='logo-footer' />
        </div>
    
        <div className="align-items-center">
          <p className="footer_contact fs-5">Contact Us: receteaapi@gmail.com</p>
        </div>
      </div>

      <hr className="border-secondary my-2" />


      <div className="text-center pe-4">
        <p className="rights_reserved fs-5 fw-bold">&copy; 2025 Recetea - All rights reserved</p>
      </div>
    </footer>
  );
};