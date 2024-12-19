import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import InventoryPage from './components/InventoryPage';
import InventoryDetailsPage from './components/InventoryDetailsPage';
import WarrantyPage from './components/WarrantyPage';
import SuppliersPage from './components/SuppliersPage';
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/inventories" element={<InventoryPage />} />
                <Route path="/inventory_details" element={<InventoryDetailsPage />} />
                <Route path="waranty" element={<WarrantyPage/>}/>
                <Route path="suppliers" element={<SuppliersPage/>}/>
            </Routes>
        </Router>
    );
}

export default App;
