import type { FormData, Relatorio, PilarAnalise, PontoAnalise, AnswerLetter, Urgencia } from './types';
import { QUESTIONS_POSICIONAMENTO, QUESTIONS_PERFORMANCE, QUESTIONS_ATENDIMENTO } from './types';

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

// ── Analysis point definitions per question ──
// Each maps answer A/B → negative, D/E → positive

interface QAnalysis {
  id: string;
  negTitle: string;
  negDescA: string;
  negDescB: string;
  negImpact: string;
  negUrgency: Urgencia;
  posTitle: string;
  posDesc: string;
}

const POSICIONAMENTO_ANALYSIS: QAnalysis[] = [
  {
    id: 'q1', negTitle: 'Perfil no Google Meu Negócio inexistente ou não verificado',
    negDescA: 'A clínica não possui perfil no Google Meu Negócio. Isso elimina completamente a visibilidade em buscas locais, onde a maioria dos pacientes inicia a pesquisa.',
    negDescB: 'O perfil no Google existe mas não está verificado, limitando o controle sobre informações exibidas e impedindo respostas a avaliações.',
    negImpact: 'Pacientes que buscam a especialidade na região não encontram a clínica.',
    negUrgency: 'alta',
    posTitle: 'Perfil no Google bem posicionado',
    posDesc: 'Perfil verificado com boas avaliações e gestão ativa. Isso gera confiança imediata para pacientes em fase de pesquisa.',
  },
  {
    id: 'q2', negTitle: 'Fotos no Google ausentes ou de baixa qualidade',
    negDescA: 'Não há fotos no perfil do Google. O paciente não consegue visualizar a estrutura, o que gera desconfiança antes do primeiro contato.',
    negDescB: 'As fotos estão desatualizadas ou com qualidade amadora, transmitindo uma imagem que não corresponde ao nível da clínica.',
    negImpact: 'Clínicas com fotos profissionais recebem 42% mais solicitações de rota e contato.',
    negUrgency: 'media',
    posTitle: 'Apresentação visual profissional no Google',
    posDesc: 'Fotos de qualidade profissional transmitem credibilidade e elevam a percepção de valor da clínica.',
  },
  {
    id: 'q3', negTitle: 'Avaliações negativas sem gestão',
    negDescA: 'As avaliações negativas são completamente ignoradas, sinalizando descaso ao público que ainda está avaliando a clínica.',
    negDescB: 'As respostas a avaliações são raras e sem padrão, desperdiçando a oportunidade de demonstrar profissionalismo.',
    negImpact: 'Cada avaliação negativa sem resposta afasta potenciais pacientes que estão pesquisando.',
    negUrgency: 'media',
    posTitle: 'Gestão estratégica de reputação online',
    posDesc: 'Respostas consistentes e profissionais às avaliações demonstram cuidado e transformam até críticas em prova de compromisso.',
  },
  {
    id: 'q4', negTitle: 'Site inexistente ou desatualizado',
    negDescA: 'A clínica não possui site. O paciente que pesquisa online não encontra informações institucionais, o que inviabiliza a construção de confiança.',
    negDescB: 'O site é antigo e com experiência ruim, transmitindo uma imagem que contradiz o nível de excelência do serviço oferecido.',
    negImpact: 'Mais de 75% das buscas por procedimentos estéticos acontecem no celular.',
    negUrgency: 'alta',
    posTitle: 'Presença digital profissional',
    posDesc: 'Site moderno e otimizado que posiciona a clínica acima da maioria dos concorrentes regionais.',
  },
  {
    id: 'q5', negTitle: 'CTAs de contato ausentes ou invisíveis',
    negDescA: 'Não existem chamadas para ação no site. O paciente qualificado que chega ao site não tem caminho claro para entrar em contato.',
    negDescB: 'Os CTAs existem mas são difíceis de encontrar, reduzindo drasticamente as conversões do site.',
    negImpact: 'A taxa de conversão do site cai pela metade sem CTAs claros acima da dobra.',
    negUrgency: 'alta',
    posTitle: 'CTAs estratégicos e bem posicionados',
    posDesc: 'Os pontos de contato estão visíveis e otimizados, facilitando a conversão do visitante em lead.',
  },
  {
    id: 'q6', negTitle: 'Experiência do site comprometida',
    negDescA: 'A experiência do site é muito ruim, gerando abandono imediato dos visitantes.',
    negDescB: 'O site é lento, especialmente no mobile, onde a maioria dos pacientes pesquisa.',
    negImpact: 'Cada segundo adicional de carregamento aumenta a taxa de abandono em 32%.',
    negUrgency: 'media',
    posTitle: 'Site com boa performance',
    posDesc: 'Experiência de navegação fluida que mantém o visitante engajado até o contato.',
  },
  {
    id: 'q7', negTitle: 'Frequência de conteúdo insuficiente',
    negDescA: 'A clínica não publica conteúdo nas redes sociais, perdendo completamente o canal orgânico de aquisição.',
    negDescB: 'As publicações são raras, fazendo com que o algoritmo penalize o alcance orgânico da conta.',
    negImpact: 'Sem frequência mínima, o alcance orgânico é praticamente nulo.',
    negUrgency: 'media',
    posTitle: 'Conteúdo frequente e estratégico',
    posDesc: 'A frequência de publicações mantém a clínica presente no feed do público-alvo, gerando familiaridade e confiança.',
  },
  {
    id: 'q8', negTitle: 'Ausência de provas sociais na comunicação',
    negDescA: 'A clínica não utiliza depoimentos ou resultados reais, eliminando o principal gatilho de decisão para procedimentos de alto valor.',
    negDescB: 'O uso de provas sociais é esporádico e não faz parte da estratégia de conteúdo.',
    negImpact: 'O paciente não percebe diferença entre esta clínica e as demais do mercado.',
    negUrgency: 'alta',
    posTitle: 'Provas sociais ativas na estratégia',
    posDesc: 'Depoimentos e resultados reais são o conteúdo com maior taxa de conversão em clínicas de procedimentos estéticos.',
  },
  {
    id: 'q9', negTitle: 'Bio das redes sem direcionamento',
    negDescA: 'Não há bio configurada, desperdiçando o campo mais visto por novos visitantes do perfil.',
    negDescB: 'A bio é genérica e não diferencia a clínica nem direciona o visitante para uma ação.',
    negImpact: 'Bio sem CTA reduz em até 40% a taxa de cliques para contato.',
    negUrgency: 'baixa',
    posTitle: 'Bio estratégica com direcionamento claro',
    posDesc: 'A bio comunica posicionamento e direciona o visitante para ação, convertendo visualizações em contatos.',
  },
  {
    id: 'q10', negTitle: 'Público-alvo não definido',
    negDescA: 'Não há definição de público-alvo. Comunicar para todos significa comunicar para ninguém.',
    negDescB: 'O público-alvo é amplo demais, resultando em mensagens genéricas que não ressoam com nenhum perfil específico.',
    negImpact: 'Atrai leads fora do perfil ideal, sobrecarregando o comercial com contatos que não convertem.',
    negUrgency: 'alta',
    posTitle: 'Público-alvo bem definido',
    posDesc: 'A comunicação é direcionada para o perfil ideal de paciente, otimizando cada investimento em aquisição.',
  },
  {
    id: 'q11', negTitle: 'Diferencial competitivo não percebido',
    negDescA: 'A clínica não possui diferencial articulado. Sem isso, a decisão do paciente será exclusivamente por preço.',
    negDescB: 'O diferencial é genérico e não se destaca da concorrência regional.',
    negImpact: 'Competir por preço reduz margens e atrai o perfil errado de paciente.',
    negUrgency: 'alta',
    posTitle: 'Diferencial claro e valorizado',
    posDesc: 'A clínica possui um diferencial percebido e valorizado pelo mercado, o que sustenta a precificação de alto valor.',
  },
  {
    id: 'q12', negTitle: 'Promessa de valor ausente ou desconectada',
    negDescA: 'A clínica não possui uma promessa de valor articulada. O paciente não sabe o que esperar além do procedimento técnico.',
    negDescB: 'A promessa existe mas não é comunicada nos canais de contato, tornando-a invisível para o público.',
    negImpact: 'Sem proposta de valor clara, a taxa de conversão depende exclusivamente do preço.',
    negUrgency: 'media',
    posTitle: 'Proposta de valor clara e consistente',
    posDesc: 'A promessa de valor é comunicada de forma consistente em todos os pontos de contato, reforçando a decisão de compra.',
  },
];

