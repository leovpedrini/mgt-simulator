// ============================================================
// SIMULADOR PRINCIPAL — Orquestração de todos os módulos
// Desenvolvido por Eng. Leonardo Pedrini
// ============================================================

import { simulateBraytonCycle } from './thermodynamics';
import { sizeCombustionChamber, calcFuelConsumption } from './combustion';
import { calcMechanicalResults } from './mechanical';
import { FUELS } from './data';
import type {
  SimulationInputs,
  SimulationResults,
  FuelResults,
} from '@/lib/types';

/**
 * Executa a simulação completa para um único combustível
 */
function simulateOneFuel(
  inputs: SimulationInputs,
  fuelId: keyof typeof FUELS
): FuelResults {
  const fuel = FUELS[fuelId];

  // 1. Ciclo termodinâmico (independente do combustível para o ar)
  const cycle = simulateBraytonCycle(inputs);

  // 2. Potência final
  const potencia_kW =
    cycle.m_ar_kgs * cycle.w_liq_esp * inputs.eta_mec * inputs.eta_gen;

  // 3. Câmara de combustão
  const chamber = sizeCombustionChamber(cycle, fuel, inputs.eta_comb);

  // 4. Consumo e custos
  const consumption = calcFuelConsumption(cycle, fuel, inputs.eta_comb);

  // 5. Mecânica
  const mechanical = calcMechanicalResults(potencia_kW, inputs);

  return {
    fuel,
    cycle,
    potencia_final_kW: potencia_kW,
    ...consumption,
    chamber,
    mechanical,
  };
}

/**
 * Executa a simulação completa para todos os 3 combustíveis
 */
export function runSimulation(inputs: SimulationInputs): SimulationResults {
  const warnings: string[] = [];

  // Validações de entrada
  if (inputs.T4_K > 1223.15) {
    warnings.push(
      `TIT = ${(inputs.T4_K - 273.15).toFixed(1)}°C excede o limite automotivo de 950°C. Resultados para fins acadêmicos.`
    );
  }
  if (inputs.RP_c < 1.5 || inputs.RP_c > 10) {
    warnings.push(`Razão de pressão ${inputs.RP_c} fora da faixa típica [1.5–10].`);
  }

  const results: SimulationResults = {
    inputs,
    timestamp: new Date().toISOString(),
    fuels: {
      biogas: simulateOneFuel(inputs, 'biogas'),
      biomethane: simulateOneFuel(inputs, 'biomethane'),
      hydrogen: simulateOneFuel(inputs, 'hydrogen'),
    },
    validation: {
      converged: true,
      warnings,
      errors: [],
    },
  };

  return results;
}
