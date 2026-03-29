'use client';
// ============================================================
// COMPONENTE: SimulationForm — Formulário de Parâmetros v2
// Desenvolvido por Eng. Leonardo Pedrini
// ============================================================

import React, { useState } from 'react';
import { NeuroCard } from '@/components/ui/NeuroCard';
import { NeuroInput, NeuroSlider, NeuroSelect, NeuroButton } from '@/components/ui/NeuroInput';
import { DEFAULT_INPUTS, TURBOCOMPRESSORES, TARIFAS_ANEEL, DEFAULT_FINANCIAL, VALIDATION_PROFILES } from '@/lib/logic/data';
import type { SimulationInputs } from '@/lib/types';
import type { FinancialParams } from '@/lib/logic/financial';
import { Zap, Thermometer, Wind, Settings, RotateCcw, DollarSign, BookOpen, Cpu } from 'lucide-react';

type OperationMode = 'real' | 'validation';

type FullFormInputs = SimulationInputs & {
  operation_mode?: string;
  validation_example?: string;
  turbocharger_id?: string;
  custo_biogas_m3?: number;
  custo_biomethane_m3?: number;
  custo_hydrogen_m3?: number;
  financial?: FinancialParams;
  shaft_material_id?: string;
};

interface SimulationFormProps {
  onSimulate: (inputs: FullFormInputs) => Promise<void>;
  isLoading: boolean;
}

const DEFAULT_CUSTOS = {
  custo_biogas_m3: 1.50,
  custo_biomethane_m3: 2.60,
  custo_hydrogen_m3: 4.53,
};

