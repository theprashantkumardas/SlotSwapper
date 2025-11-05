// client/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // For redirection on logout

const AuthContext = createContext();

const API_URL = 'http://localhost:8080/api/auth/'; // Adjust if your backend port is different

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const res = await axios.post(API_URL + 'login', { email, password });
            const loggedInUser = res.data;
            localStorage.setItem('user', JSON.stringify(loggedInUser));
            setUser(loggedInUser);
            return loggedInUser;
        } catch (error) {
            console.error('Login failed:', error.response?.data?.msg || error.message);
            throw error; // Re-throw to be caught by the component
        }
    };

    const register = async (name, email, password) => {
        try {
            const res = await axios.post(API_URL + 'register', { name, email, password });
            const registeredUser = res.data;
            // Optionally log in immediately after registration
            localStorage.setItem('user', JSON.stringify(registeredUser));
            setUser(registeredUser);
            return registeredUser;
        } catch (error) {
            console.error('Registration failed:', error.response?.data?.msg || error.message);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
        navigate('/login'); // Redirect to login page on logout
    };

    // Axios interceptor to add JWT token to protected requests
    axios.interceptors.request.use(
        (config) => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const token = JSON.parse(storedUser).token;
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);