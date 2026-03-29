'use client';
// ============================================================
// COMPONENTE: ResultsPanel — Painel de Resultados por Combustível
// Desenvolvido por Eng. Leonardo Pedrini
// ============================================================

import React, { useState } from 'react';
import { NeuroCard, MetricCard, StatusBadge } from '@/components/ui/NeuroCard';
import { TsDiagram } from '@/components/charts/TsDiagram';
import { FUELS } from '@/lib/logic/data';
import type { SimulationResults, FuelResults, FuelId } from '@/lib/types';
import {
  Zap, Thermometer, Wind, DollarSign,
  Gauge, FlaskConical, Wrench, ChevronDown, ChevronUp
} from 'lucide-react';

interface ResultsPanelProps {
  results: SimulationResults;
}

const FUEL_TABS: { id: FuelId; label: string; icon: string }[] = [
  { id: 'biogas', label: 'Biogás', icon: '🌱' },
  { id: 'biomethane', label: 'Biometano', icon: '💧' },
  { id: 'hydrogen', label: 'Hidrogênio', icon: '⚡' },
];

export function ResultsPanel({ results }: ResultsPanelProps) {
  const [activeTab, setActiveTab] = useState<FuelId>('biogas');
  const fuelResult = results.fuels[activeTab];

  if (!fuelResult) return null;

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Alertas e avisos */}
      {results.validation?.warnings && results.validation.warnings.length > 0 && (
        <NeuroCard className="p-4 bg-amber-500/5 border border-amber-500/20">
          <div className="flex gap-2">
            <span className="text-amber-400 mt-0.5">⚠️</span>
            <div className="space-y-1">
              {results.validation.warnings.map((w, i) => (
                <p key={i} className="text-xs text-amber-300">{w}</p>
              ))}
            </div>
          </div>
        </NeuroCard>
      )}

      {/* Abas de Combustível */}
      <NeuroCard className="p-1">
        <div className="flex gap-1">
          {FUEL_TABS.map(({ id, label, icon }) => {
            const fuel = FUELS[id];
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`
                  flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl
                  text-sm font-semibold transition-all duration-200
                  ${isActive
                    ? 'bg-bg-elevated shadow-neuro text-text-primary'
                    : 'text-text-secondary hover:text-text-primary'
                  }
                `}
              >
                <span>{icon}</span>
                <span className="hidden sm:inline">{label}</span>
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: fuel.color }}
                />
              </button>
            );
          })}
        </div>
      </NeuroCard>

      {/* Conteúdo da aba ativa */}
      <FuelResultsView result={fuelResult} />
    </div>
  );
}

