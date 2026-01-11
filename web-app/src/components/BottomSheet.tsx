import { Box, Typography, IconButton } from '@mui/material';
import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import Icon from './Icon';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  /** Optional icon name to use for the close button (defaults to "Close") */
  closeIconName?: string;
  /** Hide the close icon button when true */
  hideClose?: boolean;
  title?: string;
  children: ReactNode;
  maxHeight?: string;
  zIndexBase?: number;
}

const BottomSheet = ({
  open,
  onClose,
  closeIconName: _closeIconName = 'Close',
  hideClose = false,
  title,
  children,
  maxHeight = '70vh',
  zIndexBase = 1100,
}: BottomSheetProps) => {
  if (!open) return null;
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Keep a CSS variable (--vh) updated to handle mobile browsers where 100vh
  // does not change when the on-screen keyboard appears. We set the variable
  // on the container so `maxHeight` can use it (see default usage below).
  useEffect(() => {
    const setVh = () => {
      try {
        const h = (window.visualViewport && window.visualViewport.height) || window.innerHeight;
        const vh = h * 0.01;
        if (containerRef.current) {
          containerRef.current.style.setProperty('--vh', `${vh}px`);
        }
      } catch (e) {
        /* ignore */
      }
    };

    setVh();
    window.addEventListener('resize', setVh);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', setVh);
    }
    return () => {
      window.removeEventListener('resize', setVh);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', setVh);
      }
    };
  }, []);

  // Ensure focused inputs inside the sheet are scrolled into view when the
  // on-screen keyboard appears or when an input receives focus. This helps
  // keep the focused field visible (avoids being hidden by the keyboard).
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ensureVisible = (el: Element | null) => {
      if (!el || !container) return;
      try {
        const target = el as HTMLElement;

        const viewportHeight = (window.visualViewport && window.visualViewport.height) || window.innerHeight;
        const elRect = target.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        // If the element's bottom is below the visible viewport area, scroll.
        const margin = 16; // small breathing room above keyboard
        const overlap = elRect.bottom - viewportHeight + margin;
        if (overlap > 0) {
          // Compute element's position relative to the container's scrollTop
          const offsetTop = elRect.top - containerRect.top + container.scrollTop;
          const targetScroll = Math.max(0, offsetTop - 80); // aim a bit above the field
          container.scrollTo({ top: targetScroll, behavior: 'smooth' });
        } else {
          // If element is above visible area of the container, bring it into view
          const above = containerRect.top - elRect.top + margin;
          if (above > 0) {
            const offsetTop = elRect.top - containerRect.top + container.scrollTop;
            container.scrollTo({ top: Math.max(0, offsetTop - 24), behavior: 'smooth' });
          }
        }
      } catch (e) {
        /* ignore */
      }
    };

    const onFocusIn = (e: FocusEvent) => {
      ensureVisible(e.target as Element);
    };

    const onViewportResize = () => {
      // If an element is focused inside this container, ensure it's visible
      const active = document.activeElement;
      if (container.contains(active)) {
        ensureVisible(active);
      }

      try {
        const vh = (window.visualViewport && window.visualViewport.height) || window.innerHeight;
        const keyboardOffset = Math.max(0, window.innerHeight - vh);
        // Move the sheet up by the keyboard height so focused inputs remain visible
        container.style.bottom = `${keyboardOffset}px`;
      } catch (e) {
        /* ignore */
      }
    };

    container.addEventListener('focusin', onFocusIn);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', onViewportResize);
    }
    window.addEventListener('resize', onViewportResize);

    return () => {
      container.removeEventListener('focusin', onFocusIn);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', onViewportResize);
      }
      window.removeEventListener('resize', onViewportResize);
      try {
        container.style.bottom = '';
      } catch (e) {
        /* ignore */
      }
    };
  }, [containerRef]);

  return (
    <>
      {/* Backdrop */}
      <Box
        onClick={onClose}
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: 'rgba(0,0,0,0.5)',
          zIndex: zIndexBase,
          animation: 'fadeIn 0.2s ease',
          '@keyframes fadeIn': {
            from: { opacity: 0 },
            to: { opacity: 1 },
          },
        }}
      />

      {/* Modal Content */}
      <Box
        ref={containerRef}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: 'white',
          borderRadius: '24px 24px 0 0',
          p: 3,
          pb: 4,
          zIndex: zIndexBase + 1,
          // Use fit-content so the sheet shrinks to its content when possible
          height: 'fit-content',
          // Keep a maxHeight so very tall content becomes scrollable and we
          // still support callers using the JS-set --vh variable.
          maxHeight,
          overflowY: 'auto',
          animation: 'slideUp 0.3s ease',
          '@keyframes slideUp': {
            from: { transform: 'translateY(100%)' },
            to: { transform: 'translateY(0)' },
          },
          // Make any contained primary buttons have no shadow and rounded
          '& .MuiButton-contained': {
            boxShadow: 'none',
            borderRadius: '12px',
          },
        }}
      >
        {/* Handle bar - always shown */}
        <Box
          sx={{
            width: 40,
            height: 4,
            bgcolor: '#DEE2E6',
            borderRadius: '2px',
            mx: 'auto',
            mb: 2,
          }}
        />

        {/* Title + Close */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: title ? 2 : 0 }}>
          {title ? (
            <Typography sx={{ fontSize: '20px', fontWeight: 700, color: '#212529' }}>{title}</Typography>
          ) : (
            <Box />
          )}

          {!hideClose && (
            <IconButton onClick={onClose} aria-label="close">
              <Icon name="CloseCircle" size={20} color="#6C757D" variant="Outline" />
            </IconButton>
          )}
        </Box>

        {/* Content */}
        {children}
      </Box>
    </>
  );
};

export default BottomSheet;