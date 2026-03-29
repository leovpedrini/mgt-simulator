// ============================================================
// ANÁLISE FINANCEIRA — MGT Simulator
// Desenvolvido por Eng. Leonardo Pedrini
// ============================================================

export interface FinancialParams {
  tarifa_base: number;
  pis_cofins_pct: number;
  icms_pct: number;
  desc_gd_pct: number;
  fio_b: number;
  horas_mes: number;
  disponibilidade_pct: number;
  investimento_BRL: number;
  modalidade: 'residencial' | 'comercial' | 'industrial_a4';
}

export interface FinancialResults {
  TA: number;
  TF: number;
  pot_efetiva_kW: number;
  receita_hora: number;
  receita_mes: number;
  receita_ano: number;
  custo_comb_mes: number;
  resultado_liq_mes: number;
  payback_meses: number;
  roi_anual_pct: number;
  cash_flow: number[];
}

export function calcTarifa(params: FinancialParams): { TA: number; TF: number } {
  const TA = params.tarifa_base * (1 + params.pis_cofins_pct / 100) / (1 - params.icms_pct / 100);
  const TF = TA * (1 - params.desc_gd_pct / 100) - params.fio_b;
  return { TA, TF };
}

export function calcFinancials(
  potencia_kW: number,
  custo_hora_BRL: number,
  params: FinancialParams
): FinancialResults {
  const { TA, TF } = calcTarifa(params);
  const disponibilidade = params.disponibilidade_pct / 100;
  const pot_efetiva = potencia_kW * disponibilidade;
  const receita_hora = pot_efetiva * TF;
  const receita_mes = receita_hora * params.horas_mes;
  const receita_ano = receita_mes * 12;
  const custo_comb_mes = custo_hora_BRL * params.horas_mes * disponibilidade;
  const resultado_liq_mes = receita_mes - custo_comb_mes;
  const payback_meses = resultado_liq_mes > 0 ? params.investimento_BRL / resultado_liq_mes : Infinity;
  const roi_anual_pct = (resultado_liq_mes * 12 / params.investimento_BRL) * 100;

  const cash_flow: number[] = [];
  let acumulado = -params.investimento_BRL;
  for (let mes = 1; mes <= 24; mes++) {
    acumulado += resultado_liq_mes;
    cash_flow.push(acumulado);
  }

  return { TA, TF, pot_efetiva_kW: pot_efetiva, receita_hora, receita_mes, receita_ano, custo_comb_mes, resultado_liq_mes, payback_meses, roi_anual_pct, cash_flow };
}
