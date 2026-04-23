import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { fetchProfile } from '../../store/slices/authSlice';
import { Box, CircularProgress, Typography } from '@mui/material';

interface ProtectedRouteProps {
    requiredPermissions?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredPermissions }) => {
    const { isAuthenticated, user, loading } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    const [profileFetched, setProfileFetched] = useState(false);

    // Fetch user profile if authenticated but user data is missing
    useEffect(() => {
        if (isAuthenticated && !user && !loading && !profileFetched) {
            setProfileFetched(true);
            dispatch(fetchProfile());
        }
    }, [isAuthenticated, user, loading, profileFetched, dispatch]);

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Loading user data - show loading screen when user is null (after page refresh)
    if (!user) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
                <CircularProgress sx={{ mb: 2 }} />
                <Typography color="text.secondary">Loading user data...</Typography>
            </Box>
        );
    }

    // Check permissions if required
    if (requiredPermissions && requiredPermissions.length > 0) {
        const hasPermission = user?.permissions?.some(
            (perm) => perm === '*' || requiredPermissions.includes(perm)
        );

        if (!hasPermission) {
            return <Navigate to="/unauthorized" replace />;
        }
    }

    return <Outlet />;
};

export default ProtectedRoute;

