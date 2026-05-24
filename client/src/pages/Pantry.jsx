import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { ChevronLeft, Plus, Trash2, Camera, Edit3, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { setAuthToken, getPantry, addPantryItem, updatePantryItem, deletePantryItem, scanPantry } from '../lib/api.js';

const CATEGORIES = {
  produce:    { label: 'Produce',     emoji: '🥦', color: '#2ECC71' },
  meat:       { label: 'Meat',        emoji: '🥩', color: '#E74C3C' },
  seafood:    { label: 'Seafood',     emoji: '🐟', color: '#3498DB' },
  dairy:      { label: 'Dairy',       emoji: '🥛', color: '#F39C12' },
  grains:     { label: 'Grains',      emoji: '🌾', color: '#D4A017' },
  canned:     { label: 'Canned',      emoji: '🥫', color: '#E67E22' },
  condiments: { label: 'Condiments',  emoji: '🧴', color: '#9B59B6' },
  frozen:     { label: 'Frozen',      emoji: '🧊', color: '#1ABC9C' },
  snacks:     { label: 'Snacks',      emoji: '🍿', color: '#E91E63' },
  beverages:  { label: 'Beverages',   emoji: '🥤', color: '#00BCD4' },
  other:      { label: 'Other',       emoji: '🛒', color: '#95A5A6' },
};

function isExpiringSoon(dateStr) {
  if (!dateStr) return false;
  const diff = (new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= 3;
}

function isExpired(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

export default function Pantry() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanModal, setScanModal] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({ name: '', quantity: '', unit: '', category: 'other', expires_at: '' });
  const fileRef = useRef();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      setAuthToken(token);
      const data = await getPantry();
      setItems(data);
    } catch (err) {
      toast.error('Failed to load pantry');
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => { load(); }, [load]);

  const grouped = Object.entries(CATEGORIES).reduce((acc, [key]) => {
    const cat = items.filter(i => i.category === key);
    if (cat.length > 0) acc[key] = cat;
    return acc;
  }, {});

  const expiringCount = items.filter(i => isExpiringSoon(i.expires_at)).length;

  function openAdd() {
    setForm({ name: '', quantity: '', unit: '', category: 'other', expires_at: '' });
    setEditItem(null);
    setAddModal(true);
  }

  function openEdit(item) {
    setForm({
      name: item.name,
      quantity: item.quantity ?? '',
      unit: item.unit ?? '',
      category: item.category ?? 'other',
      expires_at: item.expires_at ? item.expires_at.split('T')[0] : '',
    });
    setEditItem(item);
    setAddModal(true);
  }

  async function handleSave() {
    if (!form.name.trim()) { toast.error('Enter an item name'); return; }
    try {
      if (editItem) {
        const updated = await updatePantryItem(editItem.id, form);
        setItems(items.map(i => i.id === editItem.id ? updated : i));
        toast.success('Item updated');
      } else {
        const created = await addPantryItem(form);
        setItems([...items, created]);
        toast.success('Added to pantry');
      }
      setAddModal(false);
    } catch (err) {
      toast.error('Failed to save item');
    }
  }

  async function handleDelete(id) {
    try {
      await deletePantryItem(id);
      setItems(items.filter(i => i.id !== id));
      setDeleteConfirm(null);
      toast.success('Removed from pantry');
    } catch {
      toast.error('Failed to remove item');
    }
  }

  async function handleScan(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setScanning(true);
    setScanModal(false);
    try {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const base64 = ev.target.result.split(',')[1];
        const mediaType = file.type;
        const result = await scanPantry(base64, mediaType);
        setItems(prev => {
          const updated = [...prev];
          for (const item of result.items) {
            const idx = updated.findIndex(p => p.id === item.id);
            if (idx >= 0) updated[idx] = item;
            else updated.push(item);
          }
          return updated;
        });
        toast.success(`Found ${result.count} item${result.count !== 1 ? 's' : ''} in photo!`);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      toast.error('Scan failed — try a clearer photo');
    } finally {
      setScanning(false);
    }
  }

  return (
    <div className="app-shell" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Header */}
      <div className="page-pad pt-10 pb-4 flex items-center gap-3">
        <button
          className="w-10 h-10 flex items-center justify-center rounded-xl"
          style={{ border: '1px solid var(--border-mid)', background: 'var(--bg)' }}
          onClick={() => navigate('/dashboard')}
        >
          <ChevronLeft size={20} style={{ color: 'var(--text-mid)' }} />
        </button>
        <div className="flex-1">
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '24px', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
            My Pantry
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--text-light)', margin: 0 }}>
            {items.length} items tracked
            {expiringCount > 0 && <span style={{ color: '#E67E22', marginLeft: '6px' }}>· {expiringCount} expiring soon</span>}
          </p>
        </div>
        <button
          onClick={() => setScanModal(true)}
          className="w-10 h-10 flex items-center justify-center rounded-xl"
          style={{ background: 'var(--accent)', border: 'none', cursor: 'pointer' }}
          title="Scan fridge or pantry"
        >
          <Camera size={18} color="white" />
        </button>
        <button
          onClick={openAdd}
          className="w-10 h-10 flex items-center justify-center rounded-xl"
          style={{ background: 'var(--accent)', border: 'none', cursor: 'pointer' }}
        >
          <Plus size={18} color="white" />
        </button>
      </div>

      {/* Scan prompt banner */}
      {items.length === 0 && !loading && (
        <div className="mx-5 mb-5 p-5 rounded-3xl text-center" style={{ background: 'var(--bg-warm)', border: '1.5px dashed var(--accent)' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📸</div>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 700, color: 'var(--text)', margin: '0 0 6px' }}>
            Scan your pantry or fridge
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-mid)', margin: '0 0 16px' }}>
            Take a photo and we'll detect all the items automatically using AI
          </p>
          <button className="pill-button" onClick={() => setScanModal(true)}>
            <Camera size={16} /> Scan Now
          </button>
        </div>
      )}

      {/* Items grouped by category */}
      <div className="px-5 pb-32">
        {loading ? (
          <div className="text-center py-12" style={{ color: 'var(--text-light)' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔄</div>
            <p style={{ fontSize: '14px' }}>Loading pantry…</p>
          </div>
        ) : (
          Object.entries(grouped).map(([catKey, catItems]) => {
            const cat = CATEGORIES[catKey];
            return (
              <div key={catKey} className="mb-6">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '18px' }}>{cat.emoji}</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-light)' }}>
                    {cat.label}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-light)', marginLeft: 'auto' }}>{catItems.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {catItems.map(item => {
                    const expired = isExpired(item.expires_at);
                    const expiring = isExpiringSoon(item.expires_at);
                    return (
                      <div key={item.id} className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', ...(expired ? { opacity: 0.6 } : {}) }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                          background: `${cat.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '18px',
                        }}>
                          {cat.emoji}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', margin: 0, textDecoration: expired ? 'line-through' : 'none' }}>
                            {item.name}
                          </p>
                          <p style={{ fontSize: '12px', color: 'var(--text-light)', margin: '1px 0 0' }}>
                            {item.quantity != null ? `${item.quantity}${item.unit ? ' ' + item.unit : ''}` : 'Amount not set'}
                            {item.expires_at && (
                              <span style={{ marginLeft: '8px', color: expired ? '#E74C3C' : expiring ? '#E67E22' : 'var(--text-light)' }}>
                                {expired ? '⚠ Expired' : expiring ? `⏰ Expires ${new Date(item.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : `Exp. ${new Date(item.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                              </span>
                            )}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={() => openEdit(item)}
                            style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--bg-soft)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                          >
                            <Edit3 size={13} style={{ color: 'var(--text-mid)' }} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(item.id)}
                            style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--bg-soft)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                          >
                            <Trash2 size={13} style={{ color: '#E74C3C' }} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating add button */}
      <div style={{ position: 'fixed', bottom: '28px', right: '50%', transform: 'translateX(calc(50% - 8px))', maxWidth: '390px', width: '100%', display: 'flex', justifyContent: 'flex-end', padding: '0 20px', pointerEvents: 'none', zIndex: 40 }}>
        <button
          onClick={openAdd}
          style={{ pointerEvents: 'auto', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '9999px', padding: '14px 24px', fontWeight: 600, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 24px rgba(255,107,71,0.4)' }}
        >
          <Plus size={18} /> Add Item
        </button>
      </div>

      {/* Scan modal */}
      {scanModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="card p-6 w-full" style={{ maxWidth: '430px', borderRadius: '24px 24px 0 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                Scan Pantry or Fridge
              </h2>
              <button onClick={() => setScanModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                <X size={20} style={{ color: 'var(--text-mid)' }} />
              </button>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-mid)', marginBottom: '20px', lineHeight: 1.5 }}>
              Take a photo of your open fridge, pantry shelf, or counter. Our AI will detect all the food items and add them to your tracker.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => { fileRef.current.setAttribute('capture', 'environment'); fileRef.current.click(); }}
                className="pill-button flex-1 justify-center"
              >
                <Camera size={16} /> Take Photo
              </button>
              <button
                onClick={() => { fileRef.current.removeAttribute('capture'); fileRef.current.click(); }}
                className="pill-button outline flex-1 justify-center"
              >
                📂 Choose File
              </button>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleScan}
            />
            <p style={{ fontSize: '11px', color: 'var(--text-light)', textAlign: 'center', marginTop: '14px' }}>
              Best results: good lighting, items visible, fridge/pantry open
            </p>
            <div style={{ height: '20px' }} />
          </div>
        </div>
      )}

      {/* Scanning overlay */}
      {scanning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="card p-8 text-center mx-5">
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 700, color: 'var(--text)', margin: '0 0 8px' }}>
              Scanning your photo…
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-mid)', margin: 0 }}>
              AI is identifying all food items
            </p>
          </div>
        </div>
      )}

      {/* Add / Edit modal */}
      {addModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="card p-6 w-full" style={{ maxWidth: '430px', borderRadius: '24px 24px 0 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                {editItem ? 'Edit Item' : 'Add Item'}
              </h2>
              <button onClick={() => setAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} style={{ color: 'var(--text-mid)' }} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                placeholder="Item name (e.g. chicken breast)"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-soft)', fontSize: '15px', color: 'var(--text)', boxSizing: 'border-box' }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <input
                  type="number"
                  placeholder="Quantity"
                  value={form.quantity}
                  onChange={e => setForm({ ...form, quantity: e.target.value })}
                  style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-soft)', fontSize: '15px', color: 'var(--text)' }}
                />
                <input
                  type="text"
                  placeholder="Unit (lbs, oz, count…)"
                  value={form.unit}
                  onChange={e => setForm({ ...form, unit: e.target.value })}
                  style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-soft)', fontSize: '15px', color: 'var(--text)' }}
                />
              </div>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-soft)', fontSize: '15px', color: 'var(--text)', appearance: 'none' }}
              >
                {Object.entries(CATEGORIES).map(([k, v]) => (
                  <option key={k} value={k}>{v.emoji} {v.label}</option>
                ))}
              </select>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-light)', display: 'block', marginBottom: '6px' }}>Expiry date (optional)</label>
                <input
                  type="date"
                  value={form.expires_at}
                  onChange={e => setForm({ ...form, expires_at: e.target.value })}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-soft)', fontSize: '15px', color: 'var(--text)', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button className="pill-button outline flex-1 justify-center" onClick={() => setAddModal(false)}>
                Cancel
              </button>
              <button className="pill-button flex-1 justify-center" onClick={handleSave}>
                <Check size={16} /> {editItem ? 'Save Changes' : 'Add to Pantry'}
              </button>
            </div>
            <div style={{ height: '20px' }} />
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="card p-6 mx-5 max-w-sm text-center">
            <p style={{ fontWeight: 600, fontSize: '16px', color: 'var(--text)', marginBottom: '8px' }}>Remove item?</p>
            <p style={{ fontSize: '13px', color: 'var(--text-mid)', marginBottom: '20px' }}>This will remove it from your pantry tracker.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="pill-button outline flex-1" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="pill-button flex-1" style={{ background: '#E74C3C' }} onClick={() => handleDelete(deleteConfirm)}>Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
