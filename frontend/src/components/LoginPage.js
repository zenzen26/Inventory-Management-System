import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../style/Login.css';  // Import the CSS file

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/login', { username, password }, { withCredentials: true });
            if (response.data.message === 'Login successful!') {
                // Redirect or show welcome message
                console.log('Login successful');
                navigate('/inventories')
            }
        } catch (error) {
            setErrorMessage('Invalid username or password');
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-header">Welcome to Inventory System!</div>
                <form onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit">Log In</button>
                </form>
                {errorMessage && <div className="error-message">{errorMessage}</div>}
            </div>
        </div>
    );
};

export default LoginPage;
