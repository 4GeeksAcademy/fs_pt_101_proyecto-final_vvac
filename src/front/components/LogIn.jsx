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
            const data = await userServices.login(formData);
            
            // Ensure token exists before saving
            if (data.token) { 
                const payload = JSON.parse(atob(data.token.split('.')[1]));
                const userId = payload.sub;

                //Will store user_id and token to make more easier to access
                const userData = {
                    ...data,
                    user_id: userId
                };

                localStorage.setItem('user', JSON.stringify(userData));

                if (data.success){
                // Add navigate here after we have made the route
                dispatch({type: 'logIn', payload:userData});
                navigate("/")
                console.log(userData, "user logged");
                
                } else{
                    window.alert(data.message)
                    navigate("/demo")
                }
            }

        } catch(error){
            console.log("Login error:", error);
            window.alert("Something went wrong. Please try again.")
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

