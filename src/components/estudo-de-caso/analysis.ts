import type { FormData, Relatorio, PilarAnalise, PontoAnalise, AnswerLetter, Urgencia, STEPDimension, IMELevel, STEPIMECell, STEPIMEMatrix, QuestionDef } from './types';
import { QUESTIONS_POSICIONAMENTO, QUESTIONS_PERFORMANCE, QUESTIONS_ATENDIMENTO, ALL_QUESTIONS } from './types';

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
  const procedimentosMes = extrairNumeroDoTexto(r.procedimentosMes) || 10;
  const faturamentoAtualNum = extrairNumeroDoTexto(r.faturamentoAtual) || (procedimentosMes * ticketMedio);
  const taxaConversaoRaw = extrairNumeroDoTexto(r.taxaConversao);
  const taxaConversaoAtual = taxaConversaoRaw > 0 ? taxaConversaoRaw / 100 : 0.08;

  const leadsMesEstimado = Math.round(procedimentosMes / taxaConversaoAtual);
  const taxaConversaoPotencial = 0.35;
  const cirurgiasAtuais = procedimentosMes;
  const cirurgiasPotencial = Math.round(leadsMesEstimado * taxaConversaoPotencial);
  const cirurgiasPerdidas = Math.max(cirurgiasPotencial - cirurgiasAtuais, 0);
  const faturamentoPerdidoMes = cirurgiasPerdidas * ticketMedio;
  const faturamentoPerdidoAno = faturamentoPerdidoMes * 12;

  return {
    faturamentoAtual: r.faturamentoAtual,
    faturamentoDesejado: r.faturamentoDesejado,
    ticketMedio, procedimentosMes, taxaConversaoAtual, taxaConversaoPotencial,
    leadsMesEstimado, cirurgiasAtuais, cirurgiasPotencial, cirurgiasPerdidas,
    faturamentoPerdidoMes, faturamentoPerdidoAno, faturamentoAtualNum,
  };
}

// ── STEP × IME Matrix Analysis ──

function classifyScore(score: number): string {
  if (score >= 66) return 'Consolidado';
  if (score >= 36) return 'Avançando';
  return 'Iniciando';
}

function calcularMatrixSTEPIME(formData: FormData): STEPIMEMatrix {
  const cells: STEPIMECell[] = [];
  const pilares = ['posicionamento', 'performance', 'atendimento'] as const;
  const steps: STEPDimension[] = ['S', 'T', 'E', 'P'];
  const imes: IMELevel[] = ['I', 'M', 'E'];

  // Group questions by pilar, step, ime
  for (const pilar of pilares) {
    for (const step of steps) {
      for (const ime of imes) {
        const q = ALL_QUESTIONS.find(
          (q) => q.pilar === pilar && q.step === step && q.ime === ime
        );
        if (!q) continue;
        const answer = formData[q.id] as AnswerLetter;
        const score = letterToScore(answer);
        cells.push({
          score,
          label: classifyScore(score),
          pilar,
          step,
          ime,
        });
      }
    }
  }

  // Calculate averages per STEP dimension
  const stepAverages: Record<STEPDimension, number> = { S: 0, T: 0, E: 0, P: 0 };
  for (const step of steps) {
    const stepCells = cells.filter((c) => c.step === step);
    stepAverages[step] = stepCells.length > 0
      ? Math.round(stepCells.reduce((s, c) => s + c.score, 0) / stepCells.length)
      : 0;
  }

  // Calculate averages per IME level
  const imeAverages: Record<IMELevel, number> = { I: 0, M: 0, E: 0 };
  for (const ime of imes) {
    const imeCells = cells.filter((c) => c.ime === ime);
    imeAverages[ime] = imeCells.length > 0
      ? Math.round(imeCells.reduce((s, c) => s + c.score, 0) / imeCells.length)
      : 0;
  }

  // Per-pilar STEP scores
  const pilarStepScores: Record<string, Record<STEPDimension, number>> = {};
  for (const pilar of pilares) {
    pilarStepScores[pilar] = { S: 0, T: 0, E: 0, P: 0 };
    for (const step of steps) {
      const psCells = cells.filter((c) => c.pilar === pilar && c.step === step);
      pilarStepScores[pilar][step] = psCells.length > 0
        ? Math.round(psCells.reduce((s, c) => s + c.score, 0) / psCells.length)
        : 0;
    }
  }

  // Per-pilar IME scores
  const pilarImeScores: Record<string, Record<IMELevel, number>> = {};
  for (const pilar of pilares) {
    pilarImeScores[pilar] = { I: 0, M: 0, E: 0 };
    for (const ime of imes) {
      const piCells = cells.filter((c) => c.pilar === pilar && c.ime === ime);
      pilarImeScores[pilar][ime] = piCells.length > 0
        ? Math.round(piCells.reduce((s, c) => s + c.score, 0) / piCells.length)
        : 0;
    }
  }

  const overallScore = cells.length > 0
    ? Math.round(cells.reduce((s, c) => s + c.score, 0) / cells.length)
    : 0;

  return { cells, stepAverages, imeAverages, pilarStepScores, pilarImeScores, overallScore };
}

