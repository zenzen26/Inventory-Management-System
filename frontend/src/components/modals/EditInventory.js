import React, { useState, useEffect } from 'react';
import '../../style/EditModal.css';
import CloseIcon from '../../icons/close-icon.svg';
import Swal from 'sweetalert2';
import axios from 'axios';

const EditInventoryModal = ({ isOpen, onClose, recordToEdit, onSave }) => {
    const [formData, setFormData] = useState({
        'Item Number': '',
        'Item Name': '',
        'Total Quantity': 0,
        'In-Stock Quantity': 0,
        'Category': '',
        'Length(cm)': 0,
        'Width(cm)': 0,
        'Height(cm)': 0,
        'Weight(kg)': 0,
        'Unit Cost(AUD)': 0,
    });

    // Populate form data when recordToEdit changes
    useEffect(() => {
        if (recordToEdit) {
            setFormData(recordToEdit);
        }
    }, [recordToEdit]);

    // Handle form field changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: name.includes('(cm)') || name.includes('(AUD)') || name === 'Weight(kg)'
                ? parseFloat(value)
                : name.includes('Quantity')
                ? parseInt(value, 10)
                : value,
        }));
    };

    // Handle save action
    const handleSave = async () => {
        try {
            const response = await axios.put(`http://localhost:5000/api/inventory/${formData['Item Number']}`, formData);
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: response.data.message || 'Inventory updated successfully!',
            });
            onSave(); // Refresh inventory records
            onClose(); // Close modal
        } catch (error) {
            console.error('Error updating inventory:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to update the inventory record.',
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Edit Item</h2>
                    <button className="modal-close-button" onClick={onClose}>
                        <img src={CloseIcon} alt="Close" />
                    </button>
                </div>
                <div className="modal-body">
                    <form>
                        <label style={{color:"red"}}>Item Number (Caution)</label>
                        <input
                            type="text"
                            name="Item Number"
                            value={formData['Item Number']}
                            onChange={handleInputChange}
                        />

                        <label>Item Name</label>
                        <input
                            type="text"
                            name="Item Name"
                            value={formData['Item Name']}
                            onChange={handleInputChange}
                        />

                        <div className="dimensions-row">
                            <div>
                                <label style={{color:"red"}}>Total Quantity (Caution)</label>
                                <input
                                    type="number"
                                    name="Total Quantity"
                                    value={formData['Total Quantity']}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <label style={{color:"red"}}>In-Stock Quantity (Caution)</label>
                                <input
                                    type="number"
                                    name="In-Stock Quantity"
                                    value={formData['In-Stock Quantity']}
                                    onChange={handleInputChange}
                                />
                            </div>                      
                        </div>


                        <label>Category</label>
                        <input
                            type="text"
                            name="Category"
                            value={formData['Category']}
                            onChange={handleInputChange}
                        />

                        <div className="dimensions-row">
                            <div>
                                <label>Length(cm)</label>
                                <input
                                    type="number"
                                    name="Length(cm)"
                                    value={formData['Length(cm)']}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <label>Width(cm)</label>
                                <input
                                    type="number"
                                    name="Width(cm)"
                                    value={formData['Width(cm)']}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <label>Height(cm)</label>
                                <input
                                    type="number"
                                    name="Height(cm)"
                                    value={formData['Height(cm)']}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <label>Weight(kg)</label>
                                <input
                                    type="number"
                                    name="Weight(kg)"
                                    value={formData['Weight(kg)']}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <label>Unit Cost(AUD)</label>
                        <input
                            type="number"
                            name="Unit Cost(AUD)"
                            value={formData['Unit Cost(AUD)']}
                            onChange={handleInputChange}
                        />
                    </form>
                </div>
                <div className="modal-footer">
                    <button className="save-button" onClick={handleSave}>
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditInventoryModal;
