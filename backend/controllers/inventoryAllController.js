const db = require('../db'); 
const { getInventoryRecords, addPurchasetoExisting, createInventoryRecord, deleteInventoryRecord, updateInventoryRecord } = require('../models/inventoryAllModel'); // Import the functions from the model

// Controller to get inventory records
const inventoryAllController = (req, res) => {
    getInventoryRecords(req, res); 
};


const editInventoryRecord = async (req, res) => {
    const { oldItemNumber, newItemNumber, itemName, totalQuantity, inStockQuantity, category, length, width, height, weight, unitCost } = req.body;

    if (!newItemNumber) {
        return res.status(400).json({ success: false, message: 'Item Number cannot be empty.' });
    }

    try {
        // Call the model function to update the record
        const result = await updateInventoryRecord(oldItemNumber, newItemNumber, itemName, totalQuantity, inStockQuantity, category, length, width, height, weight, unitCost);

        if (result.success) {
            return res.status(200).json({ success: true, message: 'Inventory updated successfully.' });
        } else {
            return res.status(500).json({ success: false, message: 'Failed to update inventory.' });
        }
    } catch (error) {
        console.error('Error updating inventory:', error.message);
        return res.status(500).json({ success: false, message: error.message || 'Failed to update inventory.' });
    }
};


// Export controller functions
module.exports = {
    getInventoryRecords: inventoryAllController, 
    addPurchasetoExisting, 
    createInventoryRecord, 
    deleteInventoryRecord,
    editInventoryRecord 
};

