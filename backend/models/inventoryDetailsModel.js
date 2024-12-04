const db = require('../db');

// Helper function to handle promises for async/await
const runQuery = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

// Function to validate inventory details before adding them
const validateInventoryDetailsInput = async (data) => {
    const validationErrors = [];
    const serialItemPairs = new Set(); // To store serial numbers and check for duplicates
    const itemIncrements = {}; // Object to store item increments to update later

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

        // Track the increment for each item
        if (itemIncrements[itemNumber]) {
            itemIncrements[itemNumber] += 1;
        } else {
            itemIncrements[itemNumber] = 1;
        }
    }

    // Ensure the new in-stock quantity does not exceed the total quantity for each item after all records are validated
    for (const itemNumber in itemIncrements) {
        const increment = itemIncrements[itemNumber];

        const inventory = await runQuery(
            'SELECT "Total Quantity", "In-Stock Quantity" FROM inventories WHERE "Item Number" = ?',
            [itemNumber]
        );
        const { "Total Quantity": totalQuantity, "In-Stock Quantity": inStockQuantity } = inventory[0];

        if (inStockQuantity + increment > totalQuantity) {
            validationErrors.push(`Item number ${itemNumber} will exceed the total quantity`);
        }
    }

    return validationErrors;
};

// Function to create a new inventory detail record
const createInventoryDetailRecord = async (serialNumber, itemNumber, supplierId, supplierInvoice, partNumber, remark) => {
    try {
        await runQuery(
            'INSERT INTO "inventory details" ("Serial Number", "Item Number", "Supplier ID", "Supplier Invoice", "Part Number", "Remark", "Sold Status") VALUES (?, ?, ?, ?, ?, ?, ?)',
            [serialNumber, itemNumber, supplierId || 'N/A', supplierInvoice || 'N/A', partNumber || 'N/A', remark || 'N/A', 'no']
        );

        // Update the in-stock quantity in the inventories table
        await runQuery('UPDATE inventories SET "In-Stock Quantity" = "In-Stock Quantity" + 1 WHERE "Item Number" = ?', [itemNumber]);

    } catch (error) {
        throw new Error(error.message);
    }
};

const getInventoryDetailsRecords = (req, res) => {
    const { serialNumber, itemNumber, supplierID, soldStatus } = req.query;
    let query = 'SELECT * FROM "inventory details"';
    let params = [];
    let conditions = [];

    if (serialNumber) {
        conditions.push('"Serial Number" LIKE ?');
        params.push(`%${serialNumber}%`);
    }

    if (itemNumber) {
        conditions.push('"Item Number" LIKE ?');
        params.push(`%${itemNumber}%`);
    }

    if (supplierID) {
        conditions.push('"Supplier ID" LIKE ?');
        params.push(`%${supplierID}%`);
    }

    if (soldStatus) {
        conditions.push('"Sold Status" LIKE ?');
        params.push(`%${soldStatus}%`);
    }

    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ message: 'Internal server error.' });
        }
        res.json(rows);
    });
};

module.exports = { createInventoryDetailRecord, validateInventoryDetailsInput, getInventoryDetailsRecords };
