import type { FormData, Relatorio, BlocoAnalise, PontoAnalise, AnswerLetter, BlocoId, QuestionDef } from './types';
import { QUESTIONS_DEMANDA, QUESTIONS_POSICIONAMENTO, QUESTIONS_ATENDIMENTO, QUESTIONS_CONVERSAO } from './types';

function extrairNumeroDoTexto(texto: string): number {
  const cleaned = texto.replace(/[R$.\s%]/g, '').replace(',', '.');
  const match = cleaned.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
}

const LETTER_SCORE: Record<string, number> = { A: 0, B: 25, C: 50, D: 75, E: 100 };

function letterToScore(letter: AnswerLetter): number {
  return LETTER_SCORE[letter] ?? 0;
}

export function calcularFinanceiro(r: FormData) {
  const ticketMedio = extrairNumeroDoTexto(r.ticketMedio) || 5000;
  const faturamentoMensalNum = extrairNumeroDoTexto(r.faturamentoMensal) || 50000;
  const conversaoRaw = extrairNumeroDoTexto(r.conversaoProcedimentos);
  const conversaoAtual = conversaoRaw > 0 ? conversaoRaw / 100 : 0.08;

  const procedimentosAtuais = Math.round(faturamentoMensalNum / ticketMedio);
  const leadsMesEstimado = Math.round(procedimentosAtuais / conversaoAtual);
  const conversaoPotencial = 0.35;
  const procedimentosPotencial = Math.round(leadsMesEstimado * conversaoPotencial);
  const procedimentosPerdidos = Math.max(procedimentosPotencial - procedimentosAtuais, 0);
  const faturamentoPerdidoMes = procedimentosPerdidos * ticketMedio;
  const faturamentoPerdidoAno = faturamentoPerdidoMes * 12;

  return {
    faturamentoMensal: r.faturamentoMensal,
    ticketMedio,
    faturamentoMensalNum,
    conversaoAtual,
    conversaoPotencial,
    leadsMesEstimado,
    procedimentosAtuais,
    procedimentosPotencial,
    procedimentosPerdidos,
    faturamentoPerdidoMes,
    faturamentoPerdidoAno,
  };
}

// ── Bloco Analysis ──

function analisarBloco(formData: FormData, questions: QuestionDef[]): BlocoAnalise {
  const positivos: PontoAnalise[] = [];
  const negativos: PontoAnalise[] = [];
  let totalScore = 0;
  let count = 0;

  for (const q of questions) {
    if (q.isPercent) continue; // skip q14 (percent input)
    const answer = formData[q.id] as AnswerLetter;
    if (!answer) continue;

    const score = letterToScore(answer);
    totalScore += score;
    count++;

    if (answer === 'A' || answer === 'B') {
      negativos.push({
        titulo: q.text,
        descricao: `Nível atual: ${q.options[['A','B','C','D','E'].indexOf(answer)]}. Ponto crítico que impacta diretamente os resultados.`,
        impacto: 'Compromete a operação nesta dimensão.',
        urgencia: answer === 'A' ? 'alta' : 'media',
      });
    } else if (answer === 'D' || answer === 'E') {
      positivos.push({
        titulo: q.text,
        descricao: `Nível atual: ${q.options[['A','B','C','D','E'].indexOf(answer)]}. Ponto forte consolidado.`,
      });
    }
  }

  const avgScore = count > 0 ? Math.round(totalScore / count) : 50;
  const status = avgScore >= 70 ? 'ok' as const : avgScore >= 45 ? 'warning' as const : 'critical' as const;

  return { score: avgScore, status, positivos, negativos };
}

function determinarNivel(blocoScores: Record<BlocoId, number>): 1 | 2 | 3 {
  const avg = Math.round(Object.values(blocoScores).reduce((a, b) => a + b, 0) / 4);
  if (avg < 35) return 1;
  if (avg < 65) return 2;
  return 3;
}

export function gerarRelatorio(formData: FormData): Relatorio {
  const financeiro = calcularFinanceiro(formData);

  const blocos: Record<BlocoId, BlocoAnalise> = {
    demanda: analisarBloco(formData, QUESTIONS_DEMANDA),
    posicionamento: analisarBloco(formData, QUESTIONS_POSICIONAMENTO),
    atendimento: analisarBloco(formData, QUESTIONS_ATENDIMENTO),
    conversao: analisarBloco(formData, QUESTIONS_CONVERSAO),
  };

  const blocoScores: Record<BlocoId, number> = {
    demanda: blocos.demanda.score,
    posicionamento: blocos.posicionamento.score,
    atendimento: blocos.atendimento.score,
    conversao: blocos.conversao.score,
  };

  const overallScore = Math.round(Object.values(blocoScores).reduce((a, b) => a + b, 0) / 4);
  const nivelRecomendado = determinarNivel(blocoScores);

  return {
    nomeClinica: formData.nomeClinica,
    responsavel: formData.responsavel,
    financeiro,
    blocos,
    blocoScores,
    overallScore,
    nivelRecomendado,
    formData,
  };
}

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 });
}
