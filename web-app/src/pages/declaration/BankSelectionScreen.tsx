import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Divider } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import headerDay from '../../assets/Header_day.png';
import SearchBox from '../../components/SearchBox';

interface Bank {
  code: string;
  shortName: string;
  name: string;
  logo: string;
  isStateOwned?: boolean;
}

// Vietnamese banks list with 4 state-owned banks first, then alphabetical
// Logo URLs: Primary from SePay (icon only), fallback to VietQR CDN
const VIETNAM_BANKS: Bank[] = [
  // 4 State-owned banks first
  { code: 'agribank', shortName: 'Agribank', name: 'Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam', logo: 'https://my.sepay.vn/assets/images/banklogo/agribank-icon.png', isStateOwned: true },
  { code: 'bidv', shortName: 'BIDV', name: 'Ngân hàng Đầu tư và Phát triển Việt Nam', logo: 'https://my.sepay.vn/assets/images/banklogo/bidv-icon.png', isStateOwned: true },
  { code: 'vietcombank', shortName: 'Vietcombank', name: 'Ngân hàng Ngoại thương Việt Nam', logo: 'https://my.sepay.vn/assets/images/banklogo/vietcombank-icon.png', isStateOwned: true },
  { code: 'vietinbank', shortName: 'VietinBank', name: 'Ngân hàng Công Thương Việt Nam', logo: 'https://my.sepay.vn/assets/images/banklogo/vietinbank-icon.png', isStateOwned: true },
  // Other banks in alphabetical order
  { code: 'abbank', shortName: 'ABBank', name: 'Ngân hàng An Bình', logo: 'https://my.sepay.vn/assets/images/banklogo/abbank-icon.png' },
  { code: 'acb', shortName: 'ACB', name: 'Ngân hàng Á Châu', logo: 'https://my.sepay.vn/assets/images/banklogo/acb-icon.png' },
  { code: 'bacabank', shortName: 'BacABank', name: 'Ngân hàng Bắc Á', logo: 'https://my.sepay.vn/assets/images/banklogo/bacabank-icon.png' },
  { code: 'baovietbank', shortName: 'BaoVietBank', name: 'Ngân hàng Bảo Việt', logo: 'https://cdn.vietqr.io/img/BVB.png' },
  { code: 'cbbank', shortName: 'CBBank', name: 'Ngân hàng Xây dựng', logo: 'https://cdn.vietqr.io/img/CBB.png' },
  { code: 'cimb', shortName: 'CIMB', name: 'Ngân hàng CIMB Việt Nam', logo: 'https://cdn.vietqr.io/img/CIMB.png' },
  { code: 'coopbank', shortName: 'Co-opBank', name: 'Ngân hàng Hợp tác xã Việt Nam', logo: 'https://cdn.vietqr.io/img/COOPBANK.png' },
  { code: 'dongabank', shortName: 'DongABank', name: 'Ngân hàng Đông Á', logo: 'https://cdn.vietqr.io/img/DOB.png' },
  { code: 'eximbank', shortName: 'Eximbank', name: 'Ngân hàng Xuất Nhập Khẩu Việt Nam', logo: 'https://my.sepay.vn/assets/images/banklogo/eximbank-icon.png' },
  { code: 'gpbank', shortName: 'GPBank', name: 'Ngân hàng Dầu khí Toàn cầu', logo: 'https://cdn.vietqr.io/img/GPB.png' },
  { code: 'hdbank', shortName: 'HDBank', name: 'Ngân hàng Phát triển TP.HCM', logo: 'https://my.sepay.vn/assets/images/banklogo/hdbank-icon.png' },
  { code: 'hongleongbank', shortName: 'HongLeong', name: 'Ngân hàng Hong Leong Việt Nam', logo: 'https://cdn.vietqr.io/img/HLBVN.png' },
  { code: 'hsbc', shortName: 'HSBC', name: 'Ngân hàng HSBC Việt Nam', logo: 'https://cdn.vietqr.io/img/HSBC.png' },
  { code: 'ibk', shortName: 'IBK', name: 'Ngân hàng Công nghiệp Hàn Quốc', logo: 'https://cdn.vietqr.io/img/IBK.png' },
  { code: 'indovinabank', shortName: 'IndovinaBank', name: 'Ngân hàng Indovina', logo: 'https://cdn.vietqr.io/img/IVB.png' },
  { code: 'kienlongbank', shortName: 'KienLongBank', name: 'Ngân hàng Kiên Long', logo: 'https://my.sepay.vn/assets/images/banklogo/kienlongbank-icon.png' },
  { code: 'lpbank', shortName: 'LPBank', name: 'Ngân hàng Bưu điện Liên Việt', logo: 'https://my.sepay.vn/assets/images/banklogo/lienvietpostbank-icon.png' },
  { code: 'mbbank', shortName: 'MB Bank', name: 'Ngân hàng Quân đội', logo: 'https://my.sepay.vn/assets/images/banklogo/mbbank-icon.png' },
  { code: 'msb', shortName: 'MSB', name: 'Ngân hàng Hàng Hải Việt Nam', logo: 'https://my.sepay.vn/assets/images/banklogo/msb-icon.png' },
  { code: 'namabank', shortName: 'NamABank', name: 'Ngân hàng Nam Á', logo: 'https://my.sepay.vn/assets/images/banklogo/nama-icon.png' },
  { code: 'ncb', shortName: 'NCB', name: 'Ngân hàng Quốc Dân', logo: 'https://my.sepay.vn/assets/images/banklogo/ncb-icon.png' },
  { code: 'ocb', shortName: 'OCB', name: 'Ngân hàng Phương Đông', logo: 'https://my.sepay.vn/assets/images/banklogo/ocb-icon.png' },
  { code: 'oceanbank', shortName: 'OceanBank', name: 'Ngân hàng Đại Dương', logo: 'https://cdn.vietqr.io/img/OCEANBANK.png' },
  { code: 'pgbank', shortName: 'PGBank', name: 'Ngân hàng Xăng dầu Petrolimex', logo: 'https://my.sepay.vn/assets/images/banklogo/pgbank-icon.png' },
  { code: 'publicbank', shortName: 'PublicBank', name: 'Ngân hàng Public Bank Việt Nam', logo: 'https://cdn.vietqr.io/img/PBVN.png' },
  { code: 'pvcombank', shortName: 'PVComBank', name: 'Ngân hàng Đại chúng Việt Nam', logo: 'https://cdn.vietqr.io/img/PVCB.png' },
  { code: 'sacombank', shortName: 'Sacombank', name: 'Ngân hàng Sài Gòn Thương Tín', logo: 'https://my.sepay.vn/assets/images/banklogo/sacombank-icon.png' },
  { code: 'saigonbank', shortName: 'SaigonBank', name: 'Ngân hàng Sài Gòn Công Thương', logo: 'https://cdn.vietqr.io/img/SGICB.png' },
  { code: 'scb', shortName: 'SCB', name: 'Ngân hàng Sài Gòn', logo: 'https://cdn.vietqr.io/img/SCB.png' },
  { code: 'seabank', shortName: 'SeABank', name: 'Ngân hàng Đông Nam Á', logo: 'https://my.sepay.vn/assets/images/banklogo/seabank-icon.png' },
  { code: 'shb', shortName: 'SHB', name: 'Ngân hàng Sài Gòn - Hà Nội', logo: 'https://my.sepay.vn/assets/images/banklogo/shb-icon.png' },
  { code: 'shinhanbank', shortName: 'ShinhanBank', name: 'Ngân hàng Shinhan Việt Nam', logo: 'https://cdn.vietqr.io/img/SHBVN.png' },
  { code: 'standardchartered', shortName: 'Standard Chartered', name: 'Ngân hàng Standard Chartered Việt Nam', logo: 'https://cdn.vietqr.io/img/SCVN.png' },
  { code: 'techcombank', shortName: 'Techcombank', name: 'Ngân hàng Kỹ thương Việt Nam', logo: 'https://my.sepay.vn/assets/images/banklogo/techcombank-icon.png' },
  { code: 'tpbank', shortName: 'TPBank', name: 'Ngân hàng Tiên Phong', logo: 'https://my.sepay.vn/assets/images/banklogo/tpbank-icon.png' },
  { code: 'uob', shortName: 'UOB', name: 'Ngân hàng United Overseas Bank Việt Nam', logo: 'https://cdn.vietqr.io/img/UOB.png' },
  { code: 'vib', shortName: 'VIB', name: 'Ngân hàng Quốc tế Việt Nam', logo: 'https://my.sepay.vn/assets/images/banklogo/vib-icon.png' },
  { code: 'vietabank', shortName: 'VietABank', name: 'Ngân hàng Việt Á', logo: 'https://my.sepay.vn/assets/images/banklogo/vieta-icon.png' },
  { code: 'vietbank', shortName: 'VietBank', name: 'Ngân hàng Việt Nam Thương Tín', logo: 'https://my.sepay.vn/assets/images/banklogo/vietbank-icon.png' },
  { code: 'vietcapitalbank', shortName: 'VietCapitalBank', name: 'Ngân hàng Bản Việt', logo: 'https://cdn.vietqr.io/img/VCCB.png' },
  { code: 'vpbank', shortName: 'VPBank', name: 'Ngân hàng Việt Nam Thịnh Vượng', logo: 'https://my.sepay.vn/assets/images/banklogo/vpbank-icon.png' },
  { code: 'wooribank', shortName: 'Woori', name: 'Ngân hàng Woori Việt Nam', logo: 'https://my.sepay.vn/assets/images/banklogo/woori-icon.png' },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (shortName: string, fullName: string) => void;
}

