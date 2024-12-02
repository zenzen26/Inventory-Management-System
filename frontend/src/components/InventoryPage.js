import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import axios from 'axios';
import Modal from './modals/AddPurchase'; 
import EditIcon from '../icons/edit-icon.svg';
import DeleteIcon from '../icons/delete-icon.svg';
import '../style/Sidebar.css';
import '../style/Inventory.css';

const InventoryPage = () => {
    const [itemNumber, setItemNumber] = useState('');
    const [itemName, setItemName] = useState('');
    const [category, setCategory] = useState('');
    const [inventoryRecords, setInventoryRecords] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchInventoryRecords = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/inventory', {
                params: {
                    itemNumber: itemNumber.trim(),
                    itemName: itemName.trim(),
                    category: category.trim()
                },
            });
            setInventoryRecords(response.data);
        } catch (error) {
            console.error('Error fetching inventory records:', error);
        }
    };

    useEffect(() => {
        fetchInventoryRecords();
    }, [itemNumber, itemName, category]);

    return (
        <div className="inventory-page">
            <Sidebar />
            <div className="inventory-content">
                <div className="inventory-header">
                    <h1>Inventory</h1>
                </div>

                {/* Search filter form */}
                <div className="inventory-search">
                    <input
                        type="text"
                        placeholder="Item Number"
                        value={itemNumber}
                        onChange={(e) => setItemNumber(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Item Name"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    />

                    <div className="button-container">
                        <button className="add-button" onClick={() => setIsModalOpen(true)}>
                            Add Purchases
                        </button>
                        <button className="csv-button">Export CSV</button>
                    </div>
                </div>

                {/* Inventory table */}
                <div className="inventory-table-container">
                    <table className="inventory-table">
                        <thead>
                            <tr>
                                <th>Item Number</th>
                                <th>Item Name</th>
                                <th>Total Quantity</th>
                                <th>In-Stock Quantity</th>
                                <th>Category</th>
                                <th>Length (cm)</th>
                                <th>Width (cm)</th>
                                <th>Height (cm)</th>
                                <th>Weight (kg)</th>
                                <th>Unit Cost (AUD)</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventoryRecords.map((record, index) => (
                                <tr key={index}>
                                    <td>{record['Item Number']}</td>
                                    <td>{record['Item Name']}</td>
                                    <td>{record['Total Quantity']}</td>
                                    <td>{record['In-Stock Quantity']}</td>
                                    <td>{record['Category']}</td>
                                    <td>{record['Length(cm)']}</td>
                                    <td>{record['Width(cm)']}</td>
                                    <td>{record['Height(cm)']}</td>
                                    <td>{record['Weight(kg)']}</td>
                                    <td>{`$ ${record['Unit Cost(AUD)']}`}</td>
                                    <td>
                                        <button className="action-button edit-button">
                                            <img src={EditIcon} alt="Edit" />
                                        </button>
                                        <button className="action-button delete-button">
                                            <img src={DeleteIcon} alt="Delete" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && <Modal onClose={() => setIsModalOpen(false)} fetchInventoryRecords={fetchInventoryRecords} />}
        </div>
    );
};

export default InventoryPage;