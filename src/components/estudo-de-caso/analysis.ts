import type { FormData, Relatorio, BlocoAnalise, PontoAnalise, AnswerLetter, BlocoId, QuestionDef, STEPDimension, IMELevel, STEPIMECell, STEPIMEMatrix } from './types';
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

  // Mínimo ideal: 40% de conversão
  const conversaoMinima = 0.40;
  const procedimentosMinimo = Math.round(leadsMesEstimado * conversaoMinima);
  const perdidoMinimoMes = Math.max((procedimentosMinimo - procedimentosAtuais) * ticketMedio, 0);
  const perdidoMinimoAno = perdidoMinimoMes * 12;

  // Potencial máximo escalável: 80% de conversão
  const conversaoMaxima = 0.80;
  const procedimentosMaximo = Math.round(leadsMesEstimado * conversaoMaxima);
  const perdidoMaximoMes = Math.max((procedimentosMaximo - procedimentosAtuais) * ticketMedio, 0);
  const perdidoMaximoAno = perdidoMaximoMes * 12;

  return {
    faturamentoMensal: r.faturamentoMensal,
    ticketMedio,
    faturamentoMensalNum,
    conversaoAtual,
    leadsMesEstimado,
    procedimentosAtuais,
    conversaoMinima,
    procedimentosMinimo,
    perdidoMinimoMes,
    perdidoMinimoAno,
    conversaoMaxima,
    procedimentosMaximo,
    perdidoMaximoMes,
    perdidoMaximoAno,
  };
}

// ── STEP × IME Matrix ──
// Map: Blocos → STEP columns
//   Demanda → S (Status do Processo)
//   Posicionamento → T (Membros da Equipe / percepção)
//   Atendimento → E (Ambiente / experiência)
//   Conversão → P (Progresso à Meta)
// Within each bloco, questions map to IME rows by progression:
//   1st question → I (Implementação)
//   2nd question → M (Maturação)
//   3rd+4th avg  → E (Escala)  [or 3rd only if 3 questions]

const BLOCO_TO_STEP: Record<BlocoId, STEPDimension> = {
  demanda: 'S',
  posicionamento: 'T',
  atendimento: 'E',
  conversao: 'P',
};

function classifyScore(score: number): string {
  if (score >= 66) return 'Consolidado';
  if (score >= 36) return 'Avançando';
  return 'Iniciando';
}

function calcularMatrix(formData: FormData): STEPIMEMatrix {
  const cells: STEPIMECell[] = [];
  const blocoQuestions: Record<BlocoId, QuestionDef[]> = {
    demanda: QUESTIONS_DEMANDA,
    posicionamento: QUESTIONS_POSICIONAMENTO,
    atendimento: QUESTIONS_ATENDIMENTO,
    conversao: QUESTIONS_CONVERSAO,
  };

  const blocoIds: BlocoId[] = ['demanda', 'posicionamento', 'atendimento', 'conversao'];

  for (const blocoId of blocoIds) {
    const questions = blocoQuestions[blocoId];
    const step = BLOCO_TO_STEP[blocoId];
    const scores: number[] = [];

    for (const q of questions) {
      if (q.isPercent) {
        // Map q14 percent to a score (0-100 scale, cap at 35% = 100)
        const pct = extrairNumeroDoTexto(formData[q.id] as string);
        scores.push(Math.min(Math.round((pct / 35) * 100), 100));
      } else {
        const answer = formData[q.id] as AnswerLetter;
        scores.push(answer ? letterToScore(answer) : 0);
      }
    }

    // Map to IME: first=I, second=M, rest averaged=E
    const imeScores: Record<IMELevel, number> = {
      I: scores[0] ?? 0,
      M: scores[1] ?? 0,
      E: scores.length > 2
        ? Math.round(scores.slice(2).reduce((a, b) => a + b, 0) / scores.slice(2).length)
        : 0,
    };

    for (const ime of ['I', 'M', 'E'] as IMELevel[]) {
      cells.push({
        step,
        ime,
        score: imeScores[ime],
        label: classifyScore(imeScores[ime]),
      });
    }
  }

  // Averages per STEP
  const steps: STEPDimension[] = ['S', 'T', 'E', 'P'];
  const imes: IMELevel[] = ['I', 'M', 'E'];
  const stepAverages = {} as Record<STEPDimension, number>;
  for (const s of steps) {
    const sc = cells.filter(c => c.step === s);
    stepAverages[s] = sc.length > 0 ? Math.round(sc.reduce((a, c) => a + c.score, 0) / sc.length) : 0;
  }

  const imeAverages = {} as Record<IMELevel, number>;
  for (const i of imes) {
    const sc = cells.filter(c => c.ime === i);
    imeAverages[i] = sc.length > 0 ? Math.round(sc.reduce((a, c) => a + c.score, 0) / sc.length) : 0;
  }

  const overallScore = cells.length > 0
    ? Math.round(cells.reduce((a, c) => a + c.score, 0) / cells.length)
    : 0;

  return { cells, stepAverages, imeAverages, overallScore };
}

// ── Bloco Analysis ──

function analisarBloco(formData: FormData, questions: QuestionDef[]): BlocoAnalise {
  const positivos: PontoAnalise[] = [];
  const negativos: PontoAnalise[] = [];
  let totalScore = 0;
  let count = 0;

  for (const q of questions) {
    if (q.isPercent) continue;
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

function determinarNivel(matrix: STEPIMEMatrix): 1 | 2 | 3 {
  if (matrix.imeAverages.I < 50) return 1;
  if (matrix.imeAverages.M < 50) return 2;
  return 3;
}

export function gerarRelatorio(formData: FormData): Relatorio {
  const financeiro = calcularFinanceiro(formData);
  const matrix = calcularMatrix(formData);

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

  const nivelRecomendado = determinarNivel(matrix);

  return {
    nomeClinica: formData.nomeClinica,
    responsavel: formData.responsavel,
    financeiro,
    blocos,
    blocoScores,
    matrix,
    overallScore: matrix.overallScore,
    nivelRecomendado,
    formData,
  };
}

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 });
}
