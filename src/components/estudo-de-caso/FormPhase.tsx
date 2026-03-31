import { useState, useRef, useEffect } from 'react';
import { FormData, FORM_STEPS, STEP_FIELDS, getEmptyFormData } from './types';
import { ChevronLeft } from 'lucide-react';

interface FormPhaseProps {
  onSubmit: (data: FormData) => void;
}

type FieldFormat = 'text' | 'currency' | 'percent' | 'number';

const FIELD_CONFIG: Record<string, { label: string; placeholder: string; type?: 'input'; format?: FieldFormat }> = {
  // Etapa 0
  nomeClinica: { label: 'Nome da clínica', placeholder: 'Ex: Clínica Dra. Camila — Cirurgia Plástica', type: 'input' },
  especialidade: { label: 'Especialidade principal', placeholder: 'Ex: Cirurgia plástica estética e reconstrutiva', type: 'input' },
  cidade: { label: 'Cidade e estado', placeholder: 'Ex: Maringá — PR', type: 'input' },
  faturamentoAtual: { label: 'Faturamento mensal atual', placeholder: 'Ex: 180000', type: 'input', format: 'currency' },
  faturamentoDesejado: { label: 'Faturamento desejado em 12 meses', placeholder: 'Ex: 350000', type: 'input', format: 'currency' },
  ticketMedio: { label: 'Ticket médio por procedimento', placeholder: 'Ex: 12000', type: 'input', format: 'currency' },
  procedimentosMes: { label: 'Procedimentos realizados por mês', placeholder: 'Ex: 15', type: 'input', format: 'number' },
  taxaConversao: { label: 'Taxa de conversão atual estimada', placeholder: 'Ex: 10', type: 'input', format: 'percent' },
  // Etapa 1 — Posicionamento
  gmb_status: { label: 'Situação atual do perfil no Google', placeholder: 'Ex: Perfil verificado, nota 4.6, 87 avaliações. Respondemos quase todas.' },
  gmb_fotos: { label: 'Qualidade das fotos e atualização', placeholder: 'Ex: Fotos profissionais da clínica, equipe e procedimentos. Atualizadas há 3 meses.' },
  gmb_avaliacoes: { label: 'Como lida com as avaliações negativas', placeholder: 'Ex: Raramente respondemos. Temos 2 avaliações negativas sem resposta.' },
  site_status: { label: 'Situação atual do site ou landing page', placeholder: 'Ex: Site em WordPress, design de 2021, não é responsivo no mobile.' },
  site_cta: { label: 'Os CTAs de contato estão visíveis e funcionando?', placeholder: 'Ex: Tem um botão de WhatsApp mas fica escondido. Nenhum formulário.' },
  site_velocidade: { label: 'Percepção de velocidade e experiência', placeholder: 'Ex: Carrega lento, principalmente no celular.' },
  social_frequencia: { label: 'Frequência e consistência de posts', placeholder: 'Ex: Posta 2–3 vezes por semana mas sem padrão visual.' },
  social_provas: { label: 'Uso de depoimentos, antes/depois, bastidores', placeholder: 'Ex: Raramente. Tem medo de expor pacientes mesmo com autorização.' },
  social_bio: { label: 'Bio e direcionamento das redes', placeholder: 'Ex: Bio genérica: "Dra. X — CRM 12345 — Cirurgia Plástica". Sem CTA claro.' },
  posicao_publicoAlvo: { label: 'O público-alvo está definido na comunicação?', placeholder: 'Ex: Atende qualquer perfil. Não há segmentação clara.' },
  posicao_diferencial: { label: 'Qual o diferencial percebido pelos pacientes?', placeholder: 'Ex: Excelência técnica, mas não comunicada.' },
  posicao_proposta: { label: 'Qual a promessa principal de valor da clínica?', placeholder: 'Ex: "Resultados naturais com segurança" — mas está em nenhum lugar.' },
  // Etapa 2 — Performance
  trafego_investimento: { label: 'Investe em tráfego pago? Quanto?', placeholder: 'Ex: R$ 5.000/mês em Meta Ads.' },
  trafego_criativos: { label: 'Como são os criativos e a oferta', placeholder: 'Ex: Imagens de stock genéricas. Nenhum vídeo. Copy focado em desconto.' },
  trafego_remarketing: { label: 'Usa remarketing? Como?', placeholder: 'Ex: Não. Leads que não converteram são descartados.' },
  trafego_cpl: { label: 'Sabe o custo por lead (CPL)?', placeholder: 'Ex: Não mensura.' },
  demanda_previsibilidade: { label: 'A geração de leads é previsível?', placeholder: 'Ex: Oscila muito. Setembro foi bom, outubro veio quase nada.' },
  demanda_origem: { label: 'De onde vêm os leads? Proporção', placeholder: 'Ex: 60% indicação, 30% Instagram orgânico, 10% anúncio pago.' },
  demanda_qualificacao: { label: 'Tem sistema de qualificação de leads?', placeholder: 'Ex: Não. Tudo cai no WhatsApp da secretária.' },
  // Etapa 3 — Atendimento
  atend_tempoResposta: { label: 'Qual o tempo médio de resposta a novos contatos?', placeholder: 'Ex: Entre 2 e 4 horas.' },
  atend_cobertura: { label: 'Há cobertura fora do horário comercial?', placeholder: 'Ex: Não. Mensagens recebidas à noite são respondidas no dia seguinte.' },
  atend_humanizacao: { label: 'A comunicação é humanizada e personalizada?', placeholder: 'Ex: Parcialmente. A secretária usa o nome do paciente.' },
  atend_geraValor: { label: 'A equipe gera valor além de informar preço?', placeholder: 'Ex: Não. O primeiro contato é: "O procedimento custa R$ X."' },
  atend_script: { label: 'Usa script estruturado de atendimento?', placeholder: 'Ex: Não tem script. Cada secretária atende de um jeito.' },
  atend_objecoes: { label: 'Como lida com objeções de preço e dúvidas?', placeholder: 'Ex: Se o paciente diz que está caro, não sabe o que responder.' },
  atend_followup: { label: 'Faz follow-up com leads que não agendaram?', placeholder: 'Ex: Não. Se o paciente sumiu, a clínica não retoma o contato.' },
  atend_taxaAgendamento: { label: 'Taxa de conversão de leads em agendamentos', placeholder: 'Ex: 20', format: 'percent', type: 'input' },
  atend_taxaComparecimento: { label: 'Taxa de comparecimento dos agendados', placeholder: 'Ex: 70', format: 'percent', type: 'input' },
  atend_taxaConversaoConsulta: { label: 'Taxa de conversão da consulta em cirurgia', placeholder: 'Ex: 45', format: 'percent', type: 'input' },
  atend_posVenda: { label: 'Tem processo de pós-venda e retenção?', placeholder: 'Ex: Não. Depois da cirurgia, nenhum contato estruturado.' },
};

