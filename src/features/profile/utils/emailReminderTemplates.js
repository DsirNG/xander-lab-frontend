/**
 * Email reminder layout templates + preview builders.
 * Keep in sync with backend EmailReminderMailTemplates.
 */

export const TEMPLATE_IDS = ['classic', 'minimal', 'card', 'notice'];

export const TEMPLATE_NONE = 'none';

export const HTML_STARTERS = {
    classic: [
        '<p style="margin:0 0 14px;">你好，</p>',
        '<p style="margin:0 0 14px;">这是一封来自未来的提醒——到点时请完成今天最重要的那一件事。</p>',
        '<p style="margin:0;color:#64748b;">写完就可以安心去做下一件了。</p>',
    ].join('\n'),
    minimal: [
        '<p style="margin:0 0 12px;">提醒自己：</p>',
        '<p style="margin:0;">把注意力放回当下这一件事，其它都可以稍后再说。</p>',
    ].join('\n'),
    card: [
        '<p style="margin:0 0 12px;font-size:17px;font-weight:700;color:#9a3412;">到点了</p>',
        '<p style="margin:0;">别把今天要做的事拖到明天。打开清单，勾掉最上面那一条。</p>',
    ].join('\n'),
    notice: [
        '<p style="margin:0 0 10px;"><strong>通知事项</strong></p>',
        '<ul style="margin:0;padding-left:18px;line-height:1.85;">',
        '  <li>核对收件人是否正确</li>',
        '  <li>确认发送时间与时区</li>',
        '  <li>如需改期，请及时更新任务</li>',
        '</ul>',
    ].join('\n'),
};

export const TEMPLATE_SWATCH = {
    classic: 'from-accent-400 to-accent-800',
    minimal: 'from-ink-faint to-ink',
    card: 'from-warning to-danger',
    notice: 'from-success to-accent-800',
};

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif";

const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const looksLikeHtml = (message) => /<\/?[a-z][\s\S]*>/i.test(String(message || ''));

export const looksLikeFullHtmlDocument = (message) => /<!doctype\s+html|<html\b/i.test(String(message || ''));

export const resolveContentType = (message, templateId) => {
    if (templateId && templateId !== TEMPLATE_NONE) return 'HTML';
    if (looksLikeHtml(message)) return 'HTML';
    return 'PLAIN';
};

const wrapDocument = (title, bodyInner) => (
    `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8">`
    + `<meta name="viewport" content="width=device-width,initial-scale=1">`
    + `<title>${escapeHtml(title)}</title></head>${bodyInner}</html>`
);

const metaRow = (time, zone) => (
    `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:24px;"><tr>`
    + `<td style="padding-top:16px;border-top:1px solid #e8e4dc;font-size:11px;line-height:1.7;color:#8a8478;">`
    + `计划发送 · ${escapeHtml(time)} · ${escapeHtml(zone)}`
    + `</td></tr></table>`
);

const buildRaw = (subject, body) => wrapDocument(subject, `
<body style="margin:0;padding:20px;background:#fff;color:#111;font-family:${FONT};font-size:14px;line-height:1.75;">
  ${body}
</body>`);

const buildClassic = (subject, body, time, zone) => wrapDocument(subject, `
<body style="margin:0;padding:0;background:#eef2f6;color:#1a2332;font-family:${FONT};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eef2f6;padding:28px 8px;"><tr><td align="center">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#fffcf7;border-radius:4px;box-shadow:0 14px 36px rgba(26,35,50,.08);">
      <tr><td style="height:5px;background:#1d4ed8;font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td style="padding:26px 28px 8px;">
        <div style="font-size:10px;letter-spacing:.22em;color:#1d4ed8;font-weight:700;">DINQOR AI</div>
        <h1 style="margin:14px 0 0;font-size:22px;line-height:1.3;font-weight:700;color:#0f172a;letter-spacing:-.02em;">${escapeHtml(subject)}</h1>
      </td></tr>
      <tr><td style="padding:8px 28px 26px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>
          <td style="width:3px;background:#93c5fd;border-radius:2px;"></td>
          <td style="padding-left:14px;font-size:14px;line-height:1.8;color:#334155;word-break:break-word;">${body}</td>
        </tr></table>
        ${metaRow(time, zone)}
      </td></tr>
    </table>
  </td></tr></table>
</body>`);

