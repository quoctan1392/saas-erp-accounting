import React from 'react';
import * as Icons from 'iconsax-react';

type IconVariant = 'Broken' | 'Curved' | 'Duotone' | 'Outline' | 'TwoTone' | string;

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  variant?: IconVariant;
  secondaryColor?: string; // optional pass-through if needed by some icons
  [key: string]: any;
}

const Icon: React.FC<IconProps> = ({ name, size = 20, color = 'currentColor', variant = 'Outline', ...rest }) => {
  const IconComponent = (Icons as any)[name];
  if (IconComponent) {
    const props: any = { size, color, variant, ...rest };
    return <IconComponent {...props} />;
  }

  // Fallback: try a common alternative or render `User` as a generic placeholder
  const Fallback = (Icons as any)['User'] || null;
  // Helpful warning for developers
  // eslint-disable-next-line no-console
  console.warn(`[Icon] icon '${name}' not found in iconsax-react exports. Using fallback icon.`);
  if (Fallback) {
    const props: any = { size, color, variant, ...rest };
    return <Fallback {...props} />;
  }

  return null;
};

export default Icon;
