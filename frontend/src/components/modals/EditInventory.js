import React, { useState, useEffect } from 'react';
import '../../style/EditModal.css';
import CloseIcon from '../../icons/close-icon.svg';
import Swal from 'sweetalert2';
import axios from 'axios';

const EditInventoryModal = ({ isOpen, onClose, recordToEdit, onSave }) => {
    const [itemNumber, setItemNumber] = useState('');
    const [itemName, setItemName] = useState('');
    const [totalQuantity, setTotalQuantity] = useState(0);
    const [inStockQuantity, setInStockQuantity] = useState(0);
    const [category, setCategory] = useState('');
    const [length, setLength] = useState(0);
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const [weight, setWeight] = useState(0);
    const [unitCost, setUnitCost] = useState(0);

    // Populate form data when recordToEdit changes
    useEffect(() => {
        if (recordToEdit) {
            setItemNumber(recordToEdit['Item Number'] || '');
            setItemName(recordToEdit['Item Name'] || '');
            setTotalQuantity(recordToEdit['Total Quantity'] || 0);
            setInStockQuantity(recordToEdit['In-Stock Quantity'] || 0);
            setCategory(recordToEdit['Category'] || '');
            setLength(recordToEdit['Length(cm)'] || 0);
            setWidth(recordToEdit['Width(cm)'] || 0);
            setHeight(recordToEdit['Height(cm)'] || 0);
            setWeight(recordToEdit['Weight(kg)'] || 0);
            setUnitCost(recordToEdit['Unit Cost(AUD)'] || 0);
        }
    }, [recordToEdit]);

    // Handle save action
    const handleSave = async () => {
        const updatedRecord = {
            oldItemNumber: recordToEdit['Item Number'],
            newItemNumber: itemNumber, // Ensure this matches `newItemNumber`
            itemName: itemName,
            totalQuantity: totalQuantity,
            inStockQuantity: inStockQuantity,
            category: category,
            length: length,
            width: width,
            height: height,
            weight: weight,
            unitCost: unitCost,
        };
    
        try {
            const response = await axios.put(`http://localhost:5000/api/inventory/edit/${updatedRecord.oldItemNumber}`, updatedRecord);
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: response.data.message || 'Inventory updated successfully!',
            });
            onSave();
            onClose();
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
                        <label style={{ color: "red" }}>Item Number (Caution)</label>
                        <input
                            type="text"
                            value={itemNumber}
                            onChange={(e) => setItemNumber(e.target.value)}
                        />

                        <label>Item Name</label>
                        <input
                            type="text"
                            value={itemName}
                            onChange={(e) => setItemName(e.target.value)}
                        />

                        <div className="dimensions-row">
                            <div>
                                <label style={{ color: "red" }}>Total Quantity (Caution)</label>
                                <input
                                    type="number"
                                    value={totalQuantity}
                                    onChange={(e) => setTotalQuantity(parseInt(e.target.value, 10) || 0)}
                                />
                            </div>
                            <div>
                                <label style={{ color: "red" }}>In-Stock Quantity (Caution)</label>
                                <input
                                    type="number"
                                    value={inStockQuantity}
                                    onChange={(e) => setInStockQuantity(parseInt(e.target.value, 10) || 0)}
                                />
                            </div>
                        </div>

                        <label>Category</label>
                        <input
                            type="text"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        />

                        <div className="dimensions-row">
                            <div>
                                <label>Length(cm)</label>
                                <input
                                    type="number"
                                    value={length}
                                    onChange={(e) => setLength(parseFloat(e.target.value) || 0)}
                                />
                            </div>
                            <div>
                                <label>Width(cm)</label>
                                <input
                                    type="number"
                                    value={width}
                                    onChange={(e) => setWidth(parseFloat(e.target.value) || 0)}
                                />
                            </div>
                            <div>
                                <label>Height(cm)</label>
                                <input
                                    type="number"
                                    value={height}
                                    onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
                                />
                            </div>
                            <div>
                                <label>Weight(kg)</label>
                                <input
                                    type="number"
                                    value={weight}
                                    onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                                />
                            </div>
                        </div>

                        <label>Unit Cost(AUD)</label>
                        <input
                            type="number"
                            value={unitCost}
                            onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)}
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
