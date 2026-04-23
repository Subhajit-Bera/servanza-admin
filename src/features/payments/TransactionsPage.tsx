import React, { useEffect, useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Chip,
    IconButton,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stack,
    InputAdornment,
    CircularProgress,
    Tooltip,
} from '@mui/material';
import {
    Search as SearchIcon,
    Visibility as ViewIcon,
    Refresh as RefreshIcon,
    CurrencyRupee as RefundIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
    fetchTransactions,
    processRefund,
    selectTransactions,
    selectTransactionsLoading,
    selectTransactionsPagination,
} from '../../store/slices/transactionsSlice';
import type { Transaction } from '../../store/slices/transactionsSlice';
import { COLORS } from '../../theme';
import dayjs from 'dayjs';

const TransactionsPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const transactions = useAppSelector(selectTransactions);
    const loading = useAppSelector(selectTransactionsLoading);
    const pagination = useAppSelector(selectTransactionsPagination);

    // Filters
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [method, setMethod] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);

    // Dialogs
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [refundDialogOpen, setRefundDialogOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [refundAmount, setRefundAmount] = useState('');
    const [refundReason, setRefundReason] = useState('');

    useEffect(() => {
        loadTransactions();
    }, [page, rowsPerPage, status, method]);

    const loadTransactions = () => {
        dispatch(fetchTransactions({
            page: page + 1,
            limit: rowsPerPage,
            status: status || undefined,
            method: method || undefined,
            search: search || undefined,
        }));
    };

    const handleSearch = () => {
        setPage(0);
        loadTransactions();
    };

    const handleViewTransaction = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        setViewDialogOpen(true);
    };

    const handleOpenRefundDialog = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        setRefundAmount(transaction.amount.toString());
        setRefundReason('');
        setRefundDialogOpen(true);
    };

    const handleProcessRefund = async () => {
        if (!selectedTransaction) return;

        await dispatch(processRefund({
            transactionId: selectedTransaction.id,
            amount: parseFloat(refundAmount),
            reason: refundReason,
        }));

        setRefundDialogOpen(false);
        loadTransactions();
    };

    const getStatusColor = (status: string): 'success' | 'error' | 'warning' | 'default' | 'info' => {
        switch (status) {
            case 'COMPLETED': return 'success';
            case 'FAILED': return 'error';
            case 'PENDING': return 'warning';
            case 'REFUNDED': return 'info';
            default: return 'default';
        }
    };

    const getMethodColor = (method: string): 'primary' | 'secondary' => {
        return method === 'PREPAID' ? 'primary' : 'secondary';
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h1">Transactions</Typography>
                <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={loadTransactions}
                    disabled={loading}
                >
                    Refresh
                </Button>
            </Box>

            {/* Filters */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                    <TextField
                        size="small"
                        placeholder="Search by booking ID or customer..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ minWidth: 300 }}
                    />

                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={status}
                            label="Status"
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="PENDING">Pending</MenuItem>
                            <MenuItem value="COMPLETED">Completed</MenuItem>
                            <MenuItem value="FAILED">Failed</MenuItem>
                            <MenuItem value="REFUNDED">Refunded</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Method</InputLabel>
                        <Select
                            value={method}
                            label="Method"
                            onChange={(e) => setMethod(e.target.value)}
                        >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="PREPAID">Prepaid</MenuItem>
                            <MenuItem value="CASH">Cash</MenuItem>
                        </Select>
                    </FormControl>

                    <Button variant="contained" onClick={handleSearch}>
                        Search
                    </Button>
                </Stack>
            </Paper>

            {/* Transactions Table */}
            <Paper>
                <TableContainer>
                    {loading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                            <CircularProgress />
                        </Box>
                    )}
                    {!loading && (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Transaction ID</TableCell>
                                    <TableCell>Customer</TableCell>
                                    <TableCell>Booking</TableCell>
                                    <TableCell align="right">Amount</TableCell>
                                    <TableCell>Method</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {transactions.map((transaction) => (
                                    <TableRow key={transaction.id} hover>
                                        <TableCell>
                                            {dayjs(transaction.createdAt).format('MMM D, YYYY h:mm A')}
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                                #{transaction.id.slice(-8)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="bold">
                                                {transaction.user?.name || 'Unknown'}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {transaction.user?.email}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {transaction.booking?.service?.title || 'N/A'}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                #{transaction.bookingId.slice(-8)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="body2" fontWeight="bold">
                                                ₹{transaction.amount.toLocaleString()}
                                            </Typography>
                                            {transaction.refundedAmount && (
                                                <Typography variant="caption" color="error">
                                                    Refunded: ₹{transaction.refundedAmount.toLocaleString()}
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={transaction.method}
                                                size="small"
                                                color={getMethodColor(transaction.method)}
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={transaction.status}
                                                size="small"
                                                color={getStatusColor(transaction.status)}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="View Details">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleViewTransaction(transaction)}
                                                >
                                                    <ViewIcon />
                                                </IconButton>
                                            </Tooltip>
                                            {transaction.status === 'COMPLETED' && transaction.method === 'PREPAID' && (
                                                <Tooltip title="Process Refund">
                                                    <IconButton
                                                        size="small"
                                                        color="warning"
                                                        onClick={() => handleOpenRefundDialog(transaction)}
                                                    >
                                                        <RefundIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {transactions.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                                            <Typography color="text.secondary">
                                                No transactions found
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </TableContainer>
                <TablePagination
                    component="div"
                    count={pagination.total}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                    rowsPerPageOptions={[10, 20, 50]}
                />
            </Paper>

            {/* View Transaction Dialog */}
            <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Transaction Details</DialogTitle>
                <DialogContent dividers>
                    {selectedTransaction && (
                        <Stack spacing={2}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography color="text.secondary">Transaction ID</Typography>
                                <Typography fontFamily="monospace">{selectedTransaction.id}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography color="text.secondary">Amount</Typography>
                                <Typography fontWeight="bold">₹{selectedTransaction.amount.toLocaleString()}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography color="text.secondary">Status</Typography>
                                <Chip label={selectedTransaction.status} size="small" color={getStatusColor(selectedTransaction.status)} />
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography color="text.secondary">Payment Method</Typography>
                                <Typography>{selectedTransaction.method}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography color="text.secondary">Customer</Typography>
                                <Typography>{selectedTransaction.user?.name}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography color="text.secondary">Service</Typography>
                                <Typography>{selectedTransaction.booking?.service?.title || 'N/A'}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography color="text.secondary">Date</Typography>
                                <Typography>{dayjs(selectedTransaction.createdAt).format('MMM D, YYYY h:mm A')}</Typography>
                            </Box>
                            {selectedTransaction.razorpayOrderId && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography color="text.secondary">Razorpay Order</Typography>
                                    <Typography fontFamily="monospace" fontSize="small">{selectedTransaction.razorpayOrderId}</Typography>
                                </Box>
                            )}
                            {selectedTransaction.refundedAmount && (
                                <>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography color="text.secondary">Refunded Amount</Typography>
                                        <Typography color="error">₹{selectedTransaction.refundedAmount.toLocaleString()}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography color="text.secondary">Refunded At</Typography>
                                        <Typography>{dayjs(selectedTransaction.refundedAt).format('MMM D, YYYY h:mm A')}</Typography>
                                    </Box>
                                </>
                            )}
                            {selectedTransaction.failureReason && (
                                <Box sx={{ bgcolor: COLORS.error + '20', p: 2, borderRadius: 1 }}>
                                    <Typography color="error" fontWeight="bold">Failure Reason</Typography>
                                    <Typography>{selectedTransaction.failureReason}</Typography>
                                </Box>
                            )}
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Refund Dialog */}
            <Dialog open={refundDialogOpen} onClose={() => setRefundDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Process Refund</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            Original Amount: ₹{selectedTransaction?.amount.toLocaleString()}
                        </Typography>
                        <TextField
                            label="Refund Amount"
                            type="number"
                            value={refundAmount}
                            onChange={(e) => setRefundAmount(e.target.value)}
                            InputProps={{
                                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                            }}
                            fullWidth
                        />
                        <TextField
                            label="Reason (optional)"
                            value={refundReason}
                            onChange={(e) => setRefundReason(e.target.value)}
                            multiline
                            rows={2}
                            fullWidth
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRefundDialogOpen(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        color="warning"
                        onClick={handleProcessRefund}
                        disabled={loading || !refundAmount}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Process Refund'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TransactionsPage;
