import DOMPurify from 'dompurify';

const ALLOWED_TAGS = ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'a'];
const ALLOWED_ATTR = ['href', 'target', 'rel'];

function htmlToText(html = '') {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return (doc.body.textContent || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
}

export function sanitizeRichText(html = '') {
  if (!html || html === '<p><br></p>') return '';

  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
  }).trim();

  return htmlToText(sanitized) ? sanitized : '';
}

export function richTextToPlainText(html = '') {
  const safeHtml = sanitizeRichText(html);
  return htmlToText(safeHtml);
}

export function countWordsFromRichText(html = '') {
  const text = richTextToPlainText(html);
  return text ? text.split(/\s+/).length : 0;
}
