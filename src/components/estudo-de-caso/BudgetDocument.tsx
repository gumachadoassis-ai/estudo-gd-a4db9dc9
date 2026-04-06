import logoGd from '@/assets/logo-gd.png';
import assinaturaJoao from '@/assets/assinatura-joao-original.png';
import type { Relatorio } from './types';

interface BudgetDocumentProps {
  relatorio: Relatorio;
}

const SERVICOS = [
  { item: 'Serviço 1', servico: 'Estudo da Base Atual', valor: 'R$ 500,00' },
  { item: 'Serviço 2', servico: 'Treinamentos', valor: 'R$ 9.000,00' },
  { item: 'Serviço 3', servico: 'Desenvolvimento de Funil de Vendas', valor: 'R$ 1.500,00' },
  { item: 'Serviço 4', servico: 'Prova de Capacitação', valor: 'R$ 3.000,00' },
  { item: 'Serviço 5', servico: 'Trabalho na Base de Leads', valor: 'R$ 1.000,00' },
];

const s = {
  page: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    backgroundColor: '#ffffff',
    color: '#1a1a1a',
    maxWidth: '800px',
    margin: '0 auto',
    position: 'relative' as const,
  },
  // Page 1
  p1: {
    padding: '60px 56px',
    minHeight: '1120px',
    display: 'flex' as const,
    flexDirection: 'column' as const,
  },
  // Page 2
  p2: {
    padding: '60px 56px',
    minHeight: '1120px',
    display: 'flex' as const,
    flexDirection: 'column' as const,
    pageBreakBefore: 'always' as const,
  },
  headerBar: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    borderBottom: '2px solid #1a1a1a',
    paddingBottom: '20px',
    marginBottom: '40px',
  },
  logo: { height: '48px', width: '48px', borderRadius: '6px' },
  title: {
    fontSize: '28px',
    fontWeight: 800,
    letterSpacing: '-0.02em',
    color: '#1a1a1a',
    lineHeight: '1.2',
  },
  subtitle: {
    fontSize: '13px',
    color: '#666',
    fontWeight: 400,
    letterSpacing: '0.03em',
  },
  metaRow: {
    display: 'flex' as const,
    gap: '32px',
    marginBottom: '36px',
    fontSize: '13px',
    color: '#555',
  },
  sectionTitle: {
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.15em',
    color: '#999',
    marginBottom: '16px',
    paddingBottom: '8px',
    borderBottom: '1px solid #e5e5e5',
  },
  clientTable: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    marginBottom: '40px',
  },
  clientTd: {
    padding: '12px 16px',
    fontSize: '13px',
    borderBottom: '1px solid #f0f0f0',
  },
  clientLabel: {
    fontWeight: 700,
    color: '#333',
    width: '140px',
  },
  clientValue: {
    color: '#555',
  },
  serviceTable: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    marginBottom: '24px',
  },
  serviceTh: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    padding: '14px 16px',
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    textAlign: 'left' as const,
  },
  serviceThRight: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    padding: '14px 16px',
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    textAlign: 'right' as const,
  },
  serviceTd: {
    padding: '14px 16px',
    fontSize: '13px',
    borderBottom: '1px solid #f0f0f0',
    color: '#333',
  },
  serviceTdRight: {
    padding: '14px 16px',
    fontSize: '13px',
    borderBottom: '1px solid #f0f0f0',
    color: '#333',
    textAlign: 'right' as const,
  },
  totalRow: {
    backgroundColor: '#f8f8f8',
    borderTop: '2px solid #1a1a1a',
  },
  totalLabel: {
    padding: '16px',
    fontSize: '14px',
    fontWeight: 800,
    color: '#1a1a1a',
  },
  totalValue: {
    padding: '16px',
    fontSize: '16px',
    fontWeight: 800,
    color: '#1a1a1a',
    textAlign: 'right' as const,
  },
  conditionBlock: {
    marginBottom: '24px',
  },
  conditionTitle: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#1a1a1a',
    marginBottom: '8px',
  },
  conditionText: {
    fontSize: '12px',
    color: '#555',
    lineHeight: '1.7',
  },
  bulletList: {
    fontSize: '12px',
    color: '#555',
    lineHeight: '1.8',
    paddingLeft: '18px',
    margin: '0',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: '40px',
    display: 'flex' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-end' as const,
  },
  signatureImg: { height: '70px', marginBottom: '4px' },
  signatureLine: { borderBottom: '1px solid #1a1a1a', width: '200px', marginBottom: '8px' },
  signatureName: { fontSize: '13px', fontWeight: 700, color: '#1a1a1a' },
  signatureRole: { fontSize: '11px', color: '#888' },
  validityNote: {
    fontSize: '11px',
    color: '#999',
    textAlign: 'center' as const,
    marginTop: '32px',
    fontWeight: 600,
  },
};

