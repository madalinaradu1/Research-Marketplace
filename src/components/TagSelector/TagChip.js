import React from 'react';

export default function TagChip({ label, onRemove }) {
  return (
    <span className="tag-chip">
      <span className="tag-chip-label">{label}</span>
      <button
        type="button"
        className="tag-chip-remove"
        onClick={onRemove}
        aria-label={`Remove ${label}`}
      >
        <span className="tag-chip-remove-glyph" aria-hidden="true">
          <svg
            className="tag-chip-remove-icon"
            viewBox="0 0 16 16"
          >
            <path
              d="M4 4l8 8M12 4l-8 8"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </button>
    </span>
  );
}
