import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import axios from 'axios';
import Swal from 'sweetalert2';
import { CSVLink } from 'react-csv';
import { useNavigate } from 'react-router-dom'; // Assuming you're using React Router
import '../style/Sidebar.css';
import '../style/Inventory.css';
import AddEditSupplierModal from './modals/AddEditSupplier';  
import EditIcon from '../icons/edit-icon.svg';
import DeleteIcon from '../icons/delete-icon.svg';

const SuppliersPage = () => {
    const [supplierID, setSupplierID] = useState('');
    const [supplierName, setSupplierName] = useState('');
    const [supplierRecords, setSupplierRecords] = useState([]);
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
    const fetchSupplierRecords = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/suppliers', {
                params: {
                    supplierID: supplierID.trim(),
                    supplierName: supplierName.trim(),
                },
            });
            setSupplierRecords(response.data);
        } catch (error) {
            console.error('Error fetching inventory records:', error);
        }
    };

    // Define CSV headers for inventory
    const csvHeaders = [
        { label: 'Supplier ID', key: 'Supplier ID' },
        { label: 'Supplier Name', key: 'Supplier Name' },
    ];

    // Function to delete a supplier record
    const deleteSupplierRecord = async (supplierID) => {
        try {
            const response = await axios.delete(`http://localhost:5000/api/suppliers/${supplierID}`);
            Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: response.data.message,
            });
            fetchSupplierRecords(); // Refresh the table after deletion
        } catch (error) {
            console.error('Error deleting supplier record:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to delete the supplier record.',
            });
        }
    };

    const handleEdit = (record) => {
        setRecordToEdit(record);
        setIsEditModalOpen(true);
    };
    
    // Check authentication when the component mounts
    useEffect(() => {
        checkAuth();
    }, []);

    // Fetch inventory records when filters change
    useEffect(() => {
        if (loggedIn) {
            fetchSupplierRecords();
        }
    }, [supplierID, supplierName, loggedIn]);

    if (!loggedIn) {
        return null; // Show nothing while checking authentication or if not logged in
    }

    return (
        <div className="inventory-page">
            <Sidebar />
            <div className="inventory-content">
                <div className="inventory-header">
                    <h1>Suppliers</h1>
                </div>

                {/* Search filter form */}
                <div className="inventory-search">
                    <input
                        type="text"
                        placeholder="Supplier ID"
                        value={supplierID}
                        onChange={(e) => setSupplierID(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Supplier Name"
                        value={supplierName}
                        onChange={(e) => setSupplierName(e.target.value)}
                    />

                    <div className="button-container">
                        <button className="add-button" onClick={() => setIsModalOpen(true)}>
                            Add Supplier
                        </button>
                        <CSVLink
                            data={supplierRecords}
                            headers={csvHeaders}
                            filename="suppliers.csv"
                            className="csv-button"
                        >
                            Export CSV
                        </CSVLink>
                    </div>
                </div>

                {/* Supplier table */}
                <div className="inventory-table-container">
                    <table className="inventory-table">
                        <thead>
                            <tr>
                                <th>Supplier ID</th>
                                <th>Supplier Name</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {supplierRecords.map((record, index) => (
                                <tr key={index}>
                                    <td>{record['Supplier ID']}</td>
                                    <td>{record['Supplier Name']}</td>
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
                                                    title: `Are you sure you want to delete Supplier ID: ${record['Supplier ID']}?`,
                                                    text: "This action cannot be undone.",
                                                    icon: 'warning',
                                                    showCancelButton: true,
                                                    confirmButtonColor: '#d33',
                                                    cancelButtonColor: '#3085d6',
                                                    confirmButtonText: 'Yes, delete it!',
                                                }).then((result) => {
                                                    if (result.isConfirmed) {
                                                        deleteSupplierRecord(record['Supplier ID']);
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

            {isModalOpen && (
                <AddEditSupplierModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    fetchSupplierRecords={fetchSupplierRecords}
                    isEdit={false} // Set to true for edit mode
                />
            )}
            {isEditModalOpen && (
                <AddEditSupplierModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    fetchSupplierRecords={fetchSupplierRecords}
                    isEdit={true}
                    recordToEdit={recordToEdit}
                />
)}

        </div>

    );
};

export default SuppliersPage;
