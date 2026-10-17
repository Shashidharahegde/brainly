import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import {
  ArrowLeft,
  ArrowUp,
  BookOpen,
  ChevronRight,
  Copy,
  LoaderCircle,
  Menu,
  MessageCircle,
  Plus,
  Sparkles,
  X,
} from "lucide-react";

// Adjust these paths only if your Prompt Kit registry installed components elsewhere.
import {
  ChatContainerContent,
  ChatContainerRoot,
} from "../components/ui/chat-container";
import {
  Message,
  MessageAvatar,
  MessageContent,
} from "../components/ui/message";
import {
  PromptInput,
  PromptInputActions,
  PromptInputTextarea,
} from "../components/ui/prompt-input";
import { PromptSuggestion } from "../components/ui/prompt-suggestion";

const API_BASE = import.meta.env.VITE_BACKEND;

const SUGGESTIONS = [
  {
    label: "Summarize my notes",
    prompt: "Summarize the main ideas across my notes.",
  },
  {
    label: "Find key concepts",
    prompt: "What key concepts have I saved recently?",
  },
  {
    label: "Explain an idea",
    prompt: "Explain a concept from my notes in simple terms.",
  },
  {
    label: "Connect my research",
    prompt: "Find connections between the topics in my notes.",
  },
];

const newId = () => crypto.randomUUID();
const shortTitle = (value) =>
  value.length > 34 ? `${value.slice(0, 33).trim()}…` : value;

function getCreatedChatId(data) {
  // Match the shapes already supported by the original AskPage.
  const chat = data?.chat ?? data?.data?.chat ?? data;
  const id =
    chat?._id ??
    chat?.id ??
    data?.chatId ??
    data?.data?.chatId ??
    data?.data?._id ??
    data?.data?.id;

  return id == null ? null : String(id);
}

function getAssistantResponse(data) {
  // The supplied AskPage did not show the message route's response shape.
  // Accept common JSON shapes; throw instead of displaying an invented answer.
  const payload = data?.data ?? data;
  const candidates = [
    payload?.assistantMessage,
    payload?.aiMessage,
    payload?.assistant,
    payload?.answer,
    payload?.reply,
    payload?.response,
    payload?.result?.answer,
    payload?.message,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return { content: candidate, sources: payload?.sources ?? [] };
    }

    if (candidate && typeof candidate === "object") {
      // Do not accidentally render the saved user message as an AI reply.
      if (candidate.role && !["assistant", "model", "ai"].includes(candidate.role)) {
        continue;
      }

      const content = candidate.content ?? candidate.text ?? candidate.answer;
      if (typeof content === "string" && content.trim()) {
        return {
          content,
          sources: candidate.sources ?? payload?.sources ?? [],
        };
      }
    }
  }

  throw new Error(
    "The message was processed, but the server response did not contain recognizable assistant text. Check the message endpoint's JSON response before resending."
  );
}

