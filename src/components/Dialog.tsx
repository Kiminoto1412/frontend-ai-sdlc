"use client";

import { useRef, type ReactNode } from "react";
import { X } from "lucide-react";

export type DialogHandle = {
  open: () => void;
  close: () => void;
};

export default function Dialog({
  trigger,
  title,
  children,
  footer,
}: {
  trigger: ReactNode;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  return (
    <>
      <span className="contents" onClick={() => ref.current?.showModal()}>
        {trigger}
      </span>

      <dialog
        ref={ref}
        onClick={(e) => {
          if (e.target === ref.current) ref.current?.close();
        }}
        className="m-auto w-full max-w-md rounded-lg p-0 shadow-xl backdrop:bg-black/40"
      >
        <div className="flex items-center justify-between border-b border-zinc-100 p-4">
          <h3 className="text-lg font-bold text-foreground">{title}</h3>
          <button
            type="button"
            aria-label="Close"
            onClick={() => ref.current?.close()}
            className="text-zinc-400 hover:text-brand"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 text-sm text-zinc-600">{children}</div>

        {footer && (
          <div className="flex justify-end gap-3 border-t border-zinc-100 p-4">
            {footer}
          </div>
        )}
      </dialog>
    </>
  );
}
