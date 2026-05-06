import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export async function exportAsImage(elementId, filename = 'recipe') {
  const el = document.getElementById(elementId);
  if (!el) return;

  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#FEFEF6',
  });

  const link = document.createElement('a');
  link.download = `${filename}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export async function exportAsPDF(meal) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = 16;

  // Header
  doc.setFillColor(255, 107, 71);
  doc.rect(0, 0, pageWidth, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('🍽️  MAKE ME MEALS', margin, 7);

  y = 20;

  // Title
  doc.setTextColor(44, 24, 16);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  const titleLines = doc.splitTextToSize(meal.name, contentWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 7 + 3;

  // Meta
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(122, 101, 88);
  const meta = `Serves ${meal.servings || 4}  •  ${meal.prep_minutes} min  •  ${meal.difficulty}`;
  doc.text(meta, margin, y);
  y += 6;

  // Divider
  doc.setDrawColor(232, 221, 208);
  doc.line(margin, y, pageWidth - margin, y);
  y += 7;

  // Ingredients
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 107, 71);
  doc.text('WHAT YOU NEED', margin, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(44, 24, 16);

  for (const ing of (meal.ingredients || [])) {
    const line = `• ${ing.quantity} ${ing.unit} ${ing.name}`.trim();
    const lines = doc.splitTextToSize(line, contentWidth - 4);
    if (y + lines.length * 5 > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      y = 16;
    }
    doc.text(lines, margin + 2, y);
    y += lines.length * 5;
  }

  y += 4;
  doc.setDrawColor(232, 221, 208);
  doc.line(margin, y, pageWidth - margin, y);
  y += 7;

  // Steps
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 107, 71);
  doc.text('HOW TO MAKE IT', margin, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(44, 24, 16);

  (meal.steps || []).forEach((step, i) => {
    const text = `${i + 1}. ${step}`;
    const lines = doc.splitTextToSize(text, contentWidth);
    if (y + lines.length * 5 > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      y = 16;
    }
    doc.text(lines, margin, y);
    y += lines.length * 5 + 2;
  });

  y += 4;
  doc.setDrawColor(232, 221, 208);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // Cost
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(122, 101, 88);
  doc.text(`Est. ~$${meal.estimated_cost} • May be cheaper with store sales 🎉`, margin, y);

  doc.save(`${meal.name.replace(/\s+/g, '-').toLowerCase()}.pdf`);
}
