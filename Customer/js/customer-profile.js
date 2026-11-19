function profileKey() {
    return "customers";
}

function loadProfile() {
    document.getElementById("profile-name").value = currentUser.name;
    document.getElementById("profile-email").value = currentUser.email;
    document.getElementById("profile-phone").value = currentUser.phone || "";
    photo = currentUser.photo || "";
    if (photo) {
        let img = document.getElementById("profile-photo");
        img.src = photo;
        img.hidden = false;
    }
}

function previewPhoto() {
    let file = document.getElementById("profile-image").files[0];
    if (!file) {
        return;
    }
    if (file.size > 300000 || file.type.indexOf("image/") !== 0) {
        document.getElementById("profile-message").innerText = "Choose an image under 300 KB.";
        return;
    }
    let reader = new FileReader();
    reader.onload = function () {
        photo = reader.result;
        let img = document.getElementById("profile-photo");
        img.src = photo;
        img.hidden = false;
    };
    reader.readAsDataURL(file);
}

function saveProfile() {
    let name = document.getElementById("profile-name").value.trim();
    let email = document.getElementById("profile-email").value.trim();
    let msg = document.getElementById("profile-message");
    if (!name) {
        msg.innerText = "Enter your name.";
        return false;
    }
    let all = readData("staff").concat(readData("customers"));
    for (let i = 0; i < all.length; i++) {
        if (!(all[i].id === currentUser.id && all[i].role === currentUser.role) && all[i].email.toLowerCase() === email.toLowerCase()) {
            msg.innerText = "Email already exists.";
            return false;
        }
    }
    let records = readData(profileKey());
    for (let i = 0; i < records.length; i++) {
        if (records[i].id === currentUser.id) {
            records[i].name = name;
            records[i].email = email;
            records[i].phone = document.getElementById("profile-phone").value;
            records[i].photo = photo;
            currentUser = records[i];
        }
    }
    writeData(profileKey(), records);
    msg.innerText = "Profile updated for this page.";
    return false;
}

function changePassword() {
    let msg = document.getElementById("profile-message");
    if (document.getElementById("old-password").value !== "restaurant123") {
        msg.innerText = "Current demo password is incorrect.";
    }
    else if (document.getElementById("new-password").value !== document.getElementById("confirm-password").value) {
        msg.innerText = "Passwords do not match.";
    }
    else {
        msg.innerText = "Validation passed. Password changes require the server phase.";
    }
    return false;
}

function deactivateProfile() {
    if (!confirm("Deactivate your account?")) {
        return;
    }
    let records = readData(profileKey());
    for (let i = 0; i < records.length; i++) {
        if (records[i].id === currentUser.id) {
            records[i].status = "Inactive";
        }
    }
    writeData(profileKey(), records);
    logout();
    window.location.href = "../../Admin/html/index.html";
}
