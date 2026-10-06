import axios from "axios";
import React, { useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

import {
  ArrowUpRight,
  Expand,
  Image,
  Link2,
  Minimize2,
  Plus,
  Tag,
  X,
} from "lucide-react";

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

function MediaPreview({ media, onRemove }) {
  const type = getMediaType(media);

  if (!media || !type) return null;

  const youtubeId =
    type === "youtube" ? getYouTubeId(media) : null;

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
          className="max-h-420px w-full object-cover"
        />
      )}

      {type === "video" && (
        <video
          src={media}
          controls
          className="max-h-420px w-full bg-black"
        />
      )}

      {type === "audio" && (
        <div className="p-6">
          <audio src={media} controls className="w-full" />
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

// function NoteComposer({ onClose, onCreated }) {
//   const [title, setTitle] = useState("");
//   const [content, setContent] = useState("");
//   const [media, setMedia] = useState("");

//   const [tags, setTags] = useState([]);
//   const [tagInput, setTagInput] = useState("");

//   const [showMediaInput, setShowMediaInput] =
//     useState(false);

//   const [expanded, setExpanded] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const detectedContentUrl = useMemo(() => {
//     const urls = content.match(/https?:\/\/[^\s]+/g);

//     if (!urls?.length) return "";

//     return urls[0];
//   }, [content]);

//   const activeMedia = media || detectedContentUrl;

//   function addTag() {
//     const cleaned = tagInput
//       .trim()
//       .replace(/^#/, "")
//       .toLowerCase();

//     if (!cleaned) return;

//     if (!tags.includes(cleaned)) {
//       setTags((current) => [...current, cleaned]);
//     }

//     setTagInput("");
//   }

//   function handleTagKeyDown(event) {
//     if (event.key === "Enter" || event.key === ",") {
//       event.preventDefault();
//       addTag();
//     }
//   }

//   async function handleSubmit(event) {
//     event.preventDefault();

//     if (!title.trim() && !content.trim() && !media.trim()) {
//       toast.error("Your note is empty.");
//       return;
//     }

//     setLoading(true);

//     try {
//       const response = await axios.post(`${import.meta.env.VITE_BACKEND}/api/notes`,
//         {
//           title: title.trim() || "Untitled",
//           content: content.trim(),
//           media: media.trim(),
//           tags,

//         }
//       );

//       toast.success("Note created");

//       onCreated?.(response.data);
//       onClose?.();
//     } catch (error) {
//       console.error("Error creating note:", error);

//       toast.error("Couldn't create your note.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <>
//       <div
//         className="fixed inset-0 z-40 bg-black/10 ]"
//         onClick={onClose}
//       />
//       <form
//         onSubmit={handleSubmit}
//         className={`
//           fixed z-50
//           flex flex-col
//           border border-base-300
//           bg-base-100
//           shadow-2xl
//           transition-all
//           duration-600

//           ${
//             expanded
//               ? "inset-4 rounded-3xl md:inset-8 lg:inset-12"
//               : `
//                 bottom-5 left-4 right-4
//                 min-h-420px
//                 rounded-3xl
//                 md:left-auto
//                 md:right-8
//                 md:w-560px
//               `
//           }
//         `}
//       >
//         {/* Small visual handle */}
//         <div className="flex justify-center pt-3">
//           <div className="h-1 w-8 rounded-full bg-base-content/20" />
//         </div>

//         {/* Header */}
//         <div className="flex items-center justify-between px-6 pt-3">
//           <span className="text-xs font-medium uppercase tracking-[0.12em] text-base-content/40">
//             New note
//           </span>

//           <div className="flex items-center gap-1">
//             <button
//               type="button"
//               onClick={() => setExpanded((value) => !value)}
//               className="btn btn-ghost btn-circle btn-sm"
//               aria-label={
//                 expanded ? "Minimize note" : "Expand note"
//               }
//             >
//               {expanded ? (
//                 <Minimize2 size={18} />
//               ) : (
//                 <Expand size={18} />
//               )}
//             </button>

//             <button
//               type="button"
//               onClick={onClose}
//               className="btn btn-ghost btn-circle btn-sm"
//               aria-label="Close note"
//             >
//               <X size={19} />
//             </button>
//           </div>
//         </div>

//         {/* Main editor */}
//         <div className="flex-1 overflow-y-auto px-7 pb-6 pt-5">
//           <input
//             type="text"
//             value={title}
//             onChange={(event) =>
//               setTitle(event.target.value)
//             }
//             placeholder="Untitled"
//             className="
//               w-full border-none bg-transparent
//               font-serif text-3xl font-medium
//               tracking-[-0.03em]
//               outline-none
//               placeholder:text-base-content/30
//             "
//           />

//           <textarea
//             value={content}
//             onChange={(event) =>
//               setContent(event.target.value)
//             }
//             placeholder="Write something, paste a link, or add media…"
//             className="
//               mt-5 min-h-[160px] w-full
//               resize-none border-none
//               bg-transparent
//               text-[16px] leading-7
//               outline-none
//               placeholder:text-base-content/35
//             "
//           />

//           {showMediaInput && (
//             <div className="mt-4">
//               <label className="input input-bordered flex items-center gap-3 rounded-xl">
//                 <Link2
//                   size={17}
//                   className="text-base-content/40"
//                 />

//                 <input
//                   type="url"
//                   value={media}
//                   onChange={(event) =>
//                     setMedia(event.target.value)
//                   }
//                   placeholder="Paste an image, video, audio, or link URL"
//                   className="grow"
//                   autoFocus
//                 />
//               </label>
//             </div>
//           )}

//           <MediaPreview
//             media={activeMedia}
//             onRemove={() => setMedia("")}
//           />
//         </div>

//         {/* Footer */}
//         <div className="border-t border-base-300/70 px-6 py-4">
//           <div className="flex flex-wrap items-center justify-between gap-3">
//             <div className="flex flex-wrap items-center gap-2">
//               {/* Add attachment */}
//               <div className="dropdown dropdown-top">
//                 <button
//                   type="button"
//                   tabIndex={0}
//                   className="btn btn-ghost btn-square rounded-xl bg-base-200"
//                   aria-label="Add attachment"
//                 >
//                   <Plus size={19} />
//                 </button>

//                 <ul
//                   tabIndex={0}
//                   className="
//                     menu dropdown-content
//                     z-60 mb-2 w-56
//                     rounded-2xl border
//                     border-base-300
//                     bg-base-100 p-2
//                     shadow-xl
//                   "
//                 >
//                   <li>
//                     <button
//                       type="button"
//                       onClick={() =>
//                         setShowMediaInput(true)
//                       }
//                     >
//                       <Image size={17} />
//                       Add media
//                     </button>
//                   </li>

//                   <li>
//                     <button
//                       type="button"
//                       onClick={() =>
//                         setShowMediaInput(true)
//                       }
//                     >
//                       <Link2 size={17} />
//                       Add link
//                     </button>
//                   </li>
//                 </ul>
//               </div>

//               {/* Tags */}
//               <div className="flex flex-wrap items-center gap-2">
//                 {tags.map((tag) => (
//                   <span
//                     key={tag}
//                     className="badge badge-ghost gap-1 rounded-full"
//                   >
//                     #{tag}

//                     <button
//                       type="button"
//                       onClick={() =>
//                         setTags((current) =>
//                           current.filter(
//                             (item) => item !== tag
//                           )
//                         )
//                       }
//                     >
//                       ×
//                     </button>
//                   </span>
//                 ))}

//                 <label className="flex items-center gap-2 text-sm text-base-content/50">
//                   <Tag size={16} />

//                   <input
//                     value={tagInput}
//                     onChange={(event) =>
//                       setTagInput(event.target.value)
//                     }
//                     onKeyDown={handleTagKeyDown}
//                     onBlur={addTag}
//                     placeholder="Add tags..."
//                     className="w-24 bg-transparent outline-none placeholder:text-base-content/40"
//                   />
//                 </label>
//               </div>
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className="btn btn-neutral rounded-xl px-5"
//             >
//               {loading ? (
//                 <span className="loading loading-spinner loading-sm" />
//               ) : (
//                 <>
//                   Save
//                   <ArrowUpRight size={16} />
//                 </>
//               )}
//             </button>
//           </div>
//         </div>
//       </form>
//     </>
//   );
// }

function NoteComposer({ onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [media, setMedia] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [height, setHeight] = useState(62);

  const resizeRef = useRef(null);

  const detectedContentUrl = useMemo(() => {
    const urls = content.match(/https?:\/\/[^\s]+/g);

    if (!urls?.length) return "";

    return urls[0];
  }, [content]);

  const activeMedia = media || detectedContentUrl;

  function addTag() {
    const cleaned = tagInput
      .trim()
      .replace(/^#/, "")
      .toLowerCase();

    if (!cleaned) return;

    if (!tags.includes(cleaned)) {
      setTags((current) => [...current, cleaned]);
    }

    setTagInput("");
  }

  function handleTagKeyDown(event) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag();
    }
  }

  function handleResizeStart(event) {
    if (expanded) return;

    resizeRef.current = {
      startY: event.clientY,
      startHeight: height,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleResizeMove(event) {
    if (!resizeRef.current || expanded) return;

    const viewportHeight = window.innerHeight;

    const delta =
      ((resizeRef.current.startY - event.clientY) /
        viewportHeight) *
      100;

    const nextHeight =
      resizeRef.current.startHeight + delta;

    setHeight(Math.min(90, Math.max(38, nextHeight)));
  }

  function handleResizeEnd(event) {
    resizeRef.current = null;

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

  function handleMinimize() {
    setExpanded(false);
    setMinimized(true);
  }

  function handleRestore() {
    setMinimized(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (
      !title.trim() &&
      !content.trim() &&
      !media.trim()
    ) {
      toast.error("Your note is empty.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND}/api/notes`,
        {
          title: title.trim() || "Untitled",
          content: content.trim(),
          media: media.trim(),
          tags,
        }
      );

      toast.success("Note created");

      onCreated?.(response.data);
      onClose?.();
    } catch (error) {
      console.error("Error creating note:", error);

      toast.error("Couldn't create your note.");
    } finally {
      setLoading(false);
    }
  }

  if (minimized) {
    return (
      <div
        className="
          fixed bottom-4 left-3 right-3 z-50
          sm:left-auto sm:right-4 sm:w-1/2
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
              {title.trim() || "Untitled"}
            </p>

            <p className="truncate text-xs text-base-content/40">
              {content.trim() || "New note"}
            </p>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-circle btn-sm shrink-0"
            aria-label="Close note"
          >
            <X size={17} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/10"
        onClick={handleMinimize}
      />

      <form
        onSubmit={handleSubmit}
        style={
          expanded
            ? undefined
            : {
                height: `${height}vh`,
              }
        }
        className={`
          fixed z-50
          flex flex-col
          overflow-hidden
          border border-base-300
          bg-base-100
          shadow-2xl
          transition-[inset,width,border-radius]
          duration-300

          ${
            expanded
              ? `
                inset-2
                rounded-2xl
                sm:inset-4
                md:inset-6
                md:rounded-3xl
              `
              : `
                bottom-3 left-3 right-3
                rounded-2xl
                sm:left-auto
                sm:right-4
                sm:w-4/5
                md:w-2/3
                lg:w-1/2
                xl:w-2/5
                md:rounded-3xl
              `
          }
        `}
      >
        {!expanded && (
          <div
            onPointerDown={handleResizeStart}
            onPointerMove={handleResizeMove}
            onPointerUp={handleResizeEnd}
            onPointerCancel={handleResizeEnd}
            className="
              group
              flex cursor-ns-resize
              touch-none select-none
              justify-center
              py-2
            "
          >
            <div
              className="
                h-1 w-10
                rounded-full
                bg-base-content/20
                transition-all
                group-hover:w-14
                group-hover:bg-base-content/35
              "
            />
          </div>
        )}

        <div
          className="
            grid grid-cols-3
            items-center
            px-4
            sm:px-6
          "
        >
          <div className="flex justify-start">
            <button
              type="button"
              onClick={() =>
                setExpanded((value) => !value)
              }
              className="btn btn-ghost btn-circle btn-sm"
              aria-label={
                expanded
                  ? "Restore note"
                  : "Expand note"
              }
            >
              {expanded ? (
                <Minimize2 size={18} />
              ) : (
                <Expand size={18} />
              )}
            </button>
          </div>

          <span
            className="
              text-center
              text-xs font-medium
              uppercase
              tracking-[0.12em]
              text-base-content/40
            "
          >
            New note
          </span>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
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
              setTitle(event.target.value)
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
              setContent(event.target.value)
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
                    setMedia(event.target.value)
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
            onRemove={() => setMedia("")}
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
                        setShowMediaInput(true)
                      }
                    >
                      <Image size={17} />
                      Add media
                    </button>
                  </li>

                  <li>
                    <button
                      type="button"
                      onClick={() =>
                        setShowMediaInput(true)
                      }
                    >
                      <Link2 size={17} />
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
                        setTags((current) =>
                          current.filter(
                            (item) => item !== tag
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
                    onChange={(event) =>
                      setTagInput(event.target.value)
                    }
                    onKeyDown={handleTagKeyDown}
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
                  <ArrowUpRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}

export default NoteComposer;