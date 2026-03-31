import type { PilarAnalise, PontoAnalise } from './types';

interface PilarCardProps {
  nome: string;
  pilar: PilarAnalise;
}

const URGENCIA_LABELS: Record<string, { label: string; color: string }> = {
  alta: { label: 'URGENTE', color: '#EF4444' },
  media: { label: 'ATENÇÃO', color: '#F59E0B' },
  baixa: { label: 'MONITORAR', color: '#9CA3AF' },
};

const STATUS_BG: Record<string, string> = {
  ok: 'rgba(34,197,94,0.08)',
  warning: 'rgba(245,158,11,0.08)',
  critical: 'rgba(239,68,68,0.08)',
};

const PilarCard = ({ nome, pilar }: PilarCardProps) => {
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden print-avoid-break">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: STATUS_BG[pilar.status] }}>
        <h3 className="font-bold text-foreground font-display text-lg">PILAR: {nome.toUpperCase()}</h3>
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold font-display" style={{ color: pilar.status === 'critical' ? '#EF4444' : pilar.status === 'warning' ? '#F59E0B' : '#22C55E' }}>
            {pilar.score}/100
          </span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Positivos */}
        {pilar.positivos.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="text-status-ok">✅</span> O QUE ESTÁ BEM
            </h4>
            <div className="space-y-3">
              {pilar.positivos.map((p, i) => (
                <PontoPositivo key={i} ponto={p} />
              ))}
            </div>
          </div>
        )}

        {/* Separator */}
        {pilar.positivos.length > 0 && pilar.negativos.length > 0 && (
          <div className="border-t border-border" />
        )}

        {/* Negativos */}
        {pilar.negativos.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="text-status-critical">🔴</span> O QUE PRECISA DE ATENÇÃO (E POR QUÊ)
            </h4>
            <div className="space-y-4">
              {pilar.negativos.map((p, i) => (
                <PontoNegativo key={i} ponto={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const PontoPositivo = ({ ponto }: { ponto: PontoAnalise }) => (
  <div className="flex gap-3">
    <span className="text-status-ok mt-0.5 flex-shrink-0">✓</span>
    <div>
      <p className="text-sm font-semibold text-foreground">{ponto.titulo}</p>
      <p className="text-sm text-muted-foreground font-body font-light mt-0.5">{ponto.descricao}</p>
    </div>
  </div>
);

const PontoNegativo = ({ ponto }: { ponto: PontoAnalise }) => {
  const urgInfo = ponto.urgencia ? URGENCIA_LABELS[ponto.urgencia] : null;
  return (
    <div className="flex gap-3">
      <span className="text-status-critical mt-0.5 flex-shrink-0">✗</span>
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-foreground">{ponto.titulo}</p>
          {urgInfo && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ backgroundColor: `${urgInfo.color}15`, color: urgInfo.color }}>
              {urgInfo.label}
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground font-body font-light mt-0.5">{ponto.descricao}</p>
        {ponto.impacto && (
          <p className="text-sm text-primary italic mt-1 font-body">Impacto: {ponto.impacto}</p>
        )}
      </div>
    </div>
  );
};

export default PilarCard;
