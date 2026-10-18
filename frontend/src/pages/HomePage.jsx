import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Check, CheckCheck, Plus, Trash2, X } from "lucide-react";

import NoteCard from "./NoteCard";
import CreatePageModal from "./CreatePageModal";
import TopBar from "../components/TopBar";
import ConfirmDialog from "../components/Confirmation";
import api from "../lib/api";

function matchesSearch(note, query) {
  const textFromBlocks = Array.isArray(note.blocks)
    ? note.blocks
        .map((block) => block.text || block.url || "")
        .join(" ")
    : "";

  const searchable = [
    note.title,
    note.content,
    textFromBlocks,
    ...(Array.isArray(note.tags) ? note.tags : []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return searchable.includes(query);
}

// `user` can be supplied by your auth provider later, without changing TopBar.
export default function HomePage({ user = null }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [isCreatingNote, setIsCreatingNote] = useState(false);

  const [search, setSearch] = useState("");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  useEffect(() => {
    const controller = new AbortController();

    async function fetchNotes() {
      setLoading(true);
      setLoadError(null);

      try {
        const { data } = await api.get("/notes", {
          signal: controller.signal,
        });
        if (!controller.signal.aborted) {
          // Accept common API response envelopes without creating blank cards.
          const incoming = Array.isArray(data)
            ? data
            : Array.isArray(data?.notes)
              ? data.notes
              : Array.isArray(data?.data?.notes)
                ? data.data.notes
                : null;

          if (!incoming) {
            throw new Error("Unexpected notes response: expected an array of notes");
          }

          setNotes(incoming.filter((item) => item && item._id));
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("Unable to fetch notes:", error);
        setLoadError(error.response?.status === 429 ? "rate-limit" : "error");
        if (error.response?.status !== 429) {
          toast.error("Unable to load your notes.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    fetchNotes();
    return () => controller.abort();
  }, [reloadKey]);

  const hasProcessingNotes = notes.some((note) =>
    ["pending", "processing"].includes(note.processingStatus),
  );

  useEffect(() => {
    if (!hasProcessingNotes) return;

    const timer = window.setInterval(async () => {
      try {
        const { data } = await api.get("/notes");
        const incoming = Array.isArray(data)
          ? data
          : Array.isArray(data?.notes)
            ? data.notes
            : Array.isArray(data?.data?.notes)
              ? data.data.notes
              : null;

        if (incoming) setNotes(incoming.filter((item) => item && item._id));
      } catch (error) {
        console.error("Unable to refresh note processing status:", error);
      }
    }, 1500);

    return () => window.clearInterval(timer);
  }, [hasProcessingNotes]);

  const filteredNotes = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query ? notes.filter((note) => matchesSearch(note, query)) : notes;
  }, [notes, search]);

  const allVisibleSelected =
    filteredNotes.length > 0 &&
    filteredNotes.every((note) => selectedIds.has(note._id));

  function exitSelection() {
    setSelectedIds(new Set());
    setSelectionMode(false);
  }

  function toggleSelect(id) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelectedIds((current) => {
      const next = new Set(current);
      for (const note of filteredNotes) {
        if (allVisibleSelected) next.delete(note._id);
        else next.add(note._id);
      }
      return next;
    });
  }

  function handleSearchChange(value) {
    setSearch(value);
    // Avoid holding selected notes that are hidden by a new search.
    setSelectedIds(new Set());
  }

  function handleNoteCreated(newNote) {
    // Some controllers return { note: createdNote } instead of a note directly.
    const created = newNote?.note ?? newNote?.data?.note ?? newNote;
    if (!created?._id || (!Array.isArray(created.blocks) && !created.content && !created.media)) {
      // Fetch canonical record instead of rendering an empty note preview.
      setReloadKey((value) => value + 1);
      return;
    }

    setNotes((current) => [created, ...current.filter((item) => item._id !== created._id)]);
  }

  function handleNoteDeleted(deletedNote) {
    const id = typeof deletedNote === "string" ? deletedNote : deletedNote?._id;
    if (!id) return;
    setNotes((current) => current.filter((note) => note._id !== id));
    setSelectedIds((current) => {
      const next = new Set(current);
      next.delete(id);
      return next;
    });
  }

  async function handleBulkDelete() {
    if (deleting || selectedIds.size === 0) return;

    const ids = [...selectedIds];
    setDeleting(true);

    try {
      // Backend contract: DELETE /api/notes/bulk with JSON { ids: [...] }.
      // Only return 2xx if the requested deletion succeeded.
      const { data } = await api.delete("/notes/bulk", {
        data: { ids },
      });

      // Optional backend response: { deletedIds: [...] } for partial successes.
      const deletedIds = Array.isArray(data?.deletedIds)
        ? data.deletedIds.map(String).filter((id) => ids.includes(id))
        : ids;

      const deletedSet = new Set(deletedIds);
      setNotes((current) => current.filter((note) => !deletedSet.has(note._id)));
      setSelectedIds((current) => {
        const next = new Set(current);
        deletedIds.forEach((id) => next.delete(id));
        return next;
      });

      setShowBulkDelete(false);
      if (deletedIds.length === ids.length) {
        exitSelection();
        toast.success(`${ids.length} note${ids.length === 1 ? "" : "s"} deleted`);
      } else {
        toast(`${deletedIds.length} of ${ids.length} notes deleted. Retry the remaining selection.`);
      }
    } catch (error) {
      console.error("Unable to delete selected notes:", error);
      toast.error(error.response?.data?.message || "Couldn't delete selected notes.");
      // Keep selection intact so the user can retry.
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="min-h-screen bg-base-100">
      <TopBar
        user={user}
        value={search}
        onChange={handleSearchChange}
        onNewNote={() => setIsCreatingNote(true)}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Recent Notes</h2>
            <p className="mt-1 text-sm text-base-content/50">
              {search.trim()
                ? `${filteredNotes.length} matching note${filteredNotes.length === 1 ? "" : "s"}`
                : "Everything you've saved recently."}
            </p>
          </div>

          {!loading && !loadError && notes.length > 0 && !selectionMode && (
            <button
              type="button"
              onClick={() => setSelectionMode(true)}
              className="btn btn-ghost btn-sm rounded-full border border-base-300 px-4 transition-all duration-200 hover:-translate-y-0.5"
            >
              <CheckCheck size={16} /> Select
            </button>
          )}
        </div>

        {selectionMode && (
          <div className="sticky top-3 z-20 mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-base-300 bg-base-100/95 p-3 shadow-sm backdrop-blur-md sm:px-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={exitSelection}
                disabled={deleting}
                className="btn btn-ghost btn-sm rounded-full"
              >
                <X size={16} /> Cancel
              </button>
              <span className="text-sm font-medium text-base-content/70">
                {selectedIds.size} selected
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleSelectAll}
                disabled={deleting || filteredNotes.length === 0}
                className="btn btn-ghost btn-sm rounded-full"
              >
                <CheckCheck size={16} />
                {allVisibleSelected ? "Deselect all" : "Select all"}
              </button>
              <button
                type="button"
                onClick={() => setShowBulkDelete(true)}
                disabled={deleting || selectedIds.size === 0}
                className="btn btn-error btn-sm rounded-full"
              >
                <Trash2 size={16} /> Delete ({selectedIds.size})
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <span className="loading loading-spinner loading-md" />
          </div>
        ) : loadError ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-4 text-center">
            <p className="text-sm text-base-content/60">
              {loadError === "rate-limit"
                ? "Too many requests. Please try again shortly."
                : "Unable to load your notes."}
            </p>
            <button
              type="button"
              className="btn btn-ghost btn-sm rounded-full"
              onClick={() => setReloadKey((key) => key + 1)}
            >
              Try again
            </button>
          </div>
        ) : notes.length === 0 ? (
          <div className="flex min-h-80 flex-col items-center justify-center text-center">
            <h3 className="text-lg font-semibold">No notes yet</h3>
            <p className="mt-2 max-w-sm text-sm text-base-content/50">
              Capture a thought, save a link, or add something you want to come back to.
            </p>
            <button
              type="button"
              onClick={() => setIsCreatingNote(true)}
              className="btn btn-neutral mt-5 rounded-full"
            >
              <Plus size={17} /> Create your first note
            </button>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center text-center">
            <h3 className="text-lg font-semibold">No matching notes</h3>
            <p className="mt-2 text-sm text-base-content/50">Try another search term.</p>
            <button
              type="button"
              onClick={() => handleSearchChange("")}
              className="btn btn-ghost btn-sm mt-3 rounded-full"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredNotes.map((note) => {
              const selected = selectedIds.has(note._id);

              return (
                <div
                  key={note._id}
                  className={`relative rounded-2xl motion-safe:transition-transform motion-safe:duration-200 motion-safe:hover:-translate-y-0.5 ${
                    selected ? "ring-2 ring-slate-700 ring-offset-2 ring-offset-base-100" : ""
                  }`}
                >
                  {/* In selection mode, deactivate the card link and its delete button. */}
                  <div inert={selectionMode ? "" : undefined} aria-hidden={selectionMode}>
                    <NoteCard note={note} onDelete={handleNoteDeleted} />
                  </div>

                  {selectionMode && (
                    <button
                      type="button"
                      onClick={() => toggleSelect(note._id)}
                      aria-pressed={selected}
                      aria-label={`${selected ? "Deselect" : "Select"} ${note.title || "Untitled note"}`}
                      className="absolute inset-0 z-10 cursor-pointer rounded-2xl transition-colors duration-150 hover:bg-base-content/[0.035] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none absolute right-3 top-3 grid size-7 place-items-center rounded-full border shadow-sm transition-all duration-150 ${
                          selected
                            ? "scale-105 border-slate-800 bg-slate-800 text-white"
                            : "border-base-300 bg-base-100/95 text-base-content/60"
                        }`}
                      >
                        {selected && <Check size={16} strokeWidth={2.5} />}
                      </span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {isCreatingNote && (
        <CreatePageModal
          onClose={() => setIsCreatingNote(false)}
          onCreated={handleNoteCreated}
        />
      )}

      <ConfirmDialog
        open={showBulkDelete}
        title={`Delete ${selectedIds.size} note${selectedIds.size === 1 ? "" : "s"}?`}
        description="Selected notes will be permanently deleted. This action cannot be undone."
        confirmText="Delete selected"
        cancelText="Cancel"
        variant="danger"
        loading={deleting}
        onCancel={() => {
          if (!deleting) setShowBulkDelete(false);
        }}
        onConfirm={handleBulkDelete}
      />
    </div>
  );
}
