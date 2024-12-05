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
app.get('/api/inventory', inventoryController.getInventoryRecords); // Get table route
app.put('/api/inventory/:itemNumber', inventoryController.addPurchasetoExisting); // Increment total quantity (existing item ver) route
app.post('/api/inventory', inventoryController.createInventoryRecord); // Create new item route
app.delete('/api/inventory/:itemNumber', inventoryController.deleteInventoryRecord); // Delete an item route

// INVENTORY DETAILS ROUTES
app.get('/api/inventory-details', inventoryDetailsController.getInventoryDetailsRecords); // Inventory details route to search for records
app.post('/api/add-inventory-detail', (req, res) => {
    inventoryDetailsController.addInventoryDetail(req, res);
});
app.delete('/api/inventory-details/', inventoryDetailsController.deleteInventoryDetail);
app.post('/api/inventory-details/handle-sold', inventoryDetailsController.handleSoldEffect); // Toggle sold status for an inventory item

// Starting the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});