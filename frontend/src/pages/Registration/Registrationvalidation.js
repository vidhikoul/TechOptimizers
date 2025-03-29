export const Registrationvalidation = (formData) => {
    const errors = {};

    // First Name validation
    if (!formData.first_name.trim()) {
        errors.first_name = "First name is required";
    } else if (!/^[A-Za-z]+$/.test(formData.first_name)) {
        errors.first_name = "First name must contain only letters";
    }

    // Last Name validation
    if (!formData.last_name.trim()) {
        errors.last_name = "Last name is required";
    } else if (!/^[A-Za-z]+$/.test(formData.last_name)) {
        errors.last_name = "Last name must contain only letters";
    }

    // Email validation (Username)
    if (!formData.user_name.trim()) {
        errors.user_name = "Email is required";
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.user_name)) {
        errors.user_name = "Invalid email format";
    }

    // Password validation
    if (!formData.password) {
        errors.password = "Password is required";
    } else if (formData.password.length < 8) {
        errors.password = "Password must be at least 8 characters";
    } else if (!/[A-Z]/.test(formData.password)) {
        errors.password = "Password must contain at least one uppercase letter";
    } else if (!/[a-z]/.test(formData.password)) {
        errors.password = "Password must contain at least one lowercase letter";
    } else if (!/[0-9]/.test(formData.password)) {
        errors.password = "Password must contain at least one number";
    } else if (!/[\W_]/.test(formData.password)) {
        errors.password = "Password must contain at least one special character";
    }

    // Confirm Password validation
    if (!formData.confirm_password) {
        errors.confirm_password = "Confirm password is required";
    } else if (formData.password !== formData.confirm_password) {
        errors.confirm_password = "Passwords do not match";
    }

    // Role validation (Fixed case sensitivity)
    const validRoles = ["admin", "operator", "manager", "security_guard"];
    if (!formData.role) {
        errors.role = "Please select a role";
    } else if (!validRoles.includes(formData.role.toLowerCase().replace(" ", "_"))) {
        errors.role = "Invalid role selected";
    }

    // Terms & Conditions validation
    if (!formData.termsAccepted) {
        errors.termsAccepted = "You must accept the Terms of Use and Privacy Policy";
    }

    return errors;
};
