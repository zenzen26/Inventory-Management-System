const db = require('../db'); 
const {getSupplierRecords, deleteSupplierRecord, createSupplierRecord, updateSupplierRecord} = require('../models/suppliersModel'); // Import the functions from the model

// Controller to get inventory records
const suppliersController = (req, res) => {
    getSupplierRecords(req, res); 
};

const editSupplierRecord = async (req, res) => {
    const oldSupplierID = req.params.supplierID; // Extract old Supplier ID from URL
    const { supplierID: newSupplierID, supplierName } = req.body; // Extract new Supplier ID and name from body

    try {
        const result = await updateSupplierRecord(oldSupplierID, newSupplierID, supplierName);
        res.status(200).json(result);
    } catch (error) {
        console.error("Error updating supplier:", error);
        res.status(500).json({ message: error.message });
    }
};

// Export controller functions
module.exports = {
    getSupplierRecords:suppliersController,
    deleteSupplierRecord,
    createSupplierRecord,
    editSupplierRecord
};