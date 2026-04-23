import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, CssBaseline, Box, Typography } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { store } from './store';
import { theme } from './theme';
import { router } from './routes';

// Simple fallback component to verify React works
function TestComponent() {
  return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h3" gutterBottom>
        Servanza Admin Panel
      </Typography>
      <Typography color="text.secondary">
        React is rendering correctly! ✅
      </Typography>
    </Box>
  );
}

function App() {
  // For debugging, first verify React + MUI work
  const isDebugMode = false; // Set to true to see test component

  if (isDebugMode) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <TestComponent />
      </ThemeProvider>
    );
  }

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider
          maxSnack={3}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          autoHideDuration={4000}
        >
          <RouterProvider router={router} />
        </SnackbarProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
