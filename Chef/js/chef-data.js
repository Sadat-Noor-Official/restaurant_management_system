let definitions = {
    "recipes": {
        "title": "Recipes",
        "fields": [
            {
                "key": "menu",
                "label": "Menu item",
                "type": "select",
                "required": true,
                "options": "menu"
            },
            {
                "key": "ingredients",
                "label": "Ingredients",
                "type": "items",
                "required": true,
                "options": "inventory"
            },
            {
                "key": "instructions",
                "label": "Instructions",
                "type": "textarea",
                "required": true
            },
            {
                "key": "servings",
                "label": "Serving size",
                "type": "number",
                "required": true
            },
            {
                "key": "status",
                "label": "Status",
                "type": "select",
                "required": true,
                "options": [
                    "Active",
                    "Retired"
                ]
            }
        ],
        "cols": [
            "menu",
            "ingredients",
            "servings",
            "status"
        ]
    },
    "tasks": {
        "title": "Preparation tasks",
        "fields": [
            {
                "key": "name",
                "label": "Task",
                "type": "text",
                "required": true
            },
            {
                "key": "recipe",
                "label": "Recipe",
                "type": "select",
                "required": true,
                "options": "recipes"
            },
            {
                "key": "chef",
                "label": "Assigned chef",
                "type": "select",
                "required": true,
                "options": "chefs"
            },
            {
                "key": "date",
                "label": "Date",
                "type": "date",
                "required": true
            },
            {
                "key": "status",
                "label": "Progress",
                "type": "select",
                "required": true,
                "options": [
                    "Queued",
                    "Active",
                    "Ready",
                    "Completed",
                    "Cancelled"
                ]
            }
        ],
        "cols": [
            "name",
            "recipe",
            "chef",
            "status"
        ]
    },
    "requests": {
        "title": "Stock requests",
        "fields": [
            {
                "key": "item",
                "label": "Ingredient",
                "type": "select",
                "required": true,
                "options": "inventory"
            },
            {
                "key": "quantity",
                "label": "Quantity",
                "type": "number",
                "required": true
            },
            {
                "key": "notes",
                "label": "Notes",
                "type": "textarea",
                "required": false
            },
            {
                "key": "date",
                "label": "Date",
                "type": "date",
                "required": true
            },
            {
                "key": "status",
                "label": "Status",
                "type": "select",
                "required": true,
                "options": [
                    "Pending",
                    "Cancelled"
                ]
            }
        ],
        "cols": [
            "item",
            "quantity",
            "date",
            "status"
        ]
    }
};
let initialData = {
    "staff": [
        {
            "id": 1,
            "name": "Riya Rahman",
            "email": "chef@example.com",
            "phone": "",
            "role": "Chef",
            "status": "Active"
        },
        {
            "id": 2,
            "name": "Tanim Islam",
            "email": "admin@example.com",
            "phone": "",
            "role": "Admin",
            "status": "Active"
        },
        {
            "id": 3,
            "name": "Nadia Akter",
            "email": "manager@example.com",
            "phone": "",
            "role": "Manager",
            "status": "Active"
        }
    ],
    "customers": [
        {
            "id": 1,
            "name": "Customer",
            "email": "customer@example.com",
            "phone": "",
            "role": "Customer",
            "status": "Active"
        }
    ],
    "menu": [
        {
            "id": 1,
            "name": "Pasta",
            "category": "Main course",
            "description": "Pasta with sauce",
            "price": 350,
            "availability": "Available"
        },
        {
            "id": 2,
            "name": "Chicken",
            "category": "Main course",
            "description": "Grilled chicken",
            "price": 280,
            "availability": "Available"
        },
        {
            "id": 3,
            "name": "Burger",
            "category": "Main course",
            "description": "Chicken burger",
            "price": 220,
            "availability": "Available"
        }
    ],
    "coupons": [
        {
            "id": 1,
            "code": "WELCOME10",
            "discount": 10,
            "expiry": "2027-12-31",
            "limit": 20,
            "status": "Active"
        }
    ],
    "tables": [
        {
            "id": 1,
            "number": "T01",
            "capacity": 2,
            "location": "Window",
            "status": "Available"
        },
        {
            "id": 2,
            "number": "T02",
            "capacity": 4,
            "location": "Main hall",
            "status": "Available"
        },
        {
            "id": 3,
            "number": "T03",
            "capacity": 6,
            "location": "Main hall",
            "status": "Available"
        }
    ],
    "suppliers": [
        {
            "id": 1,
            "name": "Fresh Foods",
            "contact": "Rahim",
            "phone": "01700000000",
            "email": "fresh@example.com",
            "category": "Food ingredients",
            "address": "Dhaka",
            "status": "Active"
        }
    ],
    "inventory": [
        {
            "id": 1,
            "name": "Rice",
            "unit": "kg",
            "quantity": 35,
            "threshold": 10,
            "supplier": 1,
            "status": "Active"
        },
        {
            "id": 2,
            "name": "Chicken",
            "unit": "kg",
            "quantity": 8,
            "threshold": 12,
            "supplier": 1,
            "status": "Active"
        },
        {
            "id": 3,
            "name": "Cooking oil",
            "unit": "L",
            "quantity": 14,
            "threshold": 6,
            "supplier": 1,
            "status": "Active"
        }
    ],
    "recipes": [
        {
            "id": 1,
            "menu": 1,
            "ingredients": [
                {
                    "id": 3,
                    "quantity": 0.2
                }
            ],
            "instructions": "Prepare sauce and cook pasta.",
            "servings": 2,
            "status": "Active"
        },
        {
            "id": 2,
            "menu": 2,
            "ingredients": [
                {
                    "id": 2,
                    "quantity": 0.5
                }
            ],
            "instructions": "Marinate and grill chicken.",
            "servings": 2,
            "status": "Active"
        },
        {
            "id": 3,
            "menu": 3,
            "ingredients": [
                {
                    "id": 2,
                    "quantity": 0.2
                }
            ],
            "instructions": "Prepare patty and assemble burger.",
            "servings": 1,
            "status": "Active"
        }
    ],
    "tasks": [
        {
            "id": 1,
            "name": "Prepare sauce",
            "recipe": 1,
            "chef": 1,
            "date": "2026-11-19",
            "status": "Active"
        },
        {
            "id": 2,
            "name": "Marinate",
            "recipe": 2,
            "chef": 1,
            "date": "2026-11-19",
            "status": "Queued"
        },
        {
            "id": 3,
            "name": "Plate order",
            "recipe": 3,
            "chef": 1,
            "date": "2026-11-19",
            "status": "Ready"
        }
    ],
    "requests": [
        {
            "id": 1,
            "item": 2,
            "quantity": 5,
            "notes": "For kitchen preparation",
            "date": "2026-11-19",
            "status": "Pending",
            "user": 1
        }
    ],
    "reservations": [
        {
            "id": 1,
            "table": 1,
            "date": "2026-11-22",
            "time": "18:30",
            "guests": 2,
            "status": "Confirmed",
            "user": 1
        },
        {
            "id": 2,
            "table": 2,
            "date": "2026-11-25",
            "time": "19:00",
            "guests": 4,
            "status": "Pending",
            "user": 1
        }
    ],
    "orders": [
        {
            "id": 1,
            "items": [
                {
                    "id": 1,
                    "quantity": 2,
                    "price": 350
                }
            ],
            "reservation": "",
            "coupon": "",
            "date": "2026-11-15",
            "total": 700,
            "status": "Completed",
            "user": 1
        },
        {
            "id": 2,
            "items": [
                {
                    "id": 3,
                    "quantity": 1,
                    "price": 220
                }
            ],
            "reservation": "",
            "coupon": "",
            "date": "2026-11-19",
            "total": 220,
            "status": "Pending",
            "user": 1
        }
    ],
    "reviews": [
        {
            "id": 1,
            "order": 1,
            "rating": "5",
            "comment": "Good food and service.",
            "date": "2026-11-15",
            "user": 1
        }
    ]
};
