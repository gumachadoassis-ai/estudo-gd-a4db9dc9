import type { FormData, Relatorio, PilarAnalise, PontoAnalise } from './types';

function extrairNumeroDoTexto(texto: string): number {
  const cleaned = texto.replace(/[R$.\s]/g, '').replace(',', '.');
  const match = cleaned.match(/\d+/);
  return match ? parseInt(match[0]) : 0;
}

export function calcularFinanceiro(r: FormData) {
  const ticketMedio = extrairNumeroDoTexto(r.ticketMedio) || 5000;
  const procedimentosMes = extrairNumeroDoTexto(r.procedimentosMes) || 10;
  const faturamentoAtualNum = extrairNumeroDoTexto(r.faturamentoAtual) || (procedimentosMes * ticketMedio);

  const matchPct = r.taxaConversao.match(/(\d+)%/);
  const taxaConversaoAtual = matchPct ? parseInt(matchPct[1]) / 100 : 0.08;

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
    ticketMedio,
    procedimentosMes,
    taxaConversaoAtual,
    taxaConversaoPotencial,
    leadsMesEstimado,
    cirurgiasAtuais,
    cirurgiasPotencial,
    cirurgiasPerdidas,
    faturamentoPerdidoMes,
    faturamentoPerdidoAno,
    faturamentoAtualNum,
  };
}

