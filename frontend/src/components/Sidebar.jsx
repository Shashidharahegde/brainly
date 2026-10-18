import { useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router";
import { BookOpenText, MessageSquareText, X } from "lucide-react";

const links = [
  {
    to: "/",
    end: true,
    label: "Notes & Ideas",
    description: "Everything you've saved",
    icon: BookOpenText,
  },
  {
    to: "/ask",
    label: "Ask Your Notes",
    description: "Explore your thoughts",
    icon: MessageSquareText,
  },
];

function SidebarContent({ onNavigate, onAskOpen }) {
  const navigate = useNavigate();
  const clickTimer = useRef(null);

  useEffect(() => () => clearTimeout(clickTimer.current), []);

  return (
    <nav className="space-y-2 px-3 py-5" aria-label="Main navigation">
      {links.map(({ to, end, label, description, icon: Icon }) => (
        {to === "/ask" ? (
          <button
          key={to}
          type="button"
          onClick={(event) => {
            if (event.detail > 1) {
              clearTimeout(clickTimer.current);
              navigate("/ask");
              onNavigate?.();
              return;
            }
            clearTimeout(clickTimer.current);
            clickTimer.current = setTimeout(() => {
              onAskOpen?.();
              onNavigate?.();
            }, 220);
          }}
          onDoubleClick={() => {
            clearTimeout(clickTimer.current);
            navigate("/ask");
            onNavigate?.();
          }}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors duration-150 text-base-content/65 hover:bg-base-200/70 hover:text-base-content`}
        >
          <Icon size={20} className="shrink-0" aria-hidden="true" />
          <span className="min-w-0">
            <span className="block truncate text-sm">{label}</span>
            <span className="block truncate text-xs font-normal text-base-content/50">{description}</span>
          </span>
        </button>
        ) : <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-3 transition-colors duration-150 ${
              isActive
                ? "bg-base-200 font-semibold text-base-content"
                : "text-base-content/65 hover:bg-base-200/70 hover:text-base-content"
            }`
          }
        >
          <Icon size={20} className="shrink-0" aria-hidden="true" />
          <span className="min-w-0">
            <span className="block truncate text-sm">{label}</span>
            <span className="block truncate text-xs font-normal text-base-content/50">
              {description}
            </span>
          </span>
        </NavLink>}
      ))}
    </nav>
  );
}

export default function Sidebar({ desktopOpen, mobileOpen, onMobileClose, onAskOpen }) {
  useEffect(() => {
    if (!mobileOpen) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") onMobileClose();
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [mobileOpen, onMobileClose]);

  return (
    <>
      {/* Desktop sidebar takes up layout width, pushing the page content right. */}
      <aside
        aria-label="Sidebar"
        aria-hidden={!desktopOpen}
        inert={!desktopOpen ? "" : undefined}
        className={` sticky top-0
    h-screen
    shrink-0
    overflow-y-auto
    bg-base-100
    border-r border-base-300
  "hidden shrink-0 overflow-hidden border-r border-base-300 bg-base-100 transition-[width] duration-300 ease-in-out md:block ${
    desktopOpen ? "w-64" : "w-0 border-r-0"
  }`}
      >
        <div className="sticky top-0 h-screen w-64 overflow-y-auto">
          <div className="flex h-16 items-center border-b border-base-300 px-6">
            <span className="text-lg font-bold tracking-tight">Workspace</span>
          </div>
          <SidebarContent onAskOpen={onAskOpen} />
        </div>
      </aside>
      

      {/* On narrow screens, the sidebar slides over the page. */}
      <div
        className={`fixed inset-0 z-50 transition-[visibility] duration-300 md:hidden ${
          mobileOpen ? "visible" : "pointer-events-none invisible"
        }`}
      >
        <button
          type="button"
          aria-label="Close navigation"
          tabIndex={mobileOpen ? 0 : -1}
          onClick={onMobileClose}
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <aside
          role="dialog"
          aria-modal={mobileOpen}
          aria-label="Sidebar navigation"
          aria-hidden={!mobileOpen}
          inert={!mobileOpen ? "" : undefined}
          className={`relative flex h-full w-72 max-w-[85vw] flex-col border-r border-base-300 bg-base-100 shadow-xl transition-transform duration-300 ease-in-out ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-16 items-center justify-between border-b border-base-300 px-5">
            <span className="text-lg font-bold tracking-tight">Workspace</span>
            <button
              type="button"
              className="btn btn-ghost btn-square btn-sm"
              aria-label="Close sidebar"
              onClick={onMobileClose}
            >
              <X size={20} />
            </button>
          </div>
          <SidebarContent onNavigate={onMobileClose} onAskOpen={onAskOpen} />
        </aside>
      </div>
    </>
  );
}
