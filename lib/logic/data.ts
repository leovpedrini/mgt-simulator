// ============================================================
// CONSTANTES E DADOS DA SIMULAÇÃO — MGT Simulator
// Portado de data.py (Python original)
// Desenvolvido por Eng. Leonardo Pedrini
// ============================================================

import type { Fuel, SimulationInputs } from '@/lib/types';

// --- COMBUSTÍVEIS ---
export const FUELS: Record<string, Fuel> = {
  biogas: {
    id: 'biogas',
    name: 'Biogás',
    nameShort: 'BG',
    pci: 20223,        // kJ/kg (60% CH4, 35% CO2, 5% N2)
    density: 1.20,     // kg/m³
    costPerKg: 1.25,   // R$/kg
    costPerM3: 1.50,   // R$/m³ (preço referência)
    composition: '60% CH₄ + 35% CO₂ + 5% N₂',
    co2EmissionFactor: 0.055, // kg_CO2/MJ
    color: '#22c55e',  // Verde
  },
  biomethane: {
    id: 'biomethane',
    name: 'Biometano',
    nameShort: 'BM',
    pci: 48814,        // kJ/kg (97% CH4, 2% C2H6, 1% N2)
    density: 0.72,     // kg/m³
    costPerKg: 3.61,   // R$/kg
    costPerM3: 2.60,   // R$/m³
    composition: '97% CH₄ + 2% C₂H₆ + 1% N₂',
    co2EmissionFactor: 0.0555,
    color: '#3b82f6',  // Azul
  },
  hydrogen: {
    id: 'hydrogen',
    name: 'Hidrogênio',
    nameShort: 'H₂',
    pci: 120000,       // kJ/kg (H2 puro)
    density: 0.0899,   // kg/m³
    costPerKg: 50.42,  // R$/kg
    costPerM3: 4.53,   // R$/m³
    composition: 'H₂ puro (99.9%)',
    co2EmissionFactor: 0.0, // Zero emissão CO2!
    color: '#06b6d4',  // Ciano
  },
};

// --- PERFIL PADRÃO DA MICROTURBINA ---
export const DEFAULT_INPUTS: SimulationInputs = {
  // Condições ambientais
  T1_K: 303.15,         // 30°C — temperatura ambiente típica Brasil
  P1_kPa: 101.3,        // Pressão ao nível do mar

  // Ciclo Brayton
  RP_c: 3.0,            // Razão de pressão do compressor
  T4_K: 1100.0,         // TIT [K] = 826.85°C

  // Eficiências
  eta_c: 0.70,          // Compressor
  eta_t: 0.68,          // Turbina
  eta_comb: 0.90,       // Câmara de combustão
  eta_mec: 0.93,        // Mecânica (mancais, vedações)
  eta_gen: 0.82,        // Gerador

  // Regenerador
  efetividade_regen: 0.80,

  // Câmara de combustão
  perda_carga_cc: 0.05, // 5%

  // Modo e alvo
  mode: 'reverse',
  potencia_alvo_kW: 30.0,

  // Mecânica
  rpm_turbina: 72000,
  rpm_gerador: 1800,
};

// --- LIMITE TÉRMICO DO TURBOCOMPRESSOR AUTOMOTIVO ---
export const T4_MAX_AUTOMOTIVE_K = 1223.15;   // 950°C
export const T4_ALERT_K = 1173.15;            // 900°C

// --- CONSTANTES DO AR ---
export const R_AIR = 0.287;          // kJ/(kg·K)
export const M_AIR = 28.97;          // kg/kmol
export const P_REF_KPA = 101.325;    // kPa (pressão referência termodinâmica)
export const T_REF_K = 298.15;       // K (temperatura referência)

// --- TARIFAS ELÉTRICAS ANEEL 2024/2025 (referência) ---
export const ELECTRIC_TARIFFS = {
  residential: {
    SP: 0.78, RJ: 0.94, MG: 0.71, RS: 0.56, SC: 0.69, PR: 0.62,
    BA: 0.81, GO: 0.73, DF: 0.66, CE: 0.85,
  },
  commercial: {
    SP: 0.71, RJ: 0.85, MG: 0.64, RS: 0.52, SC: 0.63, PR: 0.57,
    BA: 0.75, GO: 0.67, DF: 0.60, CE: 0.79,
  },
  industrial_a4: {
    SP: 0.49, RJ: 0.57, MG: 0.44, RS: 0.38, SC: 0.42, PR: 0.40,
    BA: 0.52, GO: 0.46, DF: 0.43, CE: 0.54,
  },
};

// --- PROPRIEDADES DO AXO (material padrão para eixo) ---
export const SHAFT_MATERIAL_DEFAULT = {
  name: 'AISI 1040 Recozido',
  Sut: 590,   // MPa — Resistência à tração
  Syt: 490,   // MPa — Escoamento
  Se0: 295,   // MPa — Limite de fadiga (Se' = 0.5 * Sut)
  E: 207e3,   // MPa — Módulo de elasticidade
};

// --- PERFIS PARA VALIDAÇÃO (Çengel & Boles 8ª ed.) ---
export const VALIDATION_PROFILES = {
  example98: {
    // Ciclo Brayton Simples Ideal
    label: 'Ex 9-8 Çengel: Brayton Simples Ideal',
    T1_K: 300, P1_kPa: 95, RP_c: 8.0, T4_K: 1300,
    eta_c: 1.0, eta_t: 1.0, eta_comb: 1.0, eta_mec: 1.0, eta_gen: 1.0,
    efetividade_regen: 0.0, perda_carga_cc: 0.0,
    mode: 'reverse' as const, potencia_alvo_kW: 1.0,
    rpm_turbina: 1000, rpm_gerador: 1000,
    expected: { eficiencia: 42.6, bwr: 40.3 },
  },
  example99: {
    // Ciclo Brayton Regenerativo Ideal
    label: 'Ex 9-9 Çengel: Brayton Regenerativo Ideal',
    T1_K: 300, P1_kPa: 95, RP_c: 8.0, T4_K: 1300,
    eta_c: 1.0, eta_t: 1.0, eta_comb: 1.0, eta_mec: 1.0, eta_gen: 1.0,
    efetividade_regen: 1.0, perda_carga_cc: 0.0,
    mode: 'reverse' as const, potencia_alvo_kW: 1.0,
    rpm_turbina: 1000, rpm_gerador: 1000,
    expected: { eficiencia: 52.8, bwr: 40.3 },
  },
  example910: {
    // Ciclo Real Irreversível
    label: 'Ex 9-10 Çengel: Ciclo Real Irreversível',
    T1_K: 300, P1_kPa: 95, RP_c: 8.0, T4_K: 1300,
    eta_c: 0.80, eta_t: 0.85, eta_comb: 1.0, eta_mec: 1.0, eta_gen: 1.0,
    efetividade_regen: 0.0, perda_carga_cc: 0.0,
    mode: 'reverse' as const, potencia_alvo_kW: 1.0,
    rpm_turbina: 1000, rpm_gerador: 1000,
    expected: { eficiencia: 36.2 },
  },
};

// --- HORAS DE OPERAÇÃO ---
export const HOURS_PER_DAY = 24;
export const DAYS_PER_MONTH = 30;
export const HOURS_PER_MONTH = HOURS_PER_DAY * DAYS_PER_MONTH; // 720h
export const DAYS_PER_YEAR = 365;
export const HOURS_PER_YEAR = HOURS_PER_DAY * DAYS_PER_YEAR;  // 8760h
export const AVAILABILITY = 0.90; // Disponibilidade típica: 90%
