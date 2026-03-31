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
      const element = document.getElementById(targetId);
      const budgetEl = document.getElementById('report-budget');
      if (!element) return;

      // Temporarily show budget element for capture
      if (budgetEl) budgetEl.classList.remove('hidden');

      const captureElement = async (el: HTMLElement) => {
        return html2canvas(el, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#FFFFFF',
          windowWidth: 1200,
        });
      };

      const canvas = await captureElement(element);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const contentWidth = pageWidth - margin * 2;
      const availableHeight = pageHeight - margin * 2;

      // Add main report pages
      const ratio = contentWidth / canvas.width;
      const scaledHeight = canvas.height * ratio;
      const imgData = canvas.toDataURL('image/png');
      let yOffset = 0;

      while (yOffset < scaledHeight) {
        if (yOffset > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', margin, margin - yOffset, contentWidth, scaledHeight);
        yOffset += availableHeight;
      }

      // Add budget page (only recommended product)
      if (budgetEl) {
        const budgetCanvas = await captureElement(budgetEl);
        const budgetImgData = budgetCanvas.toDataURL('image/png');
        const budgetRatio = contentWidth / budgetCanvas.width;
        const budgetScaledHeight = budgetCanvas.height * budgetRatio;

        pdf.addPage();
        pdf.addImage(budgetImgData, 'PNG', margin, margin, contentWidth, budgetScaledHeight);
        budgetEl.classList.add('hidden');
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
