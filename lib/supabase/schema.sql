-- ============================================================
-- SCHEMA SUPABASE — MGT Simulator
-- Execute este script no SQL Editor do Supabase
-- Desenvolvido por Eng. Leonardo Pedrini
-- ============================================================

-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── TABELA: projects ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.projects (
    id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name        TEXT NOT NULL,
    description TEXT,
    input_data  JSONB NOT NULL DEFAULT '{}',    -- SimulationInputs
    output_results JSONB NOT NULL DEFAULT '{}', -- SimulationResults
    created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─── TABELA: simulation_history ───────────────────────────
CREATE TABLE IF NOT EXISTS public.simulation_history (
    id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id  UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    fuel_type   TEXT CHECK (fuel_type IN ('biogas', 'biomethane', 'hydrogen')) NOT NULL,
    results     JSONB NOT NULL DEFAULT '{}',  -- FuelResults
    created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─── ÍNDICES ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_history_project_id ON public.simulation_history(project_id);

-- ─── TRIGGER: updated_at automático ───────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── ROW LEVEL SECURITY (RLS) ─────────────────────────────
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulation_history ENABLE ROW LEVEL SECURITY;

-- Políticas para projects
CREATE POLICY "Users can view their own projects"
    ON public.projects FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects"
    ON public.projects FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
    ON public.projects FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
    ON public.projects FOR DELETE
    USING (auth.uid() = user_id);

-- Políticas para simulation_history
CREATE POLICY "Users can view their simulation history"
    ON public.simulation_history FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = simulation_history.project_id
              AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert simulation history"
    ON public.simulation_history FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = simulation_history.project_id
              AND projects.user_id = auth.uid()
        )
    );

-- ─── DADOS INICIAIS (opcional) ────────────────────────────
-- Nenhum dado inicial necessário; usuários criam seus projetos.

-- ─── COMENTÁRIOS ──────────────────────────────────────────
COMMENT ON TABLE public.projects IS 'Projetos de simulação de microturbinas a gás';
COMMENT ON TABLE public.simulation_history IS 'Histórico de simulações por combustível';
COMMENT ON COLUMN public.projects.input_data IS 'SimulationInputs serializado como JSONB';
COMMENT ON COLUMN public.projects.output_results IS 'SimulationResults serializado como JSONB';
