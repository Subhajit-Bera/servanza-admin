import React, { useEffect, useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    Chip,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stack,
    LinearProgress,
    Snackbar,
    Alert,
    Skeleton,
} from '@mui/material';
import {
    CheckCircle as CheckIcon,
    RadioButtonUnchecked as UncheckedIcon,
    PlaylistAddCheck as CompleteAllIcon,
    Refresh as RefreshIcon,
    Person as PersonIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchBuddies } from '../../store/slices/buddiesSlice';
import client from '../../api/client';
import { COLORS, SHADOWS } from '../../theme';
import dayjs from 'dayjs';
import type { Buddy } from '../../api/types';

const TRAINING_DAYS = 5;

const BuddyTrainingPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const { list: buddies, loading } = useAppSelector((state) => state.buddies);
    const [trainingBuddies, setTrainingBuddies] = useState<Buddy[]>([]);
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        buddyId: string | null;
        buddyName: string;
        action: 'complete_day' | 'complete_all';
        day?: number;
    }>({ open: false, buddyId: null, buddyName: '', action: 'complete_day' });
    const [actionLoading, setActionLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    useEffect(() => {
        dispatch(fetchBuddies({ limit: 100 }));
    }, [dispatch]);

    useEffect(() => {
        // Filter buddies who are in training (not completed)
        const inTraining = buddies.filter(b => !b.isTrainingCompleted);
        setTrainingBuddies(inTraining);
    }, [buddies]);

    const handleMarkDayComplete = (buddy: Buddy, day: number) => {
        setConfirmDialog({
            open: true,
            buddyId: buddy.id,
            buddyName: buddy.user.name,
            action: 'complete_day',
            day,
        });
    };

    const handleCompleteAll = (buddy: Buddy) => {
        setConfirmDialog({
            open: true,
            buddyId: buddy.id,
            buddyName: buddy.user.name,
            action: 'complete_all',
        });
    };

    const handleConfirmAction = async () => {
        if (!confirmDialog.buddyId) return;

        setActionLoading(true);
        try {
            if (confirmDialog.action === 'complete_all') {
                // Complete all training days
                await client.patch(`/admin/buddies/${confirmDialog.buddyId}/training`, {
                    trainingDaysTaken: TRAINING_DAYS,
                    isTrainingCompleted: true,
                });
                setSnackbar({ open: true, message: `Training completed for ${confirmDialog.buddyName}!`, severity: 'success' });
            } else if (confirmDialog.action === 'complete_day' && confirmDialog.day) {
                // Mark specific day as complete
                await client.patch(`/admin/buddies/${confirmDialog.buddyId}/training`, {
                    trainingDaysTaken: confirmDialog.day,
                    isTrainingCompleted: confirmDialog.day >= TRAINING_DAYS,
                });
                setSnackbar({ open: true, message: `Day ${confirmDialog.day} marked complete for ${confirmDialog.buddyName}`, severity: 'success' });
            }

            // Refresh buddies list
            dispatch(fetchBuddies({ limit: 100 }));
        } catch (error: any) {
            setSnackbar({
                open: true,
                message: error.response?.data?.message || 'Failed to update training status',
                severity: 'error'
            });
        } finally {
            setActionLoading(false);
            setConfirmDialog({ ...confirmDialog, open: false });
        }
    };

    const getTrainingProgress = (buddy: Buddy) => {
        const days = buddy.trainingDaysTaken || 0;
        return (days / TRAINING_DAYS) * 100;
    };

    const renderDayIndicators = (buddy: Buddy) => {
        const completedDays = buddy.trainingDaysTaken || 0;

        return (
            <Stack direction="row" spacing={0.5} alignItems="center">
                {[1, 2, 3, 4, 5].map((day) => {
                    const isCompleted = day <= completedDays;
                    const isNext = day === completedDays + 1;

                    return (
                        <Tooltip key={day} title={isCompleted ? `Day ${day} Complete` : `Mark Day ${day} Complete`}>
                            <IconButton
                                size="small"
                                onClick={() => !isCompleted && handleMarkDayComplete(buddy, day)}
                                disabled={!isNext && !isCompleted}
                                sx={{
                                    p: 0.5,
                                    color: isCompleted ? COLORS.success : isNext ? COLORS.primary : COLORS.border,
                                    '&:hover': {
                                        bgcolor: isNext ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
                                    },
                                }}
                            >
                                {isCompleted ? (
                                    <CheckIcon fontSize="small" />
                                ) : (
                                    <UncheckedIcon fontSize="small" />
                                )}
                            </IconButton>
                        </Tooltip>
                    );
                })}
            </Stack>
        );
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h1" sx={{ mb: 1 }}>Buddy Training</Typography>
                    <Typography variant="body1" color="text.secondary">
                        Track and manage buddy training progress (5-day program)
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={() => dispatch(fetchBuddies({ limit: 100 }))}
                    disabled={loading}
                >
                    Refresh
                </Button>
            </Box>

            {/* Summary Cards */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
                <Card sx={{ flex: 1, boxShadow: SHADOWS.light }}>
                    <CardContent>
                        <Typography variant="h3" color="primary" fontWeight={700}>
                            {trainingBuddies.length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Buddies In Training
                        </Typography>
                    </CardContent>
                </Card>
                <Card sx={{ flex: 1, boxShadow: SHADOWS.light }}>
                    <CardContent>
                        <Typography variant="h3" color="success.main" fontWeight={700}>
                            {buddies.filter(b => b.isTrainingCompleted).length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Training Completed
                        </Typography>
                    </CardContent>
                </Card>
            </Stack>

            {/* Training Table */}
            <Card sx={{ boxShadow: SHADOWS.light }}>
                <CardContent sx={{ p: 0 }}>
                    <TableContainer>
                        <Table>
                            <TableHead sx={{ bgcolor: COLORS.offWhite }}>
                                <TableRow>
                                    <TableCell>Buddy</TableCell>
                                    <TableCell>Training Started</TableCell>
                                    <TableCell>Progress</TableCell>
                                    <TableCell>Days (1-5)</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton variant="text" width={150} /></TableCell>
                                            <TableCell><Skeleton variant="text" width={100} /></TableCell>
                                            <TableCell><Skeleton variant="rectangular" height={8} width={120} /></TableCell>
                                            <TableCell><Skeleton variant="text" width={150} /></TableCell>
                                            <TableCell><Skeleton variant="text" width={100} /></TableCell>
                                        </TableRow>
                                    ))
                                ) : trainingBuddies.length > 0 ? (
                                    trainingBuddies.map((buddy) => (
                                        <TableRow key={buddy.id} hover>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Avatar
                                                        src={buddy.user.profileImage}
                                                        sx={{ bgcolor: COLORS.primary }}
                                                    >
                                                        <PersonIcon />
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="subtitle2" fontWeight={600}>
                                                            {buddy.user.name}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {buddy.user.phone}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {buddy.trainingStartDate
                                                        ? dayjs(buddy.trainingStartDate).format('MMM D, YYYY')
                                                        : 'Not started'
                                                    }
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={getTrainingProgress(buddy)}
                                                        sx={{
                                                            width: 100,
                                                            height: 8,
                                                            borderRadius: 4,
                                                            bgcolor: COLORS.border,
                                                            '& .MuiLinearProgress-bar': {
                                                                bgcolor: COLORS.primary,
                                                                borderRadius: 4,
                                                            },
                                                        }}
                                                    />
                                                    <Typography variant="caption" fontWeight={600}>
                                                        {buddy.trainingDaysTaken || 0}/{TRAINING_DAYS}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                {renderDayIndicators(buddy)}
                                            </TableCell>
                                            <TableCell align="center">
                                                <Tooltip title="Complete All Days">
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        startIcon={<CompleteAllIcon />}
                                                        onClick={() => handleCompleteAll(buddy)}
                                                        disabled={(buddy.trainingDaysTaken || 0) >= TRAINING_DAYS}
                                                        sx={{ textTransform: 'none' }}
                                                    >
                                                        Complete All
                                                    </Button>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                            <Typography color="text.secondary">
                                                No buddies currently in training
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* Confirmation Dialog */}
            <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}>
                <DialogTitle>
                    {confirmDialog.action === 'complete_all' ? 'Complete All Training' : 'Mark Day Complete'}
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        {confirmDialog.action === 'complete_all'
                            ? `Are you sure you want to mark all training days as complete for ${confirmDialog.buddyName}?`
                            : `Mark Day ${confirmDialog.day} as complete for ${confirmDialog.buddyName}?`
                        }
                    </Typography>
                    {confirmDialog.action === 'complete_all' && (
                        <Chip
                            label="This will enable the buddy for assignments"
                            color="success"
                            size="small"
                            sx={{ mt: 2 }}
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDialog({ ...confirmDialog, open: false })} disabled={actionLoading}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleConfirmAction}
                        disabled={actionLoading}
                    >
                        {actionLoading ? 'Updating...' : 'Confirm'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default BuddyTrainingPage;
