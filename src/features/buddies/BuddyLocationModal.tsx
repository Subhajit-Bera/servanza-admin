import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
} from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { COLORS } from '../../theme';

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icon
const createBuddyIcon = () => {
    return L.divIcon({
        className: 'custom-buddy-marker',
        html: `
            <div style="
                width: 32px;
                height: 32px;
                background: ${COLORS.primary};
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

interface BuddyLocationModalProps {
    open: boolean;
    onClose: () => void;
    buddyName: string;
    latitude?: number;
    longitude?: number;
    phone?: string;
}

const BuddyLocationModal: React.FC<BuddyLocationModalProps> = ({
    open,
    onClose,
    buddyName,
    latitude,
    longitude,
    phone,
}) => {
    const hasLocation = latitude !== undefined && longitude !== undefined && latitude !== 0 && longitude !== 0;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                {buddyName}'s Location
            </DialogTitle>
            <DialogContent>
                {hasLocation ? (
                    <Box sx={{ height: 400, width: '100%' }}>
                        <MapContainer
                            center={[latitude!, longitude!]}
                            zoom={15}
                            style={{ height: '100%', width: '100%' }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <Marker position={[latitude!, longitude!]} icon={createBuddyIcon()}>
                                <Popup>
                                    <Box>
                                        <Typography fontWeight="bold">{buddyName}</Typography>
                                        {phone && (
                                            <Typography variant="body2">{phone}</Typography>
                                        )}
                                        <Typography variant="caption" color="text.secondary">
                                            {latitude?.toFixed(6)}, {longitude?.toFixed(6)}
                                        </Typography>
                                    </Box>
                                </Popup>
                            </Marker>
                        </MapContainer>
                    </Box>
                ) : (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography color="text.secondary">
                            Location data not available for this buddy
                        </Typography>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default BuddyLocationModal;
