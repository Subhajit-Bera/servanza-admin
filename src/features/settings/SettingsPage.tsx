import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Paper,
    Typography,
    Card,
    CardContent,
    Stack,
    Button,
    TextField,
    Switch,
    FormControlLabel,
    Tab,
    Tabs,
    Alert,
    Snackbar,
    CircularProgress,
    InputAdornment,
} from '@mui/material';
import {
    Save as SaveIcon,
    Settings as SettingsIcon,
    Business as BusinessIcon,
    Schedule as ScheduleIcon,
    MonetizationOn as MoneyIcon,
    Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
    fetchConfig,
    updateConfig,
    selectConfig,
    selectSettingsLoading,
    selectSettingsSaving,
} from '../../store/slices/settingsSlice';
import { COLORS } from '../../theme';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
    <div hidden={value !== index} style={{ paddingTop: 16 }}>
        {value === index && children}
    </div>
);

// Default config values with descriptions
const CONFIG_SCHEMA = {
    // Business Settings
    businessName: { label: 'Business Name', type: 'text', default: 'Servanza', category: 'business' },
    businessEmail: { label: 'Support Email', type: 'email', default: 'support@servanza.com', category: 'business' },
    businessPhone: { label: 'Support Phone', type: 'text', default: '+91-XXXXXXXXXX', category: 'business' },
    businessAddress: { label: 'Business Address', type: 'textarea', default: '', category: 'business' },

    // Operating Hours
    operatingStartHour: { label: 'Operating Start Hour (24h)', type: 'number', default: 7, category: 'hours', min: 0, max: 23 },
    operatingEndHour: { label: 'Operating End Hour (24h)', type: 'number', default: 21, category: 'hours', min: 0, max: 23 },

    // Service Settings
    maxBookingRadius: { label: 'Max Booking Radius (km)', type: 'number', default: 50, category: 'service' },
    maxBuddyAssignmentAttempts: { label: 'Max Buddy Assignment Attempts', type: 'number', default: 5, category: 'service' },
    buddySearchRadius: { label: 'Buddy Search Radius (km)', type: 'number', default: 10, category: 'service' },
    autoAssignmentEnabled: { label: 'Enable Auto-Assignment', type: 'boolean', default: true, category: 'service' },

    // Pricing & Payments
    platformFeePercentage: { label: 'Platform Fee (%)', type: 'number', default: 15, category: 'pricing', min: 0, max: 100 },
    minimumBookingAmount: { label: 'Minimum Booking Amount (₹)', type: 'number', default: 100, category: 'pricing' },
    cancellationFeePercentage: { label: 'Cancellation Fee (%)', type: 'number', default: 10, category: 'pricing', min: 0, max: 100 },

    // Notifications
    sendBookingNotifications: { label: 'Send Booking Notifications', type: 'boolean', default: true, category: 'notifications' },
    sendPaymentNotifications: { label: 'Send Payment Notifications', type: 'boolean', default: true, category: 'notifications' },
    sendPromoNotifications: { label: 'Send Promotional Notifications', type: 'boolean', default: false, category: 'notifications' },
};

const SettingsPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const config = useAppSelector(selectConfig);
    const loading = useAppSelector(selectSettingsLoading);
    const saving = useAppSelector(selectSettingsSaving);

    const [activeTab, setActiveTab] = useState(0);
    const [localConfig, setLocalConfig] = useState<Record<string, any>>({});
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        dispatch(fetchConfig());
    }, [dispatch]);

    useEffect(() => {
        if (config) {
            // Merge fetched config with defaults
            const merged: Record<string, any> = {};
            Object.entries(CONFIG_SCHEMA).forEach(([key, schema]) => {
                merged[key] = config[key] !== undefined ? config[key] : schema.default;
            });
            setLocalConfig(merged);
        }
    }, [config]);

    const handleChange = (key: string, value: any) => {
        setLocalConfig(prev => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    const handleSave = async () => {
        try {
            await dispatch(updateConfig(localConfig)).unwrap();
            setSnackbar({ open: true, message: 'Settings saved successfully!', severity: 'success' });
            setHasChanges(false);
        } catch (error: any) {
            setSnackbar({ open: true, message: error || 'Failed to save settings', severity: 'error' });
        }
    };

    const renderField = (key: string, schema: typeof CONFIG_SCHEMA[keyof typeof CONFIG_SCHEMA]) => {
        const value = localConfig[key];

        if (schema.type === 'boolean') {
            return (
                <FormControlLabel
                    key={key}
                    control={
                        <Switch
                            checked={value || false}
                            onChange={(e) => handleChange(key, e.target.checked)}
                            color="primary"
                        />
                    }
                    label={schema.label}
                />
            );
        }

        if (schema.type === 'textarea') {
            return (
                <TextField
                    key={key}
                    fullWidth
                    multiline
                    rows={3}
                    label={schema.label}
                    value={value || ''}
                    onChange={(e) => handleChange(key, e.target.value)}
                    sx={{ mb: 2 }}
                />
            );
        }

        return (
            <TextField
                key={key}
                fullWidth
                type={schema.type}
                label={schema.label}
                value={value || ''}
                onChange={(e) => handleChange(key, schema.type === 'number' ? Number(e.target.value) : e.target.value)}
                InputProps={{
                    inputProps: {
                        min: (schema as any).min,
                        max: (schema as any).max,
                    },
                    ...(key.includes('Percentage') ? { endAdornment: <InputAdornment position="end">%</InputAdornment> } : {}),
                    ...(key.includes('Amount') ? { startAdornment: <InputAdornment position="start">₹</InputAdornment> } : {}),
                    ...(key.includes('Radius') ? { endAdornment: <InputAdornment position="end">km</InputAdornment> } : {}),
                }}
                sx={{ mb: 2 }}
            />
        );
    };

    const renderCategoryFields = (category: string) => {
        return Object.entries(CONFIG_SCHEMA)
            .filter(([_, schema]) => schema.category === category)
            .map(([key, schema]) => renderField(key, schema));
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h1">Settings</Typography>
                <Button
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                    onClick={handleSave}
                    disabled={saving || !hasChanges}
                >
                    Save Changes
                </Button>
            </Box>

            {hasChanges && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    You have unsaved changes. Click "Save Changes" to apply them.
                </Alert>
            )}

            <Paper>
                <Tabs
                    value={activeTab}
                    onChange={(_, v) => setActiveTab(v)}
                    sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
                >
                    <Tab icon={<BusinessIcon />} label="Business" iconPosition="start" />
                    <Tab icon={<ScheduleIcon />} label="Hours" iconPosition="start" />
                    <Tab icon={<SettingsIcon />} label="Service" iconPosition="start" />
                    <Tab icon={<MoneyIcon />} label="Pricing" iconPosition="start" />
                    <Tab icon={<NotificationsIcon />} label="Notifications" iconPosition="start" />
                </Tabs>

                {/* Business Settings */}
                <TabPanel value={activeTab} index={0}>
                    <Box sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Business Information</Typography>
                        <Card variant="outlined" sx={{ p: 2 }}>
                            {renderCategoryFields('business')}
                        </Card>
                    </Box>
                </TabPanel>

                {/* Operating Hours */}
                <TabPanel value={activeTab} index={1}>
                    <Box sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Operating Hours</Typography>
                        <Card variant="outlined" sx={{ p: 2 }}>
                            <Stack direction="row" spacing={3}>
                                {renderCategoryFields('hours')}
                            </Stack>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                                Bookings outside these hours will be queued for the next operating day.
                            </Typography>
                        </Card>
                    </Box>
                </TabPanel>

                {/* Service Settings */}
                <TabPanel value={activeTab} index={2}>
                    <Box sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Service Configuration</Typography>
                        <Card variant="outlined" sx={{ p: 2 }}>
                            {renderCategoryFields('service')}
                        </Card>
                    </Box>
                </TabPanel>

                {/* Pricing Settings */}
                <TabPanel value={activeTab} index={3}>
                    <Box sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Pricing & Fees</Typography>
                        <Card variant="outlined" sx={{ p: 2 }}>
                            {renderCategoryFields('pricing')}
                        </Card>
                    </Box>
                </TabPanel>

                {/* Notification Settings */}
                <TabPanel value={activeTab} index={4}>
                    <Box sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Notification Preferences</Typography>
                        <Card variant="outlined" sx={{ p: 2 }}>
                            <Stack spacing={1}>
                                {renderCategoryFields('notifications')}
                            </Stack>
                        </Card>
                    </Box>
                </TabPanel>
            </Paper>

            {/* Quick Stats Card */}
            <Paper sx={{ mt: 3, p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>System Information</Typography>
                <Stack direction="row" spacing={3}>
                    <Card sx={{ flex: 1, bgcolor: COLORS.primary + '10' }}>
                        <CardContent>
                            <Typography variant="h5" color="primary">v1.0.0</Typography>
                            <Typography variant="body2" color="text.secondary">System Version</Typography>
                        </CardContent>
                    </Card>
                    <Card sx={{ flex: 1, bgcolor: COLORS.success + '10' }}>
                        <CardContent>
                            <Typography variant="h5" sx={{ color: COLORS.success }}>Active</Typography>
                            <Typography variant="body2" color="text.secondary">API Status</Typography>
                        </CardContent>
                    </Card>
                    <Card sx={{ flex: 1, bgcolor: COLORS.info + '10' }}>
                        <CardContent>
                            <Typography variant="h5" sx={{ color: COLORS.info }}>PostgreSQL</Typography>
                            <Typography variant="body2" color="text.secondary">Database</Typography>
                        </CardContent>
                    </Card>
                </Stack>
            </Paper>

            {/* Admin Management Link */}
            <Paper sx={{ mt: 3, p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Typography variant="h6">Admin Management</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Manage admin users and their roles (Super Admin only)
                        </Typography>
                    </Box>
                    <Button
                        variant="outlined"
                        onClick={() => navigate('/settings/admins')}
                    >
                        Manage Admins
                    </Button>
                </Stack>
            </Paper>

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

export default SettingsPage;
