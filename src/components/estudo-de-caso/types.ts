export interface FormData {
  // Etapa 0 — Identificação
  nomeClinica: string;
  especialidade: string;
  cidade: string;
  faturamentoAtual: string;
  faturamentoDesejado: string;
  ticketMedio: string;
  procedimentosMes: string;
  taxaConversao: string;

  // Etapa 1 — Posicionamento
  gmb_status: string;
  gmb_fotos: string;
  gmb_avaliacoes: string;
  site_status: string;
  site_cta: string;
  site_velocidade: string;
  social_frequencia: string;
  social_provas: string;
  social_bio: string;
  posicao_publicoAlvo: string;
  posicao_diferencial: string;
  posicao_proposta: string;

  // Etapa 2 — Performance
  trafego_investimento: string;
  trafego_criativos: string;
  trafego_remarketing: string;
  trafego_cpl: string;
  demanda_previsibilidade: string;
  demanda_origem: string;
  demanda_qualificacao: string;

  // Etapa 3 — Atendimento
  atend_tempoResposta: string;
  atend_cobertura: string;
  atend_humanizacao: string;
  atend_geraValor: string;
  atend_script: string;
  atend_objecoes: string;
  atend_followup: string;
  atend_taxaAgendamento: string;
  atend_taxaComparecimento: string;
  atend_taxaConversaoConsulta: string;
  atend_posVenda: string;
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
}

export const WHATSAPP_URL = "https://wa.me/5544991274335?text=Jo%C3%A3o%2C%20analisei%20a%20proposta%20e%20tenho%20interesse!";

export const FORM_STEPS = [
  { id: 0, badge: 'IDENTIFICAÇÃO', title: 'Dados básicos da operação' },
  { id: 1, badge: 'ETAPA 1 DE 3 — POSICIONAMENTO', title: 'Como a clínica é percebida no mercado' },
  { id: 2, badge: 'ETAPA 2 DE 3 — PERFORMANCE', title: 'Como a clínica gera e qualifica demanda' },
  { id: 3, badge: 'ETAPA 3 DE 3 — ATENDIMENTO', title: 'O que acontece depois que o lead chega' },
] as const;

export const STEP_FIELDS: Record<number, (keyof FormData)[]> = {
  0: ['nomeClinica', 'especialidade', 'cidade', 'faturamentoAtual', 'faturamentoDesejado', 'ticketMedio', 'procedimentosMes', 'taxaConversao'],
  1: ['gmb_status', 'gmb_fotos', 'gmb_avaliacoes', 'site_status', 'site_cta', 'site_velocidade', 'social_frequencia', 'social_provas', 'social_bio', 'posicao_publicoAlvo', 'posicao_diferencial', 'posicao_proposta'],
  2: ['trafego_investimento', 'trafego_criativos', 'trafego_remarketing', 'trafego_cpl', 'demanda_previsibilidade', 'demanda_origem', 'demanda_qualificacao'],
  3: ['atend_tempoResposta', 'atend_cobertura', 'atend_humanizacao', 'atend_geraValor', 'atend_script', 'atend_objecoes', 'atend_followup', 'atend_taxaAgendamento', 'atend_taxaComparecimento', 'atend_taxaConversaoConsulta', 'atend_posVenda'],
};

export function getEmptyFormData(): FormData {
  return {
    nomeClinica: '', especialidade: '', cidade: '',
    faturamentoAtual: '', faturamentoDesejado: '', ticketMedio: '',
    procedimentosMes: '', taxaConversao: '',
    gmb_status: '', gmb_fotos: '', gmb_avaliacoes: '',
    site_status: '', site_cta: '', site_velocidade: '',
    social_frequencia: '', social_provas: '', social_bio: '',
    posicao_publicoAlvo: '', posicao_diferencial: '', posicao_proposta: '',
    trafego_investimento: '', trafego_criativos: '', trafego_remarketing: '',
    trafego_cpl: '', demanda_previsibilidade: '', demanda_origem: '',
    demanda_qualificacao: '',
    atend_tempoResposta: '', atend_cobertura: '', atend_humanizacao: '',
    atend_geraValor: '', atend_script: '', atend_objecoes: '',
    atend_followup: '', atend_taxaAgendamento: '', atend_taxaComparecimento: '',
    atend_taxaConversaoConsulta: '', atend_posVenda: '',
  };
}
