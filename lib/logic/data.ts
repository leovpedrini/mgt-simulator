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

// ============================================================
// BANCO DE TURBOCOMPRESSORES (14 modelos)
// ============================================================
export interface Turbocharger {
  id: string; marca: string; modelo: string;
  rp_min: number; rp_max: number;
  m_ar_min: number; m_ar_max: number;  // kg/s
  rpm_max: number;
  T4_max_K: number; T4_pico_K: number;
  potencia_kW: number;
  eta_c: number; eta_t: number;
  d_eixo_mm: number; L_eixo_mm: number; m_rotor_kg: number;
  mancal: string; notas: string;
}

export const TURBOCOMPRESSORES: Turbocharger[] = [
  { id: 'gt2052', marca: 'Garrett', modelo: 'GT2052', rp_min: 2.0, rp_max: 2.8, m_ar_min: 0.06, m_ar_max: 0.12, rpm_max: 150000, T4_max_K: 1148, T4_pico_K: 1173, potencia_kW: 5, eta_c: 0.68, eta_t: 0.65, d_eixo_mm: 8, L_eixo_mm: 90, m_rotor_kg: 0.35, mancal: 'Deslizamento (bronze)', notas: 'Pequeno porte, veículos compactos' },
  { id: 'gt2860rs', marca: 'Garrett', modelo: 'GT2860RS', rp_min: 2.6, rp_max: 3.2, m_ar_min: 0.14, m_ar_max: 0.28, rpm_max: 130000, T4_max_K: 1173, T4_pico_K: 1223, potencia_kW: 12, eta_c: 0.72, eta_t: 0.68, d_eixo_mm: 10, L_eixo_mm: 110, m_rotor_kg: 0.55, mancal: 'Deslizamento (bronze)', notas: 'Série RS — alto fluxo, esportivos' },
  { id: 'gt3076r', marca: 'Garrett', modelo: 'GT3076R', rp_min: 2.8, rp_max: 3.6, m_ar_min: 0.22, m_ar_max: 0.45, rpm_max: 115000, T4_max_K: 1173, T4_pico_K: 1223, potencia_kW: 22, eta_c: 0.74, eta_t: 0.70, d_eixo_mm: 11, L_eixo_mm: 120, m_rotor_kg: 0.75, mancal: 'Deslizamento (bronze)', notas: 'Popular para conversão MGT — boa relação custo-benefício' },
  { id: 'gtx3076r', marca: 'Garrett', modelo: 'GTX3076R Gen2', rp_min: 3.0, rp_max: 4.0, m_ar_min: 0.26, m_ar_max: 0.52, rpm_max: 110000, T4_max_K: 1173, T4_pico_K: 1223, potencia_kW: 30, eta_c: 0.76, eta_t: 0.72, d_eixo_mm: 11, L_eixo_mm: 120, m_rotor_kg: 0.80, mancal: 'Rolamento esferas (aço)', notas: 'Ball bearing, referência 30 kW' },
  { id: 'g35_900', marca: 'Garrett', modelo: 'G35-900', rp_min: 3.2, rp_max: 4.5, m_ar_min: 0.38, m_ar_max: 0.72, rpm_max: 95000, T4_max_K: 1173, T4_pico_K: 1223, potencia_kW: 50, eta_c: 0.77, eta_t: 0.73, d_eixo_mm: 14, L_eixo_mm: 135, m_rotor_kg: 1.10, mancal: 'Rolamento esferas (aço)', notas: 'Alta performance, competição e MGT 50 kW' },
  { id: 'efr7064', marca: 'BorgWarner', modelo: 'EFR7064', rp_min: 2.5, rp_max: 3.2, m_ar_min: 0.12, m_ar_max: 0.25, rpm_max: 130000, T4_max_K: 1223, T4_pico_K: 1253, potencia_kW: 14, eta_c: 0.74, eta_t: 0.71, d_eixo_mm: 10, L_eixo_mm: 110, m_rotor_kg: 0.60, mancal: 'Rolamento cerâmico (Si3N4)', notas: 'Alta temperatura, Inconel turbina, ótimo H2' },
  { id: 'efr7670', marca: 'BorgWarner', modelo: 'EFR7670', rp_min: 2.8, rp_max: 3.8, m_ar_min: 0.22, m_ar_max: 0.44, rpm_max: 110000, T4_max_K: 1223, T4_pico_K: 1253, potencia_kW: 28, eta_c: 0.76, eta_t: 0.72, d_eixo_mm: 12, L_eixo_mm: 125, m_rotor_kg: 0.90, mancal: 'Rolamento cerâmico (Si3N4)', notas: 'Melhor para H2, alta temp e baixa inércia' },
  { id: 'hx35w', marca: 'Holset/Cummins', modelo: 'HX35W', rp_min: 2.5, rp_max: 3.2, m_ar_min: 0.22, m_ar_max: 0.40, rpm_max: 90000, T4_max_K: 1173, T4_pico_K: 1223, potencia_kW: 28, eta_c: 0.70, eta_t: 0.67, d_eixo_mm: 12, L_eixo_mm: 130, m_rotor_kg: 1.00, mancal: 'Deslizamento (bronze)', notas: 'Diesel pesado, robustez e longa vida' },
  { id: 'hx40w', marca: 'Holset/Cummins', modelo: 'HX40W', rp_min: 2.8, rp_max: 3.5, m_ar_min: 0.35, m_ar_max: 0.60, rpm_max: 80000, T4_max_K: 1173, T4_pico_K: 1223, potencia_kW: 45, eta_c: 0.71, eta_t: 0.68, d_eixo_mm: 14, L_eixo_mm: 150, m_rotor_kg: 1.30, mancal: 'Deslizamento (bronze)', notas: 'Caminhões pesados, ideal MGT rural/industrial' },
  { id: 'vf40', marca: 'IHI', modelo: 'VF40', rp_min: 2.7, rp_max: 3.3, m_ar_min: 0.17, m_ar_max: 0.32, rpm_max: 120000, T4_max_K: 1148, T4_pico_K: 1173, potencia_kW: 18, eta_c: 0.73, eta_t: 0.69, d_eixo_mm: 10, L_eixo_mm: 115, m_rotor_kg: 0.65, mancal: 'Deslizamento (bronze)', notas: 'OEM Subaru WRX STI, confiabilidade comprovada' },
  { id: 'td05h', marca: 'MHI', modelo: 'TD05H-16G', rp_min: 2.5, rp_max: 3.0, m_ar_min: 0.16, m_ar_max: 0.30, rpm_max: 120000, T4_max_K: 1148, T4_pico_K: 1173, potencia_kW: 16, eta_c: 0.72, eta_t: 0.68, d_eixo_mm: 10, L_eixo_mm: 115, m_rotor_kg: 0.60, mancal: 'Deslizamento (bronze)', notas: 'Mitsubishi Lancer EVO OEM, acessível' },
  { id: 'personalizado', marca: 'Personalizado', modelo: 'Personalizado', rp_min: 1.5, rp_max: 10.0, m_ar_min: 0.01, m_ar_max: 5.0, rpm_max: 200000, T4_max_K: 1500, T4_pico_K: 1600, potencia_kW: 100, eta_c: 0.75, eta_t: 0.70, d_eixo_mm: 12, L_eixo_mm: 120, m_rotor_kg: 0.80, mancal: 'Personalizado', notas: 'Todos os parâmetros editáveis' },
];

