import { useRef, useState } from 'react';
import { X, Download, FileImage, Camera } from 'lucide-react';
import RecipeCardRenderer from './cards/RecipeCardRenderer.jsx';
import SocialRecipeCard from './cards/SocialRecipeCard.jsx';

export default function RecipeCardViewer({ meal, onClose }) {
  const cardRef = useRef(null);
  const socialRef = useRef(null);
  const [tab, setTab] = useState('full'); // 'full' | 'tiktok'
  const [downloading, setDownloading] = useState(false);

  async function captureElement(ref, filename) {
    if (!ref.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(ref.current, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: null,
        logging: false,
      });
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Image capture failed:', err);
    } finally {
      setDownloading(false);
    }
  }

  async function downloadFullImage() {
    await captureElement(cardRef, `${slugify(meal.name)}-recipe-card.png`);
  }

  async function downloadTikTok() {
    await captureElement(socialRef, `${slugify(meal.name)}-tiktok.png`);
  }

  async function downloadAsPDF() {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      const canvas = await html2canvas(cardRef.current, { scale: 2, useCORS: true, allowTaint: false, backgroundColor: null, logging: false });
      const imgData = canvas.toDataURL('image/png');
      const { width: cw, height: ch } = canvas;
      const mmW = (cw / 2 / 96) * 25.4;
      const mmH = (ch / 2 / 96) * 25.4;
      const pdf = new jsPDF({ orientation: mmW > mmH ? 'l' : 'p', unit: 'mm', format: [mmW, mmH] });
      pdf.addImage(imgData, 'PNG', 0, 0, mmW, mmH);
      pdf.save(`${slugify(meal.name)}-recipe-card.pdf`);
    } catch (err) {
      console.error('PDF download failed:', err);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-start overflow-y-auto"
      style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)', padding: '20px 16px 48px' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Close */}
      <button
        className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-full"
        style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}
        onClick={onClose}
      >
        <X size={18} />
      </button>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '999px',
        padding: '4px',
        marginBottom: '20px',
        gap: '4px',
      }}>
        {[{ key: 'full', label: '📄 Full Recipe' }, { key: 'tiktok', label: '📸 TikTok Card' }].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '8px 20px',
              borderRadius: '999px',
              border: 'none',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              background: tab === t.key ? 'white' : 'transparent',
              color: tab === t.key ? '#1a1a1a' : 'rgba(255,255,255,0.7)',
              transition: 'all 0.15s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Full Recipe Card */}
      {tab === 'full' && (
        <>
          <div style={{ marginBottom: '20px' }}>
            <RecipeCardRenderer meal={meal} cardRef={cardRef} />
          </div>
          <div className="flex gap-3 flex-wrap justify-center">
            <button
              className="flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-[14px]"
              style={{ background: 'white', color: '#1a1a1a' }}
              onClick={downloadFullImage}
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
        </>
      )}

      {/* TikTok Card */}
      {tab === 'tiktok' && (
        <>
          <div style={{ marginBottom: '20px' }}>
            <SocialRecipeCard meal={meal} socialRef={socialRef} />
          </div>
          <button
            className="flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-[15px]"
            style={{ background: '#FF6B47', color: 'white', border: 'none', cursor: 'pointer' }}
            onClick={downloadTikTok}
            disabled={downloading}
          >
            <Camera size={18} />
            {downloading ? 'Saving…' : '📸 Save for TikTok'}
          </button>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '10px', textAlign: 'center' }}>
            390×600 — designed for TikTok slides & Instagram stories
          </p>
        </>
      )}

      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', marginTop: '16px' }}>
        Tap outside to close
      </p>
    </div>
  );
}

function slugify(str) {
  return str.replace(/\s+/g, '-').toLowerCase();
}
