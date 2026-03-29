'use client';
// ============================================================
// COMPONENTE: NeuroInput — Input neumórfico estilo industrial
// Desenvolvido por Eng. Leonardo Pedrini
// ============================================================

import React from 'react';

interface NeuroInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  unit?: string;
  hint?: string;
  error?: string;
}

export function NeuroInput({
  label,
  unit,
  hint,
  error,
  className = '',
  ...props
}: NeuroInputProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
        {label}
      </label>
      <div className="relative flex items-center">
        <input
          {...props}
          className={`
            w-full bg-bg-input shadow-neuro-inset border border-white/5 rounded-xl
            px-4 py-2.5 text-text-primary font-mono text-sm
            placeholder-text-muted
            focus:outline-none focus:ring-2 focus:ring-accent-blue/40 focus:border-accent-blue/30
            transition-all duration-200
            [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
            ${error ? 'border-red-500/50 ring-1 ring-red-500/30' : ''}
            ${unit ? 'pr-16' : ''}
          `}
        />
        {unit && (
          <span className="absolute right-3 text-xs text-text-muted font-mono pointer-events-none">
            {unit}
          </span>
        )}
      </div>
      {hint && !error && (
        <p className="text-xs text-text-muted">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}

interface NeuroSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  displayFormatter?: (v: number) => string;
}

export function NeuroSlider({
  label,
  value,
  min,
  max,
  step = 0.01,
  unit,
  onChange,
  displayFormatter,
}: NeuroSliderProps) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
          {label}
        </label>
        <span className="text-sm font-mono font-semibold text-text-accent">
          {displayFormatter ? displayFormatter(value) : value.toFixed(2)}
          {unit && <span className="text-text-muted ml-1 text-xs">{unit}</span>}
        </span>
      </div>
      <div className="relative h-2">
        {/* Track base */}
        <div className="absolute inset-0 rounded-full bg-bg-input shadow-neuro-inset" />
        {/* Fill */}
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-accent transition-all"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
        />
        {/* Thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gradient-accent shadow-neuro-sm border-2 border-accent-blue/50 pointer-events-none transition-all"
          style={{ left: `calc(${pct}% - 8px)` }}
        />
      </div>
    </div>
  );
}

interface NeuroSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
  hint?: string;
}

export function NeuroSelect({
  label,
  options,
  hint,
  className = '',
  ...props
}: NeuroSelectProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
        {label}
      </label>
      <select
        {...props}
        className="bg-bg-input shadow-neuro-inset border border-white/5 rounded-xl px-4 py-2.5 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/40 transition-all"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {hint && <p className="text-xs text-text-muted">{hint}</p>}
    </div>
  );
}

export function NeuroButton({
  children,
  variant = 'primary',
  loading = false,
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
}) {
  const variants = {
    primary: `
      bg-gradient-accent text-white shadow-neuro border border-accent-blue/30
      hover:shadow-glow-blue hover:brightness-110
      active:shadow-neuro-inset
    `,
    secondary: `
      bg-bg-card text-text-primary shadow-neuro border border-white/10
      hover:border-accent-blue/30
      active:shadow-neuro-inset
    `,
    ghost: 'text-text-secondary hover:text-text-primary',
  };

  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`
        inline-flex items-center justify-center gap-2
        px-6 py-3 rounded-xl font-semibold text-sm
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${className}
      `}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : null}
      {children}
    </button>
  );
}
