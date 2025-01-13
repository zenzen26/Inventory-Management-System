import React, { useState, useEffect } from 'react';
import '../../style/AddWarrantyModal.css';
import CloseIcon from '../../icons/close-icon.svg';
import DeleteIcon from '../../icons/delete-icon.svg';
import Swal from 'sweetalert2';
import axios from 'axios';

const AddWarrantyModal = ({onClose, fetchWarrantyRecords }) => {
    const [customerNumber, setCustomerNumber] = useState('');
    const [invoiceDate, setInvoiceDate] = useState('');
    const [invoice, setInvoice] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [rows, setRows] = useState([{ items: '', serialNumber: '', template: '', years: '', start: '' }]);

    const handleAddRow = () => {
        setRows([...rows, { items: '', serialNumber: '', template: '', years: '', start: '' }]);
    };

    const handleDeleteRow = (index) => {
        const updatedRows = [...rows];
        updatedRows.splice(index, 1);
        setRows(updatedRows);
    };

    const handleChangeRow = (index, e) => {
        const { name, value } = e.target;
        const updatedRows = [...rows];
        updatedRows[index][name] = value;
        setRows(updatedRows);
    };

    const handleSave = async () => {
        const updatedRows = rows.map((row) => {
            const years = row.years ? parseInt(row.years, 10) : NaN;
            const startDate = row.start ? new Date(row.start) : null;
    
            if (!startDate || isNaN(startDate.getTime())) {
                Swal.fire({
                    icon: 'error',
                    title: 'Validation Error',
                    text: 'Invalid Start Date provided. Please enter a valid date.',
                });
                throw new Error("Invalid Start Date.");
            }
    
            if (isNaN(years) || years <= 0) {
                Swal.fire({
                    icon: 'error',
                    title: 'Validation Error',
                    text: 'Invalid Years provided. Please select a valid number of years.',
                });
                throw new Error("Invalid Years.");
            }
    
            const endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + (years * 12));
    
            const formatDate = (date) => {
                const day = ("0" + date.getDate()).slice(-2);
                const month = ("0" + (date.getMonth() + 1)).slice(-2);
                const year = date.getFullYear();
                return `${day}/${month}/${year}`;
            };
    
            return {
                ...row,
                serialNumber: row.serialNumber || "N/A",
                start: formatDate(startDate),
                end: formatDate(endDate),
            };
        });
    
        const warrantyData = {
            customerName,
            customerNumber,
            invoice,
            invoiceDate,
            items: updatedRows,
        };
    
        try {
            const response = await axios.post('http://localhost:5000/api/warranty', warrantyData);
            Swal.fire({
                icon: 'success',
                title: 'Warranty Record Added',
                text: response.data.message || 'Warranty record saved successfully!',
            });
            fetchWarrantyRecords();
            onClose();
        } catch (error) {
            console.error('Error saving warranty record:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Failed to save the warranty record.',
            });
        }
    };

    return (
    
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Add Warranty Record</h2>
                    <button className="modal-close-button" onClick={onClose}>
                        <img src={CloseIcon} alt="Close" />
                    </button>
                </div>
                <div className="modal-body">
                    <form>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Customer Number</label>
                                <input
                                    type="text"
                                    value={customerNumber}
                                    onChange={(e) => setCustomerNumber(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Customer Name</label>
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Invoice</label>
                                <input
                                    type="text"
                                    value={invoice}
                                    onChange={(e) => setInvoice(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Invoice Date</label>
                                <input
                                    type="text"
                                    value={invoiceDate}
                                    onChange={(e) => setInvoiceDate(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className='table-container'>
                            <div className='table-wrapper'>
                                <div className='table-header'>
                                    <div className="table-cell">Items</div>
                                    <div className="table-cell">Serial Number</div>
                                    <div className="table-cell">Template</div>
                                    <div className="table-cell">Years</div>
                                    <div className="table-cell">Start Date</div>
                                </div>
                                <div className='table-body-wrapper'>
                                    <div className='table-body'>
                                        {rows.map((row, index) => (
                                            <div key={index} className="table-row">
                                                <div className="table-cell">
                                                    <input
                                                        type="text"
                                                        name="items"
                                                        value={row.items}
                                                        onChange={(e) => handleChangeRow(index, e)}
                                                    />
                                                </div>
                                                <div className="table-cell">
                                                    <input
                                                        type="text"
                                                        name="serialNumber"
                                                        value={row.serialNumber}
                                                        onChange={(e) => handleChangeRow(index, e)}
                                                    />
                                                </div>
                                                <div className="table-cell">
                                                    <select
                                                        className='select-input'
                                                        name="template"
                                                        value={row.template}
                                                        onChange={(e) => handleChangeRow(index, e)}
                                                    >
                                                        <option value="Select">Select</option>
                                                        <option value="LCD">LCD</option>
                                                        <option value="LED">LED</option>
                                                    </select>
                                                </div>
                                                <div className="table-cell">
                                                    <select
                                                        className='select-input'
                                                        name="years"
                                                        value={row.years}
                                                        onChange={(e) => handleChangeRow(index, e)}
                                                    >
                                                        <option value="Select">Select</option>
                                                        <option value="12">One-Year</option>
                                                        <option value="24">Two-Years</option>
                                                        <option value="36">Three-Years</option>
                                                        <option value="1">One-Month</option>
                                                        <option value="3">Three-Months</option>
                                                        <option value="6">Six-Months</option>
                                                    </select>
                                                </div>
                                                <div className="table-cell">
                                                    <input
                                                        type="text"
                                                        name="start"
                                                        value={row.start}
                                                        onChange={(e) => handleChangeRow(index, e)}
                                                    />
                                                </div>
                                                <div className="table-cell">
                                                    <div onClick={() => handleDeleteRow(index)} className="delete-icon">
                                                        <img src={DeleteIcon} alt="Delete" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="add-row-link" onClick={handleAddRow} style={{ textAlign: 'left', padding: '10px' }}>
                            + Add row
                        </div>
                    </form>
                </div>
                <div className="modal-footer">
                    <button className="save-button" onClick={handleSave}>
                        Add Warranty Record
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddWarrantyModal;
