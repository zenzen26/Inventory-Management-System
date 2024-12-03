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
        // Check if serial number already exists
        const existingSerial = await runQuery('SELECT * FROM "inventory details" WHERE "Serial Number" = ?', [serialNumber]);
        if (existingSerial.length > 0) {
            throw new Error('Serial number already exists');
        }

        // Check if item number exists in the inventory
        const existingItem = await runQuery('SELECT * FROM inventories WHERE "Item Number" = ?', [itemNumber]);
        if (existingItem.length === 0) {
            throw new Error('Item number does not exist in inventories');
        }

        // If supplier ID is provided, ensure it exists in the suppliers table
        if (supplierId) {
            const existingSupplier = await runQuery('SELECT * FROM suppliers WHERE "Supplier ID" = ?', [supplierId]);
            if (existingSupplier.length === 0) {
                throw new Error('Supplier ID does not exist');
            }
        }

        // Insert the new record into the inventory details table
        await new Promise((resolve, reject) => {
            const sql = 'INSERT INTO "inventory details" ("Serial Number", "Item Number", "Supplier ID", "Supplier Invoice", "Part Number", "Remark", "Sold Status") VALUES (?, ?, ?, ?, ?, ?, ?)';
            db.run(sql, [serialNumber, itemNumber, supplierId || null, supplierInvoice || null, partNumber || null, remark || 'N/A', 'no'], function (err) {
                if (err) reject(err);
                else resolve(this.lastID); // Last inserted ID
            });
        });

        // Increment the In-Stock Quantity in inventories table
        const totalQuantity = await runQuery('SELECT "Total Quantity", "In-Stock Quantity" FROM inventories WHERE "Item Number" = ?', [itemNumber]);
        if (totalQuantity.length === 0) {
            throw new Error('Item not found in inventories');
        }

        const { total_quantity, in_stock_quantity } = totalQuantity[0];

        // Ensure in-stock quantity does not exceed total quantity
        if (in_stock_quantity + 1 > total_quantity) {
            throw new Error('In-stock quantity exceeds total quantity');
        }

        // Update the in-stock quantity
        await runQuery('UPDATE inventories SET "In-Stock Quantity" = "In-Stock Quantity" + 1 WHERE "Item Number" = ?', [itemNumber]);

    } catch (error) {
        throw new Error(error.message);
    }
};

module.exports = { createInventoryDetailRecord, getInventoryDetailsRecords };

