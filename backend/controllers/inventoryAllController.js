const db = require('../db'); 
const { getInventoryRecords, addPurchasetoExisting, createInventoryRecord, deleteInventoryRecord } = require('../models/inventoryAllModel'); // Import the functions from the model

// Controller to get inventory records
const inventoryAllController = (req, res) => {
    getInventoryRecords(req, res); // Call the getInventoryRecords function
};

// Export controller functions
module.exports = {
    getInventoryRecords: inventoryAllController, 
    addPurchasetoExisting, 
    createInventoryRecord, 
    deleteInventoryRecord 
};

