import {
  AlertTriangle,
  CircleAlert,
  Info,
} from "lucide-react";

function ConfirmDialog({
  open,
  title = "Are you sure?",
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  const variants = {
    default: {
      icon: Info,
      iconClass: "bg-base-200 text-base-content",
      buttonClass: "btn-neutral",
    },

    warning: {
      icon: AlertTriangle,
      iconClass: "bg-warning/10 text-warning",
      buttonClass: "btn-warning",
    },

    danger: {
      icon: CircleAlert,
      iconClass: "bg-error/10 text-error",
      buttonClass: "btn-error",
    },
  };

  const currentVariant =
    variants[variant] || variants.default;

  const Icon = currentVariant.icon;

  return (
    <div
      className="modal modal-open z-[100]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className="modal-box max-w-sm rounded-3xl p-6">
        <div
          className={`
            flex size-11
            items-center justify-center
            rounded-full
            ${currentVariant.iconClass}
          `}
        >
          <Icon size={20} />
        </div>

        <h3
          id="confirm-dialog-title"
          className="mt-5 text-lg font-semibold tracking-tight"
        >
          {title}
        </h3>

        {description && (
          <p className="mt-2 text-sm leading-6 text-base-content/60">
            {description}
          </p>
        )}

        <div className="modal-action mt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="btn btn-ghost rounded-xl"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`btn rounded-xl ${currentVariant.buttonClass}`}
          >
            {loading && (
              <span className="loading loading-spinner loading-sm" />
            )}

            {confirmText}
          </button>
        </div>
      </div>

      <button
        type="button"
        className="modal-backdrop cursor-default"
        onClick={onCancel}
        aria-label="Close confirmation dialog"
      />
    </div>
  );
}

export default ConfirmDialog;