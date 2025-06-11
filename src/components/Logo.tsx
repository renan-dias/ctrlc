import React from 'react';
import Image from 'next/image';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Logo({ size = 'md', className = '' }: LogoProps) {
  const sizes = {
    sm: { width: 24, height: 24 },
    md: { width: 32, height: 32 },
    lg: { width: 48, height: 48 }
  };

  return (
    <Image
      src="/logo.png"
      alt="ctrlC"
      width={sizes[size].width}
      height={sizes[size].height}
      className={`${className}`}
    />
  );
}
