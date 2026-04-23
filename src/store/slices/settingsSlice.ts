import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import client from '../../api/client';
import type { RootState } from '..';

// Types
export interface SystemConfig {
    [key: string]: string | number | boolean;
}

export interface AdminUser {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    lastLogin?: string;
}

interface SettingsState {
    config: SystemConfig | null;
    admins: AdminUser[];
    loading: boolean;
    saving: boolean;
    error: string | null;
}

const initialState: SettingsState = {
    config: null,
    admins: [],
    loading: false,
    saving: false,
    error: null,
};

// Async Thunks
export const fetchConfig = createAsyncThunk(
    'settings/fetchConfig',
    async (_, { rejectWithValue }) => {
        try {
            const response = await client.get('/admin/config');
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch config');
        }
    }
);

export const updateConfig = createAsyncThunk(
    'settings/updateConfig',
    async (updates: Partial<SystemConfig>, { rejectWithValue }) => {
        try {
            const response = await client.put('/admin/config', updates);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update config');
        }
    }
);

// Slice
const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Config
            .addCase(fetchConfig.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchConfig.fulfilled, (state, action) => {
                state.loading = false;
                state.config = action.payload;
            })
            .addCase(fetchConfig.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Update Config
            .addCase(updateConfig.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(updateConfig.fulfilled, (state, action) => {
                state.saving = false;
                state.config = action.payload;
            })
            .addCase(updateConfig.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearError } = settingsSlice.actions;

// Selectors
export const selectConfig = (state: RootState) => state.settings.config;
export const selectSettingsLoading = (state: RootState) => state.settings.loading;
export const selectSettingsSaving = (state: RootState) => state.settings.saving;

export default settingsSlice.reducer;
