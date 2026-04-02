import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend, ReferenceLine } from 'recharts';
import logoGd from '@/assets/logo-gd.png';
import type { Relatorio } from './types';
import { formatarMoeda } from './analysis';
import { useCountUp } from '@/hooks/useCountUp';
import GaugeSVG from './GaugeSVG';
import PilarCard from './PilarCard';
import FunnelChart from './FunnelChart';
import DashboardBI from './DashboardBI';
import ExportPDF from './ExportPDF';
import ProductCatalog from './ProductCatalog';
import BudgetDocument from './BudgetDocument';

interface ReportPhaseProps {
  relatorio: Relatorio;
}

const ReportPhase = ({ relatorio }: ReportPhaseProps) => {
  const { financeiro, pilares, nomeClinica, especialidade, cidade, nivelRecomendado } = relatorio;
  const retornoEstimado = financeiro.faturamentoPerdidoMes * 3;
  const animPerdidoMes = useCountUp(financeiro.faturamentoPerdidoMes, 2000);
  const dataAtual = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  const barData = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      mes: `M${i + 1}`,
      atual: financeiro.faturamentoAtualNum,
      potencial: financeiro.faturamentoAtualNum + Math.round(financeiro.faturamentoPerdidoMes * (i + 1) / 12),
    })), [financeiro]);

  const radarData = useMemo(() => [
    { subject: 'Posicionamento', atual: pilares.posicionamento.score, benchmark: 85 },
    { subject: 'Tráfego', atual: pilares.performance.score, benchmark: 80 },
    { subject: 'Atendimento', atual: pilares.atendimento.score, benchmark: 88 },
    { subject: 'Conversão', atual: Math.round(pilares.atendimento.score * 0.8), benchmark: 82 },
    { subject: 'Follow-up', atual: Math.round(pilares.atendimento.score * 0.6), benchmark: 79 },
    { subject: 'CRM / Dados', atual: 18, benchmark: 85 },
  ], [pilares]);

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <section className="bg-surface-dark py-16 md:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <img src={logoGd} alt="GD Co." className="h-8 w-8 rounded" />
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
        <DashboardBI relatorio={relatorio} />

        {/* Gauges */}
        <section className="bg-card py-14 px-4">
          <div className="max-w-4xl mx-auto">
            <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-display mb-1 text-center">Análise Tripartida</p>
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

        {/* Radar */}
        <section className="bg-card py-14 px-4">
          <div className="max-w-4xl mx-auto">
            <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-display mb-1 text-center">Maturidade Operacional</p>
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-10 text-center font-display">Mapa de Competências</h2>
            <div className="h-80 md:h-96">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name={nomeClinica} dataKey="atual" stroke="hsl(37, 91%, 55%)" fill="hsl(37, 91%, 55%)" fillOpacity={0.12} strokeWidth={2} />
                  <Radar name="Benchmark do setor" dataKey="benchmark" stroke="hsl(142, 71%, 45%)" fill="none" strokeDasharray="5 5" strokeWidth={1.5} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Comparative Table */}
        <section className="bg-background py-14 px-4">
          <div className="max-w-4xl mx-auto">
            <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-display mb-1 text-center">Análise Comparativa</p>
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-10 text-center font-display">Cenário Atual vs. Cenário Otimizado</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left px-5 py-3.5 text-[10px] tracking-[0.15em] uppercase font-display text-status-critical bg-destructive/[0.04] rounded-tl-xl border-b border-border">Cenário Atual</th>
                    <th className="text-left px-5 py-3.5 text-[10px] tracking-[0.15em] uppercase font-display text-status-ok bg-status-ok/[0.04] rounded-tr-xl border-b border-border">Cenário Otimizado</th>
                  </tr>
                </thead>
                <tbody className="font-body text-sm">
                  {[
                    ['Tempo de resposta superior a 2 horas', 'Protocolo de resposta em menos de 5 minutos'],
                    ['Equipe comercial focada em informar preço', 'Equipe treinada em geração de valor percebido'],
                    ['Leads não retomados após primeiro contato', 'Follow-up estruturado em múltiplos pontos de contato'],
                    ['Gestão comercial sem ferramenta de CRM', 'CRM implantado com funil de vendas ativo'],
                    [`Conversão atual: ${Math.round(financeiro.taxaConversaoAtual * 100)}%`, 'Meta de conversão: 35%'],
                    ['Agenda com variação imprevisível', 'Previsibilidade operacional e de receita'],
                    ['Decisões baseadas em percepção', 'Decisões orientadas por dados e métricas'],
                    [`${formatarMoeda(financeiro.faturamentoPerdidoMes)} em receita não capturada`, 'Receita recuperada e projeção de crescimento'],
                  ].map(([atual, otimizado], i) => (
                    <tr key={i} className="border-b border-border/60 last:border-0">
                      <td className="px-5 py-3.5 text-muted-foreground text-[13px]">{atual}</td>
                      <td className="px-5 py-3.5 text-foreground text-[13px] font-medium">{otimizado}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Before/After */}
        <section className="bg-surface-dark py-14 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-primary-foreground/[0.04] border border-primary-foreground/10 rounded-2xl p-8 text-center">
                <p className="text-[10px] tracking-[0.2em] uppercase text-primary-foreground/40 font-display mb-3">Receita Atual</p>
                <p className="text-2xl md:text-3xl font-bold text-primary-foreground font-display">{formatarMoeda(financeiro.faturamentoAtualNum)}<span className="text-base font-normal text-primary-foreground/40">/mês</span></p>
                <p className="text-xs text-primary-foreground/30 mt-2 font-body">{financeiro.cirurgiasAtuais} procedimentos · {Math.round(financeiro.taxaConversaoAtual * 100)}% conversão</p>
              </div>
              <div className="bg-primary/[0.08] border border-primary/20 rounded-2xl p-8 text-center">
                <p className="text-[10px] tracking-[0.2em] uppercase text-primary/80 font-display mb-3">Projeção Otimizada</p>
                <p className="text-2xl md:text-3xl font-bold text-primary font-display">{formatarMoeda(financeiro.faturamentoAtualNum + financeiro.faturamentoPerdidoMes)}<span className="text-base font-normal text-primary/60">/mês</span></p>
                <p className="text-xs text-primary-foreground/30 mt-2 font-body">{financeiro.cirurgiasPotencial} procedimentos · 35% conversão</p>
              </div>
            </div>
          </div>
        </section>

        {/* Product Catalog (on-screen only) */}
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
            <img src={logoGd} alt="GD Co." className="h-7 w-7 rounded" />
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
