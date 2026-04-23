import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Box,
    TextField,
    InputAdornment,
    IconButton,
    Badge,
    Avatar,
    Menu,
    MenuItem,
    Typography,
    Breadcrumbs,
    Link,
    Divider,
    CircularProgress,
} from '@mui/material';
import {
    Search as SearchIcon,
    Notifications as NotificationsIcon,
    Add as AddIcon,
    KeyboardArrowDown as ArrowDownIcon,
    Person as PersonIcon,
    Settings as SettingsIcon,
    Logout as LogoutIcon,
    Warning as WarningIcon,
    PersonAdd as PersonAddIcon,
    School as SchoolIcon,
} from '@mui/icons-material';
import { COLORS, SHADOWS } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import client from '../../api/client';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface HeaderProps {
    sidebarWidth: number;
}

interface NotificationItem {
    id: string;
    type: string;
    title: string;
    body: string;
    data: any;
    createdAt: string;
}

interface NotificationCounts {
    escalatedBookings: number;
    pendingVerifications: number;
    trainingScheduled: number;
}

const Header: React.FC<HeaderProps> = ({ sidebarWidth }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [quickActionsAnchor, setQuickActionsAnchor] = React.useState<null | HTMLElement>(null);
    const [notificationsAnchor, setNotificationsAnchor] = React.useState<null | HTMLElement>(null);

    // Real notification state
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [notificationCounts, setNotificationCounts] = useState<NotificationCounts>({
        escalatedBookings: 0,
        pendingVerifications: 0,
        trainingScheduled: 0,
    });
    const [loadingNotifications, setLoadingNotifications] = useState(false);

    // Fetch notifications on mount and periodically
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // Refresh every minute
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoadingNotifications(true);
            const response = await client.get('/admin/notifications?limit=5');
            setNotifications(response.data.data.notifications || []);
            setNotificationCounts(response.data.data.counts || {
                escalatedBookings: 0,
                pendingVerifications: 0,
                trainingScheduled: 0,
            });
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoadingNotifications(false);
        }
    };

    // Calculate total notification count
    const totalNotifications = notificationCounts.escalatedBookings +
        notificationCounts.pendingVerifications +
        notificationCounts.trainingScheduled;

    // Generate breadcrumbs from path
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = pathSegments.map((segment, index) => {
        const path = '/' + pathSegments.slice(0, index + 1).join('/');
        const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' ');
        return { label, path };
    });

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
        setAnchorEl(null);
    };

    const handleNotificationClick = (notification: NotificationItem) => {
        setNotificationsAnchor(null);
        switch (notification.type) {
            case 'BOOKING_ESCALATED':
                navigate(`/bookings/${notification.data.bookingId}`);
                break;
            case 'BUDDY_PENDING_VERIFICATION':
            case 'BUDDY_TRAINING_SCHEDULED':
                navigate(`/buddies/${notification.data.buddyId}`);
                break;
            default:
                navigate('/notifications');
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'BOOKING_ESCALATED':
                return <WarningIcon sx={{ color: COLORS.error, fontSize: 20 }} />;
            case 'BUDDY_PENDING_VERIFICATION':
                return <PersonAddIcon sx={{ color: COLORS.warning, fontSize: 20 }} />;
            case 'BUDDY_TRAINING_SCHEDULED':
                return <SchoolIcon sx={{ color: COLORS.info, fontSize: 20 }} />;
            default:
                return <NotificationsIcon sx={{ color: COLORS.primary, fontSize: 20 }} />;
        }
    };

    const quickActions = [
        { label: 'Create Booking', path: '/bookings/create' },
        { label: 'Add Customer', path: '/customers/create' },
        { label: 'Add Buddy', path: '/buddies/create' },
        { label: 'Create Service', path: '/services/create' },
    ];

    return (
        <AppBar
            position="sticky"
            elevation={0}
            sx={{
                width: `calc(100% - ${sidebarWidth}px)`,
                ml: `${sidebarWidth}px`,
                backgroundColor: COLORS.white,
                borderBottom: `1px solid ${COLORS.lightGray}`,
                boxShadow: SHADOWS.light,
                transition: 'width 0.2s ease-in-out, margin 0.2s ease-in-out',
            }}
        >
            <Toolbar sx={{ justifyContent: 'space-between', minHeight: 64 }}>
                {/* Left Section - Breadcrumbs */}
                <Box>
                    <Breadcrumbs separator="›" aria-label="breadcrumb">
                        <Link
                            underline="hover"
                            color={COLORS.primary}
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                navigate('/dashboard');
                            }}
                            sx={{ fontSize: 14 }}
                        >
                            Home
                        </Link>
                        {breadcrumbs.map((crumb, index) => (
                            <Link
                                key={crumb.path}
                                underline={index === breadcrumbs.length - 1 ? 'none' : 'hover'}
                                color={index === breadcrumbs.length - 1 ? COLORS.charcoal : COLORS.primary}
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (index !== breadcrumbs.length - 1) navigate(crumb.path);
                                }}
                                sx={{
                                    fontSize: 14,
                                    fontWeight: index === breadcrumbs.length - 1 ? 600 : 400,
                                    cursor: index === breadcrumbs.length - 1 ? 'default' : 'pointer',
                                }}
                            >
                                {crumb.label}
                            </Link>
                        ))}
                    </Breadcrumbs>
                </Box>

                {/* Center Section - Search */}
                <Box sx={{ flex: 1, maxWidth: 500, mx: 4 }}>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Search customers, buddies, bookings..."
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: COLORS.mediumGray }} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: COLORS.offWhite,
                                borderRadius: 2,
                                '& fieldset': { borderColor: 'transparent' },
                                '&:hover fieldset': { borderColor: COLORS.lightGray },
                                '&.Mui-focused fieldset': { borderColor: COLORS.primary },
                            },
                        }}
                    />
                </Box>

                {/* Right Section - Actions */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {/* Quick Actions */}
                    <IconButton
                        onClick={(e) => setQuickActionsAnchor(e.currentTarget)}
                        sx={{
                            backgroundColor: COLORS.primary,
                            color: 'white',
                            '&:hover': { backgroundColor: COLORS.darkGreen },
                            width: 36,
                            height: 36,
                        }}
                    >
                        <AddIcon fontSize="small" />
                    </IconButton>
                    <Menu
                        anchorEl={quickActionsAnchor}
                        open={Boolean(quickActionsAnchor)}
                        onClose={() => setQuickActionsAnchor(null)}
                        PaperProps={{ sx: { mt: 1, minWidth: 180 } }}
                    >
                        {quickActions.map((action) => (
                            <MenuItem
                                key={action.path}
                                onClick={() => {
                                    navigate(action.path);
                                    setQuickActionsAnchor(null);
                                }}
                            >
                                {action.label}
                            </MenuItem>
                        ))}
                    </Menu>

                    {/* Notifications */}
                    <IconButton
                        onClick={(e) => {
                            setNotificationsAnchor(e.currentTarget);
                            fetchNotifications(); // Refresh on open
                        }}
                        sx={{ color: COLORS.darkGray }}
                    >
                        <Badge
                            badgeContent={totalNotifications}
                            color="error"
                            max={99}
                        >
                            <NotificationsIcon />
                        </Badge>
                    </IconButton>
                    <Menu
                        anchorEl={notificationsAnchor}
                        open={Boolean(notificationsAnchor)}
                        onClose={() => setNotificationsAnchor(null)}
                        PaperProps={{ sx: { mt: 1, width: 360, maxHeight: 450 } }}
                    >
                        <Box sx={{ p: 2, borderBottom: `1px solid ${COLORS.lightGray}` }}>
                            <Typography variant="subtitle1" fontWeight={600}>
                                Notifications
                            </Typography>
                            <Typography variant="caption" color={COLORS.mediumGray}>
                                {totalNotifications} pending items
                            </Typography>
                        </Box>

                        {loadingNotifications ? (
                            <Box sx={{ p: 3, textAlign: 'center' }}>
                                <CircularProgress size={24} />
                            </Box>
                        ) : notifications.length > 0 ? (
                            notifications.map((notification) => (
                                <MenuItem
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    sx={{ py: 1.5, alignItems: 'flex-start' }}
                                >
                                    <Box sx={{ mr: 1.5, mt: 0.5 }}>
                                        {getNotificationIcon(notification.type)}
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="body2" fontWeight={500}>
                                            {notification.title}
                                        </Typography>
                                        <Typography variant="caption" color={COLORS.darkGray} sx={{ display: 'block' }}>
                                            {notification.body}
                                        </Typography>
                                        <Typography variant="caption" color={COLORS.mediumGray}>
                                            {dayjs(notification.createdAt).fromNow()}
                                        </Typography>
                                    </Box>
                                </MenuItem>
                            ))
                        ) : (
                            <Box sx={{ p: 3, textAlign: 'center' }}>
                                <Typography variant="body2" color={COLORS.mediumGray}>
                                    No new notifications
                                </Typography>
                            </Box>
                        )}

                        <Divider />
                        <MenuItem
                            onClick={() => {
                                navigate('/notifications');
                                setNotificationsAnchor(null);
                            }}
                            sx={{ justifyContent: 'center' }}
                        >
                            <Typography variant="body2" color={COLORS.primary} fontWeight={500}>
                                View All
                            </Typography>
                        </MenuItem>
                    </Menu>

                    {/* User Menu */}
                    <Box
                        onClick={(e) => setAnchorEl(e.currentTarget)}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            cursor: 'pointer',
                            p: 0.5,
                            borderRadius: 2,
                            '&:hover': { backgroundColor: COLORS.offWhite },
                        }}
                    >
                        <Avatar
                            src={user?.profileImage}
                            sx={{ width: 36, height: 36, bgcolor: COLORS.primary }}
                        >
                            {user?.name?.charAt(0) || 'A'}
                        </Avatar>
                        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                            <Typography variant="body2" fontWeight={600} color={COLORS.charcoal}>
                                {user?.name || 'Admin'}
                            </Typography>
                            <Typography variant="caption" color={COLORS.mediumGray}>
                                {user?.role?.replace('_', ' ') || 'Super Admin'}
                            </Typography>
                        </Box>
                        <ArrowDownIcon fontSize="small" sx={{ color: COLORS.mediumGray }} />
                    </Box>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={() => setAnchorEl(null)}
                        PaperProps={{ sx: { mt: 1, minWidth: 180 } }}
                    >
                        <MenuItem onClick={() => { navigate('/profile'); setAnchorEl(null); }}>
                            <PersonIcon fontSize="small" sx={{ mr: 1, color: COLORS.darkGray }} />
                            My Profile
                        </MenuItem>
                        <MenuItem onClick={() => { navigate('/settings'); setAnchorEl(null); }}>
                            <SettingsIcon fontSize="small" sx={{ mr: 1, color: COLORS.darkGray }} />
                            Settings
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={handleLogout} sx={{ color: COLORS.error }}>
                            <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                            Logout
                        </MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;

