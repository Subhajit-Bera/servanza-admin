import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import client from '../../api/client';
import type { Buddy, BuddyDetails, BuddyVerificationPayload } from '../../api/types';

interface ApiResponse<T> {
    success: boolean;
    data: T;
}

interface BuddiesResponse {
    buddies: Buddy[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

interface BuddiesState {
    list: Buddy[];
    selectedBuddy: BuddyDetails | null;
    loading: boolean;
    error: string | null;
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

const initialState: BuddiesState = {
    list: [],
    selectedBuddy: null,
    loading: false,
    error: null,
    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
    },
};

// Async Thunks

export const fetchBuddies = createAsyncThunk(
    'buddies/fetchBuddies',
    async (
        { page = 1, limit = 10, search = '', isVerified, isAvailable }:
            { page?: number; limit?: number; search?: string; isVerified?: boolean; isAvailable?: boolean },
        { rejectWithValue }
    ) => {
        try {
            const params: any = { page, limit, search };
            if (isVerified !== undefined) params.isVerified = isVerified;
            if (isAvailable !== undefined) params.isAvailable = isAvailable;

            const response = await client.get<ApiResponse<BuddiesResponse>>('/admin/buddies', { params });
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch buddies');
        }
    }
);

export const fetchBuddyById = createAsyncThunk(
    'buddies/fetchBuddyById',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await client.get<ApiResponse<BuddyDetails>>(`/admin/buddies/${id}`);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch buddy details');
        }
    }

);

export const fetchAvailableBuddies = createAsyncThunk(
    'buddies/fetchAvailableBuddies',
    async (
        { scheduledStart, scheduledEnd, search = '' }: { scheduledStart: string; scheduledEnd: string; search?: string },
        { rejectWithValue }
    ) => {
        try {
            // Assuming the backend supports 'unavailableStart' and 'unavailableEnd' to filter out busy buddies
            const response = await client.get<ApiResponse<BuddiesResponse>>('/admin/buddies', {
                params: {
                    isAvailable: true, // General availability
                    unavailableStart: scheduledStart, // Custom params to filter by time slot
                    unavailableEnd: scheduledEnd,
                    search,
                    limit: 100 // Fetch decent number of available buddies
                }
            });
            return response.data.data.buddies;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch available buddies');
        }
    }
);

export const verifyBuddyField = createAsyncThunk(
    'buddies/verifyField',
    async ({ buddyId, field, comment }: BuddyVerificationPayload, { rejectWithValue }) => {
        try {
            await client.post(`/admin/buddies/${buddyId}/verify-field`, { field, comment });
            return { buddyId, field, status: 'verified' };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to verify field');
        }
    }
);

export const rejectBuddyField = createAsyncThunk(
    'buddies/rejectField',
    async ({ buddyId, field, comment }: BuddyVerificationPayload, { rejectWithValue }) => {
        try {
            await client.post(`/admin/buddies/${buddyId}/reject-field`, { field, comment });
            return { buddyId, field, status: 'rejected' };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to reject field');
        }
    }
);

const buddiesSlice = createSlice({
    name: 'buddies',
    initialState,
    reducers: {
        clearSelectedBuddy: (state) => {
            state.selectedBuddy = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Buddies
            .addCase(fetchBuddies.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBuddies.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload.buddies;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchBuddies.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Fetch Buddy Details
            .addCase(fetchBuddyById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBuddyById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedBuddy = action.payload;
            })
            .addCase(fetchBuddyById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Verify Field
            .addCase(verifyBuddyField.fulfilled, (state, action) => {
                if (state.selectedBuddy && state.selectedBuddy.id === action.payload.buddyId) {
                    // Logic to update local state if complex status tracking exists
                }
            })
            .addCase(rejectBuddyField.fulfilled, (_state, _action) => {
                // Similar logic
            })
            // Fetch Available Buddies
            .addCase(fetchAvailableBuddies.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAvailableBuddies.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload;
            })
            .addCase(fetchAvailableBuddies.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearSelectedBuddy } = buddiesSlice.actions;
export default buddiesSlice.reducer;
