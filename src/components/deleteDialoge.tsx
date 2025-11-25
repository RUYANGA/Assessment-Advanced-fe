import React from "react"
import { Trash2 } from "lucide-react"
import { ConfirmDialog } from "./confirm-dialog"

export function DeleteButton({
  handleDelete,
  disabled,
  title,
  description,
  buttonLabel = "Delete",
}: {
  handleDelete: () => Promise<void> | void
  disabled?: boolean
  title?: string
  description?: string
  buttonLabel?: string
}) {
  const baseClass = "flex items-center gap-2 px-3 py-2 text-sm text-rose-600 hover:bg-slate-50"
  const disabledClass = disabled ? "opacity-50 pointer-events-none" : ""
  return (
    <ConfirmDialog
      trigger={
        <div
          role="button"
          tabIndex={0}
          className={`${baseClass} ${disabledClass}`}
          aria-disabled={disabled ?? false}
        >
          <Trash2 className="w-4 h-4 text-rose-600" />
          <span>{buttonLabel}</span>
        </div>
      }
      title={title ?? "Delete item"}
      description={description ?? "This action cannot be undone."}
      confirmText="Delete"
      cancelText="Cancel"
      onConfirm={handleDelete}
    />
  )
}
