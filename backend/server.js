const express = require('express');
const session = require('express-session');
const cors = require('cors');
const authController = require('./controllers/authController');  // For logins
const inventoryController = require('./controllers/inventoryAllController'); // For inventories overview
const inventoryDetailsController = require('./controllers/inventoryDetailsController'); // For inventories details

const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json()); // To parse JSON bodies

//AUTHENTICATION ROUTES
app.use(session({
    secret: 'secretkey',
    resave: false,
    saveUninitialized: false,
}));

// Login Route
app.post('/api/login', authController.loginUser);

// Auth Check Route
app.get('/api/auth-check', (req, res) => {
    if (req.session.user) {
        return res.json({ loggedIn: true, username: req.session.user.username });
    } else {
        return res.json({ loggedIn: false });
    }
});

// INVENTORY OVERVIEW ROUTES
// Inventory route to search for records
app.get('/api/inventory', inventoryController.getInventoryRecords);

// Route to update existing inventory item (increment total quantity)
app.put('/api/inventory/:itemNumber', inventoryController.addPurchasetoExisting);

// Route to create a new inventory item
app.post('/api/inventory', inventoryController.createInventoryRecord);

// Route to delete an inventory item
app.delete('/api/inventory/:itemNumber', inventoryController.deleteInventoryRecord);

// INVENTORY DETAILS ROUTES
// Inventory details route to search for records
app.get('/api/inventory-details', inventoryDetailsController.getInventoryDetailsRecords);


// Starting the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});