import { Link } from "react-router-dom";
import logo from "../assets/img/recetea-logo.png";


export const Navbar = () => {

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-light px-4 py-2">
      <div className="container-fluid">

        {/* Logo a la izquierda */}
        <a className="navbar-brand" href="/">
          <img src={logo} alt="Logo" className="logo-navbar" />
        </a>

        <form className="d-flex" role="search">
          <input className="form-control me-2 r-10" type="search" placeholder="Search recipes, diets and more" aria-label="Search" />
          <button className="btn btn-outline-primary" type="submit"><i class="fa-solid fa-magnifying-glass"></i></button>
        </form>

        {/* Botón hamburguesa para colapsar en móvil */}
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarButtons">
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Contenido colapsable */}
        <div className="collapse navbar-collapse justify-content-end" id="navbarButtons">
          <div className="d-flex gap-2">
            <a href="/login" className="btn btn-primary">Login</a>
            <a href="/Register" className="btn btn-primary">Register</a>
          </div>
        </div>

      </div>
    </nav>
  );
};