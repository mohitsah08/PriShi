export function formatRelativeTime(dateString) {
  if (!dateString) {
    return '';
  }

  const date = new Date(dateString);
  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function normalizeThread(thread) {
  return {
    id: thread._id || thread.id,
    title: thread.title,
    provider: thread.provider,
    resolvedProvider: thread.resolvedProvider,
    lastMessageAt: thread.lastMessageAt,
    lastAssistantPreview: thread.lastAssistantPreview
  };
}

export function normalizeMessage(message) {
  return {
    id: message._id || message.id,
    role: message.role,
    provider: message.provider,
    model: message.model,
    content: message.content,
    status: message.status || 'complete',
    createdAt: message.createdAt,
    attachments: message.attachments || []
  };
}
