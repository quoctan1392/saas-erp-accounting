import { Box } from '@mui/material';
import { useState, useEffect, useRef } from 'react';

interface StepTransitionProps {
  children: React.ReactNode;
  stepKey: string | number;
  direction?: 'forward' | 'backward';
}

const StepTransition = ({ children, stepKey, direction = 'forward' }: StepTransitionProps) => {
  const [displayedStep, setDisplayedStep] = useState(stepKey);
  const [isAnimating, setIsAnimating] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const previousStepRef = useRef(stepKey);

  useEffect(() => {
    if (stepKey !== previousStepRef.current) {
      // Determine animation direction
      const isForward = direction === 'forward';
      setSlideDirection(isForward ? 'right' : 'left');
      setIsAnimating(true);

      // Wait for animation to complete, then update displayed step
      const timer = setTimeout(() => {
        setDisplayedStep(stepKey);
        setIsAnimating(false);
        previousStepRef.current = stepKey;
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [stepKey, direction]);

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
          transform: isAnimating
            ? slideDirection === 'right'
              ? 'translateX(-100%)'
              : 'translateX(100%)'
            : 'translateX(0)',
          transition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'transform',
        }}
        key={displayedStep}
      >
        {children}
      </Box>
    </Box>
  );
};

export default StepTransition;