const STEP_BLOCKS: Record<number, { title: string; fields: string[] }[]> = {
  0: [{ title: '', fields: STEP_FIELDS[0] as unknown as string[] }],
  1: [
    { title: 'Google Meu Negócio', fields: ['gmb_status', 'gmb_fotos', 'gmb_avaliacoes'] },
    { title: 'Site / Landing Page', fields: ['site_status', 'site_cta', 'site_velocidade'] },
    { title: 'Redes Sociais', fields: ['social_frequencia', 'social_provas', 'social_bio'] },
    { title: 'Diferenciação', fields: ['posicao_publicoAlvo', 'posicao_diferencial', 'posicao_proposta'] },
  ],
  2: [
    { title: 'Tráfego Pago', fields: ['trafego_investimento', 'trafego_criativos', 'trafego_remarketing', 'trafego_cpl'] },
    { title: 'Qualidade da Demanda', fields: ['demanda_previsibilidade', 'demanda_origem', 'demanda_qualificacao'] },
  ],
  3: [
    { title: 'Processo de Resposta', fields: ['atend_tempoResposta', 'atend_cobertura', 'atend_humanizacao'] },
    { title: 'Qualidade do Atendimento', fields: ['atend_geraValor', 'atend_script', 'atend_objecoes'] },
    { title: 'Follow-up e Conversão', fields: ['atend_followup', 'atend_taxaAgendamento', 'atend_taxaComparecimento', 'atend_taxaConversaoConsulta', 'atend_posVenda'] },
  ],
};

const formatCurrency = (value: string): string => {
  const nums = value.replace(/\D/g, '');
  if (!nums) return '';
  const n = parseInt(nums, 10);
  return n.toLocaleString('pt-BR');
};

const formatNumber = (value: string): string => {
  return value.replace(/\D/g, '');
};

const formatPercent = (value: string): string => {
  const nums = value.replace(/[^\d.,]/g, '').replace(',', '.');
  if (!nums) return '';
  // Allow decimal percentages like 10.5
  const match = nums.match(/^(\d+\.?\d{0,2})/);
  return match ? match[1].replace('.', ',') : '';
};

