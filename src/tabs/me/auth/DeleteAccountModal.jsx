import React, { useState } from 'react';
import { useMeTheme } from '../meTheme';
import { useMeText } from '../meTexts';
import ConfirmDialog from '../ui/ConfirmDialog';
import { deleteMyAccount, getLoginMethods, authErrorMessage } from './authService';

// "Account delete karo" ka pop-up. Password wale user se password, Google wale user se Google se dobara confirm karwata hai.
export default function DeleteAccountModal({ user, onClose, onDeleted }) {
  const th = useMeTheme();
  const tx = useMeText();

  const needsPassword = getLoginMethods(user).includes('password');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (busy) return;
    if (needsPassword && !password) {
      setError(tx('errPasswordNeeded'));
      return;
    }
    setBusy(true);
    setError('');
    try {
      await deleteMyAccount({ password });
      onDeleted();
    } catch (err) {
      setError(tx('meDeleteFail') + authErrorMessage(err, tx));
      setBusy(false);
    }
  };

  return (
    <ConfirmDialog
      title={tx('meDeleteTitle')}
      message={tx('meDeleteWarn2')}
      confirmLabel={busy ? tx('meDeleting') : tx('meDeleteBtn')}
      cancelLabel={tx('meCancel')}
      danger
      busy={busy}
      onConfirm={handleDelete}
      onCancel={onClose}
    >
      <p style={{ fontSize: '12px', fontWeight: 800, color: th.label, marginTop: '12px', lineHeight: 1.5 }}>
        {needsPassword ? tx('meDeleteWarnPassword') : tx('meDeleteWarnGoogle')}
      </p>

      {needsPassword && (
        <input
          type="password"
          className="me-field"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(''); }}
          placeholder={tx('mePasswordPh')}
          autoComplete="current-password"
          style={{ ...th.field, width: '100%', boxSizing: 'border-box', padding: '13px 16px', borderRadius: '16px', outline: 'none', fontSize: '14px', fontWeight: 800, marginTop: '8px' }}
        />
      )}

      {error && (
        <div role="alert" style={{ ...th.dangerBtn, cursor: 'default', borderRadius: '14px', padding: '10px 12px', fontSize: '12px', fontWeight: 800, lineHeight: 1.45, marginTop: '10px' }}>
          {error}
        </div>
      )}
    </ConfirmDialog>
  );
}