export function SimulationForm({ onSimulate, isLoading }: SimulationFormProps) {
  const [opMode, setOpMode] = useState<OperationMode>('real');
  const [validationExample, setValidationExample] = useState<string>('example98');
  const [selectedTC, setSelectedTC] = useState<string>('gtx3076r');
  const [inputs, setInputs] = useState<SimulationInputs>(DEFAULT_INPUTS);
  const [custos, setCustos] = useState(DEFAULT_CUSTOS);
  const [financial, setFinancial] = useState<FinancialParams>(DEFAULT_FINANCIAL as FinancialParams);
  const [selectedUF, setSelectedUF] = useState<string>('SP');

  const set = (key: keyof SimulationInputs) =>
    (value: string | number) =>
      setInputs((prev) => ({ ...prev, [key]: typeof value === 'string' ? parseFloat(value) || value : value }));

  const setFin = (key: keyof FinancialParams) =>
    (value: string | number) =>
      setFinancial((prev) => ({ ...prev, [key]: typeof value === 'string' ? parseFloat(value) || value : value }));

  const handleReset = () => {
    setInputs(DEFAULT_INPUTS);
    setCustos(DEFAULT_CUSTOS);
    setFinancial(DEFAULT_FINANCIAL as FinancialParams);
    setOpMode('real');
    setSelectedTC('gtx3076r');
    setSelectedUF('SP');
  };

  const handleUFChange = (uf: string) => {
    setSelectedUF(uf);
    const tarifa = TARIFAS_ANEEL.find(t => t.uf === uf);
    if (tarifa) {
      const base = tarifa[financial.modalidade as keyof typeof tarifa] as number;
      setFinancial(prev => ({ ...prev, tarifa_base: base }));
    }
  };

  const handleModalidadeChange = (modalidade: string) => {
    const mod = modalidade as FinancialParams['modalidade'];
    const tarifa = TARIFAS_ANEEL.find(t => t.uf === selectedUF);
    const base = tarifa ? (tarifa[mod] as number) : DEFAULT_FINANCIAL.tarifa_base;
    setFinancial(prev => ({ ...prev, modalidade: mod, tarifa_base: base }));
  };

  const applyTC = (tcId: string) => {
    setSelectedTC(tcId);
    const tc = TURBOCOMPRESSORES.find(t => t.id === tcId);
    if (tc && tc.id !== 'personalizado') {
      setInputs(prev => ({
        ...prev,
        eta_c: tc.eta_c,
        eta_t: tc.eta_t,
        rpm_turbina: Math.round(tc.rpm_max * 0.85),
        d_eixo_mm: tc.d_eixo_mm,
      }));
    }
  };

  const applyValidation = (exKey: string) => {
    setValidationExample(exKey);
    const profile = VALIDATION_PROFILES[exKey as keyof typeof VALIDATION_PROFILES];
    if (profile) {
      setInputs(prev => ({
        ...prev,
        T1_K: profile.T1_K, P1_kPa: profile.P1_kPa, RP_c: profile.RP_c, T4_K: profile.T4_K,
        eta_c: profile.eta_c, eta_t: profile.eta_t, eta_comb: profile.eta_comb,
        eta_mec: profile.eta_mec, eta_gen: profile.eta_gen,
        efetividade_regen: profile.efetividade_regen, perda_carga_cc: profile.perda_carga_cc,
        rpm_turbina: profile.rpm_turbina, rpm_gerador: profile.rpm_gerador,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullInputs: FullFormInputs = {
      ...inputs,
      operation_mode: opMode,
      validation_example: opMode === 'validation' ? validationExample : undefined,
      turbocharger_id: opMode === 'real' ? selectedTC : undefined,
      custo_biogas_m3: custos.custo_biogas_m3,
      custo_biomethane_m3: custos.custo_biomethane_m3,
      custo_hydrogen_m3: custos.custo_hydrogen_m3,
      financial,
    };
    onSimulate(fullInputs);
  };

  const T1_C = inputs.T1_K - 273.15;
  const T4_C = inputs.T4_K - 273.15;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* ── MODO DE PROJETO ── */}
      <NeuroCard className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Cpu size={16} className="text-accent-cyan" />
          <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
            Modo de Projeto
          </h3>
        </div>
        <div className="flex gap-2 mb-4">
          {[
            { id: 'real' as OperationMode, label: 'Projeto Real', icon: '⚙️' },
            { id: 'validation' as OperationMode, label: 'Validação (Çengel)', icon: '📚' },
          ].map(({ id, label, icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setOpMode(id)}
              className={`
                flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl
                text-sm font-semibold transition-all duration-200 border
                ${opMode === id
                  ? 'bg-bg-elevated shadow-neuro text-text-primary border-accent-blue/30'
                  : 'bg-bg-input text-text-secondary border-white/5 hover:text-text-primary'
                }
              `}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Validação: botões dos exemplos de Çengel */}
        {opMode === 'validation' && (
          <div className="space-y-2">
            <p className="text-xs text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1">
              <BookOpen size={11} /> Exemplos do Livro (Çengel & Boles 8ª ed.)
            </p>
            {Object.entries(VALIDATION_PROFILES).map(([key, profile]) => (
              <button
                key={key}
                type="button"
                onClick={() => applyValidation(key)}
                className={`
                  w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all border
                  ${validationExample === key
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                    : 'bg-bg-input border-white/5 text-text-secondary hover:text-text-primary'
                  }
                `}
              >
                <span className="font-semibold">{profile.label}</span>
                {profile.expected && (
                  <span className="ml-2 text-text-muted">
                    η = {profile.expected.eficiencia}%
                    {'bwr' in profile.expected ? `, BWR = ${profile.expected.bwr}%` : ''}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Real: seleção de turbocompressor */}
        {opMode === 'real' && (
          <div className="space-y-3">
            <NeuroSelect
              label="Turbocompressor"
              value={selectedTC}
              onChange={(e) => applyTC(e.target.value)}
              options={TURBOCOMPRESSORES.map(tc => ({
                value: tc.id,
                label: `${tc.marca} ${tc.modelo} — ${tc.potencia_kW} kW, RP [${tc.rp_min}–${tc.rp_max}]`,
              }))}
            />
            {(() => {
              const tc = TURBOCOMPRESSORES.find(t => t.id === selectedTC);
              if (!tc) return null;
              return (
                <div className="bg-bg-input rounded-xl p-3 text-xs space-y-1">
                  <p className="text-text-muted">{tc.notas}</p>
                  <div className="flex gap-4 text-text-secondary">
                    <span>Mancal: <strong className="text-text-primary">{tc.mancal}</strong></span>
                    <span>T4 max: <strong className="text-text-primary">{(tc.T4_max_K - 273.15).toFixed(0)}°C</strong></span>
                    <span>RPM max: <strong className="text-text-primary">{tc.rpm_max.toLocaleString()}</strong></span>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Modo de cálculo (reverso/direto) */}
        <div className="mt-4">
          <NeuroSelect
            label="Modo de Cálculo"
            value={inputs.mode}
            onChange={(e) => setInputs((p) => ({ ...p, mode: e.target.value as SimulationInputs['mode'] }))}
            options={[
              { value: 'reverse', label: 'Modo Reverso — Definir Potência Alvo' },
              { value: 'direct_mass', label: 'Modo Direto — Vazão Mássica [kg/s]' },
              { value: 'direct_volumetric', label: 'Modo Direto — Vazão Volumétrica [m³/s]' },
            ]}
          />
          <div className="mt-3">
            {inputs.mode === 'reverse' && (
              <NeuroInput
                label="Potência Alvo"
                type="number"
                value={inputs.potencia_alvo_kW ?? 30}
                onChange={(e) => set('potencia_alvo_kW')(e.target.value)}
                unit="kW"
                min={0.1} max={500} step={0.5}
              />
            )}
            {inputs.mode === 'direct_mass' && (
              <NeuroInput
                label="Vazão Mássica de Ar"
                type="number"
                value={inputs.vazao_massica_kgs ?? 0.1}
                onChange={(e) => set('vazao_massica_kgs')(e.target.value)}
                unit="kg/s"
                min={0.001} max={10} step={0.01}
              />
            )}
            {inputs.mode === 'direct_volumetric' && (
              <NeuroInput
                label="Vazão Volumétrica de Ar"
                type="number"
                value={inputs.vazao_volumetrica_m3s ?? 0.1}
                onChange={(e) => set('vazao_volumetrica_m3s')(e.target.value)}
                unit="m³/s"
                min={0.001} max={10} step={0.01}
              />
            )}
          </div>
        </div>
      </NeuroCard>

      {/* ── CONDIÇÕES AMBIENTAIS ── */}
      <NeuroCard className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Thermometer size={16} className="text-accent-blue" />
          <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
            Condições Ambientais
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <NeuroInput
            label="T₁ — Temperatura Entrada"
            type="number"
            value={T1_C.toFixed(2)}
            onChange={(e) => setInputs((p) => ({ ...p, T1_K: parseFloat(e.target.value) + 273.15 }))}
            unit="°C"
            min={-10} max={50} step={0.5}
            hint={`${inputs.T1_K.toFixed(2)} K`}
          />
          <NeuroInput
            label="P₁ — Pressão Ambiente"
            type="number"
            value={inputs.P1_kPa}
            onChange={(e) => set('P1_kPa')(e.target.value)}
            unit="kPa"
            min={70} max={120} step={0.1}
          />
        </div>
      </NeuroCard>

      {/* ── PARÂMETROS DO CICLO ── */}
      <NeuroCard className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Wind size={16} className="text-accent-cyan" />
          <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
            Parâmetros do Ciclo
          </h3>
        </div>
        <div className="space-y-4">
          <NeuroSlider
            label="Razão de Pressão (RP_c)"
            value={inputs.RP_c}
            min={1.5} max={8.0} step={0.1}
            onChange={set('RP_c') as (v: number) => void}
            displayFormatter={(v) => v.toFixed(1)}
            unit="—"
          />
          <div className="grid grid-cols-2 gap-3">
            <NeuroInput
              label="T₄ — TIT (Turbina)"
              type="number"
              value={T4_C.toFixed(0)}
              onChange={(e) => setInputs((p) => ({ ...p, T4_K: parseFloat(e.target.value) + 273.15 }))}
              unit="°C"
              min={400} max={1200} step={10}
              hint={`${inputs.T4_K.toFixed(1)} K ${inputs.T4_K > 1223 ? '⚠️ Limite automotivo' : ''}`}
            />
            <NeuroInput
              label="RPM da Turbina"
              type="number"
              value={inputs.rpm_turbina}
              onChange={(e) => set('rpm_turbina')(e.target.value)}
              unit="rpm"
              min={1000} max={150000} step={1000}
            />
          </div>
          <NeuroInput
            label="RPM do Gerador"
            type="number"
            value={inputs.rpm_gerador}
            onChange={(e) => set('rpm_gerador')(e.target.value)}
            unit="rpm"
            min={900} max={3600} step={300}
            hint="Típico: 1800 ou 3600 rpm (60 Hz)"
          />
        </div>
      </NeuroCard>

      {/* ── EFICIÊNCIAS ── */}
      <NeuroCard className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={16} className="text-accent-green" />
          <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
            Eficiências
          </h3>
        </div>
        <div className="space-y-3">
          {[
            { key: 'eta_c', label: 'Compressor (η_c)', hint: 'Típico: 0.65–0.80' },
            { key: 'eta_t', label: 'Turbina (η_t)', hint: 'Típico: 0.65–0.80' },
            { key: 'eta_comb', label: 'Combustão (η_comb)', hint: 'Típico: 0.85–0.98' },
            { key: 'eta_mec', label: 'Mecânica (η_mec)', hint: 'Típico: 0.90–0.96' },
            { key: 'eta_gen', label: 'Gerador (η_gen)', hint: 'Típico: 0.80–0.95' },
            { key: 'efetividade_regen', label: 'Regenerador (ε)', hint: 'Típico: 0.60–0.85' },
          ].map(({ key, label }) => (
            <NeuroSlider
              key={key}
              label={label}
              value={inputs[key as keyof SimulationInputs] as number}
              min={0.0} max={1.0} step={0.01}
              onChange={set(key as keyof SimulationInputs) as (v: number) => void}
              displayFormatter={(v) => `${(v * 100).toFixed(0)}%`}
              unit=""
            />
          ))}
          <div className="mt-2">
            <NeuroSlider
              label="Perda de Carga CC"
              value={inputs.perda_carga_cc}
              min={0.0} max={0.15} step={0.005}
              onChange={set('perda_carga_cc') as (v: number) => void}
              displayFormatter={(v) => `${(v * 100).toFixed(1)}%`}
            />
          </div>
        </div>
      </NeuroCard>

      {/* ── CUSTOS DE COMBUSTÍVEL ── */}
      <NeuroCard className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign size={16} className="text-accent-amber" />
          <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
            Custos de Combustível
          </h3>
        </div>
        <div className="space-y-3">
          <NeuroInput
            label="Biogás"
            type="number"
            value={custos.custo_biogas_m3}
            onChange={(e) => setCustos(p => ({ ...p, custo_biogas_m3: parseFloat(e.target.value) || 0 }))}
            unit="R$/m³"
            min={0.1} max={20} step={0.05}
          />
          <NeuroInput
            label="Biometano"
            type="number"
            value={custos.custo_biomethane_m3}
            onChange={(e) => setCustos(p => ({ ...p, custo_biomethane_m3: parseFloat(e.target.value) || 0 }))}
            unit="R$/m³"
            min={0.1} max={20} step={0.05}
          />
          <NeuroInput
            label="Hidrogênio"
            type="number"
            value={custos.custo_hydrogen_m3}
            onChange={(e) => setCustos(p => ({ ...p, custo_hydrogen_m3: parseFloat(e.target.value) || 0 }))}
            unit="R$/m³"
            min={0.1} max={100} step={0.10}
          />
        </div>
      </NeuroCard>

      {/* ── ANÁLISE FINANCEIRA ── */}
      <NeuroCard className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign size={16} className="text-accent-cyan" />
          <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
            Análise Financeira (GD)
          </h3>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <NeuroSelect
              label="Estado (ANEEL)"
              value={selectedUF}
              onChange={(e) => handleUFChange(e.target.value)}
              options={TARIFAS_ANEEL.map(t => ({ value: t.uf, label: `${t.uf} — ${t.estado}` }))}
            />
            <NeuroSelect
              label="Modalidade"
              value={financial.modalidade}
              onChange={(e) => handleModalidadeChange(e.target.value)}
              options={[
                { value: 'residencial', label: 'Residencial' },
                { value: 'comercial', label: 'Comercial' },
                { value: 'industrial_a4', label: 'Industrial A4' },
              ]}
            />
          </div>
          <NeuroInput
            label="Tarifa Base"
            type="number"
            value={financial.tarifa_base}
            onChange={(e) => setFin('tarifa_base')(e.target.value)}
            unit="R$/kWh"
            min={0.1} max={2.0} step={0.001}
            hint="Atualizado automaticamente ao selecionar estado"
          />
          <div className="grid grid-cols-2 gap-3">
            <NeuroInput
              label="PIS/COFINS"
              type="number"
              value={financial.pis_cofins_pct}
              onChange={(e) => setFin('pis_cofins_pct')(e.target.value)}
              unit="%"
              min={0} max={20} step={0.25}
            />
            <NeuroInput
              label="ICMS"
              type="number"
              value={financial.icms_pct}
              onChange={(e) => setFin('icms_pct')(e.target.value)}
              unit="%"
              min={0} max={30} step={0.5}
            />
          </div>
          <NeuroSlider
            label="Desconto GD (%)"
            value={financial.desc_gd_pct}
            min={0} max={100} step={1}
            onChange={(v) => setFinancial(p => ({ ...p, desc_gd_pct: v }))}
            displayFormatter={(v) => `${v.toFixed(0)}%`}
          />
          <div className="grid grid-cols-2 gap-3">
            <NeuroInput
              label="Horas/Mês"
              type="number"
              value={financial.horas_mes}
              onChange={(e) => setFin('horas_mes')(e.target.value)}
              unit="h"
              min={100} max={744} step={24}
            />
            <NeuroSlider
              label="Disponibilidade"
              value={financial.disponibilidade_pct}
              min={50} max={100} step={1}
              onChange={(v) => setFinancial(p => ({ ...p, disponibilidade_pct: v }))}
              displayFormatter={(v) => `${v.toFixed(0)}%`}
            />
          </div>
          <NeuroInput
            label="Investimento Total"
            type="number"
            value={financial.investimento_BRL}
            onChange={(e) => setFin('investimento_BRL')(e.target.value)}
            unit="R$"
            min={1000} max={10000000} step={1000}
          />
        </div>
      </NeuroCard>

      {/* ── AÇÕES ── */}
      <div className="flex gap-3">
        <NeuroButton
          type="submit"
          variant="primary"
          loading={isLoading}
          className="flex-1"
        >
          {isLoading ? 'Calculando...' : 'Simular Ciclo'}
        </NeuroButton>
        <NeuroButton
          type="button"
          variant="secondary"
          onClick={handleReset}
          className="px-4"
        >
          <RotateCcw size={16} />
        </NeuroButton>
      </div>
    </form>
  );
}
