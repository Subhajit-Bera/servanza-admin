import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    InputAdornment,
    Alert,
    CircularProgress,
    IconButton,
    Link,
} from '@mui/material';
import {
    Lock as LockIcon,
    Visibility,
    VisibilityOff,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
} from '@mui/icons-material';
import { authApi } from '../../api/client';
import { COLORS, SHADOWS } from '../../theme';

const ResetPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            setError('Invalid or missing password reset token. Please request a new link.');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (!token) {
            setError('Invalid reset link.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        try {
            setLoading(true);
            await authApi.resetPassword({ token, newPassword: password });
            setSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to reset password. The link might be expired.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                backgroundColor: COLORS.offWhite,
            }}
        >
            {/* Left Side - Hero Image */}
            <Box
                sx={{
                    flex: 1,
                    display: { xs: 'none', md: 'flex' },
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.darkGreen} 100%)`,
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Background Pattern */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        opacity: 0.1,
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                />

                {/* Content */}
                <Box sx={{ textAlign: 'center', zIndex: 1, px: 4, maxWidth: 500 }}>
                    <Box
                        sx={{
                            width: 80,
                            height: 80,
                            borderRadius: 3,
                            backgroundColor: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 4,
                            boxShadow: SHADOWS.heavy,
                        }}
                    >
                        <Typography variant="h3" fontWeight={700} color={COLORS.primary}>
                            S
                        </Typography>
                    </Box>
                    <Typography variant="h3" fontWeight={700} color="white" gutterBottom>
                        Servanza Admin
                    </Typography>
                    <Typography variant="h6" color="rgba(255,255,255,0.9)" sx={{ mb: 4 }}>
                        Update Your Password
                    </Typography>
                    <Typography variant="body1" color="rgba(255,255,255,0.8)">
                        Create a strong, new password to keep your administrator account secure.
                    </Typography>
                </Box>
            </Box>

            {/* Right Side - Form */}
            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 4,
                }}
            >
                <Card
                    sx={{
                        width: '100%',
                        maxWidth: 440,
                        boxShadow: SHADOWS.medium,
                        borderRadius: 3,
                    }}
                >
                    <CardContent sx={{ p: 4 }}>
                        {/* Mobile Logo */}
                        <Box
                            sx={{
                                display: { xs: 'flex', md: 'none' },
                                justifyContent: 'center',
                                mb: 3,
                            }}
                        >
                            <Box
                                sx={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: 2,
                                    backgroundColor: COLORS.primary,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Typography variant="h4" fontWeight={700} color="white">
                                    S
                                </Typography>
                            </Box>
                        </Box>

                        <Typography
                            variant="h4"
                            fontWeight={700}
                            color={COLORS.charcoal}
                            textAlign="center"
                            gutterBottom
                        >
                            Reset Password
                        </Typography>
                        
                        {!success ? (
                            <>
                                <Typography
                                    variant="body2"
                                    color={COLORS.mediumGray}
                                    textAlign="center"
                                    sx={{ mb: 4 }}
                                >
                                    Enter your new password below
                                </Typography>

                                {error && (
                                    <Alert severity="error" sx={{ mb: 3 }} icon={<ErrorIcon />}>
                                        {error}
                                    </Alert>
                                )}

                                <Box component="form" onSubmit={handleSubmit}>
                                    <TextField
                                        fullWidth
                                        label="New Password"
                                        placeholder="Enter new password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        disabled={loading || !token}
                                        sx={{ mb: 2.5 }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LockIcon sx={{ color: COLORS.primary }} />
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        edge="end"
                                                    >
                                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    
                                    <TextField
                                        fullWidth
                                        label="Confirm New Password"
                                        placeholder="Confirm your new password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        disabled={loading || !token}
                                        sx={{ mb: 4 }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LockIcon sx={{ color: COLORS.primary }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />

                                    <Button
                                        type="submit"
                                        variant="contained"
                                        fullWidth
                                        size="large"
                                        disabled={loading || !password || !confirmPassword || !token}
                                        sx={{
                                            height: 48,
                                            fontSize: 16,
                                            fontWeight: 600,
                                            boxShadow: SHADOWS.green,
                                            mb: 3,
                                            '&:hover': {
                                                boxShadow: SHADOWS.medium,
                                            },
                                        }}
                                    >
                                        {loading ? (
                                            <>
                                                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                                                Resetting...
                                            </>
                                        ) : (
                                            'Reset Password'
                                        )}
                                    </Button>
                                    
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Link
                                            component={RouterLink}
                                            to="/login"
                                            sx={{ 
                                                color: COLORS.mediumGray, 
                                                textDecoration: 'none',
                                                fontSize: 14,
                                                '&:hover': { color: COLORS.primary }
                                            }}
                                        >
                                            Return to login screen
                                        </Link>
                                    </Box>
                                </Box>
                            </>
                        ) : (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <CheckCircleIcon sx={{ fontSize: 64, color: COLORS.success, mb: 2 }} />
                                <Typography variant="h6" gutterBottom>
                                    Password Reset Successful!
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                                    Your password has been successfully updated. You can now use your new password to sign in.
                                </Typography>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    size="large"
                                    onClick={() => navigate('/login')}
                                    sx={{ fontWeight: 600 }}
                                >
                                    Proceed to Login
                                </Button>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
};

export default ResetPasswordPage;
