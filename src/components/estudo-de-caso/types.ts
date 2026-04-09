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
  // Etapa 1–3 — Perguntas (3 Pilares × 4 STEP × 3 IME = 36)
  q1: AnswerLetter; q2: AnswerLetter; q3: AnswerLetter; q4: AnswerLetter;
  q5: AnswerLetter; q6: AnswerLetter; q7: AnswerLetter; q8: AnswerLetter;
  q9: AnswerLetter; q10: AnswerLetter; q11: AnswerLetter; q12: AnswerLetter;
  q13: AnswerLetter; q14: AnswerLetter; q15: AnswerLetter; q16: AnswerLetter;
  q17: AnswerLetter; q18: AnswerLetter; q19: AnswerLetter; q20: AnswerLetter;
  q21: AnswerLetter; q22: AnswerLetter; q23: AnswerLetter; q24: AnswerLetter;
  q25: AnswerLetter; q26: AnswerLetter; q27: AnswerLetter; q28: AnswerLetter;
  q29: AnswerLetter; q30: AnswerLetter; q31: AnswerLetter; q32: AnswerLetter;
  q33: AnswerLetter; q34: AnswerLetter; q35: AnswerLetter; q36: AnswerLetter;
}

export type Phase = 'WELCOME' | 'FORM' | 'PROCESSING' | 'REPORT';
export type Status = 'ok' | 'warning' | 'critical';
export type Urgencia = 'baixa' | 'media' | 'alta';
export type STEPDimension = 'S' | 'T' | 'E' | 'P';
export type IMELevel = 'I' | 'M' | 'E';

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

export interface STEPIMECell {
  score: number;
  label: string; // "Iniciando", "Avançando", "Consolidado"
  pilar: string;
  step: STEPDimension;
  ime: IMELevel;
}

export interface STEPIMEMatrix {
  cells: STEPIMECell[];
  // Averages per STEP dimension across all pilares
  stepAverages: Record<STEPDimension, number>;
  // Averages per IME level across all pilares
  imeAverages: Record<IMELevel, number>;
  // Per-pilar STEP averages
  pilarStepScores: Record<string, Record<STEPDimension, number>>;
  // Per-pilar IME averages
  pilarImeScores: Record<string, Record<IMELevel, number>>;
  // Overall score
  overallScore: number;
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
  matrix: STEPIMEMatrix;
  nivelRecomendado: 1 | 2 | 3;
  formData: FormData;
}

export interface QuestionDef {
  id: keyof FormData;
  num: number;
  text: string;
  options: [string, string, string, string, string]; // A, B, C, D, E
  pilar: 'posicionamento' | 'performance' | 'atendimento';
  step: STEPDimension;
  ime: IMELevel;
}

// ── PILAR: POSICIONAMENTO ──

