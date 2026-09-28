import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = '520px' }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ maxWidth }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '1.5rem',
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{title}</h2>
          <button onClick={onClose} style={{
            background: 'var(--bg-input)', border: 'none', borderRadius: '8px',
            padding: '6px', cursor: 'pointer', color: 'var(--text-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
