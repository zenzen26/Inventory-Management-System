const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const docxToPdf = require('docx-pdf');  // Install this library for DOCX to PDF conversion
const puppeteer = require('puppeteer');
const mammoth = require('mammoth');

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
    const { invoiceNumber } = req.body;
    if (!invoiceNumber) {
        return res.status(400).json({ success: false, message: 'Invoice number is required' });
    }

    try {
        // Fetch warranty records for the given invoice
        const warrantyRecords = await generateWarranty(invoiceNumber);
        if (warrantyRecords.length === 0) {
            return res.status(404).json({ success: false, message: 'No warranty records found for the given invoice.' });
        }

        // Prepare the product list as a plain text string
        const productList = warrantyRecords
            .map((record, index) => `${String.fromCharCode(97 + index)}) ${record.item}, serial number: ${record.serialNumber}`)
            .join('\n');

        // Prepare data for template placeholders
        const templateData = {
            customerName: warrantyRecords[0].customerName,
            years: warrantyRecords[0].years,
            startDate: warrantyRecords[0].start,
            productList,
        };

        // Load and populate the Word template
        const templatePath = path.join(__dirname, '../resources', 'LCD warranty template.docx');
        const content = fs.readFileSync(templatePath, 'binary');
        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

        // Render the document with data
        doc.render(templateData);

        const outputDir = path.join(__dirname, '../downloads');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const outputWordPath = path.join(outputDir, 'warranty.docx');
        const outputPDFPath = path.join(outputDir, 'warranty.pdf');

        // Write the populated Word document
        const buf = doc.getZip().generate({ type: 'nodebuffer' });
        fs.writeFileSync(outputWordPath, buf);

        // Convert DOCX to HTML using mammoth
        const htmlContent = await mammoth.convertToHtml({ path: outputWordPath });

        // Convert HTML to PDF using puppeteer
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(htmlContent.value);
        await page.pdf({ path: outputPDFPath, format: 'A4' });

        await browser.close();

        // Respond with the PDF file path
        res.status(200).json({ success: true, file: outputPDFPath });

    } catch (error) {
        console.error('Error generating warranty PDF:', error.message);
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
