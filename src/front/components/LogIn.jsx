import { useNavigate } from "react-router-dom";
import { useState } from "react";

//hooks
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

//services
import userServices from "../services/recetea_API/userServices.js"

export const LogIn = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await userServices.login(formData);
            if (response.token) {
                // Login exitoso
                console.log("User identified:", response);
                // Puedes redirigir o mostrar una alerta

            } else {
                alert("non valid password or email");
            }
        } catch (error) {
            console.error("log in error:", error);
            alert("Log in failed.");
        }
    };
    return (
        <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-12 col-sm-8 col-md-6 col-lg-4">
                        <div className="card p-4 shadow">

                            {/* Título centrado y estilizado */}
                            <h3 className="text-center mb-4">Let's cook Chef!</h3>

                            <form onSubmit={handleSubmit}>

                                <div className="mb-3">
                                    <label htmlFor="exampleInputEmail1" className="form-label">
                                        Email address
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="form-control"
                                        id="exampleInputEmail1"
                                    />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="exampleInputPassword1" className="form-label">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        className="form-control"
                                        id="exampleInputPassword1"
                                    />
                                </div>

                                <div className="d-grid">
                                    <button type="submit" className="btn btn-primary">
                                        Log In
                                    </button>
                                </div>

                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

