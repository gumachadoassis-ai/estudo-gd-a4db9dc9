import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import type { Relatorio } from './types';
import { formatarMoeda } from './analysis';
import { useCountUp } from '@/hooks/useCountUp';
import { TrendingUp, TrendingDown, Activity, Target, Users, DollarSign } from 'lucide-react';

interface DashboardBIProps {
  relatorio: Relatorio;
}

const DashboardBI = ({ relatorio }: DashboardBIProps) => {
  const { financeiro, pilares } = relatorio;

  const scoreGeral = useMemo(() =>
    Math.round((pilares.posicionamento.score + pilares.performance.score + pilares.atendimento.score) / 3),
    [pilares]
  );

  const animScore = useCountUp(scoreGeral, 1500);
  const animLeads = useCountUp(financeiro.leadsMesEstimado, 1200);
  const animConversao = useCountUp(Math.round(financeiro.taxaConversaoAtual * 100), 1000);
  const animPerdido = useCountUp(financeiro.faturamentoPerdidoMes, 2000);

  const totalNeg = pilares.posicionamento.negativos.length + pilares.performance.negativos.length + pilares.atendimento.negativos.length;
  const totalPos = pilares.posicionamento.positivos.length + pilares.performance.positivos.length + pilares.atendimento.positivos.length;

  const pieData = useMemo(() => [
    { name: 'Posicionamento', value: pilares.posicionamento.score, fill: 'hsl(37, 91%, 55%)' },
    { name: 'Performance', value: pilares.performance.score, fill: 'hsl(37, 91%, 70%)' },
    { name: 'Atendimento', value: pilares.atendimento.score, fill: 'hsl(0, 84%, 60%)' },
  ], [pilares]);

  return (
    <section className="bg-background py-14 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-display mb-1">Business Intelligence</p>
          <h2 className="text-xl md:text-2xl font-bold text-foreground font-display">Painel Executivo</h2>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <KPITile
            icon={<Activity className="h-4 w-4" />}
            label="Score Geral"
            value={`${animScore}/100`}
            delta={scoreGeral < 50 ? 'Abaixo do benchmark' : 'Dentro do esperado'}
            negative={scoreGeral < 50}
          />
          <KPITile
            icon={<Users className="h-4 w-4" />}
            label="Leads Estimados"
            value={`${animLeads}/mês`}
            delta={`${financeiro.cirurgiasAtuais} convertidos`}
          />
          <KPITile
            icon={<Target className="h-4 w-4" />}
            label="Taxa de Conversão"
            value={`${animConversao}%`}
            delta="Benchmark: 35%"
            negative={financeiro.taxaConversaoAtual < 0.35}
          />
          <KPITile
            icon={<DollarSign className="h-4 w-4" />}
            label="Receita Não Capturada"
            value={formatarMoeda(animPerdido)}
            delta={`${financeiro.cirurgiasPerdidas} procedimentos/mês`}
            negative
          />
        </div>

        {/* Bottom row: Pie + Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pie Chart */}
          <div className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center justify-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4 font-display">Distribuição por Pilar</p>
            <div className="h-40 w-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 mt-4">
              {pieData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.fill }} />
                  <span className="text-[10px] text-muted-foreground">{d.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Diagnosis Summary */}
          <div className="bg-card border border-border rounded-2xl p-6 md:col-span-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4 font-display">Síntese do Diagnóstico</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-3.5 w-3.5 text-status-ok" />
                  <span className="text-xs font-semibold text-foreground">{totalPos} pontos fortes</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {totalPos > 3
                    ? 'A operação possui uma base sólida em múltiplos eixos. Há ativos de confiança e canais orgânicos que podem ser amplificados com estrutura.'
                    : 'Poucos pontos fortes identificados. A operação precisa de intervenções estruturais para construir uma base competitiva.'}
                </p>
              </div>
              <div className="bg-background rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-3.5 w-3.5 text-status-critical" />
                  <span className="text-xs font-semibold text-foreground">{totalNeg} vulnerabilidades</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {totalNeg > 6
                    ? 'Alto volume de gargalos concentrados nos pilares de conversão e atendimento. Intervenção prioritária recomendada nos processos comerciais.'
                    : 'Vulnerabilidades identificadas em pontos-chave. A correção dos itens de urgência alta gera retorno imediato na taxa de conversão.'}
                </p>
              </div>
              <div className="bg-background rounded-xl p-4 col-span-2">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-semibold text-foreground">Projeção de Recuperação</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Com a correção dos {totalNeg} pontos identificados e implementação de protocolo comercial estruturado,
                  a projeção de receita recuperável é de <span className="text-primary font-semibold">{formatarMoeda(financeiro.faturamentoPerdidoMes)}/mês</span> —
                  totalizando <span className="text-foreground font-semibold">{formatarMoeda(financeiro.faturamentoPerdidoAno)}</span> em 12 meses.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const KPITile = ({ icon, label, value, delta, negative }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delta: string;
  negative?: boolean;
}) => (
  <div className="bg-card border border-border rounded-2xl p-5">
    <div className="flex items-center gap-2 mb-3">
      <div className="text-muted-foreground">{icon}</div>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-display">{label}</span>
    </div>
    <p className="text-xl md:text-2xl font-bold text-foreground font-display leading-none">{value}</p>
    <p className={`text-[10px] mt-2 font-body ${negative ? 'text-status-critical' : 'text-muted-foreground'}`}>{delta}</p>
  </div>
);

export default DashboardBI;
