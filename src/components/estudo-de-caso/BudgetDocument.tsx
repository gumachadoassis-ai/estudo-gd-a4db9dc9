import logoGd from '@/assets/logo-gd.png';
import type { Relatorio } from './types';

interface BudgetDocumentProps {
  relatorio: Relatorio;
}

const SERVICOS = [
  { servico: 'Estudo da Base Atual', valor: 'R$ 500,00' },
  { servico: 'Treinamentos', valor: 'R$ 9.000,00' },
  { servico: 'Desenvolvimento de Funil de Vendas', valor: 'R$ 1.500,00' },
  { servico: 'Prova de Capacitação', valor: 'R$ 3.000,00' },
  { servico: 'Trabalho na Base de Leads', valor: 'R$ 1.000,00' },
];

const BudgetDocument = ({ relatorio }: BudgetDocumentProps) => {
  const { nomeClinica } = relatorio;
  const dataAtual = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div
      style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        backgroundColor: '#f5f0eb',
        color: '#1a1a1a',
        padding: '60px 50px',
        maxWidth: '800px',
        margin: '0 auto',
        minHeight: '1120px',
        position: 'relative',
      }}
    >
      {/* Title */}
      <h1
        style={{
          fontStyle: 'italic',
          fontSize: '32px',
          fontWeight: 700,
          textAlign: 'center',
          marginBottom: '40px',
          color: '#1a1a1a',
        }}
      >
        Proposta de orçamento
      </h1>

      {/* Client Info Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 40px', marginBottom: '36px', fontSize: '14px' }}>
        <div>
          <span style={{ fontWeight: 400 }}>Empresa: </span>
          <span style={{ fontWeight: 600 }}>{nomeClinica}</span>
        </div>
        <div />
        <div>
          <span style={{ fontWeight: 400 }}>Responsável: </span>
          <span>João Delgado</span>
        </div>
        <div>
          <span style={{ fontWeight: 400 }}>Validade do orçamento: </span>
          <span>{dataAtual}</span>
        </div>
        <div>
          <span style={{ fontWeight: 400 }}>Email: </span>
          <span>Guellesdelgado@gmail.com</span>
        </div>
        <div>
          <span style={{ fontWeight: 400 }}>Telefone: </span>
          <span>(44) 98868-4100</span>
        </div>
      </div>

      {/* Intro text */}
      <p
        style={{
          fontStyle: 'italic',
          fontSize: '14px',
          lineHeight: '1.7',
          color: '#333',
          marginBottom: '32px',
        }}
      >
        Com base em nossa conversa, especificamos os serviços necessários para desenvolver
        um bom trabalho para o seu negócio. Em caso de dúvidas, estou à disposição.
      </p>

      {/* Services Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '0' }}>
        <thead>
          <tr>
            <th
              style={{
                backgroundColor: '#E67E22',
                color: '#fff',
                textAlign: 'left',
                padding: '14px 20px',
                fontSize: '16px',
                fontStyle: 'italic',
                fontWeight: 700,
                borderBottom: '2px solid #cf6d15',
              }}
            >
              Serviço
            </th>
            <th
              style={{
                backgroundColor: '#E67E22',
                color: '#fff',
                textAlign: 'right',
                padding: '14px 20px',
                fontSize: '16px',
                fontStyle: 'italic',
                fontWeight: 700,
                borderBottom: '2px solid #cf6d15',
              }}
            >
              Valor parcial
            </th>
          </tr>
        </thead>
        <tbody>
          {SERVICOS.map((s, i) => (
            <tr key={i}>
              <td
                style={{
                  padding: '14px 20px',
                  fontSize: '14px',
                  fontStyle: 'italic',
                  borderBottom: '1px solid #ddd',
                  backgroundColor: i % 2 === 0 ? '#fff' : '#f9f6f2',
                }}
              >
                {s.servico}
              </td>
              <td
                style={{
                  padding: '14px 20px',
                  fontSize: '14px',
                  textAlign: 'right',
                  borderBottom: '1px solid #ddd',
                  backgroundColor: i % 2 === 0 ? '#fff' : '#f9f6f2',
                }}
              >
                {s.valor}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td
              colSpan={2}
              style={{
                backgroundColor: '#E67E22',
                color: '#fff',
                textAlign: 'center',
                padding: '16px 20px',
                fontSize: '20px',
                fontWeight: 700,
                fontStyle: 'italic',
              }}
            >
              Valor total: R$15.000,00
            </td>
          </tr>
        </tfoot>
      </table>

      {/* Payment Info */}
      <div style={{ marginTop: '36px', fontSize: '14px', lineHeight: '1.8' }}>
        <p style={{ fontWeight: 700, marginBottom: '4px' }}>Informações de pagamento:</p>
        <p style={{ color: '#444' }}>
          Pagamento mediante link enviado para cliente pós assinatura de contrato
        </p>
      </div>

      <div style={{ marginTop: '16px', fontSize: '14px', lineHeight: '1.8' }}>
        <p style={{ fontWeight: 700, marginBottom: '4px' }}>Prazo de entrega:</p>
        <p style={{ color: '#444' }}>
          Início do projeto a partir da confirmação do pagamento.
        </p>
      </div>

      {/* Signature + Logo */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginTop: '80px',
          paddingTop: '20px',
        }}
      >
        <div>
          <div style={{ borderBottom: '1px solid #1a1a1a', width: '200px', marginBottom: '8px' }} />
          <p style={{ fontSize: '14px', fontWeight: 700, fontStyle: 'italic' }}>João Delgado - CMO</p>
          <p style={{ fontSize: '13px', fontStyle: 'italic', color: '#555' }}>Guelles & Delgado Co.</p>
        </div>
        <img src={logoGd} alt="GD Co." style={{ height: '64px', width: '64px', borderRadius: '6px' }} />
      </div>
    </div>
  );
};

export default BudgetDocument;
