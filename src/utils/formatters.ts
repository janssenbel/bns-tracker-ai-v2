import { VehicleRecord } from '../types';

export function normalizePlate(plate: string): string {
  return (plate || '').replace(/[\s\-_]/g, '').toUpperCase();
}

export function formatCurrency(amount: number, currency: string = '₱'): string {
  const num = isNaN(amount) ? 0 : amount;
  return `${currency} ${num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function calculateDays(
  boughtVal: string,
  soldVal: string
): {
  totalDays: number | null;
  status: 'Sold' | 'In Stock' | 'Invalid' | 'No Date';
  label: string;
} {
  if (!boughtVal) {
    return { totalDays: null, status: 'No Date', label: '—' };
  }

  const dBought = new Date(boughtVal + 'T00:00:00');
  if (isNaN(dBought.getTime())) {
    return { totalDays: null, status: 'Invalid', label: 'Invalid' };
  }

  if (soldVal) {
    const dSold = new Date(soldVal + 'T00:00:00');
    if (isNaN(dSold.getTime())) {
      return { totalDays: null, status: 'Invalid', label: 'Invalid' };
    }
    const diffTime = dSold.getTime() - dBought.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) {
      return { totalDays: 0, status: 'Invalid', label: 'Invalid Date Range' };
    }
    return { totalDays: diffDays, status: 'Sold', label: `${diffDays}d (Sold)` };
  } else {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diffTime = now.getTime() - dBought.getTime();
    const diffDays = Math.max(0, Math.round(diffTime / (1000 * 60 * 60 * 24)));
    return { totalDays: diffDays, status: 'In Stock', label: `${diffDays}d (Stock)` };
  }
}

export function generateFullHtmlDocument(record: VehicleRecord): string {
  let partnerSummaryRows = '';
  let partnerExpenseColumns = '';
  let partnerSignatures = '';

  if (record.partners && record.partners.length > 0) {
    record.partners.forEach((p) => {
      partnerSummaryRows += `
        <tr>
          <td style="padding: 7px 8px; border: 1px solid #cbd5e1; white-space: nowrap;"><strong>👤 ${p.name}</strong></td>
          <td style="padding: 7px 8px; border: 1px solid #cbd5e1; text-align: right; font-family: monospace; white-space: nowrap;">${(p.share || 0).toFixed(1)}%</td>
          <td style="padding: 7px 8px; border: 1px solid #cbd5e1; text-align: right; font-family: monospace; white-space: nowrap;">${record.currency} ${(p.spent || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
          <td style="padding: 7px 8px; border: 1px solid #cbd5e1; text-align: right; font-family: monospace; white-space: nowrap; color: ${(p.profitPortion || 0) >= 0 ? '#059669' : '#e11d48'};">${record.currency} ${(p.profitPortion || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
          <td style="padding: 7px 8px; border: 1px solid #cbd5e1; text-align: right; font-weight: 800; font-family: monospace; white-space: nowrap; color: #2563eb;">${record.currency} ${(p.payout || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
        </tr>
      `;

      const itemsHtml =
        p.expenses && p.expenses.length > 0
          ? p.expenses
              .map(
                (e) => `
            <tr>
              <td style="padding: 5px 8px; border: 1px solid #e2e8f0; font-size: 9pt;">${e.name}</td>
              <td style="padding: 5px 8px; border: 1px solid #e2e8f0; text-align: right; font-family: monospace; font-size: 9pt; white-space: nowrap;">${record.currency} ${e.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
            </tr>
          `
              )
              .join('')
          : `<tr><td colspan="2" style="padding: 6px; font-size: 8.5pt; color: #64748b; text-align: center;">No expenses recorded.</td></tr>`;

      partnerExpenseColumns += `
        <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; background: #f8fafc;">
          <h4 style="font-size: 9.5pt; text-transform: uppercase; color: #2563eb; margin-bottom: 6px; margin-top: 0; font-weight: 800;">👤 ${p.name}'s Itemized Costs</h4>
          <table style="width: 100%; border-collapse: collapse;">
            <tbody>${itemsHtml}</tbody>
            <tfoot>
              <tr style="background: #edf2f7; font-weight: 700;">
                <td style="padding: 5px 8px; font-size: 9pt;">Subtotal Outlay</td>
                <td style="padding: 5px 8px; text-align: right; font-family: monospace; font-size: 9pt; white-space: nowrap;">${record.currency} ${(p.spent || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      `;

      partnerSignatures += `
        <div style="text-align: center;">
          <div style="border-bottom: 1.5px solid #64748b; height: 42px; margin-bottom: 8px;"></div>
          <p style="font-size: 9.5pt; margin: 0; font-weight: 700; color: #0f172a;">${p.name}</p>
          <p style="font-size: 8pt; margin: 2px 0 0 0; color: #64748b;">Managing Partner / Signature &amp; Date</p>
        </div>
      `;
    });
  }

  const profitColor = (record.profit || 0) >= 0 ? '#059669' : '#e11d48';

  return `
    <div style="font-family: system-ui, -apple-system, sans-serif; color: #0f172a; max-width: 800px; margin: 0 auto; background: #ffffff; padding: 4px;">
      <!-- Header -->
      <div style="border-bottom: 2.5px solid #0f172a; padding-bottom: 12px; margin-bottom: 14px; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end; gap: 10px;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 2px;">
            <img
              src="https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f697.png"
              alt="🚗"
              style="width: 26px; height: 26px; vertical-align: middle;"
            />
            <h2 style="font-size: 16pt; font-weight: 900; margin: 0; color: #0f172a; letter-spacing: -0.02em;">
              BelBros Car Trading
            </h2>
          </div>
          <p style="font-size: 9.5pt; color: #475569; margin: 0; font-weight: 600;">
            Official Vehicle Deal Settlement Statement
          </p>
        </div>
        <div style="text-align: right;">
          <span style="display: inline-block; font-family: monospace; font-weight: 800; font-size: 11.5pt; padding: 4px 10px; border-radius: 6px; background: #fef08a; color: #713f12; border: 1.5px solid #eab308;">
            ${record.plate}
          </span>
          <div style="font-size: 8pt; color: #64748b; margin-top: 3px;">Ref ID: #${record.id}</div>
        </div>
      </div>

      <!-- Top Summary Grid (Responsive for Portrait & Print) -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; background: #f8fafc;">
          <h3 style="font-size: 8.5pt; text-transform: uppercase; color: #64748b; margin: 0 0 4px 0; font-weight: 800; letter-spacing: 0.05em;">Vehicle Description</h3>
          <div style="font-size: 12.5pt; font-weight: 900; color: #0f172a;">${record.title}</div>
          <div style="font-size: 9pt; color: #334155; margin-top: 6px; line-height: 1.45;">
            📅 Bought: <strong>${record.dateBought || 'N/A'}</strong><br>
            🏷️ Sold: <strong>${record.dateSold || 'Still in Inventory (Active)'}</strong><br>
            ⏱️ Holding Period: <strong>${record.totalDays !== null ? `${record.totalDays} Days` : 'N/A'}</strong>
          </div>
        </div>

        <div style="border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; background: #f8fafc; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <h3 style="font-size: 8.5pt; text-transform: uppercase; color: #64748b; margin: 0 0 2px 0; font-weight: 800; letter-spacing: 0.05em;">Gross Selling Price</h3>
            <div style="font-size: 15pt; font-weight: 900; color: #059669; font-family: monospace;">
              ${record.currency} ${(record.sell || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div style="border-top: 1px dashed #cbd5e1; padding-top: 6px; margin-top: 6px;">
            <div style="font-size: 8.5pt; color: #475569;">Total Capital Outlay: <strong style="font-family: monospace; color:#e11d48;">${record.currency} ${(record.totalCapital || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></div>
            <div style="font-size: 9.5pt; font-weight: 800; color: ${profitColor}; margin-top: 2px;">
              Net Deal Profit: <span style="font-family: monospace;">${record.currency} ${(record.profit || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span> (${(record.margin || 0).toFixed(1)}%)
            </div>
          </div>
        </div>
      </div>

      <!-- Partner Final Settlement Table -->
      <div style="margin-bottom: 16px;">
        <h3 style="font-size: 9.5pt; text-transform: uppercase; margin: 0 0 6px 0; color: #0f172a; font-weight: 800; letter-spacing: 0.04em;">Partner Final Settlement Summary</h3>
        <div style="overflow-x: auto; width: 100%;">
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 4px; font-size: 8.5pt;">
            <thead>
              <tr style="background: #f1f5f9; text-transform: uppercase; font-size: 7.5pt; color: #475569;">
                <th style="padding: 7px 8px; border: 1px solid #cbd5e1; text-align: left;">Partner</th>
                <th style="padding: 7px 8px; border: 1px solid #cbd5e1; text-align: right;">Share %</th>
                <th style="padding: 7px 8px; border: 1px solid #cbd5e1; text-align: right;">Capital In</th>
                <th style="padding: 7px 8px; border: 1px solid #cbd5e1; text-align: right;">Profit Share</th>
                <th style="padding: 7px 8px; border: 1px solid #cbd5e1; text-align: right;">Take-Home</th>
              </tr>
            </thead>
            <tbody>
              ${partnerSummaryRows}
            </tbody>
            <tfoot>
              <tr style="background: #f8fafc; font-weight: 900; font-size: 9pt;">
                <td colspan="2" style="padding: 7px 8px; border: 1px solid #cbd5e1;">Grand Total</td>
                <td style="padding: 7px 8px; border: 1px solid #cbd5e1; text-align: right; font-family: monospace; white-space: nowrap; color:#e11d48;">${record.currency} ${(record.totalCapital || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td style="padding: 7px 8px; border: 1px solid #cbd5e1; text-align: right; font-family: monospace; white-space: nowrap; color:${profitColor};">${record.currency} ${(record.profit || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                <td style="padding: 7px 8px; border: 1px solid #cbd5e1; text-align: right; font-family: monospace; white-space: nowrap; color:#2563eb;">${record.currency} ${(record.sell || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <p style="font-size: 8pt; color: #64748b; margin: 4px 0 0 0;">⚖️ Full Capital Reimbursement: Every managing partner recovers 100% of their actual itemized expenses, plus their agreed percentage of the remaining net deal profit.</p>
      </div>

      <!-- Itemized Partner Costs -->
      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 9.5pt; text-transform: uppercase; margin: 0 0 8px 0; color: #0f172a; font-weight: 800; letter-spacing: 0.04em;">Itemized Outlays by Partner</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 12px;">
          ${partnerExpenseColumns}
        </div>
      </div>

      <!-- Signatures -->
      <div style="margin-top: 32px; padding-top: 14px; border-top: 1px solid #cbd5e1;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 24px;">
          ${partnerSignatures}
        </div>
        <p style="font-size: 7.5pt; color: #94a3b8; text-align: center; margin-top: 20px;">Generated via BelBros Car Trading System &bull; Confidential Business Record</p>
      </div>
    </div>
  `;
}
