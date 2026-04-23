import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Avatar,
    Chip,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Skeleton,
    Button,
    Switch,
} from '@mui/material';
import {
    ArrowBack,
    Email,
    Phone,
    CalendarToday,
    LocationOn,
} from '@mui/icons-material';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { usePermission } from '../../components/common/PermissionGate';
import { fetchCustomerById, toggleCustomerStatus } from '../../store/slices/customersSlice';
import { COLORS, SHADOWS } from '../../theme';
import dayjs from 'dayjs';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`customer-tabpanel-${index}`}
            aria-labelledby={`customer-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const CustomerDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { selectedCustomer, loading } = useAppSelector((state) => state.customers);
    const { can } = usePermission();
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        if (id) {
            dispatch(fetchCustomerById(id));
        }
    }, [dispatch, id]);

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleToggleStatus = () => {
        if (selectedCustomer) {
            dispatch(toggleCustomerStatus({ id: selectedCustomer.id, isActive: !selectedCustomer.isActive }));
        }
    };

    if (loading && !selectedCustomer) {
        return (
            <Box sx={{ p: 3 }}>
                <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
                <Skeleton variant="rectangular" height={400} />
            </Box>
        );
    }

    if (!selectedCustomer) {
        return <Typography>Customer not found</Typography>;
    }

    return (
        <Box>
            {/* Header / Navigation */}
            <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate('/customers')}
                sx={{ mb: 2, color: COLORS.darkGray }}
            >
                Back to Customers
            </Button>

            {/* Profile Header Card */}
            <Card sx={{ mb: 3, boxShadow: SHADOWS.light }}>
                <CardContent>
                    <Grid container spacing={3} alignItems="center">
                        <Grid>
                            <Avatar
                                src={selectedCustomer.profileImage}
                                sx={{ width: 100, height: 100, bgcolor: COLORS.primary, fontSize: 40 }}
                            >
                                {selectedCustomer.name?.charAt(0)}
                            </Avatar>
                        </Grid>
                        <Grid size="grow">
                            <Typography variant="h3" sx={{ mb: 1 }}>{selectedCustomer.name}</Typography>
                            <Box sx={{ display: 'flex', gap: 3, color: 'text.secondary', mb: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Email fontSize="small" />
                                    <Typography variant="body2">{selectedCustomer.email}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Phone fontSize="small" />
                                    <Typography variant="body2">{selectedCustomer.phone}</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                                    <CalendarToday fontSize="small" />
                                    <Typography variant="body2">
                                        Joined {dayjs(selectedCustomer.createdAt).format('MMMM D, YYYY')}
                                    </Typography>
                                </Box>
                                <Chip
                                    label={selectedCustomer.isActive ? 'Active' : 'Inactive'}
                                    color={selectedCustomer.isActive ? 'success' : 'default'}
                                    size="small"
                                />
                            </Box>
                        </Grid>
                        <Grid>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2">Account Status:</Typography>
                                <Switch
                                    checked={selectedCustomer.isActive}
                                    onChange={handleToggleStatus}
                                    disabled={!can('users.edit')}
                                    color="success"
                                />
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Tabs Section */}
            <Card sx={{ boxShadow: SHADOWS.light }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabValue} onChange={handleTabChange}>
                        <Tab label="Recent Bookings" />
                        <Tab label="Saved Addresses" />
                    </Tabs>
                </Box>

                {/* Bookings Tab */}
                <TabPanel value={tabValue} index={0}>
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Service</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="right">Amount</TableCell>
                                    <TableCell>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {selectedCustomer.bookings && selectedCustomer.bookings.length > 0 ? (
                                    selectedCustomer.bookings.map((booking: any) => (
                                        <TableRow key={booking.id}>
                                            <TableCell>{booking.service?.title || 'Unknown Service'}</TableCell>
                                            <TableCell>
                                                {dayjs(booking.scheduledStart).format('MMM D, YYYY')}
                                                <Typography variant="caption" display="block" color="text.secondary">
                                                    {dayjs(booking.scheduledStart).format('h:mm A')}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={booking.status.replace('_', ' ')}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: booking.status === 'COMPLETED' ? COLORS.lightGreen : undefined,
                                                        color: booking.status === 'COMPLETED' ? COLORS.success : undefined,
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                ₹{(booking.totalAmount / 100).toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                <Button size="small" onClick={() => navigate(`/bookings/${booking.id}`)}>
                                                    View
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center">No bookings found</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </TabPanel>

                {/* Addresses Tab */}
                <TabPanel value={tabValue} index={1}>
                    <Grid container spacing={2}>
                        {selectedCustomer.addresses && selectedCustomer.addresses.length > 0 ? (
                            selectedCustomer.addresses.map((address: any) => (
                                <Grid size={{ xs: 12, sm: 6 }} key={address.id}>
                                    <Paper variant="outlined" sx={{ p: 2 }}>
                                        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                            <LocationOn color="action" />
                                            <Typography variant="subtitle1" fontWeight="bold">
                                                {address.type || 'Address'}
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2">{address.formattedAddress}</Typography>
                                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                                            Coordinates: {address.latitude}, {address.longitude}
                                        </Typography>
                                    </Paper>
                                </Grid>
                            ))
                        ) : (
                            <Typography color="text.secondary">No saved addresses</Typography>
                        )}
                    </Grid>
                </TabPanel>
            </Card>
        </Box>
    );
};

export default CustomerDetailsPage;
