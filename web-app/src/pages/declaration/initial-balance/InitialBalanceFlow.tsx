import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import InitialBalanceStep1Screen from './InitialBalanceStep1Screen';
import InitialBalanceStep2Screen from './InitialBalanceStep2Screen';
import InitialBalanceStep3Screen from './InitialBalanceStep3Screen';

const STEP_PATHS = ['/declaration/initial-balance/step-1', '/declaration/initial-balance/step-2', '/declaration/initial-balance/step-3'];

const getIndexFromPath = (path: string) => {
  const idx = STEP_PATHS.findIndex((p) => path.startsWith(p));
  return idx === -1 ? 0 : idx;
};

const InitialBalanceFlow: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(() => getIndexFromPath(location.pathname));
  const prevIndexRef = React.useRef(activeIndex);

  useEffect(() => {
    const next = getIndexFromPath(location.pathname);
    if (next !== activeIndex) {
      prevIndexRef.current = activeIndex;
      setActiveIndex(next);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    // If user opened base flow URL, ensure we have step-1 in URL
    if (location.pathname === '/declaration/initial-balance' || location.pathname === '/declaration/initial-balance/') {
      navigate('/declaration/initial-balance/step-1', { replace: true });
    }
  }, [location.pathname, navigate]);

  const renderStep = (index: number) => {
    const style: React.CSSProperties = {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      transition: 'transform 280ms ease',
      willChange: 'transform',
      zIndex: index === activeIndex ? 30 : index < activeIndex ? 10 : 20,
    };

    const prev = prevIndexRef.current;

    // Determine transform based on active / previous indices
    if (index === activeIndex) {
      style.transform = 'translateX(0)';
    } else if (index < activeIndex) {
      // previous steps stay visible behind the active step
      style.transform = 'translateX(0)';
    } else {
      // future steps sit off to the right by default
      style.transform = 'translateX(100%)';
    }

    // If user navigated back (prev > active), animate the leaving panel (prev) to right
    if (prev > activeIndex && index === prev) {
      style.transform = 'translateX(100%)';
    }

    // Render appropriate step component with embedded flag to disable its own animation
    switch (index) {
      case 0:
        return (
          <Box key="step1" style={style}>
            <InitialBalanceStep1Screen embedded />
          </Box>
        );
      case 1:
        return (
          <Box key="step2" style={style}>
            <InitialBalanceStep2Screen embedded />
          </Box>
        );
      case 2:
        return (
          <Box key="step3" style={style}>
            <InitialBalanceStep3Screen embedded />
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      { [0,1,2].map((i) => renderStep(i)) }
    </Box>
  );
};

export default InitialBalanceFlow;
