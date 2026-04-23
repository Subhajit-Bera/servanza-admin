import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    InputAdornment,
    IconButton,
    Checkbox,
    FormControlLabel,
    Alert,
    CircularProgress,
    Link,
} from '@mui/material';
import {
    Email as EmailIcon,
    Lock as LockIcon,
    Visibility,
    VisibilityOff,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { login, clearError } from '../../store/slices/authSlice';
import { COLORS, SHADOWS } from '../../theme';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { loading, error } = useAppSelector((state) => state.auth);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(clearError());

        const result = await dispatch(login({ email, password }));
        if (login.fulfilled.match(result)) {
            navigate('/dashboard');
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
                        Manage your platform with ease
                    </Typography>
                    <Typography variant="body1" color="rgba(255,255,255,0.8)">
                        Access comprehensive dashboards, manage customers & buddies,
                        track bookings, and analyze platform performance.
                    </Typography>
                </Box>
            </Box>

            {/* Right Side - Login Form */}
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
                            Admin Portal
                        </Typography>
                        <Typography
                            variant="body2"
                            color={COLORS.mediumGray}
                            textAlign="center"
                            sx={{ mb: 4 }}
                        >
                            Sign in to your account
                        </Typography>

                        {error && (
                            <Alert severity="error" sx={{ mb: 3 }}>
                                {error}
                            </Alert>
                        )}

                        <Box component="form" onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                label="Email or Username"
                                placeholder="Enter your email or username"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                sx={{ mb: 2.5 }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailIcon sx={{ color: COLORS.primary }} />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <TextField
                                fullWidth
                                label="Password"
                                placeholder="Enter your password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                sx={{ mb: 2 }}
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

                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    mb: 3,
                                }}
                            >
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            sx={{
                                                color: COLORS.mediumGray,
                                                '&.Mui-checked': { color: COLORS.primary },
                                            }}
                                        />
                                    }
                                    label={
                                        <Typography variant="body2" color={COLORS.darkGray}>
                                            Remember me
                                        </Typography>
                                    }
                                />
                                <Link
                                    href="#"
                                    underline="hover"
                                    sx={{ color: COLORS.primary, fontSize: 14 }}
                                >
                                    Forgot Password?
                                </Link>
                            </Box>

                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                size="large"
                                disabled={loading || !email || !password}
                                sx={{
                                    height: 48,
                                    fontSize: 16,
                                    fontWeight: 600,
                                    boxShadow: SHADOWS.green,
                                    '&:hover': {
                                        boxShadow: SHADOWS.medium,
                                    },
                                }}
                            >
                                {loading ? (
                                    <>
                                        <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                                        Signing in...
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </Button>
                        </Box>

                        <Typography
                            variant="caption"
                            color={COLORS.mediumGray}
                            textAlign="center"
                            display="block"
                            sx={{ mt: 4 }}
                        >
                            Protected by enterprise-grade security
                        </Typography>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
};

export default LoginPage;
