import React from 'react';
import { sanitizeRichText } from '../../utils/richText';

export default function RichTextContent({ html, className, style, fallback = null }) {
  const safeHtml = sanitizeRichText(html);

  if (!safeHtml) return fallback;

  return (
    <div
      className={className}
      style={style}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
