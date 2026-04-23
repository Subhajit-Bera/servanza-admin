import axios from 'axios';

// API Base URL - Same as Buddy App
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Create Axios instance with interceptors
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('admin_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 Unauthorized
        if (error.response?.status === 401) {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_refresh_token');
            window.location.href = '/login';
        }

        // Handle rate limiting
        if (error.response?.status === 429) {
            console.warn('Rate limited. Please try again later.');
        }

        return Promise.reject(error);
    }
);

export default apiClient;

// Auth API
export const authApi = {
    login: (email: string, password: string) =>
        apiClient.post('/auth/admin/login', { email, password }),

    logout: () =>
        apiClient.post('/auth/logout'),

    getProfile: () =>
        apiClient.get('/users/me'),

    refreshToken: (refreshToken: string) =>
        apiClient.post('/auth/refresh-token', { refreshToken }),
};

// Dashboard API
export const dashboardApi = {
    getMetrics: () =>
        apiClient.get('/admin/dashboard/metrics'),

    getRevenueChart: (period: string) =>
        apiClient.get(`/admin/dashboard/revenue?period=${period}`),

    getRecentBookings: () =>
        apiClient.get('/admin/dashboard/recent-bookings'),

    getTopBuddies: () =>
        apiClient.get('/admin/dashboard/top-buddies'),
};

// Customers API
export const customersApi = {
    getAll: (params?: Record<string, unknown>) =>
        apiClient.get('/admin/customers', { params }),

    getById: (id: string) =>
        apiClient.get(`/admin/customers/${id}`),

    update: (id: string, data: Record<string, unknown>) =>
        apiClient.put(`/admin/customers/${id}`, data),

    block: (id: string) =>
        apiClient.post(`/admin/customers/${id}/block`),

    unblock: (id: string) =>
        apiClient.post(`/admin/customers/${id}/unblock`),
};

// Buddies API
export const buddiesApi = {
    getAll: (params?: Record<string, unknown>) =>
        apiClient.get('/admin/buddies', { params }),

    getById: (id: string) =>
        apiClient.get(`/admin/buddies/${id}`),

    verifyDocument: (buddyId: string, documentType: string, status: string, comment?: string) =>
        apiClient.post(`/admin/buddies/${buddyId}/verify-document`, { documentType, status, comment }),

    update: (id: string, data: Record<string, unknown>) =>
        apiClient.put(`/admin/buddies/${id}`, data),

    block: (id: string) =>
        apiClient.post(`/admin/buddies/${id}/block`),

    unblock: (id: string) =>
        apiClient.post(`/admin/buddies/${id}/unblock`),
};

// Bookings API
export const bookingsApi = {
    getAll: (params?: Record<string, unknown>) =>
        apiClient.get('/admin/bookings', { params }),

    getById: (id: string) =>
        apiClient.get(`/admin/bookings/${id}`),

    assignBuddy: (bookingId: string, buddyId: string) =>
        apiClient.post(`/admin/bookings/${bookingId}/assign`, { buddyId }),

    cancel: (id: string, reason: string) =>
        apiClient.post(`/admin/bookings/${id}/cancel`, { reason }),
};

// Services API
export const servicesApi = {
    getAll: (params?: Record<string, unknown>) =>
        apiClient.get('/services', { params }),

    getById: (id: string) =>
        apiClient.get(`/services/${id}`),

    create: (data: Record<string, unknown>) =>
        apiClient.post('/services', data),

    update: (id: string, data: Record<string, unknown>) =>
        apiClient.put(`services/${id}`, data),

    delete: (id: string) =>
        apiClient.delete(`/services/${id}`),

    getCategories: () =>
        apiClient.get('/services/categories'),
};
