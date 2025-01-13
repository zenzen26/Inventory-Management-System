const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

const { getWarrantyRecords, createWarrantyRecord, deleteWarrantyRecord, updateWarrantyRecord, generateWarranty, toggleEmailStatus, toggleXeroStatus } = require('../models/warrantyModel');

// Controller to get inventory records
const warrantyController = (req, res) => {
    getWarrantyRecords(req, res);
};

const editWarrantyRecord = async (req, res) => {
    const { customerNumber, invoiceDate, oldInvoice, newInvoice, customerName, items, oldSerialNumber, newSerialNumber, template, years, start, end } = req.body;

    // Ensure all fields are filled
    if (!customerNumber || !invoiceDate || !oldInvoice || !newInvoice || !customerName || !items || !oldSerialNumber || !newSerialNumber || !template || !years || !start || !end) {
        return res.status(400).json({ success: false, message: 'All fields must be filled' });
    }

    try {
        // Call the model function to update the record
        const result = await updateWarrantyRecord(customerNumber, invoiceDate, oldInvoice, newInvoice, customerName, items, oldSerialNumber, newSerialNumber, template, years, start, end);

        if (result.success) {
            return res.status(200).json({ success: true, message: 'Warranty record updated successfully.' });
        } else {
            return res.status(500).json({ success: false, message: 'Failed to update warranty record.' });
        }
    } catch (error) {
        console.error('Error updating warranty record:', error.message);
        return res.status(500).json({ success: false, message: 'Failed to update warranty record.' });
    }
};

const generateWarrantyPDF = async (req, res) => {
    console.log("In warranty controller: generateWarrantyPDF");
    const { invoiceNumber } = req.body;

    if (!invoiceNumber) {
        return res.status(400).json({ success: false, message: 'Invoice number is required' });
    }

    try {
        // Fetch records associated with the invoice
        const warrantyRecords = await generateWarranty(invoiceNumber);
        if (!warrantyRecords || warrantyRecords.length === 0) {
            return res.status(404).json({ success: false, message: 'No warranty records found for this invoice.' });
        }
        console.log("After fetching records");

        // Determine the template
        const templateName = 'LCD warranty template.docx';
        const templatePath = path.join(__dirname, '../resources', templateName);

        // Read the template file
        const content = fs.readFileSync(templatePath, 'binary');
        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

        // Generate the <Products> list
        const productList = warrantyRecords
            .map((record, index) => `${String.fromCharCode(97 + index)}) ${record['Item Name']}, serial number: ${record['Serial Number']}`)
            .join('\n');
        console.log("After generating <Products> list");

        // Replace placeholders
        const templateData = {
            CustomerName: warrantyRecords[0]['Customer Name'],
            Years: warrantyRecords[0]['Years'],
            Start: warrantyRecords[0]['Start'],
            Products: productList,
        };

        doc.setData(templateData);
        doc.render();
        console.log("After replacing placeholders");

        // Save the filled template as a DOCX file
        const outputDir = path.join(__dirname, '../downloads');
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

        const outputPath = path.join(outputDir, `Warranty_${invoiceNumber}.docx`);
        const buf = doc.getZip().generate({ type: 'nodebuffer' });
        fs.writeFileSync(outputPath, buf);

        console.log("Generated file:", outputPath);

        // Stream the file back to the client for download
        res.setHeader('Content-Disposition', `attachment; filename=Warranty_${invoiceNumber}.docx`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        fs.createReadStream(outputPath).pipe(res);
    } catch (error) {
        console.error('Error generating warranty PDF:', error);
        res.status(500).json({ success: false, message: 'Failed to generate warranty PDF' });
    }
};

// Export controller functions
module.exports = {
    getWarrantyRecords: warrantyController,
    createWarrantyRecord,
    deleteWarrantyRecord,
    editWarrantyRecord,
    toggleEmailStatus,
    toggleXeroStatus,
    generateWarrantyPDF
};
