import React from 'react';

export const DASHBOARD_CONTENT_MAX_WIDTH = '1180px';
export const DASHBOARD_CONTENT_PADDING = '2rem';
export const DASHBOARD_CONTENT_GAP = '2rem';
export const DASHBOARD_PAGE_GUTTER = 'clamp(2rem, 6vw, 6rem)';

const DashboardPageShell = ({
  children,
  hero = null,
  maxWidth = DASHBOARD_CONTENT_MAX_WIDTH,
  contentPadding = DASHBOARD_CONTENT_PADDING,
  contentGap = DASHBOARD_CONTENT_GAP,
  pageGutter = DASHBOARD_PAGE_GUTTER,
  backgroundColor = '#f5f5f5',
  pageStyle = {},
  contentStyle = {}
}) => (
  <div
    style={{
      width: '100%',
      backgroundColor,
      boxSizing: 'border-box',
      ...pageStyle
    }}
  >
    {hero}
    <div
      style={{
        width: '100%',
        paddingInline: pageGutter,
        boxSizing: 'border-box'
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: contentGap,
          padding: contentPadding,
          width: '100%',
          maxWidth,
          margin: '0 auto',
          boxSizing: 'border-box',
          ...contentStyle
        }}
      >
        {children}
      </div>
    </div>
  </div>
);

export default DashboardPageShell;
