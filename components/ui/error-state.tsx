"use client";

interface ErrorStateProps {
  title?: string;
  description?: string;
  retry?: () => void;
}

function IconAlertTriangle() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path
        d="M11 3L2 19h18L11 3zM11 9v5M11 16.5v.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description = "An unexpected error occurred. Please try again.",
  retry,
}: ErrorStateProps) {
  return (
    <div className="state-error">
      <div className="icon">
        <IconAlertTriangle />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {retry && (
        <button className="btn secondary sm" onClick={retry} style={{ marginTop: 8 }}>
          Try again
        </button>
      )}
    </div>
  );
}