function ChatSidebar({ threads, chatId, open, loading, onClose, onNew, onSelect }) {
  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close conversation sidebar"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-stone-900/35 backdrop-blur-[2px] md:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col border-r border-stone-200 bg-[#f8f7f4] transition-transform duration-200 md:static md:z-auto md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-[76px] shrink-0 items-center justify-between px-5">
          <Link to="/" className="flex items-center gap-2.5 text-stone-900">
            <span className="grid size-9 place-items-center rounded-xl bg-stone-900 text-white">
              <BookOpen size={18} strokeWidth={1.8} />
            </span>
            <span className="text-[15px] font-semibold tracking-[-0.03em]">Notes workspace</span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-200 md:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-4 pb-5 pt-2">
          <button
            type="button"
            onClick={onNew}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={16} /> New conversation
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3">
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.17em] text-stone-400">
            This session
          </p>
          {threads.length === 0 ? (
            <p className="px-3 py-3 text-xs leading-5 text-stone-400">
              Your conversations will appear here while this page is open.
            </p>
          ) : (
            <div className="space-y-1">
              {threads.map((thread) => (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => onSelect(thread)}
                  disabled={loading}
                  aria-current={chatId === thread.id ? "page" : undefined}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                    chatId === thread.id
                      ? "bg-white text-stone-900 shadow-sm ring-1 ring-stone-200"
                      : "text-stone-700 hover:bg-stone-200/60"
                  }`}
                >
                  <MessageCircle size={15} className="shrink-0 text-stone-400" />
                  <span className="truncate">{thread.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-stone-200 p-4">
          <div className="rounded-xl border border-stone-200 bg-white/70 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-700">
              <span className="size-1.5 rounded-full bg-emerald-500" /> Notes assistant
            </div>
            <p className="mt-1.5 text-[11px] leading-5 text-stone-500">
              Ask questions across your saved knowledge.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

function SourceChips({ sources }) {
  if (!Array.isArray(sources) || sources.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2" aria-label="Answer sources">
      {sources.map((source, index) => {
        if (!source || typeof source !== "object") return null;
        const title = source.title ?? source.noteTitle ?? `Source ${index + 1}`;
        const noteId = source.noteId;
        const common = "inline-flex max-w-full items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs text-stone-700 transition-colors hover:bg-stone-100";
        const label = (
          <><BookOpen size={12} /><span className="max-w-[200px] truncate">{title}</span></>
        );
        if (noteId) {
          return <Link key={index} to={`/note/${encodeURIComponent(String(noteId))}`} className={common}>{label}</Link>;
        }
        // Only accept safe HTTP(S) source links.
        let url = null;
        try {
          const parsed = new URL(source.url);
          if (["http:", "https:"].includes(parsed.protocol)) url = parsed.href;
        } catch { /* source without a link */ }
        return url ? (
          <a key={index} href={url} target="_blank" rel="noopener noreferrer" className={common}>{label}</a>
        ) : <span key={index} className={common}>{label}</span>;
      })}
    </div>
  );
}

function ChatMessage({ item, onCopy }) {
  const assistant = item.role === "assistant";
  return (
    <Message className={`w-full gap-3 ${assistant ? "justify-start" : "justify-end"}`}>
      {assistant && (
        <div className="mt-1 shrink-0">
          <MessageAvatar alt="Notes assistant" fallback="N" />
        </div>
      )}
      <div className={`min-w-0 ${assistant ? "w-full max-w-[720px]" : "max-w-[86%] sm:max-w-[76%]"}`}>
        {assistant ? (
          <>
            <MessageContent
              markdown
              className="!w-full !max-w-none !rounded-none !border-0 !bg-transparent !p-0 !text-[14px] !leading-7 !text-stone-800"
            >
              {item.content}
            </MessageContent>
            <SourceChips sources={item.sources} />
            <button
              type="button"
              onClick={() => onCopy(item.content)}
              aria-label="Copy answer"
              title="Copy answer"
              className="mt-2 rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
            >
              <Copy size={14} />
            </button>
          </>
        ) : (
          <>
            <MessageContent className="!rounded-2xl !rounded-tr-md !border-0 !bg-[#f1f0ed] !px-4 !py-3 !text-[14px] !leading-6 !text-stone-900 whitespace-pre-wrap break-words">
              {item.content}
            </MessageContent>
            {item.status === "uncertain" && (
              <p className="mt-1.5 text-right text-xs text-amber-700">Delivery unconfirmed</p>
            )}
            {item.status === "rejected" && (
              <p className="mt-1.5 text-right text-xs text-red-600">Not accepted by server</p>
            )}
          </>
        )}
      </div>
    </Message>
  );
}

export default function AskPage() {
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [threads, setThreads] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const submittingRef = useRef(false);

  // Sidebar history is only an in-memory display cache. MongoDB is the source of truth.
  useEffect(() => {
    if (!chatId) return;
    setThreads((current) => {
      const index = current.findIndex((thread) => thread.id === chatId);
      const firstQuestion = messages.find((item) => item.role === "user")?.content;
      const title = shortTitle(firstQuestion || "New conversation");
      if (index >= 0) {
        return current.map((thread) =>
          thread.id === chatId
            ? {
                ...thread,
                title: thread.title === "New conversation" ? title : thread.title,
                messages,
              }
            : thread
        );
      }
      return [{ id: chatId, title, messages }, ...current];
    });
  }, [chatId, messages]);

  function newConversation() {
    if (submittingRef.current) return;
    setChatId(null);
    setMessages([]);
    setMessage("");
    setError(null);
    setSidebarOpen(false);
  }

  function selectConversation(thread) {
    if (submittingRef.current) return;
    setChatId(thread.id);
    setMessages(thread.messages);
    setMessage("");
    setError(null);
    setSidebarOpen(false);
  }

  async function handleQuery(event, suggestedText) {
    event?.preventDefault?.();
    const query = (suggestedText ?? message).trim();
    if (!query || submittingRef.current) return;

    // Ref lock is immediate, preventing double submits before React re-renders.
    submittingRef.current = true;
    setLoading(true);
    setError(null);

    let currentChatId = chatId;
    let userMessageId = null;
    let stage = "create";

    try {
      if (!currentChatId) {
        const { data } = await axios.post(`${API_BASE}/api/chat`, {
          query: query.slice(0, 60),
        });

        currentChatId = getCreatedChatId(data);
        if (!currentChatId) {
          throw new Error("Chat created, but the API did not return a chat ID.");
        }
        setChatId(currentChatId);
      }

      // The chat now exists, so it is safe to show the user's message.
      stage = "send";
      userMessageId = newId();
      setMessages((current) => [...current, {
        id: userMessageId,
        role: "user",
        content: query,
        status: "sending",
      }]);
      setMessage("");

      // Server loads history itself: do not send local messages/history.
      const { data } = await axios.post(
        `${API_BASE}/api/chat/${encodeURIComponent(currentChatId)}/messages`,
        { query }
      );

      const reply = getAssistantResponse(data);
      setMessages((current) => [
        ...current.map((item) =>
          item.id === userMessageId ? { ...item, status: "sent" } : item
        ),
        {
          id: newId(),
          role: "assistant",
          content: reply.content,
          sources: reply.sources,
        },
      ]);
    } catch (err) {
      console.error(`Chat ${stage} failed:`, err);
      const status = err.response?.status;
      const serverMessage = err.response?.data?.message;

      if (stage === "create") {
        setError({
          phase: "create",
          message: serverMessage || err.message || "Couldn't create a conversation.",
          note: "If the request timed out, the chat may still have been created on the server.",
        });
      } else {
        // A 2xx response with unrecognized JSON, a timeout, or a 5xx
        // may have saved the message. Never automatically POST it again.
        const rejected = status >= 400 && status < 500;
        setMessages((current) => current.map((item) =>
          item.id === userMessageId
            ? { ...item, status: rejected ? "rejected" : "uncertain" }
            : item
        ));
        setError({
          phase: "send",
          message: serverMessage || err.message || "Couldn't receive the assistant response.",
          note: rejected
            ? "The server rejected this request. Check the error before writing another message."
            : "The server may have saved this message. Verify its status before sending the same question again.",
        });
      }
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  }

  async function copyAnswer(content) {
    try {
      await navigator.clipboard.writeText(content);
    } catch {
      setError({ message: "Couldn't copy the answer." });
    }
  }

  const currentThread = threads.find((thread) => thread.id === chatId);
  const currentTitle = currentThread?.title || shortTitle(messages.find((item) => item.role === "user")?.content || "Ask your notes");

  return (
    <div className="flex h-[100dvh] min-h-[480px] w-full overflow-hidden bg-[#fdfcfb] text-stone-900 antialiased">
      <ChatSidebar
        threads={threads}
        chatId={chatId}
        open={sidebarOpen}
        loading={loading}
        onClose={() => setSidebarOpen(false)}
        onNew={newConversation}
        onSelect={selectConversation}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[76px] shrink-0 items-center justify-between border-b border-stone-100 bg-white/80 px-4 backdrop-blur-md sm:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-stone-600 hover:bg-stone-100 md:hidden"
              aria-label="Open conversations"
            >
              <Menu size={19} />
            </button>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold tracking-tight">{currentTitle}</div>
              <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-stone-500">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Knowledge assistant
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="hidden items-center gap-1.5 rounded-full border border-stone-200 px-3 py-2 text-xs font-medium text-stone-600 transition-colors hover:bg-stone-50 sm:flex"
            >
              <ArrowLeft size={14} /> All notes
            </Link>
            <button
              type="button"
              onClick={newConversation}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-2 text-xs font-medium shadow-sm transition-colors hover:bg-stone-50 disabled:opacity-50"
            >
              <Plus size={15} /> <span className="hidden sm:inline">New chat</span>
            </button>
          </div>
        </header>

        <ChatContainerRoot className="min-h-0 flex-1">
          <ChatContainerContent className="mx-auto flex w-full max-w-[860px] flex-col gap-7 px-4 pb-8 pt-8 sm:px-8 sm:pt-12">
            {messages.length === 0 ? (
              <div className="flex min-h-[min(58vh,540px)] flex-col items-center justify-center py-10 text-center">
                <div className="mb-7 grid size-[70px] place-items-center rounded-[24px] border border-stone-200 bg-white shadow-[0_12px_35px_rgba(68,57,45,0.07)]">
                  <Sparkles size={29} strokeWidth={1.6} className="text-stone-700" />
                </div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.19em] text-stone-400">Your personal knowledge space</p>
                <h1 className="max-w-lg text-[30px] font-semibold tracking-[-0.045em] sm:text-[38px]">
                  What would you like to explore?
                </h1>
                <p className="mt-3 max-w-md text-sm leading-6 text-stone-500">
                  Ask questions, revisit ideas, and find connections across the notes you have collected.
                </p>
                <div className="mt-9 grid w-full max-w-[590px] grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {SUGGESTIONS.map((item) => (
                    <PromptSuggestion
                      key={item.label}
                      disabled={loading}
                      onClick={() => handleQuery(null, item.prompt)}
                      className="!justify-between !rounded-xl !border !border-stone-200 !bg-white !px-4 !py-3 !text-left !text-[13px] !text-stone-700 shadow-sm transition-all hover:!-translate-y-0.5 hover:!border-stone-300 hover:!bg-stone-50 motion-reduce:transform-none"
                    >
                      {item.label}<ChevronRight size={14} className="ml-2 text-stone-400" />
                    </PromptSuggestion>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((item) => <ChatMessage key={item.id} item={item} onCopy={copyAnswer} />)}
                {loading && (
                  <div className="flex items-center gap-3 pl-1 text-sm text-stone-500" role="status" aria-live="polite">
                    <span className="grid size-8 place-items-center rounded-full bg-stone-900 text-white"><Sparkles size={14} /></span>
                    <LoaderCircle size={15} className="animate-spin" /> Searching your notes…
                  </div>
                )}
              </>
            )}

            {error && (
              <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                <p>{error.message}</p>
                {error.note && <p className="mt-1 text-xs text-red-700/80">{error.note}</p>}
              </div>
            )}
          </ChatContainerContent>
        </ChatContainerRoot>

        <div className="shrink-0 border-t border-stone-100 bg-white/95 px-3 pb-4 pt-3 sm:px-8 sm:pb-5">
          <div className="mx-auto max-w-[800px]">
            <PromptInput
              value={message}
              onValueChange={setMessage}
              onSubmit={handleQuery}
              disabled={loading}
              isLoading={loading}
              maxHeight={200}
              className="!rounded-[22px] !border !border-stone-200 !bg-white !p-2 shadow-[0_8px_32px_rgba(34,30,26,0.06)] focus-within:!border-stone-400"
            >
              <PromptInputTextarea
                className="!min-h-[54px] !text-sm !text-stone-900 placeholder:!text-stone-400"
                placeholder="Ask a question about your notes…"
              />
              <PromptInputActions className="items-center justify-between px-2 pb-1 pt-1">
                <span className="text-[11px] text-stone-400">Enter to send · Shift + Enter for newline</span>
                <button
                  type="button"
                  onClick={handleQuery}
                  disabled={loading || !message.trim()}
                  aria-label="Send message"
                  className="grid size-9 shrink-0 place-items-center rounded-full bg-stone-900 text-white transition-all enabled:hover:-translate-y-0.5 enabled:hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-35 motion-reduce:transform-none"
                >
                  {loading ? <LoaderCircle size={17} className="animate-spin" /> : <ArrowUp size={17} />}
                </button>
              </PromptInputActions>
            </PromptInput>
            <p className="mt-2.5 text-center text-[11px] leading-5 text-stone-400">
              Answers may be incomplete. Check the original note sources.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}




// import axios from "axios";
// import { useState } from "react";
// import { useNavigate } from "react-router";

// const API_BASE = import.meta.env.VITE_BACKEND

// const suggestions = [
//   {
//     title: "Explain a concept",
//     prompt: "Explain a concept from my notes in simple terms.",
//     icon: "✳",
//   },
//   {
//     title: "Find connections",
//     prompt: "Find connections between the topics in my notes.",
//     icon: "⌘",
//   },
//   {
//     title: "Summarize my learning",
//     prompt: "Summarize the most important ideas from my notes.",
//     icon: "↗",
//   },
// ];

// function AskPage() {
//   const [message, setMessage] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const navigate = useNavigate();

//   async function handleQuery(event) {
//     event.preventDefault();

//     const query = message.trim();

//     if (!query || loading) return;

//     setLoading(true);
//     setError("");

//     try {
//       // 1. Create a new chat.
//       const createResult = await axios.post(`${API_BASE}/api/chat`, {
//         query: query.slice(0, 60),
//       });

//       // Support common API response shapes.
//       const chat =
//         createResult.data?.chat ??
//         createResult.data?.data?.chat ??
//         createResult.data;

//       const chatId =
//         chat?._id ??
//         chat?.id ??
//         createResult.data?.chatId;

//       if (!chatId) {
//         throw new Error(
//           "The chat was created, but its ID was not returned by the API."
//         );
//       }

//       // 2. Send the first message to this chat.
//       await axios.post(
//         `${API_BASE}/api/chat/${chatId}/messages`,
//         { query }
//       );

//       // 3. Open the conversation.
//       navigate(`/chat/${chatId}/messages`);
//     } catch (err) {
//       console.error("Failed to start chat:", err);

//       setError(
//         err.response?.data?.message ||
//           err.message ||
//           "Something went wrong. Please try again."
//       );
//     } finally {
//       setLoading(false);
//     }
//   }

//   function selectSuggestion(prompt) {
//     setMessage(prompt);
//     setError("");
//   }

//   return (
//     <main className="relative flex min-h-screen flex-col overflow-hidden bg-[#0b0d10] text-white">
//       {/* Background accents */}
//       <div
//         aria-hidden="true"
//         className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[700px] -translate-x-1/2 rounded-full bg-amber-400/[0.07] blur-[120px]"
//       />

//       {/* Navigation */}
//       <header className="relative z-10 border-b border-white/[0.08]">
//         <nav className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-5 sm:px-8">
//           <a href="/" className="flex items-center gap-3">
//             <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400 font-bold text-black">
//               b.
//             </span>

//             <span className="text-lg font-semibold tracking-tight">
//               brainly
//             </span>
//           </a>

//           <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-zinc-400 sm:flex">
//             <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
//             Your personal knowledge space
//           </div>
//         </nav>
//       </header>

//       {/* Main content */}
//       <section className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-5 py-16 sm:px-8 sm:py-20">
//         <div className="mx-auto w-full max-w-3xl">
//           {/* Hero */}
//           <div className="mb-10 text-center">
//             <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/[0.07] px-3.5 py-2 text-xs font-medium tracking-wide text-amber-200">
//               <span>✳</span>
//               THINK WITH YOUR OWN KNOWLEDGE
//             </div>

//             <h1 className="text-4xl font-semibold leading-[1.15] tracking-tight sm:text-5xl md:text-6xl">
//               Your thoughts,
//               <br />
//               <span className="text-amber-300">
//                 connected.
//               </span>
//             </h1>

//             <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-zinc-400 sm:text-base">
//               Ask questions, revisit what you have learned, and
//               uncover connections across your saved notes.
//             </p>
//           </div>

//           {/* Query composer */}
//           <form
//             onSubmit={handleQuery}
//             className="group rounded-2xl border border-white/[0.12] bg-[#14171c] p-3 shadow-2xl shadow-black/20 transition-colors focus-within:border-amber-300/40 sm:p-4"
//           >
//             <label htmlFor="ask-query" className="sr-only">
//               Ask a question about your notes
//             </label>

//             <textarea
//               id="ask-query"
//               rows={3}
//               placeholder="Ask anything about what you've saved..."
//               value={message}
//               onChange={(event) => setMessage(event.target.value)}
//               onKeyDown={(event) => {
//                 if (
//                   event.key === "Enter" &&
//                   !event.shiftKey &&
//                   !event.nativeEvent.isComposing
//                 ) {
//                   event.preventDefault();
//                   event.currentTarget.form?.requestSubmit();
//                 }
//               }}
//               disabled={loading}
//               className="w-full resize-none bg-transparent px-3 py-3 text-base leading-7 text-white outline-none placeholder:text-zinc-600 disabled:opacity-60 sm:px-4"
//             />

//             <div className="flex items-center justify-between gap-3 border-t border-white/[0.08] pt-3">
//               <span className="hidden pl-3 text-xs text-zinc-500 sm:inline">
//                 Your notes + conversation context
//               </span>

//               <span className="pl-3 text-xs text-zinc-500 sm:hidden">
//                 Shift + Enter for a new line
//               </span>

//               <button
//                 type="submit"
//                 disabled={!message.trim() || loading}
//                 className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-300 px-5 py-3 text-sm font-semibold text-black transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:bg-amber-300/30 disabled:text-zinc-500"
//               >
//                 {loading ? (
//                   <>
//                     <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
//                     Starting...
//                   </>
//                 ) : (
//                   <>
//                     Ask Brainly
//                     <span aria-hidden="true">↗</span>
//                   </>
//                 )}
//               </button>
//             </div>
//           </form>

//           {error && (
//             <div
//               role="alert"
//               className="mt-4 rounded-xl border border-red-400/20 bg-red-400/[0.07] px-4 py-3 text-sm leading-6 text-red-300"
//             >
//               {error}
//             </div>
//           )}

//           {/* Suggested prompts */}
//           <div className="mt-10">
//             <p className="mb-4 text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
//               A few ways to get started
//             </p>

//             <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
//               {suggestions.map((suggestion) => (
//                 <button
//                   key={suggestion.title}
//                   type="button"
//                   onClick={() => selectSuggestion(suggestion.prompt)}
//                   disabled={loading}
//                   className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-left transition hover:border-amber-300/25 hover:bg-amber-300/[0.04] disabled:cursor-not-allowed disabled:opacity-50"
//                 >
//                   <span className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-lg text-amber-300">
//                     {suggestion.icon}
//                   </span>

//                   <span className="block text-sm font-medium text-zinc-200">
//                     {suggestion.title}
//                   </span>

//                   <span className="mt-2 block text-xs leading-5 text-zinc-500">
//                     {suggestion.prompt}
//                   </span>
//                 </button>
//               ))}
//             </div>
//           </div>

//           <p className="mt-8 text-center text-xs leading-5 text-zinc-600">
//             Answers can use relevant saved notes and previous messages
//             from your conversation.
//           </p>
//         </div>
//       </section>

//       <footer className="relative z-10 border-t border-white/[0.06] px-5 py-5 text-center text-xs text-zinc-600">
//         A little more connected, every day.
//       </footer>
//     </main>
//   );
// }

// export default AskPage;
