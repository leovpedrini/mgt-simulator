// ============================================================
// SUPABASE CLIENT — Configuração e helpers
// Desenvolvido por Eng. Leonardo Pedrini
// ============================================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] Variáveis de ambiente não configuradas. ' +
    'Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY em .env.local'
  );
}

// Cliente para uso no browser (componentes React)
export const supabase = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder-key'
);

// Tipos do banco de dados (gerado pelo Supabase CLI)
export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          input_data: Record<string, unknown>;
          output_results: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['projects']['Row'],
          'id' | 'created_at' | 'updated_at'
        >;
        Update: Partial<Database['public']['Tables']['projects']['Insert']>;
      };
      simulation_history: {
        Row: {
          id: string;
          project_id: string;
          fuel_type: 'biogas' | 'biomethane' | 'hydrogen';
          results: Record<string, unknown>;
          created_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['simulation_history']['Row'],
          'id' | 'created_at'
        >;
        Update: Partial<Database['public']['Tables']['simulation_history']['Insert']>;
      };
    };
  };
};
