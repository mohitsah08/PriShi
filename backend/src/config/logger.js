function write(level, message, meta) {
  const timestamp = new Date().toISOString();
  const payload = meta ? ` ${JSON.stringify(meta)}` : '';
  console[level](`[${timestamp}] ${message}${payload}`);
}

export const logger = {
  info(metaOrMessage, maybeMessage) {
    if (typeof metaOrMessage === 'string') {
      write('log', metaOrMessage);
      return;
    }

    write('log', maybeMessage || 'info', metaOrMessage);
  },
  error(metaOrMessage, maybeMessage) {
    if (typeof metaOrMessage === 'string') {
      write('error', metaOrMessage);
      return;
    }

    write('error', maybeMessage || 'error', metaOrMessage);
  },
  warn(metaOrMessage, maybeMessage) {
    if (typeof metaOrMessage === 'string') {
      write('warn', metaOrMessage);
      return;
    }

    write('warn', maybeMessage || 'warn', metaOrMessage);
  }
};
