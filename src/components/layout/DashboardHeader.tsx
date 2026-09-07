import React from 'react';
import { Text } from '@/components/ui/Text';

interface DashboardHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badges?: React.ReactNode;
  actions?: React.ReactNode;
}

export function DashboardHeader({ title, subtitle, badges, actions }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 mb-8 border-b border-slate-200">
      <div className="space-y-2">
        <Text as="h1" variant="h1" color="dark" className="text-2xl sm:text-3xl">
          {title}
        </Text>
        {subtitle && (
          <Text variant="caption" color="muted" className="text-xs sm:text-sm">
            {subtitle}
          </Text>
        )}
        {badges && <div className="flex flex-wrap items-center gap-3 pt-1">{badges}</div>}
      </div>

      {actions && <div className="flex flex-wrap items-center gap-3 shrink-0">{actions}</div>}
    </div>
  );
}
