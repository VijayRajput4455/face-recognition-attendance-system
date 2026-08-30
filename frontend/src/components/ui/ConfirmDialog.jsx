import React, { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import Modal from './Modal';
import { cn } from '../../lib/utils';

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description = 'This action cannot be undone. Please confirm to proceed.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  danger = false,
  requireVerificationText,
  isLoading = false,
}) {
  const [typedVerification, setTypedVerification] = useState('');

  const isConfirmedDisabled = requireVerificationText
    ? typedVerification !== requireVerificationText || isLoading
    : isLoading;

  const handleClose = () => {
    setTypedVerification('');
    onClose();
  };

  const handleConfirm = async () => {
    await onConfirm();
    setTypedVerification('');
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="sm">
      <div className="flex flex-col items-center text-center">
        <div
          className={cn(
            'w-12 h-12 rounded-2xl flex items-center justify-center mb-4',
            danger ? 'bg-rose-100 text-rose-600 border border-rose-200' : 'bg-amber-100 text-amber-600 border border-amber-200'
          )}
        >
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
        <p className="text-xs text-slate-500 mb-5 leading-relaxed">{description}</p>

        {requireVerificationText && (
          <div className="w-full mb-5 text-left bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Type <span className="font-mono font-bold text-rose-600">{requireVerificationText}</span> to confirm:
            </label>
            <input
              type="text"
              value={typedVerification}
              onChange={(e) => setTypedVerification(e.target.value)}
              placeholder={requireVerificationText}
              className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-3 w-full">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isConfirmedDisabled}
            className={cn(
              'flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-xs transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
              danger ? 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800' : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800'
            )}
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