const PERFORMANCE_ANALYSIS: QAnalysis[] = [
  {
    id: 'q13', negTitle: 'Sem investimento em aquisição paga',
    negDescA: 'A clínica não investe em tráfego pago, dependendo exclusivamente de indicação e orgânico. Isso cria um teto de crescimento.',
    negDescB: 'O investimento é irregular, impossibilitando a construção de uma base previsível de leads.',
    negImpact: 'Crescimento limitado e sem previsibilidade de demanda.',
    negUrgency: 'alta',
    posTitle: 'Investimento consistente em aquisição',
    posDesc: 'A clínica investe de forma estruturada em mídia paga, o que possibilita previsibilidade e escala na geração de demanda.',
  },
  {
    id: 'q14', negTitle: 'Criativos fracos ou inexistentes',
    negDescA: 'A clínica não produz criativos para anúncios, limitando totalmente o alcance pago.',
    negDescB: 'Os criativos são genéricos, sem conexão com o paciente ideal e sem diferenciação.',
    negImpact: 'Leads desqualificados chegam em volume, sobrecarregando o atendimento sem conversão.',
    negUrgency: 'alta',
    posTitle: 'Criativos de alta qualidade',
    posDesc: 'Os criativos são bem produzidos e conectam com o público-alvo, otimizando o custo por lead qualificado.',
  },
  {
    id: 'q15', negTitle: 'Remarketing não utilizado',
    negDescA: 'A clínica não utiliza remarketing. Leads que demonstraram interesse são completamente abandonados.',
    negDescB: 'Já houve tentativa de remarketing, mas sem continuidade ou estrutura.',
    negImpact: 'CPL 2–3x mais caro por não recuperar interesse já demonstrado.',
    negUrgency: 'media',
    posTitle: 'Remarketing estruturado',
    posDesc: 'O remarketing recupera leads quentes com custo de conversão significativamente menor.',
  },
  {
    id: 'q16', negTitle: 'Métricas de aquisição não mensuradas',
    negDescA: 'A clínica não mede o custo por lead. Investir em mídia sem saber o CPL é como dirigir sem painel.',
    negDescB: 'A mensuração é esporádica e não permite otimização consistente das campanhas.',
    negImpact: 'Investimento em mídia sem controle de retorno torna impossível otimizar.',
    negUrgency: 'alta',
    posTitle: 'Controle de métricas ativo',
    posDesc: 'O acompanhamento constante do CPL e outras métricas permite otimização contínua do investimento.',
  },
  {
    id: 'q17', negTitle: 'Geração de leads imprevisível',
    negDescA: 'A clínica não gera leads de forma ativa, dependendo totalmente de demanda espontânea.',
    negDescB: 'A geração de leads é totalmente instável, com meses bons seguidos de meses fracos.',
    negImpact: 'Sem previsibilidade, é impossível planejar agenda e recursos de forma eficiente.',
    negUrgency: 'alta',
    posTitle: 'Previsibilidade de demanda',
    posDesc: 'A geração de leads é estável e previsível, permitindo planejamento operacional consistente.',
  },
  {
    id: 'q18', negTitle: 'Origem dos leads desconhecida ou concentrada',
    negDescA: 'A clínica não sabe de onde vêm os leads, impossibilitando qualquer decisão baseada em dados.',
    negDescB: 'A demanda vem exclusivamente de indicação, criando dependência de um canal que não escala.',
    negImpact: 'Decisões de investimento são feitas às cegas.',
    negUrgency: 'media',
    posTitle: 'Canais de aquisição mapeados',
    posDesc: 'A origem dos leads é conhecida e mensurada, possibilitando decisões estratégicas de investimento por canal.',
  },
  {
    id: 'q19', negTitle: 'Leads não são qualificados',
    negDescA: 'Não existe nenhum sistema de qualificação. Todos os leads recebem o mesmo tratamento, independente do perfil.',
    negDescB: 'A qualificação é muito básica e não separa leads por potencial de conversão.',
    negImpact: 'A equipe gasta o mesmo tempo com leads de baixo e alto valor.',
    negUrgency: 'alta',
    posTitle: 'Qualificação de leads estruturada',
    posDesc: 'O sistema de qualificação prioriza leads com maior potencial, otimizando o tempo da equipe comercial.',
  },
];

