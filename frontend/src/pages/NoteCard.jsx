import { PenSquareIcon, Trash2 } from "lucide-react";
import { Link } from "react-router";

const NoteCard = ({ note, onClick }) => {
  const {
    title,
    content,
    media,
    tags = [],
    createdAt,
  } = note;

  const formattedDate = createdAt
    ? new Intl.DateTimeFormat("en", {
        day: "numeric",
        month: "short",
      }).format(new Date(createdAt))
    : null;

  return (
    <Link to={`/note/${note._id}`}
      className="
        group cursor-pointer overflow-hidden
        rounded-2xl border border-base-300
        bg-base-100
        transition-all duration-200
        hover:border-base-content/20
        hover:shadow-sm
      "
    >
      {/* Media */}
      {media && (
        <div className="overflow-hidden border-b border-base-300">
          <img
            src={media}
            alt={title}
            className="
              max-h-64 w-full
              object-cover
              transition-transform duration-300
              group-hover:scale-[1.01]
            "
          />
        </div>
      )}

      <div className="p-5">
        {/* Top tags */}
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

        {/* Title */}
        <h3
          className="
            text-[17px] font-semibold
            leading-snug tracking-[-0.015em]
            text-base-content
          "
        >
          {title}
        </h3>

        {/* Content */}
        <p
          className="
            mt-2 line-clamp-4
            text-sm leading-6
            text-base-content/60
          "
        >
          {content}
        </p>

        {/* Date */}
        {formattedDate && (
          <div className="mt-5 text-xs text-base-content/40">
            {formattedDate}
          </div>
        )}
        <div className="flex iteams-center gap-1">
            <PenSquareIcon className="size-4"/>
            <button>
                <Trash2 className="size-4" />
            </button>
        </div>
      </div>
    </Link>
  );
};

export default NoteCard;