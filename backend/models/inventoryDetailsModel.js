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
    const serialItemPairs = new Set(); // To store serial-number/item-number pairs
    const itemIncrements = {}; // Object to track item-number increments

    // 1. Check for missing required fields
    for (const record of data) {
        const { serialNumber, itemNumber } = record;

        if (!serialNumber || !itemNumber) {
            validationErrors.push('Serial number and item number are required.');
            break; // Exit immediately on first error
        }
    }

    if (validationErrors.length > 0) return validationErrors;

    // 2. Check for duplicate (serialNumber, itemNumber) within the input
    const duplicateItems = new Set();
    for (const record of data) {
        const { serialNumber, itemNumber } = record;
        const pairKey = `${serialNumber}-${itemNumber}`;

        if (serialItemPairs.has(pairKey)) {
            duplicateItems.add(itemNumber);
        } else {
            serialItemPairs.add(pairKey);
        }
    }

    if (duplicateItems.size > 0) {
        validationErrors.push(
            `Duplicate entries detected for item numbers: ${[...duplicateItems].join(', ')}`
        );
        return validationErrors;
    }

    // 3. Check if item numbers and supplier IDs exist in their respective tables
    const missingItems = new Set();
    const invalidSuppliers = new Set();

    for (const record of data) {
        const { itemNumber, supplierId } = record;

        // Check if item number exists in the inventories table
        const existingItem = await runQuery(
            'SELECT * FROM inventories WHERE LOWER("Item Number") = LOWER(?)',
            [itemNumber]
        );
        if (existingItem.length === 0) {
            missingItems.add(itemNumber);
        }

        // Check if supplier ID exists in the suppliers table
        if (supplierId) {
            const existingSupplier = await runQuery(
                'SELECT * FROM suppliers WHERE LOWER("Supplier ID") = LOWER(?)',
                [supplierId]
            );
            if (existingSupplier.length === 0) {
                invalidSuppliers.add(supplierId);
            }
        }
    }

    if (missingItems.size > 0) {
        validationErrors.push(
            `The following item numbers do not exist: ${[...missingItems].join(', ')}`
        );
    }

    if (invalidSuppliers.size > 0) {
        validationErrors.push(
            `The following supplier IDs do not exist: ${[...invalidSuppliers].join(', ')}`
        );
    }

    if (validationErrors.length > 0) return validationErrors;

    // 4. Check for existing (serialNumber, itemNumber) in the `inventory details` table
    const existingSerialItems = new Set();
    for (const record of data) {
        const { serialNumber, itemNumber } = record;

        const existingSerialItem = await runQuery(
            'SELECT * FROM "inventory details" WHERE LOWER("Serial Number") = LOWER(?) AND LOWER("Item Number") = LOWER(?)',
            [serialNumber, itemNumber]
        );

        if (existingSerialItem.length > 0) {
            existingSerialItems.add(`${serialNumber} (${itemNumber})`);
        }
    }

    if (existingSerialItems.size > 0) {
        validationErrors.push(
            `The following serial numbers already exist: ${[...existingSerialItems].join(', ')}`
        );
        return validationErrors;
    }

    // 5. Check if adding new quantities will exceed the total quantity
    for (const record of data) {
        const { itemNumber } = record;

        // Track the increment for each item
        if (itemIncrements[itemNumber]) {
            itemIncrements[itemNumber] += 1;
        } else {
            itemIncrements[itemNumber] = 1;
        }
    }

    const exceededItems = [];
    for (const itemNumber in itemIncrements) {
        const increment = itemIncrements[itemNumber];

        const inventory = await runQuery(
            'SELECT "Total Quantity", "In-Stock Quantity" FROM inventories WHERE LOWER("Item Number") = LOWER(?)',
            [itemNumber]
        );

        if (inventory.length > 0) {
            const {
                "Total Quantity": totalQuantity,
                "In-Stock Quantity": inStockQuantity,
            } = inventory[0];

            if (inStockQuantity + increment > totalQuantity) {
                exceededItems.push(itemNumber);
            }
        }
    }

    if (exceededItems.length > 0) {
        validationErrors.push(
            `The following item numbers will exceed the total quantity: ${exceededItems.join(', ')}`
        );
    }

    return validationErrors;
};


