import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermission } from './PermissionGate';
import type { Permission } from '../../config/permissions';

interface RequirePermissionProps {
    /** Single permission required */
    permission?: Permission;
    /** Multiple permissions - user needs ANY of these */
    anyOf?: Permission[];
    /** Content to render if permitted */
    children: React.ReactNode;
}

/**
 * Wrapper for routes that require specific permissions.
 * Redirects to /unauthorized if the user lacks the required permission.
 */
export const RequirePermission: React.FC<RequirePermissionProps> = ({
    permission,
    anyOf,
    children
}) => {
    const { can, canAny, isSuperAdmin, adminRole } = usePermission();

    // Super admin bypass
    if (isSuperAdmin) {
        return <>{children}</>;
    }

    // Wait for auth to be ready (optional optimization, but good practice)
    if (!adminRole) {
        // If we want to be strict, we could redirect to login, 
        // but ProtectedRoute handles authentication.
        // If adminRole is undefined but authenticated, they might be in a loading state or have no role.
        // For now, let's assume if they don't have a role, they can't proceed.
        return <Navigate to="/unauthorized" replace />;
    }

    let hasAccess = false;

    if (permission) {
        hasAccess = can(permission);
    } else if (anyOf && anyOf.length > 0) {
        hasAccess = canAny(anyOf);
    } else {
        hasAccess = true;
    }

    if (!hasAccess) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <>{children}</>;
};

/**
 * Wrapper for routes that require SUPER_ADMIN role specifically.
 */
export const RequireSuperAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isSuperAdmin } = usePermission();

    if (!isSuperAdmin) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <>{children}</>;
};
