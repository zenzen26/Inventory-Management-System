const { createInventoryDetailRecord, getInventoryDetailsRecords } = require('../models/inventoryDetailsModel');  // Import model

// Controller function to handle the creation of inventory detail
const addInventoryDetail = async (req, res) => {
    const { serialNumber, itemNumber, supplierId, supplierInvoice, partNumber, remark } = req.body;

    console.log('Received data:', req.body); // Debug log for incoming data

    try {
        // Validate required fields
        if (!serialNumber || !itemNumber) {
            return res.status(400).json({ error: 'Serial number and item number are required' });
        }

        // Create the new inventory detail record using the model function
        await createInventoryDetailRecord(serialNumber, itemNumber, supplierId, supplierInvoice, partNumber, remark);
        res.status(201).json({ message: 'Inventory detail added successfully' });
    } catch (error) {
        console.error('Error:', error);  // Log the error on the server side
        res.status(400).json({ error: error.message });
    }
};


const inventoryDetailsController = (req, res) => {
    getInventoryDetailsRecords(req, res); // Call the getInventoryRecords function
};


module.exports = { addInventoryDetail, getInventoryDetailsRecords: inventoryDetailsController };
