import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import client from '../../api/client';
import type { Booking, UpdateBookingStatusPayload } from '../../api/types';

interface BookingsState {
    list: Booking[];
    selectedBooking: Booking | null;
    loading: boolean;
    error: string | null;
    filters: {
        status: string;
        dateRange: [string | null, string | null];
        search: string;
    };
    pagination: {
        page: number;
        limit: number;
        total: number;
    };
}

const initialState: BookingsState = {
    list: [],
    selectedBooking: null,
    loading: false,
    error: null,
    filters: {
        status: 'ALL',
        dateRange: [null, null],
        search: '',
    },
    pagination: {
        page: 1,
        limit: 10,
        total: 0,
    },
};

export interface FetchBookingsParams {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
}

export const fetchBookings = createAsyncThunk(
    'bookings/fetchBookings',
    async (params: FetchBookingsParams, { rejectWithValue }) => {
        try {
            // Sanitize params: Remove 'ALL' status
            const queryParams: any = { ...params };
            if (queryParams.status === 'ALL') {
                delete queryParams.status;
            }

            const response = await client.get<any>('/admin/bookings', { params: queryParams });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch bookings');
        }
    }
);

export const fetchBookingById = createAsyncThunk(
    'bookings/fetchBookingById',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await client.get<any>(`/admin/bookings/${id}`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch booking details');
        }
    }
);

export const assignBuddy = createAsyncThunk(
    'bookings/assignBuddy',
    async ({ bookingId, buddyId }: { bookingId: string; buddyId: string }, { rejectWithValue }) => {
        try {
            const response = await client.post<any>(`/admin/bookings/${bookingId}/assign`, { buddyId });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to assign buddy');
        }
    }
);

export const updateBookingStatus = createAsyncThunk(
    'bookings/updateStatus',
    async ({ id, payload }: { id: string; payload: UpdateBookingStatusPayload }, { rejectWithValue }) => {
        try {
            const response = await client.patch<Booking>(`/admin/bookings/${id}/status`, payload);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update booking status');
        }
    }
);

export const cancelBooking = createAsyncThunk(
    'bookings/cancelBooking',
    async ({ id, reason }: { id: string; reason?: string }, { rejectWithValue }) => {
        try {
            const response = await client.patch<any>(`/admin/bookings/${id}/cancel`, { reason });
            return response.data?.data || response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to cancel booking');
        }
    }
);

export const processRefund = createAsyncThunk(
    'bookings/processRefund',
    async ({ id, amount, reason }: { id: string; amount?: number; reason?: string }, { rejectWithValue }) => {
        try {
            const response = await client.post<any>(`/admin/bookings/${id}/refund`, { amount, reason });
            return response.data?.data || response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to process refund');
        }
    }
);

const bookingsSlice = createSlice({
    name: 'bookings',
    initialState,
    reducers: {
        setFilters: (state, action: PayloadAction<Partial<BookingsState['filters']>>) => {
            state.filters = { ...state.filters, ...action.payload };
            state.pagination.page = 1; // Reset to first page on filter change
        },
        setPage: (state, action: PayloadAction<number>) => {
            state.pagination.page = action.payload;
        },
        clearSelectedBooking: (state) => {
            state.selectedBooking = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Bookings
            .addCase(fetchBookings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBookings.fulfilled, (state, action) => {
                state.loading = false;
                const payload = action.payload;

                // Handle: { success: true, data: { bookings: [], pagination: {} } }
                if (payload?.data?.bookings && Array.isArray(payload.data.bookings)) {
                    state.list = payload.data.bookings;
                    if (payload.data.pagination) {
                        state.pagination.total = payload.data.pagination.total;
                        state.pagination.limit = payload.data.pagination.limit;
                        state.pagination.page = payload.data.pagination.page;
                    } else {
                        // Fallback if pagination missing but meta present?
                        state.pagination.total = payload.meta?.total || payload.total || state.list.length;
                    }
                } else if (Array.isArray(payload)) {
                    // Direct array?
                    state.list = payload;
                    state.pagination.total = payload.length;
                } else if (payload && Array.isArray(payload.data)) {
                    // { data: [...] } format
                    state.list = payload.data;
                    state.pagination.total = payload.meta?.total || payload.total || payload.data.length;
                } else {
                    state.list = [];
                    console.warn('Unexpected bookings API response format:', payload);
                }
            })
            .addCase(fetchBookings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Fetch Single Booking
            .addCase(fetchBookingById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBookingById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedBooking = action.payload.data || action.payload;
            })
            .addCase(fetchBookingById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Update Status
            .addCase(updateBookingStatus.fulfilled, (state, action) => {
                if (state.selectedBooking && state.selectedBooking.id === action.payload.id) {
                    state.selectedBooking = action.payload; // Update full object if returned
                }
                const index = state.list.findIndex(b => b.id === action.payload.id);
                if (index !== -1) {
                    state.list[index] = { ...state.list[index], status: action.payload.status };
                }
            })
            // Assign Buddy
            .addCase(assignBuddy.fulfilled, (state, action) => {
                if (state.selectedBooking && state.selectedBooking.id === action.payload.id) {
                    state.selectedBooking = action.payload;
                }
                // Also update list item if needed
                const index = state.list.findIndex(b => b.id === action.payload.id);
                if (index !== -1) {
                    // Replace the entire booking object in the list with the updated one from payload
                    state.list[index] = action.payload;
                }
            });
    },
});

export const { setFilters, setPage, clearSelectedBooking } = bookingsSlice.actions;
export default bookingsSlice.reducer;
