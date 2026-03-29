// ============================================================
// SIMULADOR PRINCIPAL — Orquestração completa v2
// Desenvolvido por Eng. Leonardo Pedrini
// ============================================================

import { simulateBraytonCycle } from './thermodynamics';
import { sizeCombustionChamber, calcFuelConsumption } from './combustion';
import { calcMechanicalResults } from './mechanical';
import { calcTransmission, type TransmissionResults } from './transmission';
import { calcExhaust, type ExhaustResults } from './exhaust';
import { calcFinancials, type FinancialResults, type FinancialParams } from './financial';
import { FUELS, DEFAULT_FINANCIAL, TURBOCOMPRESSORES, VALIDATION_PROFILES } from './data';
import type { SimulationInputs, SimulationResults, FuelResults } from '@/lib/types';

export interface ExtendedFuelResults extends FuelResults {
  transmission: TransmissionResults;
  exhaust: ExhaustResults;
  financial: FinancialResults;
}

export interface ExtendedSimulationResults extends Omit<SimulationResults, 'fuels'> {
  fuels: {
    biogas?: ExtendedFuelResults;
    biomethane?: ExtendedFuelResults;
    hydrogen?: ExtendedFuelResults;
  };
  turbocharger?: (typeof TURBOCOMPRESSORES)[0];
  operation_mode?: string;
  validation_example?: string;
}

type FullInputs = SimulationInputs & {
  operation_mode?: string;
  validation_example?: string;
  turbocharger_id?: string;
  custo_biogas_m3?: number;
  custo_biomethane_m3?: number;
  custo_hydrogen_m3?: number;
  financial?: FinancialParams;
  shaft_material_id?: string;
};

function simulateOneFuel(
  inputs: SimulationInputs,
  fuelId: keyof typeof FUELS,
  custo_m3_override?: number,
  financialParams?: FinancialParams
): ExtendedFuelResults {
  const fuel = { ...FUELS[fuelId] };
  if (custo_m3_override !== undefined) fuel.costPerM3 = custo_m3_override;

  const cycle = simulateBraytonCycle(inputs);
  const potencia_kW = cycle.m_ar_kgs * cycle.w_liq_esp * inputs.eta_mec * inputs.eta_gen;
  const chamber = sizeCombustionChamber(cycle, fuel, inputs.eta_comb);
  const consumption = calcFuelConsumption(cycle, fuel, inputs.eta_comb);
  const mechanical = calcMechanicalResults(potencia_kW, inputs);
  const transmission = calcTransmission(inputs.rpm_turbina, inputs.rpm_gerador, potencia_kW * 1000);
  const exhaust = calcExhaust(cycle, fuel, consumption.m_comb_kgs);
  const fp = financialParams ?? (DEFAULT_FINANCIAL as FinancialParams);
  const financial = calcFinancials(potencia_kW, consumption.custo_hora_BRL, fp);

  return { fuel, cycle, potencia_final_kW: potencia_kW, ...consumption, chamber, mechanical, transmission, exhaust, financial };
}

export function runSimulation(inputs: FullInputs): ExtendedSimulationResults {
  const warnings: string[] = [];
  const errors: string[] = [];

  let finalInputs: SimulationInputs = { ...inputs };

  if (inputs.operation_mode === 'validation' && inputs.validation_example) {
    const profile = VALIDATION_PROFILES[inputs.validation_example as keyof typeof VALIDATION_PROFILES];
    if (profile) {
      finalInputs = {
        ...finalInputs,
        T1_K: profile.T1_K, P1_kPa: profile.P1_kPa, RP_c: profile.RP_c, T4_K: profile.T4_K,
        eta_c: profile.eta_c, eta_t: profile.eta_t, eta_comb: profile.eta_comb,
        eta_mec: profile.eta_mec, eta_gen: profile.eta_gen,
        efetividade_regen: profile.efetividade_regen, perda_carga_cc: profile.perda_carga_cc,
      };
      warnings.push(`Modo de validação: "${profile.label}". Eficiências definidas pelo exemplo do livro.`);
    }
  }

  const tc = inputs.turbocharger_id ? TURBOCOMPRESSORES.find(t => t.id === inputs.turbocharger_id) : undefined;
  if (tc && finalInputs.RP_c > tc.rp_max) warnings.push(`RP_c = ${finalInputs.RP_c} excede o máximo do ${tc.modelo} (${tc.rp_max}).`);
  if (finalInputs.T4_K > 1223.15) warnings.push(`TIT = ${(finalInputs.T4_K - 273.15).toFixed(1)}°C excede o limite automotivo de 950°C.`);

  const cycle_test = simulateBraytonCycle(finalInputs);
  if (cycle_test.w_liq_esp <= 0) errors.push('Ciclo não convergiu: trabalho líquido negativo. Aumente TIT ou reduza RP_c.');

  const fp = inputs.financial ?? (DEFAULT_FINANCIAL as FinancialParams);

  return {
    inputs: finalInputs,
    timestamp: new Date().toISOString(),
    turbocharger: tc,
    operation_mode: inputs.operation_mode,
    validation_example: inputs.validation_example,
    fuels: errors.length === 0 ? {
      biogas: simulateOneFuel(finalInputs, 'biogas', inputs.custo_biogas_m3, fp),
      biomethane: simulateOneFuel(finalInputs, 'biomethane', inputs.custo_biomethane_m3, fp),
      hydrogen: simulateOneFuel(finalInputs, 'hydrogen', inputs.custo_hydrogen_m3, fp),
    } : {},
    validation: { converged: errors.length === 0, warnings, errors },
  };
}
