import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Chip,
    Divider,
    Stack,
    Avatar,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert,
    Snackbar,
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Cancel as CancelIcon,
    CurrencyRupee as RefundIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { fetchBookingById, cancelBooking, processRefund } from '../../store/slices/bookingsSlice';
import { COLORS } from '../../theme/theme';
import AssignBuddyDialog from './AssignBuddyDialog';
import { PermissionGate } from '../../components/common/PermissionGate';
import { getBookingItems } from '../../utils/bookingHelpers';

const BookingDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { selectedBooking: booking, loading, error } = useSelector((state: RootState) => state.bookings);
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);

    // Admin action dialogs
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [refundDialogOpen, setRefundDialogOpen] = useState(false);
    const [actionReason, setActionReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    useEffect(() => {
        if (id) {
            dispatch(fetchBookingById(id));
        }
    }, [dispatch, id]);

    const handleCancelBooking = async () => {
        if (!id) return;
        setActionLoading(true);
        try {
            await dispatch(cancelBooking({ id, reason: actionReason })).unwrap();
            setSnackbar({ open: true, message: 'Booking cancelled successfully', severity: 'success' });
            setCancelDialogOpen(false);
            setActionReason('');
            dispatch(fetchBookingById(id)); // Refresh
        } catch (err: any) {
            setSnackbar({ open: true, message: err || 'Failed to cancel booking', severity: 'error' });
        } finally {
            setActionLoading(false);
        }
    };

    const handleProcessRefund = async () => {
        if (!id) return;
        setActionLoading(true);
        try {
            await dispatch(processRefund({ id, reason: actionReason })).unwrap();
            setSnackbar({ open: true, message: 'Refund processed successfully', severity: 'success' });
            setRefundDialogOpen(false);
            setActionReason('');
            dispatch(fetchBookingById(id)); // Refresh
        } catch (err: any) {
            setSnackbar({ open: true, message: err || 'Failed to process refund', severity: 'error' });
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <Box p={3}><Typography>Loading...</Typography></Box>;
    if (error) return <Box p={3}><Typography color="error">{error}</Typography></Box>;
    if (!booking) return <Box p={3}><Typography>Booking not found</Typography></Box>;

    const activeAssignment = booking.assignments?.find(
        a => a.status !== 'REJECTED' && a.status !== 'CANCELLED'
    );
    const assignedBuddy = activeAssignment?.buddy;

    const getStepIndex = (status: string) => {
        const steps = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'ESCALATED'];
        if (status === 'CANCELLED') return -1;
        const idx = steps.indexOf(status);
        return idx > -1 ? idx : 0;
    };

    const steps = [
        { label: 'Pending', description: 'Waiting for Buddy' },
        { label: 'Confirmed', description: 'Buddy Assigned' },
        { label: 'In Progress', description: 'Service Started' },
        { label: 'Completed', description: 'Service Finished' }
    ];

    const activeStep = getStepIndex(booking.status);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'success';
            case 'PENDING': return 'warning';
            case 'IN_PROGRESS': return 'info';
            case 'ESCALATED': return 'error';
            case 'CANCELLED': return 'default';
            default: return 'primary';
        }
    };

    const canCancel = !['COMPLETED', 'CANCELLED'].includes(booking.status);
    const canRefund = booking.paymentStatus === 'PAID';

    return (
        <Box>
            {/* Assign Buddy Dialog */}
            <AssignBuddyDialog
                open={assignDialogOpen}
                onClose={() => setAssignDialogOpen(false)}
                booking={booking}
            />

            {/* Cancel Booking Dialog */}
            <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Cancel Booking</DialogTitle>
                <DialogContent>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        Are you sure you want to cancel this booking? This action cannot be undone.
                    </Alert>
                    <TextField
                        label="Cancellation Reason"
                        fullWidth
                        multiline
                        rows={3}
                        value={actionReason}
                        onChange={(e) => setActionReason(e.target.value)}
                        placeholder="Enter the reason for cancellation..."
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCancelDialogOpen(false)} disabled={actionLoading}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleCancelBooking}
                        disabled={actionLoading}
                    >
                        {actionLoading ? 'Cancelling...' : 'Confirm Cancellation'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Refund Dialog */}
            <Dialog open={refundDialogOpen} onClose={() => setRefundDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Process Refund</DialogTitle>
                <DialogContent>
                    <Alert severity="info" sx={{ mb: 2 }}>
                        Process a refund of ₹{booking.totalAmount} for this booking.
                    </Alert>
                    <TextField
                        label="Refund Reason"
                        fullWidth
                        multiline
                        rows={3}
                        value={actionReason}
                        onChange={(e) => setActionReason(e.target.value)}
                        placeholder="Enter the reason for refund..."
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRefundDialogOpen(false)} disabled={actionLoading}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleProcessRefund}
                        disabled={actionLoading}
                    >
                        {actionLoading ? 'Processing...' : 'Process Refund'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton onClick={() => navigate('/bookings')}>
                    <ArrowBackIcon />
                </IconButton>
                <Box sx={{ flex: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography variant="h4" sx={{ fontWeight: 600, color: COLORS.charcoal }}>
                            Booking #{booking.id.substring(0, 8)}
                        </Typography>
                        <Chip
                            label={booking.status}
                            color={getStatusColor(booking.status) as any}
                            size="small"
                        />
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                        Created {dayjs(booking.createdAt).format('MMM D, YYYY h:mm A')}
                    </Typography>
                </Box>
            </Box>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 8 }}>
                    {/* Service */}
                    <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Service Details</Typography>
                        <Stack spacing={2}>
                            {(() => {
                                const items = getBookingItems(booking);
                                if (items.length > 0) {
                                    return (
                                        <>
                                            {items.map((item: any, idx: number) => (
                                                <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Box>
                                                        <Typography fontWeight={500}>{item.title}</Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Qty: {item.quantity || 1} × ₹{item.price}
                                                        </Typography>
                                                    </Box>
                                                    <Typography fontWeight={600}>₹{(item.price || 0) * (item.quantity || 1)}</Typography>
                                                </Box>
                                            ))}
                                            <Divider />
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography fontWeight={600}>Total</Typography>
                                                <Typography fontWeight={700} color="primary">₹{booking.totalAmount}</Typography>
                                            </Box>
                                        </>
                                    );
                                }
                                // Legacy fallback: single service
                                return (
                                    <>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography color="text.secondary">Service</Typography>
                                            <Typography fontWeight={500}>{booking.service?.title || 'Unknown Service'}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography color="text.secondary">Price</Typography>
                                            <Typography fontWeight={500}>₹{booking.totalAmount}</Typography>
                                        </Box>
                                    </>
                                );
                            })()}
                            <Divider />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography color="text.secondary">Scheduled</Typography>
                                <Typography fontWeight={500}>
                                    {dayjs(booking.scheduledStart).format('MMM D, YYYY')} ({dayjs(booking.scheduledStart).format('h:mm A')} - {dayjs(booking.scheduledEnd).format('h:mm A')})
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography color="text.secondary">Address</Typography>
                                <Typography fontWeight={500} align="right" sx={{ maxWidth: '60%' }}>
                                    {booking.address ? `${booking.address.streetAddress}, ${booking.address.city}` : 'N/A'}
                                </Typography>
                            </Box>
                            {booking.specialInstructions && (
                                <Box>
                                    <Typography color="text.secondary" sx={{ mb: 0.5 }}>Customer Notes</Typography>
                                    <Typography variant="body2" sx={{ fontStyle: 'italic', color: COLORS.darkGray }}>
                                        {booking.specialInstructions}
                                    </Typography>
                                </Box>
                            )}
                        </Stack>
                    </Paper>

                    {/* Timeline */}
                    <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Status Timeline</Typography>
                        {booking.status === 'ESCALATED' ? (
                            <Box sx={{ p: 2, bgcolor: 'error.lighter', borderRadius: 1, color: 'error.main' }}>
                                <Typography fontWeight={600}>Booking Escalated</Typography>
                                <Typography variant="body2">This booking requires immediate attention.</Typography>
                            </Box>
                        ) : (
                            <Stepper activeStep={activeStep} orientation="vertical">
                                {steps.map((step) => (
                                    <Step key={step.label}>
                                        <StepLabel error={false}>{step.label}</StepLabel>
                                        <StepContent>
                                            <Typography variant="body2" color="text.secondary">{step.description}</Typography>
                                        </StepContent>
                                    </Step>
                                ))}
                            </Stepper>
                        )}
                    </Paper>

                    {/* Admin Actions */}
                    <Paper sx={{ p: 3, borderRadius: 2, border: `1px solid ${COLORS.lightGray}` }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Admin Actions</Typography>
                        <Stack direction="row" spacing={2}>
                            <PermissionGate permission="bookings.cancel">
                                <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<CancelIcon />}
                                    onClick={() => setCancelDialogOpen(true)}
                                    disabled={!canCancel}
                                >
                                    Cancel Booking
                                </Button>
                            </PermissionGate>
                            <PermissionGate permission="payments.refund">
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    startIcon={<RefundIcon />}
                                    onClick={() => setRefundDialogOpen(true)}
                                    disabled={!canRefund}
                                >
                                    Process Refund
                                </Button>
                            </PermissionGate>
                        </Stack>
                        {!canCancel && !canRefund && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                No admin actions available for this booking status.
                            </Typography>
                        )}
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    {/* Customer */}
                    <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Customer</Typography>
                        <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                            <Avatar src={booking.user.profileImage}>{booking.user.name[0]}</Avatar>
                            <Box>
                                <Typography fontWeight={600}>{booking.user.name}</Typography>
                                <Typography variant="body2" color="text.secondary">{booking.user.phone}</Typography>
                                <Typography variant="body2" color="text.secondary">{booking.user.email}</Typography>
                            </Box>
                        </Stack>
                    </Paper>

                    {/* Buddy */}
                    <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Assigned Buddy</Typography>
                        {assignedBuddy ? (
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar src={assignedBuddy.user.profileImage}>{assignedBuddy.user.name[0]}</Avatar>
                                <Box>
                                    <Typography fontWeight={600}>{assignedBuddy.user.name}</Typography>
                                    <Typography variant="body2" color="text.secondary">Status: {activeAssignment?.status}</Typography>
                                    <Typography variant="body2" color="text.secondary">{assignedBuddy.user.phone}</Typography>
                                    <Typography variant="body2" color="text.secondary">{assignedBuddy.user.email}</Typography>
                                </Box>
                            </Stack>
                        ) : (
                            <Box sx={{ textAlign: 'center', py: 2 }}>
                                <Typography color="text.secondary" gutterBottom>No buddy assigned yet</Typography>
                                <PermissionGate permission="bookings.assign">
                                    <Button variant="outlined" size="small" onClick={() => setAssignDialogOpen(true)}>Assign Buddy</Button>
                                </PermissionGate>
                            </Box>
                        )}
                    </Paper>

                    {/* Payment */}
                    <Paper sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Payment</Typography>
                        <Stack spacing={1}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography color="text.secondary">Status</Typography>
                                <Chip label={booking.paymentStatus} size="small" color={booking.paymentStatus === 'PAID' ? 'success' : 'default'} />
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography color="text.secondary">Method</Typography>
                                <Typography>{booking.paymentMethod || 'N/A'}</Typography>
                            </Box>
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>

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

export default BookingDetailsPage;
