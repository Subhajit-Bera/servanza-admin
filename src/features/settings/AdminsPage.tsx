import React, { useEffect, useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    CircularProgress,
    Alert,
    Snackbar,
    Avatar,
    Stack,
    Tooltip,
    Switch,
    FormControlLabel,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Person as PersonIcon,
    Shield as ShieldIcon,
} from '@mui/icons-material';
import { useAppSelector } from '../../store/hooks';
import { usePermission } from '../../components/common/PermissionGate';
import {
    ROLE_DISPLAY_NAMES,
    ROLE_DESCRIPTIONS,
    ROLE_COLORS
} from '../../config/permissions';
import type { AdminRole } from '../../config/permissions';
import client from '../../api/client';
import dayjs from 'dayjs';

interface Admin {
    id: string;
    name: string;
    email: string;
    phone?: string;
    adminRole: AdminRole;
    isActive: boolean;
    createdAt: string;
    lastLoginAt?: string;
    profileImage?: string;
}

interface AdminFormData {
    name: string;
    email: string;
    phone: string;
    password: string;
    adminRole: AdminRole;
    isActive: boolean;
}

const initialFormData: AdminFormData = {
    name: '',
    email: '',
    phone: '',
    password: '',
    adminRole: 'SUPPORT_AGENT',
    isActive: true,
};

