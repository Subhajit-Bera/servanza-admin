import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../api/client';
import type { DashboardStats, AnalyticsData, RecentBooking, TopBuddy } from '../../api/types';

interface DashboardState {
    stats: DashboardStats | null;
    analytics: AnalyticsData | null;
    recentBookings: RecentBooking[];
    topBuddies: TopBuddy[];
    loading: boolean;
    error: string | null;
    lastUpdated: string | null;
}

const initialState: DashboardState = {
    stats: null,
    analytics: null,
    recentBookings: [],
    topBuddies: [],
    loading: false,
    error: null,
    lastUpdated: null,
};

// Fetch dashboard stats
export const fetchDashboardStats = createAsyncThunk<any, void>(
    'dashboard/fetchStats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/admin/dashboard');
            return response.data.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch dashboard stats');
        }
    }
);

// Fetch analytics data
export const fetchAnalytics = createAsyncThunk(
    'dashboard/fetchAnalytics',
    async (params: { startDate?: string; endDate?: string } = {}, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/admin/analytics', { params });
            return response.data.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch analytics');
        }
    }
);

// Fetch recent bookings
export const fetchRecentBookings = createAsyncThunk<any, void>(
    'dashboard/fetchRecentBookings',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/admin/bookings', {
                params: { limit: 10, page: 1 }
            });
            return response.data.data.bookings || response.data.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch recent bookings');
        }
    }
);

// Fetch top buddies
export const fetchTopBuddies = createAsyncThunk<any, void>(
    'dashboard/fetchTopBuddies',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/admin/buddies', {
                params: { limit: 5, page: 1, sortBy: 'rating', sortOrder: 'desc' }
            });
            return response.data.data.buddies || response.data.data;
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch top buddies');
        }
    }
);

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {
        clearDashboard: (state) => {
            state.stats = null;
            state.analytics = null;
            state.recentBookings = [];
            state.topBuddies = [];
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch stats
            .addCase(fetchDashboardStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDashboardStats.fulfilled, (state, action) => {
                state.loading = false;
                state.stats = action.payload;
                state.lastUpdated = new Date().toISOString();
            })
            .addCase(fetchDashboardStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Fetch analytics
            .addCase(fetchAnalytics.fulfilled, (state, action) => {
                state.analytics = action.payload;
            })
            // Fetch recent bookings
            .addCase(fetchRecentBookings.fulfilled, (state, action) => {
                state.recentBookings = action.payload;
            })
            // Fetch top buddies
            .addCase(fetchTopBuddies.fulfilled, (state, action) => {
                state.topBuddies = action.payload;
            });
    },
});

export const { clearDashboard } = dashboardSlice.actions;
export default dashboardSlice.reducer;
