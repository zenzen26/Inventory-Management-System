import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import axios from 'axios';
import AddPurchaseModal from './modals/AddPurchase'; 
import Swal from 'sweetalert2';
import { CSVLink } from 'react-csv';
import { useNavigate } from 'react-router-dom'; // Assuming you're using React Router
import '../style/Sidebar.css';
import '../style/Inventory.css';
import EditInventoryModal from './modals/EditInventory'; 
import EditIcon from '../icons/edit-icon.svg';
import DeleteIcon from '../icons/delete-icon.svg';

const InventoryPage = () => {
    const [itemNumber, setItemNumber] = useState('');
    const [itemName, setItemName] = useState('');
    const [category, setCategory] = useState('');
    const [inventoryRecords, setInventoryRecords] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [recordToEdit, setRecordToEdit] = useState(null);
    const [loggedIn, setLoggedIn] = useState(false); // State to track login status
    const navigate = useNavigate();

    // Function to check if the user is logged in
    const checkAuth = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/auth-check', { withCredentials: true });
            if (response.data.loggedIn) {
                setLoggedIn(true);
            } else {
                navigate('/'); // Redirect to login page if not authenticated
            }
        } catch (error) {
            console.error('Error checking authentication:', error);
            navigate('/'); // Redirect to login page if there's an error
        }
    };

    // Function to fetch inventory records
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

    // Define CSV headers for inventory
    const csvHeaders = [
        { label: 'Item Number', key: 'Item Number' },
        { label: 'Item Name', key: 'Item Name' },
        { label: 'Total Quantity', key: 'Total Quantity' },
        { label: 'Category', key: 'Category' },
        { label: 'Length(cm)', key: 'Length(cm)' },
        { label: 'Width(cm)', key: 'Width(cm)' },
        { label: 'Height(cm)', key: 'Height(cm)' },
        { label: 'Unit Cost(AUD)', key: 'Unit Cost(AUD)' },
    ];

    // Function to delete an inventory record
    const deleteInventoryRecord = async (itemNumber) => {
        try {
            const response = await axios.delete(`http://localhost:5000/api/inventory/${itemNumber}`);
            Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: response.data.message,
            });
            fetchInventoryRecords(); // Refresh the table after deletion
        } catch (error) {
            console.error('Error deleting inventory record:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to delete the inventory record.',
            });
        }
    };

    const handleEdit = (record) => {
        setRecordToEdit(record);
        setIsEditModalOpen(true);
    };
    
    const handleSaveEdit = (updatedRecord) => {
        fetchInventoryRecords();
    };

    // Check authentication when the component mounts
    useEffect(() => {
        checkAuth();
    }, []);

    // Fetch inventory records when filters change
    useEffect(() => {
        if (loggedIn) {
            fetchInventoryRecords();
        }
    }, [itemNumber, itemName, category, loggedIn]);

    if (!loggedIn) {
        return null; // Show nothing while checking authentication or if not logged in
    }

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
                        <CSVLink
                            data={inventoryRecords}
                            headers={csvHeaders}
                            filename="inventory_overview.csv"
                            className="csv-button"
                        >
                            Export CSV
                        </CSVLink>
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
                                        <button 
                                            className="action-button edit-button"
                                            onClick={() => handleEdit(record)}
                                        >
                                            <img src={EditIcon} alt="Edit" />
                                        </button>
                                        <button
                                            className="action-button delete-button"
                                            onClick={() => {
                                                Swal.fire({
                                                    title: `Are you sure you want to delete Item Number: ${record['Item Number']}?`,
                                                    text: "This action cannot be undone.",
                                                    icon: 'warning',
                                                    showCancelButton: true,
                                                    confirmButtonColor: '#d33',
                                                    cancelButtonColor: '#3085d6',
                                                    confirmButtonText: 'Yes, delete it!',
                                                }).then((result) => {
                                                    if (result.isConfirmed) {
                                                        deleteInventoryRecord(record['Item Number']);
                                                    }
                                                });
                                            }}
                                        >
                                            <img src={DeleteIcon} alt="Delete" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && <AddPurchaseModal onClose={() => setIsModalOpen(false)} fetchInventoryRecords={fetchInventoryRecords} />}
            {isEditModalOpen && <EditInventoryModal 
                                    isOpen={isEditModalOpen}
                                    onClose={() => setIsEditModalOpen(false)}
                                    recordToEdit={recordToEdit}
                                    onSave={handleSaveEdit}
            />}
        </div>

    );
};

export default InventoryPage;
