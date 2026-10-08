import axios from "axios";
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";
import {
  ArrowUpRight,
  Expand,
  Image,
  Link2,
  Minimize2,
  Minus,
  Plus,
  Tag,
  X,
} from "lucide-react";
import ConfirmDialog from "../components/Confirmation";
function getYouTubeId(url) {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.slice(1);
    }

    if (parsed.hostname.includes("youtube.com")) {
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

  if (
    /\.(jpg|jpeg|png|webp|gif|avif)$/.test(
      cleanUrl
    )
  ) {
    return "image";
  }

  if (
    /\.(mp4|webm|mov|ogg)$/.test(cleanUrl)
  ) {
    return "video";
  }

  if (
    /\.(mp3|wav|m4a|aac)$/.test(cleanUrl)
  ) {
    return "audio";
  }

  try {
    new URL(url);
    return "link";
  } catch {
    return null;
  }
}

function MediaPreview({ media, onRemove }) {
  const type = getMediaType(media);

  if (!media || !type) return null;

  const youtubeId =
    type === "youtube"
      ? getYouTubeId(media)
      : null;

  return (
    <div className="group relative mt-5 overflow-hidden rounded-2xl border border-base-300 bg-base-200/50">
      <button
        type="button"
        onClick={onRemove}
        className="btn btn-circle btn-sm absolute right-3 top-3 z-10 border-base-300 bg-base-100 shadow-sm"
        aria-label="Remove attachment"
      >
        <X size={15} />
      </button>

      {type === "youtube" && (
        <div className="aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}`}
            title="YouTube preview"
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {type === "image" && (
        <img
          src={media}
          alt="Note attachment"
          className="max-h-[420px] w-full object-cover"
        />
      )}

      {type === "video" && (
        <video
          src={media}
          controls
          className="max-h-[420px] w-full bg-black"
        />
      )}

      {type === "audio" && (
        <div className="p-6">
          <audio
            src={media}
            controls
            className="w-full"
          />
        </div>
      )}

      {type === "link" && (
        <a
          href={media}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between gap-4 p-5 transition hover:bg-base-200"
        >
          <div className="min-w-0">
            <p className="text-xs text-base-content/50">
              Saved link
            </p>

            <p className="mt-1 truncate font-medium">
              {media}
            </p>
          </div>

          <ArrowUpRight
            size={18}
            className="shrink-0 text-base-content/50"
          />
        </a>
      )}
    </div>
  );
}

function NoteComposer({
  onClose,
  onCreated,
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] =
    useState("");
  const [media, setMedia] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] =
    useState("");
  const [
    showMediaInput,
    setShowMediaInput,
  ] = useState(false);
  const [expanded, setExpanded] =
    useState(false);
  const [minimized, setMinimized] =
    useState(false);
  const [loading, setLoading] =
    useState(false);
  const [frame, setFrame] =
    useState(null);
  const [
    isResizing,
    setIsResizing,
  ] = useState(false);
  const [
    showCloseWarning,
    setShowCloseWarning,
  ] = useState(false);

  const composerRef = useRef(null);
  const resizeRef = useRef(null);

  const detectedContentUrl = useMemo(
    () => {
      const urls = content.match(
        /https?:\/\/[^\s]+/g
      );

      if (!urls?.length) return "";

      return urls[0];
    },
    [content]
  );

  const activeMedia =
    media || detectedContentUrl;

  const hasUnsavedChanges = Boolean(
    title.trim() ||
      content.trim() ||
      media.trim() ||
      tags.length
  );

  function addTag() {
    const cleaned = tagInput
      .trim()
      .replace(/^#/, "")
      .toLowerCase();

    if (!cleaned) return;

    if (!tags.includes(cleaned)) {
      setTags((current) => [
        ...current,
        cleaned,
      ]);
    }

    setTagInput("");
  }

  function handleTagKeyDown(event) {
    if (
      event.key === "Enter" ||
      event.key === ","
    ) {
      event.preventDefault();
      addTag();
    }
  }

  function handleCloseRequest() {
    if (!hasUnsavedChanges) {
      onClose?.();
      return;
    }

    setShowCloseWarning(true);
  }

  function handleDiscard() {
    setShowCloseWarning(false);
    onClose?.();
  }

  function getResizeLimits() {
    const viewportWidth =
      window.innerWidth;
    const viewportHeight =
      window.innerHeight;

    const isSmallScreen =
      window.matchMedia(
        "(max-width: 640px)"
      ).matches;

    return {
      viewportWidth,
      viewportHeight,
      minimumWidth: isSmallScreen
        ? viewportWidth * 0.82
        : viewportWidth * 0.28,
      minimumHeight:
        viewportHeight * 0.35,
      marginX: viewportWidth * 0.015,
      marginY:
        viewportHeight * 0.015,
    };
  }

  function handleResizeStart(
    event,
    direction
  ) {
    if (
      expanded ||
      !composerRef.current
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const rect =
      composerRef.current.getBoundingClientRect();

    resizeRef.current = {
      direction,
      startX: event.clientX,
      startY: event.clientY,
      startLeft: rect.left,
      startTop: rect.top,
      startWidth: rect.width,
      startHeight: rect.height,
    };

    setFrame({
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
    });

    setIsResizing(true);

    event.currentTarget.setPointerCapture(
      event.pointerId
    );
  }

  function handleResizeMove(event) {
    if (
      !resizeRef.current ||
      expanded
    ) {
      return;
    }

    const {
      direction,
      startX,
      startY,
      startLeft,
      startTop,
      startWidth,
      startHeight,
    } = resizeRef.current;

    const {
      viewportWidth,
      viewportHeight,
      minimumWidth,
      minimumHeight,
      marginX,
      marginY,
    } = getResizeLimits();

    const deltaX =
      event.clientX - startX;

    const deltaY =
      event.clientY - startY;

    let left = startLeft;
    let top = startTop;
    let width = startWidth;
    let height = startHeight;

    const rightBoundary =
      viewportWidth - marginX;

    const bottomBoundary =
      viewportHeight - marginY;

    if (direction.includes("e")) {
      width = Math.max(
        minimumWidth,
        Math.min(
          startWidth + deltaX,
          rightBoundary - startLeft
        )
      );
    }

    if (direction.includes("s")) {
      height = Math.max(
        minimumHeight,
        Math.min(
          startHeight + deltaY,
          bottomBoundary - startTop
        )
      );
    }

    if (direction.includes("w")) {
      const startRight =
        startLeft + startWidth;

      left = Math.max(
        marginX,
        Math.min(
          startLeft + deltaX,
          startRight -
            minimumWidth
        )
      );

      width = startRight - left;
    }

    if (direction.includes("n")) {
      const startBottom =
        startTop + startHeight;

      top = Math.max(
        marginY,
        Math.min(
          startTop + deltaY,
          startBottom -
            minimumHeight
        )
      );

      height = startBottom - top;
    }

    setFrame({
      left,
      top,
      width,
      height,
    });
  }

  function handleResizeEnd(event) {
    resizeRef.current = null;
    setIsResizing(false);

    if (
      event.currentTarget.hasPointerCapture(
        event.pointerId
      )
    ) {
      event.currentTarget.releasePointerCapture(
        event.pointerId
      );
    }
  }

  function getResizeHandlers(
    direction
  ) {
    return {
      onPointerDown: (event) =>
        handleResizeStart(
          event,
          direction
        ),
      onPointerMove: handleResizeMove,
      onPointerUp: handleResizeEnd,
      onPointerCancel:
        handleResizeEnd,
    };
  }

  function handleMinimize() {
    setExpanded(false);
    setMinimized(true);
  }

  function handleRestore() {
    setMinimized(false);
  }

  function handleExpandToggle() {
    if (expanded) {
      setExpanded(false);
      return;
    }

    setExpanded(true);
  }

  useEffect(() => {
    function handleViewportResize() {
      setFrame((current) => {
        if (!current) return current;

        const {
          viewportWidth,
          viewportHeight,
          minimumWidth,
          minimumHeight,
          marginX,
          marginY,
        } = getResizeLimits();

        const maxWidth =
          viewportWidth -
          marginX * 2;

        const maxHeight =
          viewportHeight -
          marginY * 2;

        const width = Math.min(
          Math.max(
            current.width,
            minimumWidth
          ),
          maxWidth
        );

        const height = Math.min(
          Math.max(
            current.height,
            minimumHeight
          ),
          maxHeight
        );

        const left = Math.min(
          Math.max(
            current.left,
            marginX
          ),
          viewportWidth -
            width -
            marginX
        );

        const top = Math.min(
          Math.max(
            current.top,
            marginY
          ),
          viewportHeight -
            height -
            marginY
        );

        return {
          left,
          top,
          width,
          height,
        };
      });
    }

    window.addEventListener(
      "resize",
      handleViewportResize
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleViewportResize
      );
    };
  }, []);

  async function handleSubmit(event) {
    event?.preventDefault();

    if (
      !title.trim() &&
      !content.trim() &&
      !activeMedia.trim()
    ) {
      toast.error(
        "Your note is empty."
      );
      return;
    }

    setLoading(true);

    try {
      const response =
        await axios.post(
          `${
            import.meta.env
              .VITE_BACKEND
          }/api/notes`,
          {
            title:
              title.trim() ||
              "Untitled",
            content:
              content.trim(),
            media:
              activeMedia.trim(),
            tags,
          }
        );

      toast.success("Note created");

      setShowCloseWarning(false);

      onCreated?.(response.data);
      onClose?.();
    } catch (error) {
      console.error(
        "Error creating note:",
        error
      );

      toast.error(
        "Couldn't create your note."
      );
    } finally {
      setLoading(false);
    }
  }

  const closeConfirmation = (
    <ConfirmDialog
      open={showCloseWarning}
      title="Save this note?"
      description="You have unsaved changes. Would you like to save them before closing?"
      confirmText="Save"
      cancelText="Keep editing"
      secondaryText="Discard"
      variant="warning"
      loading={loading}
      onCancel={() =>
        setShowCloseWarning(false)
      }
      onSecondary={handleDiscard}
      onConfirm={handleSubmit}
    />
  );

  if (minimized) {
    return (
      <>
        <div
          className="
            fixed bottom-3 left-3
            right-3 z-50
            sm:left-auto sm:right-4
            sm:w-1/2
            md:w-1/3
            lg:w-1/4
          "
        >
          <div
            className="
              flex items-center gap-2
              rounded-2xl
              border border-base-300
              bg-base-100
              p-2
              shadow-xl
            "
          >
            <button
              type="button"
              onClick={handleRestore}
              className="btn btn-ghost btn-circle btn-sm shrink-0"
              aria-label="Expand note"
            >
              <Expand size={17} />
            </button>

            <button
              type="button"
              onClick={handleRestore}
              className="min-w-0 flex-1 text-left"
            >
              <p className="truncate text-sm font-medium">
                {title.trim() ||
                  "Untitled"}
              </p>

              <p className="truncate text-xs text-base-content/40">
                {content.trim() ||
                  "New note"}
              </p>
            </button>

            <button
              type="button"
              onClick={handleRestore}
              className="btn btn-ghost btn-circle btn-sm"
              aria-label="Restore note"
            >
              <Minus size={17} />
            </button>

            <button
              type="button"
              onClick={
                handleCloseRequest
              }
              className="btn btn-ghost btn-circle btn-sm shrink-0"
              aria-label="Close note"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {closeConfirmation}
      </>
    );
  }

  const customFrameStyle =
    !expanded && frame
      ? {
          left: `${frame.left}px`,
          top: `${frame.top}px`,
          width: `${frame.width}px`,
          height: `${frame.height}px`,
          right: "auto",
          bottom: "auto",
        }
      : undefined;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/10"
        onClick={handleMinimize}
      />

      <form
        ref={composerRef}
        onSubmit={handleSubmit}
        style={customFrameStyle}
        className={`
          fixed z-50
          flex flex-col
          overflow-hidden
          border border-base-300
          bg-base-100
          shadow-2xl

          ${
            isResizing
              ? "select-none"
              : "transition-[inset,width,height,left,top,border-radius] duration-300"
          }

          ${
            expanded
              ? `
                inset-2
                rounded-2xl
                sm:inset-4
                md:inset-6
                md:rounded-3xl
              `
              : frame
                ? `
                  rounded-2xl
                  md:rounded-3xl
                `
                : `
                  bottom-3
                  left-3
                  right-3
                  h-[62dvh]
                  rounded-2xl

                  sm:left-auto
                  sm:right-4
                  sm:w-4/5

                  md:w-2/3
                  md:rounded-3xl

                  lg:w-1/2

                  xl:w-2/5
                `
          }
        `}
      >
        {!expanded && (
          <>
            <div
              {...getResizeHandlers(
                "n"
              )}
              className="
                absolute
                left-4 right-4 top-0
                z-30 h-2
                cursor-ns-resize
                touch-none
              "
            />

            <div
              {...getResizeHandlers(
                "s"
              )}
              className="
                absolute
                bottom-0 left-4 right-4
                z-30 h-2
                cursor-ns-resize
                touch-none
              "
            />

            <div
              {...getResizeHandlers(
                "w"
              )}
              className="
                absolute
                bottom-4 left-0 top-4
                z-30 w-2
                cursor-ew-resize
                touch-none
              "
            />

            <div
              {...getResizeHandlers(
                "e"
              )}
              className="
                absolute
                bottom-4 right-0 top-4
                z-30 w-2
                cursor-ew-resize
                touch-none
              "
            />

            <div
              {...getResizeHandlers(
                "nw"
              )}
              className="
                group
                absolute
                left-0 top-0
                z-40
                h-5 w-5
                cursor-nwse-resize
                touch-none
              "
            >
              <div
                className="
                  absolute
                  left-1.5 top-1.5
                  h-2.5 w-2.5
                  rounded-tl-md
                  border-l-2
                  border-t-2
                  border-base-content/15
                  transition-colors
                  group-hover:border-base-content/40
                "
              />
            </div>

            <div
              {...getResizeHandlers(
                "ne"
              )}
              className="
                absolute
                right-0 top-0
                z-40
                h-5 w-5
                cursor-nesw-resize
                touch-none
              "
            />

            <div
              {...getResizeHandlers(
                "sw"
              )}
              className="
                absolute
                bottom-0 left-0
                z-40
                h-5 w-5
                cursor-nesw-resize
                touch-none
              "
            />

            <div
              {...getResizeHandlers(
                "se"
              )}
              className="
                absolute
                bottom-0 right-0
                z-40
                h-5 w-5
                cursor-nwse-resize
                touch-none
              "
            />
          </>
        )}

        <div className="grid grid-cols-3 items-center px-4 pt-3 sm:px-6 sm:pt-4">
          <div className="flex justify-start">
            <button
              type="button"
              onClick={
                handleExpandToggle
              }
              className="btn btn-ghost btn-circle btn-sm"
              aria-label={
                expanded
                  ? "Restore note"
                  : "Expand note"
              }
            >
              {expanded ? (
                <Minimize2
                  size={18}
                />
              ) : (
                <Expand size={18} />
              )}
            </button>
          </div>

          <span className="text-center text-xs font-medium uppercase tracking-[0.12em] text-base-content/40">
            New note
          </span>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleMinimize}
              className="btn btn-ghost btn-circle btn-sm"
              aria-label="Minimize note"
            >
              <Minus size={19} />
            </button>

            <button
              type="button"
              onClick={
                handleCloseRequest
              }
              className="btn btn-ghost btn-circle btn-sm"
              aria-label="Close note"
            >
              <X size={19} />
            </button>
          </div>
        </div>

        <div
          className="
            flex min-h-0 flex-1
            flex-col
            overflow-y-auto
            px-5 pb-5 pt-4
            sm:px-7 sm:pb-6 sm:pt-5
          "
        >
          <input
            type="text"
            value={title}
            onChange={(event) =>
              setTitle(
                event.target.value
              )
            }
            placeholder="Untitled"
            className="
              w-full
              border-none
              bg-transparent
              font-serif
              text-2xl
              font-medium
              tracking-[-0.03em]
              outline-none
              placeholder:text-base-content/30
              sm:text-3xl
            "
          />

          <textarea
            value={content}
            onChange={(event) =>
              setContent(
                event.target.value
              )
            }
            placeholder="Write something, paste a link, or add media…"
            className="
              mt-4
              min-h-32
              w-full
              flex-1
              resize-none
              border-none
              bg-transparent
              text-base
              leading-7
              outline-none
              placeholder:text-base-content/35
              sm:mt-5
            "
          />

          {showMediaInput && (
            <div className="mt-4">
              <label className="input input-bordered flex w-full items-center gap-3 rounded-xl">
                <Link2
                  size={17}
                  className="text-base-content/40"
                />

                <input
                  type="url"
                  value={media}
                  onChange={(event) =>
                    setMedia(
                      event.target
                        .value
                    )
                  }
                  placeholder="Paste an image, video, audio, or link URL"
                  className="grow"
                  autoFocus
                />
              </label>
            </div>
          )}

          <MediaPreview
            media={activeMedia}
            onRemove={() =>
              setMedia("")
            }
          />
        </div>

        <div className="border-t border-base-300/70 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
              <div className="dropdown dropdown-top">
                <button
                  type="button"
                  tabIndex={0}
                  className="btn btn-ghost btn-square rounded-xl bg-base-200"
                  aria-label="Add attachment"
                >
                  <Plus size={19} />
                </button>

                <ul
                  tabIndex={0}
                  className="
                    menu dropdown-content
                    z-[60] mb-2
                    w-56
                    rounded-2xl
                    border border-base-300
                    bg-base-100
                    p-2
                    shadow-xl
                  "
                >
                  <li>
                    <button
                      type="button"
                      onClick={() =>
                        setShowMediaInput(
                          true
                        )
                      }
                    >
                      <Image
                        size={17}
                      />
                      Add media
                    </button>
                  </li>

                  <li>
                    <button
                      type="button"
                      onClick={() =>
                        setShowMediaInput(
                          true
                        )
                      }
                    >
                      <Link2
                        size={17}
                      />
                      Add link
                    </button>
                  </li>
                </ul>
              </div>

              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="badge badge-ghost gap-1 rounded-full"
                  >
                    #{tag}

                    <button
                      type="button"
                      onClick={() =>
                        setTags(
                          (
                            current
                          ) =>
                            current.filter(
                              (
                                item
                              ) =>
                                item !==
                                tag
                            )
                        )
                      }
                    >
                      ×
                    </button>
                  </span>
                ))}

                <label className="flex items-center gap-2 text-sm text-base-content/50">
                  <Tag size={16} />

                  <input
                    value={tagInput}
                    onChange={(
                      event
                    ) =>
                      setTagInput(
                        event.target
                          .value
                      )
                    }
                    onKeyDown={
                      handleTagKeyDown
                    }
                    onBlur={addTag}
                    placeholder="Add tags..."
                    className="w-24 bg-transparent outline-none placeholder:text-base-content/40"
                  />
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-neutral shrink-0 rounded-xl px-5"
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <>
                  Save
                  <ArrowUpRight
                    size={16}
                  />
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {closeConfirmation}
    </>
  );
}

export default NoteComposer;