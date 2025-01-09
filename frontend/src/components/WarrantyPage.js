import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import Sidebar from './Sidebar';
import axios from 'axios';
import { CSVLink } from 'react-csv';
import { useNavigate } from 'react-router-dom'; 
import '../style/Sidebar.css';
import '../style/Warranty.css';
import AddWarrantyModal from './modals/AddWarranty';
import EditWarrantyModal from './modals/EditWarranty';  
import GenerateWarrantyModal from './modals/GenerateWarranty';  
import EditIcon from '../icons/edit-icon.svg';
import DeleteIcon from '../icons/delete-icon.svg';

const WarrantyPage = () => {
    const [searchFilter, setSearchFilter] = useState({
        customerNumber: '',
        invoice: '',
        customerName: '',
    });
    const [warrantyRecords, setWarrantyRecords] = useState([]);
    const [loggedIn, setLoggedIn] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const[isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [recordToEdit, setRecordToEdit] = useState(null);
    const navigate = useNavigate();

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

    const fetchWarrantyRecords = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/warranty', {
                params: {
                    customerNumber: searchFilter.customerNumber.trim(),
                    invoice: searchFilter.invoice.trim(),
                    customerName: searchFilter.customerName.trim(),
                },
            });
            setWarrantyRecords(response.data); // No need to group records anymore
        } catch (error) {
            console.error('Error fetching warranty records:', error);
        }
    };

    const handleDelete = async (invoice, serialNumber) => {
            try {
                const response = await axios.delete(`http://localhost:5000/api/warranty/${invoice}/${serialNumber}`);
                Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: response.data.message,
                });
                fetchWarrantyRecords(); // Refresh the table after deletion
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
    const handleSaveEdit = (updatedRecord) => {
        // Update the record in the backend and refresh the table
        console.log('Updated Record:', updatedRecord);
        fetchWarrantyRecords();
    };

    const handleToggleEmailStatus = async (invoice, serialNumber) => {
        try {
            const response = await axios.put('http://localhost:5000/api/warranty/email-status', {
                invoice,
                serialNumber,
            });
            fetchWarrantyRecords();
        } catch (error) {
            console.error('Error updating Email Customer status:', error);
        }
    };

    const handleToggleXeroStatus = async (invoice, serialNumber) => {
        try {
            const response = await axios.put('http://localhost:5000/api/warranty/xero-status', {
                invoice,
                serialNumber,
            });
            fetchWarrantyRecords();
        } catch (error) {
            console.error('Error updating Xero status:', error);
        }
    };
    

    useEffect(() => {
        checkAuth();
    }, []);

    useEffect(() => {
        if (loggedIn) {
            fetchWarrantyRecords();
        }
    }, [searchFilter, loggedIn]);

    const csvHeaders = [
        { label: 'Customer Number', key: 'Customer Number' },
        { label: 'Invoice Date', key: 'Invoice Date' },
        { label: 'Invoice', key: 'Invoice' },
        { label: 'Customer Name', key: 'Customer Name' },
        { label: 'Items', key: 'Items' },
        { label: 'Serial Number', key: 'Serial Number' },
        { label: 'Template', key: 'Template' },
        { label: 'Years', key: 'Years' },
        { label: 'Start', key: 'Start' },
        { label: 'End', key: 'End' },
        { label: 'Upload to Xero', key: 'Upload to Xero' },
        { label: 'Email Customer', key: 'Email Customer' },
    ];

    if (!loggedIn) {
        return null;
    }

    return (
        <div className="table-page">
            <Sidebar />
            <div className="table-content">
                <div className="table-header">
                    <h1>Warranty</h1>
                </div>
                <div className="table-search">
                    <input
                        type="text"
                        placeholder="Customer Number"
                        value={searchFilter.customerNumber}
                        onChange={(e) => setSearchFilter({ ...searchFilter, customerNumber: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Invoice"
                        value={searchFilter.invoice}
                        onChange={(e) => setSearchFilter({ ...searchFilter, invoice: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Customer Name"
                        value={searchFilter.customerName}
                        onChange={(e) => setSearchFilter({ ...searchFilter, customerName: e.target.value })}
                    />
                    <div className="button-container">
                        <button className="add-button" onClick={() => { setIsModalOpen(true); }}>
                            Add Warranty
                        </button>

                        <button className="add-button" onClick={() => { setIsGenerateModalOpen(true); }}>
                            Generate Warranty Card
                        </button>
                        <CSVLink
                            data={warrantyRecords}
                            headers={csvHeaders}
                            filename="warranty_records.csv"
                            className="csv-button"
                        >
                            Export CSV
                        </CSVLink>
                    </div>
                </div>
                <div className="table-table-container">
                    <table className="table-table">
                        <thead>
                            <tr>
                                {csvHeaders.map((header) => (
                                    <th key={header.key}>{header.label}</th>
                                ))}
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {warrantyRecords.map((record, index) => (
                                <tr key={index}>
                                    <td><div className="cell-content">{record['Customer Number']}</div></td>
                                    <td><div className="cell-content">{record['Invoice Date']}</div></td>
                                    <td><div className="cell-content">{record['Invoice']}</div></td>
                                    <td style={{width:"170px", height:"50px"}}><div className="cell-content">{record['Customer Name']}</div></td>
                                    <td style={{width:"170px", height:"50px"}}><div className="cell-content">{record['Items']}</div></td>
                                    <td style={{width:"250px", height:"50px"}}><div className="cell-content">{record['Serial Number']}</div></td>
                                    <td><div className="cell-content">{record['Template']}</div></td>
                                    <td><div className="cell-content">{record['Years']}</div></td>
                                    <td><div className="cell-content">{record['Start']}</div></td>
                                    <td><div className="cell-content">{record['End']}</div></td>
                                    <td style={{width:"100px", height:"50px"}}>
                                    <div className="cell-content">
                                        <button 
                                            onClick={() => handleToggleXeroStatus(record['Invoice'], record['Serial Number'], 'Upload to Xero')} 
                                            className={`toggle-status-button ${record['Upload to Xero'] === 'yes' ? 'yes' : 'no'}`}
                                        >
                                            {record['Upload to Xero']}
                                        </button>
                                    </div>
                                    </td>
                                    <td style={{width: "100px", height: "50px"}}>
                                        <div className="cell-content">
                                            <button 
                                                onClick={() => handleToggleEmailStatus(record['Invoice'], record['Serial Number'], 'Email Customer')} 
                                                className={`toggle-status-button ${record['Email Customer'] === 'yes' ? 'yes' : 'no'}`}
                                            >
                                                {record['Email Customer']}
                                            </button>
                                        </div>
                                    </td>

                                    <td style={{width:"50px", height:"50px"}}>
                                        <button className="action-button" onClick={() => handleEdit(record)}>
                                            <img src={EditIcon} alt="Edit" />
                                        </button>
                                        <button className="action-button" onClick={() => handleDelete(record['Invoice'], record['Serial Number'])}>
                                            <img src={DeleteIcon} alt="Delete" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && <AddWarrantyModal onClose={() => setIsModalOpen(false)} fetchWarrantyRecords={fetchWarrantyRecords} />}

            {isEditModalOpen && <EditWarrantyModal 
                                    isOpen={isEditModalOpen}
                                    onClose={() => setIsEditModalOpen(false)}
                                    recordToEdit={recordToEdit}
                                    onSave={handleSaveEdit}
            />}

            {isGenerateModalOpen && (
                <GenerateWarrantyModal 
                    isOpen={isGenerateModalOpen} 
                    onClose={() => setIsGenerateModalOpen(false)} 
                />
            )}


        </div>
    );
};

export default WarrantyPage;
