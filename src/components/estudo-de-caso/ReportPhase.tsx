import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend, ReferenceLine } from 'recharts';
import logoGd from '@/assets/logo-gd.png';
import type { Relatorio } from './types';
import { WHATSAPP_URL } from './types';
import { formatarMoeda } from './analysis';
import { useCountUp } from '@/hooks/useCountUp';
import GaugeSVG from './GaugeSVG';
import PilarCard from './PilarCard';
import FunnelChart from './FunnelChart';
import { Download, MessageCircle } from 'lucide-react';

interface ReportPhaseProps {
  relatorio: Relatorio;
}

const ReportPhase = ({ relatorio }: ReportPhaseProps) => {
  const { financeiro, pilares, nomeClinica, especialidade, cidade } = relatorio;
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

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen">
      {/* HEADER */}
      <section className="bg-surface-dark py-16 md:py-20 px-4 no-print">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs tracking-widest uppercase text-primary-foreground/50 mb-6 font-display">
            GUELLES & DELGADO CO. · DIAGNÓSTICO ESTRATÉGICO
          </p>
          <p className="text-sm text-primary-foreground/70 font-body">Relatório gerado para:</p>
          <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mt-1 font-display">{nomeClinica}</h2>
          <p className="text-sm text-primary-foreground/60 mt-2 font-body">{especialidade} · {cidade}</p>
          <p className="text-xs text-primary-foreground/40 mt-1 font-body">{dataAtual} · Protocolo Premium Strategy</p>

          <div className="mt-8 bg-destructive/10 border border-destructive/30 rounded-xl p-6 max-w-2xl mx-auto">
            <span className="inline-block bg-destructive text-primary-foreground text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3">
              ⚠ ATENÇÃO CRÍTICA
            </span>
            <p className="text-primary-foreground/80 font-body text-sm">
              {nomeClinica} está perdendo
            </p>
            <p className="text-3xl md:text-4xl font-bold text-primary mt-2 font-display animate-counter-tick">
              {formatarMoeda(animPerdidoMes)}
            </p>
            <p className="text-primary-foreground/60 text-sm font-body mt-1">
              por mês em oportunidades de conversão não capturadas
            </p>
          </div>
        </div>
      </section>

      {/* Print Header */}
      <div className="hidden print-only pdf-page">
        <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
          <img src={logoGd} alt="GD Co." className="h-10 w-10 rounded" />
          <span className="text-xs text-muted-foreground">{dataAtual}</span>
        </div>
        <h1 className="text-xl font-bold font-display mb-1">DIAGNÓSTICO ESTRATÉGICO COMERCIAL</h1>
        <p className="text-sm text-muted-foreground font-body">{nomeClinica} · {especialidade} · {cidade}</p>
      </div>

      {/* PDF button */}
      <div className="bg-background py-4 px-4 flex justify-center no-print">
        <button onClick={handlePrint} className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold py-3 px-6 rounded-xl text-sm transition-colors">
          <Download className="h-4 w-4" /> Baixar Relatório em PDF
        </button>
      </div>

      {/* SECTION A — Gauges */}
      <section className="bg-background py-12 md:py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-8 text-center font-display">Visão Geral da Operação</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GaugeSVG score={pilares.posicionamento.score} label="Posicionamento" status={pilares.posicionamento.status} />
            <GaugeSVG score={pilares.performance.score} label="Performance" status={pilares.performance.status} />
            <GaugeSVG score={pilares.atendimento.score} label="Atendimento" status={pilares.atendimento.status} highlight />
          </div>
        </div>
      </section>

      {/* SECTION B — Pillar Analysis */}
      <section className="bg-card py-12 md:py-16 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <PilarCard nome="Posicionamento" pilar={pilares.posicionamento} />
          <PilarCard nome="Performance" pilar={pilares.performance} />
          <PilarCard nome="Atendimento" pilar={pilares.atendimento} />
        </div>
      </section>

      {/* SECTION C — Funnel */}
      <section className="bg-background py-12 md:py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-8 text-center font-display">Onde Seu Faturamento Está Sendo Perdido</h2>
          <FunnelChart
            leadsMes={financeiro.leadsMesEstimado}
            cirurgiasAtuais={financeiro.cirurgiasAtuais}
            cirurgiasPotencial={financeiro.cirurgiasPotencial}
            cirurgiasPerdidas={financeiro.cirurgiasPerdidas}
          />
        </div>
      </section>

      {/* SECTION D — Financial Impact */}
      <section className="bg-surface-dark py-12 md:py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl md:text-2xl font-bold text-primary-foreground mb-8 text-center font-display">O Custo Real da Ineficiência Comercial</h2>

          <div className="bg-surface-dark-elevated border border-border/20 rounded-2xl p-8 text-center mb-10">
            <p className="text-sm text-primary-foreground/60 font-body">Faturamento perdido por mês:</p>
            <p className="text-4xl md:text-5xl font-bold text-primary mt-2 font-display">{formatarMoeda(financeiro.faturamentoPerdidoMes)}</p>
            <p className="text-sm text-primary-foreground/60 font-body mt-4">Faturamento perdido por ano:</p>
            <p className="text-2xl font-bold text-primary-foreground mt-1 font-display">{formatarMoeda(financeiro.faturamentoPerdidoAno)}</p>
            <p className="text-xs text-primary-foreground/40 mt-4 font-body">
              Baseado em: {financeiro.cirurgiasPerdidas} cirurgias/mês × {formatarMoeda(financeiro.ticketMedio)}
            </p>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <XAxis dataKey="mes" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatarMoeda(v)} labelFormatter={(l) => `Mês ${l.replace('M', '')}`} />
                <Bar dataKey="atual" fill="#6B7280" name="Atual" radius={[2, 2, 0, 0]} />
                <Bar dataKey="potencial" fill="hsl(37, 91%, 55%)" name="Potencial" radius={[2, 2, 0, 0]} />
                <ReferenceLine x="M1" stroke="#EF4444" strokeDasharray="3 3" label={{ value: "Hoje", fill: '#EF4444', fontSize: 11 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* SECTION E — Radar */}
      <section className="bg-card py-12 md:py-16 px-4 no-print">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-8 text-center font-display">Mapa de Maturidade Operacional</h2>
          <div className="h-80 md:h-96">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--foreground))', fontSize: 11 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Sua clínica" dataKey="atual" stroke="hsl(37, 91%, 55%)" fill="hsl(37, 91%, 55%)" fillOpacity={0.15} strokeWidth={2} />
                <Radar name="Clínicas com Protocolo GD Co." dataKey="benchmark" stroke="#22C55E" fill="none" strokeDasharray="5 5" strokeWidth={2} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* SECTION F — Levels */}
      <section className="bg-surface-dark py-12 md:py-16 px-4 no-print">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs tracking-widest uppercase text-primary mb-2 text-center font-display">O PROTOCOLO GD CO.</p>
          <h2 className="text-xl md:text-2xl font-bold text-primary-foreground mb-4 text-center font-display">O Caminho Para Parar de Perder Faturamento</h2>

          <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 text-center mb-10 max-w-2xl mx-auto">
            <p className="text-sm text-primary font-semibold">⭐ RECOMENDADO PARA {nomeClinica.toUpperCase()}: NÍVEL 01</p>
            <p className="text-xs text-primary-foreground/60 mt-1 font-body">"Antes de escalar, é preciso corrigir e blindar o comercial"</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* Nível 01 */}
            <div className="bg-primary rounded-2xl p-6 text-primary-foreground transform md:scale-105 shadow-2xl">
              <span className="inline-block bg-primary-foreground/20 text-primary-foreground text-xs font-bold uppercase px-3 py-1 rounded-full mb-3">★ RECOMENDADO</span>
              <h3 className="text-lg font-bold font-display">NÍVEL 01 — IMPLEMENTAÇÃO</h3>
              <p className="text-sm text-primary-foreground/80 mt-1 font-body">Prazo: <strong>90 Dias</strong></p>
              <p className="text-2xl font-bold mt-2 font-display">R$ 15.000,00</p>
              <ul className="mt-4 space-y-2 text-sm font-body">
                {['Estudo da Base Atual', 'Treinamento da Secretária (SDR)', 'Treinamento da Gestora Comercial', 'Desenvolvimento do Funil de Vendas', 'Implantação e Treinamento de CRM', 'Prova de Capacitação (Destrava Clínicas)', 'Trabalho na Base de Leads'].map((i) => (
                  <li key={i} className="flex items-start gap-2"><span>✓</span>{i}</li>
                ))}
              </ul>
              <p className="text-xs text-primary-foreground/70 mt-4 italic font-body">Retorno estimado: {formatarMoeda(financeiro.faturamentoPerdidoMes * 3)} nos primeiros 90 dias</p>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="block mt-4 bg-primary-foreground text-primary font-bold py-3 rounded-xl text-center text-sm hover:opacity-90 transition-opacity">→ QUERO IMPLEMENTAR</a>
            </div>

            {/* Nível 02 */}
            <div className="bg-surface-dark-elevated border border-primary/30 rounded-2xl p-6 text-primary-foreground">
              <h3 className="text-lg font-bold font-display">NÍVEL 02 — MANUTENÇÃO</h3>
              <p className="text-sm text-primary-foreground/60 mt-1 font-body">Prazo: <strong>06 Meses</strong></p>
              <p className="text-2xl font-bold mt-2 text-primary font-display">R$ 24.000,00</p>
              <ul className="mt-4 space-y-2 text-sm font-body text-primary-foreground/80">
                {['Otimização Contínua de Conversão', 'One a One com time comercial', 'PDI (Plano de Desenvolvimento Individual)', 'Plano de Metas mensal', 'Metrificação de Processos', 'Novo Estudo de Caso Comercial', 'Acompanhamento Estratégico', 'Auditorias Recorrentes'].map((i) => (
                  <li key={i} className="flex items-start gap-2"><span className="text-primary">✓</span>{i}</li>
                ))}
              </ul>
              <p className="text-xs text-primary-foreground/50 mt-3 italic font-body">Inclui tudo do Nível 01</p>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="block mt-4 border border-primary text-primary font-bold py-3 rounded-xl text-center text-sm hover:bg-primary/10 transition-colors">→ QUERO SABER MAIS</a>
            </div>

            {/* Nível 03 */}
            <div className="bg-surface-dark-elevated border border-border/30 rounded-2xl p-6 text-primary-foreground">
              <span className="inline-block bg-primary-foreground/10 text-primary-foreground/70 text-xs font-bold uppercase px-3 py-1 rounded-full mb-3">ESCALA MÁXIMA</span>
              <h3 className="text-lg font-bold font-display">NÍVEL 03 — ESCALA</h3>
              <p className="text-sm text-primary-foreground/60 mt-1 font-body">Prazo: <strong>12 Meses</strong></p>
              <p className="text-2xl font-bold mt-2 text-primary font-display">R$ 42.000,00</p>
              <ul className="mt-4 space-y-2 text-sm font-body text-primary-foreground/80">
                {['Refinamento de Time e Processos', 'Crescimento de Time Comercial', 'Auditoria de Atendimento', 'Cliente Oculto', 'Evolução Constante do Processo', 'Início da Escala de Tráfego', 'Estratégia de Aquisição', 'Execução de Performance'].map((i) => (
                  <li key={i} className="flex items-start gap-2"><span className="text-primary">✓</span>{i}</li>
                ))}
              </ul>
              <p className="text-xs text-primary-foreground/50 mt-3 italic font-body">Inclui tudo dos Níveis 01 e 02</p>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="block mt-4 border border-border/30 text-primary-foreground/70 font-bold py-3 rounded-xl text-center text-sm hover:bg-primary-foreground/5 transition-colors">→ QUERO DOMÍNIO TOTAL</a>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION G — Comparison Table */}
      <section className="bg-background py-12 md:py-16 px-4 no-print">
        <div className="max-w-4xl mx-auto">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-bold text-status-critical bg-destructive/5 rounded-tl-xl font-display">🔴 SEM PROTOCOLO GD</th>
                  <th className="text-left px-4 py-3 text-sm font-bold text-status-ok bg-status-ok/5 rounded-tr-xl font-display">✅ COM PROTOCOLO GD</th>
                </tr>
              </thead>
              <tbody className="font-body text-sm">
                {[
                  ['Leads respondidos com atraso', 'Resposta em < 5 min com protocolo'],
                  ['Secretária vende preço', 'Secretária vende transformação'],
                  ['Sem follow-up', 'Follow-up híbrido automático + manual'],
                  ['Sem CRM', 'CRM implantado e gerenciado'],
                  ['Conversão abaixo de 15%', 'Meta de conversão ≥ 35%'],
                  ['Agenda imprevisível', 'Agenda controlada e previsível'],
                  ['Decisão no achismo', 'Dashboard de métricas em tempo real'],
                  [`${formatarMoeda(financeiro.faturamentoPerdidoMes)} perdidos/mês`, 'Faturamento recuperado e escalável'],
                ].map(([sem, com], i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="px-4 py-3 text-muted-foreground">{sem}</td>
                    <td className="px-4 py-3 text-foreground font-medium">{com}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SECTION H — Final CTA */}
      <section className="bg-surface-dark py-16 md:py-20 px-4 no-print">
        <div className="max-w-3xl mx-auto text-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="bg-surface-dark-elevated border border-border/20 rounded-2xl p-6">
              <p className="text-xs uppercase tracking-wider text-status-critical mb-2 font-display">ANTES</p>
              <p className="text-3xl font-bold text-primary-foreground font-display">{formatarMoeda(financeiro.faturamentoAtualNum)}/mês</p>
              <p className="text-sm text-primary-foreground/50 mt-1 font-body">{financeiro.cirurgiasAtuais} cirurgias · {Math.round(financeiro.taxaConversaoAtual * 100)}% conversão</p>
            </div>
            <div className="bg-primary/10 border border-primary/30 rounded-2xl p-6">
              <p className="text-xs uppercase tracking-wider text-primary mb-2 font-display">DEPOIS</p>
              <p className="text-3xl font-bold text-primary font-display">{formatarMoeda(financeiro.faturamentoAtualNum + financeiro.faturamentoPerdidoMes)}/mês</p>
              <p className="text-sm text-primary-foreground/50 mt-1 font-body">{financeiro.cirurgiasPotencial} cirurgias · 35% conversão</p>
            </div>
          </div>

          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="inline-block w-full bg-primary hover:bg-primary-hover text-primary-foreground font-bold py-4 px-8 rounded-xl text-base transition-colors mb-4">
            → QUERO ESTRUTURAR MINHA OPERAÇÃO AGORA
          </a>
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold transition-colors" style={{ backgroundColor: '#25D366', color: '#fff' }}>
            <MessageCircle className="h-4 w-4" /> Falar com João pelo WhatsApp
          </a>
        </div>
      </section>

      {/* Print-only product recommendation */}
      <div className="hidden print-only pdf-page print-break-before">
        <h2 className="text-lg font-bold font-display mb-4">PRODUTO RECOMENDADO</h2>
        <div className="border border-border rounded-xl p-6">
          <p className="font-bold text-base font-display">★ GD Co. — NÍVEL 01: IMPLEMENTAÇÃO</p>
          <p className="text-sm text-muted-foreground mt-1 font-body">Prazo: 90 Dias · Investimento: R$ 15.000,00</p>
          <p className="text-sm text-muted-foreground mt-3 italic font-body">
            "Antes de escalar, é necessário corrigir a base comercial. O Nível 01 para o sangramento de oportunidades em 90 dias."
          </p>
          <div className="mt-4 space-y-1 text-sm font-body">
            {['Estudo da Base Atual', 'Treinamento da Secretária SDR', 'Treinamento da Gestora Comercial', 'Desenvolvimento do Funil de Vendas', 'Implantação e Treinamento de CRM', 'Prova de Capacitação (Destrava Clínicas)', 'Trabalho na Base de Leads'].map(i => (
              <p key={i}>• {i}</p>
            ))}
          </div>
          <p className="text-sm font-semibold text-primary mt-4 font-body">Faturamento potencial recuperado: {formatarMoeda(financeiro.faturamentoPerdidoMes)}/mês</p>
        </div>
        <div className="border-t border-border mt-8 pt-4 text-xs text-muted-foreground text-center font-body">
          © 2026 Guelles & Delgado Co. · guellesdelgado.co<br />
          "Estruturamos crescimento previsível para clínicas"
        </div>
      </div>
    </div>
  );
};

export default ReportPhase;
