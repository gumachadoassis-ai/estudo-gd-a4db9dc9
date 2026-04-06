export type AnswerLetter = '' | 'A' | 'B' | 'C' | 'D' | 'E';

export interface FormData {
  // Etapa 0 — Dados Básicos
  nomeClinica: string;
  cnpj: string;
  email: string;
  telefone: string;
  especialidade: string;
  cidade: string;
  faturamentoAtual: string;
  faturamentoDesejado: string;
  ticketMedio: string;
  procedimentosMes: string;
  taxaConversao: string;
  // Etapa 1–3 — Perguntas A-E
  q1: AnswerLetter; q2: AnswerLetter; q3: AnswerLetter; q4: AnswerLetter;
  q5: AnswerLetter; q6: AnswerLetter; q7: AnswerLetter; q8: AnswerLetter;
  q9: AnswerLetter; q10: AnswerLetter; q11: AnswerLetter; q12: AnswerLetter;
  q13: AnswerLetter; q14: AnswerLetter; q15: AnswerLetter; q16: AnswerLetter;
  q17: AnswerLetter; q18: AnswerLetter; q19: AnswerLetter;
  q20: AnswerLetter; q21: AnswerLetter; q22: AnswerLetter; q23: AnswerLetter;
  q24: AnswerLetter; q25: AnswerLetter; q26: AnswerLetter; q27: AnswerLetter;
  q28: AnswerLetter; q29: AnswerLetter; q30: AnswerLetter;
}

export type Phase = 'WELCOME' | 'FORM' | 'PROCESSING' | 'REPORT';
export type Status = 'ok' | 'warning' | 'critical';
export type Urgencia = 'baixa' | 'media' | 'alta';

export interface PontoAnalise {
  titulo: string;
  descricao: string;
  impacto?: string;
  urgencia?: Urgencia;
}

export interface PilarAnalise {
  score: number;
  status: Status;
  positivos: PontoAnalise[];
  negativos: PontoAnalise[];
}

export interface Financeiro {
  faturamentoAtual: string;
  faturamentoDesejado: string;
  ticketMedio: number;
  procedimentosMes: number;
  taxaConversaoAtual: number;
  taxaConversaoPotencial: number;
  leadsMesEstimado: number;
  cirurgiasAtuais: number;
  cirurgiasPotencial: number;
  cirurgiasPerdidas: number;
  faturamentoPerdidoMes: number;
  faturamentoPerdidoAno: number;
  faturamentoAtualNum: number;
}

export interface Relatorio {
  nomeClinica: string;
  especialidade: string;
  cidade: string;
  financeiro: Financeiro;
  pilares: {
    posicionamento: PilarAnalise;
    performance: PilarAnalise;
    atendimento: PilarAnalise;
  };
  nivelRecomendado: 1 | 2 | 3;
  formData: FormData;
}

export interface QuestionDef {
  id: keyof FormData;
  num: number;
  text: string;
  options: [string, string, string, string, string]; // A, B, C, D, E
}

// ── Questions ──

export const QUESTIONS_POSICIONAMENTO: QuestionDef[] = [
  { id: 'q1', num: 1, text: 'Situação do perfil no Google Meu Negócio', options: ['Não temos perfil', 'Perfil não verificado', 'Verificado, poucas avaliações', 'Boas avaliações, respondemos algumas', 'Perfil forte, muitas avaliações e bem gerenciado'] },
  { id: 'q2', num: 2, text: 'Qualidade das fotos no Google', options: ['Não temos fotos', 'Fotos ruins/desatualizadas', 'Fotos medianas', 'Fotos boas', 'Fotos profissionais e atualizadas'] },
  { id: 'q3', num: 3, text: 'Gestão de avaliações negativas', options: ['Ignoramos', 'Respondemos raramente', 'Respondemos sem padrão', 'Respondemos bem', 'Respondemos estrategicamente'] },
  { id: 'q4', num: 4, text: 'Situação do site', options: ['Não temos', 'Antigo e ruim', 'Simples', 'Bom, mas com falhas', 'Profissional e otimizado'] },
  { id: 'q5', num: 5, text: 'Clareza dos CTAs (contato)', options: ['Não existem', 'Difíceis de achar', 'Existem, mas fracos', 'Bons', 'Muito claros e estratégicos'] },
  { id: 'q6', num: 6, text: 'Experiência e velocidade do site', options: ['Muito ruim', 'Lento', 'Mediano', 'Bom', 'Excelente'] },
  { id: 'q7', num: 7, text: 'Frequência de conteúdo', options: ['Não posta', 'Raramente', 'Sem consistência', 'Frequente', 'Estratégico e consistente'] },
  { id: 'q8', num: 8, text: 'Uso de provas sociais (depoimentos, antes/depois)', options: ['Não usa', 'Quase nunca', 'Às vezes', 'Frequente', 'Estratégico'] },
  { id: 'q9', num: 9, text: 'Qualidade da bio', options: ['Inexistente', 'Genérica', 'Informativa', 'Boa', 'Estratégica com CTA'] },
  { id: 'q10', num: 10, text: 'Definição de público-alvo', options: ['Não definido', 'Muito amplo', 'Parcial', 'Bem definido', 'Extremamente claro'] },
  { id: 'q11', num: 11, text: 'Diferencial percebido', options: ['Nenhum', 'Genérico', 'Existe, mas fraco', 'Claro', 'Forte e valorizado'] },
  { id: 'q12', num: 12, text: 'Promessa principal de valor', options: ['Não existe', 'Existe, mas não comunicada', 'Aparece pouco', 'Está presente', 'Clara e consistente'] },
];

