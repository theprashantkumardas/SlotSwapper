// client/src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import PrivateRoute from './components/routing/PrivateRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MarketplacePage from './pages/MarketplacePage';
import SwapRequestsPage from './pages/SwapRequestsPage';
import { Box, Container } from '@mui/material';

function App() {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    {/* Protected Routes */}
                    <Route element={<PrivateRoute />}>
                        <Route path="/" element={<DashboardPage />} />
                        <Route path="/marketplace" element={<MarketplacePage />} />
                        <Route path="/swaps" element={<SwapRequestsPage />} />
                    </Route>
                </Routes>
            </Container>
            {/* Footer component would go here if you decide to add one */}
        </Box>
    );
}

export default App;