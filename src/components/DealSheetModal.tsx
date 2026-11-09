import React, { useRef, useState } from 'react';
import { VehicleRecord } from '../types';
import { generateFullHtmlDocument } from '../utils/formatters';
import { generateDealSettlementPdf } from '../utils/pdfGenerator';
import { Share2, Printer, FileArchive, X, FileText, Smartphone, Loader2 } from 'lucide-react';
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

  const getFileBaseName = () => {
    const safeSlug = (businessName || 'Car-Trading').replace(/[^a-zA-Z0-9]+/g, '-');
    const safePlate = (record.plate || 'Vehicle').replace(/[^a-zA-Z0-9]+/g, '-');
    return `${safeSlug}-Settlement-${safePlate}`;
  };

  const handleShareDirect = async () => {
    const baseFileName = getFileBaseName();

    try {
      const doc = generateDealSettlementPdf(record, businessName);
      const pdfBlob = doc.output('blob');
      const pdfFile = new File([pdfBlob], `${baseFileName}.pdf`, {
        type: 'application/pdf',
      });

      if (typeof navigator !== 'undefined' && navigator.share) {
        if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
          await navigator.share({
            title: `${businessName} Deal Settlement (${record.plate})`,
            files: [pdfFile],
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
    const isIOS =
      typeof navigator !== 'undefined' &&
      (/iPad|iPhone|iPod/.test(navigator.userAgent || '') ||
        (navigator.maxTouchPoints && navigator.maxTouchPoints > 1));

    if (isIOS) {
      try {
        const doc = generateDealSettlementPdf(record, businessName);
        const pdfBlob = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);

        const opened = window.open(pdfUrl, '_blank');
        if (!opened) {
          handleShareDirect();
        }
        return;
      } catch (e) {
        console.error('Failed to open PDF on iPhone:', e);
      }
    }

    window.print();
  };

  const handleDownloadPdfZip = async () => {
    setIsZipping(true);
    try {
      const baseFileName = getFileBaseName();
      const doc = generateDealSettlementPdf(record, businessName);
      const pdfArrayBuffer = doc.output('arraybuffer');

      const zip = new JSZip();
      zip.file(`${baseFileName}.pdf`, pdfArrayBuffer);

      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      });

      const blobUrl = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${baseFileName}.zip`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      }, 2000);
    } catch (err) {
      console.error('Error generating PDF in zip:', err);
      alert('Failed to generate PDF in ZIP. Please try Save to Files / Share or Print.');
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
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 print-hide">
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
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0 cursor-pointer"
            title="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Actions Bar */}
        <div className="p-3 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/40 print-hide">
          {/* iOS / Mobile Tip */}
          <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 p-2.5 sm:p-3 rounded-xl text-[11px] sm:text-xs text-blue-900 dark:text-blue-300 mb-2.5 sm:mb-3">
            <Smartphone className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">iPhone &amp; Mobile:</strong> Tap <strong>&quot;Save to Files / Share&quot;</strong> to export the PDF to iOS Files, WhatsApp, or AirDrop. Tap <strong>&quot;Print / PDF&quot;</strong> for AirPrint, or <strong>&quot;Download PDF (.zip)&quot;</strong> to get the PDF in a ZIP file.
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={handleShareDirect}
              className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer whitespace-nowrap"
              title="Share PDF or save to iPhone Files app"
            >
              <Share2 className="w-4 h-4 shrink-0" />
              Save to Files / Share
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-3 bg-slate-800 hover:bg-slate-900 active:bg-slate-950 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer dark:bg-slate-700 dark:hover:bg-slate-600 whitespace-nowrap"
              title="AirPrint or view PDF"
            >
              <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
              Print / PDF
            </button>

            <button
              type="button"
              disabled={isZipping}
              onClick={handleDownloadPdfZip}
              className="flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-sm whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
              title="Download PDF statement compressed inside a ZIP file"
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
        <div className="flex-1 overflow-y-auto p-2.5 sm:p-6 bg-slate-100 dark:bg-slate-950/70 print:p-0 print:bg-white print:overflow-visible">
          <div
            id="printable-deal-statement"
            ref={previewRef}
            className="bg-white text-slate-900 rounded-xl p-3.5 sm:p-8 shadow-md border border-slate-200 overflow-x-auto print:border-none print:shadow-none print:p-0"
            dangerouslySetInnerHTML={{ __html: docHtml }}
          />
        </div>
      </div>
    </div>
  );
};
