/**
 * paskol-form — Cloudflare Worker
 *
 * Receives dedications from the "פסקול תשפ״ז" landing page and stores them in
 * a KV namespace. Nothing is served publicly except POST /api/dedication;
 * reading submissions is done with `wrangler kv key list` or the export
 * endpoint below (protected by an admin token).
 *
 * Deploy: see ../README.md
 */

const ALLOWED_ORIGINS = [
  'https://megenimoref.github.io',
  'http://127.0.0.1:8080',
  'http://localhost:8080',
];

const MAX = { soldier: 80, phone: 20, unit: 120, song: 160, link: 500, msg: 300, sender: 80, senderPhone: 20 };

function cors(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

const json = (body, status, origin) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...cors(origin) },
  });

/** Trim to a max length and strip control characters. */
function clean(value, max) {
  return String(value ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
}

const phoneOk = (v) => /^0\d{1,2}-?\d{7}$/.test(v.replace(/\s/g, ''));

/* ============================================================
   SMS notification — Inforu v2, the same provider and payload
   shape the district CRMs use (see central-pikud smsService.ts).
   Credentials and recipients come from secrets only; when either
   is missing we stay quiet rather than failing a submission.
   ============================================================ */
const INFORU_URL = 'https://capi.inforu.co.il/api/v2/SMS/SendSms';

/** Israeli numbers: strip separators, 0XXXXXXXXX -> 972XXXXXXXXX. */
function normalizePhone(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.startsWith('972')) return digits;
  if (digits.startsWith('0')) return '972' + digits.slice(1);
  return digits;
}

async function notifySms(env, rec) {
  const cred = env.INFORU_BASE_CREDENTIALS;   // "Basic base64(user:token)"
  if (!cred || !env.NOTIFY_PHONE) return;     // not configured — nothing to do

  const recipients = String(env.NOTIFY_PHONE)
    .split(',')
    .map((p) => normalizePhone(p))
    .filter((p) => p.length >= 11)
    .map((p) => ({ PhoneNumber: p }));
  if (recipients.length === 0) return;

  const payload = {
    Data: {
      Message: `הקדשה חדשה · פסקול תשפ"ז\nמאת: ${rec.sender}\nשיר: ${rec.song}`,
      Recipients: recipients,
      Settings: { Sender: env.INFORU_SENDER || 'Megenim' },
    },
  };

  try {
    const res = await fetch(INFORU_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8', Authorization: cred },
      body: JSON.stringify(payload),
    });
    const body = await res.text();
    if (!res.ok) console.log('[sms] Inforu HTTP', res.status, body.slice(0, 200));
    else console.log('[sms] sent to', recipients.length, 'recipient(s)', body.slice(0, 120));
  } catch (err) {
    // A dedication is never lost because the SMS gateway had a bad minute.
    console.log('[sms] failed:', err && err.message);
  }
}

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin') || '';
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(origin) });

    // ---- admin export: GET /api/export -> every dedication, as JSON
    // Auth goes in the Authorization header, never the query string, so the
    // token never lands in browser history or an edge access log.
    if (request.method === 'GET' && url.pathname === '/api/export') {
      const auth = request.headers.get('Authorization') || '';
      const given = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
      if (!env.ADMIN_TOKEN || given !== env.ADMIN_TOKEN) {
        return json({ ok: false, error: 'unauthorized' }, 401, origin);
      }
      const items = [];
      let cursor;
      do {
        const page = await env.DEDICATIONS.list({ prefix: 'ded:', cursor });
        for (const k of page.keys) {
          const v = await env.DEDICATIONS.get(k.name);
          if (v) { try { items.push(JSON.parse(v)); } catch { /* skip corrupt row */ } }
        }
        cursor = page.list_complete ? undefined : page.cursor;
      } while (cursor);
      items.sort((a, b) => String(b.receivedAt).localeCompare(String(a.receivedAt)));
      return json({ ok: true, count: items.length, items }, 200, origin);
    }

    if (request.method !== 'POST' || url.pathname !== '/api/dedication') {
      return json({ ok: false, error: 'not found' }, 404, origin);
    }

    if (origin && !ALLOWED_ORIGINS.includes(origin)) {
      return json({ ok: false, error: 'forbidden origin' }, 403, origin);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ ok: false, error: 'bad json' }, 400, origin);
    }

    const rec = {
      soldier: clean(body.soldier, MAX.soldier),
      phone: clean(body.phone, MAX.phone),
      unit: clean(body.unit, MAX.unit),
      song: clean(body.song, MAX.song),
      link: clean(body.link, MAX.link),
      msg: clean(body.msg, MAX.msg),
      sender: clean(body.sender, MAX.sender),
      senderPhone: clean(body.senderPhone, MAX.senderPhone),
      campaign: clean(body.campaign, 40) || 'rosh-hashana-5787',
      receivedAt: new Date().toISOString(),
      country: request.headers.get('CF-IPCountry') || '',
    };

    if (!rec.soldier || !rec.unit || !rec.song || !rec.msg || !rec.sender || !phoneOk(rec.phone)) {
      return json({ ok: false, error: 'missing or invalid fields' }, 422, origin);
    }

    // Light abuse guard: at most 8 submissions per IP per hour.
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const rlKey = `rl:${ip}:${new Date().toISOString().slice(0, 13)}`;
    const hits = Number((await env.DEDICATIONS.get(rlKey)) || 0);
    if (hits >= 8) return json({ ok: false, error: 'rate limited' }, 429, origin);
    await env.DEDICATIONS.put(rlKey, String(hits + 1), { expirationTtl: 7200 });

    const id = `ded:${rec.receivedAt}:${crypto.randomUUID().slice(0, 8)}`;
    await env.DEDICATIONS.put(id, JSON.stringify({ id, ...rec }));

    // The sender should not wait on the SMS gateway to see "נשלח".
    ctx.waitUntil(notifySms(env, rec));

    return json({ ok: true, id }, 200, origin);
  },
};
