'use strict';

/**
 * Atrya Scheduling — Google Calendar helper
 *
 * Supports two auth modes (tried in order):
 *
 * 1. OAuth2 refresh-token mode  ← preferred
 *    GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN, CALENDAR_OWNER_EMAIL
 *
 * 2. Service-account mode  ← fallback
 *    GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, CALENDAR_OWNER_EMAIL
 *
 * Per-interviewer calendar override:
 *   If the interviewer data has a `calendarId` field, that Google calendar is queried
 *   instead of CALENDAR_OWNER_EMAIL. Useful once each interviewer authorises their
 *   own calendar. Until then, everything runs against the owner calendar.
 */

let google;
try {
  ({ google } = require('googleapis'));
} catch (e) {
  google = null;
}

// ─── Config ──────────────────────────────────────────────────────────────────

const TZ         = () => process.env.BOOKING_TIMEZONE         || 'Europe/Berlin';
const DAY_START  = () => parseInt(process.env.BOOKING_HOURS_START   || '9',  10);
const DAY_END    = () => parseInt(process.env.BOOKING_HOURS_END     || '18', 10);
const DAYS_AHEAD = () => parseInt(process.env.BOOKING_DAYS_AHEAD    || '21', 10);
const MIN_NOTICE = () => parseInt(process.env.BOOKING_MIN_NOTICE_HOURS || '24', 10);

// ─── Auth ─────────────────────────────────────────────────────────────────────

function isOAuthConfigured() {
  return !!(google &&
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_REFRESH_TOKEN &&
    process.env.CALENDAR_OWNER_EMAIL);
}

function isServiceAccountConfigured() {
  return !!(google &&
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_PRIVATE_KEY &&
    process.env.CALENDAR_OWNER_EMAIL);
}

function isConfigured() {
  return isOAuthConfigured() || isServiceAccountConfigured();
}

function getAuth() {
  if (!google) return null;
  if (isOAuthConfigured()) {
    const c = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
    );
    c.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
    return c;
  }
  if (isServiceAccountConfigured()) {
    return new google.auth.JWT({
      email:  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key:    (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      scopes: [
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/calendar.events',
      ],
    });
  }
  return null;
}

// ─── OAuth helpers ────────────────────────────────────────────────────────────

function getOAuthUrl(redirectUri) {
  if (!google) throw new Error('googleapis not installed');
  const c = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri,
  );
  return c.generateAuthUrl({
    access_type: 'offline',
    prompt:      'consent',
    scope: [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events',
    ],
  });
}

async function exchangeCodeForTokens(code, redirectUri) {
  if (!google) throw new Error('googleapis not installed');
  const c = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri,
  );
  const { tokens } = await c.getToken(code);
  return tokens;
}

// ─── Timezone helpers ─────────────────────────────────────────────────────────

function getTzOffsetHours(date, tz) {
  const noonUTC = new Date(date);
  noonUTC.setUTCHours(12, 0, 0, 0);
  const localHour = parseInt(
    new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', hour12: false })
      .format(noonUTC),
    10,
  );
  return localHour - 12;
}

function localToUTC(dateStr, h, m, tzOffset) {
  const utcH = h - tzOffset;
  const hh   = String(((utcH % 24) + 24) % 24).padStart(2, '0');
  const mm   = String(m).padStart(2, '0');
  return new Date(`${dateStr}T${hh}:${mm}:00Z`);
}

// ─── getAvailableSlots ────────────────────────────────────────────────────────

/**
 * Returns array of available time slots for a given date.
 * @param {string} dateStr   YYYY-MM-DD
 * @param {number} durationMins  Slot duration in minutes (e.g. 30, 45, 60)
 * @param {string|null} calendarId  Override calendar ID (null = use CALENDAR_OWNER_EMAIL)
 */
async function getAvailableSlots(dateStr, durationMins = 30, calendarId = null) {
  const tz     = TZ();
  const start  = DAY_START();
  const end    = DAY_END();
  const calId  = calendarId || process.env.CALENDAR_OWNER_EMAIL;

  const refDate  = new Date(dateStr + 'T12:00:00Z');
  const tzOffset = getTzOffsetHours(refDate, tz);

  const queryStart = localToUTC(dateStr, start, 0, tzOffset);
  const queryEnd   = localToUTC(dateStr, end,   0, tzOffset);

  if (!isConfigured() || !calId) {
    return generateSlots(dateStr, start, end, tzOffset, [], durationMins);
  }

  const auth     = getAuth();
  const calendar = google.calendar({ version: 'v3', auth });

  const fbRes = await calendar.freebusy.query({
    requestBody: {
      timeMin:  queryStart.toISOString(),
      timeMax:  queryEnd.toISOString(),
      timeZone: tz,
      items:    [{ id: calId }],
    },
  });

  const busy = (fbRes.data.calendars[calId]?.busy || []).map(b => ({
    start: new Date(b.start),
    end:   new Date(b.end),
  }));

  return generateSlots(dateStr, start, end, tzOffset, busy, durationMins);
}

