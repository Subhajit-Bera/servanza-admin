import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    List,
    ListItemButton,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Typography,
    TextField,
    Box,
    CircularProgress
} from '@mui/material';
import { Person as PersonIcon, Search as SearchIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { fetchAvailableBuddies } from '../../store/slices/buddiesSlice';
import { assignBuddy } from '../../store/slices/bookingsSlice';
import { COLORS } from '../../theme/theme';
import type { Booking } from '../../api/types';

interface AssignBuddyDialogProps {
    open: boolean;
    onClose: () => void;
    booking: Booking;
}

const AssignBuddyDialog: React.FC<AssignBuddyDialogProps> = ({ open, onClose, booking }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { list: buddies, loading } = useSelector((state: RootState) => state.buddies);
    const [search, setSearch] = useState('');
    const [selectedBuddyId, setSelectedBuddyId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            dispatch(fetchAvailableBuddies({
                scheduledStart: booking.scheduledStart,
                scheduledEnd: booking.scheduledEnd,
                search
            }));
            setSelectedBuddyId(null);
        }
    }, [open, booking, dispatch]);

    const handleSearch = () => {
        dispatch(fetchAvailableBuddies({
            scheduledStart: booking.scheduledStart,
            scheduledEnd: booking.scheduledEnd,
            search
        }));
    };

    const handleAssign = async () => {
        if (!selectedBuddyId) return;
        setSubmitting(true);
        try {
            await dispatch(assignBuddy({ bookingId: booking.id, buddyId: selectedBuddyId })).unwrap();
            onClose();
        } catch (error) {
            console.error('Failed to assign buddy:', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Assign Buddy</DialogTitle>
            <DialogContent dividers>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Search buddy..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button variant="contained" onClick={handleSearch} disabled={loading}>
                        <SearchIcon />
                    </Button>
                </Box>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress />
                    </Box>
                ) : buddies.length === 0 ? (
                    <Typography align="center" color="text.secondary" sx={{ py: 3 }}>
                        No available buddies found for this time slot.
                    </Typography>
                ) : (
                    <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                        {buddies.map((buddy) => (
                            <ListItemButton
                                key={buddy.id}
                                selected={selectedBuddyId === buddy.id}
                                onClick={() => setSelectedBuddyId(buddy.id)}
                                sx={{
                                    borderRadius: 1,
                                    mb: 0.5,
                                    '&.Mui-selected': {
                                        bgcolor: 'primary.lighter',
                                        border: `1px solid ${COLORS.primary}`
                                    }
                                }}
                            >
                                <ListItemAvatar>
                                    <Avatar src={buddy.user.profileImage}>
                                        <PersonIcon />
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Typography fontWeight={500}>{buddy.user.name}</Typography>
                                        </Box>
                                    }
                                    secondary={buddy.user.phone}
                                />
                            </ListItemButton>
                        ))}
                    </List>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    variant="contained"
                    onClick={handleAssign}
                    disabled={!selectedBuddyId || submitting}
                >
                    {submitting ? 'Assigning...' : 'Assign'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AssignBuddyDialog;
