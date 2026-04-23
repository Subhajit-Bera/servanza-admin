import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import client from '../../api/client';
import type { RootState } from '..';

// Types
export interface Review {
    id: string;
    bookingId: string;
    userId: string;
    buddyId: string;
    rating: number;
    comment?: string;
    createdAt: string;
    updatedAt: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
    buddy: {
        id: string;
        user: {
            name: string;
        };
    };
    booking: {
        id: string;
        service?: {
            title: string;
        };
    };
}

interface ReviewsState {
    reviews: Review[];
    selectedReview: Review | null;
    loading: boolean;
    error: string | null;
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
    filters: {
        rating?: number;
        buddyId?: string;
        sortBy?: string;
        sortOrder?: string;
    };
}

const initialState: ReviewsState = {
    reviews: [],
    selectedReview: null,
    loading: false,
    error: null,
    pagination: {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0,
    },
    filters: {},
};

// Async Thunks
export const fetchReviews = createAsyncThunk(
    'reviews/fetchReviews',
    async (params: { page?: number; limit?: number; rating?: number; status?: string; buddyId?: string; sortBy?: string; sortOrder?: string } = {}, { rejectWithValue }) => {
        try {
            const response = await client.get('/admin/reviews', { params });
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch reviews');
        }
    }
);

export const fetchReviewById = createAsyncThunk(
    'reviews/fetchReviewById',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await client.get(`/admin/reviews/${id}`);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch review');
        }
    }
);

export const deleteReview = createAsyncThunk(
    'reviews/deleteReview',
    async ({ reviewId, reason }: { reviewId: string; reason?: string }, { rejectWithValue }) => {
        try {
            await client.delete(`/admin/reviews/${reviewId}`, { data: { reason } });
            return reviewId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete review');
        }
    }
);

// Slice
const reviewsSlice = createSlice({
    name: 'reviews',
    initialState,
    reducers: {
        clearSelectedReview: (state) => {
            state.selectedReview = null;
        },
        setFilters: (state, action) => {
            state.filters = action.payload;
        },
        clearFilters: (state) => {
            state.filters = {};
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Reviews
            .addCase(fetchReviews.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchReviews.fulfilled, (state, action) => {
                state.loading = false;
                state.reviews = action.payload.reviews;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchReviews.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Fetch Review by ID
            .addCase(fetchReviewById.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchReviewById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedReview = action.payload;
            })
            .addCase(fetchReviewById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Delete Review
            .addCase(deleteReview.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteReview.fulfilled, (state, action) => {
                state.loading = false;
                state.reviews = state.reviews.filter(r => r.id !== action.payload);
            })
            .addCase(deleteReview.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearSelectedReview, setFilters, clearFilters } = reviewsSlice.actions;

// Selectors
export const selectReviews = (state: RootState) => state.reviews.reviews;
export const selectReviewsLoading = (state: RootState) => state.reviews.loading;
export const selectSelectedReview = (state: RootState) => state.reviews.selectedReview;
export const selectReviewsPagination = (state: RootState) => state.reviews.pagination;

export default reviewsSlice.reducer;
