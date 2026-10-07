import React, { useEffect, useState } from "react";
// import Navbar from "../components/Navbar";
import axios from "axios";
import toast from "react-hot-toast";
import NoteCard from "./NoteCard";
import CreatePageModal from "./CreatePageModal";
import { PlusIcon } from "lucide-react";


function HomePage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isRateLimited, setIsRateLimited] = useState(false);

  const [isCreatingNote, setIsCreatingNote] = useState(false);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND}/api/notes`
        );

        setNotes(res.data);
      } catch (error) {
        console.error(error);

        // Normally rate limiting uses 429.
        if (error.response?.status === 429) {
          setIsRateLimited(true);
        } else {
          toast.error("Unable to load your notes.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);


  const handleNoteCreated = (newNote) => {
    /*
      Add the new note immediately instead of
      fetching every note from the backend again.
    */
    setNotes((currentNotes) => [
      newNote,
      ...currentNotes,
    ]);
  };

  return (
    <div className="min-h-screen bg-base-100">

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Recent Notes
            </h1>

            <p className="mt-1 text-sm text-base-content/50">
              Everything you've saved recently.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCreatingNote(true)}
            className="btn btn-neutral rounded-full px-5"
          >
            <PlusIcon size={17} />
            New Note
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex min-h-64 items-center justify-center">
            <span className="loading loading-spinner loading-md" />
          </div>
        )}

        {/* Rate limited */}
        {!loading && isRateLimited && (
          <div className="flex min-h-64 items-center justify-center">
            <p className="text-sm text-base-content/50">
              Too many requests. Please try again shortly.
            </p>
          </div>
        )}

        {/* Empty state */}
        {!loading &&
          !isRateLimited &&
          notes.length === 0 && (
            <div className="flex min-h-420px flex-col items-center justify-center text-center">
              <h2 className="text-lg font-semibold">
                No notes yet
              </h2>

              <p className="mt-2 max-w-sm text-sm text-base-content/50">
                Capture a thought, save a link, or add
                something you want to come back to.
              </p>

              <button
                type="button"
                onClick={() =>
                  setIsCreatingNote(true)
                }
                className="btn btn-neutral mt-5 rounded-full"
              >
                <PlusIcon size={17} />
                Create your first note
              </button>
            </div>
          )}

        {/* Notes */}

        {!loading &&
          !isRateLimited &&
          notes.length > 0 && (
            <div
              className="
                grid
                grid-cols-1
                gap-5
                sm:grid-cols-2
                lg:grid-cols-3
                xl:grid-cols-4
              "
            >
              {notes.map((note) => (
                <NoteCard
                  key={note._id}
                  note={note}
                />
              ))}
            </div>
          )}
      </main>

      {isCreatingNote && (
        <CreatePageModal
          onClose={() =>
            setIsCreatingNote(false)
          }
          onCreated={handleNoteCreated}
        />
      )}
    </div>
  );
}

export default HomePage;