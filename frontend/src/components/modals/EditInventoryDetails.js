import React, { useState, useEffect } from 'react';
import '../../style/EditModal.css';
import CloseIcon from '../../icons/close-icon.svg';
import WarningIcon from '../../icons/warning-icon.svg';
import Swal from 'sweetalert2';
import axios from 'axios';

const EditInventoryDetailsModal = ({ isOpen, onClose, recordToEdit, onSave }) => {
    const [serialNumber, setSerialNumber] = useState('');
    const [itemNumber, setItemNumber] = useState('');
    const [supplierId, setSupplierId] = useState('');
    const [supplierInvoice, setSupplierInvoice] = useState('');
    const [partNumber, setPartNumber] = useState('');
    const [remark, setRemark] = useState('');

    // Populate fields with the selected record details
    useEffect(() => {
        if (recordToEdit) {
            setSerialNumber(recordToEdit['Serial Number'] || '');
            setItemNumber(recordToEdit['Item Number'] || '');
            setSupplierId(recordToEdit['Supplier ID'] || '');
            setSupplierInvoice(recordToEdit['Supplier Invoice'] || '');
            setPartNumber(recordToEdit['Part Number'] || '');
            setRemark(recordToEdit['Remark'] || '');
        }
    }, [recordToEdit]);

    const handleSave = async () => {
        const updatedRecord = {
            oldSerialNumber: recordToEdit['Serial Number'],  // Use the current serial number as the old one
            oldItemNumber: recordToEdit['Item Number'],      // Use the current item number as the old one
            newSerialNumber: serialNumber, // The new serial number (user input)
            newItemNumber: itemNumber,   // The new item number (user input)
            supplierId: supplierId || 'N/A',    // Use 'N/A' if not provided
            supplierInvoice: supplierInvoice || 'N/A', // Use 'N/A' if not provided
            partNumber: partNumber || 'N/A',  // Use 'N/A' if not provided
            remark: remark || 'N/A',      // Use 'N/A' if not provided
        };
    
        try {
            const response = await axios.put('http://localhost:5000/api/inventory-details/edit', updatedRecord);
    
            if (response.data.success) {
                Swal.fire('Success', response.data.message, 'success');
                onSave(updatedRecord); // Call parent's onSave function
            } else {
                Swal.fire('Error', response.data.message, 'error');
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to update the record.', 'error');
            console.error(error.message);
        } finally {
            onClose();
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Edit Item</h2>
                    <button className="modal-close-button" onClick={onClose}><img src={CloseIcon} alt="Close" /></button>
                </div>
                <form>
                <div className="form-group" style={{ color: "red" }}>
                    <label>
                        Serial Number 
                        <span className="tooltip-icon" title="Editing this may affect the total/stock quantities calculation in the Inventory page">
                            <img src={WarningIcon} alt="Warning" className="tooltip-icon-img"/>
                        </span>
                    </label>
                    <input
                        type="text"
                        value={serialNumber}
                        onChange={(e) => setSerialNumber(e.target.value)}
                    />
                </div>
                <div className="form-group" style={{ color: "red" }}>
                    <label>
                        Item Number 
                        <span className="tooltip-icon" title="Editing this may affect the total/stock quantities calculation in the Inventory page">
                            <img src={WarningIcon} alt="Warning" className="tooltip-icon-img"/>
                        </span>
                    </label>
                    <input
                        type="text"
                        value={itemNumber}
                        onChange={(e) => setItemNumber(e.target.value)}
                    />
                </div>
                    <div className="form-group">
                        <label>Supplier ID</label>
                        <input
                            type="text"
                            value={supplierId}
                            onChange={(e) => setSupplierId(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Supplier Invoice</label>
                        <input
                            type="text"
                            value={supplierInvoice}
                            onChange={(e) => setSupplierInvoice(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Part Number</label>
                        <input
                            type="text"
                            value={partNumber}
                            onChange={(e) => setPartNumber(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Remark</label>
                        <input
                            type="text"
                            value={remark}
                            onChange={(e) => setRemark(e.target.value)}
                        />
                    </div>
                </form>
                <div className="modal-footer">
                    <button className="save-button" onClick={handleSave}>
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditInventoryDetailsModal;
