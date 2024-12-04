// Import your database connection (e.g., using Sequelize or Mongoose)
const db = require('../db');  // Example, adjust as needed
// Function to fetch inventory details records based on query parameters
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

// Helper function to handle promises for async/await
const runQuery = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

// Function to create a new inventory detail record
const createInventoryDetailRecord = async (serialNumber, itemNumber, supplierId, supplierInvoice, partNumber, remark) => {
    try {
        // Check if the item exists in inventories
        const existingItem = await runQuery('SELECT * FROM inventories WHERE "Item Number" = ?', [itemNumber]);
        if (existingItem.length === 0) {
            throw new Error('Item number does not exist in inventories');
        }

        // Check if the serial number already exists in the inventory details
        const existingSerial = await runQuery(
            'SELECT * FROM "inventory details" WHERE "Serial Number" = ? AND "Item Number" = ?', [serialNumber, itemNumber]);
        if (existingSerial.length > 0) {
            throw new Error('Serial number of an item already exists');
        }

        // Insert the new record
        await runQuery(
            'INSERT INTO "inventory details" ("Serial Number", "Item Number", "Supplier ID", "Supplier Invoice", "Part Number", "Remark", "Sold Status") VALUES (?, ?, ?, ?, ?, ?, ?)',
            [serialNumber, itemNumber, supplierId || 'N/A', supplierInvoice || 'N/A', partNumber || 'N/A', remark || 'N/A', 'no']
        );

        // // Update the In-Stock Quantity in inventories
        // const totalQuantity = await runQuery('SELECT "Total Quantity", "In-Stock Quantity" FROM inventories WHERE "Item Number" = ?', [itemNumber]);
        // if (totalQuantity.length === 0) {
        //     throw new Error('Item number does not exist in inventories');
        // }

        // const { total_quantity, in_stock_quantity } = totalQuantity[0];
        // if (in_stock_quantity + 1 > total_quantity) {
        //     throw new Error('In-stock quantity exceeds total quantity');
        // }

        // await runQuery('UPDATE inventories SET "In-Stock Quantity" = "In-Stock Quantity" + 1 WHERE "Item Number" = ?', [itemNumber]);
    } catch (error) {
        throw new Error(error.message);
    }
};


module.exports = { createInventoryDetailRecord, getInventoryDetailsRecords };

