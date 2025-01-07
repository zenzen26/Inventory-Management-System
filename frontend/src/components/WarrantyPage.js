import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import axios from 'axios';
import { CSVLink } from 'react-csv';
import { useNavigate } from 'react-router-dom'; 
import '../style/Sidebar.css';
import '../style/Warranty.css';
import AddEditWarrantyModal from './modals/AddEditWarranty';  
import DownloadIcon from '../icons/download-icon.svg';
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
            setWarrantyRecords(groupRecords(response.data));
        } catch (error) {
            console.error('Error fetching warranty records:', error);
        }
    };

    // Group records by Customer Name, Invoice, Invoice Date, and Customer Number
    const groupRecords = (records) => {
        const grouped = [];
        const seenKeys = new Set();

        records.forEach((record) => {
            const key = `${record['Customer Number']}-${record['Invoice']}-${record['Invoice Date']}-${record['Customer Name']}`;
            if (!seenKeys.has(key)) {
                grouped.push({ ...record, _merged: true });
                seenKeys.add(key);
            } else {
                grouped.push({ ...record, _merged: false });
            }
        });

        return grouped;
    };

    const handleDelete = async (invoice) => {
        try {
            // Send a DELETE request to your API with the invoice
            await axios.delete(`http://localhost:5000/api/warranty/${invoice}`);
            
            // Remove the deleted record from the state to update the UI
            setWarrantyRecords((prevRecords) => prevRecords.filter(record => record['Invoice'] !== invoice));
            
            alert('Warranty record deleted successfully.');
        } catch (error) {
            console.error('Error deleting warranty record:', error);
            alert('Failed to delete warranty record.');
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
                        <button className="add-button" onClick={() => setIsModalOpen(true)}>
                            Add Warranty
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
                                    <td><div className="cell-content">{record._merged ? record['Customer Number'] : ''}</div></td>
                                    <td><div className="cell-content">{record._merged ? record['Invoice Date'] : ''}</div></td>
                                    <td><div className="cell-content">{record._merged ? record['Invoice'] : ''}</div></td>
                                    <td style={{width:"170px", height:"50px"}}><div className="cell-content">{record._merged ? record['Customer Name'] : ''}</div></td>
                                    <td style={{width:"170px", height:"50px"}}><div className="cell-content">{record['Items']}</div></td>
                                    <td style={{width:"250px", height:"50px"}}><div className="cell-content">{record['Serial Number']}</div></td>
                                    <td><div className="cell-content">{record['Template']}</div></td>
                                    <td><div className="cell-content">{record['Years']}</div></td>
                                    <td><div className="cell-content">{record['Start']}</div></td>
                                    <td><div className="cell-content">{record['End']}</div></td>
                                    <td style={{width:"100px", height:"50px"}}><div className="cell-content">{record['Upload to Xero']}</div></td>
                                    <td style={{width:"100px", height:"50px"}}><div className="cell-content">{record['Email Customer']}</div></td>
                                    <td style={{width:"50px", height:"50px"}}>
                                        <button className="action-button"><img src={DownloadIcon} alt="Download" /></button>
                                        <button className="action-button"><img src={EditIcon} alt="Edit" /></button>
                                        <button className="action-button" onClick={() => handleDelete(record['Invoice'])}>
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
                <AddEditWarrantyModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    fetchWarrantyRecords={fetchWarrantyRecords}
                    isEdit={false} // Set to true for edit mode
                />
            )}
        </div>
    );
};

export default WarrantyPage;
