import { Box, Typography } from '@mui/material';
import { Check } from '@mui/icons-material';
import * as Iconsax from 'iconsax-react';

// Icon wrapper component
const Icon = ({ name, size = 24, color = 'currentColor', variant = 'Outline' }: any) => {
  const Comp = (Iconsax as any)[name];
  if (!Comp) return null;
  return <Comp size={size} color={color} variant={variant} />;
};

interface StepItem {
  label: string;
  subLabel?: string;
}

interface CustomStepperProps {
  steps: StepItem[];
  activeStep: number; // 0-indexed
  completedSteps?: number[]; // Array of step indexes that were completed (not skipped)
  activeColor?: string;
  inactiveColor?: string;
}

const CustomStepper = ({
  steps,
  activeStep,
  completedSteps = [],
  activeColor = '#007DFB',
  inactiveColor = '#9E9E9E',
}: CustomStepperProps) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', width: '100%' }}>
      {steps.map((step, index) => {
        const isPast = index < activeStep;
        const isFuture = index > activeStep;
        const isCompleted = completedSteps.includes(index); // Was this step completed (not skipped)?

        const stepNumber = String(index + 1).padStart(2, '0');
        
        // Determine step color
        const stepColor = isFuture ? inactiveColor : activeColor;
        
        // Completed steps show a white check on activeColor background
        const showCheck = isCompleted;

        return (
          <Box key={index} sx={{ display: 'contents' }}>
            {/* Step */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: showCheck ? activeColor : '#FFFFFF',
                  border: showCheck ? 'none' : `2px solid ${isFuture ? '#E0E0E0' : activeColor}`,
                  color: showCheck ? '#FFFFFF' : stepColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                {showCheck ? (
                  <Check sx={{ fontSize: 24, color: '#FFFFFF' }} />
                ) : (
                  stepNumber
                )}
              </Box>
              <Typography
                sx={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: stepColor,
                  mt: 1,
                  textAlign: 'center',
                  lineHeight: 1.3,
                  whiteSpace: 'pre-line',
                }}
              >
                {step.subLabel ? `${step.label}\n${step.subLabel}` : step.label}
              </Typography>
            </Box>

            {/* Connector (except after the last step) */}
            {index < steps.length - 1 && (
              <Box
                sx={{
                  flex: 0.9,
                  height: 2,
                  bgcolor: isPast ? activeColor : '#E0E0E0',
                  mt: 2.5,
                }}
              />
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default CustomStepper;
