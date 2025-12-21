import React, { useState } from 'react';
import { Box, Skeleton } from '@mui/material';

interface Props {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
}

const ImageWithSkeleton: React.FC<Props> = ({ src, alt, width = 64, height = 64, style }) => {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  return (
    <Box sx={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {!loaded && !errored && <Skeleton variant="rectangular" width={width} height={height} />}

      {!errored && (
        <Box
          component="img"
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          sx={{
            width,
            height,
            borderRadius: 1,
            objectFit: 'contain',
            display: loaded ? 'block' : 'none',
            transition: 'opacity 200ms ease-in',
            ...(style as any),
          }}
        />
      )}

      {errored && <Skeleton variant="rectangular" width={width} height={height} />}
    </Box>
  );
};

export default ImageWithSkeleton;
