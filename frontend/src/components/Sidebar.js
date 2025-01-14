import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Sidebar = () => {
    const [loggedIn, setLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const navigate = useNavigate(); // Initialize navigate hook

    useEffect(() => {
        // Check if the user is logged in by hitting the auth-check route
        const checkAuth = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/auth-check', { withCredentials: true });
                if (response.data.loggedIn) {
                    setLoggedIn(true);
                    setUsername(response.data.username);
                } else {
                    setLoggedIn(false);
                    navigate('/'); // Redirect to the home page if not logged in
                }
            } catch (error) {
                console.error('Error checking authentication:', error);
                setLoggedIn(false);
                navigate('/'); // Redirect to the home page in case of error
            }
        };

        checkAuth();
    }, [navigate]); // Only re-run when navigate changes

    const handleLogout = () => {
        fetch('http://localhost:5000/logout', {
            method: 'GET',
            credentials: 'include',
        })
        .then(response => {
            if (response.ok) {
                navigate('/'); // Redirect to home/login page after logout
            } else {
                console.error('Logout failed');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    };

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h2 style={{textAlign:"left"}}>Welcome, {username}</h2>
            </div>
            <ul className="sidebar-links">
                <li><a href="/inventories">Inventory</a></li>
                <li><a href="/inventory_details">Details</a></li>
                <li><a href="/warranty">Warranty</a></li>
                <li><a href="/suppliers">Suppliers</a></li>
                <li><a href="/backups">Backups</a></li>
                {loggedIn ? (
                    <>
                        <li onClick={handleLogout}><a href=''>Logout</a></li>
                    </>
                ) : (
                    <li><a href="/login">Login</a></li>
                )}
            </ul>
        </div>
    );
};

export default Sidebar;
