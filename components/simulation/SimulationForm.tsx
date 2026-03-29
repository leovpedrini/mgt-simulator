'use client';
// ============================================================
// COMPONENTE: SimulationForm — Formulário de Parâmetros
// Desenvolvido por Eng. Leonardo Pedrini
// ============================================================

import React, { useState } from 'react';
import { NeuroCard } from '@/components/ui/NeuroCard';
import { NeuroInput, NeuroSlider, NeuroSelect, NeuroButton } from '@/components/ui/NeuroInput';
import { DEFAULT_INPUTS } from '@/lib/logic/data';
import type { SimulationInputs } from '@/lib/types';
import { Zap, Thermometer, Wind, Settings, RotateCcw } from 'lucide-react';

interface SimulationFormProps {
  onSimulate: (inputs: SimulationInputs) => Promise<void>;
  isLoading: boolean;
}

export function SimulationForm({ onSimulate, isLoading }: SimulationFormProps) {
  const [inputs, setInputs] = useState<SimulationInputs>(DEFAULT_INPUTS);

  const set = (key: keyof SimulationInputs) =>
    (value: string | number) =>
      setInputs((prev) => ({ ...prev, [key]: typeof value === 'string' ? parseFloat(value) || value : value }));

  const handleReset = () => setInputs(DEFAULT_INPUTS);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSimulate(inputs);
  };

  const T1_C = inputs.T1_K - 273.15;
  const T4_C = inputs.T4_K - 273.15;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* MODO DE OPERAÇÃO */}
      <NeuroCard className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Settings size={16} className="text-accent-cyan" />
          <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
            Modo de Operação
          </h3>
        </div>
        <NeuroSelect
          label="Modo"
          value={inputs.mode}
          onChange={(e) => setInputs((p) => ({ ...p, mode: e.target.value as SimulationInputs['mode'] }))}
          options={[
            { value: 'reverse', label: '🎯 Modo Reverso — Definir Potência Alvo' },
            { value: 'direct_mass', label: '💨 Modo Direto — Vazão Mássica [kg/s]' },
            { value: 'direct_volumetric', label: '💨 Modo Direto — Vazão Volumétrica [m³/s]' },
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
              min={0.1}
              max={500}
              step={0.5}
            />
          )}
          {inputs.mode === 'direct_mass' && (
            <NeuroInput
              label="Vazão Mássica de Ar"
              type="number"
              value={inputs.vazao_massica_kgs ?? 0.1}
              onChange={(e) => set('vazao_massica_kgs')(e.target.value)}
              unit="kg/s"
              min={0.001}
              max={10}
              step={0.01}
            />
          )}
          {inputs.mode === 'direct_volumetric' && (
            <NeuroInput
              label="Vazão Volumétrica de Ar"
              type="number"
              value={inputs.vazao_volumetrica_m3s ?? 0.1}
              onChange={(e) => set('vazao_volumetrica_m3s')(e.target.value)}
              unit="m³/s"
              min={0.001}
              max={10}
              step={0.01}
            />
          )}
        </div>
      </NeuroCard>

      {/* CONDIÇÕES AMBIENTAIS */}
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
            min={-10}
            max={50}
            step={0.5}
            hint={`${inputs.T1_K.toFixed(2)} K`}
          />
          <NeuroInput
            label="P₁ — Pressão Ambiente"
            type="number"
            value={inputs.P1_kPa}
            onChange={(e) => set('P1_kPa')(e.target.value)}
            unit="kPa"
            min={70}
            max={120}
            step={0.1}
          />
        </div>
      </NeuroCard>

      {/* PARÂMETROS DO CICLO */}
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
            min={1.5}
            max={8.0}
            step={0.1}
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
              min={400}
              max={1200}
              step={10}
              hint={`${inputs.T4_K.toFixed(1)} K ${inputs.T4_K > 1223 ? '⚠️ Limite automotivo' : ''}`}
            />
            <NeuroInput
              label="RPM da Turbina"
              type="number"
              value={inputs.rpm_turbina}
              onChange={(e) => set('rpm_turbina')(e.target.value)}
              unit="rpm"
              min={1000}
              max={150000}
              step={1000}
            />
          </div>
        </div>
      </NeuroCard>

      {/* EFICIÊNCIAS */}
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
          ].map(({ key, label, hint }) => (
            <NeuroSlider
              key={key}
              label={label}
              value={inputs[key as keyof SimulationInputs] as number}
              min={0.0}
              max={1.0}
              step={0.01}
              onChange={set(key as keyof SimulationInputs) as (v: number) => void}
              displayFormatter={(v) => `${(v * 100).toFixed(0)}%`}
              unit=""
            />
          ))}

          <div className="mt-2">
            <NeuroSlider
              label="Perda de Carga CC"
              value={inputs.perda_carga_cc}
              min={0.0}
              max={0.15}
              step={0.005}
              onChange={set('perda_carga_cc') as (v: number) => void}
              displayFormatter={(v) => `${(v * 100).toFixed(1)}%`}
            />
          </div>
        </div>
      </NeuroCard>

      {/* AÇÕES */}
      <div className="flex gap-3">
        <NeuroButton
          type="submit"
          variant="primary"
          loading={isLoading}
          className="flex-1"
        >
          {isLoading ? 'Calculando...' : '⚡ Simular Ciclo'}
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
