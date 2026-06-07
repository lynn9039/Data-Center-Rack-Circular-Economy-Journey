export function LoadingIndicator({ message = "Loading rack visualization..." }: { message?: string }) {
  return (
    <div className="loading-overlay" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}

export function LoadErrorPanel({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="loading-overlay" role="alert">
      <p className="error-banner" style={{ maxWidth: 400 }}>
        {message}
      </p>
      <button type="button" onClick={onRetry}>
        Retry
      </button>
    </div>
  );
}
