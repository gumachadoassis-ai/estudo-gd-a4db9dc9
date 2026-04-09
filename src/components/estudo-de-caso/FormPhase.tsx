import { useState, useRef } from 'react';
import { ChevronLeft } from 'lucide-react';
import type { FormData, AnswerLetter, QuestionDef, STEPDimension } from './types';
import {
  FORM_STEPS, STEP_FIELDS, getEmptyFormData,
  QUESTIONS_POSICIONAMENTO, QUESTIONS_PERFORMANCE, QUESTIONS_ATENDIMENTO,
  STEP_LABELS,
} from './types';

interface FormPhaseProps {
  onSubmit: (data: FormData) => void;
}

type FieldFormat = 'text' | 'currency' | 'percent' | 'number' | 'cnpj' | 'telefone';

const BASIC_FIELDS: Record<string, { label: string; placeholder: string; format?: FieldFormat }> = {
  nomeClinica: { label: 'Nome da clínica', placeholder: 'Ex: Clínica Dra. Camila' },
  cnpj: { label: 'CNPJ', placeholder: '12345678000199', format: 'cnpj' },
  email: { label: 'E-mail', placeholder: 'Ex: contato@clinica.com.br' },
  telefone: { label: 'Telefone', placeholder: '44999999999', format: 'telefone' },
  especialidade: { label: 'Especialidade principal', placeholder: 'Ex: Cirurgia plástica estética' },
  cidade: { label: 'Cidade e estado', placeholder: 'Ex: Maringá — PR' },
  faturamentoAtual: { label: 'Faturamento mensal atual', placeholder: '180.000', format: 'currency' },
  faturamentoDesejado: { label: 'Faturamento desejado em 12 meses', placeholder: '350.000', format: 'currency' },
  ticketMedio: { label: 'Ticket médio por procedimento', placeholder: '12.000', format: 'currency' },
  procedimentosMes: { label: 'Procedimentos realizados por mês', placeholder: '15', format: 'number' },
  taxaConversao: { label: 'Taxa de conversão atual estimada', placeholder: '10', format: 'percent' },
};

// Group questions by STEP dimension for each pilar step
function groupBySTEP(questions: QuestionDef[]): { step: STEPDimension; title: string; questions: QuestionDef[] }[] {
  const steps: STEPDimension[] = ['S', 'T', 'E', 'P'];
  return steps.map((s) => ({
    step: s,
    title: `${STEP_LABELS[s].short} — ${STEP_LABELS[s].full}`,
    questions: questions.filter((q) => q.step === s),
  })).filter((g) => g.questions.length > 0);
}

const STEP_SECTIONS: Record<number, { title: string; questions: QuestionDef[] }[]> = {
  1: groupBySTEP(QUESTIONS_POSICIONAMENTO).map((g) => ({ title: g.title, questions: g.questions })),
  2: groupBySTEP(QUESTIONS_PERFORMANCE).map((g) => ({ title: g.title, questions: g.questions })),
  3: groupBySTEP(QUESTIONS_ATENDIMENTO).map((g) => ({ title: g.title, questions: g.questions })),
};

const LETTERS: AnswerLetter[] = ['A', 'B', 'C', 'D', 'E'];
const LETTER_LABELS = ['Ruim', 'Básica', 'Normal', 'Boa', 'Excelente'];

const formatCurrency = (value: string): string => {
  const nums = value.replace(/\D/g, '');
  if (!nums) return '';
  return parseInt(nums, 10).toLocaleString('pt-BR');
};

const formatNumber = (value: string): string => value.replace(/\D/g, '');

const formatCNPJ = (value: string): string => {
  const nums = value.replace(/\D/g, '').slice(0, 14);
  if (nums.length <= 2) return nums;
  if (nums.length <= 5) return `${nums.slice(0, 2)}.${nums.slice(2)}`;
  if (nums.length <= 8) return `${nums.slice(0, 2)}.${nums.slice(2, 5)}.${nums.slice(5)}`;
  if (nums.length <= 12) return `${nums.slice(0, 2)}.${nums.slice(2, 5)}.${nums.slice(5, 8)}/${nums.slice(8)}`;
  return `${nums.slice(0, 2)}.${nums.slice(2, 5)}.${nums.slice(5, 8)}/${nums.slice(8, 12)}-${nums.slice(12)}`;
};

const formatTelefone = (value: string): string => {
  const nums = value.replace(/\D/g, '').slice(0, 11);
  if (nums.length <= 2) return nums.length ? `(${nums}` : '';
  if (nums.length <= 7) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`;
  if (nums.length <= 10) return `(${nums.slice(0, 2)}) ${nums.slice(2, 6)}-${nums.slice(6)}`;
  return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`;
};

const formatPercent = (value: string): string => {
  const nums = value.replace(/[^\d.,]/g, '').replace(',', '.');
  if (!nums) return '';
  const match = nums.match(/^(\d+\.?\d{0,2})/);
  return match ? match[1].replace('.', ',') : '';
};

