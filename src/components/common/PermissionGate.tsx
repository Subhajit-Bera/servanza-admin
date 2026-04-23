import React from 'react';
import { useAppSelector } from '../../store/hooks';
import { hasPermission, hasAnyPermission } from '../../config/permissions';
import type { Permission, AdminRole } from '../../config/permissions';

interface PermissionGateProps {
    /** Single permission required */
    permission?: Permission;
    /** Multiple permissions - user needs ANY of these */
    anyOf?: Permission[];
    /** Multiple permissions - user needs ALL of these */
    allOf?: Permission[];
    /** Content to show if user has permission */
    children: React.ReactNode;
    /** Optional fallback if permission denied */
    fallback?: React.ReactNode;
}

/**
 * Component to conditionally render content based on user permissions
 * 
 * Usage:
 * <PermissionGate permission="users.delete">
 *   <DeleteButton />
 * </PermissionGate>
 * 
 * <PermissionGate anyOf={['users.edit', 'users.view']}>
 *   <UserActions />
 * </PermissionGate>
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({
    permission,
    anyOf,
    allOf,
    children,
    fallback = null,
}) => {
    const user = useAppSelector((state) => state.auth.user);
    const adminRole = user?.adminRole as AdminRole | undefined;

    let hasAccess = false;

    if (permission) {
        hasAccess = hasPermission(adminRole, permission);
    } else if (anyOf && anyOf.length > 0) {
        hasAccess = hasAnyPermission(adminRole, anyOf);
    } else if (allOf && allOf.length > 0) {
        hasAccess = allOf.every(p => hasPermission(adminRole, p));
    } else {
        // No permission specified = allow access
        hasAccess = true;
    }

    if (!hasAccess) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};

/**
 * Hook to check user permissions
 */
export const usePermission = () => {
    const user = useAppSelector((state) => state.auth.user);
    const adminRole = user?.adminRole as AdminRole | undefined;

    return {
        adminRole,
        can: (permission: Permission) => hasPermission(adminRole, permission),
        canAny: (permissions: Permission[]) => hasAnyPermission(adminRole, permissions),
        canAll: (permissions: Permission[]) => permissions.every(p => hasPermission(adminRole, p)),
        isSuperAdmin: adminRole === 'SUPER_ADMIN',
    };
};

export default PermissionGate;
