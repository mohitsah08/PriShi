import { API_BASE_URL } from './baseUrl.js';

function parseEventBlock(block) {
  const lines = block.split('\n');
  let event = 'message';
  const dataLines = [];

  for (const line of lines) {
    if (line.startsWith('event:')) {
      event = line.slice(6).trim();
    }

    if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trim());
    }
  }

  const payload = dataLines.length ? JSON.parse(dataLines.join('\n')) : null;
  return { event, payload };
}

export async function streamChatMessage({
  threadId,
  token,
  message,
  provider,
  files,
  onEvent
}) {
  const formData = new FormData();
  formData.append('message', message);
  formData.append('provider', provider || 'auto');

  for (const file of files || []) {
    formData.append('files', file);
  }

  const response = await fetch(`${API_BASE_URL}/api/chats/threads/${threadId}/messages/stream`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'text/event-stream'
    },
    credentials: 'include',
    body: formData
  });

  if (!response.ok || !response.body) {
    let messageText = 'Streaming request failed';

    try {
      const errorPayload = await response.json();
      messageText = errorPayload.message || messageText;
    } catch {
      // ignore JSON parse failure
    }

    throw new Error(messageText);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const blocks = buffer.split('\n\n');
    buffer = blocks.pop() || '';

    for (const block of blocks) {
      if (!block.trim() || block.startsWith(':')) {
        continue;
      }

      const { event, payload } = parseEventBlock(block);
      onEvent?.(event, payload);
    }
  }
}
