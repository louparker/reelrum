import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className, size = 'md' }: LogoProps) {
  const sizes = {
    sm: { width: 100, height: 40 },
    md: { width: 150, height: 60 },
    lg: { width: 200, height: 80 },
  };

  const { width, height } = sizes[size];

  return (
    <Link href="/" className={className}>
      <Image
        src="/images/logo.png"
        alt="ReelRum Logo"
        width={width}
        height={height}
        priority
        className="object-contain"
      />
    </Link>
  );
}
