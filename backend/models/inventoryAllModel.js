const db = require('../db'); 

// Function to get inventory records
const getInventoryRecords = (req, res) => {
    const { itemNumber, itemName, category } = req.query;
    let query = 'SELECT * FROM inventories';
    let params = [];
    let conditions = [];

    if (itemNumber) {
        conditions.push('"Item Number" LIKE ?');
        params.push(`%${itemNumber}%`);
    }

    if (itemName) {
        conditions.push('"Item Name" LIKE ?');
        params.push(`%${itemName}%`);
    }

    if (category) {
        conditions.push('Category LIKE ?');
        params.push(`%${category}%`);
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

// Function to update an existing inventory item
const addPurchasetoExisting = (req, res) => {
    const { itemNumber } = req.params;
    const { quantity } = req.body; // The quantity to be added

    // Update the total quantity in the inventory
    const query = `UPDATE inventories
                   SET "Total Quantity" = "Total Quantity" + ?
                   WHERE "Item Number" = ?`;

    db.run(query, [quantity, itemNumber], function (err) {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ message: 'Internal server error.' });
        }

        // If no rows were affected, the item was not found
        if (this.changes === 0) {
            return res.status(404).json({ message: 'Item not found.' });
        }

        // Success response
        res.json({ message: 'Item quantity updated successfully' });
    });
};

// Function to create a new inventory item
const createInventoryRecord = (req, res) => {
    const {
        itemNumber, itemName, category, quantity, length, width, height, weight, unitCost
    } = req.body;

    // Insert a new inventory item into the database
    const query = `INSERT INTO inventories
                   ("Item Number", "Item Name", "Category", "Total Quantity", "Length(cm)", "Width(cm)", "Height(cm)", "Weight(kg)", "Unit Cost(AUD)")
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(query, [itemNumber, itemName, category, quantity, length, width, height, weight, unitCost], function (err) {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ message: 'Internal server error.' });
        }

        res.status(201).json({ message: 'Item created successfully', itemId: this.lastID });
    });
};

// Function to delete an inventory record
const deleteInventoryRecord = (req, res) => {
    const { itemNumber } = req.params;

    const query = 'DELETE FROM inventories WHERE "Item Number" = ?';

    db.run(query, [itemNumber], function (err) {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ message: 'Internal server error.' });
        }

        // If no rows were affected, the item was not found
        if (this.changes === 0) {
            return res.status(404).json({ message: 'Item not found.' });
        }
        res.json({ message: 'Item deleted successfully.' });
    });
};

module.exports = { getInventoryRecords, addPurchasetoExisting, createInventoryRecord, deleteInventoryRecord };
