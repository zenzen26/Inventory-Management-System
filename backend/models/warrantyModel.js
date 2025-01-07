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
const getWarrantyRecords = (req, res) => {
    const { customerNumber, invoice, customerName} = req.query;
    let query = 'SELECT * FROM warranty';
    let params = [];
    let conditions = [];

    if (customerNumber) {
        conditions.push('"Customer Number" LIKE ?');
        params.push(`%${customerNumber}%`);
    }

    if (invoice) {
        conditions.push('"Invoice" LIKE ?');
        params.push(`%${invoice}%`);
    }

    if (customerName) {
        conditions.push('"Customer Name" LIKE ?');
        params.push(`%${customerName}%`);
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

const deleteWarrantyRecord = (req, res) => {
    const { invoice } = req.params;
    const query = 'DELETE FROM warranty WHERE "Invoice" = ?';

    db.run(query, [invoice], function (err) {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ message: 'Internal server error.' });
        }

        // If no rows were affected, the item was not found
        if (this.changes === 0) {
            return res.status(404).json({ message: 'Warranty not found.' });
        }
        res.json({ message: 'Warranty record deleted successfully.' });
    });
};

const createWarrantyRecord = (req, res) => {
    const {
        customerName,
        customerNumber,
        invoice,
        invoiceDate,
        items, // Array of items with details: items, serialNumber, template, years, start
    } = req.body;

    console.log(req.body);

    // Validate required fields
    if (!customerName || !customerNumber || !invoice || !invoiceDate || !items || items.length === 0) {
        return res.status(400).json({ message: "All fields are required, and at least one item must be provided." });
    }

    // Function to convert DD/MM/YYYY to YYYY-MM-DD for processing
    const convertToDate = (dateString) => {
        const [day, month, year] = dateString.split('/');
        return new Date(`${year}-${month}-${day}`);
    };

    // Function to convert numeric months to human-readable format
    const convertMonthsToLabel = (months) => {
        const year = 12;
        switch (months) {
            case year:
                return 'One-Year';
            case 24:
                return 'Two-Years';
            case 36:
                return 'Three-Years';
            case 1:
                return 'One-Month';
            case 3:
                return 'Three-Months';
            case 6:
                return 'Six-Months';
            default:
                return 'Unknown Duration';
        }
    };

    // Prepare data for insertion
    const rowsToInsert = items.map((item) => {
        const serialNumber = item.serialNumber || "N/A";
        const years = parseInt(item.years, 10); // Get numeric months
        const startDate = convertToDate(item.start); // Convert start date to Date object
        if (isNaN(startDate)) {
            throw new Error("Invalid start date format.");
        }

        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + years); // Add months equivalent to years

        // Convert numeric months to readable format before inserting
        const yearsLabel = convertMonthsToLabel(years);

        // Format dates to DD/MM/YYYY before storing
        const formatDate = (date) => {
            const day = ("0" + date.getDate()).slice(-2);
            const month = ("0" + (date.getMonth() + 1)).slice(-2);
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        };

        return [
            customerNumber,
            invoiceDate,
            invoice,
            item.items,
            serialNumber,
            item.template,
            yearsLabel, // Store the human-readable label for years
            formatDate(startDate), // Store start date in DD/MM/YYYY
            formatDate(endDate), // Store end date in DD/MM/YYYY
            customerName,
            "no", // Default for 'Upload to Xero'
            "no", // Default for 'Email Customer'
        ];
    });

    const query = `
        INSERT INTO warranty (
            "Customer Number", "Invoice Date", "Invoice", "Items",
            "Serial Number", "Template", "Years", "Start", "End",
            "Customer Name", "Upload to Xero", "Email Customer"
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Insert data into the database
    db.serialize(() => {
        const stmt = db.prepare(query);

        try {
            rowsToInsert.forEach((row) => stmt.run(row));
            stmt.finalize();
            res.status(201).json({ message: "Warranty record added successfully." });
        } catch (error) {
            console.error("Database error:", error.message);
            res.status(500).json({ message: "Internal server error." });
        }
    });
};


module.exports = { getWarrantyRecords, createWarrantyRecord, deleteWarrantyRecord };