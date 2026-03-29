// ============================================================
// API ROUTE: POST /api/simulate
// Executa a simulação do Ciclo Brayton para todos os combustíveis
// Desenvolvido por Eng. Leonardo Pedrini
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { runSimulation } from '@/lib/logic/simulator';
import type { SimulationInputs } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const inputs = body as SimulationInputs;

    // Validações básicas
    if (!inputs.T1_K || inputs.T1_K < 250 || inputs.T1_K > 400) {
      return NextResponse.json(
        { error: 'T1 deve estar entre 250 K e 400 K' },
        { status: 400 }
      );
    }
    if (!inputs.RP_c || inputs.RP_c < 1.1 || inputs.RP_c > 15) {
      return NextResponse.json(
        { error: 'Razão de pressão deve estar entre 1.1 e 15' },
        { status: 400 }
      );
    }
    if (!inputs.T4_K || inputs.T4_K < 500 || inputs.T4_K > 2000) {
      return NextResponse.json(
        { error: 'TIT deve estar entre 500 K e 2000 K' },
        { status: 400 }
      );
    }

    // Executa a simulação
    const results = runSimulation(inputs);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('[/api/simulate] Erro:', error);
    return NextResponse.json(
      { error: 'Erro interno na simulação. Verifique os parâmetros.' },
      { status: 500 }
    );
  }
}

// CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
