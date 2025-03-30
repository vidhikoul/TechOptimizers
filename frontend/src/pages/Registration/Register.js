import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Registrationvalidation } from "./Registrationvalidation";

const RegisterPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    uid: "",         // Email
    password: "",
    confirm_password: "",
    termsAccepted: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);  // For showing loading spinner on form submission

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (e) => {
    setFormData({ ...formData, termsAccepted: e.target.checked });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Log form data to check its values before sending it
    console.log("Form Data before submission:", formData);

    // Run validation
    const validationErrors = Registrationvalidation(formData);
    setErrors(validationErrors);

    // If there are validation errors, stop submission
    if (Object.keys(validationErrors).length > 0) {
      console.log("Validation errors:", validationErrors);
      return;
    }

    // Check if terms are accepted
    if (!formData.termsAccepted) {
      alert("You must accept the Terms of Use and Privacy Policy.");
      return;
    }

    // Show loading spinner while waiting for the response
    setLoading(true);

    try {
      console.log("Sending POST request to backend...");
      // Send the form data to the backend
      const res = await axios.post("http://localhost:5001/api/auth/register", formData);
      console.log("Response from backend:", res);

      // If registration is successful, navigate to the login page or desired page
      navigate("/Login");  // Redirect to the login page after successful registration
    } catch (err) {
      console.error("Registration error:", err);
      alert("Registration failed. Please try again later.");
    } finally {
      // Hide loading spinner once the request is complete
      setLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    navigate("/Login");  // Ensure this route is correct
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
          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="mb-3">
              <input
                type="email"
                name="uid"
                placeholder="Email"
                value={formData.uid}
                onChange={handleInputChange}
                className="form-control"
                required
              />
              {errors.uid && <span className="text-danger">{errors.uid}</span>}
            </div>

            {/* Password Field */}
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

            {/* Terms and Conditions Checkbox */}
            <div className="form-check mb-3">
              <input
                type="checkbox"
                id="terms"
                checked={formData.termsAccepted}
                onChange={handleCheckboxChange}
                className="form-check-input"
              />
              <label htmlFor="terms" className="form-check-label">
                I agree to the <a href="#">Terms of Use</a> and <a href="#">Privacy Policy</a>
              </label>
            </div>
            {errors.termsAccepted && <span className="text-danger">{errors.termsAccepted}</span>}

            {/* Submit Button */}
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? <span>Loading...</span> : "CREATE ACCOUNT"}
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