function analisarPosicionamento(r: FormData): PilarAnalise {
  const positivos: PontoAnalise[] = [];
  const negativos: PontoAnalise[] = [];
  let score = 50;

  const temBoaNota = /4\.[5-9]|5\.0|4,5|4,6|4,7|4,8|4,9/.test(r.gmb_status);
  const temMuitasAvaliacoes = /\d{3,}/.test(r.gmb_status);
  const ignoraAvaliacoes = /raramente|não|nunca|sem resposta/i.test(r.gmb_avaliacoes);

  if (temBoaNota) {
    score += 8;
    positivos.push({ titulo: "Boa reputação no Google", descricao: "Nota acima de 4.5 no Google Meu Negócio indica que os pacientes que chegam até a consulta saem satisfeitos. Isso é um ativo de confiança que pode ser mais explorado na comunicação e nos anúncios." });
  } else {
    score -= 10;
    negativos.push({ titulo: "Nota Google abaixo do ideal", descricao: "Notas abaixo de 4.5 geram desconfiança antes mesmo do primeiro contato. Em cirurgia plástica, onde a decisão envolve alto investimento e risco emocional, o paciente pesquisa exaustivamente antes de agir.", impacto: "Pacientes qualificados descartam a clínica antes de entrar em contato.", urgencia: 'alta' });
  }

  if (temMuitasAvaliacoes) {
    score += 5;
    positivos.push({ titulo: "Volume expressivo de avaliações", descricao: "Mais de 100 avaliações conferem autoridade e prova social que nenhum anúncio consegue replicar. Esse volume reduz a fricção da decisão." });
  }

  if (ignoraAvaliacoes) {
    score -= 8;
    negativos.push({ titulo: "Avaliações negativas sem resposta", descricao: "Não responder avaliações — especialmente as negativas — sinaliza descaso ao público que ainda está avaliando a clínica. Uma resposta profissional transforma uma crítica em demonstração de cuidado.", impacto: "Cada avaliação negativa sem resposta afasta em média 3 novos pacientes.", urgencia: 'media' });
  }

  const temSiteRuim = /2021|2020|antigo|desatualizado|não responsivo|lento|wordpress/i.test(r.site_status);
  const temSiteBom = /moderno|profissional|responsivo|rápido/i.test(r.site_status);
  const semCTA = /não tem|sem cta|escondido|nenhum formulário/i.test(r.site_cta);

  if (temSiteRuim) {
    score -= 12;
    negativos.push({ titulo: "Site desatualizado ou não responsivo", descricao: "Um site com design antigo ou que não funciona bem no mobile transmite descuido antes mesmo da consulta. Em 2026, mais de 75% das buscas por cirurgias estéticas acontecem no celular.", impacto: "Pacientes de alto valor descartam clínicas com presença digital amadora.", urgencia: 'alta' });
  }

  if (semCTA) {
    score -= 8;
    negativos.push({ titulo: "CTAs de contato invisíveis ou ausentes", descricao: "Se o botão de agendamento não está evidente no site, o paciente que chegou qualificado vai embora sem deixar contato.", impacto: "Taxa de conversão do site cai pela metade sem CTA claro acima da dobra.", urgencia: 'alta' });
  }

  if (temSiteBom) {
    score += 7;
    positivos.push({ titulo: "Presença digital com base sólida", descricao: "Ter um site moderno e responsivo posiciona a clínica acima de grande parte dos concorrentes regionais que ainda operam com presença digital básica." });
  }

  const postaPouco = /não post|1 vez|raramente|sem padrão/i.test(r.social_frequencia);
  const naoUsaProvas = /não|raramente|nunca|medo/i.test(r.social_provas);
  const usaProvas = /sim|usa|depoimento|antes.*depois/i.test(r.social_provas);
  const bioPobre = /genérica|sem cta|crm|apenas|só o/i.test(r.social_bio);

  if (postaPouco) {
    score -= 8;
    negativos.push({ titulo: "Frequência insuficiente nas redes sociais", descricao: "Com menos de 3 posts semanais, o algoritmo do Instagram penaliza o alcance orgânico. O paciente em fase de pesquisa precisa ver a clínica com frequência antes de tomar a decisão de contato.", impacto: "Baixa frequência = baixo alcance orgânico = menos leads sem pagar.", urgencia: 'media' });
  }

  if (naoUsaProvas && !usaProvas) {
    score -= 10;
    negativos.push({ titulo: "Ausência de provas sociais na comunicação", descricao: "Depoimentos e resultados reais são o principal gatilho de decisão para procedimentos estéticos de alto valor. Sem eles, a comunicação é apenas informativa — não persuasiva.", impacto: "O paciente não percebe diferença entre esta clínica e qualquer outra do feed.", urgencia: 'alta' });
  }

  if (usaProvas) {
    score += 10;
    positivos.push({ titulo: "Uso de provas sociais e resultados reais", descricao: "Publicar depoimentos e resultados de pacientes (com autorização) é o conteúdo com maior taxa de conversão em clínicas de cirurgia plástica." });
  }

  if (bioPobre) {
    score -= 5;
    negativos.push({ titulo: "Bio sem direcionamento estratégico", descricao: "A bio é o primeiro lugar que um novo visitante lê. Uma bio genérica com apenas CRM e especialidade desperdiça o único campo que pode transformar visitante em lead.", impacto: "Bio sem CTA reduz em até 40% a taxa de cliques para contato.", urgencia: 'media' });
  }

  const semPublicoDefinido = /não há|qualquer|sem segmentação|genérico/i.test(r.posicao_publicoAlvo);
  const semDiferencial = /não comunicado|não sabe|nenhum|não há/i.test(r.posicao_diferencial);

  if (semPublicoDefinido) {
    score -= 10;
    negativos.push({ titulo: "Público-alvo não definido na comunicação", descricao: "Comunicar para todos é comunicar para ninguém. Clínicas de alto valor precisam de mensagens que ressoem com um perfil específico de paciente.", impacto: "Atrai pacientes fora do perfil ideal, sobrecarregando o comercial com leads não qualificados.", urgencia: 'alta' });
  }

  if (semDiferencial) {
    score -= 8;
    negativos.push({ titulo: "Diferencial competitivo não visível ao mercado", descricao: "Ter excelência técnica sem comunicá-la é como não tê-la. Se o paciente não consegue articular por que escolheria esta clínica antes da consulta, a decisão cairá exclusivamente no preço.", impacto: "Competir por preço reduz margens e atrai o perfil errado de paciente.", urgencia: 'alta' });
  }

  score = Math.max(20, Math.min(70, score));
  const status = score >= 55 ? 'warning' as const : 'critical' as const;
  return { score, status, positivos, negativos };
}

