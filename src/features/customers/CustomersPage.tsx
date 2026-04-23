import React, { useEffect, useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    InputAdornment,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Avatar,
    IconButton,
    Tooltip,
    Skeleton,
    Alert,
    Checkbox,
    Button,
    Snackbar,
} from '@mui/material';
import {
    Search as SearchIcon,
    Visibility as ViewIcon,
    Block as BlockIcon,
    CheckCircle as ActivateIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchCustomers, toggleCustomerStatus } from '../../store/slices/customersSlice';
import { COLORS, SHADOWS } from '../../theme';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { PermissionGate } from '../../components/common/PermissionGate';

const CustomersPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { list, loading, pagination, error } = useAppSelector((state) => state.customers);

    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0); // MUI TablePagination is 0-indexed
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Bulk selection state
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [bulkActionLoading, setBulkActionLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            dispatch(fetchCustomers({ page: page + 1, limit: rowsPerPage, search: searchTerm }));
        }, 500);
        return () => clearTimeout(timer);
    }, [dispatch, page, rowsPerPage, searchTerm]);

    // Clear selection when data changes
    useEffect(() => {
        setSelectedIds([]);
    }, [list]);

    const handleChangePage = (_: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Bulk selection handlers
    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            setSelectedIds(list.map((customer) => customer.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (customerId: string) => {
        setSelectedIds((prev) =>
            prev.includes(customerId)
                ? prev.filter((id) => id !== customerId)
                : [...prev, customerId]
        );
    };

    const isSelected = (customerId: string) => selectedIds.includes(customerId);
    const isAllSelected = list.length > 0 && selectedIds.length === list.length;
    const isIndeterminate = selectedIds.length > 0 && selectedIds.length < list.length;

    // Bulk action handlers
    const handleBulkAction = async (activate: boolean) => {
        setBulkActionLoading(true);
        try {
            // Execute all status toggles
            await Promise.all(
                selectedIds.map((id) =>
                    dispatch(toggleCustomerStatus({ id, isActive: activate })).unwrap()
                )
            );
            setSnackbar({
                open: true,
                message: `Successfully ${activate ? 'activated' : 'deactivated'} ${selectedIds.length} customer(s)`,
                severity: 'success',
            });
            setSelectedIds([]);
            // Refresh list
            dispatch(fetchCustomers({ page: page + 1, limit: rowsPerPage, search: searchTerm }));
        } catch (err: any) {
            setSnackbar({
                open: true,
                message: err || 'Failed to update some customers',
                severity: 'error',
            });
        } finally {
            setBulkActionLoading(false);
        }
    };

    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h1" sx={{ mb: 1 }}>Customers</Typography>
                <Typography variant="body1" color="text.secondary">
                    Manage your customer base
                </Typography>
            </Box>

            <Card sx={{ boxShadow: SHADOWS.light }}>
                <CardContent sx={{ p: 0 }}>
                    {/* Toolbar */}
                    <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${COLORS.lightGray}` }}>
                        <TextField
                            placeholder="Search by name, email, or phone..."
                            variant="outlined"
                            size="small"
                            sx={{ width: 300 }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon color="action" />
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />

                        {/* Bulk Actions Toolbar */}
                        {selectedIds.length > 0 && (
                            <PermissionGate permission="users.edit">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        {selectedIds.length} selected
                                    </Typography>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        color="success"
                                        startIcon={<ActivateIcon />}
                                        onClick={() => handleBulkAction(true)}
                                        disabled={bulkActionLoading}
                                    >
                                        Activate Selected
                                    </Button>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        color="error"
                                        startIcon={<BlockIcon />}
                                        onClick={() => handleBulkAction(false)}
                                        disabled={bulkActionLoading}
                                    >
                                        Deactivate Selected
                                    </Button>
                                </Box>
                            </PermissionGate>
                        )}
                    </Box>

                    {error && <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>}

                    <TableContainer>
                        <Table>
                            <TableHead sx={{ bgcolor: COLORS.offWhite }}>
                                <TableRow>
                                    <TableCell padding="checkbox">
                                        <PermissionGate permission="users.edit">
                                            <Checkbox
                                                indeterminate={isIndeterminate}
                                                checked={isAllSelected}
                                                onChange={handleSelectAll}
                                            />
                                        </PermissionGate>
                                    </TableCell>
                                    <TableCell>Customer</TableCell>
                                    <TableCell>Contact Info</TableCell>
                                    <TableCell>Joined</TableCell>
                                    <TableCell>Total Bookings</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading && (!list || list.length === 0) ? (
                                    [...Array(5)].map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton variant="text" /></TableCell>
                                            <TableCell><Skeleton variant="text" /></TableCell>
                                            <TableCell><Skeleton variant="text" /></TableCell>
                                            <TableCell><Skeleton variant="text" /></TableCell>
                                            <TableCell><Skeleton variant="text" /></TableCell>
                                            <TableCell><Skeleton variant="text" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : list && list.length > 0 ? (
                                    list.map((customer) => (
                                        <TableRow key={customer.id} hover selected={isSelected(customer.id)}>
                                            <TableCell padding="checkbox">
                                                <PermissionGate permission="users.edit">
                                                    <Checkbox
                                                        checked={isSelected(customer.id)}
                                                        onChange={() => handleSelectOne(customer.id)}
                                                    />
                                                </PermissionGate>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Avatar src={customer.profileImage} sx={{ bgcolor: COLORS.primary }}>
                                                        {customer.name?.charAt(0)}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="subtitle2" fontWeight={600}>
                                                            {customer.name}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">{customer.email}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {customer.phone}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {dayjs(customer.createdAt).format('MMM D, YYYY')}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {customer._count?.bookings || 0}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Tooltip title="View Details">
                                                    <IconButton
                                                        color="primary"
                                                        onClick={() => navigate(`/customers/${customer.id}`)}
                                                    >
                                                        <ViewIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                            <Typography color="text.secondary">No customers found</Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={pagination?.total || 0}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </CardContent>
            </Card>

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

export default CustomersPage;
