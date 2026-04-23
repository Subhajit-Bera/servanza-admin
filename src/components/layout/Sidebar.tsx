import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Box,
    Typography,
    IconButton,
    Divider,
    Avatar,
    Collapse,
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    Engineering as EngineeringIcon,
    EventNote as BookingsIcon,
    Build as ServicesIcon,
    Payment as PaymentIcon,
    Star as ReviewsIcon,
    Map as MapIcon,
    Assessment as ReportsIcon,
    Settings as SettingsIcon,
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
    ExpandLess,
    ExpandMore,
    Logout as LogoutIcon,
} from '@mui/icons-material';
import { COLORS } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { usePermission } from '../common/PermissionGate';
import type { Permission } from '../../config/permissions';
import { ROLE_DISPLAY_NAMES } from '../../config/permissions';

const DRAWER_WIDTH = 260;
const COLLAPSED_WIDTH = 70;

interface MenuItem {
    title: string;
    icon: React.ReactNode;
    path: string;
    permissions?: Permission[]; // Required permissions (ANY of these)
    superAdminOnly?: boolean; // Only visible to super admin
    children?: {
        title: string;
        path: string;
        permissions?: Permission[];
        superAdminOnly?: boolean;
    }[];
}

const menuItems: MenuItem[] = [
    {
        title: 'Dashboard',
        icon: <DashboardIcon />,
        path: '/dashboard',
        permissions: ['users.view', 'bookings.view', 'payments.view', 'reports.view']
    },
    {
        title: 'Customers',
        icon: <PeopleIcon />,
        path: '/customers',
        permissions: ['users.view'],
        children: [
            { title: 'All Customers', path: '/customers', permissions: ['users.view'] },
            { title: 'Top Customers', path: '/customers/top', permissions: ['users.view'] },
        ],
    },
    {
        title: 'Buddies',
        icon: <EngineeringIcon />,
        path: '/buddies',
        permissions: ['buddies.view'],
        children: [
            { title: 'All Buddies', path: '/buddies', permissions: ['buddies.view'] },
            { title: 'Online Now', path: '/buddies/online', permissions: ['buddies.view'] },
            { title: 'Pending Verification', path: '/buddies/pending', permissions: ['buddies.verify'] },
            { title: 'Training', path: '/buddies/training', permissions: ['buddies.view'] },
        ],
    },
    {
        title: 'Bookings',
        icon: <BookingsIcon />,
        path: '/bookings',
        permissions: ['bookings.view'],
        children: [
            { title: 'All Bookings', path: '/bookings', permissions: ['bookings.view'] },
        ],
    },
    {
        title: 'Services',
        icon: <ServicesIcon />,
        path: '/services',
        permissions: ['services.view'],
        children: [
            { title: 'All Services', path: '/services', permissions: ['services.view'] },
            { title: 'Categories', path: '/services/categories', permissions: ['services.view'] },
            { title: 'Create Service', path: '/services/create', permissions: ['services.create'] },
        ],
    },
    {
        title: 'Payments',
        icon: <PaymentIcon />,
        path: '/payments',
        permissions: ['payments.view', 'transactions.view'],
        children: [
            { title: 'Transactions', path: '/payments', permissions: ['transactions.view'] },
            { title: 'Refunds', path: '/payments/refunds', permissions: ['payments.refund'] },
            { title: 'Buddy Payouts', path: '/payments/payouts', permissions: ['payments.view'] },
        ],
    },
    {
        title: 'Reviews',
        icon: <ReviewsIcon />,
        path: '/reviews',
        permissions: ['reviews.view']
    },
    {
        title: 'Live Tracking',
        icon: <MapIcon />,
        path: '/tracking',
        permissions: ['buddies.view']
    },
    {
        title: 'Reports',
        icon: <ReportsIcon />,
        path: '/reports',
        permissions: ['reports.view']
    },
    {
        title: 'Settings',
        icon: <SettingsIcon />,
        path: '/settings',
        permissions: ['settings.view'],
        children: [
            { title: 'General', path: '/settings', permissions: ['settings.view'] },
            { title: 'Admins', path: '/settings/admins', superAdminOnly: true },
            { title: 'Role Permissions', path: '/settings/roles', superAdminOnly: true },
        ],
    },
];

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const { canAny, isSuperAdmin, adminRole } = usePermission();
    const [openMenus, setOpenMenus] = useState<string[]>([]);

    // Filter menu items based on permissions
    const filterMenuItems = (items: MenuItem[]): MenuItem[] => {
        return items
            .filter(item => {
                // Super admin sees everything
                if (isSuperAdmin) return true;

                // Check if item is super admin only
                if (item.superAdminOnly) return false;

                // Check permissions (any of the listed permissions grants access)
                if (item.permissions && item.permissions.length > 0) {
                    return canAny(item.permissions);
                }

                return true;
            })
            .map(item => {
                // Also filter children
                if (item.children) {
                    const filteredChildren = item.children.filter(child => {
                        if (isSuperAdmin) return true;
                        if (child.superAdminOnly) return false;
                        if (child.permissions && child.permissions.length > 0) {
                            return canAny(child.permissions);
                        }
                        return true;
                    });

                    return { ...item, children: filteredChildren };
                }
                return item;
            })
            // Remove parent items with no visible children
            .filter(item => !item.children || item.children.length > 0);
    };

    const visibleMenuItems = filterMenuItems(menuItems);

    const handleMenuClick = (item: MenuItem) => {
        if (item.children && !collapsed) {
            setOpenMenus((prev) =>
                prev.includes(item.path)
                    ? prev.filter((p) => p !== item.path)
                    : [...prev, item.path]
            );
        } else {
            navigate(item.path);
        }
    };

    const isActive = (path: string) => location.pathname === path;
    const isParentActive = (item: MenuItem) =>
        item.children?.some((child) => location.pathname.startsWith(child.path)) ||
        location.pathname === item.path;

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    // Get role display name
    const getRoleDisplayName = () => {
        if (adminRole && ROLE_DISPLAY_NAMES[adminRole]) {
            return ROLE_DISPLAY_NAMES[adminRole];
        }
        return user?.role?.replace('_', ' ') || 'Admin';
    };

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
                    boxSizing: 'border-box',
                    backgroundColor: COLORS.white,
                    borderRight: `1px solid ${COLORS.lightGray}`,
                    transition: 'width 0.2s ease-in-out',
                    overflowX: 'hidden',
                },
            }}
        >
            {/* Logo Section */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'space-between',
                    p: 2,
                    minHeight: 64,
                }}
            >
                {!collapsed && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                            sx={{
                                width: 36,
                                height: 36,
                                borderRadius: '8px',
                                backgroundColor: COLORS.primary,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                            }}
                        >
                            S
                        </Box>
                        <Typography variant="h6" fontWeight={700} color={COLORS.charcoal}>
                            Servanza
                        </Typography>
                    </Box>
                )}
                <IconButton onClick={onToggle} size="small">
                    {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                </IconButton>
            </Box>

            <Divider />

            {/* Menu Items */}
            <List sx={{ px: 1, flex: 1 }}>
                {visibleMenuItems.map((item) => (
                    <React.Fragment key={item.path}>
                        <ListItem disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                onClick={() => handleMenuClick(item)}
                                sx={{
                                    borderRadius: 2,
                                    minHeight: 44,
                                    justifyContent: collapsed ? 'center' : 'flex-start',
                                    px: collapsed ? 1 : 2,
                                    backgroundColor: isParentActive(item)
                                        ? COLORS.primary
                                        : 'transparent',
                                    color: isParentActive(item) ? 'white' : COLORS.darkGray,
                                    '&:hover': {
                                        backgroundColor: isParentActive(item)
                                            ? COLORS.darkGreen
                                            : COLORS.lightGreen,
                                    },
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: collapsed ? 0 : 40,
                                        color: isParentActive(item) ? 'white' : COLORS.primary,
                                        justifyContent: 'center',
                                    }}
                                >
                                    {item.icon}
                                </ListItemIcon>
                                {!collapsed && (
                                    <>
                                        <ListItemText
                                            primary={item.title}
                                            primaryTypographyProps={{
                                                fontSize: 14,
                                                fontWeight: isParentActive(item) ? 600 : 500,
                                            }}
                                        />
                                        {item.children &&
                                            (openMenus.includes(item.path) ? (
                                                <ExpandLess fontSize="small" />
                                            ) : (
                                                <ExpandMore fontSize="small" />
                                            ))}
                                    </>
                                )}
                            </ListItemButton>
                        </ListItem>

                        {/* Submenu */}
                        {!collapsed && item.children && (
                            <Collapse in={openMenus.includes(item.path)} timeout="auto">
                                <List component="div" disablePadding>
                                    {item.children.map((child) => (
                                        <ListItemButton
                                            key={child.path}
                                            onClick={() => navigate(child.path)}
                                            sx={{
                                                pl: 6,
                                                py: 0.75,
                                                borderRadius: 2,
                                                mx: 1,
                                                mb: 0.25,
                                                backgroundColor: isActive(child.path)
                                                    ? COLORS.lightGreen
                                                    : 'transparent',
                                                '&:hover': {
                                                    backgroundColor: COLORS.lightGreen,
                                                },
                                            }}
                                        >
                                            <ListItemText
                                                primary={child.title}
                                                primaryTypographyProps={{
                                                    fontSize: 13,
                                                    color: isActive(child.path)
                                                        ? COLORS.darkGreen
                                                        : COLORS.darkGray,
                                                    fontWeight: isActive(child.path) ? 600 : 400,
                                                }}
                                            />
                                        </ListItemButton>
                                    ))}
                                </List>
                            </Collapse>
                        )}
                    </React.Fragment>
                ))}
            </List>

            <Divider />

            {/* User Profile Section */}
            <Box sx={{ p: 2 }}>
                {!collapsed ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                            src={user?.profileImage}
                            sx={{ width: 40, height: 40, bgcolor: COLORS.primary }}
                        >
                            {user?.name?.charAt(0) || 'A'}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                                variant="body2"
                                fontWeight={600}
                                noWrap
                                color={COLORS.charcoal}
                            >
                                {user?.name || 'Admin User'}
                            </Typography>
                            <Typography variant="caption" color={COLORS.mediumGray} noWrap>
                                {getRoleDisplayName()}
                            </Typography>
                        </Box>
                        <IconButton size="small" onClick={handleLogout} color="error">
                            <LogoutIcon fontSize="small" />
                        </IconButton>
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <IconButton size="small" onClick={handleLogout} color="error">
                            <LogoutIcon />
                        </IconButton>
                    </Box>
                )}
            </Box>
        </Drawer>
    );
};

export default Sidebar;
