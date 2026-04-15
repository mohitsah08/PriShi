export function normalizeResponse({
  provider,
  model,
  content,
  usage,
  finishReason,
  raw,
  fallbackFrom = null
}) {
  return {
    provider,
    model,
    content: content || '',
    usage: {
      promptTokens: usage?.promptTokens || 0,
      completionTokens: usage?.completionTokens || 0,
      totalTokens: usage?.totalTokens || 0,
      estimated: Boolean(usage?.estimated)
    },
    finishReason: finishReason || 'stop',
    fallbackFrom,
    raw
  };
}
