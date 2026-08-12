const TEXT_EVENT_TYPES = new Set([
  'delta',
  'answer_delta',
  'stage',
  'error',
  'thought',
  'answer',
]);

/**
 * Incrementally parses an SSE response exposed through Axios XHR progress.
 * Text-bearing events stay strings even when their contents happen to be
 * valid JSON, while structured tool/lifecycle events are decoded as JSON.
 */
export function createSseReader(onEvent) {
  let offset = 0;
  let buffer = '';
  let responseSource = null;

  const dispatch = (rawEvent) => {
    const lines = rawEvent.split(/\r?\n/);
    let id;
    let event = 'message';
    const dataLines = [];

    for (const line of lines) {
      if (!line || line.startsWith(':')) continue;
      const separator = line.indexOf(':');
      const field = separator < 0 ? line : line.slice(0, separator);
      const rawValue = separator < 0 ? '' : line.slice(separator + 1);
      const value = rawValue.startsWith(' ') ? rawValue.slice(1) : rawValue;
      if (field === 'id') id = value;
      else if (field === 'event') event = value || 'message';
      else if (field === 'data') dataLines.push(value);
    }

    if (dataLines.length === 0 || !onEvent) return;
    const dataText = dataLines.join('\n');
    if (TEXT_EVENT_TYPES.has(event)) {
      onEvent({ id, event, data: dataText });
      return;
    }

    try {
      onEvent({ id, event, data: JSON.parse(dataText) });
    } catch {
      onEvent({ id, event, data: dataText });
    }
  };

  return {
    onDownloadProgress(progressEvent) {
      const source = progressEvent.event?.target;
      const responseText = source?.responseText;
      if (typeof responseText !== 'string') return;
      // Axios/XHR normally exposes the complete response accumulated so far,
      // but a retried request (for example after token refresh) can reuse this
      // callback with a fresh, shorter responseText. Reset the parser instead
      // of slicing from the previous request's offset and dropping events.
      if ((responseSource && source !== responseSource) || responseText.length < offset) {
        offset = 0;
        buffer = '';
      }
      responseSource = source;
      buffer += responseText.slice(offset);
      offset = responseText.length;
      const chunks = buffer.split(/\r?\n\r?\n/);
      buffer = chunks.pop() || '';
      chunks.forEach(dispatch);
    },
    flush() {
      if (buffer) dispatch(buffer);
      buffer = '';
    },
  };
}
