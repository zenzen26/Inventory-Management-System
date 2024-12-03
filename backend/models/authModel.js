const db = require('../db'); // path to db.js

db.all("SELECT name FROM sqlite_master WHERE type='table';", [], (err, rows) => {
    if (err) {
        console.error('Error fetching tables:', err.message);
    } else {
        console.log('Tables in the database:', rows);
    }
});

const loginUser = (username, password, callback) => {
    db.get(
        'SELECT * FROM users WHERE username = ? AND password = ?',
        [username, password],
        (err, row) => {
            if (err) {
                callback(err, null);
                return;
            }
            callback(null, row);
        }
    );
};

module.exports = { loginUser };
