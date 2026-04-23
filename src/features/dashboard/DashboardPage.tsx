import React, { useEffect, useState, useMemo } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    Chip,
    IconButton,
    Skeleton,
    ToggleButton,
    ToggleButtonGroup,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
} from '@mui/material';
import {
    TrendingUp as TrendingUpIcon,
    EventNote as BookingsIcon,
    People as PeopleIcon,
    Engineering as BuddiesIcon,
    Refresh as RefreshIcon,
    Star as StarIcon,
    AccessTime as TimeIcon,
    Visibility as ViewIcon,
} from '@mui/icons-material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from 'recharts';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
    fetchDashboardStats,
    fetchAnalytics,
    fetchRecentBookings,
    fetchTopBuddies,
} from '../../store/slices/dashboardSlice';
import { COLORS, SHADOWS } from '../../theme';
import { usePermission } from '../../components/common/PermissionGate';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

import { LiveActivityFeed } from '../../components/dashboard/LiveActivityFeed';

// Status colors for bookings
const STATUS_COLORS: Record<string, string> = {
    PENDING: COLORS.warning,
    CONFIRMED: COLORS.info,
    IN_PROGRESS: COLORS.primary,
    COMPLETED: COLORS.success,
    CANCELLED: COLORS.error,
    QUEUED: COLORS.mediumGray,
};

// Pie chart colors
const PIE_COLORS = [COLORS.success, COLORS.info, COLORS.warning, COLORS.primary, COLORS.error, COLORS.mediumGray];

const DashboardPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const { stats, analytics, recentBookings, topBuddies, loading } = useAppSelector(
        (state) => state.dashboard
    );
    const { can, canAny, adminRole } = usePermission();
    const [chartPeriod, setChartPeriod] = useState<string>('7d');

    // Memoize permission checks to avoid infinite loop
    const canViewStats = useMemo(() => canAny(['payments.view', 'users.view', 'bookings.view']), [adminRole]);
    const canViewBookings = useMemo(() => can('bookings.view'), [adminRole]);
    const canViewBuddies = useMemo(() => can('buddies.view'), [adminRole]);
    const canViewAnalytics = useMemo(() => canAny(['payments.view', 'reports.view']), [adminRole]);

    // Fetch dashboard data on mount (conditional based on permissions)
    useEffect(() => {
        if (canViewStats) {
            dispatch(fetchDashboardStats(undefined));
        }

        if (canViewBookings) {
            dispatch(fetchRecentBookings(undefined));
        }

        if (canViewBuddies) {
            dispatch(fetchTopBuddies(undefined));
        }
    }, [dispatch, canViewStats, canViewBookings, canViewBuddies]);

    // Fetch analytics when period changes
    useEffect(() => {
        if (!canViewAnalytics) return;

        const endDate = dayjs().endOf('day').toISOString();
        let startDate = dayjs().subtract(7, 'day').startOf('day').toISOString();

        if (chartPeriod === '30d') startDate = dayjs().subtract(30, 'day').startOf('day').toISOString();
        if (chartPeriod === '90d') startDate = dayjs().subtract(90, 'day').startOf('day').toISOString();

        dispatch(fetchAnalytics({ startDate, endDate }));
    }, [dispatch, chartPeriod, canViewAnalytics]);

    const handleRefresh = () => {
        if (canViewStats) {
            dispatch(fetchDashboardStats(undefined));
        }
        if (canViewAnalytics) {
            const endDate = dayjs().endOf('day').toISOString();
            let startDate = dayjs().subtract(7, 'day').startOf('day').toISOString();
            if (chartPeriod === '30d') startDate = dayjs().subtract(30, 'day').startOf('day').toISOString();
            if (chartPeriod === '90d') startDate = dayjs().subtract(90, 'day').startOf('day').toISOString();
            dispatch(fetchAnalytics({ startDate, endDate }));
        }
        if (canViewBookings) {
            dispatch(fetchRecentBookings(undefined));
        }
        if (canViewBuddies) {
            dispatch(fetchTopBuddies(undefined));
        }
    };

    // Metrics cards data
    const metricsCards = [
        {
            title: 'Total Revenue',
            value: stats ? `₹${(stats.revenue.total / 100).toLocaleString('en-IN')}` : '₹0',
            subtitle: `₹${stats ? (stats.revenue.thisMonth / 100).toLocaleString('en-IN') : '0'} this month`,
            icon: <TrendingUpIcon />,
            color: COLORS.primary,
        },
        {
            title: 'Total Bookings',
            value: stats?.bookings.total?.toLocaleString() || '0',
            subtitle: `${stats?.bookings.today || 0} today, ${stats?.bookings.thisMonth || 0} this month`,
            icon: <BookingsIcon />,
            color: COLORS.info,
        },
        {
            title: 'Active Customers',
            value: stats?.users.total?.toLocaleString() || '0',
            subtitle: 'Total registered users',
            icon: <PeopleIcon />,
            color: COLORS.warning,
        },
        {
            title: 'Active Buddies',
            value: stats?.buddies.total?.toLocaleString() || '0',
            subtitle: `${stats?.buddies.active || 0} online now`,
            icon: <BuddiesIcon />,
            color: COLORS.success,
        },
    ];

    // Revenue chart data from analytics - format dates based on period
    const getDateFormat = () => {
        switch (chartPeriod) {
            case '7d': return 'ddd'; // Mon, Tue, etc.
            case '30d': return 'MMM D'; // Jan 15, Jan 16, etc.
            case '90d': return 'MMM D'; // Show date for 3 months
            default: return 'ddd';
        }
    };

    // Generate fallback data based on selected period
    const generateFallbackData = () => {
        const days = chartPeriod === '7d' ? 7 : chartPeriod === '30d' ? 30 : 90;
        const format = getDateFormat();
        return Array.from({ length: days }, (_, i) => ({
            date: dayjs().subtract(days - 1 - i, 'day').format(format),
            revenue: 0,
            bookings: 0,
        }));
    };

    const revenueChartData = analytics?.revenueByDay && analytics.revenueByDay.length > 0
        ? analytics.revenueByDay.map((item) => ({
            date: dayjs(item.date).format(getDateFormat()),
            revenue: item.amount,
            bookings: 0, // Not available in current analytics endpoint
        }))
        : generateFallbackData();

    // Booking status pie chart data from analytics
    const bookingStatusData = analytics?.bookingsByStatus?.map((item) => ({
        name: item.status.replace('_', ' '),
        value: item._count,
    })) || [
            { name: 'Completed', value: stats?.bookings.completed || 0 },
            { name: 'Pending', value: stats?.bookings.pending || 0 },
            { name: 'In Progress', value: 0 },
            { name: 'Cancelled', value: 0 },
        ];

    return (
        <Box>
            {/* Page Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h1">Dashboard</Typography>
                <IconButton onClick={handleRefresh} disabled={loading}>
                    <RefreshIcon sx={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                </IconButton>
            </Box>

            {/* Metrics Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {metricsCards.map((metric, index) => (
                    <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={index}>
                        <Card sx={{ boxShadow: SHADOWS.light, height: '100%' }}>
                            <CardContent sx={{ p: 3 }}>
                                {loading ? (
                                    <Skeleton variant="rectangular" height={100} />
                                ) : (
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box>
                                            <Typography variant="body2" color={COLORS.mediumGray} sx={{ mb: 1 }}>
                                                {metric.title}
                                            </Typography>
                                            <Typography variant="h3" fontWeight={700} color={COLORS.charcoal}>
                                                {metric.value}
                                            </Typography>
                                            <Typography variant="body2" sx={{ mt: 1, color: COLORS.darkGray }}>
                                                {metric.subtitle}
                                            </Typography>
                                        </Box>
                                        <Box
                                            sx={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: 2,
                                                backgroundColor: `${metric.color}15`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: metric.color,
                                            }}
                                        >
                                            {metric.icon}
                                        </Box>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Charts Row */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Revenue Chart */}
                <Grid size={{ xs: 12, lg: 8 }}>
                    <Card sx={{ height: 400, boxShadow: SHADOWS.light }}>
                        <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h3">Revenue Overview</Typography>
                                <ToggleButtonGroup
                                    value={chartPeriod}
                                    exclusive
                                    onChange={(_, value) => value && setChartPeriod(value)}
                                    size="small"
                                >
                                    <ToggleButton value="7d">7 Days</ToggleButton>
                                    <ToggleButton value="30d">30 Days</ToggleButton>
                                    <ToggleButton value="90d">3 Months</ToggleButton>
                                </ToggleButtonGroup>
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={revenueChartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.lightGray} />
                                        <XAxis dataKey="date" stroke={COLORS.mediumGray} fontSize={12} />
                                        <YAxis stroke={COLORS.mediumGray} fontSize={12} tickFormatter={(v) => `₹${v / 1000}k`} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: COLORS.white,
                                                border: `1px solid ${COLORS.lightGray}`,
                                                borderRadius: 8,
                                            }}
                                            formatter={(value: any) => [`₹${Number(value || 0).toLocaleString()}`, 'Revenue']}

                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke={COLORS.primary}
                                            strokeWidth={3}
                                            dot={{ fill: COLORS.primary, strokeWidth: 2, r: 4 }}
                                            activeDot={{ r: 6, fill: COLORS.darkGreen }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Booking Status Pie Chart */}
                <Grid size={{ xs: 12, lg: 4 }}>
                    <Card sx={{ height: 400, boxShadow: SHADOWS.light }}>
                        <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h3" sx={{ mb: 2 }}>
                                Booking Status
                            </Typography>
                            <Box sx={{ flex: 1 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={bookingStatusData}
                                            cx="50%"
                                            cy="45%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={2}
                                            dataKey="value"
                                        >
                                            {bookingStatusData.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: COLORS.white,
                                                border: `1px solid ${COLORS.lightGray}`,
                                                borderRadius: 8,
                                            }}
                                        />
                                        <Legend
                                            verticalAlign="bottom"
                                            iconType="circle"
                                            iconSize={10}
                                            formatter={(value) => (
                                                <span style={{ color: COLORS.darkGray, fontSize: 12 }}>{value}</span>
                                            )}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Tables Row */}
            <Grid container spacing={3}>
                {/* Recent Bookings Table */}
                <Grid size={{ xs: 12, lg: 8 }}>
                    <Card sx={{ boxShadow: SHADOWS.light }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h3">Recent Bookings</Typography>
                                <Typography
                                    variant="body2"
                                    sx={{ color: COLORS.primary, cursor: 'pointer', fontWeight: 500 }}
                                    onClick={() => window.location.href = '/bookings'}
                                >
                                    View All →
                                </Typography>
                            </Box>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Order ID</TableCell>
                                            <TableCell>Customer</TableCell>
                                            <TableCell>Service</TableCell>
                                            <TableCell>Date</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell align="right">Amount</TableCell>
                                            <TableCell align="center">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {loading ? (
                                            [...Array(5)].map((_, i) => (
                                                <TableRow key={i}>
                                                    {[...Array(7)].map((_, j) => (
                                                        <TableCell key={j}>
                                                            <Skeleton variant="text" />
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            ))
                                        ) : recentBookings.length > 0 ? (
                                            recentBookings.slice(0, 7).map((booking) => (
                                                <TableRow key={booking.id} hover>
                                                    <TableCell>
                                                        <Typography variant="body2" fontWeight={600} color={COLORS.primary}>
                                                            #{booking.orderNumber}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Avatar
                                                                src={booking.user?.profileImage}
                                                                sx={{ width: 32, height: 32, bgcolor: COLORS.lightGreen }}
                                                            >
                                                                {booking.user?.name?.charAt(0)}
                                                            </Avatar>
                                                            <Typography variant="body2">
                                                                {booking.user?.name || booking.user?.email || 'Unknown'}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>{booking.service?.title || '-'}</TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <TimeIcon sx={{ fontSize: 14, color: COLORS.mediumGray }} />
                                                            <Typography variant="body2">
                                                                {dayjs(booking.scheduledStart).format('MMM D')}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={booking.status?.replace('_', ' ')}
                                                            size="small"
                                                            sx={{
                                                                backgroundColor: `${STATUS_COLORS[booking.status] || COLORS.mediumGray}20`,
                                                                color: STATUS_COLORS[booking.status] || COLORS.mediumGray,
                                                                fontWeight: 500,
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Typography variant="body2" fontWeight={600} color={COLORS.primary}>
                                                            ₹{(booking.totalAmount).toLocaleString()}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <IconButton size="small" onClick={() => window.location.href = `/bookings/${booking.id}`}>
                                                            <ViewIcon fontSize="small" />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={7} align="center">
                                                    <Typography color={COLORS.mediumGray}>No recent bookings</Typography>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Top Buddies List */}
                <Grid size={{ xs: 12, lg: 4 }}>
                    {/* ... existing buddy list ... */}
                    <Card sx={{ boxShadow: SHADOWS.light }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h3">Top Buddies</Typography>
                                <Typography
                                    variant="body2"
                                    sx={{ color: COLORS.primary, cursor: 'pointer', fontWeight: 500 }}
                                    onClick={() => window.location.href = '/buddies'}
                                >
                                    View All →
                                </Typography>
                            </Box>
                            <List disablePadding>
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <ListItem key={i} disablePadding sx={{ py: 1.5 }}>
                                            <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                                            <Box sx={{ flex: 1 }}>
                                                <Skeleton variant="text" width="60%" />
                                                <Skeleton variant="text" width="40%" />
                                            </Box>
                                        </ListItem>
                                    ))
                                ) : topBuddies.length > 0 ? (
                                    topBuddies.slice(0, 5).map((buddy, index) => (
                                        <ListItem
                                            key={buddy.id}
                                            disablePadding
                                            sx={{
                                                py: 1.5,
                                                borderBottom: index < 4 ? `1px solid ${COLORS.lightGray}` : 'none',
                                            }}
                                        >
                                            <Box sx={{ position: 'relative', mr: 2 }}>
                                                <ListItemAvatar sx={{ minWidth: 'auto' }}>
                                                    <Avatar
                                                        src={buddy.user?.profileImage}
                                                        sx={{ width: 44, height: 44, bgcolor: COLORS.primary }}
                                                    >
                                                        {buddy.user?.name?.charAt(0)}
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <Box
                                                    sx={{
                                                        position: 'absolute',
                                                        bottom: -4,
                                                        right: -4,
                                                        width: 20,
                                                        height: 20,
                                                        borderRadius: '50%',
                                                        backgroundColor: COLORS.white,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: 10,
                                                        fontWeight: 700,
                                                        color: COLORS.primary,
                                                        border: `2px solid ${COLORS.primary}`,
                                                    }}
                                                >
                                                    {index + 1}
                                                </Box>
                                            </Box>
                                            <ListItemText
                                                primary={buddy.user?.name || 'Unknown'}
                                                secondary={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                                                            <StarIcon sx={{ fontSize: 14, color: COLORS.warning }} />
                                                            <Typography variant="caption" fontWeight={600}>
                                                                {buddy.rating?.toFixed(1) || '0.0'}
                                                            </Typography>
                                                        </Box>
                                                        <Typography variant="caption" color={COLORS.mediumGray}>
                                                            • {buddy.completedJobs || 0} jobs
                                                        </Typography>
                                                    </Box>
                                                }
                                                primaryTypographyProps={{ fontWeight: 600, fontSize: 14 }}
                                                secondaryTypographyProps={{ fontWeight: 600, fontSize: 14, component: 'div' }}
                                            />
                                            <Typography variant="body2" fontWeight={600} color={COLORS.primary}>
                                                ₹{(buddy.totalEarnings).toLocaleString()}
                                            </Typography>
                                        </ListItem>
                                    ))
                                ) : (
                                    <ListItem>
                                        <ListItemText
                                            primary="No buddies found"
                                            primaryTypographyProps={{ color: COLORS.mediumGray, textAlign: 'center' }}
                                        />
                                    </ListItem>
                                )}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Live Activity Feed */}
                <Grid size={{ xs: 12 }}>
                    <Card sx={{ boxShadow: SHADOWS.light }}>
                        <CardContent>
                            <LiveActivityFeed />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* CSS for refresh animation */}
            <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </Box>
    );
};

export default DashboardPage;
