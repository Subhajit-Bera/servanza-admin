import React, { useEffect, useState, useRef } from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    Grid,
    Card,
    CardContent,
    CardMedia,
    CardActions,
    Chip,
    IconButton,
    Tabs,
    Tab,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Stack,
    Avatar,
    FormControlLabel,
    Switch,
    Tooltip,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    CloudUpload as CloudUploadIcon,
    ContentCopy as CopyIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { fetchServices, fetchCategories, createService, createCategory, updateService, updateCategory, uploadServiceImages, uploadCategoryIcon } from '../../store/slices/servicesSlice';
import { COLORS } from '../../theme/theme';
import type { Service, Category } from '../../api/types';
import { PermissionGate } from '../../components/common/PermissionGate';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ py: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

// Helper function to generate slug from name
const generateSlug = (name: string): string => {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
};

// Placeholder image data URI
const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE0MCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';

const ServicesPage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { services, categories, loading } = useSelector((state: RootState) => state.services);
    const [tabValue, setTabValue] = useState(0);

    // Modal State
    const [openModal, setOpenModal] = useState(false);
    const [modalType, setModalType] = useState<'SERVICE' | 'CATEGORY'>('SERVICE');
    const [editingItem, setEditingItem] = useState<Service | Category | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Multi-image support for services
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<{ file: File; preview: string }[]>([]);
    const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);

    // File input ref
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        dispatch(fetchServices());
        dispatch(fetchCategories());
    }, [dispatch]);

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleAddService = () => {
        setModalType('SERVICE');
        setEditingItem(null);
        setFormData({ name: '', title: '', description: '', descriptionObj: { shortDescription: '', description: '', whatsIncluded: [], whatsNotIncluded: [], productsWeUse: [], productsNeededFromCustomer: [] }, basePrice: '', employeePayout: '', cmpPayout: '', isInstant: false, isActive: true, durationMins: '', categoryId: '', imageUrl: '' });
        setImagePreview(null);
        setSelectedFile(null);
        setSelectedFiles([]);
        setImagePreviews([]);
        setExistingImageUrls([]);
        setOpenModal(true);
    };

    const handleAddCategory = () => {
        setModalType('CATEGORY');
        setEditingItem(null);
        setFormData({ name: '', title: '', description: '', descriptionObj: { shortDescription: '', description: '', whatsIncluded: [], whatsNotIncluded: [], productsWeUse: [], productsNeededFromCustomer: [] }, basePrice: '', employeePayout: '', cmpPayout: '', isInstant: false, isActive: true, durationMins: '', categoryId: '', imageUrl: '' });
        setImagePreview(null);
        setSelectedFile(null);
        setSelectedFiles([]);
        setImagePreviews([]);
        setExistingImageUrls([]);
        setOpenModal(true);
    };

    const handleEditService = (service: Service) => {
        setModalType('SERVICE');
        setEditingItem(service);
        const descObj = typeof service.description === 'object' && service.description !== null ? service.description : { shortDescription: '', description: '', whatsIncluded: [], whatsNotIncluded: [], productsWeUse: [], productsNeededFromCustomer: [] };
        setFormData({
            name: '',
            title: service.title || '',
            description: '',
            descriptionObj: {
                shortDescription: descObj.shortDescription || '',
                description: descObj.description || '',
                whatsIncluded: descObj.whatsIncluded || [],
                whatsNotIncluded: descObj.whatsNotIncluded || [],
                productsWeUse: descObj.productsWeUse || [],
                productsNeededFromCustomer: descObj.productsNeededFromCustomer || []
            },
            basePrice: service.basePrice?.toString() || '',
            employeePayout: service.employeePayout?.toString() || '',
            cmpPayout: service.cmpPayout?.toString() || '',
            isInstant: service.isInstant || false,
            isActive: service.isActive !== undefined ? service.isActive : true,
            durationMins: service.durationMins?.toString() || '',
            categoryId: service.categoryId || '',
            imageUrl: service.imageUrl || ''
        });
        setImagePreview(service.imageUrl || null);
        setExistingImageUrls(service.imageUrls || []);
        setSelectedFiles([]);
        setImagePreviews([]);
        setOpenModal(true);
    };

    const handleEditCategory = (category: Category) => {
        setModalType('CATEGORY');
        setEditingItem(category);
        setFormData({
            name: category.name || '',
            title: '',
            description: category.description || '',
            descriptionObj: { shortDescription: '', description: '', whatsIncluded: [], whatsNotIncluded: [], productsWeUse: [], productsNeededFromCustomer: [] },
            basePrice: '',
            employeePayout: '',
            cmpPayout: '',
            isInstant: false,
            isActive: true,
            durationMins: '',
            categoryId: '',
            imageUrl: category.icon || ''
        });
        setImagePreview(category.icon || null);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setEditingItem(null);
        setImagePreview(null);
    };

    const [formData, setFormData] = React.useState({
        name: '',
        title: '',
        description: '',
        descriptionObj: {
            shortDescription: '',
            description: '',
            whatsIncluded: [] as string[],
            whatsNotIncluded: [] as string[],
            productsWeUse: [] as string[],
            productsNeededFromCustomer: [] as string[],
        },
        basePrice: '',
        employeePayout: '',
        cmpPayout: '',
        isInstant: false,
        isActive: true as boolean,
        durationMins: '',
        categoryId: '',
        imageUrl: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleDescriptionObjChange = (field: keyof typeof formData.descriptionObj, value: any) => {
        setFormData(prev => ({
            ...prev,
            descriptionObj: {
                ...prev.descriptionObj,
                [field]: value
            }
        }));
    };

    const handleArrayChange = (field: keyof typeof formData.descriptionObj, value: string) => {
        const arrayValue = value.split('\n').map(item => item.trim()).filter(item => item.length > 0);
        handleDescriptionObjChange(field, arrayValue);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (modalType === 'CATEGORY') {
            // Category: single icon upload
            const file = e.target.files?.[0];
            if (file) {
                setSelectedFile(file);
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagePreview(reader.result as string);
                };
                reader.readAsDataURL(file);
            }
        } else {
            // Service: multi-image upload
            const files = Array.from(e.target.files || []);
            if (files.length > 0) {
                setSelectedFiles((prev) => [...prev, ...files]);
                files.forEach((file) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        setImagePreviews((prev) => [...prev, { file, preview: reader.result as string }]);
                    };
                    reader.readAsDataURL(file);
                });
            }
        }
        // Reset input so same file can be selected again
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleRemoveNewImage = (indexToRemove: number) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== indexToRemove));
        setImagePreviews((prev) => prev.filter((_, i) => i !== indexToRemove));
    };

    const handleRemoveExistingImage = (indexToRemove: number) => {
        setExistingImageUrls((prev) => prev.filter((_, i) => i !== indexToRemove));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            if (modalType === 'SERVICE') {
                // Validate required fields
                if (!formData.categoryId) {
                    alert('Please select a category');
                    setIsSubmitting(false);
                    return;
                }

                // Build payload - categoryId is REQUIRED
                const payload: any = {
                    title: formData.title,
                    categoryId: formData.categoryId,
                    basePrice: Number(formData.basePrice) || 1,
                    employeePayout: Number(formData.employeePayout) || 0,
                    cmpPayout: Number(formData.cmpPayout) || 0,
                    isInstant: formData.isInstant || false,
                    isActive: formData.isActive,
                    durationMins: Number(formData.durationMins) || 15,
                    description: formData.descriptionObj,
                    imageUrls: existingImageUrls,
                };

                let serviceId = editingItem?.id;

                if (editingItem) {
                    await dispatch(updateService({ id: editingItem.id, payload }) as any);
                } else {
                    const result = await dispatch(createService(payload as any)).unwrap();
                    serviceId = result.data?.id || result.id;
                }

                // Upload new images if files were selected
                if (selectedFiles.length > 0 && serviceId) {
                    await dispatch(uploadServiceImages({ serviceId, files: selectedFiles }) as any);
                }
            } else {
                // Category payload
                const payload = {
                    name: formData.name,
                    slug: generateSlug(formData.name),
                    description: formData.description || undefined,
                };

                let categoryId = editingItem?.id;

                if (editingItem) {
                    await dispatch(updateCategory({ id: editingItem.id, payload }) as any);
                } else {
                    const result = await dispatch(createCategory(payload) as any).unwrap();
                    categoryId = result.data?.id || result.id;
                }

                // Upload icon if file was selected
                if (selectedFile && categoryId) {
                    await dispatch(uploadCategoryIcon({ categoryId, file: selectedFile }) as any);
                }
            }
        } finally {
            setIsSubmitting(false);
        }
        handleCloseModal();
        setFormData({ name: '', title: '', description: '', descriptionObj: { shortDescription: '', description: '', whatsIncluded: [], whatsNotIncluded: [], productsWeUse: [], productsNeededFromCustomer: [] }, basePrice: '', employeePayout: '', cmpPayout: '', isInstant: false, isActive: true, durationMins: '', categoryId: '', imageUrl: '' });
        setSelectedFile(null);
        setSelectedFiles([]);
        setImagePreviews([]);
        setExistingImageUrls([]);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 600, color: COLORS.charcoal }}>
                    Services & Categories
                </Typography>
                <PermissionGate permission={tabValue === 0 ? 'services.create' : 'services.create'}>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={tabValue === 0 ? handleAddService : handleAddCategory}
                    >
                        Add New {tabValue === 0 ? 'Service' : 'Category'}
                    </Button>
                </PermissionGate>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="services tabs">
                    <Tab label="Services" />
                    <Tab label="Categories" />
                </Tabs>
            </Box>

            {/* Services Tab */}
            <CustomTabPanel value={tabValue} index={0}>
                {loading ? (
                    <Typography>Loading services...</Typography>
                ) : (
                    <Grid container spacing={3}>
                        {services.map((service) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={service.id}>
                                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
                                    <CardMedia
                                        component="img"
                                        height="140"
                                        image={service.imageUrl || PLACEHOLDER_IMAGE}
                                        alt={service.title}
                                        sx={{ bgcolor: 'grey.100' }}
                                    />
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                            <Typography gutterBottom variant="h6" component="div">
                                                {service.title}
                                            </Typography>
                                            <Chip
                                                label={service.isActive ? 'Active' : 'Inactive'}
                                                size="small"
                                                color={service.isActive ? 'success' : 'default'}
                                            />
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            {(typeof service.description === 'object' && service.description?.shortDescription) 
                                              ? service.description.shortDescription 
                                              : 'No description available'}
                                        </Typography>
                                        <Stack direction="row" spacing={1} flexWrap="wrap">
                                            <Chip label={`₹${service.basePrice ?? 0}`} size="small" color="primary" variant="outlined" />
                                            <Chip label={`${service.durationMins ?? 0} mins`} size="small" variant="outlined" />
                                        </Stack>
                                        <Tooltip title="Click to copy service ID for CTA link">
                                            <Chip
                                                icon={<CopyIcon sx={{ fontSize: 14 }} />}
                                                label={`service:${service.id}`}
                                                size="small"
                                                variant="outlined"
                                                sx={{ mt: 1, fontSize: 11, maxWidth: '100%', cursor: 'pointer', color: 'text.secondary' }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigator.clipboard.writeText(`service:${service.id}`);
                                                }}
                                            />
                                        </Tooltip>
                                    </CardContent>
                                    <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                                        <PermissionGate permission="services.edit">
                                            <IconButton size="small" color="primary" onClick={() => handleEditService(service)}>
                                                <EditIcon />
                                            </IconButton>
                                        </PermissionGate>
                                        <PermissionGate permission="services.delete">
                                            <IconButton size="small" color="error">
                                                <DeleteIcon />
                                            </IconButton>
                                        </PermissionGate>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                        {services.length === 0 && (
                            <Grid size={{ xs: 12 }}>
                                <Paper sx={{ p: 5, textAlign: 'center' }}>
                                    <Typography color="text.secondary">No services found. Add one to get started.</Typography>
                                </Paper>
                            </Grid>
                        )}
                    </Grid>
                )}
            </CustomTabPanel>

            {/* Categories Tab */}
            <CustomTabPanel value={tabValue} index={1}>
                {loading ? (
                    <Typography>Loading categories...</Typography>
                ) : (
                    <Grid container spacing={3}>
                        {categories.map((category) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={category.id}>
                                <Paper sx={{ p: 3, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        {/* Category Icon/Image */}
                                        <Avatar
                                            src={category.icon}
                                            sx={{ width: 48, height: 48, bgcolor: 'primary.light' }}
                                        >
                                            {category.name?.[0] || 'C'}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h6">{category.name}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {category.isActive ? 'Active' : 'Inactive'}
                                            </Typography>
                                            <Tooltip title="Click to copy category ID for CTA link">
                                                <Chip
                                                    icon={<CopyIcon sx={{ fontSize: 12 }} />}
                                                    label={`category:${category.id}`}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ mt: 0.5, fontSize: 10, cursor: 'pointer', color: 'text.secondary' }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigator.clipboard.writeText(`category:${category.id}`);
                                                    }}
                                                />
                                            </Tooltip>
                                        </Box>
                                    </Box>
                                    <PermissionGate permission="services.edit">
                                        <IconButton size="small" onClick={() => handleEditCategory(category)}>
                                            <EditIcon />
                                        </IconButton>
                                    </PermissionGate>
                                </Paper>
                            </Grid>
                        ))}
                        {categories.length === 0 && (
                            <Grid size={{ xs: 12 }}>
                                <Paper sx={{ p: 5, textAlign: 'center' }}>
                                    <Typography color="text.secondary">No categories found.</Typography>
                                </Paper>
                            </Grid>
                        )}
                    </Grid>
                )}
            </CustomTabPanel>

            {/* Create/Edit Dialog */}
            <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingItem ? 'Edit' : 'Add New'} {modalType === 'SERVICE' ? 'Service' : 'Category'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {/* Image Upload Section */}
                        <Box sx={{ textAlign: 'center', mb: 2 }}>
                            <input
                                type="file"
                                accept="image/*"
                                multiple={modalType === 'SERVICE'}
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleImageUpload}
                            />
                            {modalType === 'SERVICE' ? (
                                /* Multi-image upload for services */
                                <Box>
                                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Service Images</Typography>
                                    {/* Existing images */}
                                    {existingImageUrls.length > 0 && (
                                        <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap', gap: 1 }}>
                                            {existingImageUrls.map((url, idx) => (
                                                <Box key={`existing-${idx}`} sx={{ position: 'relative', width: 80, height: 80 }}>
                                                    <img src={url} alt={`Image ${idx + 1}`} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }} />
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleRemoveExistingImage(idx)}
                                                        sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'error.main', color: 'white', '&:hover': { bgcolor: 'error.dark' }, width: 20, height: 20 }}
                                                    >
                                                        <DeleteIcon sx={{ fontSize: 14 }} />
                                                    </IconButton>
                                                </Box>
                                            ))}
                                        </Stack>
                                    )}
                                    {/* New image previews */}
                                    {imagePreviews.length > 0 && (
                                        <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap', gap: 1 }}>
                                            {imagePreviews.map((item, idx) => (
                                                <Box key={`new-${idx}`} sx={{ position: 'relative', width: 80, height: 80 }}>
                                                    <img src={item.preview} alt={`New ${idx + 1}`} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }} />
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleRemoveNewImage(idx)}
                                                        sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'error.main', color: 'white', '&:hover': { bgcolor: 'error.dark' }, width: 20, height: 20 }}
                                                    >
                                                        <DeleteIcon sx={{ fontSize: 14 }} />
                                                    </IconButton>
                                                </Box>
                                            ))}
                                        </Stack>
                                    )}
                                    <Box
                                        onClick={() => fileInputRef.current?.click()}
                                        sx={{ width: '100%', height: 80, border: '2px dashed', borderColor: 'grey.400', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', bgcolor: 'grey.100', '&:hover': { borderColor: 'primary.main', bgcolor: 'grey.200' } }}
                                    >
                                        <Box sx={{ textAlign: 'center', color: 'grey.600' }}>
                                            <CloudUploadIcon sx={{ fontSize: 28 }} />
                                            <Typography variant="caption" display="block">Click to add images</Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            ) : (
                                /* Single icon upload for categories */
                                <Box
                                    onClick={() => fileInputRef.current?.click()}
                                    sx={{ width: 100, height: 100, mx: 'auto', border: '2px dashed', borderColor: 'grey.400', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', bgcolor: 'grey.100', '&:hover': { borderColor: 'primary.main', bgcolor: 'grey.200' } }}
                                >
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <Box sx={{ textAlign: 'center', color: 'grey.600' }}>
                                            <CloudUploadIcon sx={{ fontSize: 32 }} />
                                            <Typography variant="caption" display="block">Upload Icon</Typography>
                                        </Box>
                                    )}
                                </Box>
                            )}
                        </Box>

                        {modalType === 'CATEGORY' ? (
                            <TextField
                                label="Category Name"
                                name="name"
                                fullWidth
                                value={formData.name}
                                onChange={handleInputChange}
                            />
                        ) : (
                            <TextField
                                label="Service Title"
                                name="title"
                                fullWidth
                                value={formData.title}
                                onChange={handleInputChange}
                            />
                        )}

                        {modalType === 'SERVICE' && (
                            <>
                                <TextField
                                    label="Base Price (₹)"
                                    name="basePrice"
                                    type="number"
                                    fullWidth
                                    value={formData.basePrice}
                                    onChange={handleInputChange}
                                    inputProps={{ min: 0 }}
                                />
                                <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                                    <TextField
                                        label="Employee Payout (₹)"
                                        name="employeePayout"
                                        type="number"
                                        fullWidth
                                        value={formData.employeePayout}
                                        onChange={handleInputChange}
                                        inputProps={{ min: 0 }}
                                    />
                                    <TextField
                                        name="cmpPayout"
                                        label="Our Payout"
                                        type="number"
                                        fullWidth
                                        value={formData.cmpPayout}
                                        onChange={handleInputChange}
                                        inputProps={{ min: 0 }}
                                    />
                                </Stack>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.isInstant}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, isInstant: e.target.checked }))}
                                            color="primary"
                                        />
                                    }
                                    label="Is Instant Service"
                                />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.isActive}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                            color="success"
                                        />
                                    }
                                    label="Visible to Customers"
                                />
                                <TextField
                                    label="Duration (mins)"
                                    name="durationMins"
                                    type="number"
                                    fullWidth
                                    value={formData.durationMins}
                                    onChange={handleInputChange}
                                    inputProps={{ min: 0 }}
                                />
                                <TextField
                                    select
                                    label="Category"
                                    name="categoryId"
                                    fullWidth
                                    value={formData.categoryId}
                                    onChange={handleInputChange}
                                >
                                    {categories.map((c) => (
                                        <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                                    ))}
                                </TextField>
                            </>
                        )}
                        
                        {modalType === 'CATEGORY' ? (
                            <TextField
                                label="Description"
                                name="description"
                                multiline
                                rows={3}
                                fullWidth
                                value={formData.description}
                                onChange={handleInputChange}
                            />
                        ) : (
                            <>
                                <Typography variant="subtitle2" sx={{ mt: 1 }}>Service Details</Typography>
                                <TextField
                                    label="Short Description"
                                    value={formData.descriptionObj.shortDescription}
                                    onChange={(e) => handleDescriptionObjChange('shortDescription', e.target.value)}
                                    fullWidth
                                    multiline
                                    rows={2}
                                />
                                <TextField
                                    label="Full Description"
                                    value={formData.descriptionObj.description}
                                    onChange={(e) => handleDescriptionObjChange('description', e.target.value)}
                                    fullWidth
                                    multiline
                                    rows={3}
                                />
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                    <TextField
                                        label="What's Included"
                                        value={formData.descriptionObj.whatsIncluded.join('\n')}
                                        onChange={(e) => handleArrayChange('whatsIncluded', e.target.value)}
                                        fullWidth
                                        multiline
                                        rows={3}
                                        placeholder="One item per line"
                                    />
                                    <TextField
                                        label="What's Not Included"
                                        value={formData.descriptionObj.whatsNotIncluded.join('\n')}
                                        onChange={(e) => handleArrayChange('whatsNotIncluded', e.target.value)}
                                        fullWidth
                                        multiline
                                        rows={3}
                                    />
                                </Stack>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                    <TextField
                                        label="Products We Use"
                                        value={formData.descriptionObj.productsWeUse.join('\n')}
                                        onChange={(e) => handleArrayChange('productsWeUse', e.target.value)}
                                        fullWidth
                                        multiline
                                        rows={3}
                                    />
                                    <TextField
                                        label="Products Needed"
                                        value={formData.descriptionObj.productsNeededFromCustomer.join('\n')}
                                        onChange={(e) => handleArrayChange('productsNeededFromCustomer', e.target.value)}
                                        fullWidth
                                        multiline
                                        rows={3}
                                    />
                                </Stack>
                            </>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : (editingItem ? 'Update' : 'Create')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ServicesPage;
