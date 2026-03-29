// ============================================================
// MECÂNICA — Torque, Transmissão e Eixo
// Portado de mecanica.py e shaft_design.py
// Desenvolvido por Eng. Leonardo Pedrini
// ============================================================

import { SHAFT_MATERIAL_DEFAULT } from './data';
import type { MechanicalResults, ShaftResults, SimulationInputs } from '@/lib/types';

const TWO_PI = 2 * Math.PI;

/**
 * Calcula os torques e relação de transmissão
 */
export function calcTorques(
  potencia_W: number,
  rpm_turbina: number,
  rpm_gerador: number
): { torque_turbina: number; torque_gerador: number; relacao_transmissao: number } {
  const omega_turbina = rpm_turbina * TWO_PI / 60; // rad/s
  const omega_gerador = rpm_gerador * TWO_PI / 60; // rad/s

  const torque_turbina = potencia_W / omega_turbina; // N·m
  const torque_gerador = potencia_W / omega_gerador; // N·m
  const relacao_transmissao = rpm_turbina / rpm_gerador;

  return { torque_turbina, torque_gerador, relacao_transmissao };
}

/**
 * Análise de fadiga pelo critério de Goodman Modificado (Shigley)
 * Calcula o diâmetro mínimo do eixo considerando flexão + torção
 *
 * @param potencia_W Potência [W]
 * @param rpm RPM do eixo
 * @param d_eixo_mm Diâmetro estimado [mm] (iteração)
 * @param L_mm Comprimento entre mancais [mm]
 * @param m_rotor_kg Massa do rotor [kg]
 */
export function calcShaftDesign(
  potencia_W: number,
  rpm: number,
  d_eixo_mm: number,
  L_mm: number,
  m_rotor_kg: number
): ShaftResults {
  const mat = SHAFT_MATERIAL_DEFAULT;

  const d = d_eixo_mm / 1000; // m
  const L = L_mm / 1000;      // m
  const omega = rpm * TWO_PI / 60;

  // Torque
  const T = potencia_W / omega; // N·m

  // Força do peso do rotor (viga simplesmente apoiada, carga central)
  const g = 9.81;
  const F = m_rotor_kg * g; // N

  // Momento fletor máximo (L/4 para carga central)
  const M = F * L / 4; // N·m

  // ─── Fatores de correção do limite de fadiga (Shigley) ───
  // ka: fator de acabamento superficial (usinado)
  const a = 4.51;
  const b_exp = -0.265;
  const ka = a * Math.pow(mat.Sut, b_exp);

  // kb: fator de tamanho
  const d_mm = d_eixo_mm;
  let kb: number;
  if (d_mm <= 8) kb = 1.0;
  else if (d_mm <= 51) kb = 1.24 * Math.pow(d_mm, -0.107);
  else kb = 1.51 * Math.pow(d_mm, -0.157);

  const kc = 1.0;  // Flexão
  const kd = 1.0;  // Temperatura ambiente
  const ke = 0.897; // Confiabilidade 90%
  const kf = 1.0;

  const Se = ka * kb * kc * kd * ke * kf * mat.Se0; // MPa

  // Fatores de concentração de tensão (eixo escalonado típico)
  const Kt_f = 1.8; // Flexão
  const Kt_t = 1.4; // Torção

  // ─── Tensões ─────────────────────────────────────────────
  const d3 = d * d * d;
  const sigma_a = (Kt_f * 32 * M) / (Math.PI * d3) / 1e6; // MPa (alternante)
  const tau_m = (Kt_t * 16 * T) / (Math.PI * d3) / 1e6;   // MPa (médio)

  // Tensão equivalente de Von Mises para carga estática
  const sigma_eq = Math.sqrt(sigma_a * sigma_a + 3 * tau_m * tau_m);

  // ─── Fatores de Segurança ─────────────────────────────────
  // Goodman Modificado (DE-Goodman)
  const FS_goodman = 1 / (sigma_a / Se + (Math.sqrt(3) * tau_m) / mat.Syt);

  // Estático (Von Mises)
  const FS_estatico = mat.Syt / sigma_eq;

  const FS_final = Math.min(FS_goodman, FS_estatico);

  // ─── Velocidade Crítica (Rayleigh-Ritz simplificado) ─────
  const E = mat.E * 1e6; // Pa
  const I = Math.PI * Math.pow(d, 4) / 64; // m⁴
  const Nc = (Math.PI / 2) * Math.sqrt((E * I) / (m_rotor_kg * Math.pow(L, 3))); // rad/s
  const Nc_rpm = Nc * 60 / TWO_PI;
  const margem_critica = ((Nc_rpm - rpm) / Nc_rpm) * 100;

  // ─── Diâmetro mínimo pelo critério DE-Goodman ─────────────
  const FS_design = 2.0;
  const d_min_m = Math.cbrt(
    (16 * FS_design / Math.PI) *
    Math.sqrt(
      Math.pow(2 * Kt_f * M / (Se * 1e6), 2) +
      Math.pow(Math.sqrt(3) * Kt_t * T / (mat.Syt * 1e6), 2)
    )
  );
  const d_min_mm = d_min_m * 1000;

  const status: 'APROVADO' | 'REPROVADO' =
    FS_final >= 1.5 && margem_critica >= 20 ? 'APROVADO' : 'REPROVADO';

  return {
    d_min_mm,
    FS_goodman,
    FS_estatico,
    status,
    Nc_rpm,
    margem_critica_pct: margem_critica,
    sigma_a_MPa: sigma_a,
    tau_m_MPa: tau_m,
    Se_corrigido_MPa: Se,
  };
}

/**
 * Resultado mecânico completo para uma simulação
 */
export function calcMechanicalResults(
  potencia_kW: number,
  inputs: SimulationInputs
): MechanicalResults {
  const potencia_W = potencia_kW * 1000;
  const { torque_turbina, torque_gerador, relacao_transmissao } =
    calcTorques(potencia_W, inputs.rpm_turbina, inputs.rpm_gerador);

  // Cálculo do eixo (se diâmetro fornecido ou estimativa padrão)
  const d_eixo = inputs.d_eixo_mm ?? 30; // mm (padrão inicial)
  const L_eixo = 300; // mm (estimativa entre mancais)
  const m_rotor = 2.0; // kg (estimativa do rotor)

  const shaft = calcShaftDesign(
    potencia_W,
    inputs.rpm_turbina,
    d_eixo,
    L_eixo,
    m_rotor
  );

  return {
    torque_turbina_Nm: torque_turbina,
    torque_gerador_Nm: torque_gerador,
    relacao_transmissao,
    shaft,
  };
}
