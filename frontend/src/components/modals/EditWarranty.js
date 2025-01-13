import React, { useState, useEffect } from 'react';
import '../../style/EditModal.css';
import CloseIcon from '../../icons/close-icon.svg';
import Swal from 'sweetalert2';
import axios from 'axios';

const EditWarrantyModal = ({ isOpen, onClose, recordToEdit, onSave }) => {
    const [customerNumber, setCustomerNumber] = useState('');
    const [invoiceDate, setInvoiceDate] = useState('');
    const [invoice, setInvoice] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [items, setItems] = useState('');
    const [serialNumber, setSerialNumber] = useState('');
    const [template, setTemplate] = useState('');  
    const [years, setYears] = useState('');
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');

    // Populate form data when recordToEdit changes
    useEffect(() => {
        if (recordToEdit) {
            setCustomerNumber(recordToEdit['Customer Number'] || '');
            setInvoiceDate(recordToEdit['Invoice Date'] || '');
            setInvoice(recordToEdit['Invoice'] || '');
            setCustomerName(recordToEdit['Customer Name'] || '');
            setItems(recordToEdit['Items'] || '');
            setSerialNumber(recordToEdit['Serial Number'] || '');
            
            const mappedTemplate = recordToEdit['Template'] === 'LCD' ? 'LCD' : recordToEdit['Template'] === 'LED' ? 'LED' : '';
            setTemplate(mappedTemplate);

            const mappedYears = recordToEdit['Years']?.toLowerCase() === 'one-year' ? 'One-Year' :
                    recordToEdit['Years']?.toLowerCase() === 'two-years' ? 'Two-Years' :
                    recordToEdit['Years']?.toLowerCase() === 'three-years' ? 'Three-Years' :
                    recordToEdit['Years']?.toLowerCase() === 'one-month' ? 'One-Month' :
                    recordToEdit['Years']?.toLowerCase() === 'three-months' ? 'Three-Months' :
                    recordToEdit['Years']?.toLowerCase() === 'six-months' ? 'Six-Months' :
                    '';  // Default to empty string if no matching value
            setYears(mappedYears);

            setStart(recordToEdit['Start'] || '');
            setEnd(recordToEdit['End'] || '');
        }
    }, [recordToEdit]); // Depend on recordToEdit so this effect runs when it changes

    // Handle save action
    const handleSave = async () => {
        const updatedRecord = {
            customerNumber: customerNumber,
            invoiceDate: invoiceDate,
            oldInvoice: recordToEdit['Invoice'],
            newInvoice: invoice,
            customerName: customerName,
            items: items,
            oldSerialNumber: recordToEdit['Serial Number'],
            newSerialNumber: serialNumber,
            template: template,
            years: years,
            start: start,
            end: end
        };

        try {
            const response = await axios.put(`http://localhost:5000/api/warranty/edit`, updatedRecord)
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: response.data.message || 'Invoice updated successfully!',
            });
            onSave();
            onClose();
        } catch (error) {
            console.error('Error updating invoice:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to update the invoice record.',
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Edit Invoice</h2>
                    <button className="modal-close-button" onClick={onClose}>
                        <img src={CloseIcon} alt="Close" />
                    </button>
                </div>
                <div className="modal-body">
                    <form>
                        <div className='dimensions-row'>
                            <div>
                                <label>Customer Number</label>
                                <input
                                    type="text"
                                    value={customerNumber}
                                    onChange={(e) => setCustomerNumber(e.target.value)}
                                />
                            </div>
                            
                            <div>
                                <label>Customer Name</label>
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className='dimensions-row'>
                            <div>
                                <label>Invoice</label>
                                <input
                                    type="text"
                                    value={invoice}
                                    onChange={(e) => setInvoice(e.target.value)}
                                />
                            </div>
                            
                            <div>
                                <label>Invoice Date</label>
                                <input
                                    type="text"
                                    value={invoiceDate}
                                    onChange={(e) => setInvoiceDate(e.target.value)}
                                />      
                            </div>
                        </div>
                        <div className='dimensions-row'>
                            <div>
                                <label>Items</label>
                                <input
                                    type="text"
                                    value={items}
                                    onChange={(e) => setItems(e.target.value)}
                                />
                            </div>
                            <div>
                                <label>Template</label>
                                <select
                                    value={template}  // this binds the template state correctly
                                    style={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        padding: '8px 12px',
                                        fontSize: '14px',
                                        color: '#333',
                                        cursor: 'pointer',
                                        height: "100%",
                                    }}
                                    onChange={(e) => setTemplate(e.target.value)}
                                >
                                    <option value="">Select</option>
                                    <option value="LCD">LCD</option>
                                    <option value="LED">LED</option>
                                </select>
                            </div>
                        </div>
                        
                        <label>Serial Number</label>
                        <input
                            type="text"
                            value={serialNumber}
                            onChange={(e) => setSerialNumber(e.target.value)}
                        /> 

                        <div className='dimensions-row'>
                            <div>
                                <label>Start</label>
                                <input
                                    type="text"
                                    value={start}
                                    onChange={(e) => setStart(e.target.value)}
                                />
                            </div>
                            <div>
                                <label>Years</label>
                                <select
                                    value={years}  // Bind years state here
                                    style={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        padding: '8px 12px',
                                        fontSize: '14px',
                                        color: '#333',
                                        cursor: 'pointer',
                                        height:"100%",
                                    }}
                                    onChange={(e) => setYears(e.target.value)}
                                >
                                    <option value="Select">Select</option>
                                    <option value="One-Year">One-Year</option>
                                    <option value="Two-Years">Two-Years</option>
                                    <option value="Three-Years">Three-Years</option>
                                    <option value="One-Month">One-Month</option>
                                    <option value="Three-Months">Three-Months</option>
                                    <option value="Six-Months">Six-Months</option>
                                </select>
                            </div>
                            <div>
                                <label>End</label>
                                <input
                                    type="text"
                                    value={end}
                                    onChange={(e) => setEnd(e.target.value)}
                                />
                            </div>
                        </div>                       
                    </form>
                </div>
                <div className="modal-footer">
                    <button className="save-button" onClick={handleSave}>
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditWarrantyModal;