// ============================================================
// MATERIAIS DO EIXO (13 materiais)
// ============================================================
export interface ShaftMaterial {
  id: string; nome: string;
  Sy_MPa: number; Sut_MPa: number; Se_MPa: number;
  E_GPa: number; G_GPa: number; rho_kg_m3: number; norma: string;
}

export const MATERIAIS_EIXO: ShaftMaterial[] = [
  { id: 'aisi1020', nome: 'AISI 1020 (Recozido)', Sy_MPa: 210, Sut_MPa: 380, Se_MPa: 190, E_GPa: 207, G_GPa: 80, rho_kg_m3: 7850, norma: 'SAE J403' },
  { id: 'aisi1045n', nome: 'AISI 1045 (Normalizado)', Sy_MPa: 310, Sut_MPa: 570, Se_MPa: 285, E_GPa: 207, G_GPa: 80, rho_kg_m3: 7850, norma: 'SAE J403' },
  { id: 'aisi1045tr', nome: 'AISI 1045 (TR 600°C)', Sy_MPa: 530, Sut_MPa: 630, Se_MPa: 315, E_GPa: 207, G_GPa: 80, rho_kg_m3: 7850, norma: 'SAE J403' },
  { id: 'aisi4140_315', nome: 'AISI 4140 (TR 315°C)', Sy_MPa: 1570, Sut_MPa: 1720, Se_MPa: 700, E_GPa: 207, G_GPa: 80, rho_kg_m3: 7850, norma: 'SAE J404' },
  { id: 'aisi4140_540', nome: 'AISI 4140 (TR 540°C)', Sy_MPa: 1170, Sut_MPa: 1380, Se_MPa: 690, E_GPa: 207, G_GPa: 80, rho_kg_m3: 7850, norma: 'SAE J404' },
  { id: 'aisi4340_315', nome: 'AISI 4340 (TR 315°C)', Sy_MPa: 1620, Sut_MPa: 1760, Se_MPa: 700, E_GPa: 207, G_GPa: 80, rho_kg_m3: 7850, norma: 'SAE J404' },
  { id: 'aisi4340_425', nome: 'AISI 4340 (TR 425°C)', Sy_MPa: 1380, Sut_MPa: 1480, Se_MPa: 700, E_GPa: 207, G_GPa: 80, rho_kg_m3: 7850, norma: 'SAE J404' },
  { id: 'aisi304', nome: 'AISI 304 (Inox Austenítico)', Sy_MPa: 215, Sut_MPa: 505, Se_MPa: 167, E_GPa: 193, G_GPa: 77, rho_kg_m3: 8000, norma: 'ASTM A276' },
  { id: 'aisi17_4', nome: 'AISI 17-4 PH (H900)', Sy_MPa: 1170, Sut_MPa: 1310, Se_MPa: 530, E_GPa: 197, G_GPa: 77, rho_kg_m3: 7800, norma: 'AMS 5604' },
  { id: 'ti6al4v', nome: 'Titânio Ti-6Al-4V', Sy_MPa: 880, Sut_MPa: 950, Se_MPa: 510, E_GPa: 114, G_GPa: 44, rho_kg_m3: 4430, norma: 'AMS 4928' },
  { id: 'inconel718', nome: 'Inconel 718', Sy_MPa: 1034, Sut_MPa: 1241, Se_MPa: 496, E_GPa: 200, G_GPa: 77, rho_kg_m3: 8190, norma: 'AMS 5662' },
  { id: 'aisi630h925', nome: 'AISI 630/17-4PH (H925)', Sy_MPa: 1000, Sut_MPa: 1070, Se_MPa: 450, E_GPa: 197, G_GPa: 77, rho_kg_m3: 7780, norma: 'AMS 5604' },
  { id: 'vascomax300', nome: 'Vascomax 300 (Maraging)', Sy_MPa: 1965, Sut_MPa: 2000, Se_MPa: 700, E_GPa: 190, G_GPa: 74, rho_kg_m3: 8000, norma: 'AMS 6514' },
];

