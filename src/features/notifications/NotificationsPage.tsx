import React, { useEffect, useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Chip,
    Skeleton,
    Alert,
    Tabs,
    Tab,
    Badge,
    Tooltip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Snackbar,
    MenuItem,
    Stack,
    FormControl,
    InputLabel,
    Select,
} from '@mui/material';
import {
    Warning as WarningIcon,
    Person as PersonIcon,
    School as SchoolIcon,
    Visibility as ViewIcon,
    CheckCircle as CheckIcon,
    Refresh as RefreshIcon,
    Send as SendIcon,
} from '@mui/icons-material';
import { COLORS, SHADOWS } from '../../theme';
import client from '../../api/client';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useNavigate } from 'react-router-dom';

dayjs.extend(relativeTime);

interface AdminNotification {
    id: string;
    type: 'BOOKING_ESCALATED' | 'BUDDY_PENDING_VERIFICATION' | 'BUDDY_TRAINING_SCHEDULED';
    title: string;
    body: string;
    data: any;
    isRead: boolean;
    createdAt: string;
}

interface NotificationCounts {
    escalatedBookings: number;
    pendingVerifications: number;
    trainingScheduled: number;
}

const NotificationsPage: React.FC = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<AdminNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTab, setSelectedTab] = useState(0);
    const [counts, setCounts] = useState<NotificationCounts>({
        escalatedBookings: 0,
        pendingVerifications: 0,
        trainingScheduled: 0,
    });

    const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
    const [broadcastData, setBroadcastData] = useState({
        title: '',
        body: '',
        targetSegment: 'ALL_USERS',
    });
    const [broadcasting, setBroadcasting] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await client.get('/admin/notifications');
            setNotifications(response.data.data.notifications);
            setCounts(response.data.data.counts);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch notifications');
        } finally {
            setLoading(false);
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'BOOKING_ESCALATED':
                return <WarningIcon color="error" />;
            case 'BUDDY_PENDING_VERIFICATION':
                return <PersonIcon color="warning" />;
            case 'BUDDY_TRAINING_SCHEDULED':
                return <SchoolIcon color="info" />;
            default:
                return <WarningIcon />;
        }
    };

    const getTypeColor = (type: string): 'error' | 'warning' | 'info' | 'default' => {
        switch (type) {
            case 'BOOKING_ESCALATED':
                return 'error';
            case 'BUDDY_PENDING_VERIFICATION':
                return 'warning';
            case 'BUDDY_TRAINING_SCHEDULED':
                return 'info';
            default:
                return 'default';
        }
    };

    const handleViewNotification = (notification: AdminNotification) => {
        switch (notification.type) {
            case 'BOOKING_ESCALATED':
                navigate(`/bookings/${notification.data.bookingId}`);
                break;
            case 'BUDDY_PENDING_VERIFICATION':
            case 'BUDDY_TRAINING_SCHEDULED':
                navigate(`/buddies/${notification.data.buddyId}`);
                break;
        }
    };

    const filterNotifications = (tab: number): AdminNotification[] => {
        switch (tab) {
            case 0: // All
                return notifications;
            case 1: // Escalated
                return notifications.filter(n => n.type === 'BOOKING_ESCALATED');
            case 2: // Pending Verification
                return notifications.filter(n => n.type === 'BUDDY_PENDING_VERIFICATION');
            case 3: // Training
                return notifications.filter(n => n.type === 'BUDDY_TRAINING_SCHEDULED');
            default:
                return notifications;
        }
    };

    const filteredNotifications = filterNotifications(selectedTab);

    const handleBroadcast = async () => {
        try {
            setBroadcasting(true);
            await client.post('/admin/notifications/broadcast', broadcastData);
            setSnackbar({ open: true, message: 'Broadcast notification sent successfully', severity: 'success' });
            setBroadcastModalOpen(false);
            setBroadcastData({ title: '', body: '', targetSegment: 'ALL_USERS' });
        } catch (err: any) {
            setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to send broadcast', severity: 'error' });
        } finally {
            setBroadcasting(false);
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h1" sx={{ mb: 1 }}>Notifications</Typography>
                    <Typography variant="body1" color="text.secondary">
                        Stay updated on escalated bookings, pending verifications, and training requests
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        startIcon={<RefreshIcon />}
                        onClick={fetchNotifications}
                        variant="outlined"
                        disabled={loading}
                    >
                        Refresh
                    </Button>
                    <Button
                        startIcon={<SendIcon />}
                        onClick={() => setBroadcastModalOpen(true)}
                        variant="contained"
                        color="primary"
                    >
                        Broadcast
                    </Button>
                </Box>
            </Box>

            {/* Summary Cards */}
            <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
                <Card sx={{ boxShadow: SHADOWS.light, flex: '1 1 200px', minWidth: 200 }}>
                    <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{
                                width: 44,
                                height: 44,
                                borderRadius: 2,
                                bgcolor: `${COLORS.error}15`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <WarningIcon sx={{ color: COLORS.error }} />
                            </Box>
                            <Box>
                                <Typography variant="h3" fontWeight={700}>{counts.escalatedBookings}</Typography>
                                <Typography variant="caption" color="text.secondary">Escalated Bookings</Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>

                <Card sx={{ boxShadow: SHADOWS.light, flex: '1 1 200px', minWidth: 200 }}>
                    <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{
                                width: 44,
                                height: 44,
                                borderRadius: 2,
                                bgcolor: `${COLORS.warning}15`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <PersonIcon sx={{ color: COLORS.warning }} />
                            </Box>
                            <Box>
                                <Typography variant="h3" fontWeight={700}>{counts.pendingVerifications}</Typography>
                                <Typography variant="caption" color="text.secondary">Pending Verifications</Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>

                <Card sx={{ boxShadow: SHADOWS.light, flex: '1 1 200px', minWidth: 200 }}>
                    <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{
                                width: 44,
                                height: 44,
                                borderRadius: 2,
                                bgcolor: `${COLORS.info}15`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <SchoolIcon sx={{ color: COLORS.info }} />
                            </Box>
                            <Box>
                                <Typography variant="h3" fontWeight={700}>{counts.trainingScheduled}</Typography>
                                <Typography variant="caption" color="text.secondary">Training Scheduled</Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            </Box>

            <Card sx={{ boxShadow: SHADOWS.light }}>
                <CardContent sx={{ p: 0 }}>
                    <Tabs
                        value={selectedTab}
                        onChange={(_, v) => setSelectedTab(v)}
                        sx={{ borderBottom: `1px solid ${COLORS.lightGray}`, px: 2 }}
                    >
                        <Tab label={
                            <Badge badgeContent={notifications.length} color="primary">
                                <Box sx={{ pr: 2 }}>All</Box>
                            </Badge>
                        } />
                        <Tab label={
                            <Badge badgeContent={counts.escalatedBookings} color="error">
                                <Box sx={{ pr: 2 }}>Escalated</Box>
                            </Badge>
                        } />
                        <Tab label={
                            <Badge badgeContent={counts.pendingVerifications} color="warning">
                                <Box sx={{ pr: 2 }}>Pending Verification</Box>
                            </Badge>
                        } />
                        <Tab label={
                            <Badge badgeContent={counts.trainingScheduled} color="info">
                                <Box sx={{ pr: 2 }}>Training</Box>
                            </Badge>
                        } />
                    </Tabs>

                    {error && <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>}

                    <List sx={{ p: 0 }}>
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <ListItem key={i} divider sx={{ py: 2 }}>
                                    <ListItemIcon><Skeleton variant="circular" width={40} height={40} /></ListItemIcon>
                                    <ListItemText
                                        primary={<Skeleton variant="text" width="60%" />}
                                        secondary={<Skeleton variant="text" width="80%" />}
                                    />
                                </ListItem>
                            ))
                        ) : filteredNotifications.length > 0 ? (
                            filteredNotifications.map((notification) => (
                                <ListItem
                                    key={notification.id}
                                    divider
                                    sx={{
                                        py: 2,
                                        '&:hover': { bgcolor: COLORS.offWhite },
                                        cursor: 'pointer',
                                    }}
                                    onClick={() => handleViewNotification(notification)}
                                >
                                    <ListItemIcon>
                                        <Box sx={{
                                            width: 44,
                                            height: 44,
                                            borderRadius: 2,
                                            bgcolor: `${getTypeColor(notification.type) === 'error' ? COLORS.error :
                                                getTypeColor(notification.type) === 'warning' ? COLORS.warning :
                                                    COLORS.info}15`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}>
                                            {getTypeIcon(notification.type)}
                                        </Box>
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography variant="subtitle2" fontWeight={600}>
                                                    {notification.title}
                                                </Typography>
                                                <Chip
                                                    label={notification.type.replace(/_/g, ' ')}
                                                    size="small"
                                                    color={getTypeColor(notification.type)}
                                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                                />
                                            </Box>
                                        }
                                        secondary={
                                            <Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    {notification.body}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {dayjs(notification.createdAt).fromNow()}
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                    <ListItemSecondaryAction>
                                        <Tooltip title="View Details">
                                            <IconButton
                                                edge="end"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleViewNotification(notification);
                                                }}
                                            >
                                                <ViewIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))
                        ) : (
                            <ListItem sx={{ py: 8 }}>
                                <Box sx={{ width: '100%', textAlign: 'center' }}>
                                    <CheckIcon sx={{ fontSize: 48, color: COLORS.success, mb: 2 }} />
                                    <Typography color="text.secondary">
                                        No notifications in this category
                                    </Typography>
                                </Box>
                            </ListItem>
                        )}
                    </List>
                </CardContent>
            </Card>

            {/* Broadcast Modal */}
            <Dialog open={broadcastModalOpen} onClose={() => setBroadcastModalOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Broadcast Push Notification</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <TextField
                            label="Notification Title"
                            fullWidth
                            value={broadcastData.title}
                            onChange={(e) => setBroadcastData({ ...broadcastData, title: e.target.value })}
                            required
                        />
                        <TextField
                            label="Notification Body"
                            fullWidth
                            multiline
                            rows={3}
                            value={broadcastData.body}
                            onChange={(e) => setBroadcastData({ ...broadcastData, body: e.target.value })}
                            required
                        />
                        <FormControl fullWidth>
                            <InputLabel>Target Segment</InputLabel>
                            <Select
                                value={broadcastData.targetSegment}
                                label="Target Segment"
                                onChange={(e) => setBroadcastData({ ...broadcastData, targetSegment: e.target.value })}
                            >
                                <MenuItem value="ALL_USERS">All Customers</MenuItem>
                                <MenuItem value="ALL_BUDDIES">All Buddies</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setBroadcastModalOpen(false)}>Cancel</Button>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={handleBroadcast} 
                        disabled={broadcasting || !broadcastData.title || !broadcastData.body}
                        startIcon={<SendIcon />}
                    >
                        {broadcasting ? 'Sending...' : 'Send Broadcast'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default NotificationsPage;
