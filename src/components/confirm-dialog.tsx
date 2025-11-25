"use client";

import React, { useState } from "react";

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
}: {
  // accept either an element (preferred) or arbitrary node
  trigger: React.ReactElement | React.ReactNode;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => Promise<void> | void;
}) {
  const [open, setOpen] = useState(false);
  const handleOpen = (e?: React.SyntheticEvent) => {
    e?.stopPropagation();
    setOpen(true);
  };
  const handleClose = (e?: React.SyntheticEvent) => {
    e?.stopPropagation();
    setOpen(false);
  };

  async function handleConfirm(e?: React.SyntheticEvent) {
    e?.stopPropagation();
    try {
      await onConfirm();
    } finally {
      setOpen(false);
    }
  }

  // wrap trigger so clicking it opens dialog
  // narrow the element props to include an optional onClick without using `any`
  type ElementWithOnClick = {
    onClick?: (e: React.SyntheticEvent) => void;
    [key: string]: unknown;
  };

  const TriggerEl = React.isValidElement(trigger)
    ? // cast to ReactElement with a safe prop shape that includes onClick
      React.cloneElement(trigger as React.ReactElement<ElementWithOnClick>, {
        onClick: (e: React.SyntheticEvent) => {
          // call original handler if present
          const orig = (trigger as React.ReactElement<ElementWithOnClick>).props.onClick;
          if (typeof orig === "function") orig(e);
          handleOpen(e);
        },
      })
    : (
      <button onClick={handleOpen}>{trigger}</button>
    );

  return (
    <>
      {TriggerEl}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <div
            className="bg-white rounded shadow-lg max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b">
              <h3 className="text-lg font-medium">{title ?? "Confirm"}</h3>
              {description && (
                <p className="text-sm text-slate-600 mt-2">{description}</p>
              )}
            </div>
            <div className="p-4 flex gap-2 justify-end">
              <button
                onClick={handleClose}
                className="px-3 py-2 rounded border"
              >
                {cancelText}
              </button>
              <button
                onClick={handleConfirm}
                className="px-3 py-2 rounded bg-rose-600 text-white"
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
