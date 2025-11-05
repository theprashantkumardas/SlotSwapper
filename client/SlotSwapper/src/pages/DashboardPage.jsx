// client/src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Container,
    Typography,
    Button,
    Box,
    CircularProgress,
    Alert,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Paper,
    Divider,
    ToggleButton,
    ToggleButtonGroup
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EventFormModal from '../components/events/EventFormModal'; // We'll create this
import { format, parseISO } from 'date-fns';

const API_BASE_URL = 'https://slotswapper-em5h.onrender.com/'; // Base URL for events

function DashboardPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null); // For editing existing events

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE_URL}events`);
            setEvents(res.data);
            setError('');
        } catch (err) {
            console.error('Failed to fetch events:', err);
            setError('Failed to load your events.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleCreateEvent = () => {
        setEditingEvent(null);
        setModalOpen(true);
    };

    const handleEditEvent = (event) => {
        setEditingEvent(event);
        setModalOpen(true);
    };

    const handleDeleteEvent = async (eventId) => {
        if (!window.confirm('Are you sure you want to delete this event?')) return;
        try {
            await axios.delete(`${API_BASE_URL}events/${eventId}`);
            fetchEvents(); // Re-fetch events
        } catch (err) {
            console.error('Failed to delete event:', err);
            setError('Failed to delete event.');
        }
    };

    const handleUpdateEventStatus = async (eventId, newStatus) => {
        try {
            await axios.put(`${API_BASE_URL}events/${eventId}`, { status: newStatus });
            fetchEvents(); // Re-fetch events
        } catch (err) {
            console.error('Failed to update event status:', err);
            setError('Failed to update event status. It might be involved in a pending swap.');
        }
    };

    const handleCloseModal = (eventAddedOrUpdated) => {
        setModalOpen(false);
        if (eventAddedOrUpdated) {
            fetchEvents(); // Re-fetch events if something was added/updated
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1">
                    My Calendar
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateEvent}
                >
                    Add New Event
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {events.length === 0 ? (
                <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                    You don't have any events yet. Add one to get started!
                </Typography>
            ) : (
                <Paper elevation={3} sx={{ p: 2 }}>
                    <List>
                        {events.map((event) => (
                            <React.Fragment key={event._id}>
                                <ListItem>
                                    <ListItemText
                                        primary={event.title}
                                        secondary={
                                            <>
                                                <Typography component="span" variant="body2" color="text.primary">
                                                    {format(parseISO(event.startTime), 'MMM d, p')} - {format(parseISO(event.endTime), 'p')}
                                                </Typography>
                                                <br />
                                                <Typography component="span" variant="caption" color="text.secondary">
                                                    Status: {event.status.replace('_', ' ')}
                                                </Typography>
                                            </>
                                        }
                                    />
                                    <ListItemSecondaryAction>
                                        <ToggleButtonGroup
                                            value={event.status}
                                            exclusive
                                            onChange={(e, newStatus) => {
                                                if (newStatus !== null && newStatus !== event.status) {
                                                    handleUpdateEventStatus(event._id, newStatus);
                                                }
                                            }}
                                            aria-label="event status"
                                            size="small"
                                            sx={{ mr: 1 }}
                                        >
                                            <ToggleButton value="BUSY" aria-label="busy" disabled={event.status === 'SWAP_PENDING'}>
                                                Busy
                                            </ToggleButton>
                                            <ToggleButton value="SWAPPABLE" aria-label="swappable" disabled={event.status === 'SWAP_PENDING'}>
                                                Swappable
                                            </ToggleButton>
                                        </ToggleButtonGroup>
                                        <IconButton edge="end" aria-label="edit" onClick={() => handleEditEvent(event)}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteEvent(event._id)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                                <Divider component="li" />
                            </React.Fragment>
                        ))}
                    </List>
                </Paper>
            )}

            <EventFormModal
                open={modalOpen}
                handleClose={handleCloseModal}
                eventToEdit={editingEvent}
            />
        </Container>
    );
}

export default DashboardPage;