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
const getSupplierRecords = (req, res) => {
    const { supplierID, supplierName} = req.query;
    let query = 'SELECT * FROM suppliers';
    let params = [];
    let conditions = [];

    if (supplierID) {
        conditions.push('"Supplier ID" LIKE ?');
        params.push(`%${supplierID}%`);
    }

    if (supplierName) {
        conditions.push('"Supplier Name" LIKE ?');
        params.push(`%${supplierName}%`);
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


const deleteSupplierRecord = (req, res) => {
    const { supplierID } = req.params;
    const query = 'DELETE FROM suppliers WHERE "Supplier ID" = ?';

    db.run(query, [supplierID], function (err) {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ message: 'Internal server error.' });
        }

        // If no rows were affected, the item was not found
        if (this.changes === 0) {
            return res.status(404).json({ message: 'Item not found.' });
        }
        res.json({ message: 'Supplier deleted successfully.' });
    });
};

const createSupplierRecord = (req, res) => {
    let {
        supplierID, supplierName
    } = req.body;

    supplierID = supplierID || 'N/A';
    supplierName = supplierName || 'N/A';

    // Check if the supplierID already exists in the database
    const checkQuery = `SELECT COUNT(*) AS count FROM suppliers WHERE "Supplier ID" = ?`;
    
    db.get(checkQuery, [supplierID], (err, row) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ message: 'Internal server error.' });
        }

        // If the supplierID already exists, return an error
        if (row.count > 0) {
            return res.status(400).json({ message: 'Supplier ID already exists.' });
        }

        // Proceed with inserting the new supplier if the ID is unique
        const query = `INSERT INTO suppliers ("Supplier ID", "Supplier Name") VALUES (?, ?)`;

        db.run(query, [supplierID, supplierName], function (err) {
            if (err) {
                console.error('Database error:', err.message);
                return res.status(500).json({ message: 'Internal server error.' });
            }

            res.status(201).json({ message: 'Supplier created successfully', itemId: this.lastID });
        });
    });
};

const updateSupplierRecord = async (oldSupplierID, newSupplierID, supplierName) => {
    if (!oldSupplierID || !newSupplierID) {
        throw new Error("Both old and new Supplier IDs must be provided.");
    }

    try {
        if (oldSupplierID.toLowerCase() !== newSupplierID.toLowerCase()) {
            const existingSupplier = await runQuery(
                'SELECT * FROM "suppliers" WHERE LOWER("Supplier ID") = LOWER(?)',
                [newSupplierID]
            );

            if (existingSupplier.length > 0) {
                throw new Error(`The supplier ID: ${newSupplierID} already exists.`);
            }

            await runQuery(
                'UPDATE "inventory details" SET "Supplier ID" = ? WHERE LOWER("Supplier ID") = LOWER(?)',
                [newSupplierID, oldSupplierID]
            );
        }

        await runQuery(
            'UPDATE "suppliers" SET "Supplier ID" = ?, "Supplier Name" = ? WHERE LOWER("Supplier ID") = LOWER(?)',
            [newSupplierID, supplierName, oldSupplierID]
        );

        return { success: true, message: 'Supplier updated successfully.' };
    } catch (error) {
        console.error("Error updating supplier record:", error);
        throw error;
    }
};




module.exports = { getSupplierRecords, deleteSupplierRecord, createSupplierRecord, updateSupplierRecord};