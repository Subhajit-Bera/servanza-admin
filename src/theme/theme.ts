import { createTheme } from '@mui/material/styles';

// Servanza Brand Colors (Consistent with Mobile Apps)
export const COLORS = {
    // Primary Brand
    primary: '#2ECC71',
    darkGreen: '#27AE60',
    lightGreen: '#A8E6CF',

    // Accent
    accent: '#FF6B6B',

    // Neutrals
    white: '#FFFFFF',
    offWhite: '#F8F9FA',
    lightGray: '#E9ECEF',
    mediumGray: '#ADB5BD',
    darkGray: '#495057',
    charcoal: '#212529',

    // UI
    bgLight: '#F8F9FA',
    border: '#E9ECEF',

    // Status
    success: '#2ECC71',
    warning: '#F39C12',
    error: '#E74C3C',
    info: '#3498DB',
    pending: '#F39C12',
    completed: '#27AE60',
    cancelled: '#E74C3C',
};

// Shadow System
export const SHADOWS = {
    light: '0 2px 4px rgba(0, 0, 0, 0.1)',
    medium: '0 4px 8px rgba(0, 0, 0, 0.15)',
    heavy: '0 8px 16px rgba(0, 0, 0, 0.2)',
    green: '0 4px 8px rgba(46, 204, 113, 0.3)',
};

// Create MUI Theme
export const theme = createTheme({
    palette: {
        primary: {
            main: COLORS.primary,
            dark: COLORS.darkGreen,
            light: COLORS.lightGreen,
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: COLORS.accent,
            contrastText: '#FFFFFF',
        },
        error: {
            main: COLORS.error,
        },
        warning: {
            main: COLORS.warning,
        },
        info: {
            main: COLORS.info,
        },
        success: {
            main: COLORS.success,
        },
        background: {
            default: COLORS.offWhite,
            paper: COLORS.white,
        },
        text: {
            primary: COLORS.charcoal,
            secondary: COLORS.darkGray,
            disabled: COLORS.mediumGray,
        },
        divider: COLORS.lightGray,
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Segoe UI", sans-serif',
        h1: {
            fontSize: '32px',
            fontWeight: 700,
            color: COLORS.charcoal,
        },
        h2: {
            fontSize: '24px',
            fontWeight: 700,
            color: COLORS.charcoal,
        },
        h3: {
            fontSize: '20px',
            fontWeight: 600,
            color: COLORS.charcoal,
        },
        h4: {
            fontSize: '18px',
            fontWeight: 600,
            color: COLORS.charcoal,
        },
        body1: {
            fontSize: '14px',
            color: COLORS.darkGray,
        },
        body2: {
            fontSize: '12px',
            color: COLORS.mediumGray,
        },
        button: {
            textTransform: 'none',
            fontWeight: 600,
        },
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    padding: '10px 20px',
                    fontWeight: 600,
                },
                containedPrimary: {
                    boxShadow: SHADOWS.green,
                    '&:hover': {
                        boxShadow: SHADOWS.medium,
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    boxShadow: SHADOWS.light,
                    borderRadius: 12,
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    boxShadow: SHADOWS.light,
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                            borderColor: COLORS.primary,
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: COLORS.primary,
                            borderWidth: 2,
                        },
                    },
                },
            },
        },
        MuiTableHead: {
            styleOverrides: {
                root: {
                    backgroundColor: COLORS.offWhite,
                    '& .MuiTableCell-head': {
                        fontWeight: 600,
                        color: COLORS.charcoal,
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 500,
                },
            },
        },
    },
});

export default theme;