const AdminsPage: React.FC = () => {
    const { isSuperAdmin } = usePermission();
    const currentUser = useAppSelector((state) => state.auth.user);

    const [admins, setAdmins] = useState<Admin[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [total, setTotal] = useState(0);

    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
    const [formData, setFormData] = useState<AdminFormData>(initialFormData);
    const [saving, setSaving] = useState(false);

    // Delete dialog
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [adminToDelete, setAdminToDelete] = useState<Admin | null>(null);

    // Snackbar
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    useEffect(() => {
        fetchAdmins();
    }, [page, rowsPerPage]);

    const fetchAdmins = async () => {
        setLoading(true);
        try {
            const response = await client.get('/admin/admins', {
                params: { page: page + 1, limit: rowsPerPage },
            });
            setAdmins(response.data.data.admins);
            setTotal(response.data.data.pagination.total);
        } catch (error) {
            console.error('Failed to fetch admins:', error);
            setSnackbar({ open: true, message: 'Failed to fetch admins', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (admin?: Admin) => {
        if (admin) {
            setEditingAdmin(admin);
            setFormData({
                name: admin.name,
                email: admin.email,
                phone: admin.phone || '',
                password: '',
                adminRole: admin.adminRole,
                isActive: admin.isActive,
            });
        } else {
            setEditingAdmin(null);
            setFormData(initialFormData);
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingAdmin(null);
        setFormData(initialFormData);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (editingAdmin) {
                // Update
                const updateData: any = { ...formData };
                if (!updateData.password) delete updateData.password;
                await client.put(`/admin/admins/${editingAdmin.id}`, updateData);
                setSnackbar({ open: true, message: 'Admin updated successfully', severity: 'success' });
            } else {
                // Create
                await client.post('/admin/admins', formData);
                setSnackbar({ open: true, message: 'Admin created successfully', severity: 'success' });
            }
            handleCloseDialog();
            fetchAdmins();
        } catch (error: any) {
            setSnackbar({
                open: true,
                message: error.response?.data?.message || 'Failed to save admin',
                severity: 'error'
            });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!adminToDelete) return;

        try {
            await client.delete(`/admin/admins/${adminToDelete.id}`);
            setSnackbar({ open: true, message: 'Admin deleted successfully', severity: 'success' });
            setDeleteDialogOpen(false);
            setAdminToDelete(null);
            fetchAdmins();
        } catch (error: any) {
            setSnackbar({
                open: true,
                message: error.response?.data?.message || 'Failed to delete admin',
                severity: 'error'
            });
        }
    };

    const getRoleChip = (role: AdminRole) => (
        <Chip
            label={ROLE_DISPLAY_NAMES[role]}
            size="small"
            sx={{
                bgcolor: ROLE_COLORS[role] + '20',
                color: ROLE_COLORS[role],
                fontWeight: 600,
                border: `1px solid ${ROLE_COLORS[role]}40`,
            }}
        />
    );

    if (!isSuperAdmin) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <ShieldIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h5" color="text.secondary">
                    Access Denied
                </Typography>
                <Typography color="text.disabled">
                    Only Super Admins can manage admin users.
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h1">Admin Management</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage admin users and their roles
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Add Admin
                </Button>
            </Box>

            {/* Role Legend */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Role Descriptions</Typography>
                <Stack direction="row" spacing={2} flexWrap="wrap">
                    {(Object.keys(ROLE_DISPLAY_NAMES) as AdminRole[]).map((role) => (
                        <Tooltip key={role} title={ROLE_DESCRIPTIONS[role]} arrow>
                            <Box>{getRoleChip(role)}</Box>
                        </Tooltip>
                    ))}
                </Stack>
            </Paper>

            {/* Admins Table */}
            <Paper>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Admin</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Role</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Last Login</TableCell>
                                <TableCell>Created</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : admins.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                        <Typography color="text.secondary">No admins found</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                admins.map((admin) => (
                                    <TableRow key={admin.id} hover>
                                        <TableCell>
                                            <Stack direction="row" alignItems="center" spacing={2}>
                                                <Avatar src={admin.profileImage}>
                                                    <PersonIcon />
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {admin.name}
                                                    </Typography>
                                                    {admin.phone && (
                                                        <Typography variant="caption" color="text.secondary">
                                                            {admin.phone}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>{admin.email}</TableCell>
                                        <TableCell>{getRoleChip(admin.adminRole)}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={admin.isActive ? 'Active' : 'Inactive'}
                                                size="small"
                                                color={admin.isActive ? 'success' : 'default'}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {admin.lastLoginAt
                                                ? dayjs(admin.lastLoginAt).format('MMM D, YYYY h:mm A')
                                                : '-'
                                            }
                                        </TableCell>
                                        <TableCell>
                                            {dayjs(admin.createdAt).format('MMM D, YYYY')}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Edit">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleOpenDialog(admin)}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => {
                                                        setAdminToDelete(admin);
                                                        setDeleteDialogOpen(true);
                                                    }}
                                                    disabled={admin.id === currentUser?.id}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    component="div"
                    count={total}
                    page={page}
                    onPageChange={(_, p) => setPage(p)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                />
            </Paper>

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingAdmin ? 'Edit Admin' : 'Create Admin'}
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <TextField
                            label="Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            fullWidth
                            required
                        />
                        <TextField
                            label="Email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            fullWidth
                            required
                        />
                        <TextField
                            label="Phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label={editingAdmin ? "New Password (leave blank to keep)" : "Password"}
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            fullWidth
                            required={!editingAdmin}
                        />
                        <FormControl fullWidth>
                            <InputLabel>Role</InputLabel>
                            <Select
                                value={formData.adminRole}
                                label="Role"
                                onChange={(e) => setFormData({ ...formData, adminRole: e.target.value as AdminRole })}
                            >
                                {(Object.keys(ROLE_DISPLAY_NAMES) as AdminRole[]).map((role) => (
                                    <MenuItem key={role} value={role}>
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <Box
                                                sx={{
                                                    width: 12,
                                                    height: 12,
                                                    borderRadius: '50%',
                                                    bgcolor: ROLE_COLORS[role],
                                                }}
                                            />
                                            <span>{ROLE_DISPLAY_NAMES[role]}</span>
                                        </Stack>
                                    </MenuItem>
                                ))}
                            </Select>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                                {ROLE_DESCRIPTIONS[formData.adminRole]}
                            </Typography>
                        </FormControl>
                        {editingAdmin && (
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    />
                                }
                                label="Active"
                            />
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={saving || !formData.name || !formData.email || (!editingAdmin && !formData.password)}
                    >
                        {saving ? <CircularProgress size={20} /> : (editingAdmin ? 'Update' : 'Create')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Delete Admin</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete <strong>{adminToDelete?.name}</strong>?
                        This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
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
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AdminsPage;
