import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const previewableAsFragment = (language) => {
    const lang = String(language || '').toLowerCase();
    return lang === 'html' || lang === 'htm' || lang === 'svg';
};

const isFullDocument = (raw) => (
    /^\s*(<!doctype\s+html|<html\b)/i.test(raw)
        || /<html[\s>]/i.test(raw)
        || /<head[\s>]/i.test(raw)
        || /<body[\s>]/i.test(raw)
);

const hasClosingHead = (raw) => /<\/head>/i.test(raw);

const hasOpeningHtml = (raw) => /<html[\s>]/i.test(raw);

/**
 * Injected into every sandboxed document before user code runs:
 * 1. A CSP meta tag that cuts all network access, forms, and base-url tricks
 *    (the only active directives are inline script/style and data/blob images).
 * 2. A history shim: pushState/replaceState throw SecurityError inside a
 *    null-origin sandbox, so anchor navigation falls back to location.hash.
 * 3. A height reporter so the host can size the iframe to the content.
 */
const INJECTION = `
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; base-uri 'none'; form-action 'none'">
<script>
(function () {
  history.pushState = history.replaceState = function (state, title, url) {
    if (url == null) return;
    location.hash = String(url);
  };
})();
(function () {
  function announce() {
    var height = document.documentElement.scrollHeight || document.body.scrollHeight || 0;
    try { parent.postMessage({ type: '__sandboxHeight', height: height }, '*'); } catch (e) {}
  }
  window.addEventListener('load', announce);
  window.addEventListener('resize', announce);
  if (window.MutationObserver) {
    new MutationObserver(announce).observe(
      document.documentElement,
      { childList: true, subtree: true, attributes: true, characterData: true }
    );
  }
  setTimeout(announce, 300);
})();
</script>`;

const buildSvgSkeleton = (raw) => `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
${INJECTION}
<style>
  html, body { margin: 0; padding: 16px; background: #fff; font-family: system-ui, sans-serif; }
  .wrap { display: grid; place-items: center; min-height: 100%; }
  svg { max-width: 100%; height: auto; }
</style>
</head>
<body>
<div class="wrap">${raw}</div>
</body>
</html>`;

const buildFragmentSkeleton = (raw) => `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
${INJECTION}
<style>
  html, body { margin: 0; padding: 16px; background: #fff; color: #0f172a; font-family: system-ui, -apple-system, Segoe UI, sans-serif; }
</style>
</head>
<body>
${raw}
</body>
</html>`;

const injectIntoFullDocument = (raw) => {
    if (hasClosingHead(raw)) {
        return raw.replace(/<\/head>/i, `${INJECTION}\n</head>`);
    }
    if (hasOpeningHtml(raw)) {
        return raw.replace(/<html[^>]*>/i, `$&\n<head>${INJECTION}</head>`);
    }
    return `\n<head>${INJECTION}</head>\n${raw}`;
};

const buildSrcDoc = (code, language) => {
    const raw = String(code || '');
    const lang = String(language || '').toLowerCase();

    if (lang === 'svg' && !/<svg[\s>]/i.test(raw)) {
        return buildSvgSkeleton(raw);
    }

    if (isFullDocument(raw)) {
        return injectIntoFullDocument(raw);
    }

    return buildFragmentSkeleton(raw);
};

/**
 * Sandboxed preview host for single-file HTML / SVG snippets.
 *
 * The user code runs inside a `srcdoc` iframe with `sandbox="allow-scripts"`
 * (no `allow-same-origin`, so the document lives in a unique null origin) plus
 * a restrictive CSP meta tag, then reports its intrinsic height to the host.
 * The preview is isolated from the host page: no cookies, no storage, no
 * network, no popups, no form submission.
 */
const HtmlSandboxPreview = ({
    code,
    language = 'html',
    minHeight = 280,
    maxHeight = 1200,
    title = 'HTML preview',
    className,
}) => {
    const frameRef = useRef(null);
    const [contentHeight, setContentHeight] = useState(null);

    const srcDoc = useMemo(
        () => (previewableAsFragment(language) ? buildSrcDoc(code, language) : ''),
        [code, language],
    );

    const handleMessage = useCallback((event) => {
        if (event.source !== frameRef.current?.contentWindow) return;
        const height = event.data?.height;
        if (typeof height !== 'number' || !Number.isFinite(height)) return;
        setContentHeight(Math.min(Math.max(Math.round(height), minHeight), maxHeight));
    }, [minHeight, maxHeight]);

    useEffect(() => {
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [handleMessage]);

    return (
        <iframe
            ref={frameRef}
            title={title}
            srcDoc={srcDoc}
            sandbox="allow-scripts"
            className={`block w-full border-0 bg-white ${className || ''}`}
            style={{ height: contentHeight ?? minHeight, minHeight: `${minHeight}px` }}
        />
    );
};

HtmlSandboxPreview.displayName = 'HtmlSandboxPreview';

export default HtmlSandboxPreview;