import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import http from '@/api/http';

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
 * Fallback-only injection, used when the hosted preview API is unavailable.
 * 1. A CSP meta tag cutting all network access, forms, and base-url tricks.
 * 2. A history shim: pushState/replaceState throw SecurityError inside a
 *    null-origin sandbox, so anchor navigation falls back to location.hash.
 * 3. A height reporter so the host can size the iframe to the content.
 */
const FALLBACK_INJECTION = `
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; base-uri 'none'; form-action 'none'">
<style>html, body { overscroll-behavior: contain; }</style>
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
(function () {
  var scheduled = false;
  function describe(element) {
    if (!element || !element.tagName) return null;
    return element.tagName.toLowerCase()
      + (element.id ? '#' + element.id : '')
      + (element.className && typeof element.className === 'string'
        ? '.' + element.className.trim().replace(/\\s+/g, '.') : '');
  }
  function report(eventName, target) {
    var scrollingElement = document.scrollingElement;
    var payload = {
      type: '__sandboxDebug',
      event: eventName,
      hash: location.hash,
      scrollY: window.scrollY,
      scrollTop: scrollingElement ? scrollingElement.scrollTop : null,
      activeElement: describe(document.activeElement),
      target: describe(target),
      viewportHeight: window.innerHeight,
      documentHeight: document.documentElement.scrollHeight
    };
    try { parent.postMessage(payload, '*'); } catch (e) {}
  }
  document.addEventListener('click', function (event) {
    var link = event.target && event.target.closest ? event.target.closest('a[href]') : null;
    if (link) report('anchor-click:' + link.getAttribute('href'), link);
  }, true);
  document.addEventListener('focusin', function (event) { report('focusin', event.target); }, true);
  window.addEventListener('hashchange', function () { report('hashchange'); });
  window.addEventListener('popstate', function () { report('popstate'); });
  window.addEventListener('scroll', function () {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(function () {
      scheduled = false;
      report('scroll');
    });
  }, { passive: true });
  window.addEventListener('load', function () { report('load'); });
})();
</script>`;

const buildSvgSkeleton = (raw) => `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
${FALLBACK_INJECTION}
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
${FALLBACK_INJECTION}
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
        return raw.replace(/<\/head>/i, `${FALLBACK_INJECTION}\n</head>`);
    }
    if (hasOpeningHtml(raw)) {
        return raw.replace(/<html[^>]*>/i, `$&\n<head>${FALLBACK_INJECTION}</head>`);
    }
    return `\n<head>${FALLBACK_INJECTION}</head>\n${raw}`;
};

const buildFallbackSrcDoc = (code, language) => {
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
 * Primary mode: the code is uploaded to the backend and served as a standalone
 * page (`/blog-html/{id}/raw`) on an independent origin, loaded via iframe
 * `src`. Isolation comes from the separate origin + strict CSP served with the
 * page, exactly like OpenAI's oaiusercontent artifacts; history.pushState and
 * other page APIs keep working natively. The iframe height is reported back
 * over postMessage and verified against the page origin.
 *
 * Fallback mode: when the preview API is unavailable, the code runs in a
 * `srcdoc` iframe with `sandbox="allow-scripts"` (no allow-same-origin) and a
 * restrictive CSP meta tag instead.
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
    const [pageUrl, setPageUrl] = useState(null);
    const [useFallback, setUseFallback] = useState(false);
    const [contentHeight, setContentHeight] = useState(null);
    const latestCodeRef = useRef(code);
    const debounceRef = useRef(null);

    const srcDoc = useMemo(
        () => (previewableAsFragment(language) ? buildFallbackSrcDoc(code, language) : ''),
        [code, language],
    );

    // Create (or refresh) the hosted preview session whenever the code changes.
    useEffect(() => {
        if (!previewableAsFragment(language)) return undefined;
        latestCodeRef.current = code;
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            const payload = code;
            http.post('/api/blog-html/previews', { code: payload }, { _silent: true })
                .then((data) => {
                    if (latestCodeRef.current !== payload) return;
                    if (typeof data?.pageUrl !== 'string' || !data.pageUrl) {
                        setUseFallback(true);
                        return;
                    }
                    setPageUrl(data.pageUrl);
                    setUseFallback(false);
                })
                .catch((error) => {
                    if (error?.name === 'CanceledError') return;
                    if (latestCodeRef.current !== payload) return;
                    setUseFallback(true);
                });
        }, 300);
        return () => clearTimeout(debounceRef.current);
    }, [code, language]);

    const clampHeight = useCallback((value) => (
        Math.min(Math.max(Math.round(value), minHeight), maxHeight)
    ), [minHeight, maxHeight]);

    const handleMessage = useCallback((event) => {
        if (event.source !== frameRef.current?.contentWindow) return;
        if (!useFallback && pageUrl) {
            let expectedOrigin = null;
            try {
                expectedOrigin = new URL(pageUrl).origin;
            } catch {
                return;
            }
            if (event.origin !== expectedOrigin) return;
        } else if (event.origin !== 'null') {
            return;
        }

        if (event.data?.type === '__sandboxDebug') {
            const frameRect = frameRef.current?.getBoundingClientRect();
            console.debug('[HtmlSandboxPreview]', {
                mode: useFallback ? 'srcdoc-fallback' : 'hosted',
                hostScrollY: window.scrollY,
                frameTop: frameRect?.top ?? null,
                frameHeight: frameRect?.height ?? null,
                ...event.data,
            });
            return;
        }

        if (event.data?.type !== '__sandboxHeight') return;
        const height = event.data?.height;
        if (typeof height !== 'number' || !Number.isFinite(height)) return;
        const nextHeight = clampHeight(height);
        console.debug('[HtmlSandboxPreview] height', {
            reportedHeight: height,
            appliedHeight: nextHeight,
            previousHeight: contentHeight,
            hostScrollY: window.scrollY,
        });
        setContentHeight(nextHeight);
    }, [useFallback, pageUrl, clampHeight, contentHeight]);

    useEffect(() => {
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [handleMessage]);

    const iframeProps = {
        ref: frameRef,
        title,
        className: `block w-full border-0 bg-white ${className || ''}`,
        style: { height: contentHeight ?? minHeight, minHeight: `${minHeight}px` },
    };

    if (!useFallback && pageUrl) {
        // Hosted mode: standalone page on an independent origin, no sandbox
        // attribute needed (the origin itself is the isolation boundary).
        return <iframe {...iframeProps} src={pageUrl} />;
    }

    return <iframe {...iframeProps} srcDoc={srcDoc} sandbox="allow-scripts" />;
};

HtmlSandboxPreview.displayName = 'HtmlSandboxPreview';

export default HtmlSandboxPreview;
