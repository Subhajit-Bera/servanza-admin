import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Tabs,
    Tab,
    Switch,
    FormControlLabel,
    Button,
    Alert,
    Snackbar,
    CircularProgress,
    Chip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    Save as SaveIcon,
    Refresh as RefreshIcon,
    Security as SecurityIcon,
    Warning as WarningIcon,
} from '@mui/icons-material';
import client from '../../api/client';
import { COLORS, SHADOWS } from '../../theme';

interface PermissionCategory {
    permissions: string[];
    description: string;
}

interface RolePermissions {
    role: string;
    displayName: string;
    permissions: string[];
    isFromDatabase: boolean;
}

interface PermissionsConfig {
    permissions: string[];
    categories: Record<string, PermissionCategory>;
    displayNames: Record<string, string>;
    roles: string[];
    roleDisplayNames: Record<string, string>;
    roleDescriptions: Record<string, string>;
}

const RolePermissionsPage: React.FC = () => {
    const [config, setConfig] = useState<PermissionsConfig | null>(null);
    const [rolesPermissions, setRolesPermissions] = useState<RolePermissions[]>([]);
    const [selectedRoleIndex, setSelectedRoleIndex] = useState(1); // Start at ADMIN (skip SUPER_ADMIN)
    const [modifiedPermissions, setModifiedPermissions] = useState<Record<string, string[]>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [configRes, permissionsRes] = await Promise.all([
                client.get('/admin/permissions/config'),
                client.get('/admin/roles/permissions'),
            ]);
            setConfig(configRes.data.data);
            setRolesPermissions(permissionsRes.data.data);

            // Initialize modified permissions with current values
            const initial: Record<string, string[]> = {};
            permissionsRes.data.data.forEach((rp: RolePermissions) => {
                initial[rp.role] = [...rp.permissions];
            });
            setModifiedPermissions(initial);
        } catch (error) {
            console.error('Failed to fetch permissions:', error);
            setSnackbar({ open: true, message: 'Failed to load permissions', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const selectedRole = rolesPermissions[selectedRoleIndex];
    const isSuperAdmin = selectedRole?.role === 'SUPER_ADMIN';

    const hasPermission = (permission: string): boolean => {
        if (!selectedRole) return false;
        const permissions = modifiedPermissions[selectedRole.role] || selectedRole.permissions;
        return permissions.includes(permission) || permissions.includes('*');
    };

    const togglePermission = (permission: string) => {
        if (isSuperAdmin) return;

        const role = selectedRole.role;
        const current = modifiedPermissions[role] || [...selectedRole.permissions];

        if (current.includes(permission)) {
            setModifiedPermissions({
                ...modifiedPermissions,
                [role]: current.filter(p => p !== permission),
            });
        } else {
            setModifiedPermissions({
                ...modifiedPermissions,
                [role]: [...current, permission],
            });
        }
    };

    const hasChanges = (): boolean => {
        if (!selectedRole) return false;
        const original = selectedRole.permissions;
        const modified = modifiedPermissions[selectedRole.role] || [];
        if (original.length !== modified.length) return true;
        return !original.every(p => modified.includes(p));
    };

    const handleSave = async () => {
        if (!selectedRole || isSuperAdmin) return;

        setSaving(true);
        try {
            await client.put(`/admin/roles/${selectedRole.role}/permissions`, {
                permissions: modifiedPermissions[selectedRole.role],
            });
            setSnackbar({ open: true, message: `Permissions updated for ${selectedRole.displayName}`, severity: 'success' });
            fetchData(); // Refresh data
        } catch (error) {
            console.error('Failed to save permissions:', error);
            setSnackbar({ open: true, message: 'Failed to save permissions', severity: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleReset = async () => {
        if (!selectedRole || isSuperAdmin) return;

        setSaving(true);
        try {
            await client.post(`/admin/roles/${selectedRole.role}/reset`);
            setSnackbar({ open: true, message: `Permissions reset to defaults for ${selectedRole.displayName}`, severity: 'success' });
            fetchData(); // Refresh data
        } catch (error) {
            console.error('Failed to reset permissions:', error);
            setSnackbar({ open: true, message: 'Failed to reset permissions', severity: 'error' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!config || rolesPermissions.length === 0) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">Failed to load permissions configuration</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
                <SecurityIcon sx={{ fontSize: 32, color: COLORS.primary }} />
                <Box>
                    <Typography variant="h4" fontWeight={700}>
                        Role Permissions
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage what each admin role can access and modify
                    </Typography>
                </Box>
            </Box>

            {/* Role Tabs */}
            <Paper sx={{ mb: 3, borderRadius: 2, boxShadow: SHADOWS.light }}>
                <Tabs
                    value={selectedRoleIndex}
                    onChange={(_, newValue) => setSelectedRoleIndex(newValue)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontWeight: 600,
                            minWidth: 140,
                        },
                    }}
                >
                    {rolesPermissions.map((rp) => (
                        <Tab
                            key={rp.role}
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {rp.displayName}
                                    {rp.role === 'SUPER_ADMIN' && (
                                        <Chip label="Read Only" size="small" color="warning" sx={{ ml: 1 }} />
                                    )}
                                </Box>
                            }
                        />
                    ))}
                </Tabs>
            </Paper>

            {/* Role Description */}
            {selectedRole && (
                <Box sx={{ mb: 3 }}>
                    <Alert
                        severity={isSuperAdmin ? 'warning' : 'info'}
                        icon={isSuperAdmin ? <WarningIcon /> : undefined}
                    >
                        {config.roleDescriptions[selectedRole.role]}
                        {isSuperAdmin && ' Super Admin permissions cannot be modified.'}
                    </Alert>
                </Box>
            )}

            {/* Action Buttons */}
            {!isSuperAdmin && (
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleSave}
                        disabled={!hasChanges() || saving}
                        sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            '&:hover': { background: 'linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)' }
                        }}
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={handleReset}
                        disabled={saving}
                    >
                        Reset to Defaults
                    </Button>
                    {hasChanges() && (
                        <Chip
                            label="Unsaved changes"
                            color="warning"
                            size="small"
                            sx={{ alignSelf: 'center' }}
                        />
                    )}
                </Box>
            )}

            {/* Permission Categories */}
            {Object.entries(config.categories).map(([category, { permissions, description }]) => (
                <Accordion
                    key={category}
                    defaultExpanded
                    sx={{
                        mb: 2,
                        borderRadius: '12px !important',
                        boxShadow: SHADOWS.light,
                        '&:before': { display: 'none' },
                        overflow: 'hidden',
                    }}
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        sx={{
                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.12) 0%, rgba(118, 75, 162, 0.12) 100%)'
                            },
                        }}
                    >
                        <Box>
                            <Typography fontWeight={600}>{category}</Typography>
                            <Typography variant="caption" color="text.secondary">
                                {description}
                            </Typography>
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 2 }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 1 }}>
                            {permissions.map(permission => (
                                <FormControlLabel
                                    key={permission}
                                    control={
                                        <Switch
                                            checked={hasPermission(permission)}
                                            onChange={() => togglePermission(permission)}
                                            disabled={isSuperAdmin}
                                            size="small"
                                            sx={{
                                                '& .MuiSwitch-switchBase.Mui-checked': {
                                                    color: COLORS.primary,
                                                },
                                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                    backgroundColor: COLORS.primary,
                                                },
                                            }}
                                        />
                                    }
                                    label={
                                        <Typography variant="body2">
                                            {config.displayNames[permission] || permission}
                                        </Typography>
                                    }
                                    sx={{
                                        m: 0,
                                        p: 1,
                                        borderRadius: 1,
                                        '&:hover': { bgcolor: 'action.hover' },
                                    }}
                                />
                            ))}
                        </Box>
                    </AccordionDetails>
                </Accordion>
            ))}

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
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

export default RolePermissionsPage;
