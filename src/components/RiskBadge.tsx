import { cn } from '@/lib/utils';

interface RiskBadgeProps {
  level: 'low' | 'medium' | 'high' | 'critical' | string;
  size?: 'sm' | 'md' | 'lg';
  showPulse?: boolean;
}

export function RiskBadge({ level, size = 'md', showPulse = false }: RiskBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5 font-semibold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium uppercase tracking-wide',
        sizeClasses[size],
        level === 'low' && 'risk-badge-low',
        level === 'medium' && 'risk-badge-medium',
        level === 'high' && 'risk-badge-high',
        level === 'critical' && 'risk-badge-critical',
      )}
    >
      {(level === 'high' || level === 'critical') && showPulse && (
        <span className="relative flex h-2 w-2">
          <span className={cn(
            "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
            level === 'high' && 'bg-risk-high',
            level === 'critical' && 'bg-risk-critical',
          )} />
          <span className={cn(
            "relative inline-flex rounded-full h-2 w-2",
            level === 'high' && 'bg-risk-high',
            level === 'critical' && 'bg-risk-critical',
          )} />
        </span>
      )}
      {level}
    </span>
  );
}
