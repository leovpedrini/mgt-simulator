'use client';
// ============================================================
// COMPONENTE: NeuroCard — Card com efeito neumórfico 3D
// Design: Azul escuro industrial + relevo realista
// Desenvolvido por Eng. Leonardo Pedrini
// ============================================================

import React from 'react';

interface NeuroCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'inset' | 'glow';
  glowColor?: 'blue' | 'cyan' | 'green' | 'amber';
  onClick?: () => void;
  as?: keyof JSX.IntrinsicElements;
  style?: React.CSSProperties;
}

const glowStyles = {
  blue: 'shadow-glow-blue border-blue-500/20',
  cyan: 'shadow-glow-cyan border-cyan-500/20',
  green: 'shadow-glow-green border-green-500/20',
  amber: 'border-amber-500/20',
};

export function NeuroCard({
  children,
  className = '',
  variant = 'default',
  glowColor,
  onClick,
  as: Tag = 'div',
  style,
}: NeuroCardProps) {
  const base =
    'rounded-2xl border border-white/5 transition-all duration-300';

  const variants = {
    default: 'bg-bg-card shadow-neuro',
    elevated: 'bg-bg-elevated shadow-neuro-lg',
    inset: 'bg-bg-input shadow-neuro-inset',
    glow: `bg-bg-card shadow-neuro ${glowColor ? glowStyles[glowColor] : ''}`,
  };

  const interactive = onClick ? 'cursor-pointer hover:shadow-neuro-lg active:shadow-neuro-inset' : '';

  return (
    <Tag
      className={`${base} ${variants[variant]} ${interactive} ${className}`}
      onClick={onClick}
      style={style}
    >
      {children}
    </Tag>
  );
}

// Card de resultado com valor destacado
interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  status?: 'ok' | 'warning' | 'error' | 'neutral';
  className?: string;
  subtext?: string;
}

const statusColors = {
  ok: 'text-accent-green',
  warning: 'text-accent-amber',
  error: 'text-accent-red',
  neutral: 'text-text-accent',
};

const statusBg = {
  ok: 'bg-green-500/10 border-green-500/20',
  warning: 'bg-amber-500/10 border-amber-500/20',
  error: 'bg-red-500/10 border-red-500/20',
  neutral: 'bg-blue-500/10 border-blue-500/20',
};

export function MetricCard({
  label,
  value,
  unit,
  icon,
  status = 'neutral',
  className = '',
  subtext,
}: MetricCardProps) {
  return (
    <NeuroCard
      className={`p-5 ${statusBg[status]} border ${className}`}
      variant="default"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
          {label}
        </span>
        {icon && (
          <span className={`${statusColors[status]} opacity-80`}>
            {icon}
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className={`text-2xl font-bold font-mono ${statusColors[status]}`}>
          {typeof value === 'number' ? value.toFixed(2) : value}
        </span>
        {unit && (
          <span className="text-sm text-text-muted font-mono">{unit}</span>
        )}
      </div>
      {subtext && (
        <p className="mt-1.5 text-xs text-text-muted">{subtext}</p>
      )}
    </NeuroCard>
  );
}

// Badge de status
interface StatusBadgeProps {
  status: 'OK' | 'WARNING' | 'EXCEEDED' | 'APROVADO' | 'REPROVADO';
  label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const styles = {
    OK: 'bg-green-500/20 text-green-400 border-green-500/30',
    APROVADO: 'bg-green-500/20 text-green-400 border-green-500/30',
    WARNING: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    EXCEEDED: 'bg-red-500/20 text-red-400 border-red-500/30',
    REPROVADO: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label ?? status}
    </span>
  );
}
