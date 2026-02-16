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
        x
      </button>
    </span>
  );
}