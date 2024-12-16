import React, { useState, useEffect } from 'react';
import '../../style/EditModal.css';
import CloseIcon from '../../icons/close-icon.svg';
import Swal from 'sweetalert2';
import axios from 'axios';

const AddEditSupplier = ({ isOpen, onClose, fetchSupplierRecords, isEdit, recordToEdit }) => {
    const [supplierID, setSupplierID] = useState('');
    const [supplierName, setSupplierName] = useState('');

    // Reset form and pre-fill if in Edit mode
    const resetForm = () => {
        setSupplierID('');
        setSupplierName('');
    };

    useEffect(() => {
        if (isEdit && recordToEdit) {
            setSupplierID(recordToEdit['Supplier ID']);
            setSupplierName(recordToEdit['Supplier Name']);
        }
    }, [isEdit, recordToEdit]);

    useEffect(() => {
        if (!isOpen) resetForm();
    }, [isOpen]);

    const handleSave = async () => {
        const supplierData = { 
            supplierID, // New Supplier ID
            supplierName,
            oldSupplierID: recordToEdit['Supplier ID'], // Original Supplier ID
        };
    
        try {
            if (isEdit) {
                // Update supplier
                const response = await axios.put(`http://localhost:5000/api/suppliers/edit/${supplierData.oldSupplierID}`, supplierData);
                Swal.fire({
                    icon: 'success',
                    title: 'Supplier Updated',
                    text: response.data.message || 'Supplier updated successfully!',
                });
            } else {
                // Add new supplier
                const response = await axios.post(
                    'http://localhost:5000/api/suppliers',
                    supplierData
                );
                Swal.fire({
                    icon: 'success',
                    title: 'Supplier Added',
                    text: response.data.message || 'Supplier added successfully!',
                });
            }
            fetchSupplierRecords(); // Refresh the supplier records
            onClose(); // Close modal
        } catch (error) {
            console.error('Error saving supplier:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || (isEdit ? 'Failed to update the supplier.' : 'Failed to add the supplier.'),
            });
        }
    };
    

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{isEdit ? 'Edit Supplier' : 'Add Supplier'}</h2>
                    <button className="modal-close-button" onClick={onClose}>
                        <img src={CloseIcon} alt="Close" />
                    </button>
                </div>
                <div className="modal-body">
                    <form>
                        <label>{isEdit ? 'Supplier ID (Caution)' : 'Supplier ID'}</label>
                        <input
                            type="text"
                            value={supplierID}
                            onChange={(e) => setSupplierID(e.target.value)}
                        />
                        <label>Supplier Name</label>
                        <input
                            type="text"
                            value={supplierName}
                            onChange={(e) => setSupplierName(e.target.value)}
                        />
                    </form>
                </div>
                <div className="modal-footer">
                    <button className="save-button" onClick={handleSave}>
                        {isEdit ? 'Save Changes' : 'Add Supplier'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddEditSupplier;
