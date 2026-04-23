import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    TextField,
    DialogTitle,
    IconButton,
    List,
    ListItem,
    ListItemText,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { COLORS } from '../../../theme';

interface EmergencyContactData {
    name?: string;
    phone?: string;
    relationship?: string;
}

interface DocumentViewerProps {
    open: boolean;
    onClose: () => void;
    imageUrl?: string;
    title: string;
    status: 'verified' | 'rejected' | 'pending' | 'not_uploaded';
    onVerify?: () => void;
    onReject?: (reason: string) => void;
    emergencyContact?: EmergencyContactData;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
    open,
    onClose,
    imageUrl,
    title,
    status,
    onVerify,
    onReject,
    emergencyContact,
}) => {
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectInput, setShowRejectInput] = useState(false);

    const handleRejectSubmit = () => {
        if (rejectReason.trim() && onReject) {
            onReject(rejectReason);
            setRejectReason('');
            setShowRejectInput(false);
            onClose();
        }
    };

    // Check if this is emergency contact view (show text fields instead of image)
    const isEmergencyContact = !!emergencyContact;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {title}
                <IconButton onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    {isEmergencyContact ? (
                        // Show Emergency Contact text fields
                        <Box sx={{ width: '100%', maxWidth: 400 }}>
                            <List>
                                <ListItem divider>
                                    <ListItemText
                                        primary="Name"
                                        secondary={emergencyContact.name || 'Not provided'}
                                        secondaryTypographyProps={{
                                            sx: { fontSize: '1.1rem', color: emergencyContact.name ? 'text.primary' : 'text.secondary' }
                                        }}
                                    />
                                </ListItem>
                                <ListItem divider>
                                    <ListItemText
                                        primary="Phone"
                                        secondary={emergencyContact.phone || 'Not provided'}
                                        secondaryTypographyProps={{
                                            sx: { fontSize: '1.1rem', color: emergencyContact.phone ? 'text.primary' : 'text.secondary' }
                                        }}
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemText
                                        primary="Relationship"
                                        secondary={emergencyContact.relationship || 'Not provided'}
                                        secondaryTypographyProps={{
                                            sx: { fontSize: '1.1rem', color: emergencyContact.relationship ? 'text.primary' : 'text.secondary' }
                                        }}
                                    />
                                </ListItem>
                            </List>
                        </Box>
                    ) : imageUrl ? (
                        <Box
                            component="img"
                            src={imageUrl}
                            alt={title}
                            sx={{
                                maxWidth: '100%',
                                maxHeight: '60vh',
                                objectFit: 'contain',
                                border: `1px solid ${COLORS.border}`,
                                borderRadius: 1,
                            }}
                        />
                    ) : (
                        <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                            <Typography>No document uploaded</Typography>
                        </Box>
                    )}

                    <Typography variant="subtitle1" fontWeight="bold" color={
                        status === 'verified' ? COLORS.success :
                            status === 'rejected' ? COLORS.error :
                                COLORS.warning
                    }>
                        Status: {status.toUpperCase()}
                    </Typography>

                    {showRejectInput && (
                        <Box sx={{ width: '100%', mt: 2 }}>
                            <TextField
                                fullWidth
                                label="Rejection Reason"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                multiline
                                rows={2}
                                autoFocus
                            />
                        </Box>
                    )}
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} color="inherit">
                    Close
                </Button>
                {status !== 'verified' && onVerify && onReject && (
                    <>
                        {!showRejectInput ? (
                            <Button
                                onClick={() => setShowRejectInput(true)}
                                color="error"
                                variant="outlined"
                                disabled={!imageUrl && !isEmergencyContact}
                            >
                                Reject
                            </Button>
                        ) : (
                            <>
                                <Button
                                    onClick={() => {
                                        setShowRejectInput(false);
                                        setRejectReason('');
                                    }}
                                    color="inherit"
                                    variant="outlined"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleRejectSubmit}
                                    color="error"
                                    variant="contained"
                                    disabled={!rejectReason.trim()}
                                >
                                    Confirm Rejection
                                </Button>
                            </>
                        )}
                        <Button
                            onClick={() => {
                                onVerify();
                                onClose();
                            }}
                            color="success"
                            variant="contained"
                            disabled={(!imageUrl && !isEmergencyContact) || showRejectInput}
                        >
                            Verify
                        </Button>
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default DocumentViewer;
