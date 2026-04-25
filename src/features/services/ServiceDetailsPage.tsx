import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Paper,
    Typography,
    Button,
    Grid,
    Chip,
    Divider,
    Stack,
    IconButton,
    Card,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Snackbar,
    Skeleton,
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    AccessTime as DurationIcon,
    CurrencyRupee as PriceIcon,
    Category as CategoryIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchServiceById, deleteService } from '../../store/slices/servicesSlice';
import { COLORS, SHADOWS } from '../../theme';
import { PermissionGate } from '../../components/common/PermissionGate';

const ServiceDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { services, loading, error } = useAppSelector((state) => state.services);

    const [service, setService] = useState<any>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    useEffect(() => {
        if (id) {
            // First check if service exists in the store
            const existingService = services.find((s) => s.id === id);
            if (existingService) {
                setService(existingService);
            } else {
                // Fetch if not in store
                dispatch(fetchServiceById(id))
                    .unwrap()
                    .then((data) => setService(data))
                    .catch(() => { });
            }
        }
    }, [dispatch, id, services]);

    const handleDelete = async () => {
        if (!id) return;
        setDeleteLoading(true);
        try {
            await dispatch(deleteService(id)).unwrap();
            setSnackbar({ open: true, message: 'Service deleted successfully', severity: 'success' });
            navigate('/services');
        } catch (err: any) {
            setSnackbar({ open: true, message: err || 'Failed to delete service', severity: 'error' });
        } finally {
            setDeleteLoading(false);
            setDeleteDialogOpen(false);
        }
    };

    if (loading && !service) {
        return (
            <Box>
                <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Skeleton variant="circular" width={40} height={40} />
                    <Skeleton variant="text" width={200} height={40} />
                </Box>
                <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
            </Box>
        );
    }

    if (error) {
        return (
            <Box p={3}>
                <Alert severity="error">{error}</Alert>
                <Button onClick={() => navigate('/services')} sx={{ mt: 2 }}>
                    Back to Services
                </Button>
            </Box>
        );
    }

    if (!service) {
        return (
            <Box p={3}>
                <Typography>Service not found</Typography>
                <Button onClick={() => navigate('/services')} sx={{ mt: 2 }}>
                    Back to Services
                </Button>
            </Box>
        );
    }

    return (
        <Box>
            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Delete Service</DialogTitle>
                <DialogContent>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        Are you sure you want to delete "{service.title}"? This action cannot be undone.
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleteLoading}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleDelete}
                        disabled={deleteLoading}
                    >
                        {deleteLoading ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Header */}
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton onClick={() => navigate('/services')}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Box>
                        <Typography variant="h4" fontWeight={600} color={COLORS.charcoal}>
                            {service.title}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Chip
                                label={service.isActive ? 'Active' : 'Inactive'}
                                size="small"
                                color={service.isActive ? 'success' : 'default'}
                            />
                            {service.category && (
                                <Chip
                                    icon={<CategoryIcon sx={{ fontSize: '16px !important' }} />}
                                    label={service.category.name}
                                    size="small"
                                    variant="outlined"
                                />
                            )}
                        </Stack>
                    </Box>
                </Box>
                <Stack direction="row" spacing={1}>
                    <PermissionGate permission="services.edit">
                        <Button
                            variant="outlined"
                            startIcon={<EditIcon />}
                            onClick={() => navigate(`/services?edit=${service.id}`)}
                        >
                            Edit
                        </Button>
                    </PermissionGate>
                    <PermissionGate permission="services.delete">
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => setDeleteDialogOpen(true)}
                        >
                            Delete
                        </Button>
                    </PermissionGate>
                </Stack>
            </Box>

            <Grid container spacing={3}>
                {/* Main Content */}
                <Grid size={{ xs: 12, md: 8 }}>
                    {/* Service Images */}
                    {(service.imageUrls?.length > 0 || service.imageUrl) && (
                        <Paper sx={{ mb: 3, p: 2, borderRadius: 2, boxShadow: SHADOWS.light }}>
                            <Typography variant="h6" fontWeight={600} gutterBottom>
                                Service Images
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1 }}>
                                {(service.imageUrls?.length > 0 ? service.imageUrls : [service.imageUrl]).map((url: string, index: number) => (
                                    <Box
                                        key={index}
                                        component="img"
                                        src={url}
                                        alt={`${service.title} ${index + 1}`}
                                        sx={{
                                            width: 250,
                                            height: 180,
                                            objectFit: 'cover',
                                            borderRadius: 2,
                                            flexShrink: 0,
                                        }}
                                    />
                                ))}
                            </Box>
                        </Paper>
                    )}

                    {/* Description */}
                    <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: SHADOWS.light }}>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                            Description
                        </Typography>
                        <Typography color="text.secondary">
                            {service.description || 'No description available.'}
                        </Typography>
                    </Paper>

                    {/* Additional Details */}
                    {service.requirements && (
                        <Paper sx={{ p: 3, borderRadius: 2, boxShadow: SHADOWS.light }}>
                            <Typography variant="h6" fontWeight={600} gutterBottom>
                                Requirements
                            </Typography>
                            <Typography color="text.secondary">
                                {service.requirements}
                            </Typography>
                        </Paper>
                    )}
                </Grid>

                {/* Sidebar */}
                <Grid size={{ xs: 12, md: 4 }}>
                    {/* Pricing Card */}
                    <Card sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: SHADOWS.light }}>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                            Pricing
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Stack spacing={2}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PriceIcon color="primary" />
                                <Typography variant="h4" fontWeight="bold" color="primary.main">
                                    ₹{service.basePrice}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <DurationIcon color="action" />
                                <Typography color="text.secondary">
                                    {service.duration} minutes avg. duration
                                </Typography>
                            </Box>
                        </Stack>
                    </Card>

                    {/* Stats Card */}
                    <Card sx={{ p: 3, borderRadius: 2, boxShadow: SHADOWS.light }}>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                            Statistics
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Stack spacing={2}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography color="text.secondary">Total Bookings</Typography>
                                <Typography fontWeight={600}>
                                    {service._count?.bookings || 0}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography color="text.secondary">Buddies Offering</Typography>
                                <Typography fontWeight={600}>
                                    {service._count?.buddyServices || 0}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography color="text.secondary">Created</Typography>
                                <Typography fontWeight={600}>
                                    {new Date(service.createdAt).toLocaleDateString()}
                                </Typography>
                            </Box>
                        </Stack>
                    </Card>
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

export default ServiceDetailsPage;
