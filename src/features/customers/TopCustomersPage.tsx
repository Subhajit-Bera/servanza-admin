import React, { useEffect } from 'react';
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
    LinearProgress,
} from '@mui/material';
import {
    Visibility as ViewIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchCustomers } from '../../store/slices/customersSlice';
import { COLORS } from '../../theme';
import dayjs from 'dayjs';

const TopCustomersPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { list, loading } = useAppSelector((state) => state.customers);

    useEffect(() => {
        // Fetch customers sorted by bookings count (descending)
        dispatch(fetchCustomers({
            page: 1,
            limit: 20,
            sortBy: 'bookings',
            sortOrder: 'desc'
        }));
    }, [dispatch]);

    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h1">Top Customers</Typography>
                <Typography variant="body1" color="text.secondary">
                    Highest value customers by booking volume
                </Typography>
            </Box>

            <Paper sx={{ width: '100%', mb: 2 }}>
                {loading && <LinearProgress />}
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Rank</TableCell>
                                <TableCell>Customer</TableCell>
                                <TableCell>Contact Info</TableCell>
                                <TableCell align="center">Total Bookings</TableCell>
                                <TableCell align="center">Join Date</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {list.map((customer, index) => (
                                <TableRow key={customer.id} hover>
                                    <TableCell>
                                        <Box
                                            sx={{
                                                width: 28,
                                                height: 28,
                                                borderRadius: '50%',
                                                bgcolor: index < 3 ? COLORS.primary : COLORS.lightGray,
                                                color: index < 3 ? COLORS.white : COLORS.charcoal,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 'bold',
                                                fontSize: 12,
                                            }}
                                        >
                                            {index + 1}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar
                                                src={customer.profileImage}
                                                sx={{ bgcolor: COLORS.primary }}
                                            >
                                                {customer.name?.charAt(0)}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle2">
                                                    {customer.name}
                                                </Typography>
                                                <Chip
                                                    label={customer.role || 'USER'}
                                                    size="small"
                                                    sx={{
                                                        height: 20,
                                                        fontSize: 10,
                                                        bgcolor: COLORS.lightGreen,
                                                        color: COLORS.primary
                                                    }}
                                                />
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{customer.email}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {customer.phone}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={`${customer._count?.bookings || 0} Bookings`}
                                            color="primary"
                                            variant={index < 3 ? "filled" : "outlined"}
                                            sx={{ fontWeight: 'bold' }}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        {dayjs(customer.createdAt).format('MMM D, YYYY')}
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton
                                            onClick={() => navigate(`/customers/${customer.id}`)}
                                            color="primary"
                                        >
                                            <ViewIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!loading && list.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        <Typography sx={{ py: 3, color: 'text.secondary' }}>
                                            No customers found
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
};

export default TopCustomersPage;
