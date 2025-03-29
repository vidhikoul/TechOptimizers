import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; 
import { Registrationvalidation } from "./Registrationvalidation";

const RegisterPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    user_name: "",
    password: "",
    confirm_password: "",
    role: "admin",  // Default role
    termsAccepted: false,
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (e) => {
    setFormData({ ...formData, termsAccepted: e.target.checked });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Run validation
    const validationErrors = Registrationvalidation(formData);
    setErrors(validationErrors);

    // If there are validation errors, stop submission
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    if (!formData.termsAccepted) {
      alert("You must accept the Terms of Use and Privacy Policy.");
      return;
    }

    axios
      .post("http://localhost:8800/Registration", formData)
      .then((res) => {
        console.log("Registration successful:", res.data);
        navigate("/");
      })
      .catch((err) => console.log("Registration error:", err));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    navigate("/"); 
  };

  return (
    <div className="container-fluid vh-100 d-flex align-items-center justify-content-center">
      <div className="row w-100 shadow-lg rounded overflow-hidden bg-white">
        {/* Image Section */}
        <div className="col-md-6 d-flex align-items-center justify-content-center bg-light">
          <img
            src="login.png"
            alt="Illustration"
            className="img-fluid"
            style={{ maxHeight: "400px", objectFit: "contain" }}
          />
        </div>

        {/* Form Section */}
        <div className="col-md-6 p-5">
          <h2 className="mb-4">REGISTER</h2>
          {/* <p className="text-muted mb-4 font-weight-bold">
            Manage inventory<br />Track & organize your inventory with ease
          </p> */}
          <form onSubmit={handleSubmit}>
            <div className="row g-3 mb-3">
              <div className="col-6">
                <input
                  type="text"
                  name="first_name"
                  placeholder="First name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                />
                {errors.first_name && <span className="text-danger">{errors.first_name}</span>}
              </div>
              <div className="col-6">
                <input
                  type="text"
                  name="last_name"
                  placeholder="Last name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                />
                {errors.last_name && <span className="text-danger">{errors.last_name}</span>}
              </div>
            </div>
            <div className="mb-3">
              <input
                type="email"
                name="user_name"
                placeholder="Email"
                value={formData.user_name}
                onChange={handleInputChange}
                className="form-control"
                required
              />
              {errors.user_name && <span className="text-danger">{errors.user_name}</span>}
            </div>
            <div className="mb-3">
              <input
                type="password"
                name="password"
                placeholder="Password (8 characters required)"
                value={formData.password}
                onChange={handleInputChange}
                className="form-control"
                required
              />
              {errors.password && <span className="text-danger">{errors.password}</span>}
            </div>
            {/* Confirm Password Field */}
            <div className="mb-3">
              <input
                type="password"
                name="confirm_password"
                placeholder="Confirm Password"
                value={formData.confirm_password}
                onChange={handleInputChange}
                className="form-control"
                required
              />
              {errors.confirm_password && <span className="text-danger">{errors.confirm_password}</span>}
            </div>
            {/* Role Dropdown */}
            <div className="mb-3">
  {/* <select
    name="role"
    value={formData.role}
    onChange={handleInputChange}  // This ensures selection updates correctly
    className="form-control"
  >
    <option value="admin">Admin</option>
    <option value="operator">Operator</option>
    <option value="manager">Manager</option>
    <option value="security_guard">Security Guard</option>
  </select> */}
  {errors.role && <span className="text-danger">{errors.role}</span>}
</div>

            <div className="form-check mb-3">
              {/* <input
                type="checkbox"
                id="terms"
                checked={formData.termsAccepted}
                onChange={handleCheckboxChange}
                className="form-check-input"
              /> */}
              {/* <label htmlFor="terms" className="form-check-label">
                I agree to all <a href="#">Terms of Use</a> and <a href="#">Privacy Policy</a>
              </label> */}
            </div>
            <button type="submit" className="btn btn-primary w-100">
              CREATE ACCOUNT
            </button>
          </form>
          <p className="text-center mt-4">
            Already have an account?{" "}
            <a href="#" onClick={handleLogin}>Log in</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
