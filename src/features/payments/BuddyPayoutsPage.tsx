import React, { useEffect, useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Chip,
    Avatar,
    IconButton,
    Tooltip,
    Skeleton,
    Alert,
    Button,
    TextField,
    InputAdornment,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stack,
    Snackbar,
    Paper,
} from '@mui/material';
import {
    Search as SearchIcon,
    Payment as PaymentIcon,
    Visibility as ViewIcon,
    AccountBalance as AccountBalanceIcon,
    TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { COLORS, SHADOWS } from '../../theme';
import dayjs from 'dayjs';
// API client will be used when backend endpoint is implemented
// import client from '../../api/client';

interface BuddyPayout {
    id: string;
    buddy: {
        id: string;
        user: {
            name: string;
            email: string;
            phone?: string;
            profileImage?: string;
        };
    };
    amount: number;
    pendingAmount: number;
    totalEarnings: number;
    lastPayoutDate?: string;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
}

const BuddyPayoutsPage: React.FC = () => {
    const [payouts, setPayouts] = useState<BuddyPayout[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedBuddy, setSelectedBuddy] = useState<BuddyPayout | null>(null);
    const [payoutDialogOpen, setPayoutDialogOpen] = useState(false);
    const [payoutAmount, setPayoutAmount] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    // Mock data for demonstration - replace with actual API call
    useEffect(() => {
        fetchPayouts();
    }, [page, rowsPerPage, searchTerm]);

    const fetchPayouts = async () => {
        setLoading(true);
        try {
            // TODO: Replace with actual API endpoint
            // const response = await client.get('/admin/payouts', { params: { page, limit: rowsPerPage, search: searchTerm } });
            // setPayouts(response.data.data);

            // Mock data for now
            setTimeout(() => {
                setPayouts([]);
                setLoading(false);
            }, 500);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch payouts');
            setLoading(false);
        }
    };

    const handleOpenPayoutDialog = (buddy: BuddyPayout) => {
        setSelectedBuddy(buddy);
        setPayoutAmount(buddy.pendingAmount.toString());
        setPayoutDialogOpen(true);
    };

    const handleProcessPayout = async () => {
        if (!selectedBuddy || !payoutAmount) return;

        try {
            // TODO: Implement actual payout API
            // await client.post('/admin/payouts', { buddyId: selectedBuddy.buddy.id, amount: parseFloat(payoutAmount) });

            setSnackbar({ open: true, message: `Payout of ₹${payoutAmount} initiated for ${selectedBuddy.buddy.user.name}`, severity: 'success' });
            setPayoutDialogOpen(false);
            fetchPayouts();
        } catch (err: any) {
            setSnackbar({ open: true, message: err.message || 'Failed to process payout', severity: 'error' });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'success';
            case 'PENDING': return 'warning';
            case 'PROCESSING': return 'info';
            case 'FAILED': return 'error';
            default: return 'default';
        }
    };

    // Summary cards data
    const summaryCards = [
        {
            title: 'Total Pending Payouts',
            value: '₹0',
            icon: <AccountBalanceIcon />,
            color: COLORS.warning,
        },
        {
            title: 'Payouts This Month',
            value: '₹0',
            icon: <TrendingUpIcon />,
            color: COLORS.success,
        },
        {
            title: 'Buddies with Pending',
            value: '0',
            icon: <PaymentIcon />,
            color: COLORS.info,
        },
    ];

    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h1" sx={{ mb: 1 }}>Buddy Payouts</Typography>
                <Typography variant="body1" color="text.secondary">
                    Manage and process buddy earnings payouts
                </Typography>
            </Box>

            {/* Summary Cards */}
            <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
                {summaryCards.map((card, index) => (
                    <Card key={index} sx={{ boxShadow: SHADOWS.light, flex: '1 1 250px', minWidth: 250 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        {card.title}
                                    </Typography>
                                    <Typography variant="h3" fontWeight={700} color={COLORS.charcoal}>
                                        {card.value}
                                    </Typography>
                                </Box>
                                <Box
                                    sx={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: 2,
                                        backgroundColor: `${card.color}15`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: card.color,
                                    }}
                                >
                                    {card.icon}
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                ))}
            </Box>

            <Card sx={{ boxShadow: SHADOWS.light }}>
                <CardContent sx={{ p: 0 }}>
                    {/* Toolbar */}
                    <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${COLORS.lightGray}` }}>
                        <TextField
                            placeholder="Search by buddy name..."
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
                    </Box>

                    {error && <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>}

                    <TableContainer>
                        <Table>
                            <TableHead sx={{ bgcolor: COLORS.offWhite }}>
                                <TableRow>
                                    <TableCell>Buddy</TableCell>
                                    <TableCell>Total Earnings</TableCell>
                                    <TableCell>Pending Amount</TableCell>
                                    <TableCell>Last Payout</TableCell>
                                    <TableCell>Status</TableCell>
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
                                            <TableCell><Skeleton variant="text" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : payouts.length > 0 ? (
                                    payouts.map((payout) => (
                                        <TableRow key={payout.id} hover>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Avatar src={payout.buddy.user.profileImage} sx={{ bgcolor: COLORS.primary }}>
                                                        {payout.buddy.user.name?.charAt(0)}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="subtitle2" fontWeight={600}>
                                                            {payout.buddy.user.name}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {payout.buddy.user.email}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={600}>
                                                    ₹{payout.totalEarnings.toLocaleString('en-IN')}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography
                                                    variant="body2"
                                                    fontWeight={600}
                                                    color={payout.pendingAmount > 0 ? 'warning.main' : 'text.primary'}
                                                >
                                                    ₹{payout.pendingAmount.toLocaleString('en-IN')}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {payout.lastPayoutDate
                                                        ? dayjs(payout.lastPayoutDate).format('MMM D, YYYY')
                                                        : 'Never'
                                                    }
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={payout.status}
                                                    color={getStatusColor(payout.status) as any}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Tooltip title="View Details">
                                                    <IconButton color="primary" size="small">
                                                        <ViewIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Process Payout">
                                                    <IconButton
                                                        color="success"
                                                        size="small"
                                                        onClick={() => handleOpenPayoutDialog(payout)}
                                                        disabled={payout.pendingAmount <= 0}
                                                    >
                                                        <PaymentIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                            <AccountBalanceIcon sx={{ fontSize: 48, color: COLORS.lightGray, mb: 2 }} />
                                            <Typography color="text.secondary" sx={{ mb: 1 }}>
                                                No payout data available
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Buddy payout information will appear here once buddies complete jobs
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {payouts.length > 0 && (
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component="div"
                            count={payouts.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={(_, p) => setPage(p)}
                            onRowsPerPageChange={(e) => {
                                setRowsPerPage(parseInt(e.target.value, 10));
                                setPage(0);
                            }}
                        />
                    )}
                </CardContent>
            </Card>

            {/* Payout Dialog */}
            <Dialog open={payoutDialogOpen} onClose={() => setPayoutDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Process Payout</DialogTitle>
                <DialogContent>
                    {selectedBuddy && (
                        <Stack spacing={3} sx={{ mt: 2 }}>
                            <Paper variant="outlined" sx={{ p: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar src={selectedBuddy.buddy.user.profileImage} sx={{ width: 48, height: 48 }}>
                                        {selectedBuddy.buddy.user.name?.charAt(0)}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight={600}>
                                            {selectedBuddy.buddy.user.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {selectedBuddy.buddy.user.email}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Paper>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography color="text.secondary">Total Earnings:</Typography>
                                <Typography fontWeight={600}>₹{selectedBuddy.totalEarnings.toLocaleString('en-IN')}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography color="text.secondary">Pending Amount:</Typography>
                                <Typography fontWeight={600} color="warning.main">₹{selectedBuddy.pendingAmount.toLocaleString('en-IN')}</Typography>
                            </Box>

                            <TextField
                                label="Payout Amount"
                                type="number"
                                value={payoutAmount}
                                onChange={(e) => setPayoutAmount(e.target.value)}
                                fullWidth
                                slotProps={{
                                    input: {
                                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                                    },
                                }}
                            />
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setPayoutDialogOpen(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={handleProcessPayout}
                        startIcon={<PaymentIcon />}
                    >
                        Process Payout
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

export default BuddyPayoutsPage;
