import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import client from '../../api/client';
import type { User } from '../../api/types';


interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

interface CheckUsersResponse {
    users: User[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

interface CustomersState {
    list: User[];
    selectedCustomer: User | null;
    loading: boolean;
    error: string | null;
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

const initialState: CustomersState = {
    list: [],
    selectedCustomer: null,
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
export const fetchCustomers = createAsyncThunk(
    'customers/fetchCustomers',
    async ({ page = 1, limit = 10, search = '', sortBy, sortOrder }: { page?: number; limit?: number; search?: string; sortBy?: string; sortOrder?: string }, { rejectWithValue }) => {
        try {
            const response = await client.get<ApiResponse<CheckUsersResponse>>('/admin/users', {
                params: { role: 'USER', page, limit, search, sortBy, sortOrder },
            });
            // Access nested data: response.data (body) -> .data (payload)
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch customers');
        }
    }
);

export const fetchCustomerById = createAsyncThunk(
    'customers/fetchCustomerById',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await client.get<ApiResponse<User>>(`/admin/users/${id}`);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch customer details');
        }
    }
);

export const toggleCustomerStatus = createAsyncThunk(
    'customers/toggleStatus',
    async ({ id, isActive }: { id: string; isActive: boolean }, { rejectWithValue }) => {
        try {
            const endpoint = isActive ? 'activate' : 'deactivate';
            await client.patch(`/admin/users/${id}/${endpoint}`);
            return { id, isActive };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update status');
        }
    }
);

const customersSlice = createSlice({
    name: 'customers',
    initialState,
    reducers: {
        clearSelectedCustomer: (state) => {
            state.selectedCustomer = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Customers
            .addCase(fetchCustomers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCustomers.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload.users || [];
                state.pagination = action.payload.pagination || { page: 1, limit: 10, total: 0, pages: 0 };
            })
            .addCase(fetchCustomers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Fetch Customer By ID
            .addCase(fetchCustomerById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCustomerById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedCustomer = action.payload;
            })
            .addCase(fetchCustomerById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Toggle Status
            .addCase(toggleCustomerStatus.fulfilled, (state, action) => {
                const { id, isActive } = action.payload;
                const user = state.list.find((u) => u.id === id);
                if (user) {
                    user.isActive = isActive;
                }
                if (state.selectedCustomer && state.selectedCustomer.id === id) {
                    state.selectedCustomer.isActive = isActive;
                }
            });
    },
});

export const { clearSelectedCustomer } = customersSlice.actions;
export default customersSlice.reducer;
