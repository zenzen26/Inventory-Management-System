const db = require('../db'); // Correct path to your db.js

db.all("SELECT name FROM sqlite_master WHERE type='table';", [], (err, rows) => {
    if (err) {
        console.error('Error fetching tables:', err.message);
    } else {
        console.log('Tables in the database:', rows);
    }
});

const loginUser = (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    // Ensure the table name and column names match your database schema
    db.get(
        'SELECT * FROM users WHERE username = ? AND password = ?',
        [username, password],
        (err, row) => {
            if (err) {
                console.error('Database error:', err.message);
                return res.status(500).json({ message: 'Internal server error.' });
            }

            if (row) {
                // Login successful, set session
                req.session.user = { username: row.username };
                return res.json({ message: 'Login successful!' });
            } else {
                // Invalid username or password
                return res.status(401).json({ message: 'Invalid username or password.' });
            }
        }
    );
};

module.exports = { loginUser };
