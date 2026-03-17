import React from 'react';

export default function TagDropdown({
  id,
  isOpen,
  options,
  highlightedIndex,
  onHoverIndex,
  onSelect,
  inputValue
}) {
  if (!isOpen) return null;

  if (!options.length) {
    return (
      <ul id={id} role="listbox" className="tag-dropdown">
        <li className="tag-dropdown-empty">No matches for "{inputValue}"</li>
      </ul>
    );
  }

  return (
    <ul id={id} role="listbox" className="tag-dropdown">
      {options.map((tag, index) => (
        <li
          key={tag.tag_id}
          id={`${id}-option-${index}`}
          role="option"
          aria-selected={index === highlightedIndex}
          className={`tag-dropdown-option ${index === highlightedIndex ? 'is-highlighted' : ''}`}
          onMouseEnter={() => onHoverIndex(index)}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onSelect(tag)}
        >
          {tag.display_name}
        </li>
      ))}
    </ul>
  );
}
