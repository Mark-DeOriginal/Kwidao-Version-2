"use client";

export function WalletNoticeModal({
  isOpen,
  title,
  message,
  onClose,
}: {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="wallet-notice-overlay" onClick={onClose}>
      <div
        className="wallet-notice-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wallet-notice-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="wallet-notice-close"
          aria-label="Close wallet notice"
          onClick={onClose}
        >
          x
        </button>
        <div className="wallet-notice-icon">!</div>
        <h2 className="wallet-notice-title" id="wallet-notice-title">
          {title}
        </h2>
        <p className="wallet-notice-message">{message}</p>
        <div className="wallet-notice-actions">
          <button className="wallet-notice-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
