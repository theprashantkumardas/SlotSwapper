// client/src/components/layout/Header.jsx
import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Header() {
    const { user, logout } = useAuth();

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component={RouterLink} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'white' }}>
                    SlotSwapper
                </Typography>
                <Box>
                    {user ? (
                        <>
                            <Button color="inherit" component={RouterLink} to="/">My Calendar</Button>
                            <Button color="inherit" component={RouterLink} to="/marketplace">Marketplace</Button>
                            <Button color="inherit" component={RouterLink} to="/swaps">Swap Requests</Button>
                            <Button color="inherit" onClick={logout}>Logout ({user.name})</Button>
                        </>
                    ) : (
                        <>
                            <Button color="inherit" component={RouterLink} to="/login">Login</Button>
                            <Button color="inherit" component={RouterLink} to="/register">Register</Button>
                        </>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default Header;