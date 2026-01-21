import { Box, Typography, IconButton } from '@mui/material';
import * as Iconsax from 'iconsax-react';
import tokens from '../styles/tokens';

interface AttachmentPickerProps {
  attachments: File[];
  onAdd: () => void;
  onRemove?: (index: number) => void;
  maxFiles?: number;
  title?: string;
  description?: string;
}

const AttachmentPicker: React.FC<AttachmentPickerProps> = ({
  attachments,
  onAdd,
  onRemove,
  maxFiles = 10,
  title = 'Đính kèm',
  description = `Hỗ trợ tối đa ${maxFiles} ảnh/file tài liệu.`,
}) => {
  const canAddMore = attachments.length < maxFiles;

  return (
    <Box
      sx={{
        border: `1px solid ${tokens.colors.border.default}`,
        borderRadius: tokens.radius.medium,
        p: '8px 16px',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0 }}>
        <Typography sx={{ fontSize: 14, fontWeight: 500, color: tokens.colors.text.primary }}>
          {title}
        </Typography>
        {canAddMore && (
          <IconButton size="small" onClick={onAdd}>
            <Iconsax.Edit2 size={18} color="rgba(0,0,0,0.54)" />
          </IconButton>
        )}
      </Box>
      
      <Typography sx={{ fontSize: 12, color: tokens.colors.text.tertiary, mb: 1.5 }}>
        {description}
      </Typography>

      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
        {/* Add attachment button */}
        {canAddMore && (
          <Box
            onClick={onAdd}
            sx={{
              width: 64,
              height: 64,
              border: `1px dashed ${tokens.colors.border.dashed}`,
              borderRadius: tokens.radius.small,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              '&:hover': { borderColor: tokens.colors.primary },
            }}
          >
            <Iconsax.GalleryAdd size={24} color="rgba(0,0,0,0.3)" />
          </Box>
        )}

        {/* Attachment thumbnails */}
        {attachments.map((file, index) => (
          <Box
            key={index}
            sx={{
              width: 64,
              height: 64,
              borderRadius: tokens.radius.small,
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <Box
              component="img"
              src={URL.createObjectURL(file)}
              alt={file.name}
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {onRemove && (
              <IconButton
                onClick={() => onRemove(index)}
                sx={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  width: 20,
                  height: 20,
                  bgcolor: tokens.colors.status.error,
                  color: 'white',
                  '&:hover': { bgcolor: '#B91C1C' },
                  p: 0,
                }}
              >
                <Iconsax.CloseCircle size={16} color="white" variant="Bold" />
              </IconButton>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default AttachmentPicker;
