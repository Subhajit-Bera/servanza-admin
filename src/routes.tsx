import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout';
import { ProtectedRoute } from './components/common';
import { RequirePermission, RequireSuperAdmin } from './components/common/RequirePermission';
import { LoginPage } from './features/auth';
import { DashboardPage } from './features/dashboard';

import CustomersPage from './features/customers/CustomersPage';
import CustomerDetailsPage from './features/customers/CustomerDetailsPage';
import TopCustomersPage from './features/customers/TopCustomersPage';

import BuddiesPage from './features/buddies/BuddiesPage';
import BuddyDetailsPage from './features/buddies/BuddyDetailsPage';
import BuddyTrainingPage from './features/buddies/BuddyTrainingPage';

import BookingsPage from './features/bookings/BookingsPage';
import BookingDetailsPage from './features/bookings/BookingDetailsPage';
import ServicesPage from './features/services/ServicesPage';
import ServiceDetailsPage from './features/services/ServiceDetailsPage';
import CategoriesPage from './features/services/CategoriesPage';
import CreateServicePage from './features/services/CreateServicePage';
import TransactionsPage from './features/payments/TransactionsPage';
import BuddyPayoutsPage from './features/payments/BuddyPayoutsPage';
import ReviewsPage from './features/reviews/ReviewsPage';
import TrackingPage from './features/tracking/TrackingPage';
import ReportsPage from './features/reports/ReportsPage';
import SettingsPage from './features/settings/SettingsPage';
import AdminsPage from './features/settings/AdminsPage';
import RolePermissionsPage from './features/settings/RolePermissionsPage';
import ProfilePage from './features/profile/ProfilePage';
import NotificationsPage from './features/notifications/NotificationsPage';

export const router = createBrowserRouter([
    // Public routes
    {
        path: '/login',
        element: <LoginPage />,
    },

    // Protected routes with MainLayout
    {
        element: <ProtectedRoute />,
        children: [
            {
                element: <MainLayout />,
                children: [
                    // Dashboard - Require basic view permission
                    { path: '/', element: <Navigate to="/dashboard" replace /> },
                    {
                        path: '/dashboard',
                        element: <RequirePermission anyOf={['users.view', 'bookings.view', 'payments.view', 'reports.view']}><DashboardPage /></RequirePermission>
                    },

                    // Customers
                    {
                        path: '/customers',
                        element: <RequirePermission permission="users.view"><CustomersPage /></RequirePermission>
                    },
                    {
                        path: '/customers/top',
                        element: <RequirePermission permission="users.view"><TopCustomersPage /></RequirePermission>
                    },
                    {
                        path: '/customers/:id',
                        element: <RequirePermission permission="users.view"><CustomerDetailsPage /></RequirePermission>
                    },

                    // Buddies
                    {
                        path: '/buddies',
                        element: <RequirePermission permission="buddies.view"><BuddiesPage /></RequirePermission>
                    },
                    {
                        path: '/buddies/online',
                        element: <RequirePermission permission="buddies.view"><BuddiesPage initialStatus="available" /></RequirePermission>
                    },
                    {
                        path: '/buddies/pending',
                        element: <RequirePermission permission="buddies.verify"><BuddiesPage initialVerification="pending" /></RequirePermission>
                    },
                    {
                        path: '/buddies/:id',
                        element: <RequirePermission permission="buddies.view"><BuddyDetailsPage /></RequirePermission>
                    },
                    {
                        path: '/buddies/training',
                        element: <RequirePermission permission="buddies.view"><BuddyTrainingPage /></RequirePermission>
                    },

                    // Bookings
                    {
                        path: '/bookings',
                        element: <RequirePermission permission="bookings.view"><BookingsPage /></RequirePermission>
                    },
                    {
                        path: '/bookings/:id',
                        element: <RequirePermission permission="bookings.view"><BookingDetailsPage /></RequirePermission>
                    },

                    // Services
                    {
                        path: '/services',
                        element: <RequirePermission permission="services.view"><ServicesPage /></RequirePermission>
                    },
                    {
                        path: '/services/categories',
                        element: <RequirePermission permission="services.view"><CategoriesPage /></RequirePermission>
                    },
                    {
                        path: '/services/create',
                        element: <RequirePermission permission="services.create"><CreateServicePage /></RequirePermission>
                    },
                    {
                        path: '/services/:id',
                        element: <RequirePermission permission="services.view"><ServiceDetailsPage /></RequirePermission>
                    },

                    // Payments
                    {
                        path: '/payments',
                        element: <RequirePermission anyOf={['payments.view', 'transactions.view']}><TransactionsPage /></RequirePermission>
                    },
                    {
                        path: '/payments/refunds',
                        element: <RequirePermission permission="payments.refund"><TransactionsPage /></RequirePermission>
                    },
                    {
                        path: '/payments/payouts',
                        element: <RequirePermission permission="payments.view"><BuddyPayoutsPage /></RequirePermission>
                    },

                    // Reviews
                    {
                        path: '/reviews',
                        element: <RequirePermission permission="reviews.view"><ReviewsPage /></RequirePermission>
                    },

                    // Live Tracking
                    {
                        path: '/tracking',
                        element: <RequirePermission permission="buddies.view"><TrackingPage /></RequirePermission>
                    },

                    // Reports
                    {
                        path: '/reports',
                        element: <RequirePermission permission="reports.view"><ReportsPage /></RequirePermission>
                    },

                    // Settings
                    {
                        path: '/settings',
                        element: <RequirePermission permission="settings.view"><SettingsPage /></RequirePermission>
                    },
                    {
                        // Only Super Admin can manage admins
                        path: '/settings/admins',
                        element: <RequireSuperAdmin><AdminsPage /></RequireSuperAdmin>
                    },
                    {
                        // Only Super Admin can manage role permissions
                        path: '/settings/roles',
                        element: <RequireSuperAdmin><RolePermissionsPage /></RequireSuperAdmin>
                    },

                    // Profile - All authenticated users can view profile
                    { path: '/profile', element: <ProfilePage /> },

                    // Notifications
                    { path: '/notifications', element: <NotificationsPage /> },
                ],
            },
        ],
    },

    // Unauthorized page
    {
        path: '/unauthorized',
        element: (
            <div style={{ padding: 48, textAlign: 'center' }}>
                <h1>403 - Unauthorized</h1>
                <p>You don't have permission to access this page.</p>
                <a href="/dashboard" style={{ color: '#2ECC71' }}>Go to Dashboard</a>
            </div>
        ),
    },

    // 404 Not Found
    {
        path: '*',
        element: (
            <div style={{ padding: 48, textAlign: 'center' }}>
                <h1>404 - Page Not Found</h1>
                <p>The page you're looking for doesn't exist.</p>
                <a href="/dashboard" style={{ color: '#2ECC71' }}>Go to Dashboard</a>
            </div>
        ),
    },
]);
