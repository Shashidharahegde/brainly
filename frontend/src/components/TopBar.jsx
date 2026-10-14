import { useEffect, useRef, useState } from "react";
import { Plus, Search } from "lucide-react";

function getFirstName(user) {
  const name =
    user?.firstName ||
    user?.displayName ||
    user?.name ||
    user?.fullName ||
    "";

  return typeof name === "string" ? name.trim().split(/\s+/)[0] : "";
}

function getGreeting(hour) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// Pass `user` from your authentication provider when it is available.
export default function TopBar({ user = null, value = "", onChange, onNewNote }) {
  const [hour, setHour] = useState(() => new Date().getHours());
  const [visible, setVisible] = useState(false);
  const searchRef = useRef(null);
  const firstName = getFirstName(user);

  useEffect(() => {
    const animationFrame = requestAnimationFrame(() => setVisible(true));
    const interval = setInterval(() => setHour(new Date().getHours()), 60_000);

    return () => {
      cancelAnimationFrame(animationFrame);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    function handleShortcut(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      } else if (event.key === "Escape" && document.activeElement === searchRef.current) {
        searchRef.current.blur();
      }
    }

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  return (
    <header className="relative isolate overflow-hidden border-b border-base-300/40 bg-gradient-to-br from-[#fbfaf8] via-[#f7f5f3] to-[#efece9]">
      {/* Decorative hills and botanical illustration, styled entirely with Tailwind. */}
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 right-[8%] h-44 w-96 rounded-[50%] bg-stone-300/15 blur-2xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -right-16 h-48 w-96 rounded-[50%] bg-stone-400/10 blur-xl" />

      <svg
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-2 right-[7%] hidden h-28 w-20 origin-bottom opacity-50 motion-safe:animate-pulse sm:block lg:right-[12%]"
        viewBox="0 0 90 130"
        fill="none"
      >
        <path d="M36 128C43 100 48 79 58 56C66 37 68 19 69 6" stroke="#89877f" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M54 66C42 56 31 52 20 47M50 79C65 69 71 59 78 48M43 98C33 87 23 84 12 81M62 44C52 33 48 23 47 12" stroke="#89877f" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M68 29C79 26 85 15 82 5C72 8 67 15 68 29Z" fill="#99968e" />
        <path d="M59 52C69 48 77 39 78 29C66 30 59 39 59 52Z" fill="#89877f" />
        <path d="M20 47C21 35 15 27 4 22C3 35 10 44 20 47Z" fill="#a29e97" />
        <path d="M78 48C87 54 88 65 85 76C75 69 73 59 78 48Z" fill="#b1aca3" />
        <path d="M12 81C9 70 3 65 0 64C-1 75 2 82 12 81Z" fill="#9d9a92" />
        <path d="M47 12C36 11 30 17 28 29C40 29 47 23 47 12Z" fill="#9b978f" />
        <path d="M45 96C53 88 62 87 69 89C64 100 55 103 45 96Z" fill="#a6a197" />
      </svg>

      <div
        className={`relative z-10 mx-auto max-w-7xl px-4 pb-5 pt-5 motion-safe:transition-[opacity,transform] motion-safe:duration-500 motion-safe:ease-out sm:px-6 sm:pb-6 sm:pt-6 lg:px-8 ${
          visible
            ? "motion-safe:translate-y-0 motion-safe:opacity-100"
            : "motion-safe:translate-y-2 motion-safe:opacity-0"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
              {getGreeting(hour)}{firstName ? `, ${firstName}` : ""} <span aria-hidden="true">👋</span>
            </h1>
            <p className="mt-1 text-sm text-slate-500">Continue where you left off.</p>
          </div>

          <button
            type="button"
            onClick={onNewNote}
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-slate-800 px-4 py-2 text-xs font-medium text-white shadow-sm motion-safe:transition-all motion-safe:duration-200 motion-safe:hover:-translate-y-0.5 hover:bg-slate-700 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-800 sm:px-5 sm:text-sm"
          >
            <Plus size={16} strokeWidth={1.8} />
            New Note
          </button>
        </div>

        <div className="mt-5 max-w-2xl sm:mt-6">
          <label className="flex h-11 items-center gap-3 rounded-full border border-stone-200/80 bg-white/80 px-4 text-slate-500 shadow-[0_2px_12px_rgba(15,23,42,0.04)] backdrop-blur-sm transition-all duration-200 focus-within:border-slate-400 focus-within:bg-white focus-within:shadow-[0_4px_20px_rgba(15,23,42,0.08)] sm:h-12">
            <Search size={17} strokeWidth={1.8} aria-hidden="true" />
            <input
              ref={searchRef}
              type="search"
              value={value}
              onChange={(event) => onChange?.(event.target.value)}
              placeholder="Search your notes..."
              aria-label="Search your notes"
              className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />
            <kbd className="hidden shrink-0 rounded-md bg-stone-100 px-2 py-1 font-sans text-[11px] text-slate-400 sm:inline-flex">
              ⌘ K
            </kbd>
          </label>
        </div>
      </div>
    </header>
  );
}