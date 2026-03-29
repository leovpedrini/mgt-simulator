// ============================================================
// API ROUTE: /api/projects
// GET: lista projetos do usuário | POST: salva novo projeto
// Desenvolvido por Eng. Leonardo Pedrini
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Supabase não configurado. Configure .env.local');
  }
  return createClient(url, key);
}

// GET /api/projects — lista projetos do usuário
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServer();
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Verificar token JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const { data: projects, error } = await supabase
      .from('projects')
      .select('id, name, description, created_at, updated_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ projects }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/projects]', error);
    return NextResponse.json({ error: 'Erro ao buscar projetos' }, { status: 500 });
  }
}

// POST /api/projects — salva novo projeto
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServer();
    const authHeader = request.headers.get('Authorization');

    // Modo sem autenticação (desenvolvimento)
    if (!authHeader) {
      const body = await request.json();
      return NextResponse.json({
        message: 'Projeto salvo localmente (modo dev sem auth)',
        project: { id: 'local-' + Date.now(), ...body },
      }, { status: 201 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, input_data, output_results } = body;

    if (!name) {
      return NextResponse.json({ error: 'Nome do projeto é obrigatório' }, { status: 400 });
    }

    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        name,
        description,
        input_data: input_data ?? {},
        output_results: output_results ?? {},
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/projects]', error);
    return NextResponse.json({ error: 'Erro ao salvar projeto' }, { status: 500 });
  }
}
