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

        // Group warranty records by Years, Template, and Start
        const groupedRecords = warrantyRecords.reduce((groups, record) => {
            const key = `${record['Years']}_${record['Template']}_${record['Start']}`;
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(record);
            return groups;
        }, {});

        // Define the mapping for template names
        const templateMapping = {
            LCD: 'LCD warranty template.docx',
            LED: 'LED warranty template.docx',
        };

        // Generate a DOCX file for each group
        const outputDir = path.join('C:\\Users\\Admin\\Downloads');
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

        const filePaths = [];
        let fileCounter = 1; // To track file names for incrementing

        // Loop through each group and generate a DOCX file
        for (const groupKey in groupedRecords) {
            const group = groupedRecords[groupKey];

            // Get the template name based on the group or default to LCD
            const templateName = templateMapping[group[0]['Template']] || 'LCD warranty template.docx'; // Default to 'LCD warranty template.docx'
            const templatePath = path.join(__dirname, '../resources', templateName);

            // Debugging: log the template path
            console.log(`Using template: ${templatePath}`);

            // Check if the template file exists
            if (!fs.existsSync(templatePath)) {
                console.error(`Template file not found: ${templatePath}`);
                return res.status(500).json({ success: false, message: `Template file not found: ${templatePath}` });
            }

            // Read and prepare the template
            const content = fs.readFileSync(templatePath, 'binary');
            const zip = new PizZip(content);
            const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

            // Generate the <Products> list with proper indentation
            const productList = group
                .map((record, index) => `${String.fromCharCode(97 + index)}) ${record['Items']}, serial number: ${record['Serial Number']}`)
                .join('\n\t'); // Add a tab character for indentation

            // Replace placeholders
            const templateData = {
                CustomerName: group[0]['Customer Name'] || '',
                Years: group[0]['Years'] || '',
                Start: group[0]['Start'] || '',
                Products: productList || '',
            };

            doc.setData(templateData);
            doc.render();

            // Generate file path with invoice number and incremented filenames if multiple files
            const outputFilePath = path.join(outputDir, 
                fileCounter === 1 
                    ? `${invoiceNumber} Warranty.docx`  // If it's the first file, use the invoice number
                    : `${invoiceNumber} Warranty ${fileCounter}.docx`  // If there are multiple files, increment the filename
            );

            // Ensure no duplicate writes
            const buf = doc.getZip().generate({ type: 'nodebuffer' });
            fs.writeFileSync(outputFilePath, buf);
            filePaths.push(outputFilePath);

            console.log(`File generated successfully: ${outputFilePath}`);
            fileCounter++;
        }

        return res.status(200).json({ success: true, filePaths });
    } catch (error) {
        console.error('Error generating warranty PDF:', error);
        return res.status(500).json({ success: false, message: 'Failed to generate warranty PDF' });
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
