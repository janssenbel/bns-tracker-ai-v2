import React, { useRef } from 'react';
import { VehicleRecord } from '../types';
import { generateFullHtmlDocument } from '../utils/formatters';
import { Share2, Printer, Download, X, FileText, Smartphone } from 'lucide-react';

interface DealSheetModalProps {
  record: VehicleRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DealSheetModal: React.FC<DealSheetModalProps> = ({
  record,
  isOpen,
  onClose,
}) => {
  const previewRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !record) return null;

  const docHtml = generateFullHtmlDocument(record);

  const getFullStandaloneDocument = () => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BelBros Settlement - ${record.plate || 'Vehicle'}</title>
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
    const fileName = `BelBros-Settlement-${record.plate || 'Car'}.html`;

    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        // Try file sharing if supported
        const file = new File([fullDoc], fileName, { type: 'text/html' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `BelBros Deal Settlement (${record.plate})`,
            files: [file],
          });
          return;
        }

        // Text summary fallback share
        const partnerSummary = (record.partners || [])
          .map((p) => `${p.name}: ${record.currency} ${(p.payout || 0).toLocaleString()}`)
          .join(', ');

        await navigator.share({
          title: `BelBros Settlement - ${record.plate}`,
          text: `🚗 BelBros Deal Settlement: ${record.title} (${record.plate})\n💰 Selling Price: ${record.currency} ${(record.sell || 0).toLocaleString()}\n📈 Net Profit: ${record.currency} ${(record.profit || 0).toLocaleString()}\n👤 Take-Home: ${partnerSummary}`,
        });
        return;
      }
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') return;
    }

    // Fallback: download file
    handleDownloadHtml();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadHtml = () => {
    const fullDoc = getFullStandaloneDocument();
    const blob = new Blob([fullDoc], { type: 'text/html;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `BelBros-Settlement-${record.plate || 'Car'}.html`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      {/* Background click */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden z-10">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Deal Settlement Statement
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {record.title} <span className="font-mono font-bold text-amber-600 dark:text-amber-400">({record.plate})</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Actions Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/40">
          {/* iOS / Mobile Tip */}
          <div className="flex items-start gap-2.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 p-3 rounded-xl text-xs text-blue-900 dark:text-blue-300 mb-3">
            <Smartphone className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">iPhone & Mobile Note:</strong> Tap <strong>&quot;Save to Files / Share&quot;</strong> to export to the iOS Files App, WhatsApp, AirDrop, or Messenger. Or tap <strong>&quot;Print&quot;</strong> to send to an AirPrint/connected printer.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={handleShareDirect}
              className="flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              Save to Files / Share
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800 hover:bg-slate-900 active:bg-slate-950 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer dark:bg-slate-700 dark:hover:bg-slate-600"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              Print (AirPrint / PDF)
            </button>

            <button
              type="button"
              onClick={handleDownloadHtml}
              className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-sm"
            >
              <Download className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              Download HTML
            </button>
          </div>
        </div>

        {/* Modal Printable Document Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 dark:bg-slate-950/70">
          <div
            ref={previewRef}
            className="bg-white text-slate-900 rounded-xl p-5 sm:p-8 shadow-md border border-slate-200"
            dangerouslySetInnerHTML={{ __html: docHtml }}
          />
        </div>
      </div>
    </div>
  );
};
