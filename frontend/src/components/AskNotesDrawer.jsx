import { useEffect, useRef } from "react";

export default function AskNotesDrawer({ open, onClose, children }) {
  const drawerRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    previousFocusRef.current = document.activeElement;
    drawerRef.current?.querySelector("[data-ask-drawer-close]")?.focus();

    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
      previousFocusRef.current?.focus?.();
    };
  }, [open, onClose]);

  return (
    <div className={`fixed inset-0 z-[60] transition-[visibility] duration-300 ${open ? "visible" : "invisible pointer-events-none"}`}>
      <button
        type="button"
        aria-label="Close Ask Your Notes"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
        className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
      />
      <aside
        ref={drawerRef}
        role="dialog"
        aria-modal={open}
        aria-label="Ask Your Notes"
        aria-hidden={!open}
        inert={!open ? "" : undefined}
        className={`absolute inset-y-0 right-0 w-full max-w-[520px] bg-white shadow-2xl transition-transform duration-300 ease-in-out sm:w-[min(92vw,520px)] ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {children}
      </aside>
    </div>
  );
}