// ============================================================
// TARIFAS ANEEL 2024/2025
// ============================================================
export interface TarifaEstado {
  estado: string; uf: string;
  residencial: number; comercial: number; industrial_a4: number;
}

export const TARIFAS_ANEEL: TarifaEstado[] = [
  { estado: 'Acre', uf: 'AC', residencial: 0.446, comercial: 0.420, industrial_a4: 0.311 },
  { estado: 'Alagoas', uf: 'AL', residencial: 0.784, comercial: 0.723, industrial_a4: 0.498 },
  { estado: 'Amapá', uf: 'AP', residencial: 0.552, comercial: 0.521, industrial_a4: 0.371 },
  { estado: 'Amazonas', uf: 'AM', residencial: 0.621, comercial: 0.588, industrial_a4: 0.421 },
  { estado: 'Bahia', uf: 'BA', residencial: 0.812, comercial: 0.752, industrial_a4: 0.521 },
  { estado: 'Ceará', uf: 'CE', residencial: 0.852, comercial: 0.791, industrial_a4: 0.541 },
  { estado: 'Distrito Federal', uf: 'DF', residencial: 0.662, comercial: 0.602, industrial_a4: 0.432 },
  { estado: 'Espírito Santo', uf: 'ES', residencial: 0.693, comercial: 0.641, industrial_a4: 0.451 },
  { estado: 'Goiás', uf: 'GO', residencial: 0.731, comercial: 0.672, industrial_a4: 0.461 },
  { estado: 'Maranhão', uf: 'MA', residencial: 0.731, comercial: 0.672, industrial_a4: 0.464 },
  { estado: 'Mato Grosso', uf: 'MT', residencial: 0.751, comercial: 0.692, industrial_a4: 0.482 },
  { estado: 'Mato Grosso do Sul', uf: 'MS', residencial: 0.712, comercial: 0.652, industrial_a4: 0.451 },
  { estado: 'Minas Gerais', uf: 'MG', residencial: 0.711, comercial: 0.641, industrial_a4: 0.441 },
  { estado: 'Pará', uf: 'PA', residencial: 0.673, comercial: 0.612, industrial_a4: 0.421 },
  { estado: 'Paraíba', uf: 'PB', residencial: 0.821, comercial: 0.762, industrial_a4: 0.521 },
  { estado: 'Paraná', uf: 'PR', residencial: 0.621, comercial: 0.571, industrial_a4: 0.401 },
  { estado: 'Pernambuco', uf: 'PE', residencial: 0.831, comercial: 0.772, industrial_a4: 0.531 },
  { estado: 'Piauí', uf: 'PI', residencial: 0.793, comercial: 0.731, industrial_a4: 0.502 },
  { estado: 'Rio de Janeiro', uf: 'RJ', residencial: 0.941, comercial: 0.851, industrial_a4: 0.571 },
  { estado: 'Rio Grande do Norte', uf: 'RN', residencial: 0.801, comercial: 0.741, industrial_a4: 0.511 },
  { estado: 'Rio Grande do Sul', uf: 'RS', residencial: 0.561, comercial: 0.521, industrial_a4: 0.381 },
  { estado: 'Rondônia', uf: 'RO', residencial: 0.621, comercial: 0.572, industrial_a4: 0.402 },
  { estado: 'Roraima', uf: 'RR', residencial: 0.561, comercial: 0.521, industrial_a4: 0.372 },
  { estado: 'Santa Catarina', uf: 'SC', residencial: 0.691, comercial: 0.631, industrial_a4: 0.421 },
  { estado: 'São Paulo', uf: 'SP', residencial: 0.776, comercial: 0.711, industrial_a4: 0.491 },
  { estado: 'Sergipe', uf: 'SE', residencial: 0.812, comercial: 0.752, industrial_a4: 0.521 },
  { estado: 'Tocantins', uf: 'TO', residencial: 0.712, comercial: 0.651, industrial_a4: 0.451 },
];

export const DEFAULT_FINANCIAL = {
  tarifa_base: 0.776,
  pis_cofins_pct: 9.25,
  icms_pct: 18.0,
  desc_gd_pct: 50.0,
  fio_b: 0.03,
  horas_mes: 720,
  disponibilidade_pct: 90.0,
  investimento_BRL: 80000,
  modalidade: 'residencial' as const,
};
