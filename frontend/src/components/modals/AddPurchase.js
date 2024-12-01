import React, { useState } from 'react';
import '../../style/Modal.css';
import CloseIcon from '../../icons/close-icon.svg';

const Modal = ({ onClose }) => {
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

    const handleNewItemChange = (e) => {
        const { name, value } = e.target;
        setNewItemData({ ...newItemData, [name]: value });
    };

    const handleAddClick = async () => {
        if (activeTab === 'existing') {
            // Existing item logic (already written, unchanged)
            console.log('Adding Existing Item:', { existingItemNumber, existingQuantity });
        } else {
            // New item logic
            try {
                const response = await fetch('http://localhost:5000/api/inventory', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newItemData),
                });
    
                if (response.ok) {
                    console.log('New item added successfully');
                    onClose();  // Close the modal after successful addition
                } else {
                    console.error('Failed to add new item');
                }
            } catch (error) {
                console.error('Error adding new item:', error);
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
