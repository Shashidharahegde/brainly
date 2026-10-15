import { useCallback, useState } from "react";
import { Outlet } from "react-router";
import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Sidebar from "../components/Sidebar";

export default function WorkspaceLayout() {
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <div className="flex min-h-screen w-full bg-base-100">
      <Sidebar
        desktopOpen={desktopOpen}
        mobileOpen={mobileOpen}
        onMobileClose={closeMobile}
      />

      {/* min-w-0 lets the existing notes grid shrink correctly as the sidebar opens. */}
      <div className=" flex min-w-0 flex-1 flex-col">
        <div className=" flex h-14 shrink-0 items-center gap-3 border-b border-base-300 px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            className="btn btn-ghost btn-square btn-sm hidden md:inline-flex"
            aria-label={desktopOpen ? "Collapse sidebar" : "Expand sidebar"}
            aria-expanded={desktopOpen}
            onClick={() => setDesktopOpen((open) => !open)}
          >
            {desktopOpen ? (
              <PanelLeftClose size={20} />
            ) : (
              <PanelLeftOpen size={20} />
            )}
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-square btn-sm md:hidden"
            aria-label="Open sidebar"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={20} />
          </button>
          <span className="text-sm font-medium text-base-content/65">
            Workspace
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
