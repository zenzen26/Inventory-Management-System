// const axios = require('axios')
const { createInventoryDetailRecord, validateInventoryDetailsInput, updateSoldStatus, updateInventoryDetailRecord, deleteInventoryDetailRecord, getInventoryDetailsRecords } = require('../models/inventoryDetailsModel');

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

const deleteInventoryDetail = async (req, res) => {
    const { serialNumber, itemNumber } = req.body; // Expecting both serialNumber and itemNumber

    try {
        // Call a function to delete the record from the database
        await deleteInventoryDetailRecord(serialNumber, itemNumber);

        res.status(200).json({ success: true, message: 'Inventory record deleted successfully' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Function to handle toggling the Sold status
const handleSoldEffect = async (req, res) => {
    const { serialNumber, itemNumber } = req.body;

    try {
        const updateResult = await updateSoldStatus(serialNumber, itemNumber);

        if (updateResult.success) {
            return res.status(200).json({
                success: true,
                updatedRecord: updateResult.updatedRecord,
            });
        } else {
            return res.status(200).json({
                success: false,
                message: `No change in Sold Status for ${itemNumber} - ${serialNumber}`,
            });
        }
    } catch (error) {
        console.error('Error handling sold effect:', error.message);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const editInventoryDetailRecord = async (req, res) => {
    const { oldSerialNumber, oldItemNumber, newSerialNumber, newItemNumber, supplierId, supplierInvoice, partNumber, remark } = req.body;

    // Ensure both Item Number and Serial Number are provided
    if (!newSerialNumber || !newItemNumber) {
        return res.status(400).json({ success: false, message: 'Item Number and Serial Number cannot be empty.' });
    }

    try {
        // Call the model function to update the record
        const result = await updateInventoryDetailRecord(oldSerialNumber, oldItemNumber, newSerialNumber, newItemNumber, supplierId, supplierInvoice, partNumber, remark);

        if (result.success) {
            return res.status(200).json({ success: true, message: 'Inventory detail updated successfully.' });
        } else {
            return res.status(500).json({ success: false, message: 'Failed to update inventory detail.' });
        }
    } catch (error) {
        console.error('Error updating inventory detail:', error.message);
        return res.status(500).json({ success: false, message: 'Failed to update inventory detail.' });
    }
};



const inventoryDetailsController = (req, res) => {
    getInventoryDetailsRecords(req, res);
};

module.exports = { addInventoryDetail, deleteInventoryDetail, handleSoldEffect, editInventoryDetailRecord, getInventoryDetailsRecords: inventoryDetailsController };