const FormPhase = ({ onSubmit }: FormPhaseProps) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(getEmptyFormData());
  const topRef = useRef<HTMLDivElement>(null);

  const currentFields = STEP_FIELDS[step] || [];
  const allFilled = currentFields.every((f) => {
    const config = FIELD_CONFIG[f];
    const val = data[f].trim();
    if (config?.format === 'currency' || config?.format === 'number' || config?.format === 'percent') {
      return val.length >= 1;
    }
    return val.length >= 3;
  });
  const totalSteps = 4;
  const progress = ((step + 1) / totalSteps) * 100;

  const handleChange = (field: keyof FormData, value: string, format?: FieldFormat) => {
    let formatted = value;
    if (format === 'currency') {
      formatted = formatCurrency(value);
    } else if (format === 'number') {
      formatted = formatNumber(value);
    } else if (format === 'percent') {
      formatted = formatPercent(value);
    }
    setData((prev) => ({ ...prev, [field]: formatted }));
  };

  const scrollToTop = () => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Also handle iframe scroll
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
      setTimeout(scrollToTop, 50);
    } else {
      onSubmit(data);
    }
  };

  const stepInfo = FORM_STEPS[step];
  const blocks = STEP_BLOCKS[step];

  const renderInput = (field: string, config: typeof FIELD_CONFIG[string], key: keyof FormData) => {
    const format = config.format || 'text';

    if (format === 'currency') {
      return (
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">R$</span>
          <input
            type="text"
            inputMode="numeric"
            value={data[key]}
            onChange={(e) => handleChange(key, e.target.value, 'currency')}
            placeholder={config.placeholder}
            className="w-full border border-border rounded-lg pl-11 pr-4 py-3 text-sm text-foreground bg-background placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      );
    }

    if (format === 'percent') {
      return (
        <div className="relative">
          <input
            type="text"
            inputMode="decimal"
            value={data[key]}
            onChange={(e) => handleChange(key, e.target.value, 'percent')}
            placeholder={config.placeholder}
            className="w-full border border-border rounded-lg px-4 pr-10 py-3 text-sm text-foreground bg-background placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">%</span>
        </div>
      );
    }

    if (format === 'number') {
      return (
        <input
          type="text"
          inputMode="numeric"
          value={data[key]}
          onChange={(e) => handleChange(key, e.target.value, 'number')}
          placeholder={config.placeholder}
          className="w-full border border-border rounded-lg px-4 py-3 text-sm text-foreground bg-background placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors"
        />
      );
    }

    // Text input or textarea
    if (config.type === 'input') {
      return (
        <input
          type="text"
          value={data[key]}
          onChange={(e) => handleChange(key, e.target.value)}
          placeholder={config.placeholder}
          className="w-full border border-border rounded-lg px-4 py-3 text-sm text-foreground bg-background placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors"
        />
      );
    }

    return (
      <textarea
        value={data[key]}
        onChange={(e) => handleChange(key, e.target.value)}
        placeholder={config.placeholder}
        className="w-full border border-border rounded-lg px-4 py-3 text-sm text-foreground bg-background placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors min-h-[80px] resize-y"
      />
    );
  };

  return (
    <div className="min-h-screen bg-surface-dark flex items-center justify-center p-4 py-12">
      <div ref={topRef} className="w-full max-w-[760px] bg-card rounded-2xl shadow-2xl overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-border">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-6 md:p-10">
          {/* Badge */}
          <span className="inline-block text-xs font-semibold tracking-widest uppercase bg-primary/10 text-primary px-3 py-1 rounded-full mb-4">
            {stepInfo.badge}
          </span>

          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2 font-display">
            {stepInfo.title}
          </h2>

          {step === 3 && (
            <p className="text-primary text-sm font-semibold mb-6">
              ⚠ Este pilar define 70% do faturamento da clínica
            </p>
          )}

          {/* Fields */}
          <div className="space-y-8 mt-6">
            {blocks.map((block, bi) => (
              <div key={bi}>
                {block.title && (
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 border-b border-border pb-2">
                    {block.title}
                  </h3>
                )}
                <div className="space-y-4">
                  {block.fields.map((field) => {
                    const config = FIELD_CONFIG[field];
                    if (!config) return null;
                    const key = field as keyof FormData;
                    return (
                      <div key={field}>
                        <label className="block text-[13px] font-semibold text-foreground mb-1.5">
                          {config.label}
                        </label>
                        {renderInput(field, config, key)}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="mt-8 space-y-3">
            <button
              onClick={handleNext}
              disabled={!allFilled}
              className="w-full bg-primary hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed text-primary-foreground font-semibold py-4 px-6 rounded-xl text-base transition-colors"
            >
              {step < 3 ? '→ PRÓXIMA ETAPA' : '→ GERAR DIAGNÓSTICO COMPLETO'}
            </button>

            {step > 0 && (
              <button
                onClick={() => { setStep(step - 1); setTimeout(scrollToTop, 50); }}
                className="w-full flex items-center justify-center gap-1 text-muted-foreground hover:text-foreground text-sm py-2 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" /> Etapa anterior
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormPhase;
