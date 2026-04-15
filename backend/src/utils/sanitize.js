import sanitizeHtml from 'sanitize-html';

export function sanitizePlainText(value = '') {
  return sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} }).trim();
}

export function buildThreadTitle(input = '') {
  const cleaned = sanitizePlainText(input).replace(/\s+/g, ' ');
  return cleaned.slice(0, 80) || 'New chat';
}
