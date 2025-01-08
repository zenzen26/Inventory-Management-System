const db = require('../db'); 
const {getWarrantyRecords, createWarrantyRecord, deleteWarrantyRecord, updateWarrantyRecord} = require('../models/warrantyModel'); // Import the functions from the model

// Controller to get inventory records
const warrantyController = (req, res) => {
    getWarrantyRecords(req, res); 
};


const editWarrantyRecord = async (req, res) => {
    const { customerNumber, invoiceDate, oldInvoice, newInvoice, customerName, items, oldSerialNumber, newSerialNumber, template, years, start, end } = req.body;

    // Ensure both Item Number and Serial Number are provided
    if (!customerNumber || !invoiceDate || !oldInvoice || !newInvoice || !customerName || !items || !oldSerialNumber || !newSerialNumber || !template || !years || !start || !end) {
        return res.status(400).json({ success: false, message: 'All fields must be filled' });
    }

    try {
        // Call the model function to update the record
        const result = await updateWarrantyRecord(customerNumber, invoiceDate, oldInvoice, newInvoice, customerName, items, oldSerialNumber, newSerialNumber, template, years, start, end);

        if (result.success) {
            return res.status(200).json({ success: true, message: 'Warranty record updated successfully.' });
        } else {
            return res.status(500).json({ success: false, message: 'Failed to update warranty record.' });
        }
    } catch (error) {
        console.error('Error updating warranty record:', error.message);
        return res.status(500).json({ success: false, message: 'Failed to update warranty record.' });
    }
};


// Export controller functions
module.exports = {
    getWarrantyRecords:warrantyController,
    createWarrantyRecord,
    deleteWarrantyRecord,
    editWarrantyRecord
};