import React from 'react';
import { Box } from '@mui/material';
import PageHeader from './PageHeader';
import FormContainer from './FormContainer';
import headerDay from '../assets/Header_day.png';
import tokens from '../styles/tokens';

interface Props {
  title: string;
  children: React.ReactNode;
  rightAction?: React.ReactNode;
  onBack?: () => void;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  transparentBackground?: boolean;
}

const DecoratedFormLayout: React.FC<Props> = ({ title, children, rightAction, onBack, maxWidth = 'sm', transparentBackground = false }) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: transparentBackground ? 'transparent' : tokens.colors.background.white,
        position: 'relative',
        pt: 0,
      }}
    >
      {/* <PageHeader title={title} onBack={onBack} backgroundImage={headerDay} variant="decorative" rightAction={rightAction} /> */}

      <FormContainer maxWidth={maxWidth} variant="panel" panelBackgroundColor={transparentBackground ? 'transparent' : tokens.colors.background.white} backgroundColor={transparentBackground ? 'transparent' : tokens.colors.background.page}>
        {children}
      </FormContainer>

      <div style={{position: 'absolute', background: 'red', zIndex: 1000}}>
        <PageHeader title={title} onBack={onBack} backgroundImage={headerDay} variant="decorative" rightAction={rightAction} />
      </div>

    </Box>
  );
};

export default DecoratedFormLayout;
