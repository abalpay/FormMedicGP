import Image from 'next/image';
import { getBrandAsset, type BrandLogoVariant } from '@/lib/brand-assets';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  variant?: BrandLogoVariant;
  className?: string;
  alt?: string;
  priority?: boolean;
  sizes?: string;
}

export function BrandLogo({
  variant = 'horizontal',
  className,
  alt,
  priority = false,
  sizes,
}: BrandLogoProps) {
  const asset = getBrandAsset(variant);

  return (
    <Image
      src={asset.src}
      alt={alt ?? asset.alt}
      width={asset.width}
      height={asset.height}
      priority={priority}
      sizes={sizes}
      className={cn('h-auto w-auto select-none', className)}
    />
  );
}
