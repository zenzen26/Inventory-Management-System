const db = require('../db');  // Example, adjust as needed
const { createInventoryDetailRecord, getInventoryDetailsRecords } = require('../models/inventoryDetailsModel');  // Import model
const runQuery = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};
const addInventoryDetail = async (req, res) => {
    const data = Array.isArray(req.body) ? req.body : [req.body]; // Ensure it's always treated as an array

    try {
        const validationErrors = [];
        const serialItemPairs = new Set(); // To store serial numbers and check for duplicates

        // Validate and check for duplicates in the input
        for (const record of data) {
            const { serialNumber, itemNumber } = record;

            // Check if required fields are provided
            if (!serialNumber || !itemNumber) {
                validationErrors.push('Serial number and item number are required');
            }

            // Check for duplicate (serialNumber, itemNumber) within the input
            const pairKey = `${serialNumber}-${itemNumber}`;
            if (serialItemPairs.has(pairKey)) {
                validationErrors.push(`Duplicate entry: ${serialNumber} - ${itemNumber}`);
            } else {
                serialItemPairs.add(pairKey);
            }

            // Ensure that the item number exists in the inventories table
            const existingItem = await runQuery(
                'SELECT * FROM inventories WHERE "Item Number" = ?',
                [itemNumber]
            );
            if (existingItem.length === 0) {
                validationErrors.push(`Item Number ${itemNumber} does not exist`);
            }

            // Check if the serial number of item number already exists in the inventory details table
            const existingSerialItem = await runQuery(
                'SELECT * FROM "inventory details" WHERE "Serial Number" = ? AND "Item Number" = ?',
                [serialNumber, itemNumber]
            );
            if (existingSerialItem.length > 0) {
                validationErrors.push(`Serial Number ${serialNumber} for Item Number ${itemNumber} already exists`);
            }
        }

        // If there are validation errors, return them
        if (validationErrors.length > 0) {
            return res.status(400).json({ success: false, message: validationErrors.join(', ') });
        }

        // Proceed with adding valid rows to the database
        for (const record of data) {
            const { serialNumber, itemNumber, supplierId, supplierInvoice, partNumber, remark } = record;

            // Insert the inventory details record
            await createInventoryDetailRecord(serialNumber, itemNumber, supplierId, supplierInvoice, partNumber, remark);
        }

        res.status(201).json({ success: true, message: 'Inventory detail(s) added successfully' });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(400).json({ success: false, message: error.message });
    }
};


const inventoryDetailsController = (req, res) => {
    getInventoryDetailsRecords(req, res); // Call the getInventoryRecords function
};


module.exports = { addInventoryDetail, getInventoryDetailsRecords: inventoryDetailsController };
