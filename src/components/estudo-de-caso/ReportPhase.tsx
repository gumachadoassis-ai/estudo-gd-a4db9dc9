import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import logoGd from '@/assets/logo-gd.png';
import type { Relatorio } from './types';
import { formatarMoeda } from './analysis';
import { useCountUp } from '@/hooks/useCountUp';
import GaugeSVG from './GaugeSVG';
import PilarCard from './PilarCard';
import FunnelChart from './FunnelChart';
import STEPMatrix from './STEPMatrix';
import MethodologySection from './MethodologySection';
import ExportPDF from './ExportPDF';
import ProductCatalog from './ProductCatalog';
import BudgetDocument from './BudgetDocument';

interface ReportPhaseProps {
  relatorio: Relatorio;
}

const ReportPhase = ({ relatorio }: ReportPhaseProps) => {
  const { financeiro, pilares, nomeClinica, especialidade, cidade, nivelRecomendado, matrix } = relatorio;
  const retornoEstimado = financeiro.faturamentoPerdidoMes * 3;
  const animPerdidoMes = useCountUp(financeiro.faturamentoPerdidoMes, 2000);
  const dataAtual = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  const barData = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      mes: `M${i + 1}`,
      atual: financeiro.faturamentoAtualNum,
      potencial: financeiro.faturamentoAtualNum + Math.round(financeiro.faturamentoPerdidoMes * (i + 1) / 12),
    })), [financeiro]);

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
          <p className="text-sm text-primary-foreground/40 mt-2 font-body">{especialidade} · {cidade}</p>
          <p className="text-[10px] text-primary-foreground/30 mt-1 font-body tracking-wider">{dataAtual}</p>

          <div className="mt-10 bg-primary-foreground/[0.04] border border-primary-foreground/10 rounded-2xl p-8 max-w-xl mx-auto">
            <p className="text-[10px] tracking-[0.2em] uppercase text-status-critical font-display mb-3">
              Receita não capturada
            </p>
            <p className="text-3xl md:text-4xl font-bold text-primary font-display animate-counter-tick">
              {formatarMoeda(animPerdidoMes)}
            </p>
            <p className="text-primary-foreground/40 text-xs font-body mt-2">
              por mês · baseado em {financeiro.cirurgiasPerdidas} procedimentos × {formatarMoeda(financeiro.ticketMedio)} ticket médio
            </p>
          </div>
        </div>
      </section>

      {/* Export bar */}
      <div className="bg-background py-5 px-4 flex justify-center border-b border-border">
        <ExportPDF targetId="budget-document" filename={`orcamento-${nomeClinica.toLowerCase().replace(/\s+/g, '-')}`} />
      </div>

      {/* Report content */}
      <div id="report-content">

        {/* ═══ CENÁRIO 1: RESULTADO DO ESTUDO — Matriz STEP × IME ═══ */}
        <STEPMatrix relatorio={relatorio} />

        {/* Gauges */}
        <section className="bg-card py-14 px-4">
          <div className="max-w-4xl mx-auto">
            <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-display mb-1 text-center">Análise por Pilar</p>
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-10 text-center font-display">Visão Geral da Operação</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <GaugeSVG score={pilares.posicionamento.score} label="Posicionamento" status={pilares.posicionamento.status} />
              <GaugeSVG score={pilares.performance.score} label="Performance" status={pilares.performance.status} />
              <GaugeSVG score={pilares.atendimento.score} label="Atendimento" status={pilares.atendimento.status} highlight />
            </div>
          </div>
        </section>

        {/* Pillar Analysis */}
        <section className="bg-background py-14 px-4">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="mb-4">
              <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-display mb-1">Análise Detalhada</p>
              <h2 className="text-xl md:text-2xl font-bold text-foreground font-display">Diagnóstico por Pilar</h2>
            </div>
            <PilarCard nome="Posicionamento" pilar={pilares.posicionamento} />
            <PilarCard nome="Performance" pilar={pilares.performance} />
            <PilarCard nome="Atendimento" pilar={pilares.atendimento} />
          </div>
        </section>

        {/* Funnel */}
        <section className="bg-card py-14 px-4">
          <div className="max-w-4xl mx-auto">
            <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-display mb-1 text-center">Mapeamento de Conversão</p>
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-10 text-center font-display">Análise de Funil Operacional</h2>
            <FunnelChart
              leadsMes={financeiro.leadsMesEstimado}
              cirurgiasAtuais={financeiro.cirurgiasAtuais}
              cirurgiasPotencial={financeiro.cirurgiasPotencial}
              cirurgiasPerdidas={financeiro.cirurgiasPerdidas}
            />
          </div>
        </section>

        {/* Financial Impact */}
        <section className="bg-surface-dark py-14 px-4">
          <div className="max-w-4xl mx-auto">
            <p className="text-[10px] tracking-[0.2em] uppercase text-primary-foreground/40 font-display mb-1 text-center">Impacto Financeiro</p>
            <h2 className="text-xl md:text-2xl font-bold text-primary-foreground mb-10 text-center font-display">Projeção de Recuperação de Receita</h2>

            <div className="bg-primary-foreground/[0.04] border border-primary-foreground/10 rounded-2xl p-8 text-center mb-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-primary-foreground/40 font-display mb-2">Perda Mensal Estimada</p>
                  <p className="text-3xl md:text-4xl font-bold text-primary font-display">{formatarMoeda(financeiro.faturamentoPerdidoMes)}</p>
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-primary-foreground/40 font-display mb-2">Projeção Anual</p>
                  <p className="text-3xl md:text-4xl font-bold text-primary-foreground font-display">{formatarMoeda(financeiro.faturamentoPerdidoAno)}</p>
                </div>
              </div>
              <p className="text-[10px] text-primary-foreground/30 mt-6 font-body tracking-wider">
                {financeiro.cirurgiasPerdidas} procedimentos/mês × {formatarMoeda(financeiro.ticketMedio)} ticket médio
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
                  <Bar dataKey="potencial" fill="hsl(37, 91%, 55%)" name="Potencial" radius={[3, 3, 0, 0]} />
                  <ReferenceLine x="M1" stroke="hsl(0, 84%, 60%)" strokeDasharray="3 3" label={{ value: "Hoje", fill: 'hsl(0, 84%, 60%)', fontSize: 10 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* ═══ CENÁRIO 2: NOSSA METODOLOGIA ═══ */}
        <MethodologySection />

        {/* ═══ CENÁRIO 3: OFERTA DE PREÇO ═══ */}
        {/* Análise matemática do nível recomendado */}
        <section className="bg-background py-14 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-10 text-center">
              <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-display mb-1">Análise Matemática</p>
              <h2 className="text-xl md:text-2xl font-bold text-foreground font-display">Diagnóstico de Maturidade e Recomendação</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {(['I', 'M', 'E'] as const).map((ime) => {
                const avg = matrix.imeAverages[ime];
                const label = ime === 'I' ? 'Implementação' : ime === 'M' ? 'Maturação' : 'Escala';
                const isActive = (ime === 'I' && nivelRecomendado === 1) ||
                                 (ime === 'M' && nivelRecomendado === 2) ||
                                 (ime === 'E' && nivelRecomendado === 3);
                return (
                  <div key={ime} className={`rounded-2xl p-6 text-center border ${isActive ? 'bg-primary/[0.08] border-primary/30' : 'bg-card border-border'}`}>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-display mb-2">{label}</p>
                    <p className={`text-3xl font-bold font-display ${isActive ? 'text-primary' : 'text-foreground'}`}>{avg}%</p>
                    <p className={`text-xs mt-1 ${avg >= 66 ? 'text-emerald-500' : avg >= 36 ? 'text-amber-500' : 'text-orange-500'}`}>
                      {avg >= 66 ? 'Consolidado' : avg >= 36 ? 'Avançando' : 'Iniciando'}
                    </p>
                    {isActive && (
                      <p className="text-[9px] mt-3 text-primary font-bold uppercase tracking-wider">Nível de intervenção recomendado</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Product Catalog */}
        <ProductCatalog nivelRecomendado={nivelRecomendado} retornoEstimado={retornoEstimado} />
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
