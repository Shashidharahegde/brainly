import { useCallback, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { logout } from "@/utils/logout";
import AskPage from "../pages/AskPage";

export default function WorkspaceLayout() {
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAskOpen, setIsAskOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isAskPage = location.pathname === "/ask";
  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const closeAsk = useCallback(() => setIsAskOpen(false), []);
  const expandAsk = useCallback(() => navigate("/ask"), [navigate]);

  const closeFullAsk = useCallback(() => {
    if (!isAskPage) setIsAskOpen(false);
    navigate("/");
  }, [isAskPage]);

  return (
    <div className="flex min-h-screen w-full bg-base-100">
    <div className="flex min-w-0 flex-1">
      <Sidebar
        desktopOpen={desktopOpen}
        mobileOpen={mobileOpen}
        onMobileClose={closeMobile}
        onAskOpen={() => setIsAskOpen(true)}
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

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-base-content/65">
              Workspace
            </span>

            <button
              type="button"
              className="btn btn-error btn-sm"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </div>

        <div className="flex min-h-[calc(100dvh-3.5rem)] min-w-0 flex-1">
          <div className={`min-w-0 flex-1 ${isAskPage ? "hidden" : ""}`}>
            <Outlet />
          </div>
          <AskPage
            fullPage={isAskPage}
            drawerOpen={isAskOpen && !isAskPage}
            onClose={isAskPage ? closeFullAsk : closeAsk}
            onExpand={expandAsk}
          />
        </div>
      </div>
    </div>
    </div>
  );
}
