import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
    Link,
} from '@mui/material';
import {
    Email as EmailIcon,
    ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { authApi } from '../../api/client';
import { COLORS, SHADOWS } from '../../theme';

const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (!email) {
            setError('Please enter your email address');
            return;
        }

        try {
            setLoading(true);
            await authApi.forgotPassword(email);
            setSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to send reset link. Please try again.');
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
                        Secure Password Recovery
                    </Typography>
                    <Typography variant="body1" color="rgba(255,255,255,0.8)">
                        Follow the instructions sent to your email to regain access to your administrator account.
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
                            Forgot Password
                        </Typography>
                        <Typography
                            variant="body2"
                            color={COLORS.mediumGray}
                            textAlign="center"
                            sx={{ mb: 4 }}
                        >
                            Enter your email to receive a password reset link
                        </Typography>

                        {error && (
                            <Alert severity="error" sx={{ mb: 3 }}>
                                {error}
                            </Alert>
                        )}
                        
                        {success && (
                            <Alert severity="success" sx={{ mb: 3 }}>
                                Password reset link has been sent to your email. Please check your inbox.
                            </Alert>
                        )}

                        <Box component="form" onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                label="Email Address"
                                placeholder="Enter your email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading || success}
                                sx={{ mb: 3 }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailIcon sx={{ color: COLORS.primary }} />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                size="large"
                                disabled={loading || !email || success}
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
                                        Sending Link...
                                    </>
                                ) : (
                                    'Send Reset Link'
                                )}
                            </Button>

                            <Box sx={{ textAlign: 'center' }}>
                                <Link
                                    component={RouterLink}
                                    to="/login"
                                    sx={{ 
                                        color: COLORS.primary, 
                                        textDecoration: 'none',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        fontWeight: 500,
                                        '&:hover': { textDecoration: 'underline' }
                                    }}
                                >
                                    <ArrowBackIcon fontSize="small" /> Back to Login
                                </Link>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
};

export default ForgotPasswordPage;
