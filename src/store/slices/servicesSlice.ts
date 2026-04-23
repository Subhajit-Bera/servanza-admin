import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import client from '../../api/client';
import type { Service, Category, CreateServicePayload, UpdateServicePayload } from '../../api/types';

interface ServicesState {
    services: Service[];
    categories: Category[];
    loading: boolean;
    error: string | null;
}

const initialState: ServicesState = {
    services: [],
    categories: [],
    loading: false,
    error: null,
};

export const fetchServices = createAsyncThunk(
    'services/fetchServices',
    async (_, { rejectWithValue }) => {
        try {
            const response = await client.get<any>('/services');
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch services');
        }
    }
);

export const fetchServiceById = createAsyncThunk(
    'services/fetchServiceById',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await client.get<any>(`/services/${id}`);
            return response.data?.data || response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch service');
        }
    }
);

export const fetchCategories = createAsyncThunk(
    'services/fetchCategories',
    async (_, { rejectWithValue }) => {
        try {
            const response = await client.get<any>('/services/categories');
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
        }
    }
);

export const createCategory = createAsyncThunk(
    'services/createCategory',
    async (payload: { name: string; slug: string; description?: string; icon?: string }, { rejectWithValue }) => {
        try {
            const response = await client.post<any>('/services/categories', payload);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create category');
        }
    }
);

export const updateCategory = createAsyncThunk(
    'services/updateCategory',
    async ({ id, payload }: { id: string; payload: { name: string; slug?: string; description?: string; icon?: string } }, { rejectWithValue }) => {
        try {
            const response = await client.put<any>(`/services/categories/${id}`, payload);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update category');
        }
    }
);

export const createService = createAsyncThunk(
    'services/createService',
    async (payload: CreateServicePayload, { rejectWithValue }) => {
        try {
            const response = await client.post<any>('/services', payload);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create service');
        }
    }
);

export const updateService = createAsyncThunk(
    'services/updateService',
    async ({ id, payload }: { id: string; payload: UpdateServicePayload }, { rejectWithValue }) => {
        try {
            const response = await client.put<any>(`/services/${id}`, payload);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update service');
        }
    }
);

export const deleteService = createAsyncThunk(
    'services/deleteService',
    async (id: string, { rejectWithValue }) => {
        try {
            await client.delete(`/services/${id}`);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete service');
        }
    }
);

// Upload service image
export const uploadServiceImage = createAsyncThunk(
    'services/uploadServiceImage',
    async ({ serviceId, file }: { serviceId: string; file: File }, { rejectWithValue }) => {
        try {
            const formData = new FormData();
            formData.append('image', file);
            const response = await client.post<any>(`/services/${serviceId}/image`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return { serviceId, imageUrl: response.data.data?.imageUrl || response.data.imageUrl };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to upload service image');
        }
    }
);

// Upload category icon
export const uploadCategoryIcon = createAsyncThunk(
    'services/uploadCategoryIcon',
    async ({ categoryId, file }: { categoryId: string; file: File }, { rejectWithValue }) => {
        try {
            const formData = new FormData();
            formData.append('icon', file);
            const response = await client.post<any>(`/services/categories/${categoryId}/icon`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return { categoryId, icon: response.data.data?.icon || response.data.icon };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to upload category icon');
        }
    }
);

// Delete category
export const deleteCategory = createAsyncThunk(
    'services/deleteCategory',
    async (id: string, { rejectWithValue }) => {
        try {
            await client.delete(`/services/categories/${id}`);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete category');
        }
    }
);


const servicesSlice = createSlice({
    name: 'services',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch Services
            .addCase(fetchServices.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchServices.fulfilled, (state, action) => {
                state.loading = false;
                const payload = action.payload;
                if (Array.isArray(payload)) {
                    state.services = payload;
                } else if (payload && Array.isArray(payload.data)) {
                    state.services = payload.data;
                } else if (payload && payload.services && Array.isArray(payload.services)) {
                    state.services = payload.services;
                } else {
                    state.services = [];
                    console.warn('Unexpected services API response format:', payload);
                }
            })
            .addCase(fetchServices.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Fetch Categories
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.categories = action.payload.data || action.payload;
            })

            // Create Category
            .addCase(createCategory.fulfilled, (state, action) => {
                const newCategory = action.payload.data || action.payload;
                if (newCategory && newCategory.id) {
                    state.categories.push(newCategory);
                }
            })

            // Update Category
            .addCase(updateCategory.fulfilled, (state, action) => {
                const updatedCategory = action.payload.data || action.payload;
                const index = state.categories.findIndex(c => c.id === updatedCategory.id);
                if (index !== -1) {
                    state.categories[index] = updatedCategory;
                }
            })

            // Delete Category
            .addCase(deleteCategory.fulfilled, (state, action) => {
                state.categories = state.categories.filter(c => c.id !== action.payload);
            })

            // Create
            .addCase(createService.fulfilled, (state, action) => {
                const newService = action.payload.data || action.payload;
                if (newService && newService.id) {
                    state.services.push(newService);
                }
            })

            // Update
            .addCase(updateService.fulfilled, (state, action) => {
                const updatedService = action.payload.data || action.payload;
                const index = state.services.findIndex(s => s.id === updatedService.id);
                if (index !== -1) {
                    state.services[index] = updatedService;
                }
            })

            // Delete
            .addCase(deleteService.fulfilled, (state, action) => {
                state.services = state.services.filter(s => s.id !== action.payload);
            })

            // Upload Service Image
            .addCase(uploadServiceImage.fulfilled, (state, action) => {
                const index = state.services.findIndex(s => s.id === action.payload.serviceId);
                if (index !== -1) {
                    state.services[index].imageUrl = action.payload.imageUrl;
                }
            })

            // Upload Category Icon
            .addCase(uploadCategoryIcon.fulfilled, (state, action) => {
                const index = state.categories.findIndex(c => c.id === action.payload.categoryId);
                if (index !== -1) {
                    state.categories[index].icon = action.payload.icon;
                }
            });
    },
});

export default servicesSlice.reducer;
