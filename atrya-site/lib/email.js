'use strict';

/**
 * Atrya Scheduling — Email helper
 *
 * Sends via Gmail using the same OAuth credentials as the calendar,
 * or falls back to SMTP_* env vars for non-Gmail SMTP.
 *
 * Required (Gmail OAuth mode — preferred):
 *   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN
 *   MAIL_FROM  (e.g. "Atrya Recruiting <phil.carstensen@caplend.de>")
 *
 * Alternative (SMTP):
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM
 */

let nodemailer;
try {
  nodemailer = require('nodemailer');
} catch (e) {
  nodemailer = null;
}

// ─── Transporter ─────────────────────────────────────────────────────────────

function isGmailOAuth(interviewer) {
  const rt = interviewer?.refreshToken || process.env.GOOGLE_REFRESH_TOKEN;
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && rt);
}

function isSmtpConfigured() {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function isEmailConfigured() {
  return !!(nodemailer && (isGmailOAuth() || isSmtpConfigured()));
}

function getTransporter(interviewer) {
  if (!nodemailer) return null;
  if (isGmailOAuth(interviewer)) {
    const refreshToken = interviewer?.refreshToken || process.env.GOOGLE_REFRESH_TOKEN;
    const user = interviewer?.email || process.env.MAIL_FROM_ADDRESS || process.env.CALENDAR_OWNER_EMAIL;
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type:         'OAuth2',
        user,
        clientId:     process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken,
      },
    });
  }
  if (isSmtpConfigured()) {
    return nodemailer.createTransport({
      host:   process.env.SMTP_HOST,
      port:   parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_PORT === '465',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return null;
}

async function sendMail({ to, subject, html, from, interviewer }) {
  const transporter = getTransporter(interviewer);
  if (!transporter) {
    console.warn('[email] not configured — would have sent to', to, ':', subject);
    return { skipped: true };
  }
  const senderName = interviewer?.name ? `${interviewer.name} · Atrya` : (process.env.MAIL_FROM || 'Atrya Recruiting');
  const senderAddr = interviewer?.email || process.env.MAIL_FROM_ADDRESS || process.env.SMTP_USER || 'hello@atrya.io';
  const fromAddr   = from || `${senderName} <${senderAddr}>`;
  await transporter.sendMail({ from: fromAddr, to, subject, html });
  return { sent: true };
}

// ─── Templates ───────────────────────────────────────────────────────────────

function fmtDate(iso, tz = 'Europe/Berlin') {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: tz,
  });
}

function fmtTime(iso, tz = 'Europe/Berlin') {
  return new Date(iso).toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit', timeZone: tz,
  });
}

