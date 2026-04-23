/**
 * RBAC Permissions Configuration for Frontend
 * Mirrors the backend permissions for UI-level access control
 */

export type Permission =
    // User permissions
    | 'users.view' | 'users.edit' | 'users.delete'
    // Buddy permissions
    | 'buddies.view' | 'buddies.edit' | 'buddies.delete' | 'buddies.verify' | 'buddies.assign'
    // Booking permissions
    | 'bookings.view' | 'bookings.edit' | 'bookings.cancel' | 'bookings.assign'
    // Service permissions
    | 'services.view' | 'services.create' | 'services.edit' | 'services.delete'
    // Review permissions
    | 'reviews.view' | 'reviews.delete'
    // Payment permissions
    | 'payments.view' | 'payments.refund'
    // Transaction permissions
    | 'transactions.view' | 'transactions.export'
    // Report permissions
    | 'reports.view' | 'reports.financial'
    // Settings permissions
    | 'settings.view' | 'settings.edit'
    // Admin management
    | 'admins.view' | 'admins.create' | 'admins.edit' | 'admins.delete'
    // Support
    | 'support.tickets'
    // Wildcard
    | '*';

export type AdminRole =
    | 'SUPER_ADMIN'
    | 'ADMIN'
    | 'OPERATIONS_MANAGER'
    | 'FINANCE_MANAGER'
    | 'SUPPORT_AGENT';

/**
 * Permissions matrix for each admin role
 */
export const PERMISSIONS: Record<AdminRole, Permission[]> = {
    SUPER_ADMIN: ['*'], // All permissions

    ADMIN: [
        'users.view', 'users.edit', 'users.delete',
        'buddies.view', 'buddies.edit', 'buddies.delete', 'buddies.verify',
        'bookings.view', 'bookings.edit', 'bookings.cancel',
        'services.view', 'services.create', 'services.edit', 'services.delete',
        'reviews.view', 'reviews.delete',
        'payments.view', 'reports.view',
    ],

    OPERATIONS_MANAGER: [
        'users.view', 'buddies.view', 'buddies.assign', 'buddies.verify',
        'bookings.view', 'bookings.edit', 'bookings.assign',
        'services.view', 'reviews.view', 'reports.view',
    ],

    FINANCE_MANAGER: [
        'payments.view', 'payments.refund',
        'transactions.view', 'transactions.export',
        'reports.view', 'reports.financial',
    ],

    SUPPORT_AGENT: [
        'users.view', 'buddies.view',
        'bookings.view', 'reviews.view',
        'support.tickets',
    ],
};

/**
 * Role display names for UI
 */
export const ROLE_DISPLAY_NAMES: Record<AdminRole, string> = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN: 'Admin',
    OPERATIONS_MANAGER: 'Operations Manager',
    FINANCE_MANAGER: 'Finance Manager',
    SUPPORT_AGENT: 'Support Agent',
};

/**
 * Role descriptions for UI
 */
export const ROLE_DESCRIPTIONS: Record<AdminRole, string> = {
    SUPER_ADMIN: 'Full access to all features and settings',
    ADMIN: 'Manage users, buddies, bookings, and services',
    OPERATIONS_MANAGER: 'View and manage bookings, assign buddies',
    FINANCE_MANAGER: 'Handle payments, refunds, and financial reports',
    SUPPORT_AGENT: 'View user details and manage support tickets',
};

/**
 * Role colors for UI badges
 */
export const ROLE_COLORS: Record<AdminRole, string> = {
    SUPER_ADMIN: '#FF6B6B',
    ADMIN: '#4ECDC4',
    OPERATIONS_MANAGER: '#45B7D1',
    FINANCE_MANAGER: '#96CEB4',
    SUPPORT_AGENT: '#ADB5BD',
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: AdminRole | null | undefined, permission: Permission): boolean {
    if (!role) return false;

    const rolePermissions = PERMISSIONS[role];
    if (!rolePermissions) return false;

    // Super admin has all permissions
    if (rolePermissions.includes('*')) return true;

    return rolePermissions.includes(permission);
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(role: AdminRole | null | undefined, permissions: Permission[]): boolean {
    return permissions.some(permission => hasPermission(role, permission));
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(role: AdminRole | null | undefined, permissions: Permission[]): boolean {
    return permissions.every(permission => hasPermission(role, permission));
}

/**
 * Menu items with required permissions
 */
export const MENU_PERMISSIONS: Record<string, Permission[]> = {
    '/dashboard': ['users.view', 'bookings.view', 'payments.view'],
    '/customers': ['users.view'],
    '/buddies': ['buddies.view'],
    '/bookings': ['bookings.view'],
    '/services': ['services.view'],
    '/payments': ['payments.view', 'transactions.view'],
    '/reviews': ['reviews.view'],
    '/tracking': ['buddies.view'],
    '/reports': ['reports.view'],
    '/settings': ['settings.view', 'settings.edit'],
};
