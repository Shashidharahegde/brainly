import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import axios from "axios";
import toast from "react-hot-toast";
import NoteCard from "./NoteCard";
import { Button } from "../components/Button";
import { PlusIcon } from "lucide-react";

function HomePage() {
  //fetch notes
  const [notes, setNotes] = useState([]);
  const [loading, isLoading] = useState(true);

  //rateLimit
  const [isRateLimited, setIsRateLimited] = useState(false);

  //fetch

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/notes");
        setNotes(res.data);
        console.log(res.data);
      } catch (error) {
        console.log(error);
        if (error.response?.status === 439) {
          setIsRateLimited = true;
        } else {
          toast.error("Too many requests");
        }
      } finally {
        isLoading(false);
      }
    };

    fetchNotes();
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="max-w-7xl mx-auto p-4 mt-6">
        {loading && (
          <div className="text-center text-xl text-primary">
            Loading Notes...
          </div>
        )}

        {!loading && notes.length === 0 && !isRateLimited && (
          <div className="text-center text-xl text-primary">
            No notes found
            <div className="p-4">
              <Button
                link="/create"
                text="Create Note"
                icon={PlusIcon}
              ></Button>
            </div>
          </div>
        )}

        {notes.length > 1 && !isRateLimited && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            {notes.map((note) => (
              <NoteCard key={note._id} note={note} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;
