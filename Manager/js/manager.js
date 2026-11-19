let role = "manager";
let dashboardEntity = "inventory";
let dashboardColumns = ["name", "quantity", "threshold"];
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

function today() {
    let now = new Date();
    let month = now.getMonth() + 1;
    let day = now.getDate();
    return now.getFullYear() + "-" + (month < 10 ? "0" : "") + month + "-" + (day < 10 ? "0" : "") + day;
}

function myRecords(key) {
    return readData(key);
}

function relatedRecords(key) {
    if (key === "chefs") {
        let staff = readData("staff");
        let chefs = [];
        for (let i = 0; i < staff.length; i++) {
            if (staff[i].role === "Chef" && staff[i].status === "Active") {
                chefs.push(staff[i]);
            }
        }
        return chefs;
    }
    if (key === "completedOrders") {
        let orders = myRecords("orders");
        let completed = [];
        for (let i = 0; i < orders.length; i++) {
            if (orders[i].status === "Completed") {
                completed.push(orders[i]);
            }
        }
        return completed;
    }
    let rows = myRecords(key);
    let result = [];
    for (let i = 0; i < rows.length; i++) {
        let r = rows[i];
        if (r.status === "Inactive" || r.status === "Archived" || r.status === "Retired" || r.status === "Cancelled" || r.status === "Disabled" || r.status === "Unavailable" || r.availability === "Unavailable") {
            continue;
        }
        if (key === "coupons" && (r.expiry < today() || remainingCoupon(r.id) <= 0)) {
            continue;
        }
        result.push(r);
    }
    return result;
}

function recordLabel(key, id) {
    if (id === "" || id === undefined || id === null) {
        return "—";
    }
    if (key === "chefs") {
        key = "staff";
    }
    if (key === "completedOrders") {
        key = "orders";
    }
    let r = findRecord(key, id);
    if (!r) {
        return "#" + id;
    }
    if (key === "tables") {
        return r.number;
    }
    if (key === "recipes") {
        return recordLabel("menu", r.menu);
    }
    if (key === "coupons") {
        return r.code;
    }
    if (key === "reservations") {
        return "#" + r.id + " / " + recordLabel("tables", r.table);
    }
    if (key === "orders") {
        return "Order #" + r.id;
    }
    return r.name || "#" + r.id;
}

function displayValue(key, column, row) {
    if (key === "reservations" && column === "table" && page === "dashboard") {
        return "Table for " + row.guests;
    }
    let value = row[column];
    let fields = definitions[key] ? definitions[key].fields : [];
    for (let i = 0; i < fields.length; i++) {
        let field = fields[i];
        if (field.key !== column) {
            continue;
        }
        if (field.type === "select" && typeof field.options === "string") {
            return recordLabel(field.options, value);
        }
    }
    if (column === "quantity" && key === "inventory" && (page === "dashboard" || page === "reports")) {
        return value + " " + row.unit;
    }
    if (column === "threshold" && key === "inventory" && (page === "dashboard" || page === "reports")) {
        return value + " " + row.unit;
    }
    return value === undefined || value === "" ? "—" : value;
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
        if (page === "dashboard" || page === "reports") {
            addAction(actions, (entity === "inventory" && row.quantity < row.threshold ? "Restock" : "Edit"), function () {
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
    setCount("tables", myRecords("tables").length);
    setCount("suppliers", myRecords("suppliers").length);
    let stock = readData("inventory");
    let low = 0;
    for (let i = 0; i < stock.length; i++) {
        if (stock[i].status === "Active" && stock[i].quantity < stock[i].threshold) {
            low++;
        }
    }
    setCount("low", low);
}

function fillSelect(select, key, selected) {
    select.innerHTML = "";
    let first = document.createElement("option");
    first.value = "";
    first.innerText = "Select";
    select.appendChild(first);
    let rows = relatedRecords(key);
    let found = false;
    for (let i = 0; i < rows.length; i++) {
        let option = document.createElement("option");
        option.value = rows[i].id;
        option.innerText = recordLabel(key, rows[i].id);
        if (key === "tables") {
            option.innerText += " (" + rows[i].capacity + " seats)";
        }
        select.appendChild(option);
        if (rows[i].id == selected) {
            found = true;
        }
    }
    if (selected && !found) {
        let option = document.createElement("option");
        option.value = selected;
        option.innerText = recordLabel(key, selected);
        select.appendChild(option);
    }
    select.value = selected || "";
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

function remainingCoupon(id) {
    let coupon = findRecord("coupons", id);
    if (!coupon) {
        return 0;
    }
    let orders = readData("orders");
    let used = 0;
    for (let i = 0; i < orders.length; i++) {
        if (orders[i].coupon == id && orders[i].status !== "Cancelled" && orders[i].id !== editId) {
            used++;
        }
    }
    return coupon.limit - used;
}

function openForm(id) {
    closePanels();
    let row = id ? findRecord(entity, id) : null;
    if (row && !canEdit(row)) {
        return;
    }
    if (row && myRecords(entity).indexOf(row) === -1) {
        let allowed = false;
        let records = myRecords(entity);
        for (let i = 0; i < records.length; i++) {
            if (records[i].id === row.id) {
                allowed = true;
            }
        }
        if (!allowed) {
            return;
        }
    }
    editId = row ? row.id : 0;
    let form = document.getElementById("record-form");
    form.reset();
    document.getElementById("form-error").innerText = "";
    document.getElementById("form-heading").innerText = row ? "Edit record" : "Add record";
    let fields = definitions[entity].fields;
    for (let i = 0; i < fields.length; i++) {
        let field = fields[i];
        let value = row ? row[field.key] : "";
        {
            let el = document.getElementById(field.key);
            if (field.type === "select" && typeof field.options === "string") {
                fillSelect(el, field.options, value);
            }
            else {
                if (field.type === "select") {
                    let temporary = el.querySelector("option[data-temporary]");
                    if (temporary) {
                        el.removeChild(temporary);
                    }
                }
                if (field.type === "select" && value && field.options.indexOf(value) === -1) {
                    let opt = document.createElement("option");
                    opt.value = value;
                    opt.innerText = value;
                    opt.setAttribute("data-temporary", "yes");
                    el.appendChild(opt);
                }
                el.value = value === undefined ? "" : value;
            }
            if (!row && field.key === "date") {
                el.value = today();
            }
            if (!row && field.key === "status") {
                el.value = field.options[0];
            }
            if (!row && field.key === "availability") {
                el.value = "Available";
            }
        }
    }
    let panel = document.getElementById("form-panel");
    panel.hidden = false;
    panel.scrollIntoView({
        block: "nearest"
    });
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
    if (entity === "tables") {
        let key = entity === "tables" ? "number" : "code";
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
            records[i].status = archive[entity];
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
    currentUser = findRecord("staff", 3);
    if (page === "profile") {
        loadProfile();
        return;
    }
    if (page === "dashboard" || page === "reports") {
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
