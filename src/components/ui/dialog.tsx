"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

type DialogProps = {
  open: boolean;
  title: string;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
};

export function Dialog({
  open,
  title,
  onOpenChange,
  children,
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      aria-label={title}
      className="ui-dialog"
      onCancel={() => onOpenChange(false)}
      onClose={() => onOpenChange(false)}
      ref={dialogRef}
    >
      <div className="ui-dialog-content">
        <h2>{title}</h2>
        {children}
      </div>
    </dialog>
  );
}
