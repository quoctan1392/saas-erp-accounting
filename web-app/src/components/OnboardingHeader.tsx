import { Box, IconButton, LinearProgress } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';

interface OnboardingHeaderProps {
  onBack: () => void;
  progress: number; // 0-100
  step?: string; // e.g., "1/3"
}

const OnboardingHeader: React.FC<OnboardingHeaderProps> = ({ onBack, progress, step }) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        backgroundColor: 'transparent',
        py: 2,
        px: { xs: 2, sm: 3 },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', maxWidth: 'sm', mx: 'auto' }}>
        <IconButton
          onClick={onBack}
          sx={{
            width: 40,
            height: 40,
            backgroundColor: '#fff',
            '&:hover': {
              backgroundColor: '#f5f5f5',
            },
          }}
        >
          <ArrowBack />
        </IconButton>
        
        <Box sx={{ flex: 1, mx: 2 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(255, 255, 255, 1)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#FB7E00',
                borderRadius: 4,
              },
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default OnboardingHeader;
