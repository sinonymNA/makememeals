import { useRef, useState } from 'react';
import { X, Download, FileImage } from 'lucide-react';
import RecipeCardRenderer from './cards/RecipeCardRenderer.jsx';

export default function RecipeCardViewer({ meal, onClose }) {
  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  async function downloadAsImage() {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: null,
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `${meal.name.replace(/\s+/g, '-').toLowerCase()}-recipe-card.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Image download failed:', err);
    } finally {
      setDownloading(false);
    }
  }

  async function downloadAsPDF() {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: null,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const { width: cw, height: ch } = canvas;
      const mmW = (cw / 2 / 96) * 25.4;
      const mmH = (ch / 2 / 96) * 25.4;

      const pdf = new jsPDF({ orientation: mmW > mmH ? 'l' : 'p', unit: 'mm', format: [mmW, mmH] });
      pdf.addImage(imgData, 'PNG', 0, 0, mmW, mmH);
      pdf.save(`${meal.name.replace(/\s+/g, '-').toLowerCase()}-recipe-card.pdf`);
    } catch (err) {
      console.error('PDF download failed:', err);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-start overflow-y-auto"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', padding: '24px 16px 48px' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Close button */}
      <button
        className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-full"
        style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}
        onClick={onClose}
      >
        <X size={18} />
      </button>

      {/* Card */}
      <div style={{ marginTop: '16px', marginBottom: '24px' }}>
        <RecipeCardRenderer meal={meal} cardRef={cardRef} />
      </div>

      {/* Download buttons */}
      <div className="flex gap-3">
        <button
          className="flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-[14px]"
          style={{ background: 'white', color: '#1a1a1a' }}
          onClick={downloadAsImage}
          disabled={downloading}
        >
          <FileImage size={16} />
          {downloading ? 'Saving…' : 'Save as Image'}
        </button>
        <button
          className="flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-[14px]"
          style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}
          onClick={downloadAsPDF}
          disabled={downloading}
        >
          <Download size={16} />
          {downloading ? 'Saving…' : 'Save as PDF'}
        </button>
      </div>

      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '12px' }}>
        Tap outside to close
      </p>
    </div>
  );
}
