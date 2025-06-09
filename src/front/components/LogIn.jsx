import userServices from "../services/Recetea API/userServices";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

//hooks
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

//services
import userServices from "../services/recetea_API/userServices.js"

<<<<<<< HEAD
 export const LogIn = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value});
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
                            <h3>Let's cook Chef!</h3>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label for="exampleInputEmail1" class="form-label">
                                        Email address
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
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
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary">
                                    Log In
                                </button>
                            </form>
                        </div>
=======
export const LogIn = () => {

    const {store, dispatch} = useGlobalReducer();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    })

    const handleChange = e => {
        setFormData({
            ...formData, 
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await userServices.login(formData);
            
            if (data.success){
                // Add navigate here after we have made the route
                dispatch({type: 'logIn', payload:data});
                console.log(data, "user logged");
                
            } else{
                window.alert(data.message)
            }
        } catch(error){
            window.alert(error)
        }
    }

    return (
        <div className="containerf-fluid">
            <div className="row justify-content-center mx-auto">
                <div className="col-12 col-sm-8 col-md-6 col-lg-4">
                    <div className="card p-4 shadow recipe_card_bg1">
                        <h3 className="mb-3 text-center text-danger">Let's cook Chef!</h3>
                        <form onSubmit={handleSubmit} className="mt-2">
                            <div className="mb-4 fs-4">
                                <label htmlFor="exampleInputEmail1" className="form-label mb-2">Email</label>
                                <input 
                                type="email"
                                value={formData.email}
                                name="email"
                                onChange={handleChange}
                                className="form-control fs-4" 
                                id="exampleInputEmail1" 
                                aria-describedby="emailHelp"/>
                            </div>
                            <div className="mb-3 fs-4">
                                <label htmlFor="exampleInputPassword1" className="form-label mb-2">Password</label>
                                <input 
                                type="password"
                                value={formData.password} 
                                name="password"
                                onChange={handleChange}
                                className="form-control fs-4" 
                                id="exampleInputPassword1"/>
                            </div>
                            <button type="submit" className="btn btn-danger mt-2 fs-5">Log In</button>

                            <h4 className="mb-0 mt-3 text-end fs-5">
                                {/* Need to add link to forgot password page*/}
                                Forgot your password?
                            </h4>

                            <p className="mb-0 mt-3 text-end fs-5">
                                Are you not registered yet?
                                {/* Need to add link to sign up page */}
                                <span className="text-danger fw-bold"> Sign Up here!</span>
                            </p>
                        </form>
>>>>>>> 01690acfbc95836eb03a37925233d3018827796a
                    </div>
                </div>
            </div>
        </div>
    );
<<<<<<< HEAD
};

=======
};
>>>>>>> 01690acfbc95836eb03a37925233d3018827796a
