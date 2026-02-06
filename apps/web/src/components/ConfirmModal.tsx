import { colors, spacing, radius, shadows, baseModal, modalContent, primaryButton, dangerButton, secondaryButton } from "../lib/styles";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDangerous = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const buttonStyle = isDangerous ? dangerButton : primaryButton;

  return (
    <div style={baseModal} onClick={onCancel}>
      <div
        style={modalContent}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginBottom: spacing.md, color: colors.textPrimary }}>
          {title}
        </h2>
        <p style={{ marginBottom: spacing.lg, color: colors.textSecondary }}>
          {message}
        </p>

        <div
          style={{
            display: "flex",
            gap: spacing.md,
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onCancel}
            style={secondaryButton}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = colors.bgTertiary;
              e.currentTarget.style.borderColor = colors.primary;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = colors.bgTertiary;
              e.currentTarget.style.borderColor = colors.border;
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            style={buttonStyle}
            onMouseOver={(e) => {
              const bg = isDangerous ? colors.danger : colors.primary;
              e.currentTarget.style.opacity = "0.9";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
