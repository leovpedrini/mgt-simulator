// ============================================================
// ANÁLISE DE EXAUSTÃO E COGERAÇÃO
// Desenvolvido por Eng. Leonardo Pedrini
// ============================================================

import type { CycleResults, Fuel } from '@/lib/types';

export interface ExhaustResults {
  T6_C: number; m_exh_kgs: number;
  Q_exh_kW: number; V_exh_m3h: number;
  eta_global_pct: number;
  composicao: { CO2: number; H2O: number; N2: number; O2: number };
}

const DADOS_QUIMICOS: Record<string, { C_wt: number; H_wt: number }> = {
  biogas: { C_wt: 0.342, H_wt: 0.114 },
  biomethane: { C_wt: 0.745, H_wt: 0.250 },
  hydrogen: { C_wt: 0.000, H_wt: 1.000 },
};

export function calcExhaust(cycle: CycleResults, fuel: Fuel, m_comb_kgs: number): ExhaustResults {
  const T6_K = cycle.point6.T_K;
  const m_exh_kgs = cycle.m_ar_kgs + m_comb_kgs;
  const cp_exh = 1.10;
  const rho_exh = 0.80;
  const Q_exh_kW = m_exh_kgs * cp_exh * (T6_K - 298.15);
  const V_exh_m3h = (m_exh_kgs / rho_exh) * 3600;
  const q_in_kW = cycle.m_ar_kgs * cycle.q_in;
  const P_util = cycle.m_ar_kgs * cycle.w_liq_esp;
  const eta_global = q_in_kW > 0 ? ((P_util + Q_exh_kW * 0.60) / q_in_kW) * 100 : 0;
  const quim = DADOS_QUIMICOS[fuel.id] ?? DADOS_QUIMICOS.biogas;
  const FAR = m_comb_kgs / cycle.m_ar_kgs;
  const pct_CO2 = quim.C_wt * FAR / (1 + FAR) * 3.667 * 10;
  const pct_H2O = quim.H_wt * FAR / (1 + FAR) * 9.0 * 10;
  const pct_N2 = 76.8 / (1 + FAR * 0.1);
  const pct_O2 = Math.max(0, 23.2 - pct_CO2 * 0.73 - pct_H2O * 0.5);
  return { T6_C: T6_K - 273.15, m_exh_kgs, Q_exh_kW, V_exh_m3h, eta_global_pct: eta_global, composicao: { CO2: pct_CO2, H2O: pct_H2O, N2: pct_N2, O2: pct_O2 } };
}
