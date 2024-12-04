const { createInventoryDetailRecord, validateInventoryDetailsInput, getInventoryDetailsRecords } = require('../models/inventoryDetailsModel');

const addInventoryDetail = async (req, res) => {
    const data = Array.isArray(req.body) ? req.body : [req.body]; // Ensure it's always treated as an array

    try {
        // Validate the records before adding them
        const validationErrors = await validateInventoryDetailsInput(data);
        
        if (validationErrors.length > 0) {
            return res.status(400).json({ success: false, message: validationErrors.join('\n') });
        }

        // Proceed with adding valid rows to the database
        for (const record of data) {
            const { serialNumber, itemNumber, supplierId, supplierInvoice, partNumber, remark } = record;
            await createInventoryDetailRecord(serialNumber, itemNumber, supplierId, supplierInvoice, partNumber, remark);
        }

        res.status(201).json({ success: true, message: 'Inventory detail(s) added successfully' });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(400).json({ success: false, message: error.message });
    }
};

const inventoryDetailsController = (req, res) => {
    getInventoryDetailsRecords(req, res);
};

module.exports = { addInventoryDetail, getInventoryDetailsRecords: inventoryDetailsController };
