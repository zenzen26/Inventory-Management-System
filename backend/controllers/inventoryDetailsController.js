const db = require('../db'); 
const {getInventoryDetailsRecords} = require('../models/inventoryDetailsModel'); // Import the functions from the model

// Controller to get inventory records
const inventoryDetailsController = (req, res) => {
    getInventoryDetailsRecords(req, res); // Call the getInventoryRecords function
};

// Export controller functions
module.exports = {
    getInventoryDetailsRecords: inventoryDetailsController
};
