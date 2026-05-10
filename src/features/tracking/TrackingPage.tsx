import React, { useEffect, useRef } from 'react';
import {
    Box,
    Paper,
    Typography,
    Card,
    CardContent,
    Avatar,
    Chip,
    Stack,
    CircularProgress,
    Button,
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    MyLocation as LocationIcon,
    Person as PersonIcon,
    Phone as PhoneIcon,
    Star as StarIcon,
    Work as WorkIcon,
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
    fetchOnlineBuddies,
    selectOnlineBuddies,
    selectTrackingLoading,
    selectLastUpdated,
} from '../../store/slices/trackingSlice';
import type { OnlineBuddy } from '../../store/slices/trackingSlice';
import { COLORS } from '../../theme';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { getDisplayTitle } from '../../utils/bookingHelpers';

dayjs.extend(relativeTime);

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icon for buddies
const createBuddyIcon = (isAvailable: boolean, hasActiveJob: boolean) => {
    const color = hasActiveJob ? '#FF6B6B' : isAvailable ? '#2ECC71' : '#F39C12';
    return L.divIcon({
        className: 'custom-buddy-marker',
        html: `
            <div style="
                width: 32px;
                height: 32px;
                background: ${color};
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
            </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
    });
};

// Component to fit map bounds to markers
const FitBounds: React.FC<{ buddies: OnlineBuddy[] }> = ({ buddies }) => {
    const map = useMap();
    const hasFitted = useRef(false);

    useEffect(() => {
        const validBuddies = buddies.filter(b => b.latitude && b.longitude);
        if (validBuddies.length > 0 && !hasFitted.current) {
            const bounds = L.latLngBounds(
                validBuddies.map(b => [b.latitude!, b.longitude!])
            );
            map.fitBounds(bounds, { padding: [50, 50] });
            hasFitted.current = true;
        }
    }, [buddies, map]);

    return null;
};

const TrackingPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const buddies = useAppSelector(selectOnlineBuddies);
    const loading = useAppSelector(selectTrackingLoading);
    const lastUpdated = useAppSelector(selectLastUpdated);

    useEffect(() => {
        dispatch(fetchOnlineBuddies());

        // Auto-refresh every 30 seconds
        const interval = setInterval(() => {
            dispatch(fetchOnlineBuddies());
        }, 30000);

        return () => clearInterval(interval);
    }, [dispatch]);

    const handleRefresh = () => {
        dispatch(fetchOnlineBuddies());
    };

    const validBuddies = buddies.filter(b => b.latitude && b.longitude);
    const availableBuddies = buddies.filter(b => b.isAvailable);
    const busyBuddies = buddies.filter(b => b.activeBooking);

    // Default center: India (Chennai area)
    const defaultCenter: [number, number] = [13.0827, 80.2707];

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h1">Live Buddy Tracking</Typography>
                    {lastUpdated && (
                        <Typography variant="caption" color="text.secondary">
                            Last updated: {dayjs(lastUpdated).fromNow()}
                        </Typography>
                    )}
                </Box>
                <Button
                    variant="outlined"
                    startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon />}
                    onClick={handleRefresh}
                    disabled={loading}
                >
                    Refresh
                </Button>
            </Box>

            {/* Stats Cards */}
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                <Card sx={{ flex: 1, bgcolor: COLORS.primary, color: 'white' }}>
                    <CardContent>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <PersonIcon />
                            <Box>
                                <Typography variant="h4">{buddies.length}</Typography>
                                <Typography variant="body2">Online Buddies</Typography>
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>
                <Card sx={{ flex: 1, bgcolor: COLORS.success, color: 'white' }}>
                    <CardContent>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <LocationIcon />
                            <Box>
                                <Typography variant="h4">{availableBuddies.length}</Typography>
                                <Typography variant="body2">Available</Typography>
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>
                <Card sx={{ flex: 1, bgcolor: COLORS.accent, color: 'white' }}>
                    <CardContent>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <WorkIcon />
                            <Box>
                                <Typography variant="h4">{busyBuddies.length}</Typography>
                                <Typography variant="body2">On Active Jobs</Typography>
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>
            </Stack>

            {/* Map and Buddy List */}
            <Box sx={{ display: 'flex', gap: 3 }}>
                {/* Map */}
                <Paper sx={{ flex: 2, height: 600, overflow: 'hidden' }}>
                    <MapContainer
                        center={defaultCenter}
                        zoom={12}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <FitBounds buddies={validBuddies} />
                        {validBuddies.map((buddy) => (
                            <Marker
                                key={buddy.id}
                                position={[buddy.latitude!, buddy.longitude!]}
                                icon={createBuddyIcon(buddy.isAvailable, !!buddy.activeBooking)}
                            >
                                <Popup>
                                    <Box sx={{ minWidth: 200 }}>
                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                            <Avatar sx={{ width: 40, height: 40, bgcolor: COLORS.primary }}>
                                                {buddy.name.charAt(0)}
                                            </Avatar>
                                            <Box>
                                                <Typography fontWeight="bold">{buddy.name}</Typography>
                                                <Stack direction="row" spacing={0.5} alignItems="center">
                                                    <StarIcon sx={{ fontSize: 14, color: '#FFD700' }} />
                                                    <Typography variant="caption">{buddy.rating.toFixed(1)}</Typography>
                                                </Stack>
                                            </Box>
                                        </Stack>
                                        {buddy.phone && (
                                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                                                <PhoneIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                                                {buddy.phone}
                                            </Typography>
                                        )}
                                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                            <Chip
                                                label={buddy.isAvailable ? 'Available' : 'Busy'}
                                                size="small"
                                                color={buddy.isAvailable ? 'success' : 'warning'}
                                            />
                                            <Chip
                                                label={`${buddy.totalJobs} jobs`}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </Stack>
                                        {buddy.activeBooking && (
                                            <Box sx={{ mt: 1, p: 1, bgcolor: COLORS.accent + '20', borderRadius: 1 }}>
                                                <Typography variant="caption" fontWeight="bold">
                                                    Active Job
                                                </Typography>
                                                <Typography variant="body2">
                                                    {getDisplayTitle(buddy.activeBooking)}
                                                </Typography>
                                            </Box>
                                        )}
                                        {buddy.lastLocationTime && (
                                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                                Updated: {dayjs(buddy.lastLocationTime).fromNow()}
                                            </Typography>
                                        )}
                                    </Box>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </Paper>

                {/* Buddy List */}
                <Paper sx={{ flex: 1, height: 600, overflow: 'auto', p: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Online Buddies</Typography>
                    {loading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                            <CircularProgress />
                        </Box>
                    )}
                    {!loading && buddies.length === 0 && (
                        <Typography color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                            No buddies online
                        </Typography>
                    )}
                    <Stack spacing={1}>
                        {buddies.map((buddy) => (
                            <Card key={buddy.id} variant="outlined" sx={{ p: 1.5 }}>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Avatar sx={{ bgcolor: COLORS.primary }}>
                                        {buddy.name.charAt(0)}
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="subtitle2">{buddy.name}</Typography>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <StarIcon sx={{ fontSize: 12, color: '#FFD700' }} />
                                            <Typography variant="caption">{buddy.rating.toFixed(1)}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                • {buddy.totalJobs} jobs
                                            </Typography>
                                        </Stack>
                                    </Box>
                                    <Chip
                                        label={buddy.activeBooking ? 'Busy' : buddy.isAvailable ? 'Available' : 'Away'}
                                        size="small"
                                        color={buddy.activeBooking ? 'error' : buddy.isAvailable ? 'success' : 'warning'}
                                    />
                                </Stack>
                                {buddy.activeBooking && (
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', ml: 7 }}>
                                        {getDisplayTitle(buddy.activeBooking)}
                                    </Typography>
                                )}
                            </Card>
                        ))}
                    </Stack>
                </Paper>
            </Box>

            {/* Legend */}
            <Paper sx={{ p: 2, mt: 2 }}>
                <Stack direction="row" spacing={4}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ width: 16, height: 16, bgcolor: COLORS.success, borderRadius: '50%' }} />
                        <Typography variant="caption">Available</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ width: 16, height: 16, bgcolor: COLORS.warning, borderRadius: '50%' }} />
                        <Typography variant="caption">Not Available</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ width: 16, height: 16, bgcolor: COLORS.accent, borderRadius: '50%' }} />
                        <Typography variant="caption">On Active Job</Typography>
                    </Stack>
                </Stack>
            </Paper>
        </Box>
    );
};

export default TrackingPage;
