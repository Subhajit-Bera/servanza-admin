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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stack,
    CircularProgress,
    Tooltip,
    Rating,
    TextField,
    Avatar,
} from '@mui/material';
import {
    Delete as DeleteIcon,
    Refresh as RefreshIcon,
    Visibility as ViewIcon,
    PersonOutline as PersonIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
    fetchReviews,
    deleteReview,
    selectReviews,
    selectReviewsLoading,
    selectReviewsPagination,
} from '../../store/slices/reviewsSlice';
import type { Review } from '../../store/slices/reviewsSlice';
import { COLORS } from '../../theme';
import { PermissionGate } from '../../components/common/PermissionGate';
import dayjs from 'dayjs';

const ReviewsPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const reviews = useAppSelector(selectReviews);
    const loading = useAppSelector(selectReviewsLoading);
    const pagination = useAppSelector(selectReviewsPagination);

    // Filters
    const [rating, setRating] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sortOrder, setSortOrder] = useState('desc');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);

    // Dialogs
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);
    const [deleteReason, setDeleteReason] = useState('');

    useEffect(() => {
        loadReviews();
    }, [page, rowsPerPage, rating, statusFilter, sortOrder]);

    const loadReviews = () => {
        dispatch(fetchReviews({
            page: page + 1,
            limit: rowsPerPage,
            rating: rating ? parseInt(rating) : undefined,
            status: statusFilter || undefined,
            sortBy: 'createdAt',
            sortOrder,
        }));
    };

    const handleViewReview = (review: Review) => {
        setSelectedReview(review);
        setViewDialogOpen(true);
    };

    const handleOpenDeleteDialog = (review: Review) => {
        setSelectedReview(review);
        setDeleteReason('');
        setDeleteDialogOpen(true);
    };

    const handleDeleteReview = async () => {
        if (!selectedReview) return;

        await dispatch(deleteReview({
            reviewId: selectedReview.id,
            reason: deleteReason,
        }));

        setDeleteDialogOpen(false);
        loadReviews();
    };

    const getRatingColor = (rating: number): string => {
        if (rating >= 4) return COLORS.success;
        if (rating >= 3) return COLORS.warning;
        return COLORS.error;
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h1">Reviews</Typography>
                <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={loadReviews}
                    disabled={loading}
                >
                    Refresh
                </Button>
            </Box>

            {/* Filters */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Rating</InputLabel>
                        <Select
                            value={rating}
                            label="Rating"
                            onChange={(e) => setRating(e.target.value)}
                        >
                            <MenuItem value="">All Ratings</MenuItem>
                            <MenuItem value="5">5 Stars</MenuItem>
                            <MenuItem value="4">4 Stars</MenuItem>
                            <MenuItem value="3">3 Stars</MenuItem>
                            <MenuItem value="2">2 Stars</MenuItem>
                            <MenuItem value="1">1 Star</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={statusFilter}
                            label="Status"
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <MenuItem value="">All Status</MenuItem>
                            <MenuItem value="published">Published</MenuItem>
                            <MenuItem value="hidden">Hidden</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Sort By</InputLabel>
                        <Select
                            value={sortOrder}
                            label="Sort By"
                            onChange={(e) => setSortOrder(e.target.value)}
                        >
                            <MenuItem value="desc">Newest First</MenuItem>
                            <MenuItem value="asc">Oldest First</MenuItem>
                        </Select>
                    </FormControl>
                </Stack>
            </Paper>

            {/* Reviews Table */}
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
                                    <TableCell>Customer</TableCell>
                                    <TableCell>Buddy</TableCell>
                                    <TableCell>Service</TableCell>
                                    <TableCell>Rating</TableCell>
                                    <TableCell sx={{ maxWidth: 300 }}>Comment</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {reviews.map((review) => (
                                    <TableRow key={review.id} hover>
                                        <TableCell>
                                            {dayjs(review.createdAt).format('MMM D, YYYY')}
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Avatar sx={{ width: 32, height: 32, bgcolor: COLORS.primary }}>
                                                    <PersonIcon fontSize="small" />
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body2" fontWeight="bold">
                                                        {review.user?.name || 'Unknown'}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {review.user?.email}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {review.buddy?.user?.name || 'Unknown'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {review.booking?.service?.title || 'N/A'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Rating value={review.rating} readOnly size="small" />
                                                <Chip
                                                    label={review.rating}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: getRatingColor(review.rating),
                                                        color: '#fff',
                                                        fontWeight: 'bold',
                                                    }}
                                                />
                                            </Stack>
                                        </TableCell>
                                        <TableCell sx={{ maxWidth: 300 }}>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                }}
                                            >
                                                {review.comment || '-'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="View Details">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleViewReview(review)}
                                                >
                                                    <ViewIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <PermissionGate permission="reviews.delete">
                                                <Tooltip title="Delete Review">
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleOpenDeleteDialog(review)}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </PermissionGate>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {reviews.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                            <Typography color="text.secondary">
                                                No reviews found
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

            {/* View Review Dialog */}
            <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Review Details</DialogTitle>
                <DialogContent dividers>
                    {selectedReview && (
                        <Stack spacing={3}>
                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                <Rating value={selectedReview.rating} readOnly size="large" />
                            </Box>

                            <Stack spacing={2}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography color="text.secondary">Customer</Typography>
                                    <Typography fontWeight="bold">{selectedReview.user?.name}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography color="text.secondary">Buddy</Typography>
                                    <Typography>{selectedReview.buddy?.user?.name}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography color="text.secondary">Service</Typography>
                                    <Typography>{selectedReview.booking?.service?.title || 'N/A'}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography color="text.secondary">Date</Typography>
                                    <Typography>{dayjs(selectedReview.createdAt).format('MMM D, YYYY h:mm A')}</Typography>
                                </Box>
                            </Stack>

                            {selectedReview.comment && (
                                <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                                    <Typography color="text.secondary" gutterBottom>Comment</Typography>
                                    <Typography>{selectedReview.comment}</Typography>
                                </Box>
                            )}
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
                    <PermissionGate permission="reviews.delete">
                        <Button
                            color="error"
                            onClick={() => {
                                setViewDialogOpen(false);
                                if (selectedReview) handleOpenDeleteDialog(selectedReview);
                            }}
                        >
                            Delete Review
                        </Button>
                    </PermissionGate>
                </DialogActions>
            </Dialog>

            {/* Delete Review Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle color="error">Delete Review</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <Typography>
                            Are you sure you want to delete this review by <strong>{selectedReview?.user?.name}</strong>?
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            This will also update the buddy's average rating.
                        </Typography>
                        <TextField
                            label="Reason for deletion (optional)"
                            value={deleteReason}
                            onChange={(e) => setDeleteReason(e.target.value)}
                            multiline
                            rows={2}
                            fullWidth
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleDeleteReview}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Delete Review'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ReviewsPage;
