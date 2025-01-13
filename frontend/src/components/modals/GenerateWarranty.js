import React, { useState, useEffect } from 'react'; 
import '../../style/EditModal.css';
import CloseIcon from '../../icons/close-icon.svg';
import WarningIcon from '../../icons/warning-icon.svg';
import Swal from 'sweetalert2';
import axios from 'axios';

const GenerateWarrantyModal = ({ isOpen, onClose }) => {
    const [invoice, setInvoice] = useState('');
    const [records, setRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Handle Search Click
    const handleSearch = async () => {
        if (!invoice) {
            alert('Please enter an invoice number.');
            return;
        }
    
        setIsLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/warranty', {
                params: { invoice: invoice.trim() },
            });
            console.log("API Response: ", response.data);  // Log response data to see if it contains records
            setRecords(response.data);
        } catch (error) {
            console.error('Error fetching warranty records:', error);
            alert('Failed to fetch warranty records.');
        }
        setIsLoading(false);
    };

    // Handle Generate PDF Click
    const handleGeneratePDF = async () => {
        try {
            const response = await axios.post('http://localhost:5000/api/warranty/generate-pdf', { invoiceNumber: invoice });
    
            if (response.data.success) {
                const filePath = response.data.filePath;    
                Swal.fire({
                    icon: 'success',
                    title: 'Warranty Generated',
                });
            }
        } catch (error) {
            console.error('Error generating warranty:', error.response?.data || error.message);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to generate warranty.',
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Warranty Card Generator</h2>
                    <button className="modal-close-button" onClick={onClose}>
                        <img src={CloseIcon} alt="Close" />
                    </button>
                </div>
                <div className="modal-body">
                <div className="dimensions-row">
                        <label style={{ width: "20%" }}>Invoice Number</label>
                        <span className="tooltip-icon" title="Enter the exact invoice number to generate warranty card"><img src={WarningIcon} alt="Close" className="tooltip-icon-img"/></span>
                    <input
                        type="text"
                        id="invoice"
                        value={invoice}
                        onChange={(e) => setInvoice(e.target.value)}
                    />
                    <button className="add-button" onClick={handleSearch}>Search</button>
                </div>
                    <div className="table-container" style={{ overflowX: "auto" }}>
                        <div className="table-wrapper" style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                            {/* Table Header */}
                            <div className="table-header" style={{ display: "flex", backgroundColor: "#f4f4f4", padding: "8px 0" }}>
                                <div className="table-cell" style={{ flex: 1, paddingLeft:"10px"}}>Invoice</div>
                                <div className="table-cell" style={{ flex: 1 }}>Customer Name</div>
                                <div className="table-cell" style={{ flex: 1 }}>Items</div>
                                <div className="table-cell" style={{ flex: 1 }}>Serial Number</div>
                                <div className="table-cell" style={{ flex: 1 }}>Template</div>
                                <div className="table-cell" style={{ flex: 1 }}>Years</div>
                                <div className="table-cell" style={{ flex: 1 }}>Start</div>
                                <div className="table-cell" style={{ flex: 1 }}>End</div>
                            </div>

                            {/* Table Body */}
                            <div className="table-body" style={{ display: "flex", flexDirection: "column", overflowY: "auto", maxHeight: "400px" }}>
                                {records.map((record, index) => (
                                    <div key={index} className="table-row" style={{ display: "flex" }}>
                                        <div className="table-cell" style={{ flex: 1 }}>{record['Invoice']}</div>
                                        <div className="table-cell" style={{ flex: 1 }}>{record['Customer Name']}</div>
                                        <div className="table-cell" style={{ flex: 1 }}>{record['Items']}</div>
                                        <div className="table-cell" style={{ flex: 1 }}>{record['Serial Number']}</div>
                                        <div className="table-cell" style={{ flex: 1 }}>{record['Template']}</div>
                                        <div className="table-cell" style={{ flex: 1 }}>{record['Years']}</div>
                                        <div className="table-cell" style={{ flex: 1 }}>{record['Start']}</div>
                                        <div className="table-cell" style={{ flex: 1 }}>{record['End']}</div>
                                    </div>
                                ))}
                            </div>

                        </div>
                    </div>
                </div>

                {records.length > 0 && (
                    <div className="modal-footer">
                        <button className='modal-add-button' onClick={handleGeneratePDF}>Generate Warranty</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GenerateWarrantyModal;
