import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MGT Simulator — Microturbinas a Gás',
  description: 'Simulador de Ciclo Brayton Regenerativo para microturbinas a gás. Suporta Biogás, Biometano e Hidrogênio.',
  keywords: ['microturbina', 'ciclo brayton', 'termodinâmica', 'biogás', 'hidrogênio', 'engenharia'],
  authors: [{ name: 'Eng. Leonardo Pedrini' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-bg-base min-h-screen antialiased">
        {children}
        <footer className="fixed bottom-0 left-0 right-0 h-8 flex items-center justify-center bg-bg-base/80 backdrop-blur-sm border-t border-white/5 z-50">
          <p className="text-xs text-text-muted">
            Desenvolvido por{' '}
            <span className="text-text-accent font-medium">Eng. Leonardo Pedrini</span>
            {' '}·{' '}
            <span className="text-text-muted">MGT Simulator v1.0</span>
          </p>
        </footer>
      </body>
    </html>
  );
}
