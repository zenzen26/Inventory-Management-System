import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import axios from 'axios';
import Swal from 'sweetalert2';
import { CSVLink } from 'react-csv';
import { useNavigate } from 'react-router-dom';
import '../style/Sidebar.css';
import '../style/Inventory.css';
import EditIcon from '../icons/edit-icon.svg';
import DeleteIcon from '../icons/delete-icon.svg';

const InventoryDetailsPage = () => {
    const [serialNumber, setSerialNumber] = useState('');
    const [itemNumber, setItemNumber] = useState('');
    const [supplierId, setSupplierId] = useState('');
    const [soldStatus, setSoldStatus] = useState('');
    const [inventoryDetailsRecords, setInventoryDetailsRecords] = useState([]);
    const [loggedIn, setLoggedIn] = useState(false);
    const navigate = useNavigate();

    // Function to check if the user is logged in
    const checkAuth = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/auth-check', { withCredentials: true });
            if (response.data.loggedIn) {
                setLoggedIn(true);
            } else {
                navigate('/');
            }
        } catch (error) {
            console.error('Error checking authentication:', error);
            navigate('/');
        }
    };

    // Function to fetch inventory details records
    const fetchInventoryDetailsRecords = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/inventory-details', {
                params: {
                    serialNumber: serialNumber.trim(),
                    itemNumber: itemNumber.trim(),
                    supplierId: supplierId.trim(),
                    soldStatus: soldStatus.trim(),
                },
            });
            setInventoryDetailsRecords(response.data);
        } catch (error) {
            console.error('Error fetching inventory details records:', error);
            Swal.fire({
                icon: 'error',
                title: 'Fetch Failed',
                text: 'Could not retrieve inventory details.',
            });
        }
    };

    // Define CSV headers for details page
    const csvHeaders = [
        { label: 'Serial Number', key: 'Serial Number' },
        { label: 'Item Number', key: 'Item Number' },
        { label: 'Supplier ID', key: 'Supplier ID' },
        { label: 'Supplier Invoice', key: 'Supplier Invoice' },
        { label: 'Part Number', key: 'Part Number' },
        { label: 'Remark', key: 'Remark' },
        { label: 'Sold Status', key: 'Sold Status' },
    ];

    // Function to delete an inventory detail record
    const deleteInventoryDetailsRecord = async (serialNumber) => {
        try {
            const response = await axios.delete(`http://localhost:5000/api/inventory/${serialNumber}`);
            Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: response.data.message,
            });
            fetchInventoryDetailsRecords(); // Refresh the table after deletion
        } catch (error) {
            console.error('Error deleting inventory detail record:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to delete the inventory detail record.',
            });
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    useEffect(() => {
        if (loggedIn) {
            fetchInventoryDetailsRecords();
        }
    }, [serialNumber, itemNumber, supplierId, soldStatus, loggedIn]);

    if (!loggedIn) {
        return null;
    }

    return (
        <div className="inventory-page">
            <Sidebar />
            <div className="inventory-content">
                <div className="inventory-header">
                    <h1>Inventory Details</h1>
                </div>

                {/* Search filter form */}
                <div className="inventory-search">
                    <input
                        type="text"
                        placeholder="Serial Number"
                        value={serialNumber}
                        onChange={(e) => setSerialNumber(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Item Number"
                        value={itemNumber}
                        onChange={(e) => setItemNumber(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Supplier ID"
                        value={supplierId}
                        onChange={(e) => setSupplierId(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Sold Status"
                        value={soldStatus}
                        onChange={(e) => setSoldStatus(e.target.value)}
                    />
                    <div className="button-container">
                        <button className="add-button">
                            Add In-Stock Arrival
                        </button>
                        <CSVLink
                            data={inventoryDetailsRecords}
                            headers={csvHeaders}
                            filename="inventory_details.csv"
                            className="csv-button"
                        >
                            Export CSV
                        </CSVLink>
                    </div>
                </div>

                {/* Inventory details table */}
                <div className="inventory-table-container">
                    <table className="inventory-table">
                        <thead>
                            <tr>
                                <th>Serial Number</th>
                                <th>Item Number</th>
                                <th>Supplier ID</th>
                                <th>Supplier Invoice</th>
                                <th>Part Number</th>
                                <th>Remark</th>
                                <th>Sold Status</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventoryDetailsRecords.map((record, index) => (
                                <tr key={index}>
                                    <td>{record['Serial Number']}</td>
                                    <td>{record['Item Number']}</td>
                                    <td>{record['Supplier ID']}</td>
                                    <td>{record['Supplier Invoice']}</td>
                                    <td>{record['Part Number']}</td>
                                    <td>{record['Remark']}</td>
                                    <td>{record['Sold Status']}</td>
                                    <td>
                                        <button
                                            className="action-button delete-button"
                                            onClick={() => {
                                                Swal.fire({
                                                    title: `Are you sure you want to delete Serial Number: ${record['Serial Number']}?`,
                                                    text: "This action cannot be undone.",
                                                    icon: 'warning',
                                                    showCancelButton: true,
                                                    confirmButtonColor: '#d33',
                                                    cancelButtonColor: '#3085d6',
                                                    confirmButtonText: 'Yes, delete it!',
                                                }).then((result) => {
                                                    if (result.isConfirmed) {
                                                        deleteInventoryDetailsRecord(record['Serial Number']);
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
        </div>
    );
};

export default InventoryDetailsPage;
