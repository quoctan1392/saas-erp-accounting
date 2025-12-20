import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Stack,
} from '@mui/material';

export const LoginDemoScreenSimple: React.FC = () => {
  const navigate = useNavigate();

  const handleDemoLogin = () => {
    console.log('Demo login clicked');
    // Navigate to dashboard for testing
    navigate('/dashboard');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 2,
          }}
        >
          <Stack spacing={3}>
            <Typography variant="h4" align="center" fontWeight="bold">
              Login Demo
            </Typography>
            
            <Typography variant="body1" align="center" color="text.secondary">
              Click button below to test login flow
            </Typography>

            <Button
              variant="contained"
              size="large"
              onClick={handleDemoLogin}
              fullWidth
            >
              Demo Login
            </Button>

            <Button
              variant="outlined"
              onClick={() => navigate('/')}
              fullWidth
            >
              Back to Home
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginDemoScreenSimple;
