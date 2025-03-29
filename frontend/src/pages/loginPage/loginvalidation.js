function LoginValidation(values) {
    let error = {};

    // Email validation pattern (checks for valid email format)
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 

    // Password validation pattern:
    // - At least 8 characters
    // - At least one uppercase letter
    // - At least one lowercase letter
    // - At least one number
    const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

    // Validate email
    if (!values.user_name.trim()) {
        error.user_name = "Email should not be empty";
    } else if (!emailPattern.test(values.user_name)) {
        error.user_name = "Invalid email format";
    }

    // Validate password
    if (!values.password.trim()) {
        error.password = "Password should not be empty";
    } else if (!passwordPattern.test(values.password)) {
        error.password = "Password must be at least 8 characters long, contain one uppercase letter, one lowercase letter, and one number";
    }

    return error;
}

export default LoginValidation;