export const QUESTIONS_POSICIONAMENTO: QuestionDef[] = [
  // S — Status do Processo
  { id: 'q1', num: 1, pilar: 'posicionamento', step: 'S', ime: 'I',
    text: 'A clínica possui perfis básicos em plataformas como Google Meu Negócio e redes sociais? Há consistência ou otimização nesses perfis?',
    options: ['Ruim', 'Básica', 'Normal', 'Boa', 'Excelente'] },
  { id: 'q2', num: 2, pilar: 'posicionamento', step: 'S', ime: 'M',
    text: 'Os perfis online da clínica estão ativos, com uma identidade visual definida e postagens frequentes? Como é a gestão de avaliações online?',
    options: ['Ruim', 'Básica', 'Normal', 'Boa', 'Excelente'] },
  { id: 'q3', num: 3, pilar: 'posicionamento', step: 'S', ime: 'E',
    text: 'A clínica possui uma autoridade online consolidada? O SEO local é dominado e a narrativa da marca é única e reconhecida no mercado?',
    options: ['Ruim', 'Básica', 'Normal', 'Boa', 'Excelente'] },
  // T — Membros da Equipe
  { id: 'q4', num: 4, pilar: 'posicionamento', step: 'T', ime: 'I',
    text: 'Quem é o responsável pelas postagens e gestão da presença online da clínica? Existe uma estratégia definida para essas atividades?',
    options: ['Ruim', 'Básica', 'Normal', 'Boa', 'Excelente'] },
  { id: 'q5', num: 5, pilar: 'posicionamento', step: 'T', ime: 'M',
    text: 'A clínica conta com um profissional ou agência dedicada à gestão de redes sociais e conteúdo, com um cronograma de publicações?',
    options: ['Ruim', 'Básica', 'Normal', 'Boa', 'Excelente'] },
  { id: 'q6', num: 6, pilar: 'posicionamento', step: 'T', ime: 'E',
    text: 'A equipe interna ou agência parceira é especializada em branding e produção de conteúdo de alto nível, com foco na área da saúde?',
    options: ['Ruim', 'Básica', 'Normal', 'Boa', 'Excelente'] },
  // E — Ambiente
  { id: 'q7', num: 7, pilar: 'posicionamento', step: 'E', ime: 'I',
    text: 'A clínica possui um site? Qual a qualidade das fotos utilizadas em sua presença online (Google, redes sociais)?',
    options: ['Ruim', 'Básica', 'Normal', 'Boa', 'Excelente'] },
  { id: 'q8', num: 8, pilar: 'posicionamento', step: 'E', ime: 'M',
    text: 'O site da clínica é funcional e possui chamadas para ação (CTAs) claras? As fotos utilizadas são de boa qualidade e atualizadas?',
    options: ['Ruim', 'Básica', 'Normal', 'Boa', 'Excelente'] },
  { id: 'q9', num: 9, pilar: 'posicionamento', step: 'E', ime: 'E',
    text: 'O ecossistema digital da clínica é otimizado, incluindo um site ultra-rápido, landing pages eficazes e fotos profissionais que reforçam a marca?',
    options: ['Ruim', 'Básica', 'Normal', 'Boa', 'Excelente'] },
  // P — Progresso
  { id: 'q10', num: 10, pilar: 'posicionamento', step: 'P', ime: 'I',
    text: 'A clínica monitora a percepção do mercado sobre seus serviços? O público-alvo está claramente definido ou ainda é muito amplo?',
    options: ['Ruim', 'Básica', 'Normal', 'Boa', 'Excelente'] },
  { id: 'q11', num: 11, pilar: 'posicionamento', step: 'P', ime: 'M',
    text: 'Há monitoramento do crescimento de seguidores e avaliações online? O público-alvo é bem segmentado e compreendido?',
    options: ['Ruim', 'Básica', 'Normal', 'Boa', 'Excelente'] },
  { id: 'q12', num: 12, pilar: 'posicionamento', step: 'P', ime: 'E',
    text: 'A clínica monitora métricas como Share of Mind e NPS? O diferencial competitivo é um motor claro para o crescimento e a diferenciação no mercado?',
    options: ['Ruim', 'Básica', 'Normal', 'Boa', 'Excelente'] },
];

// ── PILAR: PERFORMANCE ──

