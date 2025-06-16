import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

//hooks
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

//services
import userServices from "../services/recetea_API/userServices.js"

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
            console.log("Login response data:", data);
            
            // Ensure token exists before saving
            if (data.token) { 

                // Store token on store
                localStorage.setItem("token", data.token);

                // Store full user data on store to easy fetch
                localStorage.setItem("user", JSON.stringify(data.user));
                console.log(data.user);
                

                if (data.success){
                    // Dispatch user data including token if needed
                    dispatch({ type: "logIn", payload: { token: data.token, user: data.user } });

                    //Will keep on home page but for users
                    navigate("/profile")
                
                } else{
                    //we can set another page here or change to a banner
                    window.alert(data.error)
                    navigate("/login")
                }
            }

        } catch(error){
            console.log("Login error:", error);
            window.alert("Something went wrong. Please try again.")
        }
    }    

    return (
        <div className="row d-flex mb-4">
            <div className="col-12 col-sm-8 col-md-6 col-lg-4 mx-auto">
                <div className="card p-4 shadow recipe_card_bg1 mx-auto">
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

                        <h4 className="mb-0 mt-3 text-end fs-6">
                            {/* Need to add link to forgot password page*/}
                            Forgot your password?
                        </h4>

                        <p className="mb-0 mt-3 text-end fs-6">
                            Are you not registered yet?
                            {/* Need to add link to sign up page */}
                            <Link to="/register" className="text-decoration-none">
                                <span className="text-danger fw-bold"> Sign Up here!</span>
                            </Link>
                            
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};