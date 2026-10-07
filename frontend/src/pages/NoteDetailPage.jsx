import axios from "axios";
import {
  ArrowLeft,
  ExternalLink,
  Pencil,
  Play,
  Trash2,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router";

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

function NoteMedia({ media, title }) {
  const type = getMediaType(media);

  if (!media || !type) return null;

  if (type === "youtube") {
    const youtubeId = getYouTubeId(media);

    return (
      <div className="aspect-video overflow-hidden rounded-2xl bg-black">
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}`}
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
        <audio
          src={media}
          controls
          className="w-full"
        />
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
      <a
        href={media}
        target="_blank"
        rel="noreferrer"
        className="
          group
          flex items-center justify-between gap-4
          rounded-2xl
          border border-base-300
          bg-base-200/40
          p-5
          transition
          hover:bg-base-200
        "
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

  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND}/api/notes/${id}`
        );

        setNote(response.data);
      } catch (error) {
        console.error(error);
        toast.error("Unable to load this note.");
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [id]);

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this note?"
    );

    if (!confirmed) return;

    setDeleting(true);

    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND}/api/notes/${id}`
      );

      toast.success("Note deleted");
      navigate("/");
    } catch (error) {
      console.error(error);
      toast.error("Couldn't delete this note.");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base-100">
        <span className="loading loading-spinner loading-md" />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-base-100">
        <h1 className="text-xl font-semibold">
          Note not found
        </h1>

        <button
          onClick={() => navigate("/")}
          className="btn btn-neutral rounded-full"
        >
          Back home
        </button>
      </div>
    );
  }

  const formattedDate = new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(note.createdAt));

  return (
    <div className="min-h-screen bg-base-100">
      <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 md:py-10">
        <div className="mb-8 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn btn-ghost btn-sm rounded-full"
          >
            <ArrowLeft size={17} />
            Back
          </button>

          <div className="flex items-center gap-2">
            <Link
              to={`/note/${note._id}/edit`}
              className="btn btn-ghost btn-sm rounded-full"
            >
              <Pencil size={16} />
              Edit
            </Link>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="btn btn-ghost btn-sm rounded-full text-error"
            >
              {deleting ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                <Trash2 size={16} />
              )}

              Delete
            </button>
          </div>
        </div>

        <article>
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

          <h1 className="max-w-3xl text-3xl font-semibold tracking-[-0.035em] text-base-content sm:text-4xl md:text-5xl">
            {note.title || "Untitled"}
          </h1>

          <div className="mt-3 text-sm text-base-content/40">
            {formattedDate}
          </div>

          {note.media && (
            <div className="mt-8">
              <NoteMedia
                media={note.media}
                title={note.title}
              />
            </div>
          )}

          {note.content && (
            <div className="mt-8">
              <p className="whitespace-pre-wrap text-[17px] leading-8 text-base-content/75">
                {note.content}
              </p>
            </div>
          )}
        </article>
      </main>
    </div>
  );
}

export default NoteDetailPage;