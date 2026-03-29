'use client';
// ============================================================
// SIMULATION PAGE — Página principal de simulação
// Desenvolvido por Eng. Leonardo Pedrini
// ============================================================

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { SimulationForm } from '@/components/simulation/SimulationForm';
import { ResultsPanel } from '@/components/simulation/ResultsPanel';
import { NeuroButton } from '@/components/ui/NeuroInput';
import type { SimulationInputs, SimulationResults } from '@/lib/types';
import { ArrowLeft, Save, Download } from 'lucide-react';

export default function SimulationPage() {
  const [results, setResults] = useState<SimulationResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastInputs, setLastInputs] = useState<SimulationInputs | null>(null);

  const handleSimulate = useCallback(async (inputs: SimulationInputs) => {
    setIsLoading(true);
    setError(null);
    setLastInputs(inputs);

    try {
      const response = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error ?? 'Erro na simulação');
      }

      const data: SimulationResults = await response.json();
      setResults(data);

      // Scroll suave para os resultados em mobile
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleExportJSON = () => {
    if (!results) return;
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mgt-simulation-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-bg-base bg-grid-pattern pb-12">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-bg-base/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline text-sm">Início</span>
            </Link>
            <span className="text-text-muted/50">|</span>
            <div className="flex items-center gap-2">
              <span className="text-lg">⚙️</span>
              <h1 className="font-display font-bold text-text-primary text-sm sm:text-base">
                MGT Simulator
              </h1>
              <span className="hidden sm:inline text-xs text-text-muted">— Ciclo Brayton Regenerativo</span>
            </div>
          </div>

          {results && (
            <div className="flex items-center gap-2">
              <NeuroButton
                variant="secondary"
                onClick={handleExportJSON}
                className="text-xs px-3 py-2 gap-1.5"
              >
                <Download size={13} />
                <span className="hidden sm:inline">Exportar JSON</span>
              </NeuroButton>
              <NeuroButton
                variant="ghost"
                className="text-xs px-3 py-2 gap-1.5 text-text-secondary"
                disabled
                title="Requer conta Supabase"
              >
                <Save size={13} />
                <span className="hidden sm:inline">Salvar</span>
              </NeuroButton>
            </div>
          )}
        </div>
      </header>

      {/* Main layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">

          {/* Painel de entradas */}
          <div className="lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-1">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-text-primary">Parâmetros</h2>
              <p className="text-xs text-text-muted mt-0.5">Configure os parâmetros do ciclo termodinâmico</p>
            </div>
            <SimulationForm onSimulate={handleSimulate} isLoading={isLoading} />
          </div>

          {/* Painel de resultados */}
          <div id="results">
            {error && (
              <div className="mb-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                ❌ {error}
              </div>
            )}

            {isLoading && (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="w-12 h-12 border-3 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin" />
                <p className="text-text-muted text-sm">Calculando ciclo termodinâmico...</p>
                <p className="text-text-muted/60 text-xs">Simulando 3 combustíveis simultâneamente</p>
              </div>
            )}

            {!results && !isLoading && (
              <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                <div className="w-20 h-20 rounded-3xl bg-bg-card shadow-neuro flex items-center justify-center text-4xl">
                  📊
                </div>
                <h3 className="text-text-primary font-semibold">Aguardando Simulação</h3>
                <p className="text-text-muted text-sm max-w-sm">
                  Configure os parâmetros no painel esquerdo e clique em{' '}
                  <strong className="text-text-accent">Simular Ciclo</strong>.
                </p>
                <p className="text-text-muted/60 text-xs">
                  Os resultados para Biogás, Biometano e Hidrogênio serão exibidos simultaneamente.
                </p>
              </div>
            )}

            {results && !isLoading && (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-text-primary">Resultados</h2>
                    <p className="text-xs text-text-muted">
                      Calculado em {new Date(results.timestamp).toLocaleTimeString('pt-BR')}
                    </p>
                  </div>
                  {lastInputs && (
                    <div className="text-xs text-text-muted font-mono">
                      RP={lastInputs.RP_c} · TIT={(lastInputs.T4_K - 273.15).toFixed(0)}°C
                    </div>
                  )}
                </div>
                <ResultsPanel results={results} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
