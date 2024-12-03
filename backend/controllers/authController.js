const db = require('../db'); 
const { loginUser } = require('../models/authModel'); // Import the functions from the model

const authController = (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    loginUser(username, password, (err, user) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ message: 'Internal server error.' });
        }

        if (user) {
            // Login successful, set session
            req.session.user = { username: user.username };
            return res.json({ message: 'Login successful!' });
        } else {
            // Invalid username or password
            return res.status(401).json({ message: 'Invalid username or password.' });
        }
    });
};

module.exports = { loginUser: authController };
