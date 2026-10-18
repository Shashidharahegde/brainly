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
    <aside
      ref={drawerRef}
      aria-label="Ask Your Notes"
      aria-hidden={!open}
      inert={!open ? "" : undefined}
      style={{ width: open ? "min(92vw, 520px)" : "0px" }}
      className={`sticky top-0 h-[calc(100dvh-3.5rem)] min-w-0 shrink-0 overflow-hidden border-l bg-white transition-[width] duration-300 ease-in-out ${open ? "border-stone-200" : "border-transparent"}`}
    >
      <div className="h-full w-[min(92vw,520px)] max-w-[520px]">
        {children}
      </div>
    </aside>
  );
}
