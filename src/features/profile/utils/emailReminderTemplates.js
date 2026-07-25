/**
 * Email reminder layout templates + preview builders.
 * Keep in sync with backend EmailReminderMailTemplates.
 */

export const CONTENT_TYPES = ['PLAIN', 'HTML'];

export const TEMPLATE_IDS = ['classic', 'minimal', 'card', 'notice'];

export const HTML_STARTERS = {
    classic: '<p>你好，</p>\n<p>这是一封定时提醒，记得按时完成今天的事项。</p>\n<p style="color:#64748b;">—— Xander Lab</p>',
    minimal: '<p><strong>提醒</strong></p>\n<p>请在约定时间前完成相关准备。</p>',
    card: '<p style="font-size:18px;margin:0 0 12px;">⏰ 到点提醒</p>\n<p>别忘了今天安排的事项。</p>',
    notice: '<p><strong>通知</strong></p>\n<ul>\n  <li>核对收件信息</li>\n  <li>确认发送时间</li>\n</ul>',
};

const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const resolveBodyHtml = (message, contentType) => {
    const text = message || '';
    if (contentType === 'HTML') {
        return text;
    }
    return escapeHtml(text).replace(/\r\n|\r|\n/g, '<br>');
};

const footer = (time, zone) => (
    `<div style="margin-top:22px;padding-top:20px;border-top:1px solid #e8edf5;font-size:13px;line-height:1.7;color:#7b879b;">`
    + '这是你在 Xander Lab 设置的定时邮件提醒。<br>'
    + `计划发送时间：${escapeHtml(time)}（${escapeHtml(zone)}）`
    + '</div>'
);

const wrapDocument = (title, bodyInner) => (
    `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8">`
    + `<meta name="viewport" content="width=device-width,initial-scale=1">`
    + `<title>${escapeHtml(title)}</title></head>${bodyInner}</html>`
);

const buildClassic = (subject, body, time, zone) => wrapDocument(subject, `
<body style="margin:0;padding:0;background:#f4f7fb;color:#172033;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7fb;padding:24px 8px;"><tr><td align="center">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 12px 28px rgba(31,55,90,.10);">
      <tr><td style="padding:22px 24px;background:linear-gradient(135deg,#172554,#2563eb);color:#fff;">
        <div style="font-size:11px;letter-spacing:2px;opacity:.82;">XANDER LAB</div>
        <h1 style="margin:8px 0 0;font-size:20px;line-height:1.35;">${escapeHtml(subject)}</h1>
      </td></tr>
      <tr><td style="padding:22px 24px;">
        <div style="font-size:12px;font-weight:700;color:#2563eb;letter-spacing:.08em;">邮件正文</div>
        <div style="margin-top:12px;padding:16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;font-size:14px;line-height:1.75;color:#263348;word-break:break-word;">${body}</div>
        ${footer(time, zone)}
      </td></tr>
    </table>
  </td></tr></table>
</body>`);

const buildMinimal = (subject, body, time, zone) => wrapDocument(subject, `
<body style="margin:0;padding:0;background:#fafafa;color:#111;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:20px 8px;"><tr><td align="center">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#fff;border:1px solid #e5e7eb;">
      <tr><td style="border-top:4px solid #0f172a;padding:20px 22px 6px;">
        <div style="font-size:11px;color:#64748b;letter-spacing:.12em;">XANDER LAB</div>
        <h1 style="margin:10px 0 0;font-size:18px;font-weight:700;color:#0f172a;">${escapeHtml(subject)}</h1>
      </td></tr>
      <tr><td style="padding:8px 22px 22px;font-size:14px;line-height:1.75;color:#334155;word-break:break-word;">
        ${body}${footer(time, zone)}
      </td></tr>
    </table>
  </td></tr></table>
</body>`);

const buildCard = (subject, body, time, zone) => wrapDocument(subject, `
<body style="margin:0;padding:0;background:#fff7ed;color:#1c1917;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:20px 8px;"><tr><td align="center">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:580px;background:#ffffff;border-radius:14px;border:1px solid #fed7aa;">
      <tr><td style="padding:18px 22px;background:#ea580c;color:#fff;border-radius:14px 14px 0 0;">
        <div style="font-size:11px;opacity:.85;">定时提醒 · Xander Lab</div>
        <h1 style="margin:6px 0 0;font-size:18px;">${escapeHtml(subject)}</h1>
      </td></tr>
      <tr><td style="padding:20px 22px;font-size:14px;line-height:1.75;color:#292524;word-break:break-word;">
        ${body}${footer(time, zone)}
      </td></tr>
    </table>
  </td></tr></table>
</body>`);

const buildNotice = (subject, body, time, zone) => wrapDocument(subject, `
<body style="margin:0;padding:0;background:#ecfdf5;color:#064e3b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:20px 8px;"><tr><td align="center">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:12px;border:1px solid #a7f3d0;">
      <tr><td style="padding:18px 22px;background:#059669;color:#fff;">
        <div style="font-size:11px;letter-spacing:.08em;opacity:.9;">NOTICE</div>
        <h1 style="margin:6px 0 0;font-size:18px;">${escapeHtml(subject)}</h1>
      </td></tr>
      <tr><td style="padding:20px 22px;font-size:14px;line-height:1.75;color:#065f46;word-break:break-word;">
        <div style="padding:14px 16px;background:#f0fdf4;border-left:4px solid #10b981;border-radius:0 8px 8px 0;">${body}</div>
        ${footer(time, zone)}
      </td></tr>
    </table>
  </td></tr></table>
</body>`);

export const buildReminderPreviewHtml = ({
    subject,
    message,
    contentType = 'PLAIN',
    templateId = 'classic',
    scheduledLabel = '—',
    timezone = 'Asia/Shanghai',
}) => {
    const body = resolveBodyHtml(message, contentType);
    const title = subject || 'Xander Lab';
    switch (templateId) {
        case 'minimal':
            return buildMinimal(title, body, scheduledLabel, timezone);
        case 'card':
            return buildCard(title, body, scheduledLabel, timezone);
        case 'notice':
            return buildNotice(title, body, scheduledLabel, timezone);
        default:
            return buildClassic(title, body, scheduledLabel, timezone);
    }
};
