
import axios from "axios";
import {
  ArrowLeft,
  ExternalLink,
  Pencil,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router";

import ConfirmDialog from "../components/Confirmation";
import {
  getMediaType,
  getYouTubeId,
} from "../utils/getMediaType.js";

const API_URL = import.meta.env.VITE_BACKEND;

function NoteMedia({ media, title }) {
  if (!media) return null;

  const type = getMediaType(media);

  if (type === "youtube") {
    return (
      <div className="aspect-video overflow-hidden rounded-2xl bg-black">
        <iframe
          src={`https://www.youtube.com/embed/${getYouTubeId(media)}`}
          title={title || "YouTube video"}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (type === "image") {
    return (
      <div className="overflow-hidden rounded-2xl border border-base-300 bg-base-200">
        <img
          src={media}
          alt={title || "Note attachment"}
          className="max-h-[70vh] w-full object-contain"
        />
      </div>
    );
  }

  if (type === "video") {
    return (
      <div className="overflow-hidden rounded-2xl bg-black">
        <video
          src={media}
          controls
          className="max-h-[70vh] w-full"
        />
      </div>
    );
  }

  if (type === "audio") {
    return (
      <div className="rounded-2xl border border-base-300 bg-base-200/50 p-5">
        <audio src={media} controls className="w-full" />
      </div>
    );
  }

  if (type === "link") {
    let hostname = media;

    try {
      hostname = new URL(media).hostname.replace(
        /^www\./,
        ""
      );
    } catch {
      // Display the original URL if parsing fails.
    }

    return (
      <a
        href={media}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center justify-between gap-4 rounded-2xl border border-base-300 bg-base-200/40 p-5 transition hover:bg-base-200"
      >
        <div className="min-w-0">
          <p className="text-xs text-base-content/40">
            External link
          </p>
          <p className="mt-1 truncate font-medium">
            {hostname}
          </p>
          <p className="mt-1 truncate text-sm text-base-content/50">
            {media}
          </p>
        </div>

        <ExternalLink
          size={18}
          className="shrink-0 text-base-content/50 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        />
      </a>
    );
  }

  return null;
}

function NoteDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const titleRef = useRef(null);

  const [note, setNote] = useState(null);
  const [draft, setDraft] = useState({
    title: "",
    content: "",
  });

  // null, "title", or "content"
  const [editing, setEditing] = useState(null);

  // null, "back", "cancel", or "delete"
  const [dialog, setDialog] = useState(null);

  // null, "saving", or "deleting"
  const [busy, setBusy] = useState(null);

  const [status, setStatus] = useState("loading");

  const isEditing = editing !== null;
  const isSaving = busy === "saving";
  const isDeleting = busy === "deleting";

  const hasChanges =
    note !== null &&
    (draft.title !== (note.title ?? "") ||
      draft.content !== (note.content ?? ""));

  useEffect(() => {
    const controller = new AbortController();

    async function fetchNote() {
      setStatus("loading");
      setNote(null);
      setEditing(null);
      setDialog(null);

      try {
        const { data } = await axios.get(
          `${API_URL}/api/notes/${id}`,
          { signal: controller.signal }
        );

        if (controller.signal.aborted) return;

        setNote(data);
        setDraft({
          title: data.title ?? "",
          content: data.content ?? "",
        });
        setStatus("ready");
      } catch (error) {
        if (controller.signal.aborted) return;

        console.error(error);

        setStatus(
          error.response?.status === 404
            ? "not-found"
            : "error"
        );
      }
    }

    fetchNote();

    return () => controller.abort();
  }, [id]);

  function updateDraft(field, value) {
    setDraft((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function discardChanges() {
    setDraft({
      title: note?.title ?? "",
      content: note?.content ?? "",
    });
    setEditing(null);
  }

  function handleBack() {
    if (busy) return;

    if (hasChanges) {
      setDialog("back");
    } else {
      navigate(-1);
    }
  }

  function handleCancel() {
    if (busy) return;

    if (hasChanges) {
      setDialog("cancel");
    } else {
      discardChanges();
    }
  }

  async function handleSave() {
    if (!note || busy) return;

    const title = draft.title.trim();
    const content = draft.content;

    if (!title) {
      toast.error("Title cannot be empty.");
      titleRef.current?.focus();
      return;
    }

    // Avoid updating the database if nothing
    // changed after trimming the title.
    if (
      title === (note.title ?? "") &&
      content === (note.content ?? "")
    ) {
      setDraft({ title, content });
      setEditing(null);
      return;
    }

    setBusy("saving");

    try {
      await axios.put(`${API_URL}/api/notes/${id}`, {
        title,
        content,
        media: note.media ?? "",
        tags: note.tags ?? [],
      });

      setNote((prev) => ({
        ...prev,
        title,
        content,
      }));

      setDraft({ title, content });
      setEditing(null);

      toast.success("Note saved successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save note.");
    } finally {
      setBusy(null);
    }
  }

  async function handleConfirm() {
    if (busy) return;

    if (dialog === "delete") {
      setBusy("deleting");

      try {
        await axios.delete(
          `${API_URL}/api/notes/${id}`
        );

        toast.success("Note deleted");
        setDialog(null);
        navigate("/", { replace: true });
      } catch (error) {
        console.error(error);
        toast.error("Couldn't delete this note.");
      } finally {
        setBusy(null);
      }

      return;
    }

    const shouldGoBack = dialog === "back";

    setDialog(null);
    discardChanges();

    if (shouldGoBack) {
      navigate(-1);
    }
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base-100">
        <span className="loading loading-spinner loading-md" />
      </div>
    );
  }

  if (status !== "ready" || !note) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-base-100">
        <h1 className="text-xl font-semibold">
          {status === "not-found"
            ? "Note not found"
            : "Unable to load note"}
        </h1>

        <button
          type="button"
          onClick={() => navigate("/")}
          className="btn btn-neutral rounded-full"
        >
          Back home
        </button>
      </div>
    );
  }

  const createdAt = new Date(note.createdAt);

  const formattedDate = Number.isNaN(
    createdAt.getTime()
  )
    ? ""
    : createdAt.toLocaleDateString("en", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

  const isDeleteDialog = dialog === "delete";

  return (
    <div className="min-h-screen bg-base-100">
      <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 md:py-10">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleBack}
            disabled={!!busy}
            className="btn btn-ghost btn-sm rounded-full"
          >
            <ArrowLeft size={17} />
            Back
          </button>

          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={!!busy}
                  className="btn btn-ghost btn-sm rounded-full"
                >
                  <X size={16} />
                  <span className="hidden sm:inline">
                    Cancel
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!!busy || !hasChanges}
                  className="btn btn-primary btn-sm rounded-full"
                >
                  {isSaving ? (
                    <span className="loading loading-spinner loading-xs" />
                  ) : (
                    <Save size={16} />
                  )}

                  {isSaving ? "Saving..." : "Save"}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setEditing("title")}
                disabled={!!busy}
                className="btn btn-ghost btn-sm rounded-full"
              >
                <Pencil size={16} />
                Edit
              </button>
            )}

            <button
              type="button"
              onClick={() => setDialog("delete")}
              disabled={!!busy}
              className="btn btn-ghost btn-sm rounded-full text-error"
            >
              <Trash2 size={16} />
              <span className="hidden sm:inline">
                Delete
              </span>
            </button>
          </div>
        </div>

        <article>
          {/* Tags */}
          {note.tags?.length > 0 && (
            <div className="mb-5 flex flex-wrap gap-2">
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className="badge badge-ghost rounded-full px-3"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          {isEditing ? (
            <input
              ref={titleRef}
              autoFocus={editing === "title"}
              type="text"
              value={draft.title}
              onChange={(e) =>
                updateDraft("title", e.target.value)
              }
              disabled={!!busy}
              placeholder="Untitled"
              aria-label="Note title"
              className="w-full max-w-3xl bg-transparent text-3xl font-semibold tracking-[-0.035em] text-base-content outline-none placeholder:text-base-content/30 sm:text-4xl md:text-5xl"
            />
          ) : (
            <h1 className="max-w-3xl text-3xl font-semibold tracking-[-0.035em] text-base-content sm:text-4xl md:text-5xl">
              <button
                type="button"
                onClick={() => setEditing("title")}
                className="w-full cursor-text rounded-lg text-left transition-colors hover:bg-base-200/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                title="Tap to edit title"
              >
                {note.title || "Untitled"}
              </button>
            </h1>
          )}

          {/* Date */}
          {formattedDate && (
            <p className="mt-3 text-sm text-base-content/40">
              {formattedDate}
            </p>
          )}

          {/* Editing status */}
          {isEditing && (
            <div className="mt-3 flex items-center gap-2">
              <span
                className={`size-1.5 rounded-full ${
                  hasChanges
                    ? "bg-warning"
                    : "bg-base-content/30"
                }`}
              />
              <span className="text-xs text-base-content/40">
                {isSaving
                  ? "Saving changes..."
                  : hasChanges
                    ? "Unsaved changes"
                    : "Editing note"}
              </span>
            </div>
          )}

          {/* Media */}
          {note.media && (
            <div className="mt-8">
              <NoteMedia
                media={note.media}
                title={note.title}
              />
            </div>
          )}

          {/* Content */}
          <div className="mt-8">
            {isEditing ? (
              <textarea
                autoFocus={editing === "content"}
                value={draft.content}
                onChange={(e) =>
                  updateDraft("content", e.target.value)
                }
                disabled={!!busy}
                placeholder="Start writing..."
                aria-label="Note content"
                rows={10}
                className="min-h-[250px] w-full resize-y border-none bg-transparent p-0 text-[17px] leading-8 text-base-content/75 outline-none placeholder:text-base-content/30 focus:outline-none"
              />
            ) : (
              <button
                type="button"
                onClick={() => setEditing("content")}
                title="Tap to edit content"
                className="block min-h-[120px] w-full cursor-text rounded-lg text-left whitespace-pre-wrap text-[17px] leading-8 text-base-content/75 transition-colors hover:bg-base-200/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
              >
                {note.content ||
                  "Tap here to start writing..."}
              </button>
            )}
          </div>
        </article>

        {/* Single confirmation dialog */}
        <ConfirmDialog
          open={dialog !== null}
          title={
            isDeleteDialog
              ? "Delete this note?"
              : "Discard unsaved changes?"
          }
          description={
            isDeleteDialog
              ? hasChanges
                ? "This note has unsaved changes. Deleting it will permanently remove the note and discard your edits."
                : "This action cannot be undone."
              : "Your unsaved changes will be lost if you continue."
          }
          confirmText={
            isDeleteDialog
              ? "Delete"
              : "Discard changes"
          }
          cancelText={
            isDeleteDialog
              ? "Cancel"
              : "Keep editing"
          }
          variant={
            isDeleteDialog ? "danger" : "warning"
          }
          loading={isDeleting}
          onCancel={() => {
            if (!busy) setDialog(null);
          }}
          onConfirm={handleConfirm}
        />
      </main>
    </div>
  );
}

export default NoteDetailPage;