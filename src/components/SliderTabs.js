import React, {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState
} from 'react';
import styles from './SliderTabs.module.css';

const clampIndex = (index, maxIndex) => {
  if (maxIndex < 0) return 0;
  return Math.min(Math.max(index, 0), maxIndex);
};

const joinClassNames = (...classNames) => classNames.filter(Boolean).join(' ');

/**
 * SliderTabs
 * Props:
 *   tabs: [{ label, content }]
 *   defaultIndex?: number
 *   currentIndex?: number
 *   onChange?: (index) => void
 *   className?: string
 *   listClassName?: string
 *   panelClassName?: string
 *   renderPanel?: boolean
 */
const SliderTabs = ({
  tabs = [],
  defaultIndex = 0,
  currentIndex,
  onChange,
  className,
  listClassName,
  panelClassName,
  renderPanel = true
}) => {
  const isControlled = currentIndex !== undefined;
  const maxIndex = tabs.length - 1;
  const [internalIndex, setInternalIndex] = useState(() => clampIndex(defaultIndex, maxIndex));
  const activeIndex = clampIndex(isControlled ? currentIndex : internalIndex, maxIndex);
  const tabRefs = useRef([]);
  const tabListRef = useRef(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const idBase = useId();

  const updateIndicator = useCallback(() => {
    const activeTab = tabRefs.current[activeIndex];
    if (!activeTab) {
      setIndicator({ left: 0, width: 0 });
      return;
    }

    setIndicator({
      left: activeTab.offsetLeft,
      width: activeTab.offsetWidth
    });
  }, [activeIndex]);

  useEffect(() => {
    if (!isControlled) {
      setInternalIndex((prevIndex) => clampIndex(prevIndex, maxIndex));
    }
  }, [isControlled, maxIndex]);

  useLayoutEffect(() => {
    updateIndicator();
  }, [updateIndicator, tabs.length]);

  useEffect(() => {
    if (!tabs.length) return undefined;

    const handleResize = () => updateIndicator();
    window.addEventListener('resize', handleResize);

    let resizeObserver;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => updateIndicator());

      if (tabListRef.current) {
        resizeObserver.observe(tabListRef.current);
      }

      tabRefs.current.forEach((tab) => {
        if (tab) resizeObserver.observe(tab);
      });
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [tabs.length, updateIndicator]);

  const handleSelect = useCallback((index) => {
    if (index === activeIndex) return;

    if (!isControlled) {
      setInternalIndex(index);
    }

    if (onChange) {
      onChange(index);
    }
  }, [activeIndex, isControlled, onChange]);

  const handleKeyDown = (event, index) => {
    let nextIndex = index;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        nextIndex = (index + 1) % tabs.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        nextIndex = (index - 1 + tabs.length) % tabs.length;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = tabs.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    handleSelect(nextIndex);
    tabRefs.current[nextIndex]?.focus();
  };

  if (!tabs.length) {
    return null;
  }

  return (
    <div className={joinClassNames(styles.root, className)} data-slider-tabs="true">
      <div
        ref={tabListRef}
        className={joinClassNames(styles.list, listClassName)}
        role="tablist"
        aria-orientation="horizontal"
      >
        {tabs.map((tab, index) => {
          const isActive = activeIndex === index;
          const tabId = `${idBase}-tab-${index}`;
          const panelId = `${idBase}-panel-${index}`;

          return (
            <button
              key={tab.label || index}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              type="button"
              data-slider-tab="true"
              role="tab"
              id={tabId}
              aria-selected={isActive}
              aria-controls={renderPanel ? panelId : undefined}
              tabIndex={isActive ? 0 : -1}
              className={joinClassNames(styles.tab, isActive && styles.tabActive)}
              onClick={() => handleSelect(index)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              <span className={styles.tabLabel}>{tab.label}</span>
            </button>
          );
        })}

        <div
          className={styles.indicator}
          style={{
            transform: `translateX(${indicator.left}px)`,
            width: indicator.width
          }}
          aria-hidden="true"
        />
      </div>

      {renderPanel && (
        <div
          id={`${idBase}-panel-${activeIndex}`}
          role="tabpanel"
          aria-labelledby={`${idBase}-tab-${activeIndex}`}
          className={joinClassNames(styles.panel, panelClassName)}
        >
          {tabs[activeIndex]?.content}
        </div>
      )}
    </div>
  );
};

export default SliderTabs;
