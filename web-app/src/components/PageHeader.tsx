import { Box, Typography, IconButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import * as Iconsax from 'iconsax-react';
import tokens from '../styles/tokens';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  backgroundImage?: string;
  backgroundColor?: string;
  rightAction?: React.ReactNode;
  showBackButton?: boolean;
  variant?: 'default' | 'decorative'; // decorative = with image bg
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  onBack,
  backgroundImage,
  backgroundColor = tokens.colors.background.white,
  rightAction,
  showBackButton = true,
  variant = 'default',
}) => {
  if (variant === 'decorative' && backgroundImage) {
    return (
      <Box sx={{ position: 'relative' }}>
        {/* Decorative background image */}
        <Box
          sx={{
            height: { xs: 160, sm: 120 },
            width: '100%',
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'fixed',
            top:0, left: 0, right: 0
          }}
        />

        {/* Fixed header overlay */}
        <Box
          sx={{
            position: 'fixed',
            // background: 'red',
            top: 36,
            left: 0,
            right: 0,
            zIndex: 20,
            px: { xs: 2, sm: 3 },
          }}
        >
          <Box
            sx={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              maxWidth: 'sm',
              mx: 'auto',
              py: 0.5,
            }}
          >
            {showBackButton && onBack && (
              <IconButton
                onClick={onBack}
                sx={{
                  position: 'absolute',
                  left: 0,
                  top: 6,
                  width: 40,
                  height: 40,
                  backgroundColor: '#fff',
                  '&:hover': { backgroundColor: '#f5f5f5' },
                }}
              >
                <ArrowBack />
              </IconButton>
            )}

            <Box
              sx={{
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 2,
              }}
            >
              <Typography
                sx={{
                  color: tokens.colors.text.primary,
                  textAlign: 'center',
                  fontFamily: '"Bricolage Grotesque"',
                  fontSize: '20px',
                  fontWeight: 500,
                }}
              >
                {title}
              </Typography>
            </Box>

            {rightAction && (
              <Box sx={{ position: 'absolute', right: 0, top: 6 }}>{rightAction}</Box>
            )}
          </Box>
        </Box>
      </Box>
    );
  }

  // Default flat header
  return (
    <Box
      sx={{
        bgcolor: backgroundColor,
        borderBottom: `1px solid ${tokens.colors.border.default}`,
      }}
    >
      <Box
        sx={{
          px: 2,
          pt: 1,
          pb: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {showBackButton && onBack && (
          <IconButton onClick={onBack} sx={{ p: 0.5, ml: -0.5 }}>
            <Iconsax.ArrowLeft size={24} color={tokens.colors.text.primary} />
          </IconButton>
        )}

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography sx={{ fontSize: 16, fontWeight: 600, color: tokens.colors.text.primary }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography sx={{ fontSize: 13, color: tokens.colors.text.tertiary, mt: 0.25 }}>
              {subtitle}
            </Typography>
          )}
        </Box>

        {rightAction ? (
          <Box>{rightAction}</Box>
        ) : (
          showBackButton && <Box sx={{ width: 40 }} />
        )}
      </Box>
    </Box>
  );
};

export default PageHeader;
