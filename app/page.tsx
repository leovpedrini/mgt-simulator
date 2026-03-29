// ============================================================
// HOME PAGE — Landing da Aplicação MGT Simulator
// Desenvolvido por Eng. Leonardo Pedrini
// ============================================================

import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-bg-base bg-grid-pattern flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center relative overflow-hidden">
        {/* Gradiente de fundo */}
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />

        {/* Ícone / Logo */}
        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-3xl bg-bg-card shadow-neuro-lg flex items-center justify-center text-5xl">
            ⚙️
          </div>
          <div className="absolute -inset-2 rounded-3xl border border-accent-blue/20 animate-pulse-slow" />
        </div>

        <div className="relative space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-blue/10 border border-accent-blue/20 text-accent-blue text-xs font-semibold tracking-wide">
            🔬 Ciclo Brayton Regenerativo
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold font-display text-text-primary leading-tight">
            MGT{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-blue to-accent-cyan">
              Simulator
            </span>
          </h1>

          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Dimensionamento de microturbinas a gás com ciclo Brayton regenerativo.
            Análise termodinâmica, mecânica e econômica para{' '}
            <span className="text-accent-green">Biogás</span>,{' '}
            <span className="text-accent-blue">Biometano</span> e{' '}
            <span className="text-accent-cyan">Hidrogênio</span>.
          </p>
        </div>

        {/* CTA */}
        <div className="relative flex flex-col sm:flex-row gap-4 mt-10">
          <Link
            href="/simulation"
            className="px-8 py-4 rounded-2xl bg-gradient-accent text-white font-semibold shadow-neuro-lg hover:shadow-glow-blue hover:brightness-110 transition-all duration-300 text-sm"
          >
            ⚡ Iniciar Simulação
          </Link>
          <Link
            href="/dashboard"
            className="px-8 py-4 rounded-2xl bg-bg-card shadow-neuro text-text-primary font-semibold hover:shadow-neuro-lg transition-all duration-300 text-sm border border-white/10"
          >
            📊 Dashboard
          </Link>
        </div>

        {/* Features */}
        <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 max-w-4xl w-full">
          {[
            {
              icon: '🔥',
              title: 'Termodinâmica Real',
              desc: 'Propriedades do ar real (Cp variável) com polinômios NASA. Validado com exemplos do Çengel & Boles.',
            },
            {
              icon: '⚙️',
              title: 'Análise Mecânica',
              desc: 'Cálculo de torque, dimensionamento do eixo pelo critério de Goodman e velocidade crítica.',
            },
            {
              icon: '💰',
              title: 'Análise Econômica',
              desc: 'Custo operacional horário, mensal e por MWh. Emissões de CO₂ por combustível.',
            },
          ].map(({ icon, title, desc }) => (
            <div
              key={title}
              className="bg-bg-card shadow-neuro rounded-2xl p-6 text-left border border-white/5 hover:shadow-neuro-lg transition-all duration-300"
            >
              <div className="text-3xl mb-3">{icon}</div>
              <h3 className="font-semibold text-text-primary mb-2">{title}</h3>
              <p className="text-sm text-text-secondary">{desc}</p>
            </div>
          ))}
        </div>

        {/* Combustíveis suportados */}
        <div className="relative flex gap-6 mt-10">
          {[
            { color: '#22c55e', label: 'Biogás', formula: '60% CH₄' },
            { color: '#3b82f6', label: 'Biometano', formula: '97% CH₄' },
            { color: '#06b6d4', label: 'Hidrogênio', formula: 'H₂ puro' },
          ].map(({ color, label, formula }) => (
            <div key={label} className="flex items-center gap-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-text-secondary">
                <strong style={{ color }} className="font-semibold">{label}</strong>
                {' '}— {formula}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
