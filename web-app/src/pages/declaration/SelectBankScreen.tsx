import React, { useState } from 'react';
import { Box, Container, InputAdornment, IconButton, List, ListItemButton, ListItemAvatar, Avatar, ListItemText, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import * as Iconsax from 'iconsax-react';

const Icon = ({ name, size = 20, color = '#6C757D' }: any) => {
  const Comp = (Iconsax as any)[name];
  if (!Comp) return null;
  return <Comp size={size} color={color} />;
};

const DEMO_BANKS = [
  { code: 'VCB', short: 'VCB', name: 'Ngân hàng TMCP Ngoại thương Việt Nam', logo: '' },
  { code: 'BIDV', short: 'BIDV', name: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam', logo: '' },
  { code: 'TPB', short: 'TPBank', name: 'Ngân hàng Tiên Phong', logo: '' },
  { code: 'ACB', short: 'ACB', name: 'Ngân hàng TMCP Á Châu', logo: '' },
  { code: 'VCM', short: 'Vietcombank', name: 'Ngân hàng TMCP Ngoại thương Việt Nam (VCB)', logo: '' },
];

const SelectBankScreen: React.FC = () => {
  const navigate = useNavigate();
  const [q, setQ] = useState('');

  const filtered = DEMO_BANKS.filter(b => (b.short + ' ' + b.name + ' ' + b.code).toLowerCase().includes(q.toLowerCase()));

  const handleSelect = (bank: any) => {
    // Navigate back to customer form and pass selected bank in location.state
    navigate('/declaration/customers/new', { state: { selectedBank: bank } });
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fff' }}>
      <Box sx={{ position: 'sticky', top: 0, zIndex: 20, px: 2, py: 1, bgcolor: '#fff', borderBottom: '1px solid #F1F3F5' }}>
        <Typography sx={{ fontSize: 18, fontWeight: 600 }}>Chọn ngân hàng</Typography>
        <TextField
          fullWidth
          size="small"
          placeholder="Tìm kiếm ngân hàng"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          sx={{ mt: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Icon name="SearchNormal" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Container maxWidth="sm" sx={{ py: 2 }}>
        <List>
          {filtered.map((bank) => (
            <ListItemButton key={bank.code} onClick={() => handleSelect(bank)}>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: '#F1F3F5', color: '#212529' }}>{bank.short.slice(0, 2)}</Avatar>
              </ListItemAvatar>
              <ListItemText primary={bank.short} secondary={bank.name} />
            </ListItemButton>
          ))}
        </List>
      </Container>
    </Box>
  );
};

export default SelectBankScreen;
