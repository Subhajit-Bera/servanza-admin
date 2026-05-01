import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Avatar,
    Button,
    Stack,
    Divider,
    Alert,
    Snackbar,
    Paper,
    Chip,
} from '@mui/material';
import {
    Email as EmailIcon,
    Badge as BadgeIcon,
    Security as SecurityIcon,
} from '@mui/icons-material';
import { useAppSelector} from '../../store/hooks';

import { COLORS, SHADOWS } from '../../theme';

const ProfilePage: React.FC = () => {
    const { user } = useAppSelector((state) => state.auth);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    const getRoleColor = (role?: string) => {
        switch (role) {
            case 'SUPER_ADMIN': return COLORS.error;
            case 'ADMIN': return COLORS.primary;
            case 'OPERATIONS_MANAGER': return COLORS.info;
            case 'FINANCE_MANAGER': return COLORS.warning;
            case 'SUPPORT_AGENT': return COLORS.success;
            default: return COLORS.mediumGray;
        }
    };

    const getRoleLabel = (role?: string) => {
        return role?.replace('_', ' ') || 'Unknown Role';
    };

    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h1" sx={{ mb: 1 }}>My Profile</Typography>
                <Typography variant="body1" color="text.secondary">
                    Manage your account settings and preferences
                </Typography>
            </Box>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                {/* Profile Card */}
                <Card sx={{ boxShadow: SHADOWS.light, flex: 1 }}>
                    <CardContent sx={{ p: 4 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
                            <Box sx={{ position: 'relative' }}>
                                <Avatar
                                    src={user?.profileImage}
                                    sx={{
                                        width: 120,
                                        height: 120,
                                        bgcolor: COLORS.primary,
                                        fontSize: '3rem',
                                        mb: 2,
                                    }}
                                >
                                    {user?.name?.charAt(0)}
                                </Avatar>
                            </Box>
                            <Typography variant="h2" fontWeight={600}>
                                {user?.name}
                            </Typography>
                            <Chip
                                label={getRoleLabel(user?.adminRole)}
                                sx={{
                                    mt: 1,
                                    bgcolor: `${getRoleColor(user?.adminRole)}20`,
                                    color: getRoleColor(user?.adminRole),
                                    fontWeight: 600,
                                }}
                            />
                        </Box>

                        <Divider sx={{ my: 3 }} />

                        <Stack spacing={3}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 2,
                                    bgcolor: `${COLORS.primary}15`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <EmailIcon sx={{ color: COLORS.primary }} />
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Email</Typography>
                                    <Typography variant="body1" fontWeight={500}>{user?.email}</Typography>
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 2,
                                    bgcolor: `${COLORS.info}15`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <BadgeIcon sx={{ color: COLORS.info }} />
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Role</Typography>
                                    <Typography variant="body1" fontWeight={500}>{getRoleLabel(user?.adminRole)}</Typography>
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 2,
                                    bgcolor: `${COLORS.success}15`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <SecurityIcon sx={{ color: COLORS.success }} />
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Account Status</Typography>
                                    <Typography variant="body1" fontWeight={500} color="success.main">Active</Typography>
                                </Box>
                            </Box>

                        </Stack>
                    </CardContent>
                </Card>

                {/* Security Settings */}
                <Card sx={{ boxShadow: SHADOWS.light, flex: 1 }}>
                    <CardContent sx={{ p: 4 }}>
                        <Typography variant="h3" fontWeight={600} sx={{ mb: 3 }}>
                            Security Settings
                        </Typography>

                        <Stack spacing={3}>
                            <Paper variant="outlined" sx={{ p: 3 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight={600}>Password</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Last changed: Never
                                        </Typography>
                                    </Box>
                                    <Button variant="outlined" size="small">
                                        Change Password
                                    </Button>
                                </Stack>
                            </Paper>

                            <Paper variant="outlined" sx={{ p: 3 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight={600}>Two-Factor Authentication</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Add an extra layer of security to your account
                                        </Typography>
                                    </Box>
                                    <Chip label="Coming Soon" size="small" />
                                </Stack>
                            </Paper>

                            <Paper variant="outlined" sx={{ p: 3 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight={600}>Active Sessions</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Manage your active login sessions
                                        </Typography>
                                    </Box>
                                    <Button variant="outlined" size="small" color="error">
                                        Log Out All
                                    </Button>
                                </Stack>
                            </Paper>
                        </Stack>
                    </CardContent>
                </Card>
            </Stack>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ProfilePage;
