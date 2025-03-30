import React, { useState } from "react";
import Validation from "./loginvalidation";
import { useNavigate } from "react-router-dom"; 
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const LoginPage = ({ setIsLoggedIn }) => {
    const navigate = useNavigate();

    const [values, setValues] = useState({
        uid: "",
        password: ""
    });

    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");

    const handleInput = (event) => {
        const { name, value } = event.target;
        setValues((prev) => ({ ...prev, [name]: value }));
    };

    const handleLogin = async (e) => {
        e.preventDefault(); 

        setServerError(""); 

        const validationErrors = Validation(values);
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            return; 
        }

        try {
            const res = await axios.post("http://localhost:5001/api/auth/login", values);
            console.log("Login successful:", res.data);

            if (setIsLoggedIn) {
                setIsLoggedIn(true);
            }

            // Redirect to SQL Generator page after successful login
            navigate("/SQLGenerator", { replace: true }); 
        } catch (err) {
            console.error("Login error:", err);

            if (err.response && err.response.data) {
                setServerError(err.response.data.error); 
            } else {
                setServerError("Login failed. Please try again.");
            }
        }
    };

    const handleSignUp = () => {
        navigate("/Registration");
    };

    return (
        <div className="container-fluid vh-100 d-flex align-items-center justify-content-center">
            <div className="row w-100">
                <div className="col-md-5 d-flex flex-column justify-content-center">
                    <h2 className="mb-3">LOG IN</h2>
                    <h5 className="mb-4">Welcome! Please login with your credentials</h5>

                    {serverError && <div className="alert alert-danger">{serverError}</div>} 

                    <form onSubmit={handleLogin}> 
                        <div className="mb-3">
                            <label className="form-label">Username*</label>
                            <input
                                type="email"
                                className="form-control"
                                placeholder="Enter email as username"
                                name="uid"
                                value={values.uid}
                                onChange={handleInput}
                                required
                            />
                            {errors.uid && <span className="text-danger">{errors.uid}</span>}
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Password*</label>
                            <input
                                type="password"
                                className="form-control"
                                placeholder="Enter password"
                                name="password"
                                value={values.password}
                                onChange={handleInput}
                                required
                            />
                            {errors.password && <span className="text-danger">{errors.password}</span>}
                        </div>
                        <button type="submit" className="btn btn-dark w-100" onClick={handleLogin}>LOGIN</button>
                    </form>

                    <p className="mt-3">
                        Don’t have an account? <a href="#" className="text-primary" onClick={handleSignUp}>Sign up</a>
                    </p>
                </div>
                <div className="col-md-6 d-flex align-items-center justify-content-center">
                    <img
                        src="login.png"
                        alt="Illustration"
                        className="img-fluid"
                        style={{ maxHeight: "400px", objectFit: "contain" }}
                    />
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
