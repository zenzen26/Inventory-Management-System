const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Use the absolute path to the existing FM_db.db in the 'database' folder
const dbPath = path.resolve('C:/Users/Admin/Downloads/FM Management System/database/FM_db.db');
console.log('Database path:', dbPath);
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the FM_db.db SQLite database.');
    }
});

module.exports = db;
