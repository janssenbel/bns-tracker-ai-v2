import React, { useRef, useState } from 'react';
import { VehicleRecord } from '../types';
import { generateFullHtmlDocument } from '../utils/formatters';
import { Share2, Printer, FileArchive, X, FileText, Smartphone, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';

interface DealSheetModalProps {
  record: VehicleRecord | null;
  isOpen: boolean;
  onClose: () => void;
  businessName: string;
}

export const DealSheetModal: React.FC<DealSheetModalProps> = ({
  record,
  isOpen,
  onClose,
  businessName,
}) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isZipping, setIsZipping] = useState(false);

  if (!isOpen || !record) return null;

  const docHtml = generateFullHtmlDocument(record, businessName);

  const getFullStandaloneDocument = () => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${businessName} Settlement - ${record.plate || 'Vehicle'}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; padding: 24px; color: #0f172a; background: #ffffff; }
    .mono { font-family: monospace; }
    .print-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    .print-table th, .print-table td { border: 1px solid #cbd5e1; padding: 8px 10px; font-size: 10pt; }
    .print-table th { background: #f1f5f9; text-transform: uppercase; font-size: 8pt; }
    .uniform-plate-badge { font-family: monospace; font-weight: 800; padding: 4px 10px; border-radius: 4px; background: #fef08a; color: #713f12; border: 1px solid #facc15; }
    @media print {
      body { padding: 0; }
      @page { margin: 1.2cm; size: auto; }
    }
  </style>
</head>
<body>
  ${docHtml}
</body>
</html>`;
  };

  const handleShareDirect = async () => {
    const fullDoc = getFullStandaloneDocument();
    const safeSlug = (businessName || 'Car-Trading').replace(/[^a-zA-Z0-9]+/g, '-');
    const fileName = `${safeSlug}-Settlement-${record.plate || 'Car'}.html`;

    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        // Try file sharing if supported
        const file = new File([fullDoc], fileName, { type: 'text/html' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `${businessName} Deal Settlement (${record.plate})`,
            files: [file],
          });
          return;
        }

        // Text summary fallback share
        const partnerSummary = (record.partners || [])
          .map((p) => `${p.name}: ${record.currency} ${(p.payout || 0).toLocaleString()}`)
          .join(', ');

        await navigator.share({
          title: `${businessName} Settlement - ${record.plate}`,
          text: `🚗 ${businessName} Deal Settlement: ${record.title} (${record.plate})\n💰 Selling Price: ${record.currency} ${(record.sell || 0).toLocaleString()}\n📈 Net Profit: ${record.currency} ${(record.profit || 0).toLocaleString()}\n👤 Take-Home: ${partnerSummary}`,
        });
        return;
      }
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') return;
    }

    // Fallback: download pdf in zip
    handleDownloadPdfZip();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdfZip = async () => {
    if (!previewRef.current || !record) return;
    setIsZipping(true);

    try {
      const element = previewRef.current;
      const safeSlug = (businessName || 'Car-Trading').replace(/[^a-zA-Z0-9]+/g, '-');
      const baseFileName = `${safeSlug}-Settlement-${record.plate || 'Vehicle'}`;

      // Render crisp canvas representation of the settlement statement
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      // A4 format dimensions in points (595.28 x 841.89)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pdfWidth - margin * 2;
      const contentHeight = (canvas.height * contentWidth) / canvas.width;

      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      let heightLeft = contentHeight;
      let position = margin;

      pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, contentHeight);
      heightLeft -= (pdfHeight - margin * 2);

      while (heightLeft > 0) {
        position = margin - (contentHeight - heightLeft);
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, contentHeight);
        heightLeft -= (pdfHeight - margin * 2);
      }

      const pdfBlob = pdf.output('blob');

      // Create ZIP archive containing the generated PDF
      const zip = new JSZip();
      zip.file(`${baseFileName}.pdf`, pdfBlob);

      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      });

      // Trigger file download
      const blobUrl = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${baseFileName}.zip`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      }, 1500);
    } catch (err) {
      console.error('Error generating PDF zip archive:', err);
      alert('Could not generate PDF zip archive. Please use Print to save as PDF directly.');
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      {/* Background click */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[94vh] overflow-hidden z-10">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div className="min-w-0 pr-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              <h3 className="text-sm sm:text-lg font-black text-slate-900 dark:text-white truncate">
                Deal Settlement Statement
              </h3>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              {record.title} <span className="font-mono font-bold text-amber-600 dark:text-amber-400">({record.plate})</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0"
            title="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Actions Bar */}
        <div className="p-3 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/40">
          {/* iOS / Mobile Tip */}
          <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 p-2.5 sm:p-3 rounded-xl text-[11px] sm:text-xs text-blue-900 dark:text-blue-300 mb-2.5 sm:mb-3">
            <Smartphone className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">iPhone & Mobile Note:</strong> Tap <strong>&quot;Save to Files / Share&quot;</strong> to export to iOS Files or WhatsApp, <strong>&quot;Print&quot;</strong> for AirPrint / PDF, or <strong>&quot;Download PDF (.zip)&quot;</strong> to download the PDF inside a ZIP archive.
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={handleShareDirect}
              className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer whitespace-nowrap"
            >
              <Share2 className="w-4 h-4 shrink-0" />
              Save to Files / Share
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-3 bg-slate-800 hover:bg-slate-900 active:bg-slate-950 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer dark:bg-slate-700 dark:hover:bg-slate-600 whitespace-nowrap"
            >
              <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
              Print / PDF
            </button>

            <button
              type="button"
              disabled={isZipping}
              onClick={handleDownloadPdfZip}
              className="flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-sm whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
              title="Download official settlement statement PDF packed in a ZIP archive"
            >
              {isZipping ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 animate-spin shrink-0" />
                  <span>Zipping PDF...</span>
                </>
              ) : (
                <>
                  <FileArchive className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 shrink-0" />
                  <span>Download PDF (.zip)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Modal Printable Document Body */}
        <div className="flex-1 overflow-y-auto p-2.5 sm:p-6 bg-slate-100 dark:bg-slate-950/70">
          <div
            ref={previewRef}
            className="bg-white text-slate-900 rounded-xl p-3.5 sm:p-8 shadow-md border border-slate-200 overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: docHtml }}
          />
        </div>
      </div>
    </div>
  );
};
