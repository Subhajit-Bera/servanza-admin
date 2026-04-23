import React, { useEffect, useState } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Avatar,
    Chip,
    IconButton,
    TextField,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Pagination,
    Stack,
    LinearProgress,
    Checkbox,
    Button,
    Tooltip,
    Snackbar,
    Alert,
} from '@mui/material';
import {
    Visibility as ViewIcon,
    Search as SearchIcon,
    Star as StarIcon,
    CheckCircle as VerifiedIcon,
    Pending as PendingIcon,
    LocationOn as LocationIcon,
    Block as BlockIcon,
    CheckCircleOutline as ActivateIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchBuddies } from '../../store/slices/buddiesSlice';
import { COLORS } from '../../theme';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { PermissionGate } from '../../components/common/PermissionGate';
import BuddyLocationModal from './BuddyLocationModal';
import type { Buddy } from '../../api/types';

interface BuddiesPageProps {
    initialStatus?: string;
    initialVerification?: string;
}

const BuddiesPage: React.FC<BuddiesPageProps> = ({ initialStatus = 'all', initialVerification = 'all' }) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { list, loading, pagination } = useAppSelector((state) => state.buddies);

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
    const [verificationFilter, setVerificationFilter] = useState<string>(initialVerification);
    const [page, setPage] = useState(1);

    // Bulk selection state
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    // Location modal state
    const [locationModalOpen, setLocationModalOpen] = useState(false);
    const [selectedBuddyForLocation, setSelectedBuddyForLocation] = useState<Buddy | null>(null);

    // Sync props with state when route changes
    useEffect(() => {
        setStatusFilter(initialStatus);
        setVerificationFilter(initialVerification);
        setPage(1); // Reset page on filter change
    }, [initialStatus, initialVerification]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData();
        }, 500);
        return () => clearTimeout(timer);
    }, [search, page, statusFilter, verificationFilter]);

    // Clear selection when data changes
    useEffect(() => {
        setSelectedIds([]);
    }, [list]);

    const fetchData = () => {
        const params: any = { page, limit: 10, search };
        if (verificationFilter !== 'all') {
            params.isVerified = verificationFilter === 'verified';
        }
        if (statusFilter !== 'all') {
            params.isAvailable = statusFilter === 'available';
        }
        dispatch(fetchBuddies(params));
    };

    const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    // Bulk selection handlers
    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            setSelectedIds(list.map((buddy) => buddy.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (buddyId: string) => {
        setSelectedIds((prev) =>
            prev.includes(buddyId)
                ? prev.filter((id) => id !== buddyId)
                : [...prev, buddyId]
        );
    };

    const isSelected = (buddyId: string) => selectedIds.includes(buddyId);
    const isAllSelected = list.length > 0 && selectedIds.length === list.length;
    const isIndeterminate = selectedIds.length > 0 && selectedIds.length < list.length;

    // Bulk action placeholder - backend endpoint needed
    const handleBulkAction = async (action: 'activate' | 'deactivate') => {
        // Note: This would require a backend endpoint to toggle buddy availability
        setSnackbar({
            open: true,
            message: `${action === 'activate' ? 'Activation' : 'Deactivation'} of ${selectedIds.length} buddies would require backend support`,
            severity: 'info' as any,
        });
        setSelectedIds([]);
    };

    // Location modal handlers
    const handleViewLocation = (buddy: Buddy) => {
        setSelectedBuddyForLocation(buddy);
        setLocationModalOpen(true);
    };

    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h1">Buddies</Typography>
                <Typography variant="body1" color="text.secondary">
                    Manage service providers and their verification status
                </Typography>
            </Box>

            {/* Filters */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                    <TextField
                        size="small"
                        placeholder="Search buddies..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ flex: 1 }}
                    />
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Verification</InputLabel>
                        <Select
                            value={verificationFilter}
                            label="Verification"
                            onChange={(e) => setVerificationFilter(e.target.value)}
                        >
                            <MenuItem value="all">All</MenuItem>
                            <MenuItem value="verified">Verified</MenuItem>
                            <MenuItem value="pending">Pending</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Availability</InputLabel>
                        <Select
                            value={statusFilter}
                            label="Availability"
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <MenuItem value="all">All</MenuItem>
                            <MenuItem value="available">Available</MenuItem>
                            <MenuItem value="unavailable">Unavailable</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Bulk Actions Toolbar */}
                    {selectedIds.length > 0 && (
                        <PermissionGate permission="buddies.verify">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                    {selectedIds.length} selected
                                </Typography>
                                <Button
                                    size="small"
                                    variant="outlined"
                                    color="success"
                                    startIcon={<ActivateIcon />}
                                    onClick={() => handleBulkAction('activate')}
                                >
                                    Activate
                                </Button>
                                <Button
                                    size="small"
                                    variant="outlined"
                                    color="error"
                                    startIcon={<BlockIcon />}
                                    onClick={() => handleBulkAction('deactivate')}
                                >
                                    Deactivate
                                </Button>
                            </Box>
                        </PermissionGate>
                    )}
                </Stack>
            </Paper>

            {/* Table */}
            <Paper sx={{ width: '100%', mb: 2, overflow: 'hidden' }}>
                {loading && <LinearProgress />}
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox">
                                    <PermissionGate permission="buddies.verify">
                                        <Checkbox
                                            indeterminate={isIndeterminate}
                                            checked={isAllSelected}
                                            onChange={handleSelectAll}
                                        />
                                    </PermissionGate>
                                </TableCell>
                                <TableCell>Buddy</TableCell>
                                <TableCell>Contact</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Verification</TableCell>
                                <TableCell>Rating</TableCell>
                                <TableCell align="right">Jobs / Earnings</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {list.map((buddy) => (
                                <TableRow key={buddy.id} hover selected={isSelected(buddy.id)}>
                                    <TableCell padding="checkbox">
                                        <PermissionGate permission="buddies.verify">
                                            <Checkbox
                                                checked={isSelected(buddy.id)}
                                                onChange={() => handleSelectOne(buddy.id)}
                                            />
                                        </PermissionGate>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar
                                                src={buddy.user.profileImage}
                                                sx={{ bgcolor: COLORS.primary }}
                                            >
                                                {buddy.user.name?.charAt(0)}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle2">
                                                    {buddy.user.name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Joined {dayjs(buddy.createdAt).format('MMM YYYY')}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{buddy.user.email}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {buddy.user.phone}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={buddy.isOnline ? 'Online' : 'Offline'}
                                            size="small"
                                            sx={{
                                                bgcolor: buddy.isOnline ? `${COLORS.success}20` : `${COLORS.mediumGray}20`,
                                                color: buddy.isOnline ? COLORS.success : COLORS.mediumGray,
                                                mr: 1
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            icon={buddy.isVerified ? <VerifiedIcon sx={{ fontSize: '16px !important' }} /> : <PendingIcon sx={{ fontSize: '16px !important' }} />}
                                            label={buddy.isVerified ? 'Verified' : 'Pending'}
                                            size="small"
                                            color={buddy.isVerified ? 'success' : 'warning'}
                                            variant={buddy.isVerified ? 'filled' : 'outlined'}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <StarIcon sx={{ fontSize: 16, color: COLORS.warning }} />
                                            <Typography variant="body2" fontWeight="bold">
                                                {buddy.rating.toFixed(1)}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography variant="body2" fontWeight="bold">
                                            {buddy.totalJobs} Jobs
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            ₹{buddy.totalEarnings.toLocaleString()}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="View Location">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleViewLocation(buddy)}
                                                color="secondary"
                                            >
                                                <LocationIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="View Details">
                                            <IconButton
                                                onClick={() => navigate(`/buddies/${buddy.id}`)}
                                                color="primary"
                                            >
                                                <ViewIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!loading && list.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} align="center">
                                        <Typography sx={{ py: 3, color: 'text.secondary' }}>
                                            No buddies found matching current filters
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {pagination.total > 0 && (
                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Pagination
                            count={pagination.pages}
                            page={page}
                            onChange={handlePageChange}
                            color="primary"
                        />
                    </Box>
                )}
            </Paper>

            {/* Location Modal */}
            <BuddyLocationModal
                open={locationModalOpen}
                onClose={() => setLocationModalOpen(false)}
                buddyName={selectedBuddyForLocation?.user.name || ''}
                latitude={(selectedBuddyForLocation as any)?.latitude}
                longitude={(selectedBuddyForLocation as any)?.longitude}
                phone={selectedBuddyForLocation?.user.phone}
            />

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

export default BuddiesPage;
