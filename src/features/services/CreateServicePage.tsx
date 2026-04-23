import React, { useEffect, useState, useRef } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    InputAdornment,
    Stack,
    Alert,
    Snackbar,
    Switch,
    FormControlLabel,
    Paper,
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Save as SaveIcon,
    CloudUpload as CloudUploadIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchCategories, createService, uploadServiceImage } from '../../store/slices/servicesSlice';
import { SHADOWS, COLORS } from '../../theme';
import { useNavigate } from 'react-router-dom';
import type { CreateServicePayload, ServiceDescription } from '../../api/types';

const CreateServicePage: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { categories } = useAppSelector((state) => state.services);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<CreateServicePayload>({
        title: '',
        description: {
            shortDescription: '',
            description: '',
            whatsIncluded: [],
            whatsNotIncluded: [],
            productsWeUse: [],
            productsNeededFromCustomer: []
        },
        basePrice: 0,
        discountedPrice: undefined,
        durationMins: 60,
        categoryId: '',
        isActive: true,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    const [submitting, setSubmitting] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    useEffect(() => {
        dispatch(fetchCategories());
    }, [dispatch]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Service name is required';
        }
        if (!formData.categoryId) {
            newErrors.categoryId = 'Category is required';
        }
        if (!formData.basePrice || formData.basePrice <= 0) {
            newErrors.basePrice = 'Price must be greater than 0';
        }
        if (!formData.durationMins || formData.durationMins <= 0) {
            newErrors.durationMins = 'Duration must be greater than 0';
        }
        if (formData.discountedPrice && formData.discountedPrice >= formData.basePrice) {
            newErrors.discountedPrice = 'Discounted price must be less than base price';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setSelectedFile(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setSubmitting(true);
        try {
            const result = await dispatch(createService(formData)).unwrap();
            const serviceId = result?.data?.id || result?.id;

            // Upload image if selected
            if (selectedFile && serviceId) {
                try {
                    await dispatch(uploadServiceImage({ serviceId, file: selectedFile })).unwrap();
                } catch (imgError) {
                    console.error('Image upload failed:', imgError);
                    // Continue - service was created successfully
                }
            }

            setSnackbar({ open: true, message: 'Service created successfully!', severity: 'success' });
            setTimeout(() => {
                navigate('/services');
            }, 1500);
        } catch (error: any) {
            setSnackbar({ open: true, message: error || 'Failed to create service', severity: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleChange = (field: keyof CreateServicePayload, value: any) => {
        setFormData({ ...formData, [field]: value });
        if (errors[field]) {
            setErrors({ ...errors, [field]: '' });
        }
    };

    const handleDescriptionChange = (field: keyof ServiceDescription, value: any) => {
        setFormData(prev => ({
            ...prev,
            description: {
                ...(typeof prev.description === 'object' ? prev.description : {}),
                [field]: value
            }
        }));
    };

    const handleArrayChange = (field: keyof ServiceDescription, value: string) => {
        // Split by newlines, trim, and filter out empty strings
        const arrayValue = value.split('\n').map(item => item.trim()).filter(item => item.length > 0);
        handleDescriptionChange(field, arrayValue);
    };

    const getDescField = (field: keyof ServiceDescription) => {
        const desc = formData.description;
        if (typeof desc === 'object' && desc !== null) {
            return desc[field];
        }
        return undefined;
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/services')}
                >
                    Back to Services
                </Button>
            </Box>

            <Box sx={{ mb: 3 }}>
                <Typography variant="h1" sx={{ mb: 1 }}>Create New Service</Typography>
                <Typography variant="body1" color="text.secondary">
                    Add a new service to your catalog
                </Typography>
            </Box>

            <form onSubmit={handleSubmit}>
                <Card sx={{ boxShadow: SHADOWS.light, maxWidth: 800 }}>
                    <CardContent sx={{ p: 4 }}>
                        <Stack spacing={3}>
                            <TextField
                                label="Service Name"
                                value={formData.title}
                                onChange={(e) => handleChange('title', e.target.value)}
                                error={!!errors.title}
                                helperText={errors.title}
                                fullWidth
                                required
                            />

                            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Service Details</Typography>
                            
                            <TextField
                                label="Short Description"
                                value={getDescField('shortDescription') as string || ''}
                                onChange={(e) => handleDescriptionChange('shortDescription', e.target.value)}
                                fullWidth
                                multiline
                                rows={2}
                                helperText="A brief summary shown on the service card"
                            />

                            <TextField
                                label="Full Description"
                                value={getDescField('description') as string || ''}
                                onChange={(e) => handleDescriptionChange('description', e.target.value)}
                                fullWidth
                                multiline
                                rows={4}
                                helperText="Detailed description shown on the service detail page"
                            />

                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                                <TextField
                                    label="What's Included"
                                    value={((getDescField('whatsIncluded') as string[]) || []).join('\n')}
                                    onChange={(e) => handleArrayChange('whatsIncluded', e.target.value)}
                                    fullWidth
                                    multiline
                                    rows={4}
                                    helperText="Enter each item on a new line"
                                />
                                <TextField
                                    label="What's Not Included"
                                    value={((getDescField('whatsNotIncluded') as string[]) || []).join('\n')}
                                    onChange={(e) => handleArrayChange('whatsNotIncluded', e.target.value)}
                                    fullWidth
                                    multiline
                                    rows={4}
                                    helperText="Enter each item on a new line"
                                />
                            </Stack>

                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                                <TextField
                                    label="Products We Use"
                                    value={((getDescField('productsWeUse') as string[]) || []).join('\n')}
                                    onChange={(e) => handleArrayChange('productsWeUse', e.target.value)}
                                    fullWidth
                                    multiline
                                    rows={4}
                                    helperText="Enter each item on a new line"
                                />
                                <TextField
                                    label="Products Needed from Customer"
                                    value={((getDescField('productsNeededFromCustomer') as string[]) || []).join('\n')}
                                    onChange={(e) => handleArrayChange('productsNeededFromCustomer', e.target.value)}
                                    fullWidth
                                    multiline
                                    rows={4}
                                    helperText="Enter each item on a new line"
                                />
                            </Stack>

                            {/* Image Upload */}
                            <Box>
                                <Typography variant="subtitle2" sx={{ mb: 1 }}>Service Image</Typography>
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    onChange={handleImageUpload}
                                    style={{ display: 'none' }}
                                />
                                {imagePreview ? (
                                    <Paper
                                        variant="outlined"
                                        sx={{
                                            p: 2,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 2,
                                            bgcolor: COLORS.offWhite
                                        }}
                                    >
                                        <Box
                                            component="img"
                                            src={imagePreview}
                                            alt="Preview"
                                            sx={{
                                                width: 120,
                                                height: 80,
                                                objectFit: 'cover',
                                                borderRadius: 1,
                                            }}
                                        />
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="body2" fontWeight={600}>
                                                {selectedFile?.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {selectedFile && `${(selectedFile.size / 1024).toFixed(1)} KB`}
                                            </Typography>
                                        </Box>
                                        <Button
                                            color="error"
                                            size="small"
                                            startIcon={<DeleteIcon />}
                                            onClick={handleRemoveImage}
                                        >
                                            Remove
                                        </Button>
                                    </Paper>
                                ) : (
                                    <Paper
                                        variant="outlined"
                                        onClick={() => fileInputRef.current?.click()}
                                        sx={{
                                            p: 4,
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            bgcolor: COLORS.offWhite,
                                            border: `2px dashed ${COLORS.border}`,
                                            '&:hover': {
                                                borderColor: COLORS.primary,
                                                bgcolor: 'rgba(34, 197, 94, 0.05)',
                                            },
                                        }}
                                    >
                                        <CloudUploadIcon sx={{ fontSize: 48, color: COLORS.primary, mb: 1 }} />
                                        <Typography variant="body1" fontWeight={600}>
                                            Click to upload image
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            PNG, JPG up to 5MB
                                        </Typography>
                                    </Paper>
                                )}
                            </Box>

                            <FormControl fullWidth error={!!errors.categoryId} required>
                                <InputLabel>Category</InputLabel>
                                <Select
                                    value={formData.categoryId}
                                    label="Category"
                                    onChange={(e) => handleChange('categoryId', e.target.value)}
                                >
                                    {categories.map((category) => (
                                        <MenuItem key={category.id} value={category.id}>
                                            {category.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {errors.categoryId && (
                                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                                        {errors.categoryId}
                                    </Typography>
                                )}
                            </FormControl>

                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                                <TextField
                                    label="Base Price"
                                    type="number"
                                    value={formData.basePrice}
                                    onChange={(e) => handleChange('basePrice', parseFloat(e.target.value) || 0)}
                                    error={!!errors.basePrice}
                                    helperText={errors.basePrice}
                                    fullWidth
                                    required
                                    slotProps={{
                                        input: {
                                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                        },
                                    }}
                                />

                                <TextField
                                    label="Discounted Price (Optional)"
                                    type="number"
                                    value={formData.discountedPrice || ''}
                                    onChange={(e) => handleChange('discountedPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                                    error={!!errors.discountedPrice}
                                    helperText={errors.discountedPrice || 'Leave empty if no discount'}
                                    fullWidth
                                    slotProps={{
                                        input: {
                                            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                        },
                                    }}
                                />
                            </Stack>

                            <TextField
                                label="Duration"
                                type="number"
                                value={formData.durationMins}
                                onChange={(e) => handleChange('durationMins', parseInt(e.target.value) || 0)}
                                error={!!errors.durationMins}
                                helperText={errors.durationMins}
                                fullWidth
                                required
                                slotProps={{
                                    input: {
                                        endAdornment: <InputAdornment position="end">minutes</InputAdornment>,
                                    },
                                }}
                            />

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.isActive}
                                        onChange={(e) => handleChange('isActive', e.target.checked)}
                                        color="success"
                                    />
                                }
                                label="Active (visible to customers)"
                            />

                            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    startIcon={<SaveIcon />}
                                    disabled={submitting}
                                    size="large"
                                >
                                    {submitting ? 'Creating...' : 'Create Service'}
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate('/services')}
                                    disabled={submitting}
                                >
                                    Cancel
                                </Button>
                            </Stack>
                        </Stack>
                    </CardContent>
                </Card>
            </form>

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

export default CreateServicePage;