export const QUESTIONS_PERFORMANCE: QuestionDef[] = [
  // S — Status do Processo
  { id: 'q13', num: 13, pilar: 'performance', step: 'S', ime: 'I',
    text: 'A clínica realiza anúncios esporádicos ou apenas "impulsiona" posts? Existe rastreio da origem dos leads?',
    options: ['Ruim', 'Básica', 'Normal', 'Boa', 'Excelente'] },
  { id: 'q14', num: 14, pilar: 'performance', step: 'S', ime: 'M',
    text: 'A clínica mantém campanhas contínuas de tráfego pago (busca e social)? Há uso básico de CRM ou planilhas para gestão de leads?',
    options: ['Ruim', 'Básica', 'Normal', 'Boa', 'Excelente'] },
  { id: 'q15', num: 15, pilar: 'performance', step: 'S', ime: 'E',
    text: 'A clínica opera com funis de marketing complexos, segmentação avançada e automação de marketing para geração de demanda?',
    options: ['Ruim', 'Básica', 'Normal', 'Boa', 'Excelente'] },
  // T — Membros da Equipe
  { id: 'q16', num: 16, pilar: 'performance', step: 'T', ime: 'I',
    text: 'A gestão de tráfego pago é feita pelo proprietário ou por uma agência generalista sem foco em saúde?',
    options: ['Ruim', 'Básica', 'Normal', 'Boa', 'Excelente'] },
  { id: 'q17', num: 17, pilar: 'performance', step: 'T', ime: 'M',
    text: 'A clínica possui um gestor de tráfego dedicado ou uma agência especializada em marketing para a área da saúde?',
    options: ['Ruim', 'Básica', 'Normal', 'Boa', 'Excelente'] },
  { id: 'q18', num: 18, pilar: 'performance', step: 'T', ime: 'E',
    text: 'A clínica conta com um squad de performance focado em ROI, análise de dados e otimização contínua de conversão?',
    options: ['Ruim', 'Básica', 'Normal', 'Boa', 'Excelente'] },
  // E — Ambiente
  { id: 'q19', num: 19, pilar: 'performance', step: 'E', ime: 'I',
    text: 'Os criativos de anúncios são estáticos e simples? A clínica utiliza remarketing?',
    options: ['Ruim', 'Básica', 'Normal', 'Boa', 'Excelente'] },
  { id: 'q20', num: 20, pilar: 'performance', step: 'E', ime: 'M',
    text: 'A clínica utiliza vídeos, depoimentos e remarketing básico em suas campanhas? Há uma biblioteca de criativos?',
    options: ['Ruim', 'Básica', 'Normal', 'Boa', 'Excelente'] },
  { id: 'q21', num: 21, pilar: 'performance', step: 'E', ime: 'E',
    text: 'A clínica possui uma biblioteca de criativos dinâmica, realiza testes A/B constantes e domina diversos canais de aquisição de tráfego?',
    options: ['Ruim', 'Básica', 'Normal', 'Boa', 'Excelente'] },
  // P — Progresso
  { id: 'q22', num: 22, pilar: 'performance', step: 'P', ime: 'I',
    text: 'A clínica sabe qual é o CPL (Custo por Lead)? O fluxo de leads é instável e imprevisível?',
    options: ['Ruim', 'Básica', 'Normal', 'Boa', 'Excelente'] },
  { id: 'q23', num: 23, pilar: 'performance', step: 'P', ime: 'M',
    text: 'O CPL é controlado e o volume de leads é previsível? Há monitoramento das métricas de performance?',
    options: ['Ruim', 'Básica', 'Normal', 'Boa', 'Excelente'] },
  { id: 'q24', num: 24, pilar: 'performance', step: 'P', ime: 'E',
    text: 'O CAC (Custo de Aquisição de Cliente) é otimizado e o investimento em tráfego pago demonstra um ROI claro e escalável?',
    options: ['Ruim', 'Básica', 'Normal', 'Boa', 'Excelente'] },
];

// ── PILAR: ATENDIMENTO ──

