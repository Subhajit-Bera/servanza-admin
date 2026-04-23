import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import client from '../../api/client';
import type { RootState } from '..';

// Types
export interface OnlineBuddy {
    id: string;
    name: string;
    phone?: string;
    profileImage?: string;
    isAvailable: boolean;
    isOnline: boolean;
    latitude: number | null;
    longitude: number | null;
    lastLocationTime: string | null;
    rating: number;
    totalJobs: number;
    activeBooking: {
        id: string;
        status: string;
        service: { title: string };
    } | null;
}

interface TrackingState {
    buddies: OnlineBuddy[];
    loading: boolean;
    error: string | null;
    lastUpdated: string | null;
}

const initialState: TrackingState = {
    buddies: [],
    loading: false,
    error: null,
    lastUpdated: null,
};

// Async Thunks
export const fetchOnlineBuddies = createAsyncThunk(
    'tracking/fetchOnlineBuddies',
    async (_, { rejectWithValue }) => {
        try {
            const response = await client.get('/admin/tracking/buddies');
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch online buddies');
        }
    }
);

// Slice
const trackingSlice = createSlice({
    name: 'tracking',
    initialState,
    reducers: {
        updateBuddyLocation: (state, action) => {
            const { buddyId, latitude, longitude, timestamp } = action.payload;
            const buddy = state.buddies.find(b => b.id === buddyId);
            if (buddy) {
                buddy.latitude = latitude;
                buddy.longitude = longitude;
                buddy.lastLocationTime = timestamp;
            }
        },
        addOnlineBuddy: (state, action) => {
            const exists = state.buddies.find(b => b.id === action.payload.id);
            if (!exists) {
                state.buddies.push(action.payload);
            }
        },
        removeOfflineBuddy: (state, action) => {
            state.buddies = state.buddies.filter(b => b.id !== action.payload);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchOnlineBuddies.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOnlineBuddies.fulfilled, (state, action) => {
                state.loading = false;
                state.buddies = action.payload;
                state.lastUpdated = new Date().toISOString();
            })
            .addCase(fetchOnlineBuddies.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { updateBuddyLocation, addOnlineBuddy, removeOfflineBuddy } = trackingSlice.actions;

// Selectors
export const selectOnlineBuddies = (state: RootState) => state.tracking.buddies;
export const selectTrackingLoading = (state: RootState) => state.tracking.loading;
export const selectLastUpdated = (state: RootState) => state.tracking.lastUpdated;

export default trackingSlice.reducer;
