import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf, Font } from '@react-pdf/renderer';
import { ContractDraft } from '../types';

// Registrar fonte padrão
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/@pdffonts/helvetica@1.0.0/Helvetica.ttf' },
    { src: 'https://cdn.jsdelivr.net/npm/@pdffonts/helvetica@1.0.0/Helvetica-Bold.ttf', fontWeight: 'bold' },
  ]
});

// Estilos do PDF
const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontSize: 11,
    fontFamily: 'Helvetica',
    lineHeight: 1.5
  },
  header: {
    marginBottom: 30,
    borderBottom: '2px solid #003366',
    paddingBottom: 20
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 5
  },
  subtitle: {
    fontSize: 10,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 2
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    textTransform: 'uppercase',
    color: '#003366'
  },
  contractInfo: {
    marginBottom: 25,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 4
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 5
  },
  infoLabel: {
    width: 120,
    fontWeight: 'bold',
    color: '#333'
  },
  infoValue: {
    flex: 1,
    color: '#555'
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#003366',
    borderBottom: '1px solid #ccc',
    paddingBottom: 5
  },
  partiesSection: {
    marginBottom: 25
  },
  partyTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333'
  },
  partyInfo: {
    marginBottom: 15,
    paddingLeft: 10
  },
  clause: {
    marginBottom: 15
  },
  clauseTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333'
  },
  clauseContent: {
    textAlign: 'justify',
    color: '#444'
  },
  signatureSection: {
    marginTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  signatureBox: {
    width: '45%',
    textAlign: 'center'
  },
  signatureLine: {
    borderTop: '1px solid #000',
    marginTop: 60,
    marginBottom: 5,
    paddingTop: 5
  },
  signatureName: {
    fontSize: 10,
    fontWeight: 'bold'
  },
  signatureRole: {
    fontSize: 9,
    color: '#666'
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    textAlign: 'center',
    fontSize: 8,
    color: '#999',
    borderTop: '1px solid #eee',
    paddingTop: 10
  },
  pageNumber: {
    position: 'absolute',
    bottom: 30,
    right: 50,
    fontSize: 9,
    color: '#666'
  },
  qrSection: {
    position: 'absolute',
    bottom: 50,
    right: 50,
    textAlign: 'center'
  },
  qrText: {
    fontSize: 8,
    color: '#666',
    marginTop: 5
  }
});

// Componente do documento PDF
interface ContractPDFProps {
  draft: ContractDraft;
}

const ContractPDF: React.FC<ContractPDFProps> = ({ draft }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'A definir';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const today = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>KION GROUP</Text>
          <Text style={styles.subtitle}>Linde • STILL • Baoli • Dematic</Text>
        </View>

        {/* Título */}
        <Text style={styles.title}>
          CONTRATO DE {draft.contractType.toUpperCase()}
        </Text>

        {/* Informações do Contrato */}
        <View style={styles.contractInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Referência:</Text>
            <Text style={styles.infoValue}>{draft.title}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Valor Total:</Text>
            <Text style={styles.infoValue}>{formatCurrency(draft.value)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Vigência:</Text>
            <Text style={styles.infoValue}>{draft.durationMonths ? `${draft.durationMonths} meses` : 'A definir'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Data de Início:</Text>
            <Text style={styles.infoValue}>{formatDate(draft.startDate)}</Text>
          </View>
        </View>

        {/* Partes */}
        <View style={styles.partiesSection}>
          <Text style={styles.sectionTitle}>DAS PARTES</Text>
          
          <Text style={styles.partyTitle}>CONTRATADA:</Text>
          <View style={styles.partyInfo}>
            <Text>KION South America Ltda.</Text>
            <Text>CNPJ: 00.000.000/0001-00</Text>
            <Text>Endereço: Av. das Nações Unidas, 12.901 - São Paulo/SP</Text>
          </View>

          <Text style={styles.partyTitle}>CONTRATANTE:</Text>
          <View style={styles.partyInfo}>
            <Text>{draft.clientName}</Text>
            {draft.clientCnpj && <Text>CNPJ: {draft.clientCnpj}</Text>}
            {draft.clientAddress && <Text>Endereço: {draft.clientAddress}</Text>}
            {draft.clientContactName && <Text>Contato: {draft.clientContactName}</Text>}
          </View>
        </View>

        {/* Equipamento */}
        {draft.equipmentDescription && (
          <View>
            <Text style={styles.sectionTitle}>DO EQUIPAMENTO</Text>
            <Text style={styles.clauseContent}>
              {draft.brand && `Marca: ${draft.brand} | `}
              {draft.equipmentCategory && `Categoria: ${draft.equipmentCategory} | `}
              Quantidade: {draft.equipmentQuantity || 1} unidade(s)
            </Text>
            <Text style={{ ...styles.clauseContent, marginTop: 10 }}>
              {draft.equipmentDescription}
            </Text>
          </View>
        )}

        {/* Cláusulas */}
        <Text style={styles.sectionTitle}>DAS CLÁUSULAS</Text>
        {draft.clauses.map((clause) => (
          <View key={clause.number} style={styles.clause}>
            <Text style={styles.clauseTitle}>
              CLÁUSULA {clause.number}ª - {clause.title.toUpperCase()}
            </Text>
            <Text style={styles.clauseContent}>{clause.content}</Text>
          </View>
        ))}

        {/* Termos Customizados */}
        {draft.customTerms && (
          <View>
            <Text style={styles.sectionTitle}>DISPOSIÇÕES ESPECIAIS</Text>
            <Text style={styles.clauseContent}>{draft.customTerms}</Text>
          </View>
        )}

        {/* Assinaturas */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLine}></Text>
            <Text style={styles.signatureName}>KION South America Ltda.</Text>
            <Text style={styles.signatureRole}>CONTRATADA</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLine}></Text>
            <Text style={styles.signatureName}>{draft.clientName}</Text>
            <Text style={styles.signatureRole}>CONTRATANTE</Text>
          </View>
        </View>

        {/* Local e Data */}
        <Text style={{ marginTop: 40, textAlign: 'center', fontSize: 10 }}>
          São Paulo, {today}
        </Text>

        {/* Footer */}
        <Text style={styles.footer}>
          KION GROUP • Documento gerado eletronicamente • Token: {draft.shareToken?.slice(0, 8)}...
        </Text>

        {/* Número da Página */}
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
          `${pageNumber} / ${totalPages}`
        )} fixed />
      </Page>
    </Document>
  );
};

/**
 * Gera e baixa o PDF do contrato
 */
export async function downloadContractPDF(draft: ContractDraft): Promise<void> {
  try {
    const blob = await pdf(<ContractPDF draft={draft} />).toBlob();
    
    // Criar link de download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Contrato_${draft.title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw error;
  }
}

/**
 * Gera o PDF como Blob para preview ou envio
 */
export async function generateContractPDFBlob(draft: ContractDraft): Promise<Blob> {
  return await pdf(<ContractPDF draft={draft} />).toBlob();
}

export { ContractPDF };
