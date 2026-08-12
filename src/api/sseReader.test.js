import assert from 'node:assert/strict';
import test from 'node:test';
import { createSseReader } from './sseReader.js';

const defaultSource = { responseText: '' };
const progress = (responseText, source = defaultSource) => {
  source.responseText = responseText;
  return { event: { target: source } };
};

test('parses id, event and structured JSON across chunk boundaries', () => {
  const events = [];
  const reader = createSseReader((event) => events.push(event));

  reader.onDownloadProgress(progress('id: 41\r\nevent: tool_progress\r\ndata: {"tool":"blog_'));
  assert.deepEqual(events, []);
  reader.onDownloadProgress(progress('id: 41\r\nevent: tool_progress\r\ndata: {"tool":"blog_generate",\r\ndata: "message":"write|writing"}\r\n\r\n'));

  assert.deepEqual(events, [{
    id: '41',
    event: 'tool_progress',
    data: { tool: 'blog_generate', message: 'write|writing' },
  }]);
});

test('joins multiple data lines and keeps text event payloads as strings', () => {
  for (const eventType of ['delta', 'answer_delta', 'stage', 'error', 'thought', 'answer']) {
    const events = [];
    const reader = createSseReader((event) => events.push(event));
    reader.onDownloadProgress(progress(`event: ${eventType}\ndata: {"looks":"json"}\ndata: second line\n\n`));

    assert.deepEqual(events, [{
      id: undefined,
      event: eventType,
      data: '{"looks":"json"}\nsecond line',
    }]);
  }
});

test('decodes every structured agent event type as JSON', () => {
  for (const eventType of ['tool_start', 'tool_progress', 'tool_end', 'tool_error', 'complete']) {
    const events = [];
    const reader = createSseReader((event) => events.push(event));
    reader.onDownloadProgress(progress(`event: ${eventType}\ndata: {"tool":"blog_generate","ok":true}\n\n`));

    assert.deepEqual(events, [{
      id: undefined,
      event: eventType,
      data: { tool: 'blog_generate', ok: true },
    }]);
  }
});

test('flush dispatches a final event without a blank-line terminator', () => {
  const events = [];
  const reader = createSseReader((event) => events.push(event));

  reader.onDownloadProgress(progress('id: 9\nevent: complete\ndata: {"status":"ready"}'));
  assert.deepEqual(events, []);
  reader.flush();

  assert.deepEqual(events, [{ id: '9', event: 'complete', data: { status: 'ready' } }]);
});

test('ignores comments and falls back to text for malformed structured data', () => {
  const events = [];
  const reader = createSseReader((event) => events.push(event));

  reader.onDownloadProgress(progress(': heartbeat\n\nevent: tool_error\ndata: not-json\n\n'));

  assert.deepEqual(events, [{ id: undefined, event: 'tool_error', data: 'not-json' }]);
});

test('resets its offset when Axios retries with a fresh shorter response', () => {
  const events = [];
  const reader = createSseReader((event) => events.push(event));

  reader.onDownloadProgress(progress('event: answer_delta\ndata: first response payload\n\n'));
  reader.onDownloadProgress(progress('event: answer\ndata: retried\n\n'));

  assert.deepEqual(events, [
    { id: undefined, event: 'answer_delta', data: 'first response payload' },
    { id: undefined, event: 'answer', data: 'retried' },
  ]);
});

test('resets when a fresh retry response is longer than the previous response', () => {
  const events = [];
  const reader = createSseReader((event) => events.push(event));

  reader.onDownloadProgress(progress('event: answer\ndata: old\n\n'));
  reader.onDownloadProgress(progress(
    'event: answer\ndata: a much longer retried response\n\n',
    { responseText: '' },
  ));

  assert.equal(events.at(-1)?.data, 'a much longer retried response');
});
