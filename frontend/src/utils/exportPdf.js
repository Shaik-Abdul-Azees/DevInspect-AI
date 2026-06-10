// frontend/src/utils/exportPdf.js
// Generates a clean, styled PDF of review results using the browser's print API.
// No external PDF library needed — works universally.

/**
 * Export a review result as a styled PDF using window.print()
 * @param {object} review - The review object { code, language, score, summary, issues }
 */
export function exportReviewAsPdf(review) {
  if (!review) return;

  const severityColor = (severity) => {
    switch (severity) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      case 'low': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const scoreColor = review.score >= 80 ? '#10b981' : review.score >= 50 ? '#f59e0b' : '#ef4444';

  const issuesHtml = review.issues.map((issue, idx) => `
    <div style="border:1px solid #e5e7eb; border-radius:8px; padding:14px; margin-bottom:12px; page-break-inside:avoid;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <strong style="font-size:13px; color:#1f2937;">${idx + 1}. ${issue.title}</strong>
        <span style="font-size:10px; font-weight:700; padding:2px 8px; border-radius:12px; background:${severityColor(issue.severity)}15; color:${severityColor(issue.severity)}; text-transform:uppercase; border:1px solid ${severityColor(issue.severity)}30;">
          ${issue.severity}
        </span>
      </div>
      <p style="font-size:12px; color:#374151; margin:0 0 8px 0; line-height:1.6;">${issue.description}</p>
      <div style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:6px; padding:10px; margin-top:6px;">
        <p style="font-size:10px; font-weight:700; color:#6b7280; margin:0 0 4px 0; text-transform:uppercase;">Recommended Fix</p>
        <pre style="font-size:11px; color:#1f2937; margin:0; white-space:pre-wrap; word-break:break-word; font-family:'Fira Code',monospace;">${issue.fix}</pre>
      </div>
    </div>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>DevInspect AI - Code Review Report</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; padding: 40px; color: #1f2937; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <div style="text-align:center; margin-bottom:32px; border-bottom:2px solid #e5e7eb; padding-bottom:24px;">
        <h1 style="font-size:22px; font-weight:800; margin-bottom:4px;">
          <span style="color:#0ea5e9;">DevInspect</span> <span style="color:#ec4899;">AI</span>
        </h1>
        <p style="font-size:12px; color:#6b7280;">Automated Code Security & Quality Report</p>
        <p style="font-size:11px; color:#9ca3af; margin-top:6px;">Generated: ${new Date().toLocaleString()}</p>
      </div>

      <div style="display:flex; gap:16px; margin-bottom:24px;">
        <div style="flex:1; border:1px solid #e5e7eb; border-radius:10px; padding:16px; text-align:center;">
          <p style="font-size:10px; color:#6b7280; text-transform:uppercase; font-weight:700; margin-bottom:6px;">Quality Score</p>
          <p style="font-size:32px; font-weight:800; color:${scoreColor};">${review.score}/100</p>
        </div>
        <div style="flex:1; border:1px solid #e5e7eb; border-radius:10px; padding:16px; text-align:center;">
          <p style="font-size:10px; color:#6b7280; text-transform:uppercase; font-weight:700; margin-bottom:6px;">Language</p>
          <p style="font-size:18px; font-weight:700; color:#1f2937;">${review.language}</p>
        </div>
        <div style="flex:1; border:1px solid #e5e7eb; border-radius:10px; padding:16px; text-align:center;">
          <p style="font-size:10px; color:#6b7280; text-transform:uppercase; font-weight:700; margin-bottom:6px;">Issues Found</p>
          <p style="font-size:18px; font-weight:700; color:#1f2937;">${review.issues.length}</p>
        </div>
      </div>

      <div style="border:1px solid #dbeafe; background:#eff6ff; border-radius:10px; padding:16px; margin-bottom:24px;">
        <p style="font-size:10px; font-weight:700; color:#2563eb; text-transform:uppercase; margin-bottom:6px;">Synopsis</p>
        <p style="font-size:12px; color:#1e40af; line-height:1.6;">${review.summary}</p>
      </div>

      <div style="margin-bottom:16px;">
        <p style="font-size:12px; font-weight:700; color:#6b7280; text-transform:uppercase; margin-bottom:12px;">
          Identified Findings (${review.issues.length})
        </p>
        ${issuesHtml || '<p style="font-size:12px; color:#10b981; text-align:center; padding:24px;">✨ No issues found — code is clean!</p>'}
      </div>

      <div style="border-top:1px solid #e5e7eb; padding-top:16px; margin-top:24px; text-align:center;">
        <p style="font-size:10px; color:#9ca3af;">DevInspect AI — AI-Powered Code Review & Security Audit Platform</p>
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    // Wait for content to render
    printWindow.onload = () => {
      printWindow.print();
    };
    // Fallback if onload doesn't fire (some browsers)
    setTimeout(() => {
      if (!printWindow.closed) {
        printWindow.print();
      }
    }, 500);
  }
}
