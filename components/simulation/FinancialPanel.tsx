'use client';
import React, { useEffect, useRef } from 'react';
import { NeuroCard, MetricCard } from '@/components/ui/NeuroCard';
import type { FinancialResults } from '@/lib/logic/financial';

interface FinancialPanelProps {
  financial: FinancialResults;
  fuelName: string;
  fuelColor: string;
  investimento: number;
}

export function FinancialPanel({ financial, fuelName, fuelColor, investimento }: FinancialPanelProps) {
  const plotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!plotRef.current) return;
    import('plotly.js-dist-min').then((Plotly) => {
      const meses = Array.from({ length: 24 }, (_, i) => `Mês ${i + 1}`);
      const paybackMes = Math.ceil(financial.payback_meses);

      const traceZero = {
        type: 'scatter' as const, mode: 'lines' as const,
        x: meses, y: Array(24).fill(0),
        line: { color: '#475569', width: 1, dash: 'dash' as const },
        hoverinfo: 'skip' as const, showlegend: false,
      };
      const trace = {
        type: 'scatter' as const, mode: 'lines+markers' as const,
        x: meses, y: financial.cash_flow,
        line: { color: fuelColor, width: 2.5, shape: 'spline' as const },
        marker: { size: 4, color: fuelColor },
        name: fuelName,
        fill: 'tozeroy' as const, fillcolor: `${fuelColor}18`,
        hovertemplate: '%{x}: <b>R$ %{y:,.0f}</b><extra></extra>',
      };

      const layout = {
        paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(15,23,42,0.6)',
        font: { color: '#94a3b8', size: 10 },
        margin: { t: 5, r: 10, b: 40, l: 70 },
        xaxis: { gridcolor: 'rgba(148,163,184,0.08)', tickfont: { size: 9 }, color: '#94a3b8' },
        yaxis: { title: { text: 'R$', font: { size: 10 } }, gridcolor: 'rgba(148,163,184,0.08)', tickformat: ',.0f', color: '#94a3b8' },
        showlegend: false,
        shapes: financial.payback_meses < 24 && financial.payback_meses > 0 ? [{
          type: 'line' as const,
          x0: `Mês ${paybackMes}`, x1: `Mês ${paybackMes}`,
          y0: 0, y1: 1, yref: 'paper' as const,
          line: { color: '#22c55e', width: 2, dash: 'dot' as const },
        }] : [],
      };
      Plotly.react(plotRef.current!, [traceZero, trace], layout, { responsive: true, displayModeBar: false });
    });
  }, [financial, fuelColor, fuelName]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <MetricCard label="Tarifa Aplic. (TA)" value={`R$ ${financial.TA.toFixed(4)}`} unit="/kWh" />
        <MetricCard label="Tarifa Fat. GD (TF)" value={`R$ ${financial.TF.toFixed(4)}`} unit="/kWh" status="neutral" />
        <MetricCard label="Potência Efetiva" value={financial.pot_efetiva_kW.toFixed(2)} unit="kW" />
        <MetricCard label="Receita Mensal" value={`R$ ${financial.receita_mes.toFixed(0)}`} unit="" status="ok" />
        <MetricCard label="Custo Combust./Mês" value={`R$ ${financial.custo_comb_mes.toFixed(0)}`} unit="" status="warning" />
        <MetricCard label="Resultado Líquido" value={`R$ ${financial.resultado_liq_mes.toFixed(0)}`} unit="/mês" status={financial.resultado_liq_mes > 0 ? 'ok' : 'error'} />
        <MetricCard label="Payback" value={financial.payback_meses === Infinity ? '∞' : financial.payback_meses.toFixed(1)} unit="meses" status={financial.payback_meses < 36 ? 'ok' : financial.payback_meses < 60 ? 'warning' : 'error'} />
        <MetricCard label="ROI Anual" value={`${financial.roi_anual_pct.toFixed(1)}%`} unit="/ano" status={financial.roi_anual_pct > 20 ? 'ok' : financial.roi_anual_pct > 10 ? 'warning' : 'error'} />
        <MetricCard label="Receita Anual" value={`R$ ${financial.receita_ano.toFixed(0)}`} unit="" />
      </div>
      <NeuroCard className="p-4">
        <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Fluxo de Caixa Acumulado — 24 meses</h4>
        <div ref={plotRef} className="w-full h-52" />
        <p className="text-xs text-text-muted mt-2">Investimento: <strong className="text-text-accent">R$ {investimento.toLocaleString('pt-BR')}</strong></p>
      </NeuroCard>
    </div>
  );
}
