import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import client from '../../api/client';
import type { Coupon, CreateCouponPayload, UpdateCouponPayload } from '../../api/types';

interface CouponsState {
    coupons: Coupon[];
    loading: boolean;
    error: string | null;
}

const initialState: CouponsState = {
    coupons: [],
    loading: false,
    error: null,
};

export const fetchCoupons = createAsyncThunk(
    'coupons/fetchCoupons',
    async (_, { rejectWithValue }) => {
        try {
            const response = await client.get('/admin/coupons');
            // Assuming the backend might wrap in data or return directly
            return response.data.data || response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch coupons');
        }
    }
);

export const createCoupon = createAsyncThunk(
    'coupons/createCoupon',
    async (payload: CreateCouponPayload, { rejectWithValue }) => {
        try {
            const response = await client.post('/admin/coupons', payload);
            return response.data.data || response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create coupon');
        }
    }
);

export const updateCoupon = createAsyncThunk(
    'coupons/updateCoupon',
    async ({ id, payload }: { id: string; payload: UpdateCouponPayload }, { rejectWithValue }) => {
        try {
            const response = await client.put(`/admin/coupons/${id}`, payload);
            return response.data.data || response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update coupon');
        }
    }
);

export const deleteCoupon = createAsyncThunk(
    'coupons/deleteCoupon',
    async (id: string, { rejectWithValue }) => {
        try {
            await client.delete(`/admin/coupons/${id}`);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete coupon');
        }
    }
);

const couponsSlice = createSlice({
    name: 'coupons',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCoupons.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCoupons.fulfilled, (state, action) => {
                state.loading = false;
                state.coupons = action.payload;
            })
            .addCase(fetchCoupons.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(createCoupon.fulfilled, (state, action) => {
                state.coupons.unshift(action.payload);
            })
            .addCase(updateCoupon.fulfilled, (state, action) => {
                const index = state.coupons.findIndex(c => c.id === action.payload.id);
                if (index !== -1) {
                    state.coupons[index] = action.payload;
                }
            })
            .addCase(deleteCoupon.fulfilled, (state, action) => {
                state.coupons = state.coupons.filter(c => c.id !== action.payload);
            });
    },
});

export default couponsSlice.reducer;
