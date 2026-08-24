import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    message: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    confirmColor?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
    onConfirm: () => void;
    onCancel: () => void;
    icon?: React.ReactNode;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    open,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    confirmColor = 'primary',
    onConfirm,
    onCancel,
    icon
}) => {
    return (
        <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {icon ? icon : confirmColor === 'error' ? <WarningIcon color="error" /> : null}
                {title}
            </DialogTitle>
            <DialogContent>
                {typeof message === 'string' ? (
                    <Typography>{message}</Typography>
                ) : (
                    <Box>{message}</Box>
                )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onCancel} variant="outlined" color="inherit">
                    {cancelText}
                </Button>
                <Button onClick={onConfirm} variant="contained" color={confirmColor} autoFocus>
                    {confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
