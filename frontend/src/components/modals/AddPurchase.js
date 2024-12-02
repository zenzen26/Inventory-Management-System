import React, { useState } from 'react';
import '../../style/Modal.css';
import '../../style/Message.css';
import CloseIcon from '../../icons/close-icon.svg';
import Swal from 'sweetalert2'

const Modal = ({ onClose, fetchInventoryRecords }) => {
    const [activeTab, setActiveTab] = useState('existing');
    const [existingItemNumber, setExistingItemNumber] = useState('');
    const [existingQuantity, setExistingQuantity] = useState('');
    const [newItemData, setNewItemData] = useState({
        itemNumber: '',
        itemName: '',
        category: '',
        quantity: '',
        length: '',
        width: '',
        height: '',
        weight: '',
        unitCost: '',
    });
const [successMessage, setSuccessMessage] = useState('');
const [errorMessage, setErrorMessage] = useState('');

const handleNewItemChange = (e) => {
    const { name, value } = e.target;
    setNewItemData({ ...newItemData, [name]: value });
};

const handleAddClick = async () => {
    if (activeTab === 'existing') {
        if (!existingItemNumber || !existingQuantity) {
            // Display error pop-up if required fields are missing
            Swal.fire({
                icon: 'error',
                title: 'Missing Fields',
                text: 'Item Number and Quantity are required.',
                confirmButtonText: 'OK',
            });
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/inventory/${existingItemNumber.toLowerCase()}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ quantity: Number(existingQuantity) }),
            });

            if (response.ok) {
                const data = await response.json();

                // Display success pop-up
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: data.message,
                    confirmButtonText: 'OK',
                });

                setSuccessMessage(data.message)                
                onClose(); // Close modal on success

            } else {
                const errorData = await response.json();

                // Handle error response
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: errorData.message || 'Failed to update item quantity.',
                    confirmButtonText: 'OK',
                });

                setErrorMessage(errorData.message || 'Failed to update item quantity.');
            }
        } catch (error) {
            // Handle unexpected error
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error updating item quantity.',
                confirmButtonText: 'OK',
            });

            setErrorMessage('Error updating item quantity.');
            console.error(error);
        }
    } else {
        // New item logic
        if (!newItemData.itemNumber || !newItemData.itemName || !newItemData.quantity) {
            // Display error pop-up if required fields are missing
            Swal.fire({
                icon: 'error',
                title: 'Missing Fields',
                text: 'Item Number, Item Name, and Quantity are required for new items.',
                confirmButtonText: 'OK',
            });
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/inventory', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newItemData),
            });

            if (response.ok) {
                const data = await response.json();

                // Display success pop-up
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: data.message,
                    confirmButtonText: 'OK',
                });

                setSuccessMessage(data.message);
                onClose(); // Close modal on success
            } else {
                const errorData = await response.json();

                // Handle error response
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: errorData.message || 'Failed to add new item.',
                    confirmButtonText: 'OK',
                });

                setErrorMessage(errorData.message || 'Failed to add new item.');
            }
        } catch (error) {
            // Handle unexpected error
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error adding new item.',
                confirmButtonText: 'OK',
            });

            setErrorMessage('Error adding new item.');
            console.error(error);
        }
    }
};


    return (
        <div className="modal-overlay">
            <div className="modal-content">
                {/* Modal Header */}
                <div className="modal-header">
                    <h2>Add Purchase</h2>
                    <button className="modal-close-button" onClick={onClose}><img src={CloseIcon} alt="Close" /></button>
                </div>

                {/* Modal Tabs */}
                <div className="modal-tabs">
                    <button
                        className={`modal-tab ${activeTab === 'existing' ? 'active' : ''}`}
                        onClick={() => setActiveTab('existing')}
                    >
                        Existing Item
                    </button>
                    <button
                        className={`modal-tab ${activeTab === 'new' ? 'active' : ''}`}
                        onClick={() => setActiveTab('new')}
                    >
                        New Item
                    </button>
                </div>

                {/* Modal Body */}
                <div className="modal-body">
                    {activeTab === 'existing' ? (
                        <div>
                            <label>
                                Item Number:
                                <input
                                    type="text"
                                    value={existingItemNumber}
                                    onChange={(e) => setExistingItemNumber(e.target.value)}
                                />
                            </label>
                            <label>
                                Quantity:
                                <input
                                    type="number"
                                    value={existingQuantity}
                                    onChange={(e) => setExistingQuantity(e.target.value)}
                                />
                            </label>
                        </div>
                    ) : (
                        <div className="new-item-layout">
                            <label>
                                Item Number:
                                <input
                                    type="text"
                                    name="itemNumber"
                                    value={newItemData.itemNumber}
                                    onChange={handleNewItemChange}
                                />
                            </label>
                            <label>
                                Item Name:
                                <input
                                    type="text"
                                    name="itemName"
                                    value={newItemData.itemName}
                                    onChange={handleNewItemChange}
                                />
                            </label>
                            <div className="dimensions">
                                <label>
                                    Category:
                                    <input
                                        type="text"
                                        name="category"
                                        value={newItemData.category}
                                        onChange={handleNewItemChange}
                                    />
                                </label>
                                <label>
                                    Quantity:
                                    <input
                                        type="number"
                                        name="quantity"
                                        value={newItemData.quantity}
                                        onChange={handleNewItemChange}
                                    />
                                </label>
                            </div>
                            
                            <div className="dimensions">
                                <label>
                                    Length (cm):
                                    <input
                                        type="number"
                                        name="length"
                                        value={newItemData.length}
                                        onChange={handleNewItemChange}
                                    />
                                </label>
                                <label>
                                    Width (cm):
                                    <input
                                        type="number"
                                        name="width"
                                        value={newItemData.width}
                                        onChange={handleNewItemChange}
                                    />
                                </label>
                                <label>
                                    Height (cm):
                                    <input
                                        type="number"
                                        name="height"
                                        value={newItemData.height}
                                        onChange={handleNewItemChange}
                                    />
                                </label>
                                <label>
                                    Weight (kg):
                                    <input
                                        type="number"
                                        name="weight"
                                        value={newItemData.weight}
                                        onChange={handleNewItemChange}
                                    />
                                </label>
                            </div>
                            <label>
                                Unit Cost:
                                <input
                                    type="number"
                                    name="unitCost"
                                    value={newItemData.unitCost}
                                    onChange={handleNewItemChange}
                                />
                            </label>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="modal-footer">
                    <button className="modal-add-button" onClick={handleAddClick}>
                        Add
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal;
