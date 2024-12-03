const db = require('../db'); 

// Function to get inventory records
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

module.exports = { getInventoryDetailsRecords};
