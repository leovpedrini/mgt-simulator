// ============================================================
// TERMODINÂMICA — Ciclo Brayton Regenerativo
// Portado de termodinamica.py (Python original)
// Desenvolvido por Eng. Leonardo Pedrini
// ============================================================
//
// Pontos do ciclo:
// 1 → Entrada do Compressor (ambiente)
// 2 → Saída do Compressor
// 3 → Saída do Regenerador / Entrada da CC
// 4 → Entrada da Turbina (TIT)
// 5 → Saída da Turbina
// 6 → Saída do Regenerador (gases de exaustão)

import {
  h_PT, s_PT, h_isentropic, T_from_Ph
} from './airProperties';
import { R_AIR } from './data';
import type {
  SimulationInputs, ThermodynamicState, CycleResults
} from '@/lib/types';

/**
 * Calcula o Ciclo Brayton Regenerativo completo.
 * Retorna os resultados para qualquer combustível (os estados do ar
 * são independentes do combustível).
 *
 * @param inputs Parâmetros de entrada da simulação
 * @returns CycleResults com os 6 estados + indicadores
 */
export function simulateBraytonCycle(inputs: SimulationInputs): CycleResults {
  const {
    T1_K, P1_kPa, RP_c, T4_K,
    eta_c, eta_t, eta_mec, eta_gen,
    efetividade_regen, perda_carga_cc,
    mode, potencia_alvo_kW,
    vazao_massica_kgs, vazao_volumetrica_m3s,
  } = inputs;

  // ─── PONTO 1: Entrada do Compressor ───────────────────────
  const h1 = h_PT(P1_kPa, T1_K);
  const s1 = s_PT(P1_kPa, T1_K);
  const point1: ThermodynamicState = { T_K: T1_K, P_kPa: P1_kPa, h_kJkg: h1, s_kJkgK: s1 };

  // ─── PONTO 2: Saída do Compressor ─────────────────────────
  const P2 = P1_kPa * RP_c;
  const h2s = h_isentropic(P2, s1);          // saída isentrópica
  const h2 = h1 + (h2s - h1) / eta_c;        // saída real
  const T2 = T_from_Ph(P2, h2);
  const s2 = s_PT(P2, T2);
  const point2: ThermodynamicState = { T_K: T2, P_kPa: P2, h_kJkg: h2, s_kJkgK: s2 };
  const w_comp = h2 - h1; // Trabalho específico do compressor [kJ/kg]

  // ─── PONTO 4: Entrada da Turbina ──────────────────────────
  const P4 = P2 * (1 - perda_carga_cc);       // perda de pressão na CC
  const h4 = h_PT(P4, T4_K);
  const s4 = s_PT(P4, T4_K);
  const point4: ThermodynamicState = { T_K: T4_K, P_kPa: P4, h_kJkg: h4, s_kJkgK: s4 };

  // ─── PONTO 5: Saída da Turbina ────────────────────────────
  const P5 = P1_kPa;
  const h5s = h_isentropic(P5, s4);           // saída isentrópica
  const h5 = h4 - eta_t * (h4 - h5s);         // saída real
  const T5 = T_from_Ph(P5, h5);
  const s5 = s_PT(P5, T5);
  const point5: ThermodynamicState = { T_K: T5, P_kPa: P5, h_kJkg: h5, s_kJkgK: s5 };
  const w_turb = h4 - h5; // Trabalho específico da turbina [kJ/kg]

  // ─── REGENERADOR: Pontos 3 e 6 ───────────────────────────
  let h3: number, h6: number, q_regen: number;

  if (T5 > T2) {
    // Há possibilidade de regeneração (T_quente > T_fria)
    const h_ar_T5 = h_PT(P2, T5); // Ar hipotético @ T5 e P2
    const q_max_regen = h_ar_T5 - h2;
    q_regen = efetividade_regen * q_max_regen;
    h3 = h2 + q_regen;
    h6 = h5 - q_regen;
  } else {
    // Sem regeneração
    h3 = h2;
    h6 = h5;
    q_regen = 0;
  }

  const T3 = T_from_Ph(P2, h3);
  const P3 = P4; // Assume mesma pressão (P4 = P2 * (1 - perda))
  const s3 = s_PT(P3, T3);
  const point3: ThermodynamicState = { T_K: T3, P_kPa: P3, h_kJkg: h3, s_kJkgK: s3 };

  const T6 = T_from_Ph(P5, h6);
  const P6 = P5;
  const s6 = s_PT(P6, T6);
  const point6: ThermodynamicState = { T_K: T6, P_kPa: P6, h_kJkg: h6, s_kJkgK: s6 };

  // ─── BALANÇO DE ENERGIA ───────────────────────────────────
  const q_in = h4 - h3;                    // Calor específico adicionado [kJ/kg]
  const q_rej = h6 - h1;                   // Calor específico rejeitado [kJ/kg]
  const w_liq_esp = w_turb - w_comp;       // Trabalho líquido específico [kJ/kg]
  const bwr = (w_comp / w_turb) * 100;     // Back Work Ratio [%]
  const eficiencia = (w_liq_esp / q_in) * 100; // Eficiência térmica [%]

  // Verificação da 1ª Lei: w_liq = q_in - q_rej
  const w_liq_check = q_in - q_rej;
  const erro_1a_lei = Math.abs((w_liq_esp - w_liq_check) / w_liq_esp) * 100;

  // ─── VAZÃO MÁSSICA E POTÊNCIA ─────────────────────────────
  let m_ar_kgs: number;

  if (mode === 'reverse') {
    // Modo Reverso: calcular a vazão para atingir a potência alvo
    const P_alvo = (potencia_alvo_kW ?? 30) * 1000; // W
    const w_liq_Wkg = w_liq_esp * 1000; // W/(kg/s) = J/kg
    m_ar_kgs = P_alvo / (w_liq_Wkg * eta_mec * eta_gen);
  } else if (mode === 'direct_mass') {
    m_ar_kgs = vazao_massica_kgs ?? 0.1;
  } else {
    // direct_volumetric: m = P1 * V / (R * T1)
    const V_m3s = vazao_volumetrica_m3s ?? 0.1;
    const rho = (P1_kPa * 1000) / (R_AIR * 1000 * T1_K); // kg/m³
    m_ar_kgs = rho * V_m3s;
  }

  return {
    point1, point2, point3, point4, point5, point6,
    w_comp,
    w_turb,
    w_liq_esp,
    q_in,
    q_rej,
    q_regen,
    bwr,
    eficiencia,
    erro_1a_lei,
    m_ar_kgs,
    m_ar_kgh: m_ar_kgs * 3600,
  };
}

/**
 * Gera os dados para o Diagrama T-s (6 pontos do ciclo)
 */
export function generateTsDiagramData(cycle: CycleResults) {
  const points = [
    cycle.point1,
    cycle.point2,
    cycle.point3,
    cycle.point4,
    cycle.point5,
    cycle.point6,
  ];

  // Para o diagrama completo, conectamos os pontos em ordem do ciclo
  // 1→2 (compressão), 2→3 (regeneração), 3→4 (combustão), 4→5 (expansão), 5→6 (regeneração), 6→1 (rejeição)
  const labels = ['1', '2', '3', '4', '5', '6', '1']; // fecha o ciclo
  const T_path = [...points.map(p => p.T_K - 273.15), cycle.point1.T_K - 273.15]; // °C
  const s_path = [...points.map(p => p.s_kJkgK), cycle.point1.s_kJkgK];

  return {
    // Trace completo do ciclo
    cycle: { T: T_path, s: s_path, labels },
    // Pontos individuais
    points: points.map((p, i) => ({
      label: `${i + 1}`,
      T_C: p.T_K - 273.15,
      s_kJkgK: p.s_kJkgK,
      T_K: p.T_K,
      h_kJkg: p.h_kJkg,
    })),
  };
}
