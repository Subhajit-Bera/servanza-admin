import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import client from '../../api/client';
import type { RootState } from '..';

// Types
export interface RevenueData {
    date: string;
    revenue: number;
    count: number;
}

export interface BookingTrendData {
    date: string;
    count: number;
}

export interface TopService {
    serviceId: string;
    serviceName: string;
    count: number;
}

export interface TopBuddy {
    buddyId: string;
    buddyName: string;
    rating: number;
    completedJobs: number;
}

interface ReportsState {
    revenue: {
        byPeriod: RevenueData[];
        byMethod: { method: string; revenue: number; count: number }[];
        totals: {
            totalRevenue: number;
            totalTransactions: number;
            averageTransaction: number;
            totalRefunds: number;
            refundCount: number;
        };
    } | null;
    bookings: {
        byDay: BookingTrendData[];
        byStatus: { status: string; count: number }[];
        topServices: TopService[];
        topBuddies: TopBuddy[];
    } | null;
    loading: boolean;
    error: string | null;
    filters: {
        startDate: string | null;
        endDate: string | null;
    };
}

const initialState: ReportsState = {
    revenue: null,
    bookings: null,
    loading: false,
    error: null,
    filters: {
        startDate: null,
        endDate: null,
    },
};

// Async Thunks
export const fetchRevenueReport = createAsyncThunk(
    'reports/fetchRevenueReport',
    async (params: { startDate?: string; endDate?: string; groupBy?: string } = {}, { rejectWithValue }) => {
        try {
            const response = await client.get('/admin/reports/revenue', { params });
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch revenue report');
        }
    }
);

export const fetchBookingReport = createAsyncThunk(
    'reports/fetchBookingReport',
    async (params: { startDate?: string; endDate?: string } = {}, { rejectWithValue }) => {
        try {
            const response = await client.get('/admin/reports/bookings', { params });
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch booking report');
        }
    }
);

// Slice
const reportsSlice = createSlice({
    name: 'reports',
    initialState,
    reducers: {
        setDateFilters: (state, action) => {
            state.filters = action.payload;
        },
        clearReports: (state) => {
            state.revenue = null;
            state.bookings = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Revenue Report
            .addCase(fetchRevenueReport.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRevenueReport.fulfilled, (state, action) => {
                state.loading = false;
                state.revenue = {
                    byPeriod: action.payload.revenueByPeriod,
                    byMethod: action.payload.revenueByMethod,
                    totals: action.payload.totals,
                };
            })
            .addCase(fetchRevenueReport.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Booking Report
            .addCase(fetchBookingReport.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchBookingReport.fulfilled, (state, action) => {
                state.loading = false;
                state.bookings = {
                    byDay: action.payload.bookingsByDay,
                    byStatus: action.payload.bookingsByStatus,
                    topServices: action.payload.topServices,
                    topBuddies: action.payload.topBuddies,
                };
            })
            .addCase(fetchBookingReport.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { setDateFilters, clearReports } = reportsSlice.actions;

// Selectors
export const selectRevenueReport = (state: RootState) => state.reports.revenue;
export const selectBookingReport = (state: RootState) => state.reports.bookings;
export const selectReportsLoading = (state: RootState) => state.reports.loading;
export const selectReportFilters = (state: RootState) => state.reports.filters;

export default reportsSlice.reducer;