const FormPhase = ({ onSubmit }: FormPhaseProps) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(getEmptyFormData());
  const topRef = useRef<HTMLDivElement>(null);

  const currentFields = STEP_FIELDS[step] || [];
  const allFilled = currentFields.every((f) => {
    const val = data[f];
    if (typeof val !== 'string') return false;
    return val.trim().length >= 1;
  });

  const totalSteps = 4;
  const progress = ((step + 1) / totalSteps) * 100;

  const handleBasicChange = (field: keyof FormData, value: string, format?: FieldFormat) => {
    let formatted = value;
    if (format === 'currency') formatted = formatCurrency(value);
    else if (format === 'number') formatted = formatNumber(value);
    else if (format === 'percent') formatted = formatPercent(value);
    else if (format === 'cnpj') formatted = formatCNPJ(value);
    else if (format === 'telefone') formatted = formatTelefone(value);
    setData((prev) => ({ ...prev, [field]: formatted }));
  };

  const handleAnswer = (field: keyof FormData, letter: AnswerLetter) => {
    setData((prev) => ({ ...prev, [field]: letter }));
  };

  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const renderBasicInput = (field: string) => {
    const config = BASIC_FIELDS[field];
    if (!config) return null;
    const key = field as keyof FormData;
    const format = config.format || 'text';

    return (
      <div key={field}>
        <label className="block text-[13px] font-semibold text-foreground mb-1.5">{config.label}</label>
        {format === 'currency' ? (
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">R$</span>
            <input type="text" inputMode="numeric" value={data[key] as string}
              onChange={(e) => handleBasicChange(key, e.target.value, 'currency')}
              placeholder={config.placeholder}
              className="w-full border border-border rounded-lg pl-11 pr-4 py-3 text-sm text-foreground bg-background placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors" />
          </div>
        ) : format === 'percent' ? (
          <div className="relative">
            <input type="text" inputMode="decimal" value={data[key] as string}
              onChange={(e) => handleBasicChange(key, e.target.value, 'percent')}
              placeholder={config.placeholder}
              className="w-full border border-border rounded-lg px-4 pr-10 py-3 text-sm text-foreground bg-background placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors" />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">%</span>
          </div>
        ) : format === 'number' ? (
          <input type="text" inputMode="numeric" value={data[key] as string}
            onChange={(e) => handleBasicChange(key, e.target.value, 'number')}
            placeholder={config.placeholder}
            className="w-full border border-border rounded-lg px-4 py-3 text-sm text-foreground bg-background placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors" />
        ) : format === 'cnpj' ? (
          <input type="text" inputMode="numeric" value={data[key] as string}
            onChange={(e) => handleBasicChange(key, e.target.value, 'cnpj')}
            placeholder={config.placeholder} maxLength={18}
            className="w-full border border-border rounded-lg px-4 py-3 text-sm text-foreground bg-background placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors" />
        ) : format === 'telefone' ? (
          <input type="text" inputMode="numeric" value={data[key] as string}
            onChange={(e) => handleBasicChange(key, e.target.value, 'telefone')}
            placeholder={config.placeholder} maxLength={15}
            className="w-full border border-border rounded-lg px-4 py-3 text-sm text-foreground bg-background placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors" />
        ) : (
          <input type="text" value={data[key] as string}
            onChange={(e) => handleBasicChange(key, e.target.value)}
            placeholder={config.placeholder}
            className="w-full border border-border rounded-lg px-4 py-3 text-sm text-foreground bg-background placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors" />
        )}
      </div>
    );
  };

  const renderQuestion = (q: QuestionDef) => {
    const selected = data[q.id] as AnswerLetter;
    const imeLabel = q.ime === 'I' ? 'Implementação' : q.ime === 'M' ? 'Maturação' : 'Escala';

    return (
      <div key={q.id} className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
            q.ime === 'I' ? 'bg-orange-500/15 text-orange-400' :
            q.ime === 'M' ? 'bg-amber-500/15 text-amber-400' :
            'bg-emerald-500/15 text-emerald-400'
          }`}>
            {imeLabel}
          </span>
        </div>
        <p className="text-[13px] font-semibold text-foreground mb-3">
          <span className="text-muted-foreground mr-1.5">{q.num}.</span>{q.text}
        </p>
        <div className="grid grid-cols-5 gap-2">
          {LETTERS.map((letter, idx) => {
            const isSelected = selected === letter;
            return (
              <button
                key={letter}
                type="button"
                onClick={() => handleAnswer(q.id, letter)}
                className={`
                  text-center px-2 py-3 rounded-lg border text-xs transition-all
                  ${isSelected
                    ? 'border-primary bg-primary/10 text-foreground font-bold'
                    : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:bg-primary/5'
                  }
                `}
              >
                <span className={`block text-sm font-bold mb-0.5 ${isSelected ? 'text-primary' : 'text-muted-foreground/60'}`}>{letter}</span>
                <span className="block text-[10px] leading-tight">{LETTER_LABELS[idx]}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-surface-dark flex items-center justify-center p-4 py-12">
      <div ref={topRef} className="w-full max-w-[760px] bg-card rounded-2xl shadow-2xl overflow-hidden">
        <div className="h-1 bg-border">
          <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
        </div>

        <div className="p-6 md:p-10">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase bg-primary/10 text-primary px-3 py-1 rounded-full mb-4">
            {stepInfo.badge}
          </span>

          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2 font-display">{stepInfo.title}</h2>

          {step === 3 && (
            <p className="text-primary text-sm font-semibold mb-6">
              Este pilar define 70% do faturamento da clínica
            </p>
          )}

          <div className="space-y-4 mt-6">
            {step === 0 ? (
              currentFields.map((f) => renderBasicInput(f))
            ) : (
              STEP_SECTIONS[step]?.map((section, si) => (
                <div key={si}>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 border-b border-border pb-2 flex items-center gap-2">
                    <span className="bg-primary/20 text-primary w-6 h-6 rounded flex items-center justify-center text-[11px] font-bold">
                      {section.title.charAt(0)}
                    </span>
                    {section.title}
                  </h3>
                  {section.questions.map(renderQuestion)}
                </div>
              ))
            )}
          </div>

          <div className="mt-8 space-y-3">
            <button
              onClick={handleNext}
              disabled={!allFilled}
              className="w-full bg-primary hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed text-primary-foreground font-semibold py-4 px-6 rounded-xl text-base transition-colors"
            >
              {step < 3 ? 'PRÓXIMA ETAPA' : 'GERAR ESTUDO DE CASO'}
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
