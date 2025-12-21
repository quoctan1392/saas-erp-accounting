import { useEffect, useRef, useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Badge,
} from '@mui/material';
import { Notification } from 'iconsax-react';
import badgeIconFreeTier from '../assets/badget_icon_free_tier.png';
import headerDayImage from '../assets/Header_day.png';
import headerNightImage from '../assets/Header_night.png';

interface DashboardHeaderProps {
  userName?: string;
  userEmail?: string;
  userPicture?: string;
  tenantName?: string;
  unreadNotifications?: number;
  title?: string; // Allow custom title
  onLogout?: () => void;
  onSwitchWorkspace?: () => void;
  onNotificationsClick?: () => void;
}

const DashboardHeader = ({
  userName = 'Người dùng',
  unreadNotifications = 0,
  title,
  onNotificationsClick,
}: DashboardHeaderProps) => {
  const greetContainerRef = useRef<HTMLDivElement | null>(null);
  const greetVisibleRef = useRef<HTMLDivElement | null>(null);
  const greetInnerRef = useRef<HTMLDivElement | null>(null);
  const badgeRef = useRef<HTMLDivElement | null>(null);
  const notifRef = useRef<HTMLDivElement | null>(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [translatePx, setTranslatePx] = useState(0);
  const [animDuration, setAnimDuration] = useState(8);
  const [isOverlapping, setIsOverlapping] = useState(false);

  // Determine if it's day or night (6am - 6pm = day, else = night)
  const isDayTime = () => {
    const hour = new Date().getHours();
    return hour >= 6 && hour < 18;
  };

  const backgroundImage = isDayTime() ? headerDayImage : headerNightImage;

  useEffect(() => {
    const update = () => {
      const visible = greetVisibleRef.current;
      const inner = greetInnerRef.current;
      const badgeEl = badgeRef.current;
      const notifEl = notifRef.current;
      const container = greetContainerRef.current;
      if (!visible || !inner || !container) return;

      const badgeW = badgeEl ? badgeEl.clientWidth : 0;
      const notifW = notifEl ? notifEl.clientWidth : 0;
      const containerW = container.clientWidth;
      const innerW = inner.scrollWidth;

      // Compute available width for greeting before needing to relocate the badge
      // Prefer to keep badge inline when possible: available = container width - notif width - small gap
      const availableForGreeting = containerW - notifW - 8; // 8px gap

      // Reset default styles for badge and visible area
      if (badgeEl) {
        badgeEl.style.position = 'static';
        badgeEl.style.right = 'auto';
        badgeEl.style.zIndex = 'auto';
      }
      if (greetVisibleRef.current) {
        (greetVisibleRef.current as HTMLElement).style.paddingRight = '';
      }

      // If the full greeting fits within available space, do nothing special
      if (innerW <= availableForGreeting) {
        setIsOverlapping(false);
        setShouldAnimate(false);
        setTranslatePx(0);
        return;
      }

      // Otherwise move the badge to sit next to the notification (free up max space for greeting)
      setIsOverlapping(true);
      if (badgeEl) {
        badgeEl.style.position = 'absolute';
        // place badge at the right edge of the greeting container (adjacent to notification)
        badgeEl.style.right = '0px';
        badgeEl.style.zIndex = '3';
      }

      // Give the visible greeting area right padding equal to badge width so text doesn't underlap it
      if (greetVisibleRef.current) {
        (greetVisibleRef.current as HTMLElement).style.paddingRight = `${badgeW + 8}px`;
      }

      // Enable marquee if the inner content still exceeds the visible area
      const visibleW = visible.clientWidth - (badgeW + 8);
      const delta = innerW - visibleW;
      if (delta > 6) {
        setShouldAnimate(true);
        setTranslatePx(-delta);
        setAnimDuration(Math.max(6, Math.min(30, delta / 20)) / 4);
      } else {
        setShouldAnimate(false);
        setTranslatePx(0);
      }
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [userName, title]);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={(theme) => ({
        bgcolor: 'white',
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderBottom: 'none',
        // On mobile and iPad-ish widths make header fixed at top so it stays while scrolling
        position: { xs: 'fixed', sm: 'fixed', md: 'sticky' },
        top: { xs: 0, sm: 0, md: 'auto' },
        left: { xs: 0, sm: 0, md: 'auto' },
        right: { xs: 0, sm: 0, md: 'auto' },
        zIndex: (theme.zIndex?.appBar ?? 1100) + 10,
      })}
    >
      <Toolbar sx={{ minHeight: '100px !important', px: 2, py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          {/* Greeting + Badge group. Reserve space on right for notifications (fixed). */}
          <Box
            ref={greetContainerRef}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              minWidth: 0,
              position: 'relative',
            }}
          >
            <Box
              ref={greetVisibleRef}
              data-greet-visible
              sx={{
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                display: 'block',
                flex: '1 1 auto',
              }}
            >
              <Typography
                component="div"
                sx={{
                  fontWeight: 600,
                  color: 'black',
                  fontSize: '20px',
                  fontFamily: '"Bricolage Grotesque", sans-serif',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  display: 'block',
                }}
              >
                {/* inner scrolling wrapper */}
                <Box
                  ref={greetInnerRef}
                  sx={
                    {
                      display: 'inline-block',
                      whiteSpace: 'nowrap',
                      transform: 'translateX(0)',
                      // dynamic translate via CSS var
                      '--translate': `${translatePx}px`,
                      animation: shouldAnimate ? `mh-scroll ${animDuration}s linear infinite` : 'none',
                      '&:hover': {
                        animationPlayState: 'paused',
                      },
                      '@keyframes mh-scroll': {
                        '0%': { transform: 'translateX(0)' },
                        '100%': { transform: 'translateX(var(--translate))' },
                      },
                    } as any
                  }
                >
                  {title || `Xin chào, ${userName}`}
                </Box>
              </Typography>
            </Box>

            {/* Free Tier Badge */}
            <Box
              ref={badgeRef}
                sx={(theme) => ({
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  bgcolor: 'rgba(255, 255, 255)',
                  borderRadius: '16px',
                  px: 1,
                  py: 0.5,
                  mr: 0.5,
                  border: '1px solid rgba(255, 107, 53, 0.2)',
                  flex: '0 0 auto',
                  // Keep badge in flow so it doesn't overlap the greeting text
                  position: 'static',
                  pointerEvents: 'auto',
                })}
            >
              <img
                src={badgeIconFreeTier}
                alt="Free tier"
                style={{ width: 16, height: 16 }}
              />
              <Typography
                sx={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#FF6B35',
                }}
              >
                Miễn phí
              </Typography>
            </Box>
          </Box>

          {/* Notifications */}
          <Box ref={notifRef} 
          sx={{ 
            ml: 'auto', 
            flex: '0 0 auto',
            borderWidth: 1,
            borderColor: 'rgba(0, 0, 0, 0.42)',
          }}>
            <IconButton
              onClick={onNotificationsClick}
              sx={{
                bgcolor: 'rgba(255, 255, 255)',
                color: 'black',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.6)',
                },
              }}
            >
              <Badge badgeContent={unreadNotifications} color="error">
                <Notification size={24} color="black" variant="Outline" />
              </Badge>
            </IconButton>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default DashboardHeader;
