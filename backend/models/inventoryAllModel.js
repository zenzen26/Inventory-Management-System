const db = require('../db'); 

const runQuery = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

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
    let {
        itemNumber, itemName, category, quantity, length, width, height, weight, unitCost
    } = req.body;

    // Replace null or undefined values with default values
    itemNumber = itemNumber || 'N/A';
    itemName = itemName || 'N/A';
    category = category || 'N/A'; 
    quantity = quantity || 0; 
    length = length || 0; 
    width = width || 0; 
    height = height || 0;        
    weight = weight || 0;
    unitCost = unitCost || 0;

    // Insert a new inventory item into the database
    const query = `INSERT INTO inventories
                   ("Item Number", "Item Name", "Category", "Total Quantity", "In-Stock Quantity", "Length(cm)", "Width(cm)", "Height(cm)", "Weight(kg)", "Unit Cost(AUD)")
                   VALUES (?, ?, ?, ?, 0, ?, ?, ?, ?, ?)`;

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

const updateInventoryRecord = async (oldItemNumber, newItemNumber, itemName, totalQuantity, inStockQuantity, category, length, width, height, weight, unitCost) => {
    console.log("Update inventory record function in model");
    
    // Check if the edited item number existed elsewhere (Only if the old and edited item number is different)
    if (oldItemNumber.toLowerCase() !== newItemNumber.toLowerCase()) {
        try {
            const existingItemNumber = await runQuery(
                'SELECT * FROM "inventory details" WHERE LOWER("Serial Number") = LOWER(?) AND LOWER("Item Number") = LOWER(?)',
                [newItemNumber, newItemNumber]
            );
            if (existingItemNumber.length > 0) {
                throw new Error(`The item number ${newItemNumber} already existed.`);
            }

            // Update the item number in the inventory details table where it matches the old item number
            await runQuery(
                'UPDATE "inventory details" SET "Item Number" = ? WHERE LOWER("Item Number") = LOWER(?)',
                [newItemNumber, oldItemNumber]
            );
            
        } catch (error) {
            console.error("Error checking existing item number:", error);
            throw error;  // Re-throw error so it's handled in the controller
        }
    }

    // Check if the in-stock quantity will exceed the total quantity
    if (inStockQuantity > totalQuantity) {
        throw new Error('Total quantity cannot be less than in stock quantity.');
    }

    try {
        // Update the inventory table with the new values
        const updateResult = await runQuery(
            'UPDATE "inventories" SET "Item Number" = ?, "Item Name" = ?, "Total Quantity" = ?, "In-Stock Quantity" = ?, "Category" = ?, "Length(cm)" = ?, "Width(cm)" = ?, "Height(cm)" = ?, "Weight(kg)" = ?, "Unit Cost(AUD)" = ? WHERE LOWER("Item Number") = LOWER(?)',
            [newItemNumber, itemName, totalQuantity, inStockQuantity, category, length, width, height, weight, unitCost, oldItemNumber]
        );

        // Return a result object indicating success
        return { success: true, message: 'Inventory updated successfully.' };
    } catch (error) {
        console.error("Error updating inventory record:", error);
        throw error; // Re-throw error to be caught in the controller
    }
};
module.exports = { getInventoryRecords, addPurchasetoExisting, createInventoryRecord, deleteInventoryRecord, updateInventoryRecord };
