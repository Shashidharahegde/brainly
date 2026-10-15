import { MessageSquareText } from "lucide-react";

// Route placeholder: replace the contents with your future chat interface.
// No chat API has been assumed or added.
export default function AskPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <MessageSquareText size={25} className="text-base-content/70" />
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Ask Your Notes
        </h1>
      </div>
      <p className="mt-3 max-w-xl text-sm text-base-content/60">
        This space is ready for a chat interface that lets you ask questions about
        your saved notes and ideas.
      </p>
    </main>
  );
}
