"use client";
import React from 'react';

export default function ConfirmModal({
  open,
  title,
  description,
  onConfirm,
  onCancel,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isLoading = false,
  variant = "danger", // 'danger' | 'primary' | 'default'
  typeToConfirmText = "",
  confirmInput = "",
  onConfirmInputChange,
  children,
}) {
  if (!open) return null;

  const confirmDisabled = (
    isLoading ||
    (typeToConfirmText && confirmInput !== typeToConfirmText)
  );

  const confirmBtnClasses = variant === 'danger'
    ? 'bg-red-600 text-white hover:bg-red-700'
    : variant === 'primary'
      ? 'bg-primarycolor text-white hover:bg-primarycolor/90'
      : 'bg-gray-800 text-white hover:bg-gray-900';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-5 space-y-4">
        {title && (
          <h3 className="text-base font-semibold text-primarycolor">{title}</h3>
        )}
        {description && (
          <p className="text-sm text-primarycolor/80">{description}</p>
        )}

        {typeToConfirmText ? (
          <div className="space-y-2">
            <div className="text-xs text-primarycolor/70">Type to confirm:</div>
            <input
              value={confirmInput}
              onChange={(e) => onConfirmInputChange?.(e.target.value)}
              placeholder={typeToConfirmText}
              className="w-full px-3 py-2 border border-gray-200 rounded"
            />
          </div>
        ) : null}

        {children}

        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-3 py-2 border rounded">{cancelLabel}</button>
          <button
            onClick={onConfirm}
            disabled={confirmDisabled}
            className={`px-3 py-2 rounded disabled:opacity-50 ${confirmBtnClasses}`}
          >
            {isLoading ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
