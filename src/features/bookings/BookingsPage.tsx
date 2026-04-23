import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    TextField,
    Stack,
    Button,
    Pagination,
    Tabs,
    Tab
} from '@mui/material';
import {
    Visibility as VisibilityIcon,
    Search as SearchIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { fetchBookings, setFilters, setPage } from '../../store/slices/bookingsSlice';
import { COLORS } from '../../theme/theme';



const BookingsPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { list, loading, pagination, filters } = useSelector((state: RootState) => state.bookings);
    const [searchTerm, setSearchTerm] = useState(filters.search);

    // Tabs configuration
    const TABS = [
        { value: 'ALL', label: 'All' },
        { value: 'PENDING', label: 'Pending' },
        { value: 'CONFIRMED', label: 'Confirmed' },
        { value: 'IN_PROGRESS', label: 'In Progress' },
        { value: 'COMPLETED', label: 'Completed' },
        { value: 'CANCELLED', label: 'Cancelled' },
        { value: 'ESCALATED', label: 'Escalated' },
    ];

    useEffect(() => {
        dispatch(fetchBookings({
            page: pagination.page,
            limit: pagination.limit,
            status: filters.status === 'ALL' ? undefined : filters.status,
            search: filters.search
        }));
    }, [dispatch, pagination.page, filters]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(setFilters({ search: searchTerm }));
    };

    const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
        dispatch(setFilters({ status: newValue }));
    };

    const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
        dispatch(setPage(value));
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'success';
            case 'IN_PROGRESS': return 'info';
            case 'CONFIRMED': return 'primary';
            case 'PENDING': return 'warning';
            case 'ESCALATED': return 'error';
            case 'CANCELLED': return 'default';
            default: return 'default';
        }
    };

    const getAssignedBuddyName = (booking: any) => {
        if (!booking.assignments || booking.assignments.length === 0) return 'Unassigned';
        const active = booking.assignments.find((a: any) => a.status !== 'REJECTED' && a.status !== 'CANCELLED');
        return active?.buddy?.user?.name || 'Unassigned';
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 600, color: COLORS.charcoal }}>
                    Bookings
                </Typography>
            </Box>

            {/* Filters & Tabs */}
            <Paper sx={{ mb: 3, borderRadius: 2 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 2 }}>
                    <Tabs
                        value={filters.status || 'ALL'}
                        onChange={handleTabChange}
                        variant="scrollable"
                        scrollButtons="auto"
                    >
                        {TABS.map((tab) => (
                            <Tab key={tab.value} label={tab.label} value={tab.value} />
                        ))}
                    </Tabs>
                </Box>
                <Box sx={{ p: 2 }}>
                    <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', gap: 1, maxWidth: 600 }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search by Customer Name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                            }}
                        />
                        <Button variant="contained" type="submit">Search</Button>
                    </Box>
                </Box>
            </Paper>

            {/* Bookings Table */}
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead sx={{ bgcolor: COLORS.bgLight }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Service</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Buddy</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Scheduled</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                                    <Typography>Loading bookings...</Typography>
                                </TableCell>
                            </TableRow>
                        ) : list.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                                    <Typography color="text.secondary">No bookings found</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            list.map((booking) => (
                                <TableRow key={booking.id} hover>
                                    <TableCell>#{booking.id.substring(0, 8)}</TableCell>
                                    <TableCell>
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <Typography variant="body2">{booking.user?.name || 'Unknown'}</Typography>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>{booking.service?.title || 'Unknown Service'}</TableCell>
                                    <TableCell>
                                        {getAssignedBuddyName(booking)}
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{dayjs(booking.scheduledStart).format('MMM D, YYYY')}</Typography>
                                        <Typography variant="caption" color="text.secondary">{dayjs(booking.scheduledStart).format('h:mm A')}</Typography>
                                    </TableCell>
                                    <TableCell>₹{booking.totalAmount}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={booking.status}
                                            color={getStatusColor(booking.status) as any}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <IconButton size="small" onClick={() => navigate(`/bookings/${booking.id}`)}>
                                            <VisibilityIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Pagination */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 2 }}>
                <Pagination
                    count={Math.ceil(pagination.total / pagination.limit)}
                    page={pagination.page}
                    onChange={handlePageChange}
                    color="primary"
                />
            </Box>
        </Box>
    );
};

export default BookingsPage;
