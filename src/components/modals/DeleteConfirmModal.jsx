import { useState } from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';

/**
 * DeleteConfirmModal
 * Props:
 *   title       - e.g. "Delete Renter"
 *   description - what will be deleted / consequences
 *   onClose     - called when dismissed
 *   onConfirm   - called when user types DELETE and confirms
 */
export default function DeleteConfirmModal({ title, description, onClose, onConfirm }) {
  const [typed, setTyped] = useState('');
  const isMatch = typed === 'DELETE';

  const handleConfirm = () => {
    if (!isMatch) return;
    onConfirm();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-sm animate-slide-up delete-modal">

        {/* Close */}
        <button className="modal-close" style={{ marginLeft: 'auto', display: 'flex' }} onClick={onClose}>
          <X size={16} />
        </button>

        {/* Danger Icon */}
        <div className="delete-modal-icon">
          <Trash2 size={28} />
        </div>

        {/* Title */}
        <div className="delete-modal-title">{title}</div>
        <div className="delete-modal-desc">{description}</div>

        {/* Warning */}
        <div className="delete-modal-warning">
          <AlertTriangle size={14} />
          <span>This action <strong>cannot be undone</strong>.</span>
        </div>

        {/* Type to confirm */}
        <div className="delete-modal-confirm-section">
          <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
            Type <span className="delete-keyword">DELETE</span> to confirm
          </label>
          <input
            className="form-input delete-confirm-input"
            placeholder="Type DELETE here"
            value={typed}
            onChange={e => setTyped(e.target.value)}
            autoFocus
            style={{ borderColor: isMatch ? 'var(--accent-danger)' : undefined }}
          />
        </div>

        {/* Actions */}
        <div className="modal-footer" style={{ marginTop: '20px' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-danger-solid"
            disabled={!isMatch}
            onClick={handleConfirm}
            style={{ opacity: isMatch ? 1 : 0.4, cursor: isMatch ? 'pointer' : 'not-allowed' }}
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}
