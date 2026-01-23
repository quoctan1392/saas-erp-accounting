// Design tokens for consistent styling across the app
export const tokens = {
  // Colors
  colors: {
    primary: '#FB7E00',
    primaryHover: '#E56E00',
    primaryLight: 'rgba(251, 126, 0, 0.05)',
    secondary: '#007DFB',
    secondaryHover: '#0056b3',
    
    text: {
      primary: '#212529',
      secondary: 'rgba(0,0,0,0.7)',
      tertiary: 'rgba(0,0,0,0.6)',
      disabled: 'rgba(0,0,0,0.38)',
    },
    
    border: {
      default: '#E0E0E0',
      light: '#F5F5F5',
      dashed: '#DEE2E6',
    },
    
    background: {
      page: 'white',
      white: '#FFFFFF',
      light: '#F8F9FA',
      card: 'rgba(0,0,0,0.04)',
    },
    
    status: {
      success: '#059669',
      warning: '#F59E0B',
      error: '#DC2626',
      info: '#007DFB',
    },
  },
  
  // Border radius
  radius: {
    small: '8px',
    medium: '12px',
    large: '16px',
    round: '24px',
    full: '100px',
  },
  
  // Spacing
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    xxl: '32px',
  },
  
  // Typography
  typography: {
    fontSize: {
      xs: '12px',
      sm: '13px',
      base: '14px',
      md: '15px',
      lg: '16px',
      xl: '18px',
      xxl: '20px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  
  // Input sizes
  input: {
    height: {
      small: '40px',
      medium: '48px',
      large: '56px',
    },
  },
  
  // Shadows
  shadows: {
    sm: '0 2px 8px rgba(0,0,0,0.08)',
    md: '0 4px 12px rgba(0,0,0,0.12)',
    lg: '0 8px 16px rgba(0,0,0,0.16)',
    footer: '0 -2px 10px rgba(0,0,0,0.05)',
  },
};

export default tokens;
