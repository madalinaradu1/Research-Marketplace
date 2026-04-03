import React, { useState, useRef, useEffect } from 'react';

/**
 * SliderTabs — drop-in replacement for Amplify <Tabs>.
 * Props:
 *   tabs: [{ label, content }]
 *   defaultIndex?: number
 *   currentIndex?: number        (controlled)
 *   onChange?: (index) => void
 */
const SliderTabs = ({ tabs = [], defaultIndex = 0, currentIndex, onChange }) => {
  const isControlled = currentIndex !== undefined;
  const [internalIndex, setInternalIndex] = useState(defaultIndex);
  const activeIndex = isControlled ? currentIndex : internalIndex;

  const tabRefs = useRef([]);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const el = tabRefs.current[activeIndex];
    if (el) {
      setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
    }
  }, [activeIndex, tabs.length]);

  const handleClick = (index) => {
    if (!isControlled) setInternalIndex(index);
    if (onChange) onChange(index);
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Tab list */}
      <div style={{ position: 'relative', borderBottom: '2px solid #d1d5db', display: 'flex' }}>
        {tabs.map((tab, i) => (
          <button
            key={i}
            ref={el => tabRefs.current[i] = el}
            role="tab"
            aria-selected={activeIndex === i}
            onClick={() => handleClick(i)}
            style={{
              flex: '0 0 auto',
              padding: '0.75rem 2.5rem',
              fontSize: '0.9rem',
              fontWeight: activeIndex === i ? '600' : '400',
              color: activeIndex === i ? '#9a4ad7' : '#4a5568',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              outline: 'none',
              whiteSpace: 'nowrap',
              transition: 'color 0.2s ease',
            }}
          >
            {tab.label}
          </button>
        ))}

        {/* Sliding indicator */}
        <div
          style={{
            position: 'absolute',
            bottom: '-2px',
            height: '3px',
            backgroundColor: '#9a4ad7',
            borderRadius: '2px 2px 0 0',
            left: indicator.left,
            width: indicator.width,
            transition: 'left 0.25s ease, width 0.25s ease',
          }}
        />
      </div>

      {/* Tab panel */}
      <div style={{ paddingTop: '1rem' }}>
        {tabs[activeIndex]?.content}
      </div>
    </div>
  );
};

export default SliderTabs;
