import { useEffect, useRef, useState } from "react";

export default function ProcessingMedia({ status, progress = 0 }) {
  const previousStatus = useRef(status);
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    const wasProcessing = ["pending", "processing"].includes(previousStatus.current);
    previousStatus.current = status;

    if (status !== "completed" || !wasProcessing) {
      return;
    }

    setShowCompleted(true);
    const timer = window.setTimeout(() => setShowCompleted(false), 1500);
    return () => window.clearTimeout(timer);
  }, [status]);

  if (status === "failed") {
    return (
      <p className="mt-3 text-xs text-error" role="status">
        Media processing failed. Edit and save to retry.
      </p>
    );
  }

  const isProcessing = ["pending", "processing"].includes(status);
  if (!isProcessing && !(status === "completed" && showCompleted)) return null;

  const percentage = status === "completed"
    ? 100
    : Math.min(99, Math.max(0, Math.round(Number(progress) || 0)));

  return (
    <div className="mt-3 rounded-xl bg-base-200/60 px-3 py-2.5" role="status" aria-live="polite">
      <div className="mb-2 flex items-center justify-between gap-3 text-xs">
        <span className="flex items-center gap-2 font-medium text-base-content/70">
          {isProcessing && <span className="loading loading-spinner loading-xs text-primary" aria-hidden="true" />}
          {isProcessing ? "Processing Media" : "Media processed"}
        </span>
        <span className="tabular-nums text-base-content/55">{percentage}%</span>
      </div>
      <progress
        className="progress progress-primary h-1.5 w-full"
        value={percentage}
        max="100"
        aria-label={`Processing media ${percentage}%`}
      />
    </div>
  );
}
