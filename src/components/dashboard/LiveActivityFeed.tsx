import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, List, ListItem, ListItemText, ListItemAvatar, Badge, Divider } from '@mui/material';
import { Notifications as NotificationsIcon, Assignment, CheckCircle, Cancel, PersonAdd, Info, Warning, ErrorOutline } from '@mui/icons-material';
import { useAppSelector } from '../../store/hooks'; // Adjust path if needed
import { getSocket } from '../../utils/socket';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface FeedItem {
    type: string;
    title: string;
    message: string;
    timestamp: string | Date;
    data?: any;
}

const getIcon = (type: string) => {
    switch (type) {
        case 'BOOKING_CREATED': return <NotificationsIcon color="primary" />;
        case 'BOOKING_ASSIGNED': return <Assignment color="info" />;
        case 'BOOKING_ACCEPTED': return <PersonAdd color="secondary" />;
        case 'BOOKING_COMPLETED': return <CheckCircle color="success" />;
        case 'BOOKING_CANCELLED': return <Cancel color="error" />;
        case 'BOOKING_ESCALATED': return <ErrorOutline color="error" />;
        case 'LOW_CANDIDATES_CRITICAL': return <ErrorOutline color="error" />;
        case 'LOW_CANDIDATES_WARNING': return <Warning color="warning" />;
        default: return <Info color="disabled" />;
    }
};

export const LiveActivityFeed: React.FC = () => {
    const [activities, setActivities] = useState<FeedItem[]>([]);
    const token = useAppSelector((state) => state.auth.token);

    useEffect(() => {
        const socket = getSocket();

        if (!socket) return;

        const handleAdminFeed = (data: FeedItem) => {
            console.log('Received admin feed:', data);
            setActivities((prev) => [data, ...prev].slice(0, 10)); // Keep last 10
        };

        // Handle low-candidate alerts for instant bookings
        const handleLowCandidates = (data: any) => {
            console.log('Received low-candidates alert:', data);
            const buddyNames = data.candidateBuddies?.map((b: any) => b.buddyName).join(', ') || '';
            const feedItem: FeedItem = {
                type: data.severity === 'critical' ? 'LOW_CANDIDATES_CRITICAL' : 'LOW_CANDIDATES_WARNING',
                title: data.severity === 'critical' ? '⚠️ No Buddies Found' : '⚠️ Low Buddy Count',
                message: data.candidateCount === 0
                    ? `No buddy found for "${data.serviceTitle}" at ${data.address || 'unknown location'}. Auto-retry in 60s.`
                    : `Only ${data.candidateCount} buddy(s) found for "${data.serviceTitle}": ${buddyNames}`,
                timestamp: data.timestamp || new Date().toISOString(),
                data,
            };
            setActivities((prev) => [feedItem, ...prev].slice(0, 15));
        };

        // Handle escalation alerts
        const handleEscalated = (data: any) => {
            console.log('Received escalated alert:', data);
            const feedItem: FeedItem = {
                type: 'BOOKING_ESCALATED',
                title: '🚨 Booking Escalated',
                message: `"${data.serviceTitle}" needs admin attention. ${data.reason || 'No buddy accepted.'}`,
                timestamp: data.escalatedAt || new Date().toISOString(),
                data,
            };
            setActivities((prev) => [feedItem, ...prev].slice(0, 15));
        };

        socket.on('admin:feed', handleAdminFeed);
        socket.on('booking:low-candidates', handleLowCandidates);
        socket.on('booking:escalated', handleEscalated);

        return () => {
            socket.off('admin:feed', handleAdminFeed);
            socket.off('booking:low-candidates', handleLowCandidates);
            socket.off('booking:escalated', handleEscalated);
        };
    }, [token]);

    return (
        <Paper elevation={0} sx={{ p: 2, height: '100%', border: '1px solid #e0e0e0' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold">
                    Live Activity
                </Typography>
                <Badge badgeContent="Live" color="error" variant="dot" />
            </Box>

            <List sx={{ maxHeight: 300, overflow: 'auto', p: 0 }}>
                {activities.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                        Waiting for activities...
                    </Typography>
                ) : (
                    activities.map((item, index) => (
                        <div key={index}>
                            <ListItem alignItems="flex-start" sx={{ px: 1 }}>
                                <ListItemAvatar sx={{ minWidth: 40, mt: 1 }}>
                                    {getIcon(item.type)}
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Box display="flex" justifyContent="space-between">
                                            <Typography variant="subtitle2" fontWeight="600">
                                                {item.title}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {dayjs(item.timestamp).fromNow()}
                                            </Typography>
                                        </Box>
                                    }
                                    secondary={item.message}
                                    secondaryTypographyProps={{ variant: 'body2', noWrap: false, sx: { fontSize: '0.8rem' } }}
                                />
                            </ListItem>
                            {index < activities.length - 1 && <Divider component="li" variant="inset" />}
                        </div>
                    ))
                )}
            </List>
        </Paper>
    );
};
