import React, { useState } from 'react';
import '../../style/AddInStockModal.css';
import CloseIcon from '../../icons/close-icon.svg';
import DeleteIcon from '../../icons/delete-icon.svg';  // Import the DeleteIcon SVG
import Swal from 'sweetalert2';
import axios from 'axios';

const AddInStockModal = ({ onClose, fetchInventoryDetailsRecords }) => {
    
    const [rows, setRows] = useState([
      {
        serialNumber: '',
        itemNumber: '',
        supplierId: '',
        supplierInvoice: '',
        partNumber: '',
        remark: ''
      }
    ]);
  
    const handleInputChange = (e, index) => {
      const { name, value } = e.target;
      const updatedRows = [...rows];
      updatedRows[index][name] = value;
      setRows(updatedRows);
    };
  
    const handleAddRow = () => {
      setRows([
        ...rows,
        { serialNumber: '', itemNumber: '', supplierId: '', supplierInvoice: '', partNumber: '', remark: '' }
      ]);
    };
  
    const handleDeleteRow = (index) => {
      const updatedRows = rows.filter((_, rowIndex) => rowIndex !== index);
      setRows(updatedRows);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Prepare the data to send, wrapping it in an array even if it's a single row
        const dataToSend = rows.map(({ serialNumber, itemNumber, supplierId, supplierInvoice, partNumber, remark }) => ({
            serialNumber,
            itemNumber,
            supplierId,
            supplierInvoice,
            partNumber,
            remark,
        }));
    
        try {
            const response = await axios.post('http://localhost:5000/api/inventory-details/add', dataToSend);
    
            if (response.data.success) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: response.data.message || 'All rows have been successfully added!',
                });
    
                fetchInventoryDetailsRecords(); // Refresh inventory records
                onClose(); // Close the modal
            } else {
                throw new Error(response.data.message || 'Failed to add rows.');
            }
        } catch (error) {
            await Swal.fire({
                icon: 'error',
                title: 'Error Adding Items',
                text: error.response?.data?.message || error.message || 'An unexpected error occurred.',
            });
        }
    };
    
  return (
    <div className="modal-overlay">
      <div className="modal-content" style ={{maxWidth: '75%'}}>
        <div className="modal-header">
            <h2>Add New Stock Arrival</h2>
            <button className="modal-close-button" onClick={onClose}><img src={CloseIcon} alt="Close" /></button>
        </div>
        <form id="inStockForm" onSubmit={handleSubmit}>
        <div className="table-container">
            <div className="table-wrapper">
                <div className="table-header">
                    <div className="table-cell">Serial Number</div>
                    <div className="table-cell">Item Number</div>
                    <div className="table-cell">Supplier ID</div>
                    <div className="table-cell">Supplier Invoice</div>
                    <div className="table-cell">Part Number</div>
                    <div className="table-cell">Remark</div>
                    <div className="table-cell"></div>
                </div>
                <div className="table-body-wrapper">
                    <div className="table-body">
                        {rows.map((row, index) => (
                            <div key={index} className="table-row">
                                <div className="table-cell">
                                    <input
                                        type="text"
                                        name="serialNumber"
                                        value={row.serialNumber}
                                        placeholder="Enter Serial Number"
                                        onChange={(e) => handleInputChange(e, index)}
                                    />
                                </div>
                                <div className="table-cell">
                                    <input
                                        type="text"
                                        name="itemNumber"
                                        value={row.itemNumber}
                                        placeholder="Enter Item Number"
                                        onChange={(e) => handleInputChange(e, index)}
                                    />
                                </div>
                                <div className="table-cell">
                                    <input
                                        type="text"
                                        name="supplierId"
                                        value={row.supplierId}
                                        placeholder="Enter Supplier ID"
                                        onChange={(e) => handleInputChange(e, index)}
                                    />
                                </div>
                                <div className="table-cell">
                                    <input
                                        type="text"
                                        name="supplierInvoice"
                                        value={row.supplierInvoice}
                                        placeholder="Enter Supplier Invoice"
                                        onChange={(e) => handleInputChange(e, index)}
                                    />
                                </div>
                                <div className="table-cell">
                                    <input
                                        type="text"
                                        name="partNumber"
                                        value={row.partNumber}
                                        placeholder="Enter Part Number"
                                        onChange={(e) => handleInputChange(e, index)}
                                    />
                                </div>
                                <div className="table-cell">
                                    <input
                                        type="text"
                                        name="remark"
                                        value={row.remark}
                                        placeholder="Enter Remark"
                                        onChange={(e) => handleInputChange(e, index)}
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
                + Add Row
        </div>
        <button className="add-button" type="submit">Add In-Stock Items</button>
        </form>
      </div>
    </div>
  );
};

export default AddInStockModal;
