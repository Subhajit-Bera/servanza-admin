import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import dashboardReducer from './slices/dashboardSlice';
import customersReducer from './slices/customersSlice';

import buddiesReducer from './slices/buddiesSlice';
import bookingsReducer from './slices/bookingsSlice';
import servicesReducer from './slices/servicesSlice';
import transactionsReducer from './slices/transactionsSlice';
import reviewsReducer from './slices/reviewsSlice';
import trackingReducer from './slices/trackingSlice';
import reportsReducer from './slices/reportsSlice';
import settingsReducer from './slices/settingsSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        dashboard: dashboardReducer,
        customers: customersReducer,
        buddies: buddiesReducer,
        bookings: bookingsReducer,
        services: servicesReducer,
        transactions: transactionsReducer,
        reviews: reviewsReducer,
        tracking: trackingReducer,
        reports: reportsReducer,
        settings: settingsReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;


