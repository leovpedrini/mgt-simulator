'use client';
// ============================================================
// DASHBOARD PAGE — Visão geral e comparação de combustíveis
// Desenvolvido por Eng. Leonardo Pedrini
// ============================================================

import React, { useState } from 'react';
import Link from 'next/link';
import { NeuroCard, MetricCard } from '@/components/ui/NeuroCard';
import { DEFAULT_INPUTS, FUELS } from '@/lib/logic/data';
import { runSimulation } from '@/lib/logic/simulator';
import { ArrowLeft, Play, BarChart3, Flame, Zap, DollarSign, Wind } from 'lucide-react';
import type { SimulationResults } from '@/lib/types';

export default function DashboardPage() {
  const [results, setResults] = useState<SimulationResults | null>(null);
  const [loading, setLoading] = useState(false);

  const runDefaultSimulation = () => {
    setLoading(true);
    // Executa no cliente diretamente (sem API) para demo
    setTimeout(() => {
      const res = runSimulation(DEFAULT_INPUTS);
      setResults(res);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-bg-base bg-grid-pattern pb-12">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-bg-base/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors">
            <ArrowLeft size={16} />
          </Link>
          <span className="text-text-muted/50">|</span>
          <span className="text-lg">📊</span>
          <h1 className="font-display font-bold text-text-primary text-sm sm:text-base">
            Dashboard — Comparativo de Combustíveis
          </h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-6">

        {/* Ações rápidas */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={runDefaultSimulation}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-accent text-white text-sm font-semibold shadow-neuro hover:shadow-glow-blue transition-all disabled:opacity-50"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Play size={14} />
            )}
            Simular Perfil Padrão (30 kW)
          </button>
          <Link
            href="/simulation"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-bg-card shadow-neuro text-text-primary text-sm font-semibold border border-white/10 hover:shadow-neuro-lg transition-all"
          >
            <BarChart3 size={14} />
            Simulação Personalizada
          </Link>
        </div>

        {/* Parâmetros do perfil padrão */}
        <NeuroCard className="p-5">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
            Perfil Padrão — Microturbina 30 kW
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs font-mono">
            {[
              { label: 'T₁', value: `${(DEFAULT_INPUTS.T1_K - 273.15).toFixed(1)}°C` },
              { label: 'P₁', value: `${DEFAULT_INPUTS.P1_kPa} kPa` },
              { label: 'RP_c', value: `${DEFAULT_INPUTS.RP_c}:1` },
              { label: 'TIT', value: `${(DEFAULT_INPUTS.T4_K - 273.15).toFixed(1)}°C` },
              { label: 'η_c', value: `${(DEFAULT_INPUTS.eta_c * 100).toFixed(0)}%` },
              { label: 'η_t', value: `${(DEFAULT_INPUTS.eta_t * 100).toFixed(0)}%` },
              { label: 'η_comb', value: `${(DEFAULT_INPUTS.eta_comb * 100).toFixed(0)}%` },
              { label: 'ε_regen', value: `${(DEFAULT_INPUTS.efetividade_regen * 100).toFixed(0)}%` },
              { label: 'η_mec', value: `${(DEFAULT_INPUTS.eta_mec * 100).toFixed(0)}%` },
              { label: 'η_gen', value: `${(DEFAULT_INPUTS.eta_gen * 100).toFixed(0)}%` },
              { label: 'RPM turb.', value: `${DEFAULT_INPUTS.rpm_turbina.toLocaleString()}` },
              { label: 'Potência', value: `${DEFAULT_INPUTS.potencia_alvo_kW} kW` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-bg-input shadow-neuro-inset rounded-xl p-3">
                <div className="text-text-muted mb-1">{label}</div>
                <div className="text-text-accent font-semibold">{value}</div>
              </div>
            ))}
          </div>
        </NeuroCard>

        {!results && !loading && (
          <div className="flex flex-col items-center py-16 gap-3 text-center">
            <div className="text-5xl opacity-30">📈</div>
            <p className="text-text-muted text-sm">
              Clique em <strong className="text-text-accent">Simular Perfil Padrão</strong> para ver o comparativo.
            </p>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 border-2 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin" />
            <span className="text-text-muted text-sm">Calculando...</span>
          </div>
        )}

        {results && (
          <>
            {/* COMPARATIVO */}
            <div>
              <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
                Comparativo dos Combustíveis
              </h2>

              {/* Tabela comparativa */}
              <NeuroCard className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-4 text-text-muted text-xs uppercase tracking-wider font-medium">
                        Parâmetro
                      </th>
                      {[
                        { id: 'biogas', color: '#22c55e', icon: '🌱' },
                        { id: 'biomethane', color: '#3b82f6', icon: '💧' },
                        { id: 'hydrogen', color: '#06b6d4', icon: '⚡' },
                      ].map(({ id, color, icon }) => (
                        <th key={id} className="text-center p-4 text-xs uppercase tracking-wider font-semibold" style={{ color }}>
                          {icon} {FUELS[id].name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="font-mono text-xs">
                    {[
                      {
                        label: '⚡ Potência [kW]',
                        fmt: (r: typeof results.fuels.biogas) => r?.potencia_final_kW.toFixed(2) ?? '—',
                      },
                      {
                        label: '📈 Eficiência [%]',
                        fmt: (r: typeof results.fuels.biogas) => r?.cycle.eficiencia.toFixed(2) ?? '—',
                      },
                      {
                        label: '🔄 BWR [%]',
                        fmt: (r: typeof results.fuels.biogas) => r?.cycle.bwr.toFixed(2) ?? '—',
                      },
                      {
                        label: '💨 Vazão Ar [kg/s]',
                        fmt: (r: typeof results.fuels.biogas) => r?.cycle.m_ar_kgs.toFixed(4) ?? '—',
                      },
                      {
                        label: '🔥 Consumo [m³/h]',
                        fmt: (r: typeof results.fuels.biogas) => r?.consumo_m3h.toFixed(3) ?? '—',
                      },
                      {
                        label: '💰 Custo [R$/h]',
                        fmt: (r: typeof results.fuels.biogas) => r ? `R$ ${r.custo_hora_BRL.toFixed(2)}` : '—',
                      },
                      {
                        label: '📅 Custo Mensal',
                        fmt: (r: typeof results.fuels.biogas) => r ? `R$ ${r.custo_mes_BRL.toFixed(0)}` : '—',
                      },
                      {
                        label: '🏭 Custo/MWh',
                        fmt: (r: typeof results.fuels.biogas) => r ? `R$ ${r.custo_MWh_BRL.toFixed(2)}` : '—',
                      },
                      {
                        label: '🌿 CO₂ [kg/h]',
                        fmt: (r: typeof results.fuels.biogas) => r?.emissao_co2_kg_h.toFixed(3) ?? '—',
                      },
                    ].map(({ label, fmt }) => (
                      <tr key={label} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4 text-text-secondary font-sans text-xs">{label}</td>
                        {(['biogas', 'biomethane', 'hydrogen'] as const).map((id) => (
                          <td key={id} className="p-4 text-center text-text-primary">
                            {fmt(results.fuels[id])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </NeuroCard>
            </div>

            {/* Cards de destaque por combustível */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(['biogas', 'biomethane', 'hydrogen'] as const).map((fuelId) => {
                const fr = results.fuels[fuelId];
                const fuel = FUELS[fuelId];
                if (!fr) return null;
                return (
                  <NeuroCard
                    key={fuelId}
                    className="p-5"
                    style={{ borderColor: `${fuel.color}20` } as React.CSSProperties}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: fuel.color }}
                      />
                      <h3 className="font-semibold text-text-primary">{fuel.name}</h3>
                      <span className="text-xs text-text-muted ml-auto">{fuel.composition}</span>
                    </div>
                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex justify-between">
                        <span className="text-text-muted">PCI</span>
                        <span className="text-text-primary">{fuel.pci.toLocaleString()} kJ/kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Eficiência</span>
                        <span style={{ color: fuel.color }} className="font-bold">
                          {fr.cycle.eficiencia.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Custo/MWh</span>
                        <span className="text-text-primary">R$ {fr.custo_MWh_BRL.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Consumo</span>
                        <span className="text-text-primary">{fr.consumo_m3h.toFixed(3)} m³/h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">CO₂</span>
                        <span className={fuel.id === 'hydrogen' ? 'text-accent-green' : 'text-text-primary'}>
                          {fuel.id === 'hydrogen' ? '🟢 Zero' : `${fr.emissao_co2_kg_h.toFixed(3)} kg/h`}
                        </span>
                      </div>
                    </div>
                  </NeuroCard>
                );
              })}
            </div>

            {/* Estados do ciclo */}
            <NeuroCard className="p-5">
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
                <Flame size={14} className="text-accent-amber" />
                Estados do Ciclo — Biogás (referência)
              </h3>
              {results.fuels.biogas && (
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs font-mono">
                  {[
                    results.fuels.biogas.cycle.point1,
                    results.fuels.biogas.cycle.point2,
                    results.fuels.biogas.cycle.point3,
                    results.fuels.biogas.cycle.point4,
                    results.fuels.biogas.cycle.point5,
                    results.fuels.biogas.cycle.point6,
                  ].map((point, i) => (
                    <div key={i} className="bg-bg-input shadow-neuro-inset rounded-xl p-3 space-y-1">
                      <div className="text-text-accent font-bold">Ponto {i + 1}</div>
                      <div className="text-amber-300">{(point.T_K - 273.15).toFixed(1)}°C</div>
                      <div className="text-blue-300">{point.P_kPa.toFixed(1)} kPa</div>
                      <div className="text-green-300/80">{point.h_kJkg.toFixed(1)} kJ/kg</div>
                    </div>
                  ))}
                </div>
              )}
            </NeuroCard>
          </>
        )}
      </div>
    </div>
  );
}
