'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from 'next-themes';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className, size = 'md' }: LogoProps) {
  const { resolvedTheme } = useTheme();
  const logoSrc = resolvedTheme === 'dark' ? '/images/alt-logo.png' : '/images/logo.png';
  
  const sizes = {
    sm: { width: 100, height: 40 },
    md: { width: 150, height: 60 },
    lg: { width: 200, height: 80 },
  };

  const { width, height } = sizes[size];

  return (
    <Link href="/" className={className}>
      <Image
        src={logoSrc}
        alt="ReelRum Logo"
        width={width}
        height={height}
        priority
        className="object-contain"
      />
    </Link>
  );
}