const buildMinimal = (subject, body, time, zone) => wrapDocument(subject, `
<body style="margin:0;padding:0;background:#f3f1ec;color:#171717;font-family:${FONT};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 8px;"><tr><td align="center">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:540px;background:#ffffff;">
      <tr><td style="padding:30px 26px 8px;">
        <div style="width:28px;height:3px;background:#171717;"></div>
        <div style="margin-top:16px;font-size:10px;letter-spacing:.18em;color:#737373;">DINQOR AI</div>
        <h1 style="margin:10px 0 0;font-size:24px;line-height:1.25;font-weight:600;color:#0a0a0a;letter-spacing:-.03em;">${escapeHtml(subject)}</h1>
      </td></tr>
      <tr><td style="padding:8px 26px 30px;">
        <div style="margin:18px 0;height:1px;background:#e5e5e5;"></div>
        <div style="font-size:14px;line-height:1.85;color:#404040;word-break:break-word;">${body}</div>
        <div style="margin-top:26px;font-size:11px;color:#a3a3a3;">${escapeHtml(time)} · ${escapeHtml(zone)}</div>
      </td></tr>
    </table>
  </td></tr></table>
</body>`);

const buildCard = (subject, body, time, zone) => wrapDocument(subject, `
<body style="margin:0;padding:0;background:#f6ebe3;color:#1c1917;font-family:${FONT};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:28px 8px;"><tr><td align="center">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:580px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 16px 40px rgba(120,53,15,.12);">
      <tr><td style="padding:24px 24px 20px;background:linear-gradient(145deg,#fb7185 0%,#f97316 100%);color:#fff;">
        <div style="display:inline-block;padding:4px 9px;border:1px solid rgba(255,255,255,.45);border-radius:999px;font-size:10px;letter-spacing:.12em;">REMINDER</div>
        <h1 style="margin:14px 0 0;font-size:20px;line-height:1.3;font-weight:700;">${escapeHtml(subject)}</h1>
      </td></tr>
      <tr><td style="padding:22px 24px 26px;">
        <div style="font-size:14px;line-height:1.8;color:#44403c;word-break:break-word;">${body}</div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:20px;background:#fff7ed;border-radius:12px;"><tr>
          <td style="padding:12px 14px;font-size:11px;line-height:1.6;color:#9a3412;">
            发送时刻<br><span style="font-size:13px;font-weight:700;color:#7c2d12;">${escapeHtml(time)}</span>
            <span style="color:#c2410c;"> · ${escapeHtml(zone)}</span>
          </td>
        </tr></table>
      </td></tr>
    </table>
  </td></tr></table>
</body>`);

const buildNotice = (subject, body, time, zone) => wrapDocument(subject, `
<body style="margin:0;padding:0;background:#e7eef0;color:#134e4a;font-family:${FONT};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:28px 8px;"><tr><td align="center">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:590px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #c5d5d8;">
      <tr><td style="padding:22px 24px;background:#0f766e;color:#ecfdf5;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>
          <td style="font-size:10px;letter-spacing:.2em;opacity:.85;">DINQOR AI</td>
          <td align="right" style="font-size:10px;opacity:.75;">NOTICE</td>
        </tr></table>
        <h1 style="margin:12px 0 0;font-size:20px;line-height:1.35;font-weight:700;color:#fff;">${escapeHtml(subject)}</h1>
      </td></tr>
      <tr><td style="padding:22px 24px 26px;">
        <div style="padding:16px 18px;background:#f0fdfa;border-radius:12px;border:1px solid #ccfbf1;font-size:14px;line-height:1.8;color:#115e59;word-break:break-word;">${body}</div>
        <div style="margin-top:18px;font-size:11px;line-height:1.7;color:#5f7a78;">计划发送时间：${escapeHtml(time)}<br>时区：${escapeHtml(zone)}</div>
      </td></tr>
    </table>
  </td></tr></table>
</body>`);

export const buildReminderPreviewHtml = ({
    subject,
    message,
    templateId = TEMPLATE_NONE,
    scheduledLabel = '—',
    timezone = 'Asia/Shanghai',
}) => {
    const title = subject || 'DinQorAI';
    const text = message || '';
    const contentType = resolveContentType(text, templateId);

    if (contentType !== 'HTML') {
        return wrapDocument(title, `
<body style="margin:0;padding:16px;background:#fff;color:#111;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;">
  <pre style="margin:0;white-space:pre-wrap;word-break:break-word;font-size:13px;line-height:1.7;">${escapeHtml(text)}</pre>
</body>`);
    }

    if (looksLikeFullHtmlDocument(text)) {
        return text;
    }

    const body = text;
    const layout = templateId && templateId !== TEMPLATE_NONE ? templateId : TEMPLATE_NONE;
    switch (layout) {
        case 'minimal':
            return buildMinimal(title, body, scheduledLabel, timezone);
        case 'card':
            return buildCard(title, body, scheduledLabel, timezone);
        case 'notice':
            return buildNotice(title, body, scheduledLabel, timezone);
        case 'classic':
            return buildClassic(title, body, scheduledLabel, timezone);
        default:
            return buildRaw(title, body);
    }
};
