// client/src/pages/SwapRequestsPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Container,
    Typography,
    Box,
    CircularProgress,
    Alert,
    Tabs,
    Tab,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Button,
    Divider,
    Fade
} from '@mui/material';
import { format, parseISO } from 'date-fns';

const API_BASE_URL = 'http://localhost:8080/api/swaps/';

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`tabpanel-${index}`}
            aria-labelledby={`tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

function SwapRequestsPage() {
    const [tabValue, setTabValue] = useState(0); // 0 for Incoming, 1 for Outgoing
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [outgoingRequests, setOutgoingRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionMessage, setActionMessage] = useState(''); // For success/error messages after actions

    const fetchIncomingRequests = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}incoming`);
            setIncomingRequests(res.data);
        } catch (err) {
            console.error('Failed to fetch incoming requests:', err);
            setError('Failed to load incoming swap requests.');
        }
    };

    const fetchOutgoingRequests = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}outgoing`);
            setOutgoingRequests(res.data);
        } catch (err) {
            console.error('Failed to fetch outgoing requests:', err);
            setError('Failed to load outgoing swap requests.');
        }
    };

    const fetchData = async () => {
        setLoading(true);
        setError('');
        setActionMessage('');
        await Promise.all([fetchIncomingRequests(), fetchOutgoingRequests()]);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleRespondToRequest = async (requestId, accept) => {
        setActionMessage(''); // Clear previous messages
        try {
            const res = await axios.post(`${API_BASE_URL}response/${requestId}`, { accept });
            setActionMessage(res.data.msg || `Swap request ${accept ? 'accepted' : 'rejected'}!`);
            fetchData(); // Re-fetch all requests and dashboard events for updated state
        } catch (err) {
            console.error('Failed to respond to request:', err);
            setActionMessage(err.response?.data?.msg || `Failed to ${accept ? 'accept' : 'reject'} swap request.`);
            setError(true); // Indicate an error state
        }
        setTimeout(() => setActionMessage(''), 5000); // Clear message after 5 seconds
    };

    const renderSwapRequest = (request, isIncoming) => (
        <ListItem key={request._id}>
            <ListItemText
                primary={
                    <>
                        <Typography component="span" variant="subtitle1" color="text.primary">
                            {isIncoming ? request.requester.name : request.responder.name}
                        </Typography>
                        <Typography component="span" variant="body2" sx={{ ml: 1 }}>
                            {isIncoming ? `wants to swap for your "${request.responderSlot.title}"` : `offered their "${request.requesterSlot.title}" for "${request.responderSlot.title}"`}
                        </Typography>
                    </>
                }
                secondary={
                    <>
                        <Typography component="span" variant="body2" color="text.secondary" sx={{ display: 'block' }}>
                            {isIncoming ? 'Your slot:' : 'Your offered slot:'} "{request.responderSlot.title}" ({format(parseISO(request.responderSlot.startTime), 'MMM d, p')} - {format(parseISO(request.responderSlot.endTime), 'p')})
                        </Typography>
                        <Typography component="span" variant="body2" color="text.secondary" sx={{ display: 'block' }}>
                            {isIncoming ? 'Their offered slot:' : 'Their slot:'} "{request.requesterSlot.title}" ({format(parseISO(request.requesterSlot.startTime), 'MMM d, p')} - {format(parseISO(request.requesterSlot.endTime), 'p')})
                        </Typography>
                        <Typography component="span" variant="caption" color="text.secondary">
                            Status: {request.status.replace('_', ' ')}
                        </Typography>
                        <Typography component="span" variant="caption" color="text.disabled" sx={{ ml: 1 }}>
                            • Requested on: {format(parseISO(request.createdAt), 'MMM d, yyyy p')}
                        </Typography>
                    </>
                }
            />
            {isIncoming && request.status === 'PENDING' && (
                <ListItemSecondaryAction>
                    <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        sx={{ mr: 1 }}
                        onClick={() => handleRespondToRequest(request._id, true)}
                    >
                        Accept
                    </Button>
                    <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleRespondToRequest(request._id, false)}
                    >
                        Reject
                    </Button>
                </ListItemSecondaryAction>
            )}
            {!isIncoming && request.status === 'PENDING' && (
                 <ListItemSecondaryAction>
                    <Button variant="outlined" disabled size="small">
                        Pending...
                    </Button>
                </ListItemSecondaryAction>
            )}
        </ListItem>
    );

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container>
            <Typography variant="h4" component="h1" gutterBottom>
                Swap Requests
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
            {actionMessage && (
                <Fade in={Boolean(actionMessage)} timeout={500}>
                    <Alert severity={error ? "error" : "success"} sx={{ mb: 3 }}>
                        {actionMessage}
                    </Alert>
                </Fade>
            )}

            <Paper sx={{ width: '100%', mb: 2 }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="swap request tabs" centered>
                    <Tab label="Incoming Requests" />
                    <Tab label="Outgoing Requests" />
                </Tabs>
            </Paper>

            <TabPanel value={tabValue} index={0}>
                {incomingRequests.length === 0 ? (
                    <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                        No incoming swap requests.
                    </Typography>
                ) : (
                    <Paper elevation={3} sx={{ p: 2 }}>
                        <List>
                            {incomingRequests.map((request, index) => (
                                <React.Fragment key={request._id}>
                                    {renderSwapRequest(request, true)}
                                    {index < incomingRequests.length - 1 && <Divider component="li" />}
                                </React.Fragment>
                            ))}
                        </List>
                    </Paper>
                )}
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
                {outgoingRequests.length === 0 ? (
                    <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                        No outgoing swap requests.
                    </Typography>
                ) : (
                    <Paper elevation={3} sx={{ p: 2 }}>
                        <List>
                            {outgoingRequests.map((request, index) => (
                                <React.Fragment key={request._id}>
                                    {renderSwapRequest(request, false)}
                                    {index < outgoingRequests.length - 1 && <Divider component="li" />}
                                </React.Fragment>
                            ))}
                        </List>
                    </Paper>
                )}
            </TabPanel>
        </Container>
    );
}

export default SwapRequestsPage;