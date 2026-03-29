'use client';
// ============================================================
// COMPONENTE: TsDiagram — Diagrama T-s interativo com Plotly
// Desenvolvido por Eng. Leonardo Pedrini
// ============================================================

import React, { useEffect, useRef } from 'react';
import { NeuroCard } from '@/components/ui/NeuroCard';
import type { CycleResults } from '@/lib/types';
import { generateTsDiagramData } from '@/lib/logic/thermodynamics';

interface TsDiagramProps {
  cycle: CycleResults;
  fuelName: string;
  fuelColor: string;
}

export function TsDiagram({ cycle, fuelName, fuelColor }: TsDiagramProps) {
  const plotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!plotRef.current) return;

    // Importação dinâmica do Plotly (evita problemas SSR)
    import('plotly.js-dist-min').then((Plotly) => {
      const { cycle: cycleTrace, points } = generateTsDiagramData(cycle);

      // Trace do ciclo
      const traceCycle = {
        type: 'scatter' as const,
        mode: 'lines' as const,
        x: cycleTrace.s,
        y: cycleTrace.T,
        line: {
          color: fuelColor,
          width: 2.5,
          shape: 'spline' as const,
          smoothing: 0.8,
        },
        name: `Ciclo — ${fuelName}`,
        hovertemplate: 's: %{x:.4f} kJ/kg·K<br>T: %{y:.1f}°C<extra></extra>',
      };

      // Trace dos pontos
      const tracePoints = {
        type: 'scatter' as const,
        mode: 'markers+text' as const,
        x: points.map((p) => p.s_kJkgK),
        y: points.map((p) => p.T_C),
        text: points.map((p) => `  ${p.label}`),
        textposition: 'right' as const,
        textfont: { color: '#94a3b8', size: 11, family: 'JetBrains Mono' },
        marker: {
          color: points.map((_, i) =>
            i === 3 ? '#ef4444' : i === 0 ? '#06b6d4' : fuelColor
          ),
          size: 10,
          symbol: 'circle',
          line: { color: '#0f172a', width: 2 },
        },
        customdata: points.map((p) => [p.T_K, p.h_kJkg]),
        hovertemplate:
          '<b>Ponto %{text}</b><br>' +
          's: %{x:.4f} kJ/kg·K<br>' +
          'T: %{y:.1f}°C (%{customdata[0]:.1f} K)<br>' +
          'h: %{customdata[1]:.2f} kJ/kg<extra></extra>',
        name: 'Estados',
      };

      const layout = {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(15,23,42,0.6)',
        font: { color: '#94a3b8', family: 'Inter, sans-serif', size: 11 },
        margin: { t: 20, r: 20, b: 50, l: 60 },
        xaxis: {
          title: { text: 's [kJ/kg·K]', font: { size: 12 } },
          gridcolor: 'rgba(148,163,184,0.08)',
          zerolinecolor: 'rgba(148,163,184,0.15)',
          tickfont: { family: 'JetBrains Mono', size: 10 },
          color: '#94a3b8',
        },
        yaxis: {
          title: { text: 'T [°C]', font: { size: 12 } },
          gridcolor: 'rgba(148,163,184,0.08)',
          zerolinecolor: 'rgba(148,163,184,0.15)',
          tickfont: { family: 'JetBrains Mono', size: 10 },
          color: '#94a3b8',
        },
        showlegend: false,
        hovermode: 'closest' as const,
        dragmode: 'pan' as const,
      };

      const config = {
        responsive: true,
        displayModeBar: true,
        modeBarButtonsToRemove: ['sendDataToCloud', 'lasso2d', 'select2d'],
        displaylogo: false,
        locale: 'pt-BR',
      };

      Plotly.react(plotRef.current!, [traceCycle, tracePoints], layout, config);
    });

    return () => {
      if (plotRef.current) {
        import('plotly.js-dist-min').then((Plotly) => {
          Plotly.purge(plotRef.current!);
        });
      }
    };
  }, [cycle, fuelColor, fuelName]);

  return (
    <NeuroCard className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-text-primary">
          Diagrama T-s — Ciclo Brayton Regenerativo
        </h3>
        <span
          className="text-xs font-mono px-2.5 py-1 rounded-full border"
          style={{
            color: fuelColor,
            borderColor: `${fuelColor}40`,
            backgroundColor: `${fuelColor}15`,
          }}
        >
          {fuelName}
        </span>
      </div>

      {/* Legenda dos pontos */}
      <div className="flex flex-wrap gap-3 mb-3 text-xs text-text-muted font-mono">
        {[
          { n: '1', label: 'Entrada Comp.' },
          { n: '2', label: 'Saída Comp.' },
          { n: '3', label: 'Entrada CC' },
          { n: '4', label: 'Entrada Turb.' },
          { n: '5', label: 'Saída Turb.' },
          { n: '6', label: 'Exaustão' },
        ].map(({ n, label }) => (
          <span key={n} className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-text-accent inline-block" />
            {n}: {label}
          </span>
        ))}
      </div>

      <div ref={plotRef} className="w-full h-72" />
    </NeuroCard>
  );
}
