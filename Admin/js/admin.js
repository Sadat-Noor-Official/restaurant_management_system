let role = "admin";
let dashboardEntity = "staff";
let dashboardColumns = ["name", "role", "status"];
let page = document.body.id;
let entity = page;
let columns = [];
let editId = 0;
let currentUser = null;
let photo = "";

function readData(key) {
    return initialData[key] || [];
}

function writeData(key, records) {
    initialData[key] = records;
}

function findRecord(key, id) {
    let records = readData(key);
    for (let i = 0; i < records.length; i++) {
        if (records[i].id == id) {
            return records[i];
        }
    }
    return null;
}

function nextId(records) {
    let id = 100;
    for (let i = 0; i < records.length; i++) {
        if (records[i].id >= id) {
            id = records[i].id + 1;
        }
    }
    return id;
}

function myRecords(key) {
    return readData(key);
}

function displayValue(key, column, row) {
    let value = row[column];
    if (value === undefined || value === "") {
        return "—";
    }
    return value;
}

function addAction(cell, text, handler, disabled) {
    let button = document.createElement("button");
    button.type = "button";
    button.className = "action";
    button.innerText = text;
    button.onclick = handler;
    button.disabled = disabled === true;
    cell.appendChild(button);
}

function canEdit(row) {
    return true;
}

function renderTable() {
    let body = document.getElementById("records");
    if (!body) {
        return;
    }
    body.innerHTML = "";
    let rows = myRecords(entity);
    let search = document.getElementById("search");
    let query = "";
    if (search) {
        query = search.value.toLowerCase().trim();
    }
    let count = 0;
    for (let i = 0; i < rows.length; i++) {
        let row = rows[i];
        let values = [];
        for (let j = 0; j < columns.length; j++) {
            values.push(displayValue(entity, columns[j], row));
        }
        if (values.join(" ").toLowerCase().indexOf(query) === -1) {
            continue;
        }
        let tr = document.createElement("tr");
        for (let j = 0; j < values.length; j++) {
            let td = document.createElement("td");
            td.innerText = values[j];
            tr.appendChild(td);
        }
        let actions = document.createElement("td");
        if (page === "dashboard") {
            addAction(actions, ("Edit"), function () {
                window.location.href = role + "-" + entity + ".html?edit=" + row.id;
            }, !canEdit(row));
        }
        else {
            addAction(actions, "View", function () {
                viewRecord(row.id);
            });
            addAction(actions, "Edit", function () {
                openForm(row.id);
            }, !canEdit(row));
            let cancel = false;
            addAction(actions, cancel ? "Cancel" : "Delete", function () {
                deleteRecord(row.id);
            }, cancel && !canEdit(row));
        }
        tr.appendChild(actions);
        body.appendChild(tr);
        count++;
    }
    if (count === 0) {
        let tr = document.createElement("tr");
        let td = document.createElement("td");
        td.colSpan = columns.length + 1;
        td.innerText = "No records found.";
        tr.appendChild(td);
        body.appendChild(tr);
    }
}

function setCount(id, num) {
    let el = document.getElementById("count-" + id);
    if (el) {
        el.innerText = num;
    }
}

function renderCounts() {
    setCount("staff", myRecords("staff").length);
    setCount("menu", myRecords("menu").length);
    setCount("coupons", myRecords("coupons").length);
}

function closePanels() {
    let form = document.getElementById("form-panel");
    let detail = document.getElementById("detail-panel");
    if (form) {
        form.hidden = true;
    }
    if (detail) {
        detail.hidden = true;
    }
}

function showNotice(text, good) {
    let el = document.getElementById("notice");
    if (!el) {
        return;
    }
    el.innerText = text;
    el.hidden = false;
    el.className = good ? "message success" : "message";
}

function openForm(id) {
    closePanels();
    editId = 0;
    let record = null;
    if (id) {
        record = findRecord(entity, id);
        if (record === null) {
            return;
        }
        editId = id;
    }

    document.getElementById("record-form").reset();
    document.getElementById("form-error").innerText = "";
    document.getElementById("form-heading").innerText = "Add record";
    if (record !== null) {
        document.getElementById("form-heading").innerText = "Edit record";
    }

    let fields = definitions[entity].fields;
    for (let i = 0; i < fields.length; i++) {
        let field = fields[i];
        let input = document.getElementById(field.key);
        if (record !== null) {
            input.value = record[field.key] || "";
            if (record[field.key] === 0) {
                input.value = 0;
            }
        } else if (field.key === "status") {
            input.value = field.options[0];
        } else if (field.key === "availability") {
            input.value = "Available";
        }
    }
    let panel = document.getElementById("form-panel");
    panel.hidden = false;
    panel.scrollIntoView();
}

function formError(text) {
    document.getElementById("form-error").innerText = text;
    return false;
}

