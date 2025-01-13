import React from 'react';
import '../style/Sidebar.css';  // Import the styles for the sidebar

const Sidebar = () => {
    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h2>App Name</h2>
            </div>
            <ul className="sidebar-links">
                <li><a href="/inventories">Inventory</a></li>
                <li><a href="/inventory_details">Details</a></li>
                <li><a href="/warranty">Warranty</a></li>
                <li><a href="/suppliers">Suppliers</a></li>
                <li><a href="/backups">Backups</a></li>
                <li><a href="/logout">Logout</a></li>
            </ul>
        </div>
    );
};

export default Sidebar;