function analisarPerformance(r: FormData): PilarAnalise {
  const positivos: PontoAnalise[] = [];
  const negativos: PontoAnalise[] = [];
  let score = 40;

  const investeTrafego = /sim|investe|r\$|meta|google ads/i.test(r.trafego_investimento);
  const naoInveste = /não|nunca|orgânico/i.test(r.trafego_investimento);
  const agenciaGenerica = /agência|sem especialização|genérica/i.test(r.trafego_investimento);
  const semCPL = /não mensura|não sabe|não monitora/i.test(r.trafego_cpl);
  const usaRemarketing = /sim|usa remarketing|retargeting/i.test(r.trafego_remarketing);
  const semRemarketing = /não|nunca/i.test(r.trafego_remarketing);
  const criativosRuins = /stock|genéric|desconto|sem vídeo/i.test(r.trafego_criativos);
  const oscila = /oscila|imprevisível|irregular/i.test(r.demanda_previsibilidade);
  const dominaIndicacao = /indicação|orgânico|60|70|80/i.test(r.demanda_origem);
  const semQualificacao = /não tem|sem sistema|qualquer|tudo cai/i.test(r.demanda_qualificacao);

  if (investeTrafego && !agenciaGenerica) {
    score += 15;
    positivos.push({ titulo: "Investimento ativo em aquisição paga", descricao: "Investir em tráfego pago demonstra entendimento de que crescimento não é passivo. Esse mindset é o primeiro requisito para escala." });
  }

  if (agenciaGenerica) {
    score -= 10;
    negativos.push({ titulo: "Tráfego gerenciado por agência sem especialização em saúde", descricao: "Agências generalistas não conhecem as restrições do CFM, o comportamento do paciente de alto valor nem as nuances de conversão de clínicas estéticas.", impacto: "Verba desperdiçada em leads que não têm perfil de compra da clínica.", urgencia: 'alta' });
  }

  if (naoInveste) {
    score -= 15;
    negativos.push({ titulo: "Nenhum investimento em aquisição paga", descricao: "Depender 100% de indicação e orgânico cria um teto de crescimento que não pode ser rompido com esforço — apenas com estrutura.", impacto: "Crescimento limitado ao boca a boca. Sem previsibilidade de demanda.", urgencia: 'alta' });
  }

  if (semCPL) {
    score -= 10;
    negativos.push({ titulo: "Custo por lead não mensurado", descricao: "Investir em mídia sem saber o CPL é como dirigir no escuro. Sem essa métrica, não há como otimizar campanhas, comparar canais ou projetar ROI.", impacto: "Investimento em mídia sem controle de retorno.", urgencia: 'alta' });
  }

  if (semRemarketing) {
    score -= 8;
    negativos.push({ titulo: "Ausência de remarketing — base quente ignorada", descricao: "Leads que já visitaram o site ou interagiram com o Instagram são 3x mais propensos a converter. Sem remarketing, esses contatos quentes são abandonados.", impacto: "CPL 2–3x mais caro por não recuperar interesse já demonstrado.", urgencia: 'media' });
  }

  if (usaRemarketing) {
    score += 8;
    positivos.push({ titulo: "Remarketing ativo — recuperação de interesse", descricao: "O uso de remarketing indica maturidade na estratégia de mídia. Leads reaquecidos têm custo de conversão significativamente menor." });
  }

  if (criativosRuins) {
    score -= 8;
    negativos.push({ titulo: "Criativos genéricos sem conexão com o paciente ideal", descricao: "Em cirurgia plástica, o criativo é o filtro do lead. Imagens de stock e copy baseado em desconto atraem o perfil errado e elevam o CPL.", impacto: "Leads chegando desqualificados sobrecarregam o atendimento sem converter.", urgencia: 'alta' });
  }

  if (oscila) {
    score -= 8;
    negativos.push({ titulo: "Geração de leads imprevisível e oscilante", descricao: "Meses bons seguidos de meses fracos indicam ausência de estratégia de demanda.", impacto: "Equipe superdimensionada em meses fracos. Clínica deixa dinheiro na mesa nos meses bons.", urgencia: 'media' });
  }

  if (dominaIndicacao) {
    score += 8;
    positivos.push({ titulo: "Base forte de indicação e autoridade orgânica", descricao: "Alta proporção de leads por indicação significa que a clínica entrega resultado e os pacientes confiam o suficiente para recomendar." });
  }

  if (semQualificacao) {
    score -= 10;
    negativos.push({ titulo: "Nenhum sistema de qualificação de leads", descricao: "Quando todos os leads caem diretamente no WhatsApp da secretária sem filtragem prévia, o atendimento gasta o mesmo tempo com um lead de R$ 500 e com um de R$ 15.000.", impacto: "Atendimento sobrecarregado com leads fora do perfil. Conversão cai.", urgencia: 'alta' });
  }

  score = Math.max(20, Math.min(75, score));
  const status = score >= 55 ? 'warning' as const : 'critical' as const;
  return { score, status, positivos, negativos };
}

