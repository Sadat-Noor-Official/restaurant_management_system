let role = "customer";
let dashboardEntity = "reservations";
let dashboardColumns = ["table", "date", "status"];
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
    let records = readData(key);
    let result = [];
    for (let i = 0; i < records.length; i++) {
        let row = records[i];
        if (key === "reservations" || key === "orders" || key === "reviews" || key === "requests") {
            if (currentUser && row.user == currentUser.id) {
                result.push(row);
            }
        }
        else {
            result.push(row);
        }
    }
    return result;
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
        if (field.type === "items") {
            let parts = [];
            for (let j = 0; j < value.length; j++) {
                parts.push(recordLabel(field.options, value[j].id) + " × " + value[j].quantity);
            }
            return parts.join(", ");
        }
    }
    if (column === "quantity" && key === "inventory" && (page === "dashboard")) {
        return value + " " + row.unit;
    }
    if (column === "threshold" && key === "inventory" && (page === "dashboard")) {
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
    if (entity === "orders") {
        return row.status === "Pending";
    }
    if (entity === "reservations") {
        return row.status !== "Cancelled" && new Date(row.date + "T" + row.time) > new Date() && row.date >= today();
    }
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
        if (page === "browse" && row.availability !== "Available") {
            continue;
        }
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
        if (page === "dashboard" || page === "browse") {
            addAction(actions, page === "browse" ? "Order" : ("Edit"), function () {
                if (page === "browse") {
                    window.location.href = "customer-orders.html?item=" + row.id;
                }
                else {
                    window.location.href = role + "-" + entity + ".html?edit=" + row.id;
                }
            }, page !== "browse" && !canEdit(row));
        }
        else {
            addAction(actions, "View", function () {
                viewRecord(row.id);
            });
            addAction(actions, "Edit", function () {
                openForm(row.id);
            }, !canEdit(row));
            let cancel = entity === "orders" || entity === "reservations";
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
    setCount("reservations", myRecords("reservations").length);
    setCount("orders", myRecords("orders").length);
    setCount("reviews", myRecords("reviews").length);
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
        if (key === "menu" && entity === "orders") {
            option.innerText += " (BDT " + rows[i].price + ")";
        }
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

function itemField() {
    let fields = definitions[entity].fields;
    for (let i = 0; i < fields.length; i++) {
        if (fields[i].type === "items") {
            return fields[i];
        }
    }
    return null;
}

function addItem(item) {
    let field = itemField();
    let holder = document.getElementById(field.key + "-rows");
    let row = document.createElement("div");
    row.className = "item-row";
    let select = document.createElement("select");
    select.required = true;
    select.setAttribute("aria-label", field.label);
    fillSelect(select, field.options, item ? item.id : "");
    let quantity = document.createElement("input");
    quantity.type = "number";
    quantity.min = entity === "orders" ? "1" : "0.001";
    quantity.step = entity === "orders" ? "1" : "any";
    quantity.required = true;
    quantity.value = item ? item.quantity : 1;
    quantity.setAttribute("aria-label", "Quantity");
    let remove = document.createElement("button");
    remove.type = "button";
    remove.className = "secondary";
    remove.innerText = "Remove";
    remove.onclick = function () {
        if (holder.children.length > 1) {
            holder.removeChild(row);
        }
        updateTotal();
    };
    select.onchange = updateTotal;
    quantity.oninput = updateTotal;
    row.appendChild(select);
    row.appendChild(quantity);
    row.appendChild(remove);
    holder.appendChild(row);
    updateTotal();
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

function orderTotal(items, couponId) {
    let amount = 0;
    for (let i = 0; i < items.length; i++) {
        amount += items[i].quantity * items[i].price;
    }
    let coupon = findRecord("coupons", couponId);
    if (coupon && coupon.status === "Active" && coupon.expiry >= today() && remainingCoupon(couponId) > 0) {
        amount = amount * (100 - coupon.discount) / 100;
    }
    return Math.round(amount * 100) / 100;
}

function updateTotal() {
    if (entity !== "orders") {
        return;
    }
    let holder = document.getElementById("items-rows");
    let items = [];
    for (let i = 0; i < holder.children.length; i++) {
        let children = holder.children[i].children;
        let item = findRecord("menu", children[0].value);
        if (item) {
            items.push({
                id: item.id,
                quantity: Number(children[1].value),
                price: item.price
            });
        }
    }
    document.getElementById("item-total").innerText = "Total: BDT " + orderTotal(items, document.getElementById("coupon").value).toFixed(2);
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
        if (field.type === "items") {
            document.getElementById(field.key + "-rows").innerHTML = "";
            if (row && value.length) {
                for (let j = 0; j < value.length; j++) {
                    addItem(value[j]);
                }
            }
            else {
                addItem();
            }
        }
        else {
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
    if (entity === "orders") {
        document.getElementById("coupon").onchange = updateTotal;
        updateTotal();
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
        if (field.type === "items") {
            let holder = document.getElementById(field.key + "-rows");
            let items = [];
            for (let j = 0; j < holder.children.length; j++) {
                let children = holder.children[j].children;
                let item = findRecord(field.options, children[0].value);
                let quantity = Number(children[1].value);
                if (!item || quantity <= 0) {
                    return formError("Select an item and a positive quantity.");
                }
                if (entity === "orders" && (item.availability !== "Available" || quantity % 1 !== 0)) {
                    return formError("Select available menu items and whole quantities.");
                }
                for (let k = 0; k < items.length; k++) {
                    if (items[k].id === item.id) {
                        return formError("Each item must appear only once.");
                    }
                }
                let entry = {
                    id: item.id,
                    quantity: quantity
                };
                if (entity === "orders") {
                    entry.price = item.price;
                }
                items.push(entry);
            }
            row[field.key] = items;
        }
        else {
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
    if (entity === "reservations") {
        let table = findRecord("tables", row.table);
        if (!table || table.status !== "Available" || row.guests > table.capacity) {
            return formError("Select an available table with enough seats.");
        }
        let now = new Date();
        if (new Date(row.date + "T" + row.time) <= now && row.status !== "Cancelled") {
            return formError("Choose a future booking time.");
        }
        for (let i = 0; i < records.length; i++) {
            if (row.status !== "Cancelled" && records[i].id !== row.id && records[i].status !== "Cancelled" && records[i].table === row.table && records[i].date === row.date && records[i].time === row.time) {
                return formError("This table is already booked at that time.");
            }
        }
        row.user = currentUser.id;
    }
    if (entity === "orders") {
        if (row.coupon && remainingCoupon(row.coupon) <= 0) {
            return formError("Coupon usage limit reached.");
        }
        let coupon = row.coupon ? findRecord("coupons", row.coupon) : null;
        if (row.coupon && (!coupon || coupon.status !== "Active" || coupon.expiry < today())) {
            return formError("Coupon is not active.");
        }
        row.total = orderTotal(row.items, row.coupon);
        row.user = currentUser.id;
        row.date = old ? old.date : today();
    }
    if (entity === "reviews") {
        let order = findRecord("orders", row.order);
        if (!order || order.status !== "Completed" || order.user !== currentUser.id) {
            return formError("Choose your completed order.");
        }
        for (let i = 0; i < records.length; i++) {
            if (records[i].id !== row.id && records[i].order === row.order) {
                return formError("This order already has a review.");
            }
        }
        row.user = currentUser.id;
        row.date = old ? old.date : today();
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
    if (entity === "orders") {
        let p = document.createElement("p");
        p.innerText = "Total (BDT): " + row.total;
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
    let cancel = entity === "orders" || entity === "reservations";
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
    currentUser = findRecord("customers", 1);
    if (page === "profile") {
        loadProfile();
        return;
    }
    if (page === "dashboard") {
        entity = dashboardEntity;
        columns = dashboardColumns;
        renderCounts();
    }
    else if (page === "browse") {
        entity = "menu";
        columns = ["name", "category", "price", "availability"];
    }
    else if (definitions[entity]) {
        columns = definitions[entity].cols;
    }
    renderTable();
    let params = new URLSearchParams(window.location.search);
    if (params.get("edit") && document.getElementById("record-form")) {
        openForm(Number(params.get("edit")));
    }
    if (page === "orders" && params.get("item")) {
        openForm();
        let select = document.getElementById("items-rows").children[0].children[0];
        select.value = params.get("item");
        updateTotal();
    }
}

function logout() {
    currentUser = null;
}