const ATENDIMENTO_ANALYSIS: QAnalysis[] = [
  {
    id: 'q20', negTitle: 'Tempo de resposta acima do aceitável',
    negDescA: 'O tempo de resposta ultrapassa 6 horas. A chance de converter um lead cai 80% após os primeiros 5 minutos.',
    negDescB: 'O tempo de resposta de 2–6 horas permite que o paciente avalie concorrentes antes de receber retorno.',
    negImpact: 'A maioria dos leads qualificados é perdida permanentemente pela demora.',
    negUrgency: 'alta',
    posTitle: 'Agilidade no primeiro contato',
    posDesc: 'Responder rapidamente posiciona a clínica como referência de cuidado desde o primeiro contato.',
  },
  {
    id: 'q21', negTitle: 'Sem cobertura fora do horário comercial',
    negDescA: 'Não existe atendimento fora do horário comercial. A maioria das pesquisas por procedimentos acontece à noite e fins de semana.',
    negDescB: 'A cobertura fora do horário é muito limitada, deixando a maioria dos contatos noturnos sem resposta.',
    negImpact: '30–40% dos leads chegam fora do horário e não são aproveitados.',
    negUrgency: 'alta',
    posTitle: 'Cobertura de atendimento ampla',
    posDesc: 'O atendimento cobre os horários de pico de pesquisa, garantindo que nenhum lead qualificado fique sem resposta.',
  },
  {
    id: 'q22', negTitle: 'Comunicação impessoal',
    negDescA: 'A comunicação é fria e não estabelece conexão com o paciente, reduzindo a taxa de conversão.',
    negDescB: 'Há pouca personalização no atendimento, tratando todos os leads de forma padronizada e distante.',
    negImpact: 'Pacientes de alto valor esperam uma experiência personalizada desde o primeiro contato.',
    negUrgency: 'media',
    posTitle: 'Comunicação personalizada e humanizada',
    posDesc: 'O atendimento personalizado gera conexão emocional e eleva a percepção de cuidado.',
  },
  {
    id: 'q23', negTitle: 'Atendimento focado exclusivamente em preço',
    negDescA: 'O atendimento se resume a informar o valor do procedimento. A conversa vira comparação de preços.',
    negDescB: 'O foco principal é preço, com pouca ou nenhuma geração de valor percebido antes da consulta.',
    negImpact: 'O paciente compara valores e escolhe pelo preço, não pela qualidade.',
    negUrgency: 'alta',
    posTitle: 'Atendimento consultivo e persuasivo',
    posDesc: 'A equipe gera valor percebido antes de apresentar o investimento, sustentando a precificação premium.',
  },
  {
    id: 'q24', negTitle: 'Atendimento sem padronização',
    negDescA: 'Não existe script de atendimento. A qualidade da conversão depende exclusivamente de quem atende no dia.',
    negDescB: 'Cada profissional atende de forma diferente, tornando impossível otimizar o processo.',
    negImpact: 'Taxa de conversão oscila sem explicação. O que não é padronizado não pode ser otimizado.',
    negUrgency: 'alta',
    posTitle: 'Script estruturado e otimizado',
    posDesc: 'O atendimento segue um protocolo otimizado que garante consistência na conversão.',
  },
  {
    id: 'q25', negTitle: 'Objeções não são tratadas',
    negDescA: 'A equipe não sabe lidar com objeções de preço e dúvidas, perdendo leads que estavam próximos de converter.',
    negDescB: 'As objeções são evitadas ao invés de tratadas, deixando o paciente sem resposta para suas preocupações.',
    negImpact: 'Leads qualificados são perdidos por falta de preparo comercial.',
    negUrgency: 'alta',
    posTitle: 'Tratamento estratégico de objeções',
    posDesc: 'A equipe transforma objeções em oportunidades de demonstrar valor e fechar a venda.',
  },
  {
    id: 'q26', negTitle: 'Ausência de follow-up estruturado',
    negDescA: 'A clínica nunca retoma contato com leads que não agendaram. 80% das vendas de alto valor acontecem após o 5º contato.',
    negDescB: 'O follow-up é raro e sem estrutura, abandonando leads que precisavam de mais pontos de contato.',
    negImpact: 'Leads interessados são perdidos por falta de persistência estruturada.',
    negUrgency: 'alta',
    posTitle: 'Follow-up sempre estruturado',
    posDesc: 'A retomada consistente de contato com leads garante máximo aproveitamento de cada oportunidade.',
  },
  {
    id: 'q27', negTitle: 'Taxa de conversão em agendamento muito baixa',
    negDescA: 'Menos de 10% dos leads viram agendamento. A maioria dos contatos é perdida antes de chegar à consulta.',
    negDescB: 'Taxa de 10–20% de conversão em agendamento indica gargalos sérios no processo comercial.',
    negImpact: 'Grande volume de leads gerados não se converte em consultas.',
    negUrgency: 'alta',
    posTitle: 'Boa taxa de conversão em agendamento',
    posDesc: 'A taxa de agendamento acima de 30% indica eficiência no processo de qualificação e convencimento.',
  },
  {
    id: 'q28', negTitle: 'Taxa de comparecimento baixa',
    negDescA: 'Menos de 50% dos agendados comparecem. A agenda da clínica é imprevisível.',
    negDescB: 'Taxa de 50–60% de comparecimento indica falta de protocolos de confirmação e lembretes.',
    negImpact: 'Horários vagos na agenda representam receita perdida.',
    negUrgency: 'media',
    posTitle: 'Alto comparecimento nas consultas',
    posDesc: 'A taxa de comparecimento acima de 70% demonstra protocolos eficientes de confirmação e relacionamento pré-consulta.',
  },
  {
    id: 'q29', negTitle: 'Conversão da consulta em procedimento insuficiente',
    negDescA: 'Menos de 20% das consultas resultam em procedimento. O paciente sai da consulta sem converter.',
    negDescB: 'Taxa de 20–30% de conversão em procedimento sugere que o fechamento na consulta precisa de otimização.',
    negImpact: 'Consultas realizadas sem conversão representam custo operacional sem retorno.',
    negUrgency: 'alta',
    posTitle: 'Alta conversão na consulta',
    posDesc: 'A taxa acima de 45% indica domínio da consulta comercial e alto valor percebido.',
  },
  {
    id: 'q30', negTitle: 'Sem processo de pós-venda',
    negDescA: 'Não existe nenhuma ação de pós-venda. Pacientes que já compraram têm 60% mais chance de comprar novamente.',
    negDescB: 'O pós-venda é muito básico e não gera recorrência nem indicações ativas.',
    negImpact: 'Receita de recorrência e indicação qualificada sendo desperdiçada todo mês.',
    negUrgency: 'media',
    posTitle: 'Pós-venda estratégico',
    posDesc: 'O processo de pós-venda gera recorrência e indicações ativas, reduzindo o custo de aquisição.',
  },
];