function baseTemplate(bodyContent) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Atrya</title>
<style>
  body{margin:0;padding:0;background:#f0f4f9;font-family:'Helvetica Neue',Arial,sans-serif;color:#1a2744;}
  .wrap{max-width:580px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.10);}
  .header{background:#04060e;padding:32px 40px;text-align:center;}
  .header img{height:28px;}
  .header-word{color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-.02em;}
  .header-word span{color:#4FA8FF;}
  .body{padding:40px 40px 32px;}
  .meta-card{background:#f7f9ff;border:1px solid #e2eaf8;border-left:3px solid #4FA8FF;border-radius:8px;padding:20px 24px;margin:24px 0;}
  .meta-row{display:flex;gap:12px;align-items:flex-start;margin:8px 0;}
  .meta-label{color:#7a8eaa;font-size:13px;min-width:90px;padding-top:1px;}
  .meta-value{color:#1a2744;font-size:14px;font-weight:500;line-height:1.4;}
  .interviewer{display:flex;align-items:center;gap:16px;margin:24px 0;}
  .interviewer img{width:56px;height:56px;border-radius:50%;object-fit:cover;border:2px solid #4FA8FF;}
  .interviewer-name{font-weight:700;font-size:15px;color:#1a2744;}
  .interviewer-title{font-size:13px;color:#7a8eaa;margin-top:2px;}
  .btn{display:inline-block;margin:8px 4px 0;padding:13px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;}
  .btn-primary{background:#4FA8FF;color:#ffffff;}
  .btn-secondary{background:#f0f4f9;color:#1a2744;border:1px solid #d1daea;}
  .divider{border:none;border-top:1px solid #e8eef5;margin:28px 0;}
  .footer{padding:20px 40px 32px;text-align:center;font-size:12px;color:#9aaac0;line-height:1.6;}
  h1{font-size:22px;font-weight:700;color:#04060e;margin:0 0 8px;}
  p{font-size:15px;color:#3d4f6b;line-height:1.65;margin:0 0 14px;}
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <div class="header-word">atrya<span>.</span></div>
  </div>
  <div class="body">${bodyContent}</div>
  <div class="footer">
    Atrya GmbH &bull; Hamburg, Germany<br>
    Questions? Reply to this email or contact <a href="mailto:hello@atrya.io" style="color:#4FA8FF;">hello@atrya.io</a>
  </div>
</div>
</body>
</html>`;
}

// ─── Candidate confirmation ───────────────────────────────────────────────────

/**
 * @param {object} opts
 * @param {object} opts.slot         { startISO, endISO, label }
 * @param {object} opts.candidate    { firstName, lastName, email, role }
 * @param {object} opts.interviewer  { name, title, photo, bookingType }
 * @param {string} opts.meetLink     Google Meet URL (may be null)
 * @param {string} opts.cancelUrl    Cancel/reschedule URL
 * @param {string} opts.tz           Timezone string
 */
function renderCandidateConfirmation({ slot, candidate, interviewer, meetLink, cancelUrl, tz = 'Europe/Berlin' }) {
  const date     = fmtDate(slot.startISO, tz);
  const time     = fmtTime(slot.startISO, tz);
  const typeLabel = interviewer.bookingType?.label || 'Interview';
  const photoUrl  = interviewer.photo
    ? `https://atrya.io${interviewer.photo}`
    : '';

  const body = `
<h1>You're confirmed.</h1>
<p>Hi ${candidate.firstName}, your <strong>${typeLabel}</strong> with <strong>${interviewer.name}</strong> is scheduled. Here are the details:</p>

<div class="meta-card">
  <div class="meta-row"><span class="meta-label">Date</span><span class="meta-value">${date}</span></div>
  <div class="meta-row"><span class="meta-label">Time</span><span class="meta-value">${time} (${tz.replace('_', ' ')})</span></div>
  <div class="meta-row"><span class="meta-label">Duration</span><span class="meta-value">${interviewer.bookingType?.duration || 30} minutes</span></div>
  ${candidate.role ? `<div class="meta-row"><span class="meta-label">Role</span><span class="meta-value">${candidate.role}</span></div>` : ''}
  ${meetLink ? `<div class="meta-row"><span class="meta-label">Meeting</span><span class="meta-value"><a href="${meetLink}" style="color:#4FA8FF;">${meetLink}</a></span></div>` : ''}
</div>

<div class="interviewer">
  ${photoUrl ? `<img src="${photoUrl}" alt="${interviewer.name}">` : ''}
  <div>
    <div class="interviewer-name">${interviewer.name}</div>
    <div class="interviewer-title">${interviewer.title || ''}</div>
  </div>
</div>

${meetLink ? `<p style="margin-bottom:8px;"><a href="${meetLink}" class="btn btn-primary">Join Google Meet</a></p>` : ''}
${cancelUrl ? `<p style="font-size:13px;color:#9aaac0;margin-top:16px;">Need to reschedule? <a href="${cancelUrl}" style="color:#4FA8FF;">Cancel or find a new time</a>.</p>` : ''}`;

  return baseTemplate(body);
}

// ─── Interviewer notification ─────────────────────────────────────────────────

/**
 * @param {object} opts
 * @param {object} opts.slot         { startISO, endISO, label }
 * @param {object} opts.candidate    { firstName, lastName, email, role, linkedin, notes }
 * @param {object} opts.interviewer  { name, bookingType }
 * @param {string} opts.meetLink
 * @param {string} opts.adminUrl     Link to admin panel booking detail
 * @param {string} opts.tz
 */
function renderInterviewerNotification({ slot, candidate, interviewer, meetLink, adminUrl, tz = 'Europe/Berlin' }) {
  const date     = fmtDate(slot.startISO, tz);
  const time     = fmtTime(slot.startISO, tz);
  const typeLabel = interviewer.bookingType?.label || 'Interview';

  const body = `
<h1>New interview booked.</h1>
<p>A new <strong>${typeLabel}</strong> has been scheduled for <strong>${date} at ${time}</strong>.</p>

<div class="meta-card">
  <div class="meta-row"><span class="meta-label">Candidate</span><span class="meta-value">${candidate.firstName} ${candidate.lastName}</span></div>
  <div class="meta-row"><span class="meta-label">Email</span><span class="meta-value"><a href="mailto:${candidate.email}" style="color:#4FA8FF;">${candidate.email}</a></span></div>
  ${candidate.role ? `<div class="meta-row"><span class="meta-label">Applying for</span><span class="meta-value">${candidate.role}</span></div>` : ''}
  ${candidate.linkedin ? `<div class="meta-row"><span class="meta-label">LinkedIn</span><span class="meta-value"><a href="${candidate.linkedin}" style="color:#4FA8FF;">${candidate.linkedin}</a></span></div>` : ''}
  <div class="meta-row"><span class="meta-label">Date</span><span class="meta-value">${date}</span></div>
  <div class="meta-row"><span class="meta-label">Time</span><span class="meta-value">${time} (${tz.replace('_', ' ')})</span></div>
  ${meetLink ? `<div class="meta-row"><span class="meta-label">Meet</span><span class="meta-value"><a href="${meetLink}" style="color:#4FA8FF;">${meetLink}</a></span></div>` : ''}
</div>

${candidate.notes ? `<p><strong>Notes from candidate:</strong><br>${candidate.notes}</p>` : ''}

${meetLink ? `<a href="${meetLink}" class="btn btn-primary">Join Google Meet</a>` : ''}
${adminUrl ? `<a href="${adminUrl}" class="btn btn-secondary">View in Admin</a>` : ''}`;

  return baseTemplate(body);
}

// ─── Cancellation confirmation ────────────────────────────────────────────────

function renderCancellationConfirmation({ slot, candidate, interviewer, tz = 'Europe/Berlin' }) {
  const date      = fmtDate(slot.startISO, tz);
  const time      = fmtTime(slot.startISO, tz);
  const typeLabel = interviewer.bookingType?.label || 'Interview';

  const body = `
<h1>Interview cancelled.</h1>
<p>Hi ${candidate.firstName}, your <strong>${typeLabel}</strong> with <strong>${interviewer.name}</strong> scheduled for <strong>${date} at ${time}</strong> has been cancelled.</p>
<p style="color:#9aaac0;font-size:14px;">If you'd like to reschedule, please use the original booking link or contact us at <a href="mailto:hello@atrya.io" style="color:#4FA8FF;">hello@atrya.io</a>.</p>`;

  return baseTemplate(body);
}

module.exports = {
  isEmailConfigured,
  sendMail,
  renderCandidateConfirmation,
  renderInterviewerNotification,
  renderCancellationConfirmation,
};
