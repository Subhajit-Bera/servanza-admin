import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
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
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Chip,
    Tooltip
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    ConfirmationNumber as CouponIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { fetchCoupons, createCoupon, updateCoupon, deleteCoupon } from '../../store/slices/couponsSlice';
import type { Coupon, CreateCouponPayload, UpdateCouponPayload } from '../../api/types';
import { COLORS, SHADOWS } from '../../theme';
import dayjs from 'dayjs';
import { PermissionGate } from '../../components/common/PermissionGate';

const CouponsPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { coupons, loading } = useSelector((state: RootState) => state.coupons);

    const [openModal, setOpenModal] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    const [formData, setFormData] = useState<CreateCouponPayload>({
        code: '',
        name: '',
        discountType: 'PERCENTAGE',
        discountValue: 0,
        maxDiscount: null,
        minOrderAmount: null,
        expiresAt: dayjs().add(7, 'day').format('YYYY-MM-DDTHH:mm'),
        isActive: true,
        usageLimit: null,
        description: '',
    });

    useEffect(() => {
        dispatch(fetchCoupons());
    }, [dispatch]);

    const handleOpenCreate = () => {
        setEditingCoupon(null);
        setFormData({
            code: '',
            name: '',
            discountType: 'PERCENTAGE',
            discountValue: 0,
            maxDiscount: null,
            minOrderAmount: null,
            expiresAt: dayjs().add(7, 'day').format('YYYY-MM-DDTHH:mm'),
            isActive: true,
            usageLimit: null,
            description: '',
        });
        setOpenModal(true);
    };

    const handleOpenEdit = (coupon: Coupon) => {
        setEditingCoupon(coupon);
        setFormData({
            code: coupon.code,
            name: coupon.name,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            maxDiscount: coupon.maxDiscount || null,
            minOrderAmount: coupon.minOrderAmount || null,
            expiresAt: dayjs(coupon.expiresAt).format('YYYY-MM-DDTHH:mm'),
            isActive: coupon.isActive,
            usageLimit: coupon.usageLimit || null,
            description: coupon.description || '',
        });
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setEditingCoupon(null);
    };

    const handleSubmit = async () => {
        try {
            // Validation
            if (!formData.code || formData.discountValue <= 0 || !formData.name || !formData.expiresAt) {
                throw new Error("Please provide valid code, name, discount value, and expiry date.");
            }

            // Convert to appropriate types
            const payload = {
                ...formData,
                discountValue: Number(formData.discountValue),
                maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
                minOrderAmount: formData.minOrderAmount ? Number(formData.minOrderAmount) : null,
                usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
                code: formData.code.toUpperCase(),
            };

            if (editingCoupon) {
                await dispatch(updateCoupon({ id: editingCoupon.id, payload: payload as UpdateCouponPayload })).unwrap();
            } else {
                await dispatch(createCoupon(payload as CreateCouponPayload)).unwrap();
            }

            setSnackbar({ open: true, message: `Coupon ${editingCoupon ? 'updated' : 'created'} successfully!`, severity: 'success' });
            handleCloseModal();
            dispatch(fetchCoupons());
        } catch (error: any) {
            setSnackbar({ open: true, message: error.message || error || 'Failed to save coupon', severity: 'error' });
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirmId) return;
        try {
            await dispatch(deleteCoupon(deleteConfirmId)).unwrap();
            setSnackbar({ open: true, message: 'Coupon deleted', severity: 'success' });
            dispatch(fetchCoupons());
        } catch (error: any) {
            setSnackbar({ open: true, message: error || 'Failed to delete coupon', severity: 'error' });
        }
        setDeleteConfirmId(null);
    };

    const formatDate = (dateStr?: string | null) => {
        if (!dateStr) return '—';
        return dayjs(dateStr).format('MMM D, YYYY h:mm A');
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h1" sx={{ mb: 0.5 }}>Coupons</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage discount codes for customers
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
                    Create Coupon
                </Button>
            </Box>

            <Paper sx={{ boxShadow: SHADOWS.light }}>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: COLORS.offWhite }}>
                            <TableRow>
                                <TableCell>Code</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Discount</TableCell>
                                <TableCell>Usage limit</TableCell>
                                <TableCell>Used Count</TableCell>
                                <TableCell>Expires At</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 3 }}>Loading...</TableCell>
                                </TableRow>
                            ) : coupons.length > 0 ? (
                                coupons.map((coupon) => (
                                    <TableRow key={coupon.id} hover>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <CouponIcon color="primary" fontSize="small" />
                                                <Typography variant="subtitle2" fontWeight={700}>
                                                    {coupon.code}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{coupon.name}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={600}>
                                                {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                                            </Typography>
                                            {coupon.maxDiscount && (
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    Upto ₹{coupon.maxDiscount}
                                                </Typography>
                                            )}
                                            {coupon.minOrderAmount && (
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    Min ₹{coupon.minOrderAmount}
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>{coupon.usageLimit ? coupon.usageLimit : 'Unlimited'}</TableCell>
                                        <TableCell>{coupon.usedCount || 0}</TableCell>
                                        <TableCell>{formatDate(coupon.expiresAt)}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={coupon.isActive ? 'Active' : 'Inactive'}
                                                color={coupon.isActive ? 'success' : 'default'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Edit">
                                                <IconButton color="primary" size="small" onClick={() => handleOpenEdit(coupon)}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <PermissionGate permission="settings.edit">
                                                <Tooltip title="Delete">
                                                    <IconButton color="error" size="small" onClick={() => setDeleteConfirmId(coupon.id)}>
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </PermissionGate>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                                        <Typography color="text.secondary">No coupons found</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Create/Edit Modal */}
            <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
                <DialogTitle>{editingCoupon ? 'Edit Coupon' : 'Create Coupon'}</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <TextField
                            label="Coupon Code"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            required
                            fullWidth
                            placeholder="e.g. SAVE20"
                            inputProps={{ style: { textTransform: 'uppercase' } }}
                        />
                        <TextField
                            label="Coupon Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            fullWidth
                            placeholder="e.g. Summer Sale"
                        />
                        <TextField
                            label="Description"
                            value={formData.description || ''}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            fullWidth
                            multiline
                            rows={2}
                        />
                        <Stack direction="row" spacing={2}>
                            <FormControl fullWidth>
                                <InputLabel>Discount Type</InputLabel>
                                <Select
                                    value={formData.discountType}
                                    label="Discount Type"
                                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                                >
                                    <MenuItem value="PERCENTAGE">Percentage (%)</MenuItem>
                                    <MenuItem value="FIXED">Fixed Amount (₹)</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField
                                label={formData.discountType === 'PERCENTAGE' ? 'Discount %' : 'Discount Amount'}
                                type="number"
                                value={formData.discountValue}
                                onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                                required
                                fullWidth
                            />
                        </Stack>
                        
                        <Stack direction="row" spacing={2}>
                            {formData.discountType === 'PERCENTAGE' && (
                                <TextField
                                    label="Max Discount Amount (₹) (Optional)"
                                    type="number"
                                    value={formData.maxDiscount || ''}
                                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value ? Number(e.target.value) : null })}
                                    fullWidth
                                />
                            )}
                            <TextField
                                label="Min Order Amount (₹) (Optional)"
                                type="number"
                                value={formData.minOrderAmount || ''}
                                onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value ? Number(e.target.value) : null })}
                                fullWidth
                            />
                        </Stack>

                        <Stack direction="row" spacing={2}>
                            <TextField
                                label="Expiry Date"
                                type="datetime-local"
                                value={formData.expiresAt}
                                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                                required
                            />
                        </Stack>

                        <TextField
                            label="Usage Limit (Optional)"
                            type="number"
                            value={formData.usageLimit || ''}
                            onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value ? Number(e.target.value) : null })}
                            fullWidth
                            helperText="Leave empty for unlimited usage"
                        />

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                />
                            }
                            label="Is Active"
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit}>
                        {editingCoupon ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirm */}
            <Dialog open={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} maxWidth="xs" fullWidth>
                <DialogTitle color="error">Delete Coupon</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete this coupon? This action cannot be undone.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default CouponsPage;
