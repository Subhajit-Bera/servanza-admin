import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import client from '../../api/client';
import type { Promotion, CreatePromotionPayload, UpdatePromotionPayload } from '../../api/types';

interface PromotionsState {
    promotions: Promotion[];
    loading: boolean;
    error: string | null;
}

const initialState: PromotionsState = {
    promotions: [],
    loading: false,
    error: null,
};

export const fetchPromotions = createAsyncThunk(
    'promotions/fetchPromotions',
    async (_, { rejectWithValue }) => {
        try {
            const response = await client.get<any>('/promotions?all=true');
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch promotions');
        }
    }
);

export const createPromotion = createAsyncThunk(
    'promotions/createPromotion',
    async (payload: CreatePromotionPayload, { rejectWithValue }) => {
        try {
            const response = await client.post<any>('/promotions', payload);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create promotion');
        }
    }
);

export const updatePromotion = createAsyncThunk(
    'promotions/updatePromotion',
    async ({ id, payload }: { id: string; payload: UpdatePromotionPayload }, { rejectWithValue }) => {
        try {
            const response = await client.put<any>(`/promotions/${id}`, payload);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update promotion');
        }
    }
);

export const deletePromotion = createAsyncThunk(
    'promotions/deletePromotion',
    async (id: string, { rejectWithValue }) => {
        try {
            await client.delete(`/promotions/${id}`);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete promotion');
        }
    }
);

export const uploadPromotionImage = createAsyncThunk(
    'promotions/uploadPromotionImage',
    async ({ promotionId, file }: { promotionId: string; file: File }, { rejectWithValue }) => {
        try {
            const formData = new FormData();
            formData.append('image', file);
            const response = await client.post<any>(`/promotions/${promotionId}/image`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return { promotionId, imageUrl: response.data.data?.imageUrl || response.data.imageUrl };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to upload promotion image');
        }
    }
);

const promotionsSlice = createSlice({
    name: 'promotions',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchPromotions.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchPromotions.fulfilled, (state, action) => {
                state.loading = false;
                const payload = action.payload;
                if (Array.isArray(payload)) {
                    state.promotions = payload;
                } else if (payload?.data && Array.isArray(payload.data)) {
                    state.promotions = payload.data;
                } else {
                    state.promotions = [];
                }
            })
            .addCase(fetchPromotions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(createPromotion.fulfilled, (state, action) => {
                const newPromo = action.payload.data || action.payload;
                if (newPromo?.id) {
                    state.promotions.push(newPromo);
                }
            })
            .addCase(updatePromotion.fulfilled, (state, action) => {
                const updated = action.payload.data || action.payload;
                const index = state.promotions.findIndex(p => p.id === updated.id);
                if (index !== -1) {
                    state.promotions[index] = updated;
                }
            })
            .addCase(deletePromotion.fulfilled, (state, action) => {
                state.promotions = state.promotions.filter(p => p.id !== action.payload);
            })
            .addCase(uploadPromotionImage.fulfilled, (state, action) => {
                const index = state.promotions.findIndex(p => p.id === action.payload.promotionId);
                if (index !== -1) {
                    state.promotions[index].imageUrl = action.payload.imageUrl;
                }
            });
    },
});

export default promotionsSlice.reducer;