function FuelResultsView({ result }: { result: FuelResults }) {
  const [showCycle, setShowCycle] = useState(false);
  const [showMech, setShowMech] = useState(false);

  const { cycle, chamber, mechanical } = result;

  return (
    <div className="space-y-4">

      {/* MÉTRICAS PRINCIPAIS */}
      <div>
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
          <Zap size={12} /> Performance do Ciclo
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <MetricCard
            label="Potência Líquida"
            value={result.potencia_final_kW.toFixed(2)}
            unit="kW"
            status={result.potencia_final_kW > 0 ? 'ok' : 'error'}
            icon={<Zap size={14} />}
          />
          <MetricCard
            label="Eficiência Térmica"
            value={`${cycle.eficiencia.toFixed(2)}`}
            unit="%"
            status={cycle.eficiencia > 30 ? 'ok' : cycle.eficiencia > 20 ? 'warning' : 'error'}
            icon={<Gauge size={14} />}
          />
          <MetricCard
            label="Back Work Ratio"
            value={`${cycle.bwr.toFixed(2)}`}
            unit="%"
            status={cycle.bwr < 50 ? 'ok' : 'warning'}
            subtext="Razão de retroalimentação"
          />
          <MetricCard
            label="Trabalho Líq. Esp."
            value={cycle.w_liq_esp.toFixed(2)}
            unit="kJ/kg"
            icon={<Wind size={14} />}
          />
          <MetricCard
            label="Calor Adicionado"
            value={cycle.q_in.toFixed(2)}
            unit="kJ/kg"
            icon={<Thermometer size={14} />}
          />
          <MetricCard
            label="Regeneração"
            value={cycle.q_regen.toFixed(2)}
            unit="kJ/kg"
            subtext={`${((cycle.q_regen / cycle.q_in) * 100).toFixed(1)}% do calor total`}
          />
        </div>
      </div>

      {/* VAZÕES E CONSUMO */}
      <div>
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
          <FlaskConical size={12} /> Consumo — {result.fuel.name}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <MetricCard
            label="Vazão de Ar"
            value={cycle.m_ar_kgs.toFixed(4)}
            unit="kg/s"
          />
          <MetricCard
            label="Consumo Combust."
            value={result.consumo_kgh.toFixed(3)}
            unit="kg/h"
          />
          <MetricCard
            label="Consumo Volumét."
            value={result.consumo_m3h.toFixed(3)}
            unit="m³/h"
          />
        </div>
      </div>

      {/* FINANCEIRO */}
      <div>
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
          <DollarSign size={12} /> Custo Operacional
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <MetricCard
            label="Custo / Hora"
            value={`R$ ${result.custo_hora_BRL.toFixed(2)}`}
            unit=""
            status="neutral"
            icon={<DollarSign size={14} />}
          />
          <MetricCard
            label="Custo Mensal"
            value={`R$ ${result.custo_mes_BRL.toFixed(0)}`}
            unit=""
            subtext="30 dias × 24 h"
          />
          <MetricCard
            label="Custo / MWh"
            value={`R$ ${result.custo_MWh_BRL.toFixed(2)}`}
            unit="/MWh"
          />
          {result.emissao_co2_kg_h > 0 && (
            <MetricCard
              label="Emissão CO₂"
              value={result.emissao_co2_kg_h.toFixed(3)}
              unit="kg/h"
              status={result.emissao_co2_kg_h < 1 ? 'ok' : 'warning'}
            />
          )}
        </div>
      </div>

      {/* CÂMARA DE COMBUSTÃO */}
      <div>
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
          <Thermometer size={12} /> Câmara de Combustão
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <MetricCard
            label="FAR Real"
            value={chamber.FAR.toFixed(5)}
            unit=""
            subtext={`φ = ${chamber.phi.toFixed(3)}`}
          />
          <MetricCard
            label="Temperatura da Chama"
            value={(chamber.T_chama_K - 273.15).toFixed(0)}
            unit="°C"
            status={chamber.T4_status === 'OK' ? 'ok' : chamber.T4_status === 'WARNING' ? 'warning' : 'error'}
          />
          <div className="flex flex-col gap-2">
            <MetricCard
              label="Diâmetro"
              value={chamber.d_camara_mm.toFixed(1)}
              unit="mm"
              className="flex-1"
            />
            <div className="flex justify-center">
              <StatusBadge
                status={chamber.T4_status === 'OK' ? 'OK' : chamber.T4_status === 'WARNING' ? 'WARNING' : 'EXCEEDED'}
                label={
                  chamber.T4_status === 'OK' ? 'T4 OK' :
                  chamber.T4_status === 'WARNING' ? 'T4 Alerta' : 'T4 Excedido'
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* MECÂNICA — colapsável */}
      <NeuroCard className="overflow-hidden">
        <button
          className="w-full flex items-center justify-between p-4 text-sm font-semibold text-text-primary"
          onClick={() => setShowMech(!showMech)}
        >
          <span className="flex items-center gap-2">
            <Wrench size={14} className="text-accent-cyan" />
            Análise Mecânica — Eixo e Transmissão
          </span>
          {showMech ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {showMech && (
          <div className="px-4 pb-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <MetricCard
              label="Torque Turbina"
              value={mechanical.torque_turbina_Nm.toFixed(2)}
              unit="N·m"
            />
            <MetricCard
              label="Torque Gerador"
              value={mechanical.torque_gerador_Nm.toFixed(2)}
              unit="N·m"
            />
            <MetricCard
              label="Relação Transm."
              value={mechanical.relacao_transmissao.toFixed(1)}
              unit=":1"
            />
            {mechanical.shaft && (
              <>
                <MetricCard
                  label="Diâm. Mín. Eixo"
                  value={mechanical.shaft.d_min_mm.toFixed(2)}
                  unit="mm"
                />
                <MetricCard
                  label="FS Goodman"
                  value={mechanical.shaft.FS_goodman.toFixed(3)}
                  status={mechanical.shaft.FS_goodman >= 1.5 ? 'ok' : 'error'}
                  subtext="Mínimo: 1.5"
                />
                <MetricCard
                  label="Vel. Crítica"
                  value={mechanical.shaft.Nc_rpm.toFixed(0)}
                  unit="rpm"
                  status={mechanical.shaft.margem_critica_pct >= 20 ? 'ok' : 'error'}
                  subtext={`Margem: ${mechanical.shaft.margem_critica_pct.toFixed(1)}%`}
                />
                <div className="col-span-2 sm:col-span-3 flex justify-center">
                  <StatusBadge status={mechanical.shaft.status} />
                </div>
              </>
            )}
          </div>
        )}
      </NeuroCard>

      {/* DIAGRAMA T-s — colapsável */}
      <NeuroCard className="overflow-hidden">
        <button
          className="w-full flex items-center justify-between p-4 text-sm font-semibold text-text-primary"
          onClick={() => setShowCycle(!showCycle)}
        >
          <span className="flex items-center gap-2">
            <Gauge size={14} className="text-accent-blue" />
            Diagrama T-s — Ciclo Brayton
          </span>
          {showCycle ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {showCycle && (
          <div className="p-2">
            <TsDiagram
              cycle={result.cycle}
              fuelName={result.fuel.name}
              fuelColor={result.fuel.color}
            />
          </div>
        )}
      </NeuroCard>

      {/* ESTADOS DO CICLO — tabela */}
      <CycleStatesTable cycle={result.cycle} />
    </div>
  );
}

function CycleStatesTable({ cycle }: { cycle: FuelResults['cycle'] }) {
  const [expanded, setExpanded] = useState(false);

  const states = [
    { n: '1', desc: 'Entrada Compressor', point: cycle.point1 },
    { n: '2', desc: 'Saída Compressor', point: cycle.point2 },
    { n: '3', desc: 'Entrada CC (Regen.)', point: cycle.point3 },
    { n: '4', desc: 'Entrada Turbina (TIT)', point: cycle.point4 },
    { n: '5', desc: 'Saída Turbina', point: cycle.point5 },
    { n: '6', desc: 'Exaustão (Regen.)', point: cycle.point6 },
  ];

  return (
    <NeuroCard className="overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-4 text-sm font-semibold text-text-primary"
        onClick={() => setExpanded(!expanded)}
      >
        <span>📊 Estados Termodinâmicos do Ciclo</span>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {expanded && (
        <div className="overflow-x-auto px-4 pb-4">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="text-text-muted border-b border-white/10">
                <th className="text-left py-2 pr-3">Ponto</th>
                <th className="text-left py-2 pr-3 hidden sm:table-cell">Descrição</th>
                <th className="text-right py-2 pr-3">T [°C]</th>
                <th className="text-right py-2 pr-3">P [kPa]</th>
                <th className="text-right py-2 pr-3">h [kJ/kg]</th>
                <th className="text-right py-2">s [kJ/kg·K]</th>
              </tr>
            </thead>
            <tbody>
              {states.map(({ n, desc, point }) => (
                <tr key={n} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-2 pr-3">
                    <span className="font-bold text-text-accent">{n}</span>
                  </td>
                  <td className="py-2 pr-3 text-text-secondary hidden sm:table-cell">{desc}</td>
                  <td className="py-2 pr-3 text-right text-amber-300">
                    {(point.T_K - 273.15).toFixed(2)}
                  </td>
                  <td className="py-2 pr-3 text-right text-blue-300">
                    {point.P_kPa.toFixed(3)}
                  </td>
                  <td className="py-2 pr-3 text-right text-cyan-300">
                    {point.h_kJkg.toFixed(3)}
                  </td>
                  <td className="py-2 text-right text-green-300">
                    {point.s_kJkgK.toFixed(5)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-text-muted mt-2">
            Verificação 1ª Lei: {cycle.erro_1a_lei.toFixed(4)}%
          </p>
        </div>
      )}
    </NeuroCard>
  );
}
