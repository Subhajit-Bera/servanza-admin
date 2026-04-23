import React, { useEffect, useState, useRef } from 'react';
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
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Avatar,
    Tooltip,
    Skeleton,
    Alert,
    Snackbar,
    Stack,
    Paper,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Category as CategoryIcon,
    CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
    fetchCategories,
    fetchServices,
    createCategory,
    updateCategory,
    deleteCategory,
    uploadCategoryIcon
} from '../../store/slices/servicesSlice';
import { COLORS, SHADOWS } from '../../theme';

interface CategoryForm {
    name: string;
    slug: string;
    description: string;
}

const CategoriesPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const { categories, services, loading } = useAppSelector((state) => state.services);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<any>(null);
    const [formData, setFormData] = useState<CategoryForm>({
        name: '',
        slug: '',
        description: '',
    });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    useEffect(() => {
        dispatch(fetchCategories());
        dispatch(fetchServices());
    }, [dispatch]);

    // Helper function to get service count for a category
    const getServiceCount = (categoryId: string): number => {
        return services.filter(s => s.categoryId === categoryId).length;
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

    const handleOpenDialog = (category?: any) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name || '',
                slug: category.slug || '',
                description: category.description || '',
            });
            setImagePreview(category.icon || null);
        } else {
            setEditingCategory(null);
            setFormData({ name: '', slug: '', description: '' });
            setImagePreview(null);
        }
        setSelectedFile(null);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingCategory(null);
        setFormData({ name: '', slug: '', description: '' });
        setSelectedFile(null);
        setImagePreview(null);
    };

    const generateSlug = (name: string) => {
        return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        setFormData({
            ...formData,
            name,
            slug: generateSlug(name),
        });
    };

    const handleSubmit = async () => {
        try {
            let categoryId: string | null = null;

            if (editingCategory) {
                await dispatch(updateCategory({
                    id: editingCategory.id,
                    payload: formData,
                })).unwrap();
                categoryId = editingCategory.id;
                setSnackbar({ open: true, message: 'Category updated successfully!', severity: 'success' });
            } else {
                const result = await dispatch(createCategory(formData)).unwrap();
                categoryId = result?.data?.id || result?.id;
                setSnackbar({ open: true, message: 'Category created successfully!', severity: 'success' });
            }

            // Upload icon if a new file was selected
            if (selectedFile && categoryId) {
                try {
                    await dispatch(uploadCategoryIcon({ categoryId, file: selectedFile })).unwrap();
                } catch (iconError) {
                    console.error('Icon upload failed:', iconError);
                }
            }

            handleCloseDialog();
            dispatch(fetchCategories());
        } catch (error: any) {
            setSnackbar({ open: true, message: error || 'Operation failed', severity: 'error' });
        }
    };

    const handleDeleteClick = (category: any) => {
        setCategoryToDelete(category);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (categoryToDelete) {
            try {
                await dispatch(deleteCategory(categoryToDelete.id)).unwrap();
                setSnackbar({ open: true, message: 'Category deleted successfully!', severity: 'success' });
                setDeleteDialogOpen(false);
                setCategoryToDelete(null);
            } catch (error: any) {
                setSnackbar({ open: true, message: error || 'Failed to delete category', severity: 'error' });
            }
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h1" sx={{ mb: 1 }}>Categories</Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage service categories
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Add Category
                </Button>
            </Box>

            <Card sx={{ boxShadow: SHADOWS.light }}>
                <CardContent sx={{ p: 0 }}>
                    <TableContainer>
                        <Table>
                            <TableHead sx={{ bgcolor: COLORS.offWhite }}>
                                <TableRow>
                                    <TableCell>Category</TableCell>
                                    <TableCell>Slug</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell>Services</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton variant="text" /></TableCell>
                                            <TableCell><Skeleton variant="text" /></TableCell>
                                            <TableCell><Skeleton variant="text" /></TableCell>
                                            <TableCell><Skeleton variant="text" /></TableCell>
                                            <TableCell><Skeleton variant="text" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : categories && categories.length > 0 ? (
                                    categories.map((category) => (
                                        <TableRow key={category.id} hover>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Avatar
                                                        src={category.icon}
                                                        sx={{ bgcolor: COLORS.primary }}
                                                    >
                                                        <CategoryIcon />
                                                    </Avatar>
                                                    <Typography variant="subtitle2" fontWeight={600}>
                                                        {category.name}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="text.secondary">
                                                    {category.slug}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{
                                                    maxWidth: 300,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}>
                                                    {category.description || '-'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {getServiceCount(category.id)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Tooltip title="Edit">
                                                    <IconButton
                                                        color="primary"
                                                        onClick={() => handleOpenDialog(category)}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <IconButton
                                                        color="error"
                                                        onClick={() => handleDeleteClick(category)}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                            <Typography color="text.secondary">No categories found</Typography>
                                            <Button
                                                variant="outlined"
                                                startIcon={<AddIcon />}
                                                onClick={() => handleOpenDialog()}
                                                sx={{ mt: 2 }}
                                            >
                                                Create First Category
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingCategory ? 'Edit Category' : 'Create Category'}
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 2 }}>
                        <TextField
                            label="Category Name"
                            value={formData.name}
                            onChange={handleNameChange}
                            fullWidth
                            required
                        />
                        <TextField
                            label="Slug"
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                            fullWidth
                            helperText="Auto-generated from name, but can be customized"
                        />
                        <TextField
                            label="Description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            fullWidth
                            multiline
                            rows={3}
                        />

                        {/* Icon Upload */}
                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>Category Icon</Typography>
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
                                    <Avatar
                                        src={imagePreview}
                                        sx={{ width: 56, height: 56, bgcolor: COLORS.primary }}
                                    >
                                        <CategoryIcon />
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="body2" fontWeight={600}>
                                            {selectedFile?.name || 'Current icon'}
                                        </Typography>
                                        {selectedFile && (
                                            <Typography variant="caption" color="text.secondary">
                                                {`${(selectedFile.size / 1024).toFixed(1)} KB`}
                                            </Typography>
                                        )}
                                    </Box>
                                    <Button
                                        color="error"
                                        size="small"
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
                                        p: 3,
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
                                    <CloudUploadIcon sx={{ fontSize: 36, color: COLORS.primary, mb: 1 }} />
                                    <Typography variant="body2" fontWeight={600}>
                                        Click to upload icon
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        PNG, JPG up to 2MB
                                    </Typography>
                                </Paper>
                            )}
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={!formData.name.trim()}
                    >
                        {editingCategory ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Delete Category</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete "{categoryToDelete?.name}"?
                        This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleConfirmDelete}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

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

export default CategoriesPage;
