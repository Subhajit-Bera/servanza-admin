import React, { useEffect, useState, useRef } from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    CardMedia,
    CardActions,
    Grid as Grid2,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Stack,
    Switch,
    FormControlLabel,
    Alert,
    Snackbar,
    Paper,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    CloudUpload as CloudUploadIcon,
    Campaign as CampaignIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { fetchPromotions, createPromotion, updatePromotion, deletePromotion, uploadPromotionImage } from '../../store/slices/promotionsSlice';

import type { Promotion, CreatePromotionPayload } from '../../api/types';

const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';

const PromotionsPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { promotions, loading } = useSelector((state: RootState) => state.promotions);

    const [openModal, setOpenModal] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        ctaLabel: 'Book Now',
        ctaLink: '',
        displayOrder: 0,
        isActive: true,
        startDate: '',
        endDate: '',
    });

    useEffect(() => {
        dispatch(fetchPromotions());
    }, [dispatch]);

    const handleOpenCreate = () => {
        setEditingPromotion(null);
        setFormData({
            title: '',
            subtitle: '',
            ctaLabel: 'Book Now',
            ctaLink: '',
            displayOrder: 0,
            isActive: true,
            startDate: '',
            endDate: '',
        });
        setImagePreview(null);
        setSelectedFile(null);
        setOpenModal(true);
    };

    const handleOpenEdit = (promo: Promotion) => {
        setEditingPromotion(promo);
        setFormData({
            title: promo.title || '',
            subtitle: promo.subtitle || '',
            ctaLabel: promo.ctaLabel || 'Book Now',
            ctaLink: promo.ctaLink || '',
            displayOrder: promo.displayOrder || 0,
            isActive: promo.isActive,
            startDate: promo.startDate ? promo.startDate.slice(0, 16) : '',
            endDate: promo.endDate ? promo.endDate.slice(0, 16) : '',
        });
        setImagePreview(promo.imageUrl || null);
        setSelectedFile(null);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setEditingPromotion(null);
        setImagePreview(null);
        setSelectedFile(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async () => {
        if (!formData.title.trim()) {
            setSnackbar({ open: true, message: 'Title is required', severity: 'error' });
            return;
        }

        setIsSubmitting(true);
        try {
            const payload: CreatePromotionPayload = {
                title: formData.title,
                subtitle: formData.subtitle || undefined,
                ctaLabel: formData.ctaLabel || 'Book Now',
                ctaLink: formData.ctaLink || undefined,
                displayOrder: Number(formData.displayOrder) || 0,
                isActive: formData.isActive,
                startDate: formData.startDate || null,
                endDate: formData.endDate || null,
            };

            let promoId = editingPromotion?.id;

            if (editingPromotion) {
                await dispatch(updatePromotion({ id: editingPromotion.id, payload })).unwrap();
            } else {
                const result = await dispatch(createPromotion(payload)).unwrap();
                promoId = result.data?.id || result.id;
            }

            // Upload image if selected
            if (selectedFile && promoId) {
                await dispatch(uploadPromotionImage({ promotionId: promoId, file: selectedFile })).unwrap();
            }

            setSnackbar({
                open: true,
                message: editingPromotion ? 'Promotion updated!' : 'Promotion created!',
                severity: 'success',
            });
            handleCloseModal();
            dispatch(fetchPromotions());
        } catch (error: any) {
            setSnackbar({ open: true, message: error || 'Failed to save promotion', severity: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirmId) return;
        try {
            await dispatch(deletePromotion(deleteConfirmId)).unwrap();
            setSnackbar({ open: true, message: 'Promotion deleted', severity: 'success' });
        } catch (error: any) {
            setSnackbar({ open: true, message: error || 'Failed to delete', severity: 'error' });
        }
        setDeleteConfirmId(null);
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('en-IN', {
            year: 'numeric', month: 'short', day: 'numeric',
        });
    };

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h1" sx={{ mb: 0.5 }}>Promotional Banners</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage the promotional banners shown on the customer app home screen
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCreate}
                    sx={{ borderRadius: 2 }}
                >
                    Add Banner
                </Button>
            </Box>

            {loading && <Typography>Loading...</Typography>}

            {/* Promotions Grid */}
            <Grid2 container spacing={3}>
                {promotions.map((promo) => (
                    <Grid2 size={{ xs: 12, sm: 6, md: 4 }} key={promo.id}>
                        <Card sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: promo.isActive ? 'transparent' : 'error.light', opacity: promo.isActive ? 1 : 0.7 }}>
                            <CardMedia
                                component="img"
                                height="160"
                                image={promo.imageUrl || PLACEHOLDER_IMAGE}
                                alt={promo.title}
                                sx={{ objectFit: 'cover' }}
                            />
                            <CardContent sx={{ pb: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <Typography variant="subtitle1" fontWeight={700} noWrap sx={{ flex: 1 }}>
                                        {promo.title}
                                    </Typography>
                                    <Chip
                                        label={promo.isActive ? 'Active' : 'Hidden'}
                                        size="small"
                                        icon={promo.isActive ? <VisibilityIcon /> : <VisibilityOffIcon />}
                                        color={promo.isActive ? 'success' : 'default'}
                                        variant="outlined"
                                        sx={{ fontSize: 11 }}
                                    />
                                </Box>
                                {promo.subtitle && (
                                    <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 0.5 }}>
                                        {promo.subtitle}
                                    </Typography>
                                )}
                                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                    {promo.ctaLabel && (
                                        <Chip label={promo.ctaLabel} size="small" color="primary" variant="outlined" />
                                    )}
                                    {promo.ctaLink && (
                                        <Chip label={promo.ctaLink} size="small" sx={{ maxWidth: 140 }} />
                                    )}
                                </Stack>
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                    Order: {promo.displayOrder} · {formatDate(promo.startDate)} → {formatDate(promo.endDate)}
                                </Typography>
                            </CardContent>
                            <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 1.5 }}>
                                <IconButton size="small" onClick={() => handleOpenEdit(promo)} color="primary">
                                    <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton size="small" onClick={() => setDeleteConfirmId(promo.id)} color="error">
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </CardActions>
                        </Card>
                    </Grid2>
                ))}
            </Grid2>

            {!loading && promotions.length === 0 && (
                <Paper sx={{ p: 6, textAlign: 'center', mt: 4, borderRadius: 3 }}>
                    <CampaignIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">No promotional banners yet</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Create your first banner to attract customers
                    </Typography>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
                        Add Banner
                    </Button>
                </Paper>
            )}

            {/* Create / Edit Modal */}
            <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
                <DialogTitle>{editingPromotion ? 'Edit Banner' : 'Create Banner'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
                        {/* Image Upload */}
                        <Box>
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleImageUpload}
                            />
                            <Box
                                onClick={() => fileInputRef.current?.click()}
                                sx={{
                                    width: '100%',
                                    height: 160,
                                    border: '2px dashed',
                                    borderColor: 'grey.400',
                                    borderRadius: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    overflow: 'hidden',
                                    bgcolor: 'grey.100',
                                    '&:hover': { borderColor: 'primary.main', bgcolor: 'grey.200' },
                                }}
                            >
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Banner preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <Box sx={{ textAlign: 'center', color: 'grey.600' }}>
                                        <CloudUploadIcon sx={{ fontSize: 40 }} />
                                        <Typography variant="body2">Click to upload banner image</Typography>
                                        <Typography variant="caption" color="text.secondary">Recommended: 800×400px</Typography>
                                    </Box>
                                )}
                            </Box>
                        </Box>

                        <TextField
                            label="Title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            fullWidth
                            required
                        />

                        <TextField
                            label="Subtitle"
                            name="subtitle"
                            value={formData.subtitle}
                            onChange={handleInputChange}
                            fullWidth
                        />

                        <Stack direction="row" spacing={2}>
                            <TextField
                                label="CTA Button Label"
                                name="ctaLabel"
                                value={formData.ctaLabel}
                                onChange={handleInputChange}
                                fullWidth
                                helperText="e.g. Book Now, Explore"
                            />
                            <TextField
                                label="CTA Link"
                                name="ctaLink"
                                value={formData.ctaLink}
                                onChange={handleInputChange}
                                fullWidth
                                helperText="e.g. service:abc123 or category:xyz"
                            />
                        </Stack>

                        <Stack direction="row" spacing={2}>
                            <TextField
                                label="Display Order"
                                name="displayOrder"
                                type="number"
                                value={formData.displayOrder}
                                onChange={handleInputChange}
                                fullWidth
                                inputProps={{ min: 0 }}
                            />
                        </Stack>

                        <Stack direction="row" spacing={2}>
                            <TextField
                                label="Start Date"
                                name="startDate"
                                type="datetime-local"
                                value={formData.startDate}
                                onChange={handleInputChange}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                helperText="Leave empty for no start restriction"
                            />
                            <TextField
                                label="End Date"
                                name="endDate"
                                type="datetime-local"
                                value={formData.endDate}
                                onChange={handleInputChange}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                helperText="Leave empty for no end restriction"
                            />
                        </Stack>

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                    color="success"
                                />
                            }
                            label="Visible to Customers"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : (editingPromotion ? 'Update' : 'Create')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)}>
                <DialogTitle>Delete Promotion?</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this promotional banner? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleDelete}>
                        Delete
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

export default PromotionsPage;