// ── Pilar Analysis (simplified for new question format) ──

interface QAnalysis {
  id: string;
  negTitle: string;
  negDesc: string;
  negImpact: string;
  negUrgency: Urgencia;
  posTitle: string;
  posDesc: string;
}

// Generate analysis points dynamically from question definitions
function generateAnalysisForQuestion(q: QuestionDef): QAnalysis {
  const stepNames: Record<STEPDimension, string> = { S: 'processos', T: 'equipe', E: 'ambiente', P: 'progresso' };
  const imeNames: Record<IMELevel, string> = { I: 'implementação', M: 'maturação', E: 'escala' };
  const pilarNames: Record<string, string> = { posicionamento: 'Posicionamento', performance: 'Performance', atendimento: 'Atendimento' };

  return {
    id: q.id,
    negTitle: `Deficiência em ${stepNames[q.step]} (${imeNames[q.ime]})`,
    negDesc: `Na dimensão de ${stepNames[q.step]} do pilar de ${pilarNames[q.pilar]}, o nível de ${imeNames[q.ime]} apresenta fragilidades que impactam diretamente os resultados da operação.`,
    negImpact: `Compromete a capacidade de ${imeNames[q.ime]} no eixo de ${stepNames[q.step]}.`,
    negUrgency: q.ime === 'I' ? 'alta' : q.ime === 'M' ? 'media' : 'baixa',
    posTitle: `${stepNames[q.step].charAt(0).toUpperCase() + stepNames[q.step].slice(1)} consolidado (${imeNames[q.ime]})`,
    posDesc: `O nível de ${imeNames[q.ime]} no eixo de ${stepNames[q.step]} está bem estruturado, contribuindo positivamente para o pilar de ${pilarNames[q.pilar]}.`,
  };
}

function analisarPilar(formData: FormData, questions: QuestionDef[]): PilarAnalise {
  const positivos: PontoAnalise[] = [];
  const negativos: PontoAnalise[] = [];
  let totalScore = 0;
  let count = 0;

  for (const q of questions) {
    const answer = formData[q.id] as AnswerLetter;
    if (!answer) continue;

    const score = letterToScore(answer);
    totalScore += score;
    count++;

    const analysis = generateAnalysisForQuestion(q);

    if (answer === 'A' || answer === 'B') {
      negativos.push({
        titulo: analysis.negTitle,
        descricao: analysis.negDesc,
        impacto: analysis.negImpact,
        urgencia: analysis.negUrgency,
      });
    } else if (answer === 'D' || answer === 'E') {
      positivos.push({
        titulo: analysis.posTitle,
        descricao: analysis.posDesc,
      });
    }
  }

  const avgScore = count > 0 ? Math.round(totalScore / count) : 50;
  const status = avgScore >= 70 ? 'ok' as const : avgScore >= 45 ? 'warning' as const : 'critical' as const;

  return { score: avgScore, status, positivos, negativos };
}

// Determine recommended level based on IME averages
function determinarNivel(matrix: STEPIMEMatrix): 1 | 2 | 3 {
  // If Implementation average is low, they need level 1
  if (matrix.imeAverages.I < 50) return 1;
  // If Maturation average is low, they need level 2
  if (matrix.imeAverages.M < 50) return 2;
  // Otherwise they're ready for Scale
  return 3;
}

export function gerarRelatorio(formData: FormData): Relatorio {
  const financeiro = calcularFinanceiro(formData);
  const posicionamento = analisarPilar(formData, QUESTIONS_POSICIONAMENTO);
  const performance = analisarPilar(formData, QUESTIONS_PERFORMANCE);
  const atendimento = analisarPilar(formData, QUESTIONS_ATENDIMENTO);
  const matrix = calcularMatrixSTEPIME(formData);
  const nivelRecomendado = determinarNivel(matrix);

  return {
    nomeClinica: formData.nomeClinica,
    especialidade: formData.especialidade,
    cidade: formData.cidade,
    financeiro,
    pilares: { posicionamento, performance, atendimento },
    matrix,
    nivelRecomendado,
    formData,
  };
}

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 });
}
