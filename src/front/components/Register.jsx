import userServices from "../services/recetea_API/userServices";
import { useState } from "react";

export const Register = () => { //definimos parametros
    const [formData, setFormData] = useState({
        UserName: "",
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.prevent.default(); //para que no recargue la pagina
        try {
            const response = await userServices.signup(formData);
            if (response && !response.message?.includes("error")) {
                alert("Username created!")
            } else {
                alert("Error: " + response.message || response.error);
            }
        } catch (error) {
            console.error("Register failed", error);
            alert("Register gone wrong.");
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-12 col-sm-8 col-md-6 col-lg-4">
                        <div className="card p-4 shadow">

                            {/* Título centrado y margen inferior */}
                            <h3 className="text-center mb-4">Wellcome Chef!</h3>

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="InputUserName" className="form-label">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        required
                                        className="form-control"
                                        id="InputUserName"
                                    />
                                </div>

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
                                        aria-describedby="emailHelp"
                                    />
                                    <div id="emailHelp" className="form-text">
                                        We'll never share your email.
                                    </div>
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
                                        Register
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


