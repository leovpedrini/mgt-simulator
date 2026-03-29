// ============================================================
// PROPRIEDADES DO AR REAL — Substituto do CoolProp
// Usando polinômios de Çengel & Boles (Tabela A-2c) + NASA
// Desenvolvido por Eng. Leonardo Pedrini
// ============================================================
//
// Referência: Çengel & Boles, Termodinâmica, 8ª ed., Tabela A-2c
// Cp(T) = (a1 + a2*T + a3*T² + a4*T³) / M_air   [kJ/kg·K]
// onde T em Kelvin, coeficientes para Ar ideal.
//
// h(T) = integral(Cp dT) de 0 a T  [kJ/kg] (referência relativa)
// s°(T) = integral(Cp/T dT) de Tref a T  [kJ/kg·K]
// s(T,P) = s°(T) - R_air * ln(P/Pref)
//
// Faixa de validade: 200 K ≤ T ≤ 2200 K

import { R_AIR, M_AIR, P_REF_KPA } from './data';

// Coeficientes Cp molar do ar [kJ/kmol·K], T em [K]
// Çengel & Boles Tabela A-2c (Ar: N2 + O2 + Ar)
const CP_COEFFS = {
  a1: 28.11,
  a2: 0.1967e-2,
  a3: 0.4802e-5,
  a4: -1.966e-9,
};

// Temperatura de referência para h (Çengel usa 0 K como base)
const T_H_REF = 0; // K

/**
 * Cp específico do ar [kJ/kg·K] a temperatura T [K]
 */
export function cpAir(T: number): number {
  const { a1, a2, a3, a4 } = CP_COEFFS;
  const cp_molar = a1 + a2 * T + a3 * T * T + a4 * T * T * T;
  return cp_molar / M_AIR; // kJ/kg·K
}

/**
 * Entalpia específica do ar [kJ/kg] a temperatura T [K]
 * Integração analítica de Cp(T) de T_H_REF até T
 */
export function enthalpyAir(T: number): number {
  const { a1, a2, a3, a4 } = CP_COEFFS;
  // h(T) = (1/M_air) * integral(a1 + a2*T + a3*T^2 + a4*T^3)dT
  const h_molar = (
    a1 * T +
    (a2 / 2) * T * T +
    (a3 / 3) * T * T * T +
    (a4 / 4) * T * T * T * T
  );
  const h_ref = (
    a1 * T_H_REF +
    (a2 / 2) * T_H_REF * T_H_REF +
    (a3 / 3) * T_H_REF * T_H_REF * T_H_REF +
    (a4 / 4) * T_H_REF * T_H_REF * T_H_REF * T_H_REF
  );
  return (h_molar - h_ref) / M_AIR; // kJ/kg
}

/**
 * Função entropia padrão s°(T) [kJ/kg·K]
 * Integração analítica de Cp(T)/T de Tref até T
 * Tref = 298.15 K (padrão termodinâmico)
 */
export function entropyStdAir(T: number): number {
  const { a1, a2, a3, a4 } = CP_COEFFS;
  const T_ref = 298.15;
  // s°(T) = (1/M_air) * integral(a1/T + a2 + a3*T + a4*T²)dT
  function s_integral(Tk: number): number {
    return (
      a1 * Math.log(Tk) +
      a2 * Tk +
      (a3 / 2) * Tk * Tk +
      (a4 / 3) * Tk * Tk * Tk
    );
  }
  return (s_integral(T) - s_integral(T_ref)) / M_AIR;
}

/**
 * Entalpia do ar h(P, T) [kJ/kg]
 * Para gás ideal: h não depende de P
 */
export function h_PT(P_kPa: number, T_K: number): number {
  void P_kPa; // Para gás ideal, entalpia independe de pressão
  return enthalpyAir(T_K);
}

/**
 * Entropia específica do ar s(P, T) [kJ/kg·K]
 * s(T,P) = s°(T) - R_air * ln(P/Pref)
 */
export function s_PT(P_kPa: number, T_K: number): number {
  return entropyStdAir(T_K) - R_AIR * Math.log(P_kPa / P_REF_KPA);
}

/**
 * Temperatura do ar dado P [kPa] e h [kJ/kg]
 * Resolução numérica por bisseção
 */
export function T_from_Ph(P_kPa: number, h_kJkg: number): number {
  void P_kPa;
  // Para gás ideal: h(T) independe de P
  return T_from_h(h_kJkg);
}

/**
 * Temperatura do ar dado h [kJ/kg] (bisseção)
 */
function T_from_h(h_target: number): number {
  let T_low = 100.0;
  let T_high = 3000.0;
  const tol = 1e-6;
  const maxIter = 100;

  for (let i = 0; i < maxIter; i++) {
    const T_mid = (T_low + T_high) / 2;
    const h_mid = enthalpyAir(T_mid);
    if (Math.abs(h_mid - h_target) < tol) return T_mid;
    if (h_mid < h_target) {
      T_low = T_mid;
    } else {
      T_high = T_mid;
    }
  }
  return (T_low + T_high) / 2;
}

/**
 * Temperatura do ar dado s [kJ/kg·K] e P [kPa] (bisseção)
 */
function T_from_sP(s_target: number, P_kPa: number): number {
  let T_low = 100.0;
  let T_high = 3000.0;
  const tol = 1e-8;
  const maxIter = 100;

  for (let i = 0; i < maxIter; i++) {
    const T_mid = (T_low + T_high) / 2;
    const s_mid = s_PT(P_kPa, T_mid);
    if (Math.abs(s_mid - s_target) < tol) return T_mid;
    if (s_mid < s_target) {
      T_low = T_mid;
    } else {
      T_high = T_mid;
    }
  }
  return (T_low + T_high) / 2;
}

/**
 * Entalpia isentrópica do ar saindo à pressão P2 [kPa]
 * dado estado de entrada com entropia s1 [kJ/kg·K]
 * Retorna h2s [kJ/kg]
 */
export function h_isentropic(P2_kPa: number, s1_kJkgK: number): number {
  const T2s = T_from_sP(s1_kJkgK, P2_kPa);
  return enthalpyAir(T2s);
}

/**
 * Temperatura correspondente a uma entalpia [kJ/kg] e pressão [kPa]
 * Alias mais semântico
 */
export function T_from_hP(h_kJkg: number, P_kPa: number): number {
  return T_from_Ph(P_kPa, h_kJkg);
}

// Exporta as funções de propriedade compatíveis com a interface Python
export const airProps = {
  h: h_PT,
  s: s_PT,
  h_isen: h_isentropic,
  T_from_Ph,
  T_from_hP,
  cp: cpAir,
};
