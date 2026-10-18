import { ArrowLeft, ArrowUpRight, BookOpenText, Compass } from "lucide-react";
import { Link, useNavigate } from "react-router";

export default function PageNoteFound() {
  const navigate = useNavigate();

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[#fafaf9] text-stone-900">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(231,229,228,0.5),transparent_34rem)]"
      />

      <header className="relative z-10 flex h-20 items-center justify-between px-5 sm:px-10">
        <Link to="/" className="inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400">
          <span className="grid size-9 place-items-center rounded-xl bg-stone-900 text-white shadow-sm">
            <BookOpenText size={18} strokeWidth={1.8} />
          </span>
          <span className="text-sm font-semibold tracking-tight">Notes workspace</span>
        </Link>
        <span className="hidden text-xs font-medium text-stone-400 sm:block">
          Your ideas, all in one place
        </span>
      </header>

      <section className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-5 pb-20 pt-8 text-center">
        <div className="relative mb-8 grid size-40 place-items-center sm:size-48">
          <div className="absolute inset-2 rounded-[2.5rem] border border-stone-200/80 bg-white/70 shadow-[0_18px_60px_-32px_rgba(28,25,23,0.25)] rotate-[-7deg]" />
          <div className="absolute inset-5 rounded-[2rem] border border-stone-200 bg-[#f5f5f4] rotate-[5deg]" />
          <div className="relative grid size-20 place-items-center rounded-[1.6rem] border border-stone-200 bg-white text-stone-500 shadow-sm sm:size-24">
            <Compass size={37} strokeWidth={1.35} />
            <span className="absolute -right-2 -top-2 grid size-8 place-items-center rounded-full border-4 border-[#fafaf9] bg-amber-100 text-[10px] font-bold tracking-wide text-amber-800">
              ?
            </span>
          </div>
          <span className="absolute -bottom-1 rounded-full border border-stone-200 bg-white px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-stone-500 shadow-sm">
            ERROR 404
          </span>
        </div>

        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
          Looks like a wrong turn
        </p>
        <h1 className="max-w-xl text-3xl font-semibold leading-tight tracking-[-0.045em] sm:text-5xl">
          This page isn’t in your notes.
        </h1>
        <p className="mt-4 max-w-md text-sm leading-6 text-stone-500 sm:text-base">
          The link may be outdated, or the page may have moved. Let’s get you back to your workspace.
        </p>

        <div className="mt-8 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
          <Link
            to="/"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-stone-900 px-5 text-sm font-medium text-white shadow-sm transition hover:bg-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2"
          >
            <BookOpenText size={16} /> Back to my notes
            <ArrowUpRight size={15} className="ml-1 text-stone-400" />
          </Link>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-5 text-sm font-medium text-stone-700 transition hover:border-stone-300 hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2"
          >
            <ArrowLeft size={16} /> Go back
          </button>
        </div>
      </section>

      <footer className="relative z-10 px-5 pb-6 text-center text-xs text-stone-400">
        Need a hand? Your workspace is just one click away.
      </footer>
    </main>
  );
}
