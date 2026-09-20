import React from 'react';
import Image from 'next/image';
import { Camera, Building2 } from 'lucide-react';
import { Text } from '@/components/ui/Text';

interface DashboardHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badges?: React.ReactNode;
  actions?: React.ReactNode;
  logoUrl?: string | null;
  onLogoUpload?: () => void;
}

export function DashboardHeader({
  title,
  subtitle,
  badges,
  actions,
  logoUrl,
  onLogoUpload,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 mb-8 border-b border-slate-200">
      <div className="flex items-start gap-4">
        {/* Business Profile Logo / Photo Badge */}
        <div className="relative group shrink-0">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-900 border-2 border-white shadow-lg overflow-hidden flex items-center justify-center relative">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt="Business logo"
                fill
                className="object-cover"
                sizes="80px"
              />
            ) : (
              <Building2 className="w-8 h-8 text-sky-400" />
            )}
          </div>
          {onLogoUpload && (
            <button
              type="button"
              onClick={onLogoUpload}
              className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-sky-600 text-white flex items-center justify-center shadow-md hover:bg-sky-500 hover:scale-110 transition-all border border-white"
              title="Upload / Edit Business Logo"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="space-y-1.5 min-w-0">
          <Text as="h1" variant="h1" color="dark" className="text-2xl sm:text-3xl font-extrabold tracking-tight truncate">
            {title}
          </Text>
          {subtitle && (
            <Text variant="caption" color="muted" className="text-xs sm:text-sm">
              {subtitle}
            </Text>
          )}
          {badges && <div className="flex flex-wrap items-center gap-3 pt-1">{badges}</div>}
        </div>
      </div>

      {actions && <div className="flex flex-wrap items-center gap-3 shrink-0">{actions}</div>}
    </div>
  );
}
