import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number | null;
  unit?: string;
  delta?: number | null;
  deltaLabel?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: 'default' | 'green' | 'yellow' | 'red' | 'blue';
}

export function KPICard({
  title,
  value,
  unit,
  delta,
  deltaLabel,
  subtitle,
  icon,
  color = 'default',
}: KPICardProps) {
  const colorClasses = {
    default: '',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
    blue: 'text-blue-600',
  };

  const getDeltaIcon = () => {
    if (delta === null || delta === undefined || delta === 0) {
      return <Minus className="h-4 w-4" />;
    }
    return delta > 0 ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );
  };

  const getDeltaColor = () => {
    if (delta === null || delta === undefined || delta === 0) {
      return 'text-muted-foreground';
    }
    return delta > 0 ? 'text-red-600' : 'text-green-600';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold", colorClasses[color])}>
          {value !== null && value !== undefined ? (
            <>
              {value}
              {unit && <span className="text-sm font-normal ml-1">{unit}</span>}
            </>
          ) : (
            <span className="text-muted-foreground">--</span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
        {delta !== null && delta !== undefined && (
          <div className={cn("flex items-center gap-1 mt-2", getDeltaColor())}>
            {getDeltaIcon()}
            <span className="text-sm">
              {Math.abs(delta)} {unit}
            </span>
            {deltaLabel && (
              <span className="text-xs text-muted-foreground ml-1">
                {deltaLabel}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function DeltaBadge({ 
  value, 
  unit = '', 
  label = 'vs previous' 
}: { 
  value: number | null; 
  unit?: string; 
  label?: string;
}) {
  if (value === null || value === undefined) return null;

  const isPositive = value > 0;
  const isZero = value === 0;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium",
        isZero && "bg-gray-100 text-gray-700",
        isPositive && "bg-red-100 text-red-700",
        !isPositive && !isZero && "bg-green-100 text-green-700"
      )}
    >
      {isZero ? (
        <Minus className="h-3 w-3" />
      ) : isPositive ? (
        <ArrowUp className="h-3 w-3" />
      ) : (
        <ArrowDown className="h-3 w-3" />
      )}
      {Math.abs(value)}{unit} {label}
    </span>
  );
}