export function estimateTokenCount(input) {
  if (!input) {
    return 0;
  }

  if (Array.isArray(input)) {
    return input.reduce((sum, item) => sum + estimateTokenCount(item), 0);
  }

  if (typeof input === 'object') {
    return estimateTokenCount(JSON.stringify(input));
  }

  return Math.ceil(String(input).length / 4);
}

export function estimateMessageTokens(messages = []) {
  return estimateTokenCount(
    messages.map((message) => ({
      role: message.role,
      content: message.content
    }))
  );
}
