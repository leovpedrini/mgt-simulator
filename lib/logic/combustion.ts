// ============================================================
// COMBUSTÃO — Estequiometria e Câmara de Combustão
// Portado de combustao.py e camara_combustao.py
// Desenvolvido por Eng. Leonardo Pedrini
// ============================================================

import { cpAir } from './airProperties';
import { T4_MAX_AUTOMOTIVE_K, T4_ALERT_K } from './data';
import type { Fuel, CycleResults, CombustionChamberResults } from '@/lib/types';

// Relações estequiométricas por combustível
const STOICH_DATA: Record<string, {
  AFR: number;
  FAR: number;
  T_ad_stoich_K: number;
}> = {
  biogas: {
    AFR: 5.71,
    FAR: 0.175,
    T_ad_stoich_K: 1873,  // 1600°C
  },
  biomethane: {
    AFR: 17.1,
    FAR: 0.0585,
    T_ad_stoich_K: 2227,  // 1954°C
  },
  hydrogen: {
    AFR: 34.3,
    FAR: 0.0292,
    T_ad_stoich_K: 2483,  // 2210°C
  },
};

/**
 * Calcula a relação combustível/ar real (FAR real) pelo balanço de energia
 * na câmara de combustão.
 */
export function calcFAR(
  T3_K: number,
  T4_K: number,
  fuel: Fuel,
  eta_comb: number
): { FAR: number; phi: number; T_chama_K: number } {
  const stoich = STOICH_DATA[fuel.id];

  // Cp médio dos gases de combustão (temperatura média entre T3 e T4)
  const T_med = (T3_K + T4_K) / 2;
  const cp_g = cpAir(T_med); // Aproximação: usar Cp do ar como Cp dos gases [kJ/kg·K]

  const dT = T4_K - T3_K;

  // FAR pelo balanço de energia: m_f * PCI * η = (m_ar + m_f) * cp * dT
  // FAR = (cp * dT) / (PCI - cp * dT)
  const FAR_real = (cp_g * dT) / (fuel.pci * eta_comb - cp_g * dT);
  const phi = FAR_real / stoich.FAR;

  // Temperatura adiabática da chama (linearização simplificada)
  let T_chama_K: number;
  if (phi <= 1.0) {
    T_chama_K = T3_K + phi * (stoich.T_ad_stoich_K - T3_K);
  } else {
    T_chama_K = stoich.T_ad_stoich_K - (phi - 1) * (stoich.T_ad_stoich_K - T3_K) * 0.8;
  }

  return { FAR: FAR_real, phi, T_chama_K };
}

/**
 * Dimensiona a câmara de combustão (câmara tubular do tipo Can)
 */
export function sizeCombustionChamber(
  cycle: CycleResults,
  fuel: Fuel,
  eta_comb: number
): CombustionChamberResults {
  const T3 = cycle.point3.T_K;
  const T4 = cycle.point4.T_K;
  const P3_kPa = cycle.point3.P_kPa;
  const m_ar = cycle.m_ar_kgs;

  // FAR e temperatura da chama
  const { FAR, phi, T_chama_K } = calcFAR(T3, T4, fuel, eta_comb);

  // Status térmico (limite do turbocompressor automotivo)
  let T4_status: 'OK' | 'WARNING' | 'EXCEEDED';
  if (T4 > T4_MAX_AUTOMOTIVE_K) {
    T4_status = 'EXCEEDED';
  } else if (T4 > T4_ALERT_K) {
    T4_status = 'WARNING';
  } else {
    T4_status = 'OK';
  }

  // ─── Geometria da Câmara ──────────────────────────────────
  // Velocidade de referência típica para câmaras tipo can
  const C_ref = 20.0; // m/s

  // Densidade do ar na entrada da câmara (Estado 3, gás ideal)
  const R_air_SI = 287; // J/(kg·K)
  const rho3 = (P3_kPa * 1000) / (R_air_SI * T3); // kg/m³

  // Área de referência (seção transversal)
  const A_ref = m_ar / (rho3 * C_ref); // m²

  // Diâmetro (seção circular)
  const d_camara = Math.sqrt(4 * A_ref / Math.PI); // m

  // Comprimento (relação típica L/D = 3.0)
  const LD_ratio = 3.0;
  const L_camara = LD_ratio * d_camara; // m

  // Volume
  const V_camara = A_ref * L_camara; // m³

  // Calor total liberado
  const q_in_kJkg = cycle.q_in;
  const Q_total_kW = m_ar * q_in_kJkg;

  // Intensidade de combustão [MW/(m³·atm)]
  const P3_atm = P3_kPa / 101.325;
  const Qi = (Q_total_kW / 1000) / (V_camara * P3_atm);

  return {
    FAR,
    phi,
    T_chama_K,
    T4_status,
    d_camara_mm: d_camara * 1000,
    L_camara_mm: L_camara * 1000,
    V_camara_cm3: V_camara * 1e6,
    Qi_MW_m3_atm: Qi,
  };
}

/**
 * Calcula o consumo de combustível e os custos operacionais
 */
export function calcFuelConsumption(
  cycle: CycleResults,
  fuel: Fuel,
  eta_comb: number
) {
  const { FAR } = calcFAR(cycle.point3.T_K, cycle.point4.T_K, fuel, eta_comb);

  const m_comb_kgs = FAR * cycle.m_ar_kgs;    // kg/s de combustível
  const consumo_kgh = m_comb_kgs * 3600;       // kg/h
  const consumo_m3h = consumo_kgh / fuel.density; // m³/h

  // Custo operacional
  const custo_hora = consumo_m3h * fuel.costPerM3; // R$/h
  const custo_mes = custo_hora * 720;              // R$/mês (720h = 30 dias)

  // Potência líquida
  const w_liq_esp = cycle.w_liq_esp; // kJ/kg
  const potencia_kW = cycle.m_ar_kgs * w_liq_esp; // kW (antes das eficiências mec+gen)
  const custo_MWh = potencia_kW > 0 ? (custo_hora / potencia_kW) * 1000 : 0;

  // Emissões de CO2
  const emissao_co2_kgh = (consumo_kgh * fuel.pci / 1000) * fuel.co2EmissionFactor;

  return {
    m_comb_kgs,
    consumo_kgh,
    consumo_m3h,
    custo_hora_BRL: custo_hora,
    custo_mes_BRL: custo_mes,
    custo_MWh_BRL: custo_MWh,
    emissao_co2_kg_h: emissao_co2_kgh,
  };
}
