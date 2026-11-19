function login() {
    let selectedRole = document.getElementById("login-role").value;
    let email = document.getElementById("login-email").value.trim().toLowerCase();
    let password = document.getElementById("login-password").value;
    let records = readData(selectedRole === "Customer" ? "customers" : "staff");
    for (let i = 0; i < records.length; i++) {
        let user = records[i];
        if (user.email.toLowerCase() === email && user.role === selectedRole && user.status === "Active" && password === "restaurant123") {
            if (selectedRole === "Admin") {
                window.location.href = "admin-dashboard.html";
            }
            else {
                window.location.href = "../../" + selectedRole + "/html/" + selectedRole.toLowerCase() + "-dashboard.html";
            }
            return false;
        }
    }
    document.getElementById("auth-message").innerText = "Invalid role, email or password.";
    return false;
}

function registerCustomer() {
    let msg = document.getElementById("auth-message");
    let name = document.getElementById("register-name").value.trim();
    let email = document.getElementById("register-email").value.trim().toLowerCase();
    let password = document.getElementById("register-password").value;
    if (!name || password !== document.getElementById("register-confirm").value) {
        msg.innerText = "Enter your name and matching passwords.";
        return false;
    }
    let records = readData("customers");
    let all = records.concat(readData("staff"));
    for (let i = 0; i < all.length; i++) {
        if (all[i].email.toLowerCase() === email) {
            msg.innerText = "Email already exists.";
            return false;
        }
    }
    msg.innerText = "Registration form validated. Account creation requires the server phase.";
    return false;
}

function resetPassword() {
    let msg = document.getElementById("auth-message");
    if (document.getElementById("reset-new-password").value !== document.getElementById("reset-confirm").value) {
        msg.innerText = "Passwords do not match.";
    }
    else {
        msg.innerText = "Validation passed. Password reset requires the server phase.";
    }
    return false;
}