function analisarAtendimento(r: FormData): PilarAnalise {
  const positivos: PontoAnalise[] = [];
  const negativos: PontoAnalise[] = [];
  let score = 45;

  const resposteLenta = /2|3|4|hora|próximo dia|tarde/i.test(r.atend_tempoResposta);
  const respostaRapida = /5 min|imediato|rápido/i.test(r.atend_tempoResposta);
  const semCobertura = /não|só horário|horário comercial|next day/i.test(r.atend_cobertura);
  const semScript = /não tem|improvisa|cada.*jeito|sem padrão/i.test(r.atend_script);
  const semFollowUp = /não faz|não retoma|sumiu|descarta/i.test(r.atend_followup);
  const soPassa = /só preço|apenas preço|passa o preço|não gera valor/i.test(r.atend_geraValor);
  const semPosVenda = /não|nenhum|zero/i.test(r.atend_posVenda);
  const medico = /médico|doutor|especialista/i.test(r.atend_taxaConversaoConsulta);

  const procedimentosMes = extrairNumeroDoTexto(r.procedimentosMes) || 10;

  if (resposteLenta) {
    score -= 12;
    negativos.push({ titulo: "Tempo de resposta longo — janela de ouro perdida", descricao: "Estudos de conversão mostram que a chance de converter um lead cai 80% após os primeiros 5 minutos sem resposta. Em 2–4 horas, o paciente já avaliou 3 outros concorrentes.", impacto: "A maioria dos leads qualificados que chegam fora do horário são perdidos permanentemente.", urgencia: 'alta' });
  }

  if (respostaRapida) {
    score += 5;
    positivos.push({ titulo: "Agilidade no primeiro contato", descricao: "Responder em menos de 5 minutos posiciona a clínica como referência de cuidado desde o primeiro contato." });
  }

  if (semCobertura) {
    score -= 10;
    negativos.push({ titulo: "Sem cobertura fora do horário comercial", descricao: "A maioria das pesquisas por procedimentos estéticos acontece à noite e nos finais de semana.", impacto: "30–40% dos leads chegam fora do horário e não são aproveitados.", urgencia: 'alta' });
  }

  if (semScript) {
    score -= 10;
    negativos.push({ titulo: "Atendimento sem script — cada secretária atende diferente", descricao: "Sem um protocolo de atendimento, a qualidade da conversão depende do humor, da disponibilidade e da experiência de cada secretária no dia.", impacto: "Taxa de conversão oscila sem explicação. Impossível otimizar o que não é padronizado.", urgencia: 'alta' });
  }

  if (semFollowUp) {
    score -= 10;
    negativos.push({ titulo: "Ausência total de follow-up estruturado", descricao: "80% das vendas de procedimentos de alto valor acontecem após o 5º contato. Sem follow-up, a clínica abandona pacientes que estavam interessados mas precisavam de mais um empurrão.", impacto: `Estimativa: ${Math.round(procedimentosMes * 0.3)} cirurgias extras por mês com follow-up estruturado.`, urgencia: 'alta' });
  }

  if (soPassa) {
    score -= 8;
    negativos.push({ titulo: "Atendimento focado em preço — sem geração de valor", descricao: "Quando a secretária responde diretamente com o valor do procedimento sem qualificar o paciente, a conversa vira uma comparação de preços.", impacto: "Paciente compara R$ X desta clínica com R$ X de outra e escolhe pelo preço.", urgencia: 'alta' });
  }

  if (semPosVenda) {
    score -= 5;
    negativos.push({ titulo: "Sem processo de pós-venda ou retenção", descricao: "Um paciente que já realizou um procedimento tem 60% mais chance de contratar um segundo do que um lead novo.", impacto: "Receita de recorrência e indicação ativa sendo deixada na mesa todo mês.", urgencia: 'media' });
  }

  if (medico) {
    positivos.push({ titulo: "Médico converte bem na consulta", descricao: "Alta taxa de conversão na consulta indica que o especialista domina a consulta comercial. O gargalo está antes da consulta — no atendimento e no follow-up." });
  }

  if (positivos.length === 0) {
    positivos.push({ titulo: "Estrutura humana disponível para atendimento", descricao: "A clínica possui equipe dedicada ao atendimento de leads — o que é o ponto de partida. O que falta é padronizar, treinar e dotar essa equipe de processo e ferramentas." });
  }

  score = Math.max(15, Math.min(45, score));
  return { score, status: 'critical', positivos, negativos };
}

export function gerarRelatorio(formData: FormData): Relatorio {
  const financeiro = calcularFinanceiro(formData);
  const posicionamento = analisarPosicionamento(formData);
  const performance = analisarPerformance(formData);
  const atendimento = analisarAtendimento(formData);

  return {
    nomeClinica: formData.nomeClinica,
    especialidade: formData.especialidade,
    cidade: formData.cidade,
    financeiro,
    pilares: { posicionamento, performance, atendimento },
    nivelRecomendado: 1,
  };
}

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 });
}
