import { useMemo } from 'react';
import type { Relatorio, STEPDimension, IMELevel } from './types';
import { STEP_LABELS, IME_LABELS } from './types';

interface STEPMatrixProps {
  relatorio: Relatorio;
}

const STEPS: STEPDimension[] = ['S', 'T', 'E', 'P'];
const IMES: IMELevel[] = ['I', 'M', 'E'];

const IME_COLORS: Record<IMELevel, { bg: string; bgActive: string; text: string }> = {
  I: { bg: 'bg-orange-950/40', bgActive: 'bg-orange-900/60', text: 'text-orange-300' },
  M: { bg: 'bg-amber-950/40', bgActive: 'bg-amber-800/50', text: 'text-amber-300' },
  E: { bg: 'bg-orange-600/30', bgActive: 'bg-orange-500/40', text: 'text-orange-200' },
};

function getStatusLabel(score: number): string {
  if (score >= 66) return 'Consolidado';
  if (score >= 36) return 'Avançando';
  return 'Iniciando';
}

function getStatusColor(score: number): string {
  if (score >= 66) return 'text-emerald-400';
  if (score >= 36) return 'text-amber-400';
  return 'text-orange-400';
}

const STEPMatrix = ({ relatorio }: STEPMatrixProps) => {
  const { matrix } = relatorio;

  // Build grid data: for each IME level, show the STEP averages across all pilares
  const gridData = useMemo(() => {
    return IMES.map((ime) => ({
      ime,
      label: IME_LABELS[ime].full,
      cells: STEPS.map((step) => {
        // Average this STEP×IME across all 3 pilares
        const pilarScores = ['posicionamento', 'performance', 'atendimento'].map((pilar) => {
          const cell = matrix.cells.find((c) => c.pilar === pilar && c.step === step && c.ime === ime);
          return cell?.score ?? 0;
        });
        const avg = Math.round(pilarScores.reduce((a, b) => a + b, 0) / pilarScores.length);
        return { step, score: avg, label: getStatusLabel(avg) };
      }),
    }));
  }, [matrix]);

  return (
    <section className="bg-surface-dark py-14 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <p className="text-[10px] tracking-[0.2em] uppercase text-primary-foreground/40 font-display mb-1">Construção de Hipóteses</p>
          <h2 className="text-xl md:text-2xl font-bold text-primary-foreground font-display">Completude por dimensão e fase de maturidade</h2>
        </div>

        {/* Matrix Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Header row */}
            <div className="grid grid-cols-[100px_1fr_1fr_1fr_1fr] gap-1 mb-1">
              <div /> {/* empty corner */}
              {STEPS.map((step) => (
                <div key={step} className="bg-primary-foreground/[0.06] rounded-lg px-3 py-3 text-center">
                  <span className="text-primary font-bold text-lg font-display">{step}</span>
                  <p className="text-[9px] text-primary-foreground/50 mt-0.5 leading-tight">{STEP_LABELS[step].full}</p>
                </div>
              ))}
            </div>

            {/* IME rows */}
            {gridData.map((row) => (
              <div key={row.ime} className="grid grid-cols-[100px_1fr_1fr_1fr_1fr] gap-1 mb-1">
                {/* Row label */}
                <div className={`${IME_COLORS[row.ime].bg} rounded-lg px-3 py-4 flex flex-col justify-center`}>
                  <span className={`text-lg font-bold font-display ${IME_COLORS[row.ime].text}`}>{row.ime}</span>
                  <p className="text-[9px] text-primary-foreground/50 leading-tight">{row.label}</p>
                </div>

                {/* Cells */}
                {row.cells.map((cell) => (
                  <div key={cell.step} className={`${IME_COLORS[row.ime].bgActive} rounded-lg px-4 py-4 flex flex-col items-center justify-center`}>
                    <span className="text-2xl md:text-3xl font-bold text-primary-foreground font-display">{cell.score}%</span>
                    <span className={`text-[10px] font-medium mt-1 ${getStatusColor(cell.score)}`}>{cell.label}</span>
                    {/* Progress bar */}
                    <div className="w-full h-1.5 bg-black/30 rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${cell.score}%`,
                          backgroundColor: cell.score >= 66 ? '#34d399' : cell.score >= 36 ? '#fbbf24' : '#f97316',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* STEP Averages Summary */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
          {STEPS.map((step) => (
            <div key={step} className="bg-primary-foreground/[0.04] border border-primary-foreground/10 rounded-xl p-4 text-center">
              <span className="text-primary font-bold text-sm font-display">{STEP_LABELS[step].short}</span>
              <p className="text-2xl font-bold text-primary-foreground font-display mt-1">{matrix.stepAverages[step]}%</p>
              <p className={`text-[10px] mt-1 ${getStatusColor(matrix.stepAverages[step])}`}>
                {getStatusLabel(matrix.stepAverages[step])}
              </p>
            </div>
          ))}
        </div>

        {/* Overall Score */}
        <div className="mt-6 bg-primary/[0.08] border border-primary/20 rounded-2xl p-6 text-center">
          <p className="text-[10px] tracking-[0.2em] uppercase text-primary/80 font-display mb-2">Score Geral da Operação</p>
          <p className="text-4xl font-bold text-primary font-display">{matrix.overallScore}%</p>
          <p className={`text-xs mt-1 ${getStatusColor(matrix.overallScore)}`}>{getStatusLabel(matrix.overallScore)}</p>
        </div>
      </div>
    </section>
  );
};

export default STEPMatrix;
