import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  subtext?: string;
  icon?: React.ReactNode;
  accentColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType = 'positive',
  subtext,
  icon,
  accentColor = 'text-indigo-500',
}) => {
  return (
    <GlassCard className="relative overflow-hidden group">
      {/* Decorative gradient blur in background */}
      <div
        className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity bg-current ${accentColor}`}
      />

      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        {icon && (
          <div className={`p-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 ${accentColor}`}>
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3">
        <h3 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 font-sans">
          {value}
        </h3>
      </div>

      {(change || subtext) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {change && (
            <span
              className={`inline-flex items-center gap-0.5 font-semibold px-1.5 py-0.5 rounded-md ${
                changeType === 'positive'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : changeType === 'negative'
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                  : 'bg-slate-500/10 text-slate-600 dark:text-slate-400'
              }`}
            >
              {changeType === 'positive' && <ArrowUpRight className="w-3 h-3" />}
              {changeType === 'negative' && <ArrowDownRight className="w-3 h-3" />}
              {changeType === 'neutral' && <Minus className="w-3 h-3" />}
              {change}
            </span>
          )}
          {subtext && (
            <span className="text-slate-500 dark:text-slate-400 truncate">
              {subtext}
            </span>
          )}
        </div>
      )}
    </GlassCard>
  );
};
