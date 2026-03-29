'use client';
import React from 'react';
import { NeuroCard, MetricCard, StatusBadge } from '@/components/ui/NeuroCard';
import type { TransmissionResults } from '@/lib/logic/transmission';

export function TransmissionPanel({ transmission }: { transmission: TransmissionResults }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <MetricCard label="Razão de Transmissão" value={`${transmission.i_total.toFixed(1)}:1`} unit="" />
        <MetricCard label="Número de Estágios" value={transmission.n_estagios} unit="estágio(s)" />
        <NeuroCard className="p-4">
          <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Acoplamento</p>
          <p className="text-xs text-text-primary">{transmission.acoplamento}</p>
        </NeuroCard>
      </div>
      <NeuroCard className="p-4">
        <p className="text-xs text-text-muted mb-1">Recomendação Comercial:</p>
        <p className="text-sm font-semibold text-text-accent">{transmission.recomendacao}</p>
      </NeuroCard>
      {transmission.estagios.map((stage) => (
        <NeuroCard key={stage.estagio} className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-text-primary">Estágio {stage.estagio} — i = {stage.i_estagio.toFixed(2)}:1</h4>
            <StatusBadge status={stage.status} />
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 text-xs font-mono">
            {[
              ['Z₁/Z₂', `${stage.Z1}/${stage.Z2}`],
              ['Módulo', `${stage.modulo_mm} mm`],
              ['d₁/d₂', `${stage.d1_mm.toFixed(0)}/${stage.d2_mm.toFixed(0)} mm`],
              ['Largura', `${stage.b_mm.toFixed(0)} mm`],
              ['Dist. C', `${stage.distancia_centro_mm.toFixed(0)} mm`],
              ['Wt', `${stage.Wt_N.toFixed(0)} N`],
              ['σ_flex', `${stage.sigma_flex_MPa.toFixed(1)} MPa`],
              ['FS_flex', stage.FS_flex.toFixed(2)],
            ].map(([label, value]) => (
              <div key={label} className="bg-bg-input rounded-lg p-2">
                <div className="text-text-muted mb-0.5">{label}</div>
                <div className="text-text-primary font-semibold">{value}</div>
              </div>
            ))}
          </div>
        </NeuroCard>
      ))}
    </div>
  );
}
