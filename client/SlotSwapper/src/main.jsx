// client/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline'; // For consistent styling
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

// Define a basic custom theme (you can expand this significantly)
const theme = createTheme({
    palette: {
        primary: {
            main: '#3f51b5', // A nice blue
        },
        secondary: {
            main: '#f50057', // A vibrant pink
        },
        background: {
            default: '#f4f6f8', // Light grey background
        },
    },
    components: {
        MuiContainer: {
            defaultProps: {
                maxWidth: 'lg',
            },
        },
    },
});

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Router>
            <AuthProvider>
                <ThemeProvider theme={theme}>
                    <CssBaseline /> {/* Apply global CSS resets */}
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <App />
                    </LocalizationProvider>
                </ThemeProvider>
            </AuthProvider>
        </Router>
    </React.StrictMode>,
);