const BudgetDocument = ({ relatorio }: BudgetDocumentProps) => {
  const { nomeClinica, formData } = relatorio;
  const dataAtual = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div style={s.page}>
      {/* ═══ PAGE 1 ═══ */}
      <div style={s.p1}>
        {/* Header */}
        <div style={s.headerBar}>
          <div>
            <p style={s.title}>Proposta Comercial</p>
            <p style={s.subtitle}>GUELLES & DELGADO Co.</p>
          </div>
          <img src={logoGd} alt="GD Co." style={s.logo} />
        </div>

        {/* Meta */}
        <div style={s.metaRow}>
          <span><strong>Data:</strong> {dataAtual}</span>
          <span><strong>Validade:</strong> 7 dias</span>
        </div>

        {/* Client Data */}
        <p style={s.sectionTitle}>Dados do Cliente</p>
        <table style={s.clientTable}>
          <tbody>
            {[
              ['Cliente', nomeClinica],
              ['CPF/CNPJ', formData.cnpj || '—'],
              ['Telefone', formData.telefone || '—'],
              ['E-mail', formData.email || '—'],
            ].map(([label, value], i) => (
              <tr key={i}>
                <td style={{ ...s.clientTd, ...s.clientLabel }}>{label}</td>
                <td style={{ ...s.clientTd, ...s.clientValue }}>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Services Table */}
        <p style={s.sectionTitle}>Produtos e Serviços</p>
        <table style={s.serviceTable}>
          <thead>
            <tr>
              <th style={s.serviceTh}>Item</th>
              <th style={s.serviceTh}>Serviço</th>
              <th style={s.serviceThRight}>Total</th>
            </tr>
          </thead>
          <tbody>
            {SERVICOS.map((srv, i) => (
              <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                <td style={{ ...s.serviceTd, fontWeight: 600, width: '100px' }}>{srv.item}</td>
                <td style={s.serviceTd}>{srv.servico}</td>
                <td style={s.serviceTdRight}>{srv.valor}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={s.totalRow}>
              <td colSpan={2} style={s.totalLabel}>Total</td>
              <td style={s.totalValue}>R$ 15.000,00</td>
            </tr>
          </tfoot>
        </table>

        {/* Payment */}
        <p style={s.sectionTitle}>Forma de Pagamento</p>
        <ul style={s.bulletList}>
          <li>Pagamento mediante link enviado para o cliente após a assinatura do contrato.</li>
          <li>Parcelamento em 3x no cartão e boleto.</li>
          <li>À vista (valor integral) mediante confirmação de pagamento.</li>
        </ul>
      </div>

      {/* ═══ PAGE 2 ═══ */}
      <div style={s.p2}>
        {/* Header repeated */}
        <div style={s.headerBar}>
          <div>
            <p style={s.title}>Condições Gerais</p>
            <p style={s.subtitle}>GUELLES & DELGADO Co.</p>
          </div>
          <img src={logoGd} alt="GD Co." style={s.logo} />
        </div>

        <div style={s.conditionBlock}>
          <p style={s.conditionTitle}>Prazo</p>
          <ul style={s.bulletList}>
            <li>Início do projeto imediatamente após a confirmação do pagamento.</li>
            <li>Prazos específicos de entrega para cada etapa a serem alinhados na etapa de onboarding do cliente.</li>
          </ul>
        </div>

        <div style={s.conditionBlock}>
          <p style={s.conditionTitle}>Observações</p>
          <ul style={s.bulletList}>
            <li>Após assinatura de contrato, a rescisão de forma imediata de contrato fica em vigor uma multa de 50% do valor total do serviço.</li>
            <li>Toda a entrega de serviço, fica assegurado o direito de imagem apenas da contratada.</li>
          </ul>
        </div>

        <p style={s.validityNote}>Orçamento válido por 7 dias.</p>

        {/* Signature */}
        <div style={s.footer}>
          <div>
            <img src={assinaturaJoao} alt="Assinatura João Delgado" style={s.signatureImg} />
            <div style={s.signatureLine} />
            <p style={s.signatureName}>João Delgado — CMO</p>
            <p style={s.signatureRole}>Guelles & Delgado Co.</p>
          </div>
          <img src={logoGd} alt="GD Co." style={s.logo} />
        </div>
      </div>
    </div>
  );
};

export default BudgetDocument;
