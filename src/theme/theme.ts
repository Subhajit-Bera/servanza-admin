import { createTheme } from '@mui/material/styles';

// Servanza Brand Colors — Muted Teal / Sage + Warm Rust
// Synced with servanza-customer theme
export const COLORS = {
    // Primary Brand
    primary: '#47855f',       // muted-teal-600
    darkGreen: '#366347',     // muted-teal-700
    lightGreen: '#eef6f1',    // muted-teal-50

    // Accent
    accent: '#E17A5E',        // Warm Rust / Terracotta

    // Neutrals
    white: '#FFFFFF',
    offWhite: '#FAFAFA',
    lightGray: '#deede4',     // muted-teal-100
    mediumGray: '#7ab892',    // muted-teal-400
    darkGray: '#366347',      // muted-teal-700
    charcoal: '#122118',      // muted-teal-900

    // UI
    bgLight: '#FAFAFA',
    border: '#deede4',        // muted-teal-100

    // Status
    success: '#59a677',       // muted-teal-500
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    pending: '#F59E0B',
    completed: '#366347',     // muted-teal-700
    cancelled: '#EF4444',
};

// Shadow System
export const SHADOWS = {
    light: '0 2px 4px rgba(0, 0, 0, 0.08)',
    medium: '0 4px 8px rgba(0, 0, 0, 0.12)',
    heavy: '0 8px 16px rgba(0, 0, 0, 0.18)',
    green: '0 4px 8px rgba(71, 133, 95, 0.28)',
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