export const QUESTIONS_PERFORMANCE: QuestionDef[] = [
  { id: 'q13', num: 13, text: 'Investimento em anúncios', options: ['Não investe', 'Irregular', 'Baixo e sem estratégia', 'Consistente', 'Estratégico'] },
  { id: 'q14', num: 14, text: 'Qualidade dos criativos e oferta', options: ['Não faz', 'Fracos/genéricos', 'Medianos', 'Bons', 'Muito fortes (vídeos, autoridade)'] },
  { id: 'q15', num: 15, text: 'Uso de remarketing', options: ['Não usa', 'Já tentou', 'Usa pouco', 'Usa básico', 'Estruturado'] },
  { id: 'q16', num: 16, text: 'Controle de métricas (CPL)', options: ['Não mede', 'Mede raramente', 'Tem ideia', 'Mede', 'Otimiza constantemente'] },
  { id: 'q17', num: 17, text: 'Previsibilidade de leads', options: ['Não gera', 'Totalmente instável', 'Oscila', 'Relativamente estável', 'Previsível'] },
  { id: 'q18', num: 18, text: 'Origem dos leads', options: ['Não sabe', 'Só indicação', 'Misturado sem controle', 'Canais definidos', 'Estratégico e mensurado'] },
  { id: 'q19', num: 19, text: 'Qualificação de leads', options: ['Não existe', 'Muito básica', 'Parcial', 'Estruturada', 'Altamente estruturada'] },
];

export const QUESTIONS_ATENDIMENTO: QuestionDef[] = [
  { id: 'q20', num: 20, text: 'Tempo de resposta', options: ['+6 horas', '2–6 horas', 'Até 2 horas', 'Até 30 min', 'Imediato'] },
  { id: 'q21', num: 21, text: 'Atendimento fora do horário', options: ['Não existe', 'Muito limitado', 'Parcial', 'Quase completo', 'Completo'] },
  { id: 'q22', num: 22, text: 'Personalização da comunicação', options: ['Frio', 'Pouco', 'Médio', 'Bom', 'Alto nível'] },
  { id: 'q23', num: 23, text: 'Foco do atendimento', options: ['Só preço', 'Quase só preço', 'Misto', 'Valor', 'Consultivo e persuasivo'] },
  { id: 'q24', num: 24, text: 'Uso de script', options: ['Não existe', 'Cada um faz diferente', 'Parcial', 'Estruturado', 'Otimizado'] },
  { id: 'q25', num: 25, text: 'Tratamento de objeções', options: ['Não sabe lidar', 'Evita', 'Médio', 'Bom', 'Estratégico'] },
  { id: 'q26', num: 26, text: 'Follow-up de leads', options: ['Nunca', 'Raramente', 'Às vezes', 'Frequente', 'Sempre estruturado'] },
  { id: 'q27', num: 27, text: 'Conversão em agendamento', options: ['<10%', '10–20%', '20–30%', '30–40%', '>40%'] },
  { id: 'q28', num: 28, text: 'Comparecimento', options: ['<50%', '50–60%', '60–70%', '70–85%', '>85%'] },
  { id: 'q29', num: 29, text: 'Conversão em procedimentos', options: ['<20%', '20–30%', '30–45%', '45–60%', '>60%'] },
  { id: 'q30', num: 30, text: 'Pós-venda e retenção', options: ['Não existe', 'Muito básico', 'Parcial', 'Estruturado', 'Estratégico'] },
];

export const ALL_QUESTIONS = [...QUESTIONS_POSICIONAMENTO, ...QUESTIONS_PERFORMANCE, ...QUESTIONS_ATENDIMENTO];

export const FORM_STEPS = [
  { id: 0, badge: 'IDENTIFICAÇÃO', title: 'Dados básicos da operação' },
  { id: 1, badge: 'ETAPA 1 DE 3 — POSICIONAMENTO', title: 'Como o mercado percebe a clínica' },
  { id: 2, badge: 'ETAPA 2 DE 3 — PERFORMANCE', title: 'Geração de demanda e previsibilidade' },
  { id: 3, badge: 'ETAPA 3 DE 3 — ATENDIMENTO', title: 'Onde o dinheiro realmente entra' },
] as const;

export const STEP_FIELDS: Record<number, (keyof FormData)[]> = {
  0: ['nomeClinica', 'cnpj', 'email', 'telefone', 'especialidade', 'cidade', 'faturamentoAtual', 'faturamentoDesejado', 'ticketMedio', 'procedimentosMes', 'taxaConversao'],
  1: ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10', 'q11', 'q12'],
  2: ['q13', 'q14', 'q15', 'q16', 'q17', 'q18', 'q19'],
  3: ['q20', 'q21', 'q22', 'q23', 'q24', 'q25', 'q26', 'q27', 'q28', 'q29', 'q30'],
};

export function getEmptyFormData(): FormData {
  return {
    nomeClinica: '', cnpj: '', email: '', telefone: '',
    especialidade: '', cidade: '',
    faturamentoAtual: '', faturamentoDesejado: '', ticketMedio: '',
    procedimentosMes: '', taxaConversao: '',
    q1: '', q2: '', q3: '', q4: '', q5: '', q6: '',
    q7: '', q8: '', q9: '', q10: '', q11: '', q12: '',
    q13: '', q14: '', q15: '', q16: '', q17: '', q18: '', q19: '',
    q20: '', q21: '', q22: '', q23: '', q24: '', q25: '',
    q26: '', q27: '', q28: '', q29: '', q30: '',
  };
}