function generateSlots(dateStr, start, end, tzOffset, busy, durationMins) {
  const minNotice = MIN_NOTICE();
  const now       = new Date();
  const minStart  = new Date(now.getTime() + minNotice * 60 * 60 * 1000);

  const slots = [];
  // Step through the day in increments of durationMins
  const stepMins = durationMins <= 30 ? 30 : durationMins;

  for (let h = start; h < end; h++) {
    for (let m = 0; m < 60; m += stepMins) {
      const totalStartMins = h * 60 + m;
      const totalEndMins   = totalStartMins + durationMins;
      if (totalEndMins > end * 60) continue;

      const slotStart = localToUTC(dateStr, h, m, tzOffset);
      const slotEnd   = new Date(slotStart.getTime() + durationMins * 60 * 1000);

      if (slotStart < minStart) continue;

      const isBusy = busy.some(b => slotStart < b.end && slotEnd > b.start);
      if (isBusy) continue;

      const endH = Math.floor(totalEndMins / 60);
      const endM = totalEndMins % 60;

      slots.push({
        label:    `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')} – ${String(endH).padStart(2,'0')}:${String(endM).padStart(2,'0')}`,
        startISO: slotStart.toISOString(),
        endISO:   slotEnd.toISOString(),
      });
    }
  }
  return slots;
}

// ─── createBookingEvent ───────────────────────────────────────────────────────

/**
 * @param {object} slot         { startISO, endISO, label }
 * @param {object} candidate    { firstName, lastName, email, role, linkedin, notes }
 * @param {object} interviewer  { name, email, calendarId, bookingType }
 */
async function createBookingEvent(slot, candidate, interviewer) {
  const calId = interviewer.calendarId || process.env.CALENDAR_OWNER_EMAIL;
  const typeLabel = interviewer.bookingType?.label || 'Interview';

  if (!isConfigured() || !calId) {
    return {
      id:          'mock_' + Date.now(),
      htmlLink:    '#',
      hangoutLink: null,
      summary:     `Atrya ${typeLabel} · ${candidate.firstName} ${candidate.lastName}`,
    };
  }

  const auth     = getAuth();
  const calendar = google.calendar({ version: 'v3', auth });
  const tz       = TZ();

  const slotDate = new Date(slot.startISO);
  const dateLabel = slotDate.toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: tz,
  });
  const timeLabel = slotDate.toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit', timeZone: tz,
  });

  const lines = [
    `Hi ${candidate.firstName},`,
    '',
    `Looking forward to our ${typeLabel} on ${dateLabel} at ${timeLabel} (Berlin time).`,
    '',
    candidate.role ? `Role you're applying for: ${candidate.role}` : '',
    '',
    'A Google Meet link is attached to this invite.',
    '',
    'If anything comes up, feel free to reach out directly.',
    '',
    `Best,`,
    interviewer.name,
    'Atrya',
  ].filter(l => l !== undefined);

  const privateProps = {};
  ['role', 'linkedin', 'notes'].forEach(k => {
    if (candidate[k]) privateProps[k] = String(candidate[k]).slice(0, 1024);
  });

  const attendees = [
    { email: calId, responseStatus: 'accepted' },
  ];
  if (interviewer.email && interviewer.email !== calId) {
    attendees.push({ email: interviewer.email, responseStatus: 'accepted' });
  }
  attendees.push({ email: candidate.email, displayName: `${candidate.firstName} ${candidate.lastName}` });

  const event = {
    summary:     `Atrya ${typeLabel} · ${candidate.firstName} ${candidate.lastName}`,
    description: lines.join('\n'),
    extendedProperties: { private: privateProps },
    start: { dateTime: slot.startISO, timeZone: tz },
    end:   { dateTime: slot.endISO,   timeZone: tz },
    attendees,
    conferenceData: {
      createRequest: {
        requestId:             `atrya-${Date.now()}`,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },
        { method: 'popup', minutes: 15 },
      ],
    },
  };

  const result = await calendar.events.insert({
    calendarId:            calId,
    requestBody:           event,
    conferenceDataVersion: 1,
    sendUpdates:           'none', // we send our own branded confirmation email
  });

  return result.data;
}

// ─── cancelBookingEvent ───────────────────────────────────────────────────────

async function cancelBookingEvent(eventId, calendarId) {
  if (!eventId || eventId.startsWith('mock_')) return { cancelled: false, reason: 'mock' };
  if (!isConfigured()) return { cancelled: false, reason: 'not_configured' };

  const calId = calendarId || process.env.CALENDAR_OWNER_EMAIL;
  const auth     = getAuth();
  const calendar = google.calendar({ version: 'v3', auth });

  await calendar.events.delete({
    calendarId: calId,
    eventId,
    sendUpdates: 'none',
  });
  return { cancelled: true };
}

// ─── getConfig ────────────────────────────────────────────────────────────────

function getConfig() {
  return {
    configured:  isConfigured(),
    oauthMode:   isOAuthConfigured(),
    timezone:    TZ(),
    daysAhead:   DAYS_AHEAD(),
    hoursStart:  DAY_START(),
    hoursEnd:    DAY_END(),
    minNotice:   MIN_NOTICE(),
  };
}

module.exports = {
  isConfigured,
  isOAuthConfigured,
  getOAuthUrl,
  exchangeCodeForTokens,
  getAvailableSlots,
  createBookingEvent,
  cancelBookingEvent,
  getConfig,
};