// Function to create a new inventory detail record
const createInventoryDetailRecord = async (serialNumber, itemNumber, supplierId, supplierInvoice, partNumber, remark) => {
    try {
        await runQuery(
            'INSERT INTO "inventory details" ("Serial Number", "Item Number", "Supplier ID", "Supplier Invoice", "Part Number", "Remark", "Sold Status") VALUES (?, ?, ?, ?, ?, ?, ?)',
            [serialNumber, itemNumber, supplierId || 'N/A', supplierInvoice || 'N/A', partNumber || 'N/A', remark || 'N/A', 'Not Sold']
        );

        // Update the in-stock quantity in the inventories table
        await runQuery('UPDATE inventories SET "In-Stock Quantity" = "In-Stock Quantity" + 1 WHERE "Item Number" = ?', [itemNumber]);

    } catch (error) {
        throw new Error(error.message);
    }
};

// Function to delete an inventory detail record and update In-Stock Quantity
const deleteInventoryDetailRecord = async (serialNumber, itemNumber) => {
    try {
        // Check if the record exists in the inventory details table and fetch the Sold Status
        const existingRecord = await runQuery(
            'SELECT "Sold Status" FROM "inventory details" WHERE LOWER("Serial Number") = LOWER(?) AND LOWER("Item Number") = LOWER(?)',
            [serialNumber, itemNumber]
        );
        if (existingRecord.length === 0) {
            throw new Error('Record not found');
        }

        // Get the Sold Status of the record
        const soldStatus = existingRecord[0]['Sold Status'];

        // Only decrement In-Stock Quantity if the record has a "Not Sold" status
        if (soldStatus === 'Not Sold') {
            // Decrement the In-Stock Quantity in the inventories table
            await runQuery(
                'UPDATE inventories SET "In-Stock Quantity" = "In-Stock Quantity" - 1 WHERE LOWER("Item Number") = LOWER(?)',
                [itemNumber]
            );
        }

        // Delete the record from the inventory details table
        await runQuery(
            'DELETE FROM "inventory details" WHERE LOWER("Serial Number") = LOWER(?) AND LOWER("Item Number") = LOWER(?)',
            [serialNumber, itemNumber]
        );

    } catch (error) {
        throw new Error(error.message);
    }
};


// Update Sold Status
const updateSoldStatus = async (serialNumber, itemNumber) => {
    let oldStatus;
    let updatedStatus;

    try {
        const currentStatusQuery = `SELECT "Sold Status" FROM "inventory details" WHERE "Serial Number" = ? AND "Item Number" = ?`;
        const result = await runQuery(currentStatusQuery, [serialNumber, itemNumber]);

        if (result.length === 0) {
            throw new Error('Record not found');
        }

        oldStatus = result[0]['Sold Status'];

        if (!oldStatus) {
            throw new Error('Invalid Sold Status retrieved from the database');
        }

        updatedStatus = oldStatus === 'Sold' ? 'Not Sold' : 'Sold';

        const updateStatusQuery = `UPDATE "inventory details" SET "Sold Status" = ? WHERE "Serial Number" = ? AND "Item Number" = ?`;
        await runQuery(updateStatusQuery, [updatedStatus, serialNumber, itemNumber]);

        const updatedStatusQuery = `SELECT "Sold Status" FROM "inventory details" WHERE "Serial Number" = ? AND "Item Number" = ?`;
        const updatedResult = await runQuery(updatedStatusQuery, [serialNumber, itemNumber]);
        const finalStatus = updatedResult[0]['Sold Status'];

        let totalQuantityChange = 0;
        let inStockQuantityChange = 0;

        if (finalStatus === 'Sold') {
            totalQuantityChange = -1;
            inStockQuantityChange = -1;
        } else if (finalStatus === 'Not Sold') {
            totalQuantityChange = 1;
            inStockQuantityChange = 1;
        }

        const updateInventoryQuery = `UPDATE "inventories" SET "Total Quantity" = "Total Quantity" + ?, "In-Stock Quantity" = "In-Stock Quantity" + ? WHERE "Item Number" = ?`;
        await runQuery(updateInventoryQuery, [totalQuantityChange, inStockQuantityChange, itemNumber]);

        console.log('Update success', finalStatus);  // Log success

        return { success: true, updatedRecord: { 'Serial Number': serialNumber, 'Item Number': itemNumber, 'Sold Status': finalStatus } };
    } catch (error) {
        console.error('Error updating Sold Status:', error.message);
        return { success: false };
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
        conditions.push('LOWER("Sold Status") = LOWER(?)');
        params.push(soldStatus.toLowerCase());
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

module.exports = { createInventoryDetailRecord, validateInventoryDetailsInput, updateSoldStatus, getInventoryDetailsRecords, deleteInventoryDetailRecord };
