// ============================================================
// TIPOS TYPESCRIPT — MGT Simulator
// Desenvolvido por Eng. Leonardo Pedrini
// ============================================================

// --- Combustíveis ---
export type FuelId = 'biogas' | 'biomethane' | 'hydrogen';

export interface Fuel {
  id: FuelId;
  name: string;
  nameShort: string;
  pci: number;           // Poder Calorífico Inferior [kJ/kg]
  density: number;       // Densidade [kg/m³]
  costPerKg: number;     // Custo [R$/kg]
  costPerM3: number;     // Custo [R$/m³]
  composition: string;  // Composição química
  co2EmissionFactor: number; // [kg_CO2/MJ]
  color: string;         // Cor para UI
}

// --- Entradas da Simulação ---
export type SimulationMode = 'reverse' | 'direct_mass' | 'direct_volumetric';

export interface SimulationInputs {
  // Condições ambientais
  T1_K: number;          // Temperatura entrada compressor [K]
  P1_kPa: number;        // Pressão ambiente [kPa]

  // Parâmetros do ciclo
  RP_c: number;          // Razão de pressão do compressor
  T4_K: number;          // TIT - Temperatura de entrada da turbina [K]

  // Eficiências isentrópicas
  eta_c: number;         // Eficiência do compressor [0-1]
  eta_t: number;         // Eficiência da turbina [0-1]
  eta_comb: number;      // Eficiência de combustão [0-1]
  eta_mec: number;       // Eficiência mecânica [0-1]
  eta_gen: number;       // Eficiência do gerador [0-1]

  // Regenerador
  efetividade_regen: number; // Efetividade do regenerador [0-1]

  // Câmara de combustão
  perda_carga_cc: number; // Perda de carga na CC [0-1]

  // Modo de operação
  mode: SimulationMode;
  potencia_alvo_kW?: number;     // [kW] — para modo reverso
  vazao_massica_kgs?: number;    // [kg/s] — para modo direto massa
  vazao_volumetrica_m3s?: number; // [m³/s] — para modo direto volumétrico

  // Mecânica
  rpm_turbina: number;
  rpm_gerador: number;
  d_eixo_mm?: number;            // Diâmetro do eixo [mm] (opcional)
}

// --- Estado Termodinâmico ---
export interface ThermodynamicState {
  T_K: number;    // Temperatura [K]
  P_kPa: number;  // Pressão [kPa]
  h_kJkg: number; // Entalpia [kJ/kg]
  s_kJkgK: number; // Entropia [kJ/kg·K]
}

// --- Resultados do Ciclo Termodinâmico ---
export interface CycleResults {
  // 6 pontos do ciclo
  point1: ThermodynamicState;
  point2: ThermodynamicState;
  point3: ThermodynamicState;
  point4: ThermodynamicState;
  point5: ThermodynamicState;
  point6: ThermodynamicState;

  // Trabalhos específicos [kJ/kg]
  w_comp: number;
  w_turb: number;
  w_liq_esp: number;

  // Trocas de calor [kJ/kg]
  q_in: number;
  q_rej: number;
  q_regen: number;

  // Indicadores de desempenho
  bwr: number;           // Back Work Ratio [%]
  eficiencia: number;    // Eficiência térmica [%]
  erro_1a_lei: number;   // Verificação 1ª Lei [%]

  // Vazões
  m_ar_kgs: number;      // Vazão mássica de ar [kg/s]
  m_ar_kgh: number;
}

// --- Resultados por Combustível ---
export interface FuelResults {
  fuel: Fuel;
  cycle: CycleResults;

  // Potência
  potencia_final_kW: number;

  // Consumo de combustível
  m_comb_kgs: number;       // [kg/s]
  consumo_kgh: number;      // [kg/h]
  consumo_m3h: number;      // [m³/h]

  // Financeiro
  custo_hora_BRL: number;
  custo_mes_BRL: number;
  custo_MWh_BRL: number;

  // Câmara de combustão
  chamber: CombustionChamberResults;

  // Mecânica
  mechanical: MechanicalResults;

  // Emissões
  emissao_co2_kg_h: number;
}

// --- Câmara de Combustão ---
export interface CombustionChamberResults {
  FAR: number;               // Relação combustível/ar
  phi: number;               // Razão de equivalência
  T_chama_K: number;         // Temperatura da chama [K]
  T4_status: 'OK' | 'WARNING' | 'EXCEEDED';

  d_camara_mm: number;       // Diâmetro [mm]
  L_camara_mm: number;       // Comprimento [mm]
  V_camara_cm3: number;      // Volume [cm³]
  Qi_MW_m3_atm: number;      // Intensidade de combustão
}

// --- Mecânica / Eixo ---
export interface MechanicalResults {
  // Torque
  torque_turbina_Nm: number;
  torque_gerador_Nm: number;
  relacao_transmissao: number;

  // Eixo (se calculado)
  shaft?: ShaftResults;
}

export interface ShaftResults {
  d_min_mm: number;
  FS_goodman: number;
  FS_estatico: number;
  status: 'APROVADO' | 'REPROVADO';
  Nc_rpm: number;
  margem_critica_pct: number;
  sigma_a_MPa: number;
  tau_m_MPa: number;
  Se_corrigido_MPa: number;
}

// --- Resultado Completo da Simulação ---
export interface SimulationResults {
  inputs: SimulationInputs;
  timestamp: string;
  fuels: {
    biogas?: FuelResults;
    biomethane?: FuelResults;
    hydrogen?: FuelResults;
  };
  validation?: ValidationResults;
}

// --- Validação ---
export interface ValidationResults {
  converged: boolean;
  iterations?: number;
  residual?: number;
  warnings: string[];
  errors: string[];
}

// --- Projeto Supabase ---
export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  input_data: SimulationInputs;
  output_results: SimulationResults;
  created_at: string;
  updated_at: string;
}

// --- Histórico ---
export interface SimulationHistory {
  id: string;
  project_id: string;
  fuel_type: FuelId;
  results: FuelResults;
  created_at: string;
}

// --- UI State ---
export interface UIState {
  activeTab: FuelId;
  isLoading: boolean;
  error: string | null;
  results: SimulationResults | null;
}
