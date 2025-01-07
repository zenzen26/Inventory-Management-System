const db = require('../db'); 
const {getWarrantyRecords, createWarrantyRecord, deleteWarrantyRecord} = require('../models/warrantyModel'); // Import the functions from the model

// Controller to get inventory records
const warrantyController = (req, res) => {
    getWarrantyRecords(req, res); 
};

// Export controller functions
module.exports = {
    getWarrantyRecords:warrantyController,
    createWarrantyRecord,
    deleteWarrantyRecord
};