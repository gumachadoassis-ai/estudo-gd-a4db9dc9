import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import logoGd from '@/assets/logo-gd.png';
import type { Relatorio, BlocoId } from './types';
import { BLOCO_LABELS } from './types';
import STEPIMEGrid from './STEPIMEGrid';
import { formatarMoeda } from './analysis';
import { useCountUp } from '@/hooks/useCountUp';
import MethodologySection from './MethodologySection';
import ExportPDF from './ExportPDF';
import ProductCatalog from './ProductCatalog';
import BudgetDocument from './BudgetDocument';

interface ReportPhaseProps {
  relatorio: Relatorio;
}

const ReportPhase = ({ relatorio }: ReportPhaseProps) => {
  const { financeiro, nomeClinica, nivelRecomendado, blocos, blocoScores, overallScore, matrix } = relatorio;
  const animMinimo = useCountUp(financeiro.perdidoMinimoMes, 2000);
  const animMaximo = useCountUp(financeiro.perdidoMaximoMes, 2000);
  const dataAtual = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  // Gráfico: receita atual vs mínimo ideal vs potencial máximo, progressivo mês a mês
  const barData = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => {
      const progressFactor = (i + 1) / 12; // cresce linearmente de ~8% a 100%
      return {
        mes: `M${i + 1}`,
        atual: financeiro.faturamentoMensalNum,
        minimo: financeiro.faturamentoMensalNum + Math.round(financeiro.perdidoMinimoMes * progressFactor),
        maximo: financeiro.faturamentoMensalNum + Math.round(financeiro.perdidoMaximoMes * progressFactor),
      };
    }), [financeiro]);

  const blocoIds: BlocoId[] = ['demanda', 'posicionamento', 'atendimento', 'conversao'];

  // Procedimentos perdidos no cenário mínimo (para display)
  const procPerdidosMinimo = financeiro.procedimentosMinimo - financeiro.procedimentosAtuais;
  const procPerdidosMaximo = financeiro.procedimentosMaximo - financeiro.procedimentosAtuais;

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <section className="bg-surface-dark py-16 md:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <a href="https://guellesdelgado.lovable.app"><img src={logoGd} alt="GD Co." className="h-8 w-8 rounded" /></a>
            <span className="text-[10px] tracking-[0.25em] uppercase text-primary-foreground/40 font-display">
              Estudo de Caso
            </span>
          </div>

          <p className="text-sm text-primary-foreground/50 font-body mb-1">Relatório gerado para</p>
          <h1 className="text-2xl md:text-3xl font-bold text-primary-foreground font-display">{nomeClinica}</h1>
          <p className="text-[10px] text-primary-foreground/30 mt-2 font-body tracking-wider">{dataAtual}</p>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Mínimo ideal */}
            <div className="bg-primary-foreground/[0.04] border border-primary-foreground/10 rounded-2xl p-6">
              <p className="text-[10px] tracking-[0.2em] uppercase text-amber-500 font-display mb-3">
                Mínimo ideal perdido
              </p>
              <p className="text-2xl md:text-3xl font-bold text-primary font-display animate-counter-tick">
                {formatarMoeda(animMinimo)}
              </p>
              <p className="text-primary-foreground/40 text-[10px] font-body mt-2">
                /mês · {Math.max(procPerdidosMinimo, 0)} proc. × {formatarMoeda(financeiro.ticketMedio)} · conv. {(financeiro.conversaoMinima * 100).toFixed(0)}%
              </p>
            </div>
            {/* Potencial máximo */}
            <div className="bg-primary-foreground/[0.04] border border-status-critical/20 rounded-2xl p-6">
              <p className="text-[10px] tracking-[0.2em] uppercase text-status-critical font-display mb-3">
                Potencial máximo escalável
              </p>
              <p className="text-2xl md:text-3xl font-bold text-status-critical font-display animate-counter-tick">
                {formatarMoeda(animMaximo)}
              </p>
              <p className="text-primary-foreground/40 text-[10px] font-body mt-2">
                /mês · {Math.max(procPerdidosMaximo, 0)} proc. × {formatarMoeda(financeiro.ticketMedio)} · conv. {(financeiro.conversaoMaxima * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Export bar */}
      <div className="bg-background py-5 px-4 flex justify-center border-b border-border">
        <ExportPDF targetId="budget-document" filename={`orcamento-${nomeClinica.toLowerCase().replace(/\s+/g, '-')}`} />
      </div>

      <div id="report-content">

        {/* ═══ CONSTRUÇÃO DE HIPÓTESES — Matriz STEP × IME ═══ */}
        <STEPIMEGrid matrix={matrix} />

        {/* ═══ IMPACTO FINANCEIRO ═══ */}
        <section className="bg-surface-dark py-14 px-4">
          <div className="max-w-4xl mx-auto">
            <p className="text-[10px] tracking-[0.2em] uppercase text-primary-foreground/40 font-display mb-1 text-center">Impacto Financeiro</p>
            <h2 className="text-xl md:text-2xl font-bold text-primary-foreground mb-10 text-center font-display">Projeção de Recuperação de Receita</h2>

            <div className="bg-primary-foreground/[0.04] border border-primary-foreground/10 rounded-2xl p-8 text-center mb-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-primary-foreground/40 font-display mb-2">Perda Mínima Ideal / mês</p>
                  <p className="text-3xl md:text-4xl font-bold text-primary font-display">{formatarMoeda(financeiro.perdidoMinimoMes)}</p>
                  <p className="text-[10px] text-primary-foreground/30 mt-1 font-body">Anual: {formatarMoeda(financeiro.perdidoMinimoAno)}</p>
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-primary-foreground/40 font-display mb-2">Potencial Máximo / mês</p>
                  <p className="text-3xl md:text-4xl font-bold text-primary-foreground font-display">{formatarMoeda(financeiro.perdidoMaximoMes)}</p>
                  <p className="text-[10px] text-primary-foreground/30 mt-1 font-body">Anual: {formatarMoeda(financeiro.perdidoMaximoAno)}</p>
                </div>
              </div>
              <p className="text-[10px] text-primary-foreground/30 mt-6 font-body tracking-wider">
                {financeiro.leadsMesEstimado} leads/mês · conversão atual {(financeiro.conversaoAtual * 100).toFixed(0)}% → mínimo {(financeiro.conversaoMinima * 100).toFixed(0)}% / máximo {(financeiro.conversaoMaxima * 100).toFixed(0)}%
              </p>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <XAxis dataKey="mes" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6B7280', fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(v: number) => formatarMoeda(v)}
                    labelFormatter={(l) => `Mês ${l.replace('M', '')}`}
                    contentStyle={{ backgroundColor: 'hsl(40, 7%, 14%)', border: 'none', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                  />
                  <Bar dataKey="atual" fill="#4B5563" name="Atual" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="minimo" fill="hsl(37, 91%, 55%)" name="Mínimo Ideal" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="maximo" fill="hsl(150, 60%, 45%)" name="Potencial Máximo" radius={[3, 3, 0, 0]} />
                  <ReferenceLine x="M1" stroke="hsl(0, 84%, 60%)" strokeDasharray="3 3" label={{ value: "Hoje", fill: 'hsl(0, 84%, 60%)', fontSize: 10 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* ═══ NOSSA METODOLOGIA ═══ */}
        <MethodologySection />

        {/* ═══ ANÁLISE MATEMÁTICA — Diagnóstico de Maturidade ═══ */}
        <section className="bg-background py-14 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-10 text-center">
              <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-display mb-1">Análise Matemática</p>
              <h2 className="text-xl md:text-2xl font-bold text-foreground font-display">Diagnóstico de Maturidade e Recomendação</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {([1, 2, 3] as const).map((nivel) => {
                const isActive = nivelRecomendado === nivel;
                const nivelLabel = nivel === 1 ? 'Implementação' : nivel === 2 ? 'Maturação' : 'Escala';
                const nivelDesc = nivel === 1
                  ? 'Estruturação base dos processos comerciais e de demanda'
                  : nivel === 2
                  ? 'Otimização e padronização dos processos existentes'
                  : 'Escala com automação e performance avançada';
                return (
                  <div key={nivel} className={`rounded-2xl p-6 text-center border ${isActive ? 'bg-primary/[0.08] border-primary/30' : 'bg-card border-border'}`}>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-display mb-2">Nível {nivel}</p>
                    <p className={`text-xl font-bold font-display ${isActive ? 'text-primary' : 'text-foreground'}`}>{nivelLabel}</p>
                    <p className="text-[11px] text-muted-foreground mt-2">{nivelDesc}</p>
                    {isActive && (
                      <p className="text-[9px] mt-3 text-primary font-bold uppercase tracking-wider">Recomendado para esta operação</p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Score breakdown */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Scores por bloco</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {blocoIds.map((id) => (
                  <div key={id} className="text-center">
                    <p className={`text-2xl font-bold font-display ${blocoScores[id] >= 70 ? 'text-emerald-500' : blocoScores[id] >= 45 ? 'text-amber-500' : 'text-orange-500'}`}>
                      {blocoScores[id]}%
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">{BLOCO_LABELS[id].title}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ CATÁLOGO DE SERVIÇOS ═══ */}
        <ProductCatalog nivelRecomendado={nivelRecomendado} financeiro={financeiro} />
      </div>

      {/* Hidden budget document for PDF export */}
      <div id="budget-document" className="hidden">
        <BudgetDocument relatorio={relatorio} />
      </div>

      {/* Footer */}
      <footer className="bg-surface-dark border-t border-primary-foreground/5 py-8 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="https://guellesdelgado.lovable.app"><img src={logoGd} alt="GD Co." className="h-7 w-7 rounded" /></a>
            <div>
              <p className="text-[10px] text-primary-foreground/40 font-display tracking-wider">GUELLES & DELGADO CO.</p>
              <p className="text-[9px] text-primary-foreground/20 font-body">Estrutura comercial para clínicas de alto valor</p>
            </div>
          </div>
          <p className="text-[9px] text-primary-foreground/20 font-body">{dataAtual}</p>
        </div>
      </footer>
    </div>
  );
};

export default ReportPhase;
