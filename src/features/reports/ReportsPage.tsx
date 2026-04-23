import React, { useEffect, useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Card,
    CardContent,
    Stack,
    Button,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Chip,
    Tab,
    Tabs,
} from '@mui/material';
import {
    Download as DownloadIcon,
    Refresh as RefreshIcon,
    TrendingUp as TrendingUpIcon,
    AttachMoney as MoneyIcon,
    CalendarToday as CalendarIcon,
    Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
    fetchRevenueReport,
    fetchBookingReport,
    selectRevenueReport,
    selectBookingReport,
    selectReportsLoading,
} from '../../store/slices/reportsSlice';
import { COLORS } from '../../theme';
import dayjs from 'dayjs';
import client from '../../api/client';

const CHART_COLORS = [COLORS.primary, COLORS.accent, COLORS.info, COLORS.warning, '#9B59B6', '#1ABC9C', '#E67E22', '#3498DB'];

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
    <div hidden={value !== index} style={{ paddingTop: 16 }}>
        {value === index && children}
    </div>
);

const ReportsPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const revenueReport = useAppSelector(selectRevenueReport);
    const bookingReport = useAppSelector(selectBookingReport);
    const loading = useAppSelector(selectReportsLoading);

    const [activeTab, setActiveTab] = useState(0);
    const [dateRange, setDateRange] = useState({
        startDate: dayjs().subtract(3, 'month').format('YYYY-MM-DD'),
        endDate: dayjs().format('YYYY-MM-DD'),
    });
    const [exportLoading, setExportLoading] = useState(false);

    useEffect(() => {
        loadReports();
    }, []);

    const loadReports = () => {
        dispatch(fetchRevenueReport({
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
        }));
        dispatch(fetchBookingReport({
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
        }));
    };

    const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
        setDateRange(prev => ({ ...prev, [field]: value }));
    };

    const handleApplyFilters = () => {
        loadReports();
    };

    const handleExport = async (type: 'transactions' | 'bookings' | 'buddies') => {
        setExportLoading(true);
        try {
            const response = await client.get('/admin/reports/export', {
                params: {
                    type,
                    startDate: dateRange.startDate,
                    endDate: dateRange.endDate,
                },
                responseType: 'blob',
            });

            // Download the CSV
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${type}-export-${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setExportLoading(false);
        }
    };

    // Format chart data
    const revenueChartData = revenueReport?.byPeriod.map(item => ({
        date: dayjs(item.date).format('MMM D'),
        revenue: item.revenue,
        transactions: item.count,
    })) || [];

    const bookingChartData = bookingReport?.byDay.map(item => ({
        date: dayjs(item.date).format('MMM D'),
        bookings: item.count,
    })) || [];

    const statusPieData = bookingReport?.byStatus.map(item => ({
        name: item.status,
        value: item.count,
    })) || [];

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h1">Reports & Analytics</Typography>
                <Button
                    variant="outlined"
                    startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon />}
                    onClick={loadReports}
                    disabled={loading}
                >
                    Refresh
                </Button>
            </Box>

            {/* Date Range Filters */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <CalendarIcon color="action" />
                    <TextField
                        type="date"
                        label="Start Date"
                        value={dateRange.startDate}
                        onChange={(e) => handleDateChange('startDate', e.target.value)}
                        size="small"
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        type="date"
                        label="End Date"
                        value={dateRange.endDate}
                        onChange={(e) => handleDateChange('endDate', e.target.value)}
                        size="small"
                        InputLabelProps={{ shrink: true }}
                    />
                    <Button variant="contained" onClick={handleApplyFilters}>
                        Apply Filters
                    </Button>
                    <Box sx={{ flex: 1 }} />
                    <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={() => handleExport('transactions')}
                        disabled={exportLoading}
                    >
                        Export Transactions
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={() => handleExport('bookings')}
                        disabled={exportLoading}
                    >
                        Export Bookings
                    </Button>
                </Stack>
            </Paper>

            {/* Summary Cards */}
            {revenueReport && (
                <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                    <Card sx={{ flex: 1 }}>
                        <CardContent>
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <Box sx={{ bgcolor: COLORS.primary + '20', p: 1.5, borderRadius: 2 }}>
                                    <MoneyIcon sx={{ color: COLORS.primary, fontSize: 32 }} />
                                </Box>
                                <Box>
                                    <Typography variant="h4">₹{revenueReport.totals.totalRevenue.toLocaleString()}</Typography>
                                    <Typography variant="body2" color="text.secondary">Total Revenue</Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                    <Card sx={{ flex: 1 }}>
                        <CardContent>
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <Box sx={{ bgcolor: COLORS.info + '20', p: 1.5, borderRadius: 2 }}>
                                    <TrendingUpIcon sx={{ color: COLORS.info, fontSize: 32 }} />
                                </Box>
                                <Box>
                                    <Typography variant="h4">{revenueReport.totals.totalTransactions}</Typography>
                                    <Typography variant="body2" color="text.secondary">Transactions</Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                    <Card sx={{ flex: 1 }}>
                        <CardContent>
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <Box sx={{ bgcolor: COLORS.success + '20', p: 1.5, borderRadius: 2 }}>
                                    <AssessmentIcon sx={{ color: COLORS.success, fontSize: 32 }} />
                                </Box>
                                <Box>
                                    <Typography variant="h4">₹{Math.round(revenueReport.totals.averageTransaction).toLocaleString()}</Typography>
                                    <Typography variant="body2" color="text.secondary">Avg Transaction</Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                    <Card sx={{ flex: 1 }}>
                        <CardContent>
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <Box sx={{ bgcolor: COLORS.error + '20', p: 1.5, borderRadius: 2 }}>
                                    <MoneyIcon sx={{ color: COLORS.error, fontSize: 32 }} />
                                </Box>
                                <Box>
                                    <Typography variant="h4">₹{(revenueReport.totals.totalRefunds || 0).toLocaleString()}</Typography>
                                    <Typography variant="body2" color="text.secondary">Total Refunds</Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Stack>
            )}

            {/* Tabs */}
            <Paper sx={{ mb: 3 }}>
                <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tab label="Revenue" />
                    <Tab label="Bookings" />
                    <Tab label="Top Services" />
                    <Tab label="Top Buddies" />
                </Tabs>

                {/* Revenue Tab */}
                <TabPanel value={activeTab} index={0}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Box sx={{ p: 2 }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>Revenue Trend</Typography>
                            <ResponsiveContainer width="100%" height={350}>
                                <LineChart data={revenueChartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => value !== undefined ? `₹${Number(value).toLocaleString()}` : ''} />
                                    <Legend />
                                    <Line type="monotone" dataKey="revenue" stroke={COLORS.primary} strokeWidth={2} name="Revenue" />
                                </LineChart>
                            </ResponsiveContainer>

                            {/* Revenue by Method */}
                            {revenueReport?.byMethod && (
                                <Box sx={{ mt: 4 }}>
                                    <Typography variant="h6" sx={{ mb: 2 }}>Revenue by Payment Method</Typography>
                                    <Stack direction="row" spacing={2}>
                                        {revenueReport.byMethod.map((item, index) => (
                                            <Card key={item.method} sx={{ flex: 1 }}>
                                                <CardContent>
                                                    <Stack direction="row" alignItems="center" spacing={2}>
                                                        <Box sx={{ width: 12, height: 12, bgcolor: CHART_COLORS[index], borderRadius: '50%' }} />
                                                        <Box>
                                                            <Typography variant="h5">₹{item.revenue.toLocaleString()}</Typography>
                                                            <Typography variant="body2" color="text.secondary">{item.method} ({item.count} txns)</Typography>
                                                        </Box>
                                                    </Stack>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </Stack>
                                </Box>
                            )}
                        </Box>
                    )}
                </TabPanel>

                {/* Bookings Tab */}
                <TabPanel value={activeTab} index={1}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Box sx={{ p: 2 }}>
                            <Stack direction="row" spacing={4}>
                                <Box sx={{ flex: 2 }}>
                                    <Typography variant="h6" sx={{ mb: 2 }}>Booking Trend</Typography>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={bookingChartData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="bookings" fill={COLORS.primary} name="Bookings" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="h6" sx={{ mb: 2 }}>By Status</Typography>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={statusPieData}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={100}
                                                label
                                            >
                                                {statusPieData.map((entry, index) => (
                                                    <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Box>
                            </Stack>
                        </Box>
                    )}
                </TabPanel>

                {/* Top Services Tab */}
                <TabPanel value={activeTab} index={2}>
                    <Box sx={{ p: 2 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Top Services</Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Rank</TableCell>
                                        <TableCell>Service</TableCell>
                                        <TableCell align="right">Bookings</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {bookingReport?.topServices.map((service, index) => (
                                        <TableRow key={service.serviceId}>
                                            <TableCell>
                                                <Chip
                                                    label={`#${index + 1}`}
                                                    size="small"
                                                    color={index < 3 ? 'primary' : 'default'}
                                                />
                                            </TableCell>
                                            <TableCell>{service.serviceName}</TableCell>
                                            <TableCell align="right">{service.count}</TableCell>
                                        </TableRow>
                                    ))}
                                    {(!bookingReport?.topServices || bookingReport.topServices.length === 0) && (
                                        <TableRow>
                                            <TableCell colSpan={3} align="center">No data available</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                </TabPanel>

                {/* Top Buddies Tab */}
                <TabPanel value={activeTab} index={3}>
                    <Box sx={{ p: 2 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Top Performing Buddies</Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Rank</TableCell>
                                        <TableCell>Buddy Name</TableCell>
                                        <TableCell align="center">Rating</TableCell>
                                        <TableCell align="right">Completed Jobs</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {bookingReport?.topBuddies.map((buddy, index) => (
                                        <TableRow key={buddy.buddyId}>
                                            <TableCell>
                                                <Chip
                                                    label={`#${index + 1}`}
                                                    size="small"
                                                    color={index < 3 ? 'primary' : 'default'}
                                                />
                                            </TableCell>
                                            <TableCell>{buddy.buddyName}</TableCell>
                                            <TableCell align="center">
                                                <Chip label={`⭐ ${buddy.rating.toFixed(1)}`} size="small" />
                                            </TableCell>
                                            <TableCell align="right">{buddy.completedJobs}</TableCell>
                                        </TableRow>
                                    ))}
                                    {(!bookingReport?.topBuddies || bookingReport.topBuddies.length === 0) && (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center">No data available</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                </TabPanel>
            </Paper>
        </Box>
    );
};

export default ReportsPage;
