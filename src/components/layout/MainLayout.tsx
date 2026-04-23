import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import Header from './Header';
import { COLORS } from '../../theme';

import { useAppSelector } from '../../store/hooks';
import { connectSocket, disconnectSocket } from '../../utils/socket';

const DRAWER_WIDTH = 260;
const COLLAPSED_WIDTH = 70;

const MainLayout: React.FC = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const sidebarWidth = sidebarCollapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;
    const { token, isAuthenticated } = useAppSelector((state) => state.auth);

    // Initialize socket connection
    React.useEffect(() => {
        if (isAuthenticated && token) {
            connectSocket(token);
        } else {
            disconnectSocket();
        }
        return () => {
            // Optional: don't disconnect on unmount to keep connection alive during nav, 
            // but disconnect on logout (handled by dependency change or explicit logout)
            // Actually, usually we disconnect on unmount of the App or Layout if it's top level.
            // Let's keep it simple: disconnect if token changes to null.
        };
    }, [isAuthenticated, token]);

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <Sidebar
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            {/* Main Content Area */}
            <Box
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    width: `calc(100% - ${sidebarWidth}px)`,
                    transition: 'width 0.2s ease-in-out',
                }}
            >
                {/* Header */}
                <Header sidebarWidth={sidebarWidth} />

                {/* Page Content */}
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        p: 3,
                        backgroundColor: COLORS.offWhite,
                        minHeight: 'calc(100vh - 64px)',
                    }}
                >
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
};

export default MainLayout;
