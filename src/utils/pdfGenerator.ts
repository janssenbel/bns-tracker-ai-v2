import { jsPDF } from 'jspdf';
import { VehicleRecord } from '../types';
import { formatCurrency } from './formatters';

export function generateDealSettlementPdf(
  record: VehicleRecord,
  businessName: string = 'BelBros Car Trading'
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 595.28
  const pageHeight = doc.internal.pageSize.getHeight(); // 841.89
  const margin = 36;
  const contentWidth = pageWidth - margin * 2; // 523.28

  let y = margin + 10;

  // Helper for checking page boundaries and adding page if needed
  const ensureSpace = (requiredSpace: number) => {
    if (y + requiredSpace > pageHeight - margin) {
      doc.addPage();
      y = margin + 20;
    }
  };

  // --- 1. HEADER ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42); // #0f172a
  doc.text(businessName, margin, y);

  // Plate Badge on top right
  const plateText = (record.plate || 'NO PLATE').toUpperCase();
  doc.setFontSize(11);
  const plateWidth = doc.getTextWidth(plateText) + 20;
  const plateX = pageWidth - margin - plateWidth;
  const plateY = y - 14;

  // Yellow badge background
  doc.setFillColor(254, 240, 138); // #fef08a
  doc.setDrawColor(234, 179, 8); // #eab308
  doc.setLineWidth(1.5);
  doc.roundedRect(plateX, plateY, plateWidth, 20, 4, 4, 'FD');

  doc.setTextColor(113, 63, 18); // #713f12
  doc.text(plateText, plateX + 10, plateY + 14);

  // Subtitle
  y += 16;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105); // #475569
  doc.text('Official Vehicle Deal Settlement Statement', margin, y);

  // Ref ID on right
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  const refText = `Ref ID: #${record.id}`;
  doc.text(refText, pageWidth - margin - doc.getTextWidth(refText), y);

  // Header Divider
  y += 10;
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(2);
  doc.line(margin, y, pageWidth - margin, y);
  y += 16;

  // --- 2. TOP SUMMARY GRID (2 Columns) ---
  const boxWidth = (contentWidth - 12) / 2;
  const boxHeight = 100;

  // Left Box: Vehicle Description
  doc.setFillColor(248, 250, 252); // #f8fafc
  doc.setDrawColor(203, 213, 225); // #cbd5e1
  doc.setLineWidth(1);
  doc.roundedRect(margin, y, boxWidth, boxHeight, 6, 6, 'FD');

  let boxY = y + 15;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('VEHICLE DESCRIPTION', margin + 12, boxY);

  boxY += 15;
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  const titleText = doc.splitTextToSize(record.title || 'Vehicle', boxWidth - 24);
  doc.text(titleText, margin + 12, boxY);

  boxY += (titleText.length * 13) + 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`Bought: ${record.dateBought || 'N/A'}`, margin + 12, boxY);
  boxY += 12;
  doc.text(`Sold: ${record.dateSold || 'Still in Inventory (Active)'}`, margin + 12, boxY);
  boxY += 12;
  doc.text(`Holding Period: ${record.totalDays !== null ? `${record.totalDays} Days` : 'N/A'}`, margin + 12, boxY);

  // Right Box: Financial Summary
  const rightX = margin + boxWidth + 12;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(rightX, y, boxWidth, boxHeight, 6, 6, 'FD');

  boxY = y + 15;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('GROSS SELLING PRICE', rightX + 12, boxY);

  boxY += 18;
  doc.setFontSize(15);
  doc.setTextColor(5, 150, 105); // #059669
  doc.text(formatCurrency(record.sell || 0, record.currency || '₱'), rightX + 12, boxY);

  boxY += 8;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.8);
  doc.line(rightX + 12, boxY, rightX + boxWidth - 12, boxY);

  boxY += 14;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Total Capital Outlay: ', rightX + 12, boxY);
  const capLabelW = doc.getTextWidth('Total Capital Outlay: ');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(225, 29, 72); // #e11d48
  doc.text(formatCurrency(record.totalCapital || 0, record.currency || '₱'), rightX + 12 + capLabelW, boxY);

  boxY += 15;
  const isProfit = (record.profit || 0) >= 0;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(isProfit ? 5 : 225, isProfit ? 150 : 29, isProfit ? 105 : 72);
  doc.text(
    `Net Profit: ${formatCurrency(record.profit || 0, record.currency || '₱')} (${(record.margin || 0).toFixed(1)}%)`,
    rightX + 12,
    boxY
  );

  y += boxHeight + 18;

  // --- 3. PARTNER FINAL SETTLEMENT SUMMARY TABLE ---
  ensureSpace(120);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('PARTNER FINAL SETTLEMENT SUMMARY', margin, y);
  y += 10;

  // Table Column Widths
  const colW = {
    partner: 133.28,
    share: 60,
    capital: 110,
    profit: 110,
    takeHome: 110,
  };

  // Header Row
  doc.setFillColor(241, 245, 249); // #f1f5f9
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(1);
  doc.rect(margin, y, contentWidth, 20, 'FD');

  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  const rowH = 20;
  const textY = y + 13;

  doc.text('PARTNER', margin + 8, textY);
  doc.text('SHARE %', margin + colW.partner + colW.share - 8, textY, { align: 'right' });
  doc.text('CAPITAL IN', margin + colW.partner + colW.share + colW.capital - 8, textY, { align: 'right' });
  doc.text('PROFIT SHARE', margin + colW.partner + colW.share + colW.capital + colW.profit - 8, textY, { align: 'right' });
  doc.text('TAKE-HOME', margin + contentWidth - 8, textY, { align: 'right' });

  y += rowH;

  // Partner Data Rows
  const partners = record.partners || [];
  partners.forEach((p) => {
    ensureSpace(22);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225);
    doc.rect(margin, y, contentWidth, 20, 'FD');

    const curY = y + 13;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(p.name, margin + 8, curY);

    doc.setFont('helvetica', 'normal');
    doc.text(`${(p.share || 0).toFixed(1)}%`, margin + colW.partner + colW.share - 8, curY, { align: 'right' });
    doc.text(formatCurrency(p.spent || 0, record.currency || '₱'), margin + colW.partner + colW.share + colW.capital - 8, curY, { align: 'right' });

    const isPartnerProfit = (p.profitPortion || 0) >= 0;
    doc.setTextColor(isPartnerProfit ? 5 : 225, isPartnerProfit ? 150 : 29, isPartnerProfit ? 105 : 72);
    doc.text(formatCurrency(p.profitPortion || 0, record.currency || '₱'), margin + colW.partner + colW.share + colW.capital + colW.profit - 8, curY, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235); // #2563eb
    doc.text(formatCurrency(p.payout || 0, record.currency || '₱'), margin + contentWidth - 8, curY, { align: 'right' });

    y += 20;
  });

  // Grand Total Row
  ensureSpace(22);
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, contentWidth, 22, 'FD');

  const totY = y + 14;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('Grand Total', margin + 8, totY);

  doc.setTextColor(225, 29, 72);
  doc.text(formatCurrency(record.totalCapital || 0, record.currency || '₱'), margin + colW.partner + colW.share + colW.capital - 8, totY, { align: 'right' });

  doc.setTextColor(isProfit ? 5 : 225, isProfit ? 150 : 29, isProfit ? 105 : 72);
  doc.text(formatCurrency(record.profit || 0, record.currency || '₱'), margin + colW.partner + colW.share + colW.capital + colW.profit - 8, totY, { align: 'right' });

  doc.setTextColor(37, 99, 235);
  doc.text(formatCurrency(record.sell || 0, record.currency || '₱'), margin + contentWidth - 8, totY, { align: 'right' });

  y += 26;

  // Table footnote
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  const footnote = 'Full Capital Reimbursement: Every partner recovers 100% of actual itemized expenses, plus agreed profit share.';
  doc.text(footnote, margin, y);
  y += 18;

  // --- 4. ITEMIZED PARTNER OUTLAYS ---
  if (partners.length > 0) {
    ensureSpace(80);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text('ITEMIZED OUTLAYS BY PARTNER', margin, y);
    y += 12;

    const pBoxWidth = partners.length === 1 ? contentWidth : (contentWidth - 12 * (partners.length - 1)) / partners.length;

    partners.forEach((p, idx) => {
      const pX = margin + idx * (pBoxWidth + 12);
      let currY = y;

      const expenses = p.expenses && p.expenses.length > 0 ? p.expenses : [];
      const itemBoxH = 30 + Math.max(1, expenses.length) * 16 + 22;

      ensureSpace(itemBoxH);
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(pX, currY, pBoxWidth, itemBoxH, 4, 4, 'FD');

      currY += 15;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(37, 99, 235);
      doc.text(`${p.name.toUpperCase()}'S COSTS`, pX + 8, currY);

      currY += 12;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);

      if (expenses.length === 0) {
        doc.text('No expenses recorded.', pX + 8, currY);
        currY += 16;
      } else {
        expenses.forEach((e) => {
          const itemText = doc.splitTextToSize(e.name || 'Expense', pBoxWidth - 85);
          doc.text(itemText[0] || '', pX + 8, currY);
          doc.text(formatCurrency(e.amount || 0, record.currency || '₱'), pX + pBoxWidth - 8, currY, { align: 'right' });
          currY += 16;
        });
      }

      // Subtotal Outlay Row
      doc.setFillColor(237, 242, 247);
      doc.rect(pX, currY - 2, pBoxWidth, 18, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text('Subtotal Outlay', pX + 8, currY + 10);
      doc.text(formatCurrency(p.spent || 0, record.currency || '₱'), pX + pBoxWidth - 8, currY + 10, { align: 'right' });
    });

    // Advance y past the itemized boxes
    const maxItems = Math.max(...partners.map((p) => (p.expenses || []).length), 1);
    y += 30 + maxItems * 16 + 22 + 20;
  }

  // --- 5. SIGNATURES ---
  ensureSpace(70);
  y += 10;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(1);
  doc.line(margin, y, pageWidth - margin, y);
  y += 30;

  if (partners.length > 0) {
    const sigWidth = (contentWidth - 24 * (partners.length - 1)) / partners.length;
    partners.forEach((p, idx) => {
      const sigX = margin + idx * (sigWidth + 24);
      doc.setDrawColor(100, 116, 139);
      doc.setLineWidth(1.2);
      doc.line(sigX + 15, y, sigX + sigWidth - 15, y);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(p.name, sigX + sigWidth / 2, y + 14, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text('Managing Partner / Signature & Date', sigX + sigWidth / 2, y + 25, { align: 'center' });
    });
    y += 40;
  }

  // Footer Note
  ensureSpace(20);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  const footerNote = `Generated via ${businessName} System • Confidential Business Record`;
  doc.text(footerNote, pageWidth / 2, y, { align: 'center' });

  return doc;
}