const BankSelectionScreen: React.FC<Props> = ({ open, onClose, onSelect }) => {
  const [banks] = useState<Bank[]>(VIETNAM_BANKS);
  const [query, setQuery] = useState('');
  const [exiting, setExiting] = useState(false);
  const ANIM_MS = 280;

  useEffect(() => {
    if (open) {
      setQuery('');
    }
  }, [open]);

  if (!open) return null;

  const triggerClose = () => {
    setExiting(true);
    setTimeout(() => {
      setExiting(false);
      onClose();
    }, ANIM_MS);
  };

  const filteredBanks = banks.filter(
    (b) =>
      b.shortName.toLowerCase().includes(query.toLowerCase()) ||
      b.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <Box onClick={triggerClose} sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.4)', zIndex: 1500 }} />

      <Box
        sx={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          zIndex: 1501,
          bgcolor: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          animation: exiting ? 'slideOutToRight 0.28s ease' : 'slideInFromRight 0.28s ease',
          '@keyframes slideInFromRight': {
            from: { transform: 'translateX(100%)' },
            to: { transform: 'translateX(0)' },
          },
          '@keyframes slideOutToRight': {
            from: { transform: 'translateX(0)' },
            to: { transform: 'translateX(100%)' },
          },
        }}
      >
        <Box
          sx={{
            height: { xs: 160, sm: 120 },
            width: '100%',
            backgroundImage: `url(${headerDay})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        <Box sx={{ position: 'absolute', top: 36, left: 0, right: 0, zIndex: 1502, px: { xs: 2, sm: 3 } }}>
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
            <IconButton
              onClick={triggerClose}
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

            <Box sx={{ height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2 }}>
              <Typography
                sx={{
                  color: 'var(--Greyscale-900, #0D0D12)',
                  textAlign: 'center',
                  fontFamily: '"Bricolage Grotesque"',
                  fontSize: '18px',
                  fontWeight: 500,
                }}
              >
                Chọn ngân hàng
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            borderRadius: { xs: '16px 16px 0 0', sm: '16px' },
            px: 0.5,
            py: { xs: 2, sm: 6 },
            pb: { xs: `calc(32px + env(safe-area-inset-bottom, 0px))`, sm: 6 },
            position: { xs: 'fixed', sm: 'relative' },
            top: { xs: '80px', sm: 'auto' },
            bottom: { xs: 0, sm: 'auto' },
            left: '16px',
            right: '16px',
            maxWidth: 'calc(100% - 32px)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: { xs: 'auto', sm: 'visible' },
            bgcolor: 'transparent',
          }}
        >
          <Box sx={{ px: 0, width: '100%' }}>
            {/* Search bar */}
            <Box sx={{ mb: 2 }}>
              <SearchBox fullWidth placeholder="Tìm ngân hàng..." value={query} onChange={(e: any) => setQuery(e.target.value)} />
            </Box>

            {/* Bank list */}
            {filteredBanks.map((bank, idx) => (
              <Box key={bank.code}>
                <Box
                  onClick={() => {
                    onSelect(bank.shortName, bank.name);
                    onClose();
                  }}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    py: 1.5,
                    px: 1,
                    cursor: 'pointer',
                    gap: 1.5,
                    '&:hover': { bgcolor: '#F8F9FA' },
                  }}
                >
                  {/* Bank logo with dark text fallback */}
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: '#F1F3F5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      flexShrink: 0,
                    }}
                  >
                    <Box
                      component="img"
                      src={bank.logo}
                      alt={bank.shortName}
                      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                      sx={{
                        width: 28,
                        height: 28,
                        objectFit: 'contain',
                      }}
                    />
                    <Typography
                      sx={{
                        display: 'none',
                        fontSize: 13,
                        fontWeight: 600,
                        color: '#495057',
                        letterSpacing: '-0.5px',
                      }}
                    >
                      {bank.shortName.substring(0, 3).toUpperCase()}
                    </Typography>
                  </Box>

                  {/* Bank info */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: 16,
                        fontWeight: 500,
                        color: '#212529',
                        lineHeight: 1.3,
                      }}
                    >
                      {bank.shortName}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 14,
                        color: '#6C757D',
                        lineHeight: 1.3,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {bank.name}
                    </Typography>
                  </Box>
                </Box>
                {idx < filteredBanks.length - 1 && <Divider sx={{ borderColor: '#F1F3F5' }} />}
              </Box>
            ))}

            {filteredBanks.length === 0 && (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography sx={{ color: '#6C757D', fontSize: 14 }}>
                  Không tìm thấy ngân hàng
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default BankSelectionScreen;
