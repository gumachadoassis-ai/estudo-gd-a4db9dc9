import { useCallback, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, Loader2 } from 'lucide-react';

interface ExportPDFProps {
  targetId: string;
  filename: string;
}

const ExportPDF = ({ targetId, filename }: ExportPDFProps) => {
  const [loading, setLoading] = useState(false);

  const handleExport = useCallback(async () => {
    const element = document.getElementById(targetId);
    if (!element) return;

    setLoading(true);

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF',
        windowWidth: 1200,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const contentWidth = pageWidth - margin * 2;

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = contentWidth / imgWidth;
      const scaledHeight = imgHeight * ratio;

      let yOffset = 0;
      const availableHeight = pageHeight - margin * 2;

      while (yOffset < scaledHeight) {
        if (yOffset > 0) pdf.addPage();

        pdf.addImage(
          imgData,
          'PNG',
          margin,
          margin - yOffset,
          contentWidth,
          scaledHeight
        );

        yOffset += availableHeight;
      }

      pdf.save(`${filename}.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setLoading(false);
    }
  }, [targetId, filename]);

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="inline-flex items-center gap-2.5 bg-foreground text-background font-semibold py-3.5 px-8 rounded-xl text-sm tracking-wide transition-all hover:opacity-90 disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {loading ? 'Gerando PDF...' : 'Exportar Relatório'}
    </button>
  );
};

export default ExportPDF;