export const QUESTIONS_ATENDIMENTO: QuestionDef[] = [
  // S — Status do Processo
  { id: 'q25', num: 25, pilar: 'atendimento', step: 'S', ime: 'I',
    text: 'As respostas aos contatos são lentas e sem padrão? Existe um follow-up estruturado para os leads?',
    options: ['Ruim', 'Básica', 'Normal', 'Boa', 'Excelente'] },
  { id: 'q26', num: 26, pilar: 'atendimento', step: 'S', ime: 'M',
    text: 'A clínica possui um processo de agendamento definido? Há uso de scripts básicos para o atendimento?',
    options: ['Ruim', 'Básica', 'Normal', 'Boa', 'Excelente'] },
  { id: 'q27', num: 27, pilar: 'atendimento', step: 'S', ime: 'E',
    text: 'O processo comercial é consultivo, com follow-up agressivo e o CRM é atualizado em tempo real para otimizar a conversão?',
    options: ['Ruim', 'Básica', 'Normal', 'Boa', 'Excelente'] },
  // T — Membros da Equipe
  { id: 'q28', num: 28, pilar: 'atendimento', step: 'T', ime: 'I',
    text: 'A secretária é sobrecarregada e apenas "anota recados"? A equipe de atendimento é treinada em vendas?',
    options: ['Ruim', 'Básica', 'Normal', 'Boa', 'Excelente'] },
  { id: 'q29', num: 29, pilar: 'atendimento', step: 'T', ime: 'M',
    text: 'A equipe de atendimento é treinada em vendas e contorno de objeções? Há metas de conversão?',
    options: ['Ruim', 'Básica', 'Normal', 'Boa', 'Excelente'] },
  { id: 'q30', num: 30, pilar: 'atendimento', step: 'T', ime: 'E',
    text: 'A clínica conta com SDRs ou consultores de vendas dedicados, com foco em metas e performance?',
    options: ['Ruim', 'Básica', 'Normal', 'Boa', 'Excelente'] },
  // E — Ambiente
  { id: 'q31', num: 31, pilar: 'atendimento', step: 'E', ime: 'I',
    text: 'A comunicação com os leads é fria e apenas por texto? O horário de atendimento é rígido?',
    options: ['Ruim', 'Básica', 'Normal', 'Boa', 'Excelente'] },
  { id: 'q32', num: 32, pilar: 'atendimento', step: 'E', ime: 'M',
    text: 'A clínica utiliza áudios, vídeos e oferece atendimento estendido ou via chatbot? A comunicação é personalizada?',
    options: ['Ruim', 'Básica', 'Normal', 'Boa', 'Excelente'] },
  { id: 'q33', num: 33, pilar: 'atendimento', step: 'E', ime: 'E',
    text: 'A clínica proporciona uma experiência de "concierge", com personalização extrema e agilidade imediata no atendimento?',
    options: ['Ruim', 'Básica', 'Normal', 'Boa', 'Excelente'] },
  // P — Progresso
  { id: 'q34', num: 34, pilar: 'atendimento', step: 'P', ime: 'I',
    text: 'A taxa de conversão de leads em agendamentos é baixa ou desconhecida? Há muitos "no-shows"?',
    options: ['Ruim', 'Básica', 'Normal', 'Boa', 'Excelente'] },
  { id: 'q35', num: 35, pilar: 'atendimento', step: 'P', ime: 'M',
    text: 'A clínica monitora as taxas de agendamento e comparecimento? Existem metas individuais para a equipe de atendimento?',
    options: ['Ruim', 'Básica', 'Normal', 'Boa', 'Excelente'] },
  { id: 'q36', num: 36, pilar: 'atendimento', step: 'P', ime: 'E',
    text: 'A clínica possui um LTV alto, com indicação ativa de pacientes e taxas de conversão acima da média do mercado?',
    options: ['Ruim', 'Básica', 'Normal', 'Boa', 'Excelente'] },
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
  2: ['q13', 'q14', 'q15', 'q16', 'q17', 'q18', 'q19', 'q20', 'q21', 'q22', 'q23', 'q24'],
  3: ['q25', 'q26', 'q27', 'q28', 'q29', 'q30', 'q31', 'q32', 'q33', 'q34', 'q35', 'q36'],
};

export const STEP_LABELS: Record<STEPDimension, { short: string; full: string }> = {
  S: { short: 'S', full: 'Status do Paciente/Processo' },
  T: { short: 'T', full: 'Membros da Equipe' },
  E: { short: 'E', full: 'Ambiente' },
  P: { short: 'P', full: 'Progresso à Meta' },
};

export const IME_LABELS: Record<IMELevel, { short: string; full: string }> = {
  I: { short: 'I', full: 'Implementação' },
  M: { short: 'M', full: 'Maturação' },
  E: { short: 'E', full: 'Escala' },
};

export function getEmptyFormData(): FormData {
  return {
    nomeClinica: '', cnpj: '', email: '', telefone: '',
    especialidade: '', cidade: '',
    faturamentoAtual: '', faturamentoDesejado: '', ticketMedio: '',
    procedimentosMes: '', taxaConversao: '',
    q1: '', q2: '', q3: '', q4: '', q5: '', q6: '',
    q7: '', q8: '', q9: '', q10: '', q11: '', q12: '',
    q13: '', q14: '', q15: '', q16: '', q17: '', q18: '',
    q19: '', q20: '', q21: '', q22: '', q23: '', q24: '',
    q25: '', q26: '', q27: '', q28: '', q29: '', q30: '',
    q31: '', q32: '', q33: '', q34: '', q35: '', q36: '',
  };
}
