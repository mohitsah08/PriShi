const CODE_KEYWORDS = ['code', 'error', 'bug', 'function'];
const VISION_KEYWORDS = ['image', 'photo', 'picture'];

export function classifyTask(input = '') {
  const normalizedInput = String(input).toLowerCase();

  if (CODE_KEYWORDS.some((keyword) => normalizedInput.includes(keyword))) {
    return 'coding';
  }

  if (normalizedInput.length > 1200) {
    return 'research';
  }

  if (VISION_KEYWORDS.some((keyword) => normalizedInput.includes(keyword))) {
    return 'vision';
  }

  return 'general';
}
