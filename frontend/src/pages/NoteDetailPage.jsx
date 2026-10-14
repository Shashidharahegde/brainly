import axios from "axios";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  ArrowUpRight,
  ExternalLink,
  Link2,
  Pencil,
  Plus,
  Save,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { useNavigate, useParams } from "react-router";

import ConfirmDialog from "../components/Confirmation";
import { getMediaType, getYouTubeId } from "../utils/getMediaType.js";

const API_URL = import.meta.env.VITE_BACKEND;

// Handles http(s) URLs, www. URLs, and bare domains such as youtube.com/...
const URL_REGEX =
  /(?:https?:\/\/|www\.)[^\s<>"'`]+|(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,63}(?::\d{2,5})?(?:[/?#][^\s<>"'`]*)?/gi;

function trimTrailingPunctuation(value) {
  let result = value;
  const pairs = { ")": "(", "]": "[", "}": "{" };

  while (result) {
    const last = result.at(-1);

    if (".,!?;:".includes(last)) {
      result = result.slice(0, -1);
      continue;
    }

    if (pairs[last]) {
      const closingCount = result.split(last).length - 1;
      const openingCount = result.split(pairs[last]).length - 1;

      if (closingCount > openingCount) {
        result = result.slice(0, -1);
        continue;
      }
    }

    break;
  }

  return result;
}

function normalizeUrl(value) {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return "";

  try {
    const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    const url = new URL(candidate);

    if (!["http:", "https:"].includes(url.protocol)) return "";
    if (!url.hostname.includes(".")) return "";

    return url.href;
  } catch {
    return "";
  }
}

function getContentTokens(content = "") {
  const tokens = [];
  let cursor = 0;

  for (const match of content.matchAll(URL_REGEX)) {
    const start = match.index;

    // Do not turn the domain inside an email address or another word into a link.
    if (start > 0 && /[\w@./-]/.test(content[start - 1])) continue;

    const text = trimTrailingPunctuation(match[0]);
    const url = normalizeUrl(text);
    if (!url) continue;

    if (start > cursor) {
      tokens.push({ text: content.slice(cursor, start), url: "" });
    }

    tokens.push({ text, url });
    cursor = start + text.length;
  }

  if (cursor < content.length) {
    tokens.push({ text: content.slice(cursor), url: "" });
  }

  return tokens;
}

function getContentUrls(content = "") {
  return [...new Set(getContentTokens(content).filter((part) => part.url).map((part) => part.url))];
}

function getActiveMedia(media, content, suppressAutomatic = false) {
  return normalizeUrl(media) || (suppressAutomatic ? "" : getContentUrls(content)[0] || "");
}

function normalizeTags(tags) {
  return [...new Set((Array.isArray(tags) ? tags : [])
    .filter((tag) => typeof tag === "string")
    .map((tag) => tag.trim().replace(/^#/, "").toLowerCase())
    .filter(Boolean))];
}

function makeDraft(note) {
  const content = note?.content ?? "";
  const storedMedia = note?.media ?? "";
  const normalizedStoredMedia = normalizeUrl(storedMedia);
  const firstContentUrl = getContentUrls(content)[0] || "";

  return {
    title: note?.title ?? "",
    content,
    // NoteComposer automatically stores the first URL from content.
    // If they match, keep it automatic so editing content updates the media.
    media: normalizedStoredMedia === firstContentUrl ? "" : storedMedia,
    tags: Array.isArray(note?.tags) ? [...note.tags] : [],
  };
}

function MediaPreview({ media, title, onRemove }) {
  const url = normalizeUrl(media);
  if (!url) return null;

  const type = getMediaType(url) || "link";
  const videoId = type === "youtube" ? getYouTubeId(url) : null;

  let preview;

  if (type === "youtube" && videoId) {
    preview = (
      <div className="aspect-video">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}`}
          title={title ? `${title} — YouTube video` : "YouTube preview"}
          className="h-full w-full"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    );
  } else if (type === "image") {
    preview = (
      <img
        src={url}
        alt={title || "Note attachment"}
        loading="lazy"
        className="max-h-[70vh] w-full object-contain"
      />
    );
  } else if (type === "video") {
    preview = <video src={url} controls preload="metadata" className="max-h-[70vh] w-full bg-black" />;
  } else if (type === "audio") {
    preview = (
      <div className="p-5">
        <audio src={url} controls preload="metadata" className="w-full" />
      </div>
    );
  } else {
    let hostname = url;
    try {
      hostname = new URL(url).hostname.replace(/^www\./, "");
    } catch {
      // normalizeUrl already validated it; retain the URL as a fallback.
    }

    preview = (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center justify-between gap-4 p-5 pr-12 transition hover:bg-base-200"
      >
        <div className="min-w-0">
          <p className="text-xs text-base-content/40">External link</p>
          <p className="mt-1 truncate font-medium">{hostname}</p>
          <p className="mt-1 truncate text-sm text-base-content/50">{url}</p>
        </div>
        <ExternalLink size={18} className="shrink-0 text-base-content/50" />
      </a>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-base-300 bg-base-200/40">
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove attachment"
          className="btn btn-circle btn-sm absolute right-3 top-3 z-10 border-base-300 bg-base-100 shadow-sm"
        >
          <X size={15} />
        </button>
      )}
      {preview || (
        <a href={url} target="_blank" rel="noopener noreferrer" className="block p-5 break-all">
          {url} <ArrowUpRight size={16} className="inline" />
        </a>
      )}
    </div>
  );
}

function NoteContent({ content = "" }) {
  const parts = useMemo(() => getContentTokens(content), [content]);

  return (
    <div className="whitespace-pre-wrap break-words text-[17px] leading-8 text-base-content/75">
      {parts.map((part, index) =>
        part.url ? (
          <a
            key={index}
            href={part.url}
            target="_blank"
            rel="noopener noreferrer"
            className="link link-primary break-all"
          >
            {part.text}
          </a>
        ) : (
          <Fragment key={index}>{part.text}</Fragment>
        ),
      )}
    </div>
  );
}

function NoteDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const titleRef = useRef(null);

  const [note, setNote] = useState(null);
  const [draft, setDraft] = useState({ title: "", content: "", media: "", tags: [] });
  const [editing, setEditing] = useState(null); // null, "title", "content", "media"
  const [dialog, setDialog] = useState(null); // null, "back", "cancel", "delete"
  const [busy, setBusy] = useState(null); // null, "saving", "deleting"
  const [status, setStatus] = useState("loading");
  const [tagInput, setTagInput] = useState("");
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [suppressAutomaticMedia, setSuppressAutomaticMedia] = useState(false);

  const isEditing = editing !== null;
  const isSaving = busy === "saving";
  const isDeleting = busy === "deleting";

  const initialDraft = useMemo(() => makeDraft(note), [note]);
  const hasChanges =
    note !== null &&
    (draft.title !== initialDraft.title ||
      draft.content !== initialDraft.content ||
      draft.media !== initialDraft.media ||
      JSON.stringify(draft.tags) !== JSON.stringify(initialDraft.tags) ||
      Boolean(tagInput.trim()) ||
      suppressAutomaticMedia);

  const visibleTitle = isEditing ? draft.title : note?.title;
  const visibleContent = isEditing ? draft.content : note?.content ?? "";
  const activeMedia = isEditing
    ? getActiveMedia(draft.media, draft.content, suppressAutomaticMedia)
    : getActiveMedia(note?.media, note?.content);

  const contentUrls = useMemo(() => getContentUrls(visibleContent), [visibleContent]);
  const otherPreviews = contentUrls.filter((url) => url !== activeMedia);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchNote() {
      setStatus("loading");
      setNote(null);
      setEditing(null);
      setDialog(null);
      setTagInput("");
      setShowMediaInput(false);
      setSuppressAutomaticMedia(false);

      try {
        const { data } = await axios.get(`${API_URL}/api/notes/${id}`, {
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;

        setNote(data);
        setDraft(makeDraft(data));
        setStatus("ready");
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("Error loading note:", error);
        setStatus(error.response?.status === 404 ? "not-found" : "error");
      }
    }

    fetchNote();
    return () => controller.abort();
  }, [id]);

  function updateDraft(field, value) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function discardChanges() {
    setDraft(makeDraft(note));
    setTagInput("");
    setShowMediaInput(false);
    setSuppressAutomaticMedia(false);
    setEditing(null);
  }

  function handleBack() {
    if (busy) return;
    if (hasChanges) setDialog("back");
    else navigate(-1);
  }

  function handleCancel() {
    if (busy) return;
    if (hasChanges) setDialog("cancel");
    else discardChanges();
  }

  function addTag() {
    const addedTags = normalizeTags([tagInput]);
    if (!addedTags.length) return;

    setDraft((current) => ({
      ...current,
      tags: normalizeTags([...current.tags, ...addedTags]),
    }));
    setTagInput("");
  }

  function handleRemoveMedia() {
    setDraft((current) => ({ ...current, media: "" }));
    // Prevent the same auto-detected content URL from immediately reappearing.
    setSuppressAutomaticMedia(true);
    setShowMediaInput(false);
  }

  async function handleSave({ goBack = false } = {}) {
    if (!note || busy) return false;

    const title = draft.title.trim() || "Untitled";
    const content = draft.content.trim();
    const tags = normalizeTags([...draft.tags, tagInput]);
    const media = getActiveMedia(draft.media, content, suppressAutomaticMedia);

    if (draft.media.trim() && !normalizeUrl(draft.media)) {
      toast.error("Please enter a valid media URL.");
      return false;
    }

    if (!draft.title.trim() && !content && !media) {
      toast.error("Your note is empty.");
      titleRef.current?.focus();
      return false;
    }

    // Same payload fields as NoteComposer, using PUT to update this note.
    const payload = {
      title,
      content,
      media,
      mediaType: media ? getMediaType(media) || "link" : null,
      tags,
    };

    const unchanged =
      payload.title === (note.title ?? "Untitled") &&
      payload.content === (note.content ?? "") &&
      payload.media === normalizeUrl(note.media) &&
      JSON.stringify(payload.tags) === JSON.stringify(normalizeTags(note.tags));

    if (unchanged) {
      setDraft(makeDraft(note));
      setTagInput("");
      setSuppressAutomaticMedia(false);
      setShowMediaInput(false);
      setEditing(null);
      setDialog(null);
      if (goBack) navigate(-1);
      return true;
    }

    setBusy("saving");

    try {
      const { data } = await axios.put(`${API_URL}/api/notes/${id}`, payload);
      const savedNote = {
        ...note,
        ...payload,
        ...(data?.note?._id ? data.note : data?._id ? data : {}),
      };

      setNote(savedNote);
      setDraft(makeDraft(savedNote));
      setTagInput("");
      setShowMediaInput(false);
      setSuppressAutomaticMedia(false);
      setEditing(null);
      setDialog(null);
      toast.success("Note saved successfully");

      if (goBack) navigate(-1);
      return true;
    } catch (error) {
      console.error("Error updating note:", error);
      toast.error("Couldn't save your note.");
      return false;
    } finally {
      setBusy(null);
    }
  }

  async function handleDelete() {
    if (busy) return;
    setBusy("deleting");

    try {
      await axios.delete(`${API_URL}/api/notes/${id}`);
      toast.success("Note deleted");
      setDialog(null);
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Couldn't delete this note.");
    } finally {
      setBusy(null);
    }
  }

  function handleDiscardConfirmation() {
    const goBack = dialog === "back";
    setDialog(null);
    discardChanges();
    if (goBack) navigate(-1);
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
          {status === "not-found" ? "Note not found" : "Unable to load note"}
        </h1>
        <button type="button" onClick={() => navigate("/")} className="btn btn-neutral rounded-full">
          Back home
        </button>
      </div>
    );
  }

  const createdAt = new Date(note.createdAt);
  const formattedDate = Number.isNaN(createdAt.getTime())
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
        <div className="mb-8 flex items-center justify-between gap-3">
          <button type="button" onClick={handleBack} disabled={!!busy} className="btn btn-ghost btn-sm rounded-full">
            <ArrowLeft size={17} /> Back
          </button>

          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button type="button" onClick={handleCancel} disabled={!!busy} className="btn btn-ghost btn-sm rounded-full">
                  <X size={16} /> <span className="hidden sm:inline">Cancel</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSave()}
                  disabled={!!busy || !hasChanges}
                  className="btn btn-primary btn-sm rounded-full"
                >
                  {isSaving ? <span className="loading loading-spinner loading-xs" /> : <Save size={16} />}
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </>
            ) : (
              <button type="button" onClick={() => setEditing("title")} disabled={!!busy} className="btn btn-ghost btn-sm rounded-full">
                <Pencil size={16} /> Edit
              </button>
            )}

            <button type="button" onClick={() => setDialog("delete")} disabled={!!busy} className="btn btn-ghost btn-sm rounded-full text-error">
              <Trash2 size={16} /> <span className="hidden sm:inline">Delete</span>
            </button>
          </div>
        </div>

        <article>
          {isEditing ? (
            <div className="mb-5 flex flex-wrap items-center gap-2">
              {draft.tags.map((tag) => (
                <span key={tag} className="badge badge-ghost gap-1 rounded-full px-3">
                  #{tag}
                  <button
                    type="button"
                    onClick={() => updateDraft("tags", draft.tags.filter((item) => item !== tag))}
                    aria-label={`Remove ${tag} tag`}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              <label className="flex items-center gap-2 text-sm text-base-content/50">
                <Tag size={16} />
                <input
                  value={tagInput}
                  onChange={(event) => setTagInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === ",") {
                      event.preventDefault();
                      addTag();
                    }
                  }}
                  onBlur={addTag}
                  disabled={!!busy}
                  placeholder="Add tags..."
                  className="w-28 bg-transparent outline-none placeholder:text-base-content/40"
                />
              </label>
            </div>
          ) : note.tags?.length > 0 ? (
            <div className="mb-5 flex flex-wrap gap-2">
              {note.tags.map((tag) => (
                <span key={tag} className="badge badge-ghost rounded-full px-3">#{tag}</span>
              ))}
            </div>
          ) : null}

          {isEditing ? (
            <input
              ref={titleRef}
              autoFocus={editing === "title"}
              type="text"
              value={draft.title}
              onChange={(event) => updateDraft("title", event.target.value)}
              disabled={!!busy}
              placeholder="Untitled"
              aria-label="Note title"
              className="w-full max-w-3xl bg-transparent text-3xl font-semibold tracking-[-0.035em] text-base-content outline-none placeholder:text-base-content/30 sm:text-4xl md:text-5xl"
            />
          ) : (
            <h1 className="max-w-3xl text-3xl font-semibold tracking-[-0.035em] text-base-content sm:text-4xl md:text-5xl">
              <button type="button" onClick={() => setEditing("title")} className="w-full cursor-text rounded-lg text-left transition-colors hover:bg-base-200/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary" title="Tap to edit title">
                {note.title || "Untitled"}
              </button>
            </h1>
          )}

          {formattedDate && <p className="mt-3 text-sm text-base-content/40">{formattedDate}</p>}

          {isEditing && (
            <p className="mt-3 text-xs text-base-content/40">
              {isSaving ? "Saving changes..." : hasChanges ? "Unsaved changes" : "Editing note"}
            </p>
          )}

          {isEditing && (
            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={() => setShowMediaInput((current) => !current)}
                disabled={!!busy}
                className="btn btn-ghost btn-sm rounded-xl bg-base-200"
              >
                <Plus size={16} /> {showMediaInput ? "Hide media URL" : "Add media / link"}
              </button>

              {showMediaInput && (
                <label className="input input-bordered flex w-full items-center gap-3 rounded-xl">
                  <Link2 size={17} className="text-base-content/40" />
                  <input
                    autoFocus
                    type="text"
                    value={draft.media}
                    onChange={(event) => {
                      updateDraft("media", event.target.value);
                      setSuppressAutomaticMedia(false);
                    }}
                    disabled={!!busy}
                    placeholder="Paste an image, video, audio, or link URL"
                    className="grow"
                  />
                </label>
              )}
            </div>
          )}

          {activeMedia && (
            <div className="mt-8">
              <MediaPreview
                media={activeMedia}
                title={visibleTitle}
                onRemove={isEditing && !busy && draft.media.trim() ? handleRemoveMedia : undefined}
              />
            </div>
          )}

          <div className="mt-8">
            {isEditing ? (
              <textarea
                autoFocus={editing === "content"}
                value={draft.content}
                onChange={(event) => updateDraft("content", event.target.value)}
                disabled={!!busy}
                placeholder="Start writing..."
                aria-label="Note content"
                rows={10}
                className="min-h-[250px] w-full resize-y border-none bg-transparent p-0 text-[17px] leading-8 text-base-content/75 outline-none placeholder:text-base-content/30 focus:outline-none"
              />
            ) : (
              <>
                <button type="button" onClick={() => setEditing("content")} className="mb-3 text-sm text-base-content/50 hover:underline">
                  Edit content
                </button>
                <NoteContent content={note.content || "Tap here to start writing..."} />
              </>
            )}
          </div>

          {!isEditing && otherPreviews.length > 0 && (
            <div className="mt-6 space-y-4">
              {otherPreviews.map((url) => (
                <MediaPreview key={url} media={url} title="Link preview" />
              ))}
            </div>
          )}
        </article>

        <ConfirmDialog
          open={dialog !== null}
          title={isDeleteDialog ? "Delete this note?" : "Save your changes?"}
          description={
            isDeleteDialog
              ? hasChanges
                ? "Deleting this note will permanently remove it and discard your unsaved changes."
                : "This action cannot be undone."
              : "You have unsaved changes. Would you like to save them before leaving?"
          }
          confirmText={isDeleteDialog ? "Delete" : "Save"}
          cancelText={isDeleteDialog ? "Cancel" : "Keep editing"}
          secondaryText={isDeleteDialog ? undefined : "Discard"}
          variant={isDeleteDialog ? "danger" : "warning"}
          loading={!!busy}
          onCancel={() => {
            if (!busy) setDialog(null);
          }}
          onSecondary={isDeleteDialog ? undefined : handleDiscardConfirmation}
          onConfirm={isDeleteDialog ? handleDelete : () => handleSave({ goBack: dialog === "back" })}
        />
      </main>
    </div>
  );
}

export default NoteDetailPage;
