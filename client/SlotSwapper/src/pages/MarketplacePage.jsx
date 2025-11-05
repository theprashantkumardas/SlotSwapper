// client/src/pages/MarketplacePage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Container,
    Typography,
    Box,
    CircularProgress,
    Alert,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    Divider,
    Paper
} from '@mui/material';
import { format, parseISO } from 'date-fns';

const API_BASE_URL = 'http://localhost:8080/api/';

function MarketplacePage() {
    const [swappableSlots, setSwappableSlots] = useState([]);
    const [mySwappableSlots, setMySwappableSlots] = useState([]); // User's own swappable slots
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [swapModalOpen, setSwapModalOpen] = useState(false);
    const [selectedTheirSlot, setSelectedTheirSlot] = useState(null);
    const [swapRequestError, setSwapRequestError] = useState('');
    const [swapRequestSuccess, setSwapRequestSuccess] = useState('');

    const fetchSwappableSlots = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}swaps/swappable-slots`);
            setSwappableSlots(res.data);
            setError('');
        } catch (err) {
            console.error('Failed to fetch swappable slots:', err);
            setError('Failed to load swappable slots from others.');
        } finally {
            setLoading(false);
        }
    };

    const fetchMySwappableSlots = async () => {
        try {
            // Fetch the user's own events and filter for SWAPPABLE
            const res = await axios.get(`${API_BASE_URL}events`);
            setMySwappableSlots(res.data.filter(event => event.status === 'SWAPPABLE'));
        } catch (err) {
            console.error('Failed to fetch my swappable slots:', err);
            // Don't set global error, just handle internally for modal
        }
    };

    useEffect(() => {
        fetchSwappableSlots();
        fetchMySwappableSlots();
    }, []);

    const handleRequestSwapClick = (theirSlot) => {
        setSelectedTheirSlot(theirSlot);
        setSwapModalOpen(true);
        setSwapRequestError('');
        setSwapRequestSuccess('');
    };

    const handleCloseSwapModal = () => {
        setSwapModalOpen(false);
        setSelectedTheirSlot(null);
    };

    const handleInitiateSwap = async (mySlotId) => {
        if (!selectedTheirSlot || !mySlotId) return;

        try {
            await axios.post(`${API_BASE_URL}swaps/request`, {
                mySlotId,
                theirSlotId: selectedTheirSlot._id,
            });
            setSwapRequestSuccess('Swap request sent successfully! Waiting for response.');
            fetchSwappableSlots(); // Refresh marketplace
            fetchMySwappableSlots(); // Refresh my swappable slots (might change status to SWAP_PENDING)
            // It's good to re-fetch *all* events on dashboard as well, as their status might have changed.
            // A more robust solution might involve a global state refresh or WebSocket.
            setTimeout(() => handleCloseSwapModal(), 2000); // Close after a brief success message
        } catch (err) {
            console.error('Failed to send swap request:', err);
            setSwapRequestError(err.response?.data?.msg || 'Failed to send swap request.');
        }
    };

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
                Marketplace - Swappable Slots from Others
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {swappableSlots.length === 0 ? (
                <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                    No swappable slots available at the moment. Check back later!
                </Typography>
            ) : (
                <Grid container spacing={3}>
                    {swappableSlots.map((slot) => (
                        <Grid item xs={12} sm={6} md={4} key={slot._id}>
                            <Card elevation={2}>
                                <CardContent>
                                    <Typography variant="h6" component="div">
                                        {slot.title}
                                    </Typography>
                                    <Typography sx={{ mb: 1.5 }} color="text.secondary">
                                        {slot.user.name} ({slot.user.email})
                                    </Typography>
                                    <Typography variant="body2">
                                        {format(parseISO(slot.startTime), 'MMM d, p')} - {format(parseISO(slot.endTime), 'p')}
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button
                                        size="small"
                                        variant="contained"
                                        onClick={() => handleRequestSwapClick(slot)}
                                        disabled={mySwappableSlots.length === 0} // Disable if user has no swappable slots
                                    >
                                        Request Swap
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Swap Request Modal */}
            <Dialog open={swapModalOpen} onClose={handleCloseSwapModal} maxWidth="sm" fullWidth>
                <DialogTitle>Request Swap for "{selectedTheirSlot?.title}"</DialogTitle>
                <DialogContent dividers>
                    {swapRequestError && <Alert severity="error" sx={{ mb: 2 }}>{swapRequestError}</Alert>}
                    {swapRequestSuccess && <Alert severity="success" sx={{ mb: 2 }}>{swapRequestSuccess}</Alert>}

                    {mySwappableSlots.length === 0 ? (
                        <Alert severity="warning">
                            You currently have no swappable slots to offer. Please mark an event as "Swappable" on your dashboard first.
                        </Alert>
                    ) : (
                        <Box>
                            <Typography variant="subtitle1" gutterBottom>
                                Select one of your swappable slots to offer in exchange:
                            </Typography>
                            <Paper variant="outlined">
                                <List>
                                    {mySwappableSlots.map((mySlot, index) => (
                                        <React.Fragment key={mySlot._id}>
                                            <ListItem
                                                button
                                                onClick={() => handleInitiateSwap(mySlot._id)}
                                                disabled={swapRequestSuccess !== ''} // Disable buttons after request is sent
                                            >
                                                <ListItemText
                                                    primary={mySlot.title}
                                                    secondary={`${format(parseISO(mySlot.startTime), 'MMM d, p')} - ${format(parseISO(mySlot.endTime), 'p')}`}
                                                />
                                            </ListItem>
                                            {index < mySwappableSlots.length - 1 && <Divider component="li" />}
                                        </React.Fragment>
                                    ))}
                                </List>
                            </Paper>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseSwapModal} disabled={swapRequestSuccess !== ''}>Close</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default MarketplacePage;