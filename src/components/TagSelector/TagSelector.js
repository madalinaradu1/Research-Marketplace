import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useTags } from '../../contexts/TagContext';
import { fetchTagsByPrefix } from '../../lib/tags/tagApi';
import { isPrefixMatch } from '../../lib/tags/normalize';
import TagChip from './TagChip';
import TagDropdown from './TagDropdown';
import './tagSelector.css';

const DEBOUNCE_MS = 300;
const MAX_RESULTS = 20;

export default function TagSelector({
  selectedTagIds,
  onChange,
  placeholder = 'Search tags...',
  maxSelections,
  tagTypeFilter
}) {
  const { tagsById, searchByPrefix, resolveTagIds } = useTags();
  const listboxId = useId();
  const containerRef = useRef(null);

  const [inputValue, setInputValue] = useState('');
  const [debouncedInput, setDebouncedInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [fallbackResults, setFallbackResults] = useState([]);

  const selectedIds = useMemo(
    () => resolveTagIds(selectedTagIds || []),
    [selectedTagIds, resolveTagIds]
  );

  const canAddMore = maxSelections ? selectedIds.length < maxSelections : true;

  useEffect(() => {
    const t = setTimeout(() => setDebouncedInput(inputValue), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [inputValue]);

  useEffect(() => {
    function onOutsideClick(event) {
      if (!containerRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', onOutsideClick);
    return () => document.removeEventListener('mousedown', onOutsideClick);
  }, []);

  const localResults = useMemo(() => {
    if (!debouncedInput.trim()) return [];
    return searchByPrefix(debouncedInput, {
      tagTypeFilter,
      excludeTagIds: selectedIds,
      limit: MAX_RESULTS
    });
  }, [debouncedInput, searchByPrefix, selectedIds, tagTypeFilter]);

  useEffect(() => {
    let cancelled = false;

    async function loadFallback() {
      if (!debouncedInput.trim() || localResults.length > 0) {
        setFallbackResults([]);
        return;
      }

      try {
        const server = await fetchTagsByPrefix(debouncedInput, 50);
        if (cancelled) return;

        const selectedSet = new Set(selectedIds);
        const filtered = server
          .filter((tag) => !selectedSet.has(tag.tag_id))
          .filter((tag) => !tagTypeFilter || tag.tag_type === tagTypeFilter)
          .filter((tag) => isPrefixMatch(tag, debouncedInput))
          .slice(0, MAX_RESULTS);

        setFallbackResults(filtered);
      } catch (error) {
        if (!cancelled) setFallbackResults([]);
      }
    }

    loadFallback();
    return () => {
      cancelled = true;
    };
  }, [debouncedInput, localResults, selectedIds, tagTypeFilter]);

  const options = localResults.length ? localResults : fallbackResults;

  useEffect(() => {
    setHighlightedIndex(options.length ? 0 : -1);
  }, [options]);

  function selectTag(tag) {
    if (!tag || !canAddMore) return;
    const next = resolveTagIds([...selectedIds, tag.tag_id]);
    if (next.length !== selectedIds.length) onChange(next);
    setInputValue('');
    setDebouncedInput('');
    setIsOpen(false);
  }

  function removeTag(tagId) {
    onChange(selectedIds.filter((id) => id !== tagId));
  }

  function onKeyDown(event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!isOpen) setIsOpen(true);
      setHighlightedIndex((prev) => Math.min(prev + 1, options.length - 1));
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      if (isOpen && highlightedIndex >= 0 && options[highlightedIndex]) {
        selectTag(options[highlightedIndex]);
      }
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      setIsOpen(false);
      return;
    }

    if (event.key === 'Backspace' && !inputValue && selectedIds.length) {
      event.preventDefault();
      removeTag(selectedIds[selectedIds.length - 1]);
    }
  }

  return (
    <div className="tag-selector" ref={containerRef}>
      <div className="tag-chip-row">
        {selectedIds.map((tagId) => (
          <TagChip
            key={tagId}
            label={tagsById.get(tagId)?.display_name || tagId}
            onRemove={() => removeTag(tagId)}
          />
        ))}
      </div>

      <input
        type="text"
        className="tag-selector-input"
        value={inputValue}
        placeholder={canAddMore ? placeholder : 'Maximum tags selected'}
        onChange={(e) => {
          setInputValue(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={onKeyDown}
        disabled={!canAddMore}
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={
          highlightedIndex >= 0 ? `${listboxId}-option-${highlightedIndex}` : undefined
        }
      />

      <TagDropdown
        id={listboxId}
        isOpen={isOpen && !!inputValue.trim()}
        options={options}
        highlightedIndex={highlightedIndex}
        onHoverIndex={setHighlightedIndex}
        onSelect={selectTag}
        inputValue={inputValue}
      />
    </div>
  );
}