function saveRecord() {
    let records = readData(entity);
    let old = editId ? findRecord(entity, editId) : null;
    let row = {};
    if (old) {
        row.id = editId;
    } else {
        row.id = nextId(records);
    }
    let fields = definitions[entity].fields;
    for (let i = 0; i < fields.length; i++) {
        let field = fields[i];
        {
            let value = document.getElementById(field.key).value.trim();
            if (field.required && value === "") {
                return formError("Please fill in " + field.label + ".");
            }
            if (field.type === "number") {
                row[field.key] = Number(value);
            } else {
                row[field.key] = value;
            }
            if (field.type === "select" && typeof field.options === "string" && value !== "") {
                row[field.key] = Number(value);
            }
        }
    }
    if (entity === "staff") {
        if (old && old.id === currentUser.id && old.role === role.charAt(0).toUpperCase() + role.slice(1) && (row.status !== "Active" || row.role !== old.role)) {
            return formError("Use your profile to deactivate your account.");
        }
        for (let i = 0; i < records.length; i++) {
            if (records[i].id !== row.id && records[i].email.toLowerCase() === row.email.toLowerCase()) {
                return formError("Email already exists.");
            }
        }
        let customers = readData("customers");
        for (let i = 0; i < customers.length; i++) {
            if (customers[i].email.toLowerCase() === row.email.toLowerCase()) {
                return formError("Email already exists.");
            }
        }
        if (old) {
            row.photo = old.photo || "";
        }
    }
    if (entity === "coupons") {
        let key = "code";
        for (let i = 0; i < records.length; i++) {
            if (records[i].id !== row.id && String(records[i][key]).toLowerCase() === String(row[key]).toLowerCase()) {
                return formError("This value already exists.");
            }
        }
    }
    if (old) {
        for (let i = 0; i < records.length; i++) {
            if (records[i].id === editId) {
                records[i] = row;
            }
        }
    }
    else {
        records.push(row);
    }
    writeData(entity, records);
    closePanels();
    renderTable();
    showNotice("Record saved for this page.", true);
    editId = 0;
    return false;
}

function viewRecord(id) {
    closePanels();
    let row = findRecord(entity, id);
    if (!row) {
        return;
    }
    let details = document.getElementById("details");
    details.innerHTML = "";
    let fields = definitions[entity].fields;
    for (let i = 0; i < fields.length; i++) {
        let p = document.createElement("p");
        p.innerText = fields[i].label + ": " + displayValue(entity, fields[i].key, row);
        details.appendChild(p);
    }
    document.getElementById("detail-panel").hidden = false;
}

function isReferenced(key, id) {
    let checks = {
        staff: [["tasks", "chef"], ["requests", "user"]],
        menu: [["recipes", "menu"], ["orders", "items"]],
        coupons: [["orders", "coupon"]],
        tables: [["reservations", "table"]],
        inventory: [["recipes", "ingredients"], ["requests", "item"]],
        suppliers: [["inventory", "supplier"]],
        recipes: [["tasks", "recipe"]]
    };
    let links = checks[key] || [];
    for (let i = 0; i < links.length; i++) {
        let rows = readData(links[i][0]);
        let field = links[i][1];
        for (let j = 0; j < rows.length; j++) {
            let value = rows[j][field];
            if (Array.isArray(value)) {
                for (let k = 0; k < value.length; k++) {
                    if (value[k].id == id) {
                        return true;
                    }
                }
            }
            else if (value == id) {
                return true;
            }
        }
    }
    return false;
}

function deleteRecord(id) {
    let records = readData(entity);
    let row = findRecord(entity, id);
    if (!row || !canEdit(row)) {
        return;
    }
    if (entity === "staff" && row.id === currentUser.id) {
        showNotice("Use your profile to manage your account.", false);
        return;
    }
    let cancel = false;
    if (!confirm(cancel ? "Cancel this record?" : "Delete this record?")) {
        return;
    }
    let archive = {
        staff: "Inactive",
        menu: "Unavailable",
        coupons: "Disabled",
        tables: "Unavailable",
        inventory: "Archived",
        suppliers: "Inactive",
        recipes: "Retired"
    };
    for (let i = 0; i < records.length; i++) {
        if (records[i].id !== id) {
            continue;
        }
        if (cancel) {
            records[i].status = "Cancelled";
        }
        else if (isReferenced(entity, id) && archive[entity]) {
            if (entity === "menu") {
                records[i].availability = archive[entity];
            }
            else {
                records[i].status = archive[entity];
            }
        }
        else {
            records.splice(i, 1);
        }
        break;
    }
    writeData(entity, records);
    closePanels();
    renderTable();
    showNotice(cancel ? "Record cancelled." : "Record removed or archived.", true);
}

function initializePage() {
    if (page === "index" || page === "register" || page === "reset-password") {
        return;
    }
    currentUser = findRecord("staff", 2);
    if (page === "profile") {
        loadProfile();
        return;
    }
    if (page === "settings") {
        return;
    }
    if (page === "dashboard") {
        entity = dashboardEntity;
        columns = dashboardColumns;
        renderCounts();
    }
    else if (definitions[entity]) {
        columns = definitions[entity].cols;
    }
    renderTable();
    let params = new URLSearchParams(window.location.search);
    if (params.get("edit") && document.getElementById("record-form")) {
        openForm(Number(params.get("edit")));
    }
}

function logout() {
    currentUser = null;
}