function analisarPilar(r: FormData, questions: typeof POSICIONAMENTO_ANALYSIS, questionIds: string[]): PilarAnalise {
  const positivos: PontoAnalise[] = [];
  const negativos: PontoAnalise[] = [];

  let totalScore = 0;
  let count = 0;

  for (const qa of questions) {
    const answer = r[qa.id as keyof FormData] as AnswerLetter;
    if (!answer) continue;

    const score = letterToScore(answer);
    totalScore += score;
    count++;

    if (answer === 'A' || answer === 'B') {
      negativos.push({
        titulo: qa.negTitle,
        descricao: answer === 'A' ? qa.negDescA : qa.negDescB,
        impacto: qa.negImpact,
        urgencia: qa.negUrgency,
      });
    } else if (answer === 'D' || answer === 'E') {
      positivos.push({
        titulo: qa.posTitle,
        descricao: qa.posDesc,
      });
    }
  }

  const avgScore = count > 0 ? Math.round(totalScore / count) : 50;
  const status = avgScore >= 70 ? 'ok' as const : avgScore >= 45 ? 'warning' as const : 'critical' as const;

  return { score: avgScore, status, positivos, negativos };
}

export function gerarRelatorio(formData: FormData): Relatorio {
  const financeiro = calcularFinanceiro(formData);
  const posicionamento = analisarPilar(formData, POSICIONAMENTO_ANALYSIS, QUESTIONS_POSICIONAMENTO.map(q => q.id));
  const performance = analisarPilar(formData, PERFORMANCE_ANALYSIS, QUESTIONS_PERFORMANCE.map(q => q.id));
  const atendimento = analisarPilar(formData, ATENDIMENTO_ANALYSIS, QUESTIONS_ATENDIMENTO.map(q => q.id));

  return {
    nomeClinica: formData.nomeClinica,
    especialidade: formData.especialidade,
    cidade: formData.cidade,
    financeiro,
    pilares: { posicionamento, performance, atendimento },
    nivelRecomendado: 1,
    formData,
  };
}

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 });
}
