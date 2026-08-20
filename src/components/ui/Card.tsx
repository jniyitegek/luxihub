import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Star, MapPin, ArrowRight } from 'lucide-react';
import { Text } from './Text';
import { Badge } from './Badge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'vertical' | 'horizontal' | 'compact' | 'glass' | 'hero';
  title: string;
  subtitle?: string;
  image?: string;
  price?: string | number;
  rating?: number;
  reviewCount?: number;
  location?: string;
  badgeTag?: React.ReactNode;
  href?: string;
  actionText?: string;
  onAction?: () => void;
  children?: React.ReactNode;
}

export function Card({
  variant = 'vertical',
  title,
  subtitle,
  image,
  price,
  rating,
  reviewCount,
  location,
  badgeTag,
  href,
  actionText = 'Explore',
  onAction,
  className,
  children,
  ...props
}: CardProps) {
  
  // Base Card Wrapper
  const cardContent = (
    <div
      className={cn(
        'rounded-[28px] overflow-hidden bg-white border border-slate-200/90 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-2xl transition-all duration-300 group',
        variant === 'vertical' && 'flex flex-col hover:-translate-y-1.5',
        variant === 'horizontal' && 'flex flex-row items-center p-3 gap-4 hover:-translate-y-1',
        variant === 'glass' && 'bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl',
        variant === 'hero' && 'rounded-[36px] bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white p-8',
        className
      )}
      {...props}
    >
      {/* 1. Vertical Card Variant (Standard Card from UI Design Reference) */}
      {variant === 'vertical' && (
        <>
          {image && (
            <div className="relative h-60 w-full overflow-hidden bg-slate-100 p-3">
              <div className="relative w-full h-full rounded-2xl overflow-hidden">
                <Image
                  src={image}
                  alt={title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                
                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                  {badgeTag || <span />}
                  {rating && (
                    <Badge variant="rating">
                      {rating.toFixed(1)}
                    </Badge>
                  )}
                </div>

                {/* Bottom Left Location */}
                {location && (
                  <div className="absolute bottom-3 left-3 pointer-events-none">
                    <Badge variant="location">
                      {location}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Card Body */}
          <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
            <div className="space-y-1">
              <Text variant="h3" color="dark" className="group-hover:text-sky-600 transition-colors line-clamp-1">
                {title}
              </Text>
              {subtitle && (
                <Text variant="caption" color="muted" className="line-clamp-2">
                  {subtitle}
                </Text>
              )}
            </div>

            {children}

            {/* Bottom Price & Action */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              {price && (
                <div>
                  <Text variant="caption" color="muted" weight="bold" className="uppercase">
                    Starting
                  </Text>
                  <Text variant="price" color="dark">
                    {price}
                  </Text>
                </div>
              )}

              <div className="px-4 py-2 rounded-full bg-sky-50 group-hover:bg-sky-600 text-sky-900 group-hover:text-white font-extrabold text-xs transition-all flex items-center gap-1.5 shadow-sm">
                <span>{actionText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </>
      )}

      {/* 2. Horizontal Card Variant (Matching "Near of you" list item in design) */}
      {variant === 'horizontal' && (
        <>
          {image && (
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 bg-slate-100">
              <Image
                src={image}
                alt={title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          )}

          <div className="flex-1 flex flex-col justify-between py-1 pr-2 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <Text variant="h4" color="dark" className="group-hover:text-sky-600 transition-colors line-clamp-1">
                {title}
              </Text>
              {price && (
                <Text variant="price" color="sky" className="text-sm shrink-0">
                  {price}
                </Text>
              )}
            </div>

            {subtitle && (
              <Text variant="caption" color="muted" className="line-clamp-1">
                {subtitle}
              </Text>
            )}

            <div className="flex items-center gap-3 pt-1">
              {rating && (
                <div className="flex items-center gap-1 text-xs font-bold text-sky-600">
                  <Star className="w-3.5 h-3.5 fill-sky-500 text-sky-500" />
                  <span>{rating.toFixed(1)}</span>
                </div>
              )}
              {location && (
                <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                  <MapPin className="w-3 h-3 text-sky-500" />
                  <span>{location}</span>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Generic Custom Children */}
      {variant !== 'vertical' && variant !== 'horizontal' && children}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block w-full">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
