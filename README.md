# MGT Simulator — Microturbinas a Gás

Simulador de dimensionamento de microturbinas a gás com **Ciclo Brayton Regenerativo**.

**Desenvolvido por Eng. Leonardo Pedrini**

## Stack

- **Frontend:** Next.js 14 + React + Tailwind CSS (design neumórfico)
- **Backend:** Node.js (API Routes do Next.js)
- **Banco de Dados:** Supabase (PostgreSQL)
- **Gráficos:** Plotly.js (Diagrama T-s interativo)

## Combustíveis suportados

| Combustível | PCI | Composição |
|-------------|-----|------------|
| Biogás | 20.223 kJ/kg | 60% CH₄ + 35% CO₂ + 5% N₂ |
| Biometano | 48.814 kJ/kg | 97% CH₄ + 2% C₂H₆ + 1% N₂ |
| Hidrogênio | 120.000 kJ/kg | H₂ puro (99.9%) |

## Início rápido

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.local.example .env.local
# Edite .env.local com suas credenciais do Supabase

# 3. Executar em desenvolvimento
npm run dev

# 4. Acessar em http://localhost:3000
```

## Configurar Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Execute o script `lib/supabase/schema.sql` no SQL Editor
3. Copie as credenciais para `.env.local`

## Módulos de Cálculo

- `lib/logic/airProperties.ts` — Propriedades do ar real (substituto do CoolProp)
- `lib/logic/thermodynamics.ts` — Ciclo Brayton Regenerativo
- `lib/logic/combustion.ts` — Estequiometria e câmara de combustão
- `lib/logic/mechanical.ts` — Torque e análise do eixo (critério Goodman)
- `lib/logic/simulator.ts` — Orquestração de todos os módulos

## Modos de Operação

- **Modo Reverso:** Defina a potência alvo → calcula a vazão de ar necessária
- **Modo Direto (massa):** Defina a vazão mássica → calcula a potência gerada
- **Modo Direto (volumétrico):** Defina a vazão volumétrica → calcula a potência gerada

## Validação

Os cálculos são validados com os exemplos do livro **Çengel & Boles, Termodinâmica, 8ª ed.**:
- Exemplo 9-8: Brayton simples ideal → η ≈ 42.6%
- Exemplo 9-9: Brayton regenerativo ideal → η ≈ 52.8%
- Exemplo 9-10: Ciclo real irreversível → η ≈ 36.2%

---

*Desenvolvido por Eng. Leonardo Pedrini — Mestrado em Engenharia*
