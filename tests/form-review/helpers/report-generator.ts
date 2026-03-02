import * as fs from 'fs';
import * as path from 'path';
import type { AuditRow } from './field-audit';
import type { FormFixture } from '../fixtures/types';

function statusIcon(status: AuditRow['status']): string {
  switch (status) {
    case 'filled': return '✅';
    case 'blank': return '⬜';
    case 'no_pdf_field': return '—';
    case 'error': return '⚠️';
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function pdfFieldLabel(pdfField: string | string[]): string {
  return Array.isArray(pdfField) ? pdfField.join(', ') : pdfField;
}

export function generateReport(options: {
  formId: string;
  fixture: FormFixture;
  dictationScreenshot: Buffer;
  reviewScreenshot: Buffer;
  auditRows: AuditRow[];
  outputDir: string;
}): string {
  const { formId, fixture, dictationScreenshot, reviewScreenshot, auditRows, outputDir } = options;

  const dictationDataUri = `data:image/png;base64,${dictationScreenshot.toString('base64')}`;
  const reviewDataUri = `data:image/png;base64,${reviewScreenshot.toString('base64')}`;

  const filledCount = auditRows.filter((r) => r.status === 'filled').length;
  const blankCount = auditRows.filter((r) => r.status === 'blank').length;
  const totalMapped = auditRows.filter((r) => r.status !== 'no_pdf_field').length;

  const tableRows = auditRows
    .map(
      (row) => `
      <tr class="${row.status}">
        <td>${escapeHtml(row.section)}</td>
        <td><code>${escapeHtml(row.fieldKey)}</code></td>
        <td>${escapeHtml(row.label)}</td>
        <td><code>${escapeHtml(pdfFieldLabel(row.pdfField))}</code></td>
        <td class="status-cell">${statusIcon(row.status)} ${row.status}</td>
        <td>${escapeHtml(row.actualValue)}</td>
      </tr>`
    )
    .join('');

  const guidedAnswersRows = Object.entries(fixture.guidedAnswers)
    .map(([k, v]) => `<tr><td><code>${escapeHtml(k)}</code></td><td>${escapeHtml(v)}</td></tr>`)
    .join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(formId)} Review — ${escapeHtml(fixture.scenario)}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; margin: 0; padding: 20px; background: #f8f9fa; color: #1a1a1a; }
    h1 { font-size: 1.5rem; margin-bottom: 4px; }
    .meta { color: #666; font-size: 0.875rem; margin-bottom: 24px; }
    h2 { font-size: 1.1rem; margin: 24px 0 8px; border-bottom: 1px solid #e0e0e0; padding-bottom: 4px; }
    .summary { display: flex; gap: 16px; margin-bottom: 20px; }
    .stat { background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 12px 20px; text-align: center; }
    .stat .num { font-size: 2rem; font-weight: 700; }
    .stat .lbl { font-size: 0.75rem; color: #666; text-transform: uppercase; letter-spacing: 0.05em; }
    .screenshots { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
    .screenshot-card { background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; }
    .screenshot-card h3 { margin: 0; padding: 10px 14px; font-size: 0.875rem; background: #f0f0f0; border-bottom: 1px solid #e0e0e0; }
    .screenshot-card img { width: 100%; display: block; }
    table { width: 100%; border-collapse: collapse; background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; font-size: 0.8rem; }
    th { background: #f0f0f0; padding: 8px 10px; text-align: left; font-weight: 600; border-bottom: 1px solid #e0e0e0; }
    td { padding: 6px 10px; border-bottom: 1px solid #f0f0f0; vertical-align: top; }
    tr:last-child td { border-bottom: none; }
    tr.blank td { background: #fffbe6; }
    tr.error td { background: #fff0f0; }
    tr.filled td { }
    .status-cell { white-space: nowrap; }
    code { font-family: monospace; font-size: 0.75rem; background: #f0f0f0; padding: 1px 4px; border-radius: 3px; }
    .guided-table { max-width: 600px; }
  </style>
</head>
<body>
  <h1>${escapeHtml(formId)} — Form Review Report</h1>
  <p class="meta">
    Scenario: <strong>${escapeHtml(fixture.scenario)}</strong> &nbsp;|&nbsp;
    Patient: ${escapeHtml(fixture.patientDetails.customerName ?? '')} &nbsp;|&nbsp;
    Generated: ${new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney' })}
  </p>

  <div class="summary">
    <div class="stat"><div class="num">${filledCount}</div><div class="lbl">Filled</div></div>
    <div class="stat"><div class="num">${blankCount}</div><div class="lbl">Blank</div></div>
    <div class="stat"><div class="num">${totalMapped}</div><div class="lbl">Total mapped</div></div>
    <div class="stat"><div class="num">${totalMapped > 0 ? Math.round((filledCount / totalMapped) * 100) : 0}%</div><div class="lbl">Fill rate</div></div>
  </div>

  <h2>Guided Answers Injected</h2>
  <table class="guided-table">
    <thead><tr><th>Key</th><th>Value</th></tr></thead>
    <tbody>${guidedAnswersRows}</tbody>
  </table>

  <h2>Screenshots</h2>
  <div class="screenshots">
    <div class="screenshot-card">
      <h3>Guided Dictation Panel</h3>
      <img src="${dictationDataUri}" alt="Guided dictation screenshot" />
    </div>
    <div class="screenshot-card">
      <h3>Form Review (PDF Preview)</h3>
      <img src="${reviewDataUri}" alt="PDF review screenshot" />
    </div>
  </div>

  <h2>Field Audit</h2>
  <table>
    <thead>
      <tr>
        <th>Section</th>
        <th>Field Key</th>
        <th>Label</th>
        <th>PDF Field</th>
        <th>Status</th>
        <th>Value</th>
      </tr>
    </thead>
    <tbody>${tableRows}</tbody>
  </table>
</body>
</html>`;

  fs.mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, `${formId}-review.html`);
  fs.writeFileSync(outputPath, html, 'utf-8');
  return outputPath;
}
