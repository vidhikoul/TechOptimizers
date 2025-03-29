export const Registrationvalidation = (formData) => {
    const errors = {};
  
    // First Name validation
    // Uncomment and add validation for first_name if needed
    // if (!formData.first_name || !formData.first_name.trim()) {
    //   errors.first_name = "First name is required";
    // } else if (!/^[A-Za-z]+$/.test(formData.first_name)) {
    //   errors.first_name = "First name must contain only letters";
    // }
  
    // Last Name validation
    // Uncomment and add validation for last_name if needed
    // if (!formData.last_name || !formData.last_name.trim()) {
    //   errors.last_name = "Last name is required";
    // } else if (!/^[A-Za-z]+$/.test(formData.last_name)) {
    //   errors.last_name = "Last name must contain only letters";
    // }
  
    // Email validation (Username)
    if (!formData.uid || !formData.uid.trim()) {
      errors.uid = "Email is required";
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.uid)) {
      errors.uid = "Invalid email format";
    }
  
    // Password validation
    if (!formData.password || !formData.password.trim()) {
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
    if (!formData.confirm_password || !formData.confirm_password.trim()) {
      errors.confirm_password = "Confirm password is required";
    } else if (formData.password !== formData.confirm_password) {
      errors.confirm_password = "Passwords do not match";
    }
  
    // Role validation
    // const validRoles = ["admin", "operator", "manager", "security_guard"];
    // if (!formData.role || !formData.role.trim()) {
    //   errors.role = "Please select a role";
    // } else {
    //   const normalizedRole = formData.role.toLowerCase().replace(" ", "_");
    //   if (!validRoles.includes(normalizedRole)) {
    //     errors.role = "Invalid role selected";
    //   }
    // }
  
    // Terms & Conditions validation
    if (!formData.termsAccepted) {
      errors.termsAccepted = "You must accept the Terms of Use and Privacy Policy";
    }
  
    return errors;
  };
  