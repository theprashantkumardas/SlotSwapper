// client/src/components/events/EventFormModal.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Alert,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    Box
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { parseISO, isValid } from 'date-fns';

const API_BASE_URL = 'http://localhost:8080/api/events';

function EventFormModal({ open, handleClose, eventToEdit }) {
    const [title, setTitle] = useState('');
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [status, setStatus] = useState('BUSY');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (open) {
            setError(''); // Clear error on modal open
            if (eventToEdit) {
                setTitle(eventToEdit.title);
                setStartTime(parseISO(eventToEdit.startTime));
                setEndTime(parseISO(eventToEdit.endTime));
                setStatus(eventToEdit.status);
            } else {
                // Reset form for new event
                setTitle('');
                setStartTime(new Date());
                setEndTime(new Date(Date.now() + 60 * 60 * 1000)); // Default to 1 hour from now
                setStatus('BUSY');
            }
        }
    }, [open, eventToEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!title || !startTime || !endTime || !isValid(startTime) || !isValid(endTime)) {
            return setError('Please fill all required fields and ensure dates are valid.');
        }
        if (startTime >= endTime) {
            return setError('End time must be after start time.');
        }

        const eventData = {
            title,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            status
        };

        try {
            setLoading(true);
            if (eventToEdit) {
                await axios.put(`${API_BASE_URL}/${eventToEdit._id}`, eventData);
            } else {
                await axios.post(API_BASE_URL, eventData);
            }
            handleClose(true); // Close and indicate success
        } catch (err) {
            console.error('Error saving event:', err);
            setError(err.response?.data?.msg || 'Failed to save event.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={() => handleClose(false)} maxWidth="sm" fullWidth>
            <DialogTitle>{eventToEdit ? 'Edit Event' : 'Create New Event'}</DialogTitle>
            <DialogContent dividers>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="title"
                        label="Event Title"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                    <DateTimePicker
                        label="Start Time"
                        value={startTime}
                        onChange={(newValue) => setStartTime(newValue)}
                        renderInput={(params) => <TextField {...params} fullWidth margin="dense" required />}
                    />
                    <DateTimePicker
                        label="End Time"
                        value={endTime}
                        onChange={(newValue) => setEndTime(newValue)}
                        renderInput={(params) => <TextField {...params} fullWidth margin="dense" required />}
                    />
                    <FormControl fullWidth margin="dense">
                        <InputLabel id="status-label">Status</InputLabel>
                        <Select
                            labelId="status-label"
                            id="status"
                            value={status}
                            label="Status"
                            onChange={(e) => setStatus(e.target.value)}
                            disabled={eventToEdit?.status === 'SWAP_PENDING'} // Cannot change status if pending a swap
                        >
                            <MenuItem value="BUSY">Busy</MenuItem>
                            <MenuItem value="SWAPPABLE">Swappable</MenuItem>
                            {/* SWAP_PENDING status is managed by the backend during swap requests */}
                        </Select>
                    </FormControl>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => handleClose(false)} disabled={loading}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={loading}>
                    {loading ? 'Saving...' : (eventToEdit ? 'Save Changes' : 'Create Event')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default EventFormModal;