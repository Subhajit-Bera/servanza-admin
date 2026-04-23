import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import client from '../../api/client';
import type { RootState } from '..';

// Types
export interface Transaction {
    id: string;
    bookingId: string;
    userId: string;
    amount: number;
    currency: string;
    method: 'PREPAID' | 'CASH';
    status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    failureReason?: string;
    refundedAmount?: number;
    refundedAt?: string;
    createdAt: string;
    updatedAt: string;
    user: {
        id: string;
        name: string;
        email: string;
        phone?: string;
    };
    booking: {
        id: string;
        service?: {
            id: string;
            title: string;
        };
    };
}

interface TransactionsState {
    transactions: Transaction[];
    selectedTransaction: Transaction | null;
    loading: boolean;
    error: string | null;
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
    filters: {
        status?: string;
        method?: string;
        startDate?: string;
        endDate?: string;
        search?: string;
    };
}

const initialState: TransactionsState = {
    transactions: [],
    selectedTransaction: null,
    loading: false,
    error: null,
    pagination: {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0,
    },
    filters: {},
};

// Async Thunks
export const fetchTransactions = createAsyncThunk(
    'transactions/fetchTransactions',
    async (params: { page?: number; limit?: number; status?: string; method?: string; startDate?: string; endDate?: string; search?: string } = {}, { rejectWithValue }) => {
        try {
            const response = await client.get('/admin/transactions', { params });
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch transactions');
        }
    }
);

export const fetchTransactionById = createAsyncThunk(
    'transactions/fetchTransactionById',
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await client.get(`/admin/transactions/${id}`);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch transaction');
        }
    }
);

export const processRefund = createAsyncThunk(
    'transactions/processRefund',
    async ({ transactionId, amount, reason }: { transactionId: string; amount?: number; reason?: string }, { rejectWithValue }) => {
        try {
            const response = await client.post(`/admin/transactions/${transactionId}/refund`, { amount, reason });
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to process refund');
        }
    }
);

// Slice
const transactionsSlice = createSlice({
    name: 'transactions',
    initialState,
    reducers: {
        clearSelectedTransaction: (state) => {
            state.selectedTransaction = null;
        },
        setFilters: (state, action) => {
            state.filters = action.payload;
        },
        clearFilters: (state) => {
            state.filters = {};
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Transactions
            .addCase(fetchTransactions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTransactions.fulfilled, (state, action) => {
                state.loading = false;
                state.transactions = action.payload.transactions;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchTransactions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Fetch Transaction by ID
            .addCase(fetchTransactionById.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchTransactionById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedTransaction = action.payload;
            })
            .addCase(fetchTransactionById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Process Refund
            .addCase(processRefund.pending, (state) => {
                state.loading = true;
            })
            .addCase(processRefund.fulfilled, (state, action) => {
                state.loading = false;
                // Update transaction in list
                const index = state.transactions.findIndex(t => t.id === action.payload.id);
                if (index !== -1) {
                    state.transactions[index] = action.payload;
                }
                if (state.selectedTransaction?.id === action.payload.id) {
                    state.selectedTransaction = action.payload;
                }
            })
            .addCase(processRefund.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearSelectedTransaction, setFilters, clearFilters } = transactionsSlice.actions;

// Selectors
export const selectTransactions = (state: RootState) => state.transactions.transactions;
export const selectTransactionsLoading = (state: RootState) => state.transactions.loading;
export const selectSelectedTransaction = (state: RootState) => state.transactions.selectedTransaction;
export const selectTransactionsPagination = (state: RootState) => state.transactions.pagination;

export default transactionsSlice.reducer;
