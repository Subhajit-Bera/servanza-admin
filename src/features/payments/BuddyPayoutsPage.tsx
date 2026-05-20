import React, { useEffect, useState, useCallback } from 'react';
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
    LinearProgress,
} from '@mui/material';
import {
    Search as SearchIcon,
    Payment as PaymentIcon,
    AccountBalance as AccountBalanceIcon,
    TrendingUp as TrendingUpIcon,
    Refresh as RefreshIcon,
} from '@mui/icons-material';
import { COLORS, SHADOWS } from '../../theme';
import apiClient from '../../api/client';

interface BuddyPayout {
    buddyId: string;
    name: string;
    phone: string;
    totalEarnings: number;
    totalJobs: number;
    totalPaid: number;
    pendingAmount: number;
    bankDetails: any;
}

const BuddyPayoutsPage: React.FC = () => {
    const [payouts, setPayouts] = useState<BuddyPayout[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBuddy, setSelectedBuddy] = useState<BuddyPayout | null>(null);
    const [payoutDialogOpen, setPayoutDialogOpen] = useState(false);
    const [payoutAmount, setPayoutAmount] = useState('');
    const [payoutReference, setPayoutReference] = useState('');
    const [processing, setProcessing] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    const fetchPayouts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiClient.get('/admin/payouts');
            setPayouts(response.data.data || []);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to fetch payouts');
            setPayouts([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPayouts();
    }, [fetchPayouts]);

    const handleOpenPayoutDialog = (buddy: BuddyPayout) => {
        setSelectedBuddy(buddy);
        setPayoutAmount(buddy.pendingAmount.toString());
        setPayoutReference('');
        setPayoutDialogOpen(true);
    };

    const handleProcessPayout = async () => {
        if (!selectedBuddy || !payoutAmount) return;

        const amount = parseFloat(payoutAmount);
        if (isNaN(amount) || amount <= 0) {
            setSnackbar({ open: true, message: 'Please enter a valid amount', severity: 'error' });
            return;
        }

        if (amount > selectedBuddy.pendingAmount) {
            setSnackbar({ open: true, message: 'Amount exceeds pending balance', severity: 'error' });
            return;
        }

        setProcessing(true);
        try {
            await apiClient.post('/admin/payouts', {
                buddyId: selectedBuddy.buddyId,
                amount,
                reference: payoutReference || undefined,
            });

            setSnackbar({ open: true, message: `Payout of ₹${amount.toLocaleString('en-IN')} processed for ${selectedBuddy.name}`, severity: 'success' });
            setPayoutDialogOpen(false);
            fetchPayouts(); // Refresh data
        } catch (err: any) {
            setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to process payout', severity: 'error' });
        } finally {
            setProcessing(false);
        }
    };

    // Client-side search filter
    const filteredPayouts = payouts.filter((p) => {
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.phone?.includes(q);
    });

    // Summary calculations
    const totalPending = payouts.reduce((sum, p) => sum + p.pendingAmount, 0);
    const totalPaid = payouts.reduce((sum, p) => sum + p.totalPaid, 0);
    const buddiesWithPending = payouts.filter((p) => p.pendingAmount > 0).length;

    const summaryCards = [
        {
            title: 'Total Pending Payouts',
            value: `₹${totalPending.toLocaleString('en-IN')}`,
            icon: <AccountBalanceIcon />,
            color: COLORS.warning,
        },
        {
            title: 'Total Paid Out',
            value: `₹${totalPaid.toLocaleString('en-IN')}`,
            icon: <TrendingUpIcon />,
            color: COLORS.success,
        },
        {
            title: 'Buddies with Pending',
            value: buddiesWithPending.toString(),
            icon: <PaymentIcon />,
            color: COLORS.info,
        },
    ];

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box>
                    <Typography variant="h1" sx={{ mb: 1 }}>Buddy Payouts</Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage and process buddy earnings payouts
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={fetchPayouts}
                    disabled={loading}
                >
                    Refresh
                </Button>
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
                                        {loading ? <Skeleton width={80} /> : card.value}
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
                            placeholder="Search by buddy name or phone..."
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

                    {loading && <LinearProgress />}
                    {error && <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>}

                    <TableContainer>
                        <Table>
                            <TableHead sx={{ bgcolor: COLORS.offWhite }}>
                                <TableRow>
                                    <TableCell>Buddy</TableCell>
                                    <TableCell align="right">Total Jobs</TableCell>
                                    <TableCell align="right">Total Earnings</TableCell>
                                    <TableCell align="right">Total Paid</TableCell>
                                    <TableCell align="right">Pending Amount</TableCell>
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
                                ) : filteredPayouts.length > 0 ? (
                                    filteredPayouts.map((payout) => (
                                        <TableRow key={payout.buddyId} hover>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Avatar sx={{ bgcolor: COLORS.primary }}>
                                                        {payout.name?.charAt(0)}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="subtitle2" fontWeight={600}>
                                                            {payout.name}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {payout.phone}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography variant="body2">{payout.totalJobs}</Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography variant="body2" fontWeight={600}>
                                                    ₹{payout.totalEarnings.toLocaleString('en-IN')}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography variant="body2" color="success.main" fontWeight={600}>
                                                    ₹{payout.totalPaid.toLocaleString('en-IN')}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Chip
                                                    label={`₹${payout.pendingAmount.toLocaleString('en-IN')}`}
                                                    color={payout.pendingAmount > 0 ? 'warning' : 'success'}
                                                    size="small"
                                                    variant={payout.pendingAmount > 0 ? 'filled' : 'outlined'}
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Tooltip title="Process Payout">
                                                    <span>
                                                        <IconButton
                                                            color="success"
                                                            size="small"
                                                            onClick={() => handleOpenPayoutDialog(payout)}
                                                            disabled={payout.pendingAmount <= 0}
                                                        >
                                                            <PaymentIcon />
                                                        </IconButton>
                                                    </span>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                            <AccountBalanceIcon sx={{ fontSize: 48, color: COLORS.lightGray, mb: 2 }} />
                                            <Typography color="text.secondary" sx={{ mb: 1 }}>
                                                {searchTerm ? 'No buddies match your search' : 'No payout data available'}
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
                                    <Avatar sx={{ width: 48, height: 48, bgcolor: COLORS.primary }}>
                                        {selectedBuddy.name?.charAt(0)}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight={600}>
                                            {selectedBuddy.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {selectedBuddy.phone}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Paper>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography color="text.secondary">Total Earnings:</Typography>
                                <Typography fontWeight={600}>₹{selectedBuddy.totalEarnings.toLocaleString('en-IN')}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography color="text.secondary">Already Paid:</Typography>
                                <Typography fontWeight={600} color="success.main">₹{selectedBuddy.totalPaid.toLocaleString('en-IN')}</Typography>
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
                                helperText={`Max: ₹${selectedBuddy.pendingAmount.toLocaleString('en-IN')}`}
                            />

                            <TextField
                                label="Reference / Transaction ID (Optional)"
                                value={payoutReference}
                                onChange={(e) => setPayoutReference(e.target.value)}
                                fullWidth
                                placeholder="e.g., UTR number, bank transfer ref"
                            />

                            {selectedBuddy.bankDetails && (
                                <Paper variant="outlined" sx={{ p: 2, bgcolor: COLORS.offWhite }}>
                                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Bank Details</Typography>
                                    <Typography variant="body2">Account: {selectedBuddy.bankDetails.accountNumber || 'N/A'}</Typography>
                                    <Typography variant="body2">IFSC: {selectedBuddy.bankDetails.ifscCode || 'N/A'}</Typography>
                                    <Typography variant="body2">Bank: {selectedBuddy.bankDetails.bankName || 'N/A'}</Typography>
                                </Paper>
                            )}
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setPayoutDialogOpen(false)} disabled={processing}>Cancel</Button>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={handleProcessPayout}
                        startIcon={<PaymentIcon />}
                        disabled={processing || !payoutAmount || parseFloat(payoutAmount) <= 0}
                    >
                        {processing ? 'Processing...' : 'Process Payout'}
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
