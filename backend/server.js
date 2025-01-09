const express = require('express');
const session = require('express-session');
const cors = require('cors');
const authController = require('./controllers/authController');  // For logins
const inventoryController = require('./controllers/inventoryAllController'); // For inventories overview
const inventoryDetailsController = require('./controllers/inventoryDetailsController'); // For inventories details
const warrantyController = require('./controllers/warrantyController');
const suppliersController = require('./controllers/suppliersController');

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
app.get('/api/inventory', inventoryController.getInventoryRecords); // Get inventory route and the main page for this
app.put('/api/inventory/:itemNumber', inventoryController.addPurchasetoExisting); // Increment total quantity (existing item ver) route
app.post('/api/inventory', inventoryController.createInventoryRecord); // Create new item route
app.delete('/api/inventory/:itemNumber', inventoryController.deleteInventoryRecord); // Delete an item route
app.put('/api/inventory/edit/:itemNumber', inventoryController.editInventoryRecord);



// INVENTORY DETAILS ROUTES
app.get('/api/inventory-details', inventoryDetailsController.getInventoryDetailsRecords); // Inventory details route to search for records and the main page for this
app.post('/api/inventory-details/add', (req, res) => {inventoryDetailsController.addInventoryDetail(req, res);}); // Add in stock items
app.put('/api/inventory-details/edit', inventoryDetailsController.editInventoryDetailRecord); // Increment total quantity (existing item ver) route
app.delete('/api/inventory-details/', inventoryDetailsController.deleteInventoryDetail); // Delete an in stock item
app.post('/api/inventory-details/handle-sold', inventoryDetailsController.handleSoldEffect); // Toggle sold status for an inventory item

// WARRANTY ROUTES
app.get('/api/warranty', warrantyController.getWarrantyRecords); // Get warranty route and the main page for this
app.post('/api/warranty', warrantyController.createWarrantyRecord);
app.delete('/api/warranty/:invoice/:serialNumber', warrantyController.deleteWarrantyRecord); 
app.put('/api/warranty/edit', warrantyController.editWarrantyRecord); // Increment total quantity (existing item ver) route
app.post('/api/warranty/generate-pdf', warrantyController.generateWarrantyPDF);
app.put('/api/warranty/xero-status', warrantyController.toggleXeroStatus);
app.put('/api/warranty/email-status', warrantyController.toggleEmailStatus);

//SUPPLIERS ROUTES
app.get('/api/suppliers', suppliersController.getSupplierRecords); // Get inventory route and the main page for this
app.delete('/api/suppliers/:supplierID', suppliersController.deleteSupplierRecord); // Delete an item route
app.post('/api/suppliers', suppliersController.createSupplierRecord); // Create new supplier route
app.put('/api/suppliers/edit/:supplierID', suppliersController.editSupplierRecord); 

// Starting the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});