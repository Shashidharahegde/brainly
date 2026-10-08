import axios from "axios";
import toast from "react-hot-toast";
import {
  ExternalLink,
  PenSquareIcon,
  Play,
  Trash2,
  Volume2,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import ConfirmDialog from "../components/Confirmation";

function getYouTubeId(url) {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.slice(1);
    }

    if (parsed.hostname.includes("youtube.com")) {
      if (parsed.pathname.startsWith("/shorts/")) {
        return parsed.pathname.split("/shorts/")[1];
      }

      if (parsed.pathname.startsWith("/embed/")) {
        return parsed.pathname.split("/embed/")[1];
      }

      return parsed.searchParams.get("v");
    }

    return null;
  } catch {
    return null;
  }
}

function getMediaType(url) {
  if (!url) return null;

  if (getYouTubeId(url)) {
    return "youtube";
  }

  const cleanUrl = url.split("?")[0].toLowerCase();

  if (/\.(jpg|jpeg|png|webp|gif|avif)$/.test(cleanUrl)) {
    return "image";
  }

  if (/\.(mp4|webm|mov|ogg)$/.test(cleanUrl)) {
    return "video";
  }

  if (/\.(mp3|wav|m4a|aac)$/.test(cleanUrl)) {
    return "audio";
  }

  try {
    new URL(url);
    return "link";
  } catch {
    return null;
  }
}

function MediaThumbnail({ media, title }) {
  const type = getMediaType(media);

  if (!media || !type) return null;

  if (type === "youtube") {
    const youtubeId = getYouTubeId(media);

    return (
      <div className="relative aspect-video overflow-hidden bg-base-200">
        <img
          src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
          alt={title || "YouTube thumbnail"}
          className="
            h-full w-full
            object-cover
            transition-transform duration-300
            group-hover:scale-[1.02]
          "
        />

        <div className="absolute inset-0 flex items-center justify-center bg-black/5">
          <div className="flex size-11 items-center justify-center rounded-full bg-black/70 text-white shadow-lg backdrop-blur-sm">
            <Play size={18} fill="currentColor" className="ml-0.5" />
          </div>
        </div>

        <div className="absolute bottom-3 left-3 rounded-full bg-black/65 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
          YouTube
        </div>
      </div>
    );
  }

  if (type === "image") {
    return (
      <div className="max-h-64 overflow-hidden bg-base-200">
        <img
          src={media}
          alt={title || "Note attachment"}
          className="
            max-h-64
            w-full
            object-cover
            transition-transform duration-300
            group-hover:scale-[1.02]
          "
        />
      </div>
    );
  }

  if (type === "video") {
    return (
      <div className="relative aspect-video overflow-hidden bg-black">
        <video
          src={media}
          preload="metadata"
          muted
          className="h-full w-full object-cover"
        />

        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
          <div className="flex size-11 items-center justify-center rounded-full bg-black/70 text-white shadow-lg backdrop-blur-sm">
            <Play size={18} fill="currentColor" className="ml-0.5" />
          </div>
        </div>

        <div className="absolute bottom-3 left-3 rounded-full bg-black/65 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
          Video
        </div>
      </div>
    );
  }

  if (type === "audio") {
    return (
      <div className="flex items-center gap-3 border-b border-base-300 bg-base-200/50 px-5 py-5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-base-content text-base-100">
          <Volume2 size={17} />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-medium">Audio note</p>

          <p className="mt-0.5 truncate text-xs text-base-content/45">
            {media}
          </p>
        </div>
      </div>
    );
  }

  if (type === "link") {
    let hostname = media;

    try {
      hostname = new URL(media).hostname.replace("www.", "");
    } catch {
      hostname = media;
    }

    return (
      <div className="flex items-center gap-3 border-b border-base-300 bg-base-200/40 px-5 py-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-base-300 bg-base-100">
          <ExternalLink size={16} className="text-base-content/60" />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{hostname}</p>

          <p className="mt-0.5 truncate text-xs text-base-content/45">
            {media}
          </p>
        </div>
      </div>
    );
  }

  return null;
}

const NoteCard = ({ note, onClick, onDelete }) => {
  const { title, content, media, tags = [], createdAt } = note;

  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [loading, setLoading] = useState(false);

  const formattedDate = createdAt
    ? new Intl.DateTimeFormat("en", {
        day: "numeric",
        month: "short",
      }).format(new Date(createdAt))
    : null;

  function handleDeleteRequest(event) {
    event.preventDefault();
    event.stopPropagation();

    setShowDeleteWarning(true);
  }

  async function handleDelete() {
    setLoading(true);

    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND}/api/notes/delete/${note._id}`
      );

      toast.success("Note deleted");

      setShowDeleteWarning(false);

      onDelete?.(note);
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Couldn't delete note.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <article
        className="
          group relative
          overflow-hidden
          rounded-2xl
          border border-base-300
          bg-base-100
          transition-all duration-200
          hover:border-base-content/20
          hover:shadow-md
        "
      >
        <Link
          to={`/note/${note._id}`}
          onClick={() => onClick?.(note)}
          className="block"
        >
          <MediaThumbnail media={media} title={title} />

          <div className="p-5">
            {tags.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="
                      badge badge-ghost badge-sm
                      rounded-full px-2.5
                      text-[11px] font-medium
                      text-base-content/60
                    "
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <h3
              className="
                text-[17px]
                font-semibold
                leading-snug
                tracking-[-0.015em]
                text-base-content
              "
            >
              {title}
            </h3>

            {content && (
              <p
                className="
                  mt-2
                  line-clamp-4
                  text-sm
                  leading-6
                  text-base-content/60
                "
              >
                {content}
              </p>
            )}

            <div className="mt-5 flex items-center justify-between gap-3">
              {formattedDate && (
                <span className="text-xs text-base-content/40">
                  {formattedDate}
                </span>
              )}

              <div className="flex items-center gap-1 opacity-60 transition-opacity group-hover:opacity-100">
                <span
                  className="
                    btn btn-ghost
                    btn-circle btn-sm
                    pointer-events-none
                  "
                >
                  <PenSquareIcon size={15} />
                </span>

                <button
                  type="button"
                  onClick={handleDeleteRequest}
                  className="btn btn-ghost btn-circle btn-sm"
                  aria-label="Delete note"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        </Link>
      </article>

      <ConfirmDialog
        open={showDeleteWarning}
        title="Delete this note?"
        description="This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={loading}
        onCancel={() => setShowDeleteWarning(false)}
        onConfirm={handleDelete}
      />
    </>
  );
};

export default NoteCard;