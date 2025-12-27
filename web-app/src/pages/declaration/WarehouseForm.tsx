// @ts-nocheck
import { Box, Typography, Switch } from '@mui/material';
import RoundedTextField from '../../components/RoundedTextField';

type Props = {
  code: string;
  setCode: (v: string) => void;
  name: string;
  setName: (v: string) => void;
  address: string;
  setAddress: (v: string) => void;
  isActive: boolean;
  setIsActive: (v: boolean) => void;
};

const WarehouseForm = ({ code, setCode, name, setName, address, setAddress, isActive, setIsActive }: Props) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <RoundedTextField
        fullWidth
        required
        label="Mã kho"
        placeholder="Nhập mã kho"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />

      <RoundedTextField
        fullWidth
        required
        label="Tên kho"
        placeholder="Nhập tên kho"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <RoundedTextField
        fullWidth
        label="Địa chỉ kho"
        placeholder="Nhập địa chỉ kho"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        inputProps={{ maxLength: 255 }}
      />

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0 }}>
        <Typography sx={{ fontSize: '16px', fontWeight: 500, color: '#212529' }}>Đang sử dụng</Typography>
        <Switch
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          sx={{
            '& .MuiSwitch-switchBase.Mui-checked': {
              color: '#FB7E00',
            },
            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
              backgroundColor: '#FB7E00',
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default WarehouseForm;
