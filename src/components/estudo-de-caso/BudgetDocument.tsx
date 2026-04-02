import logoGd from '@/assets/logo-gd.png';
import type { Relatorio, PontoAnalise } from './types';
import { formatarMoeda } from './analysis';

interface BudgetDocumentProps {
  relatorio: Relatorio;
}

const ENTREGAS = [
  { entregavel: 'Estudo da Base Atual', responsavel: 'COO', prazo: 'Semanas 1–2' },
  { entregavel: 'Treinamento Secretária', responsavel: 'AULA GRAVADA', prazo: 'Semana 1–3' },
  { entregavel: 'Treinamento Gestora Comercial', responsavel: 'COO', prazo: 'Semanas 2–4' },
  { entregavel: 'Desenvolvimento do Funil de Vendas', responsavel: 'ANALISTA DE CRM', prazo: 'Semanas 2–4' },
  { entregavel: 'Treinamento CRM', responsavel: 'ANALISTA DE CRM', prazo: 'Semana 5' },
  { entregavel: 'Prova de Capacitação', responsavel: 'AULA GRAVADA', prazo: 'Semana 4' },
  { entregavel: 'Trabalho na Base de Leads', responsavel: 'COO', prazo: 'Semanas 5–12' },
];

const BudgetDocument = ({ relatorio }: BudgetDocumentProps) => {
  const { nomeClinica, especialidade, cidade, financeiro, pilares } = relatorio;
  const dataAtual = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  // Collect all critical/negative points
  const allNegatives: { pilar: string; pontos: PontoAnalise[] }[] = [
    { pilar: 'Posicionamento', pontos: pilares.posicionamento.negativos },
    { pilar: 'Performance', pontos: pilares.performance.negativos },
    { pilar: 'Atendimento', pontos: pilares.atendimento.negativos },
  ].filter(p => p.pontos.length > 0);

  return (
    <div className="bg-white text-gray-900 p-10 max-w-[800px] mx-auto" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-gray-900">
        <div className="flex items-center gap-3">
          <img src={logoGd} alt="GD Co." className="h-10 w-10 rounded" />
          <div>
            <p className="text-xs font-bold tracking-[0.2em] uppercase">GUELLES & DELGADO CO.</p>
            <p className="text-[9px] text-gray-500">Estrutura comercial para clínicas de alto valor</p>
          </div>
        </div>
        <p className="text-[10px] text-gray-400">{dataAtual}</p>
      </div>

      {/* Title */}
      <div className="mb-10">
        <p className="text-[10px] tracking-[0.2em] uppercase text-gray-400 mb-1">Estudo de Caso</p>
        <h1 className="text-2xl font-bold mb-1">{nomeClinica}</h1>
        <p className="text-sm text-gray-500">{especialidade} · {cidade}</p>
      </div>

      {/* Scores Summary */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: 'Posicionamento', score: pilares.posicionamento.score, status: pilares.posicionamento.status },
          { label: 'Performance', score: pilares.performance.score, status: pilares.performance.status },
          { label: 'Atendimento', score: pilares.atendimento.score, status: pilares.atendimento.status },
        ].map(p => (
          <div key={p.label} className="text-center border border-gray-200 rounded-lg p-4">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">{p.label}</p>
            <p className={`text-2xl font-bold ${p.status === 'critical' ? 'text-red-600' : p.status === 'warning' ? 'text-amber-500' : 'text-green-600'}`}>
              {p.score}/100
            </p>
          </div>
        ))}
      </div>

      {/* Financial Impact */}
      <div className="bg-gray-50 rounded-lg p-6 mb-10 text-center">
        <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-2">Receita não capturada identificada</p>
        <p className="text-3xl font-bold text-red-600">{formatarMoeda(financeiro.faturamentoPerdidoMes)}<span className="text-base font-normal text-gray-400">/mês</span></p>
        <p className="text-xs text-gray-400 mt-1">
          {financeiro.cirurgiasPerdidas} procedimentos × {formatarMoeda(financeiro.ticketMedio)} ticket médio
        </p>
      </div>

      {/* Critical Points */}
      <div className="mb-10">
        <h2 className="text-lg font-bold mb-4 pb-2 border-b border-gray-200">Pontos Críticos Identificados</h2>
        {allNegatives.map(({ pilar, pontos }) => (
          <div key={pilar} className="mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">{pilar}</h3>
            <ul className="space-y-1.5">
              {pontos.map((p, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <span className="text-red-500 flex-shrink-0">•</span>
                  <span>{p.titulo}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Implementation Scope */}
      <div className="mb-10">
        <h2 className="text-lg font-bold mb-2 pb-2 border-b border-gray-200">Plano de Ação — Implementação (90 dias)</h2>
        <p className="text-sm text-gray-500 mb-4">Objetivo: estruturar a operação comercial do cliente do zero.</p>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-900 text-white">
              <th className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider">Entregável</th>
              <th className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider">Responsável</th>
              <th className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider">Prazo Médio</th>
            </tr>
          </thead>
          <tbody>
            {ENTREGAS.map((e, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-2.5 text-sm font-medium border-b border-gray-100">{e.entregavel}</td>
                <td className="px-4 py-2.5 text-sm text-gray-600 border-b border-gray-100">{e.responsavel}</td>
                <td className="px-4 py-2.5 text-sm text-gray-600 border-b border-gray-100">{e.prazo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Investment */}
      <div className="bg-gray-900 text-white rounded-lg p-8 mb-10">
        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-3 text-center">Investimento</p>
        <p className="text-4xl font-bold text-center mb-4">R$ 15.000,00</p>
        <div className="text-center space-y-1.5">
          <p className="text-sm text-gray-300">Pagamento integral com desconto</p>
          <p className="text-sm text-gray-400">ou</p>
          <p className="text-sm text-gray-300">3x de R$ 5.000,00</p>
          <p className="text-xs text-gray-500 mt-2">Primeira parcela na assinatura do contrato</p>
        </div>
      </div>

      {/* Projected Return */}
      <div className="text-center bg-amber-50 rounded-lg p-6 mb-10">
        <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Retorno estimado nos primeiros 90 dias</p>
        <p className="text-2xl font-bold text-amber-600">{formatarMoeda(financeiro.faturamentoPerdidoMes * 3)}</p>
        <p className="text-xs text-gray-400 mt-1">Baseado na recuperação de {financeiro.cirurgiasPerdidas} procedimentos/mês</p>
      </div>

      {/* Footer */}
      <div className="pt-6 border-t border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={logoGd} alt="GD Co." className="h-6 w-6 rounded" />
          <div>
            <p className="text-[9px] font-bold tracking-wider uppercase">GUELLES & DELGADO CO.</p>
            <p className="text-[8px] text-gray-400">Estrutura comercial para clínicas de alto valor</p>
          </div>
        </div>
        <p className="text-[8px] text-gray-400">Documento confidencial · {dataAtual}</p>
      </div>
    </div>
  );
};

export default BudgetDocument;
