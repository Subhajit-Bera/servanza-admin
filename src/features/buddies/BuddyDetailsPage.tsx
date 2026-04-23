import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Paper,
    Typography,
    Avatar,
    Chip,
    Tabs,
    Tab,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Divider,
    LinearProgress,
    Card,
    CardContent,
    Stack,
} from '@mui/material';
import {
    ArrowBack,
    Visibility as ViewIcon,
    Phone,
    Email,
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchBuddyById, verifyBuddyField, rejectBuddyField } from '../../store/slices/buddiesSlice';
import { COLORS } from '../../theme';
import DocumentViewer from './components/DocumentViewer';
import dayjs from 'dayjs';
import { usePermission } from '../../components/common/PermissionGate';

// Fix Leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom buddy location marker
const createBuddyLocationIcon = () => {
    return L.divIcon({
        className: 'custom-buddy-marker',
        html: `
            <div style="
                width: 36px;
                height: 36px;
                background: ${COLORS.primary};
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
            </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36],
    });
};

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const BuddyDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { selectedBuddy: buddy, loading } = useAppSelector((state) => state.buddies);
    const { can } = usePermission(); // Add permission hook

    const [tabValue, setTabValue] = useState(0);
    const [viewerOpen, setViewerOpen] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState<{
        field: 'aadhaarFront' | 'aadhaarBack' | 'pan' | 'bankDetails' | 'emergencyContact';
        title: string;
        url?: string;
    } | null>(null);

    useEffect(() => {
        if (id) {
            dispatch(fetchBuddyById(id));
        }
    }, [dispatch, id]);

    if (loading || !buddy) {
        return <LinearProgress />;
    }

    const handleVerify = (field: string) => {
        if (id) {
            dispatch(verifyBuddyField({ buddyId: id, field: field as any }));
        }
    };

    const handleReject = (field: string, comment: string) => {
        if (id) {
            dispatch(rejectBuddyField({ buddyId: id, field: field as any, comment }));
        }
    };

    const openDocument = (field: string, title: string, url?: string) => {
        setSelectedDoc({ field: field as any, title, url });
        setViewerOpen(true);
    };

    // Get per-field verification status using buddy.verification from backend
    const getFieldStatus = (field: string): { status: 'verified' | 'rejected' | 'pending' | 'not_uploaded'; comment: string | null } => {
        // Map field names to verification keys
        const fieldMap: Record<string, keyof NonNullable<typeof buddy.verification>> = {
            'aadhaarFront': 'aadhaarFront',
            'aadhaarBack': 'aadhaarBack',
            'pan': 'pan',
            'bankDetails': 'bankDetails',
            'emergencyContact': 'emergencyContact',
        };

        // Check if document exists
        const docUrl = field === 'bankDetails'
            ? buddy.bankDetails?.bankDocument
            : field === 'emergencyContact'
                ? (buddy.emergencyContact?.phone ? 'exists' : undefined)
                : (buddy.documents as any)?.[field];

        if (!docUrl) {
            return { status: 'not_uploaded', comment: null };
        }

        // Use per-field verification from backend
        const verificationKey = fieldMap[field];
        if (buddy.verification && verificationKey && verificationKey !== 'allVerified') {
            const fieldVerification = buddy.verification[verificationKey];
            if (typeof fieldVerification === 'object' && 'verified' in fieldVerification) {
                if (fieldVerification.verified) {
                    return { status: 'verified', comment: fieldVerification.comment };
                } else if (fieldVerification.comment) {
                    return { status: 'rejected', comment: fieldVerification.comment };
                }
            }
        }

        // Fallback to legacy logic
        if (buddy.documentsJson?.rejectionField === field) {
            return { status: 'rejected', comment: buddy.documentsJson?.rejectionReason || null };
        }

        return { status: 'pending', comment: null };
    };

    return (
        <Box>
            <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate('/buddies')}
                sx={{ mb: 2 }}
            >
                Back to Buddies
            </Button>

            {/* Header Card */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center">
                    <Box>
                        <Avatar
                            src={buddy.user.profileImage}
                            sx={{ width: 100, height: 100, fontSize: 40, bgcolor: COLORS.primary }}
                        >
                            {buddy.user.name?.charAt(0)}
                        </Avatar>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                            <Typography variant="h2">{buddy.user.name}</Typography>
                            <Chip
                                label={buddy.isVerified ? 'Verified' : 'Pending Verification'}
                                color={buddy.isVerified ? 'success' : 'warning'}
                            />
                            <Chip
                                label={buddy.isOnline ? 'Online' : 'Offline'}
                                variant="outlined"
                            />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 3, color: 'text.secondary' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Email fontSize="small" /> {buddy.user.email}
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Phone fontSize="small" /> {buddy.user.phone}
                            </Box>
                        </Box>
                    </Box>
                    <Box>
                        <Card variant="outlined" sx={{ minWidth: 200, bgcolor: COLORS.bgLight }}>
                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                <Typography variant="h2" color="primary">₹{buddy.totalEarnings.toLocaleString()}</Typography>
                                <Typography variant="body2" color="text.secondary">Total Earnings</Typography>
                                <Divider sx={{ my: 1 }} />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography variant="h3">{buddy.totalJobs}</Typography>
                                        <Typography variant="caption">Jobs</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="h3">{buddy.rating.toFixed(1)}</Typography>
                                        <Typography variant="caption">Rating</Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>
                </Stack>
            </Paper>

            {/* Tabs */}
            <Paper sx={{ width: '100%' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
                        <Tab label="Profile Info" />
                        <Tab label="Documents & Verification" />
                        <Tab label="History" />
                    </Tabs>
                </Box>

                <TabPanel value={tabValue} index={0}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="h3" gutterBottom>Personal Details</Typography>
                            <List>
                                <ListItem divider><ListItemText primary="Full Name" secondary={buddy.user.name} /></ListItem>
                                <ListItem divider><ListItemText primary="Phone" secondary={buddy.user.phone} /></ListItem>
                                <ListItem divider><ListItemText primary="Email" secondary={buddy.user.email} /></ListItem>
                                <ListItem divider><ListItemText primary="DOB" secondary={buddy.dob || 'Not provided'} /></ListItem>
                                <ListItem divider><ListItemText primary="Gender" secondary={buddy.gender || 'Not provided'} /></ListItem>
                                <ListItem divider><ListItemText primary="Blood Group" secondary={buddy.bloodGroup || 'Not provided'} /></ListItem>
                                <ListItem divider><ListItemText primary="WhatsApp" secondary={buddy.whatsapp || 'Not provided'} /></ListItem>
                                <ListItem divider><ListItemText primary="Secondary Phone" secondary={buddy.secondaryPhone || 'Not provided'} /></ListItem>
                                <ListItem><ListItemText primary="Languages" secondary={buddy.languages?.join(', ') || 'Not provided'} /></ListItem>
                            </List>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="h3" gutterBottom>Addresses</Typography>
                            <List>
                                <ListItem divider>
                                    <ListItemText
                                        primary="Current Address"
                                        secondary={buddy.currentAddress || 'Not provided'}
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemText
                                        primary="Permanent Address"
                                        secondary={buddy.permanentAddress || 'Not provided'}
                                    />
                                </ListItem>
                            </List>

                            <Typography variant="h3" gutterBottom sx={{ mt: 3 }}>Bank Details</Typography>
                            <List>
                                <ListItem divider><ListItemText primary="Account Holder" secondary={buddy.bankDetails?.accountHolderName || 'Not provided'} /></ListItem>
                                <ListItem divider><ListItemText primary="Bank Name" secondary={buddy.bankDetails?.bankName || 'Not provided'} /></ListItem>
                                <ListItem divider><ListItemText primary="Account Number" secondary={buddy.bankDetails?.accountNumber || 'Not provided'} /></ListItem>
                                <ListItem><ListItemText primary="IFSC Code" secondary={buddy.bankDetails?.ifscCode || 'Not provided'} /></ListItem>
                            </List>

                            <Typography variant="h3" gutterBottom sx={{ mt: 3 }}>Emergency Contact</Typography>
                            <List>
                                <ListItem divider><ListItemText primary="Name" secondary={buddy.emergencyContact?.name || 'Not provided'} /></ListItem>
                                <ListItem divider><ListItemText primary="Phone" secondary={buddy.emergencyContact?.phone || 'Not provided'} /></ListItem>
                                <ListItem><ListItemText primary="Relationship" secondary={buddy.emergencyContact?.relationship || 'Not provided'} /></ListItem>
                            </List>
                        </Box>
                    </Stack>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                    <Typography variant="h3" gutterBottom sx={{ mb: 2 }}>Required Documents & Verification</Typography>

                    <List>
                        {[
                            { id: 'aadhaarFront', title: 'Aadhaar Card (Front)', url: buddy.documents?.aadhaarFront, isEmergencyContact: false },
                            { id: 'aadhaarBack', title: 'Aadhaar Card (Back)', url: buddy.documents?.aadhaarBack, isEmergencyContact: false },
                            { id: 'pan', title: 'PAN Card', url: buddy.documents?.pan, isEmergencyContact: false },
                            { id: 'bankDetails', title: 'Bank Proof', url: buddy.bankDetails?.bankDocument, isEmergencyContact: false },
                            { id: 'emergencyContact', title: 'Emergency Contact', url: buddy.emergencyContact?.phone ? 'provided' : undefined, isEmergencyContact: true },
                        ].map((doc) => {
                            const fieldStatus = getFieldStatus(doc.id);
                            return (
                                <ListItem key={doc.id} divider>
                                    <ListItemText
                                        primary={doc.title}
                                        secondary={
                                            fieldStatus.status === 'not_uploaded' ? 'Not Uploaded' :
                                                fieldStatus.status === 'verified' ? 'Verified ✓' :
                                                    fieldStatus.status === 'rejected' ? `Rejected: ${fieldStatus.comment || 'No reason provided'}` : 'Pending Review'
                                        }
                                        secondaryTypographyProps={{
                                            color: fieldStatus.status === 'verified' ? 'success.main' :
                                                fieldStatus.status === 'rejected' ? 'error.main' :
                                                    fieldStatus.status === 'not_uploaded' ? 'text.secondary' : 'warning.main'
                                        }}
                                    />
                                    <ListItemSecondaryAction>
                                        <Button
                                            variant="outlined"
                                            startIcon={<ViewIcon />}
                                            onClick={() => openDocument(doc.id, doc.title, doc.url)}
                                            disabled={fieldStatus.status === 'not_uploaded'}
                                        >
                                            {fieldStatus.status === 'verified' || !can('buddies.verify') ? 'View' : 'View & Verify'}
                                        </Button>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            );
                        })}
                    </List>
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                    <Stack spacing={3}>
                        <Typography variant="h3" gutterBottom>Job History & Earnings</Typography>

                        {(() => {
                            // Filter to only show jobs where buddy actually accepted/completed
                            // ESCALATED bookings have PENDING/REJECTED assignments - don't show those
                            const relevantAssignments = (buddy.assignments || []).filter((a: any) =>
                                ['ACCEPTED', 'COMPLETED'].includes(a.status)
                            );

                            if (relevantAssignments.length > 0) {
                                return (
                                    <Box sx={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ borderBottom: `1px solid ${COLORS.border}`, textAlign: 'left' }}>
                                                    <th style={{ padding: 12 }}>Order #</th>
                                                    <th style={{ padding: 12 }}>Scheduled Date & Time</th>
                                                    <th style={{ padding: 12 }}>Service</th>
                                                    <th style={{ padding: 12 }}>Assignment</th>
                                                    <th style={{ padding: 12 }}>Booking</th>
                                                    <th style={{ padding: 12, textAlign: 'right' }}>Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {relevantAssignments.map((assignment: any) => {
                                                    const assignmentStatus = assignment.status || 'UNKNOWN';
                                                    const bookingStatus = assignment.booking?.status || 'UNKNOWN';

                                                    const getAssignmentStatusColor = (s: string) => {
                                                        switch (s) {
                                                            case 'COMPLETED': return 'success';
                                                            case 'ACCEPTED': return 'info';
                                                            case 'REJECTED': return 'error';
                                                            case 'CANCELLED': return 'error';
                                                            default: return 'default';
                                                        }
                                                    };

                                                    const getBookingStatusColor = (s: string) => {
                                                        switch (s) {
                                                            case 'COMPLETED': return 'success';
                                                            case 'CANCELLED': return 'error';
                                                            case 'ESCALATED': return 'error';
                                                            case 'IN_PROGRESS': return 'info';
                                                            case 'ASSIGNED': return 'primary';
                                                            case 'PENDING':
                                                            case 'CONFIRMED': return 'warning';
                                                            default: return 'default';
                                                        }
                                                    };

                                                    return (
                                                        <tr
                                                            key={assignment.id || Math.random()}
                                                            style={{
                                                                borderBottom: `1px solid ${COLORS.border}`,
                                                                cursor: 'pointer',
                                                            }}
                                                            onClick={() => assignment.booking?.id && navigate(`/bookings/${assignment.booking.id}`)}
                                                        >
                                                            <td style={{ padding: 12, color: COLORS.primary }}
                                                                title={assignment.booking?.id || ''}>
                                                                #{assignment.booking?.id?.slice(-8) || '-'}
                                                            </td>
                                                            <td style={{ padding: 12 }}>
                                                                {assignment.booking?.scheduledStart
                                                                    ? dayjs(assignment.booking.scheduledStart).format('MMM D, YYYY h:mm A')
                                                                    : '-'}
                                                            </td>
                                                            <td style={{ padding: 12 }}>
                                                                {assignment.booking?.service?.title || 'Unknown Service'}
                                                            </td>
                                                            <td style={{ padding: 12 }}>
                                                                <Chip
                                                                    label={assignmentStatus}
                                                                    size="small"
                                                                    color={getAssignmentStatusColor(assignmentStatus) as any}
                                                                    variant="outlined"
                                                                />
                                                            </td>
                                                            <td style={{ padding: 12 }}>
                                                                <Chip
                                                                    label={bookingStatus.replace('_', ' ')}
                                                                    size="small"
                                                                    color={getBookingStatusColor(bookingStatus) as any}
                                                                />
                                                            </td>
                                                            <td style={{ padding: 12, textAlign: 'right', fontWeight: 'bold' }}>
                                                                ₹{assignment.booking?.totalAmount?.toLocaleString() || '0'}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </Box>
                                );
                            } else {
                                return <Typography color="text.secondary">No completed jobs yet.</Typography>;
                            }
                        })()}

                        {/* Total Earnings Summary */}
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            p: 2,
                            bgcolor: COLORS.bgLight,
                            borderRadius: 1,
                            border: `1px solid ${COLORS.border}`
                        }}>
                            <Typography variant="h6">
                                Total Earnings: <strong style={{ color: COLORS.success }}>₹{buddy.totalEarnings?.toLocaleString() || '0'}</strong>
                            </Typography>
                        </Box>
                    </Stack>
                </TabPanel>

                <Box sx={{ p: 3, pt: 0 }}>
                    <Typography variant="h3" gutterBottom>Location</Typography>
                    <Paper variant="outlined" sx={{ height: 300, overflow: 'hidden', bgcolor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {(buddy as any).latitude && (buddy as any).longitude ? (
                            <MapContainer
                                center={[(buddy as any).latitude, (buddy as any).longitude]}
                                zoom={15}
                                style={{ height: '100%', width: '100%' }}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <Marker position={[(buddy as any).latitude, (buddy as any).longitude]} icon={createBuddyLocationIcon()}>
                                    <Popup>
                                        <Box>
                                            <Typography fontWeight="bold">{buddy.user.name}</Typography>
                                            <Typography variant="body2">{buddy.currentAddress || 'Current Location'}</Typography>
                                        </Box>
                                    </Popup>
                                </Marker>
                            </MapContainer>
                        ) : buddy.currentAddress ? (
                            <Box sx={{ textAlign: 'center', p: 2 }}>
                                <Typography color="text.secondary" gutterBottom>Address: {buddy.currentAddress}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    (Coordinates not available for map view)
                                </Typography>
                            </Box>
                        ) : (
                            <Typography color="text.secondary">Location not available</Typography>
                        )}
                    </Paper>
                </Box>
            </Paper>

            {/* Document Viewer Modal */}
            {selectedDoc && (
                <DocumentViewer
                    open={viewerOpen}
                    onClose={() => setViewerOpen(false)}
                    imageUrl={selectedDoc.field === 'emergencyContact' ? undefined : selectedDoc.url}
                    title={selectedDoc.title}
                    status={getFieldStatus(selectedDoc.field).status}
                    onVerify={can('buddies.verify') ? () => handleVerify(selectedDoc.field) : undefined}
                    onReject={can('buddies.verify') ? (reason) => handleReject(selectedDoc.field, reason) : undefined}
                    emergencyContact={selectedDoc.field === 'emergencyContact' ? buddy.emergencyContact : undefined}
                />
            )}
        </Box>
    );
};

export default BuddyDetailsPage;
