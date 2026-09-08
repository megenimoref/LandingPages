/* The ready-card flow: pick a finished card, write a blessing, send it.

   No AI and no upload. That also makes the result shareable as a link rather
   than a file, which matters because SMS cannot carry an image — the message
   carries a URL and this same page renders the card for whoever opens it. */

const FEST = FESTIVALS[document.documentElement.dataset.festival];
const CARDS = FEST.cards;
const GREETINGS = FEST.greetings;

const TEXT_STYLES = {
    dark: {
        scrim: [6, 2, 4], scrimAlpha: 0.78,
        title: '#FFE9A8', body: '#FFF4E0', sign: '#F5C542',
        rule: 'rgba(245,197,66,', shadow: 'rgba(0,0,0,0.55)'
    },
    light: {
        scrim: [255, 248, 232], scrimAlpha: 0.84,
        title: '#7A4410', body: '#4A3418', sign: '#8A5A18',
        rule: 'rgba(184,134,11,', shadow: 'rgba(255,250,235,0.75)'
    }
};

const state = { card: CARDS[0], step: 1 };
const $ = (id) => document.getElementById(id);

/* ══════════════ FESTIVAL COPY ══════════════ */
document.querySelectorAll('[data-fest]').forEach((el) => {
    const v = FEST[el.dataset.fest];
    if (v) el.textContent = v;
});

/* ══════════════ LINK CODEC ══════════════
   A preset plus a name is three short parameters. Free text has to travel
   whole, and Hebrew costs six characters each once percent-encoded, so it goes
   base64url — a third of the length, which is the difference between one SMS
   segment and four. */
const b64 = {
    enc: (s) => btoa(String.fromCharCode(...new TextEncoder().encode(s)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''),
    dec: (s) => new TextDecoder().decode(Uint8Array.from(
        atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0)))
};

function buildLink() {
    const p = new URLSearchParams();
    p.set('c', state.card.slug);
    const preset = GREETINGS.findIndex(
        (g) => g.title === $('gTitle').value.trim() && g.body === $('gBody').value.trim());
    if (preset > -1) {
        p.set('b', String(preset));
    } else {
        p.set('t', b64.enc($('gTitle').value.trim() + '\n' + $('gBody').value.trim()));
    }
    const sign = $('gSign').value.trim();
    if (sign) p.set('n', b64.enc(sign));
    return location.origin + location.pathname + '?' + p.toString();
}

function readLink() {
    const p = new URLSearchParams(location.search);
    if (!p.has('c')) return null;
    const card = CARDS.find((c) => c.slug === p.get('c'));
    if (!card) return null;
    let title = '', body = '';
    if (p.has('b')) {
        const g = GREETINGS[Number(p.get('b'))];
        if (g) ({ title, body } = g);
    } else if (p.has('t')) {
        try { [title, body = ''] = b64.dec(p.get('t')).split('\n'); } catch (_) { }
    }
    let sign = '';
    try { if (p.has('n')) sign = b64.dec(p.get('n')); } catch (_) { }
    return { card, title, body, sign };
}

/* ══════════════ RENDER ══════════════ */
function wrapLines(ctx, text, maxWidth) {
    const out = [];
    text.split('\n').forEach((para) => {
        const words = para.trim().split(/\s+/).filter(Boolean);
        if (!words.length) return;
        let line = words[0];
        for (let i = 1; i < words.length; i++) {
            const test = line + ' ' + words[i];
            if (ctx.measureText(test).width <= maxWidth) line = test;
            else { out.push(line); line = words[i]; }
        }
        out.push(line);
    });
    return out;
}

const imgCache = new Map();
function loadCard(slug) {
    if (imgCache.has(slug)) return imgCache.get(slug);
    const p = new Promise((res, rej) => {
        const im = new Image();
        im.onload = () => res(im);
        im.onerror = rej;
        im.src = `images/${slug}.webp`;
    });
    imgCache.set(slug, p);
    return p;
}

async function paint(canvas, { card, title, body, sign }) {
    // Heebo has to be resolved before the first measureText or every wrap
    // width is computed against the fallback face.
    try {
        await Promise.all([
            document.fonts.load('800 100px Heebo'),
            document.fonts.load('400 100px Heebo')
        ]);
        await document.fonts.ready;
    } catch (_) { }

    const img = await loadCard(card.slug);
    const W = img.naturalWidth, H = img.naturalHeight;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, W, H);

    const T = TEXT_STYLES[card.tone] || TEXT_STYLES.light;
    const fsTitle = W * 0.072, fsBody = W * 0.036, fsSign = W * 0.032;
    const maxW = W * 0.84;

    ctx.direction = 'rtl';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.font = `400 ${fsBody}px Heebo, Arial, sans-serif`;
    const lines = body ? wrapLines(ctx, body, maxW) : [];
    const lh = fsBody * 1.5;

    const blockH = (title ? fsTitle * 1.30 : 0)
        + (lines.length ? fsBody * 0.5 + lines.length * lh : 0)
        + (sign ? fsSign * 1.7 : 0);

    const pad = H * 0.055;
    const scrimH = Math.min(H * 0.62, blockH + pad * 2.4);
    const sc = T.scrim.join(',');
    const g = ctx.createLinearGradient(0, 0, 0, scrimH);
    g.addColorStop(0, `rgba(${sc},${T.scrimAlpha})`);
    g.addColorStop(0.55, `rgba(${sc},${T.scrimAlpha * 0.49})`);
    g.addColorStop(1, `rgba(${sc},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, scrimH);

    let y = pad;
    const cx = W / 2;

    if (title) {
        ctx.font = `800 ${fsTitle}px Heebo, Arial, sans-serif`;
        ctx.fillStyle = T.title;
        ctx.shadowColor = T.shadow;
        ctx.shadowBlur = fsTitle * 0.22;
        ctx.fillText(title, cx, y);
        ctx.shadowBlur = 0;
        y += fsTitle * 1.30;
        const rw = Math.min(maxW * 0.5, ctx.measureText(title).width * 0.8);
        const rg = ctx.createLinearGradient(cx - rw / 2, 0, cx + rw / 2, 0);
        rg.addColorStop(0, T.rule + '0)');
        rg.addColorStop(0.5, T.rule + '0.95)');
        rg.addColorStop(1, T.rule + '0)');
        ctx.fillStyle = rg;
        ctx.fillRect(cx - rw / 2, y - fsTitle * 0.14, rw, Math.max(2, W * 0.0016));
    }

    if (lines.length) {
        y += fsBody * 0.5;
        ctx.font = `400 ${fsBody}px Heebo, Arial, sans-serif`;
        ctx.fillStyle = T.body;
        ctx.shadowColor = T.shadow;
        ctx.shadowBlur = fsBody * 0.3;
        lines.forEach((ln) => { ctx.fillText(ln, cx, y); y += lh; });
        ctx.shadowBlur = 0;
    }

    if (sign) {
        y += fsSign * 0.5;
        ctx.font = `800 ${fsSign}px Heebo, Arial, sans-serif`;
        ctx.fillStyle = T.sign;
        ctx.shadowColor = T.shadow;
        ctx.shadowBlur = fsSign * 0.3;
        ctx.fillText(sign, cx, y);
        ctx.shadowBlur = 0;
    }
    return canvas;
}

/* ══════════════ RECIPIENT VIEW ══════════════ */
const incoming = readLink();
if (incoming) {
    $('sender').hidden = true;
    $('viewer').hidden = false;
    paint($('viewCanvas'), incoming);
    $('viewDownload').addEventListener('click', async () => {
        const c = await paint($('viewCanvas'), incoming);
        c.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'gmar-hatima-tova.jpg';
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 4000);
        }, 'image/jpeg', 0.92);
    });
    if (typeof gtag === 'function') gtag('event', 'card_received', { card: incoming.card.slug });
}

/* ══════════════ SENDER FLOW ══════════════ */
if (!incoming) {
    $('cardGallery').innerHTML = CARDS.map((c, i) => `
        <button type="button" class="pickcard" data-slug="${c.slug}" aria-pressed="${i === 0}">
            <img src="images/${c.slug}-thumb.webp" alt="${c.label}" loading="${i < 4 ? 'eager' : 'lazy'}"
                decoding="async">
            <span>${c.label}</span>
        </button>`).join('');

    $('presets').innerHTML = GREETINGS.map((g, i) => `
        <button type="button" class="preset" aria-pressed="${i === 0}" data-i="${i}">
            <span class="preset-title">${g.title}</span>
            <span class="preset-body">${g.body}</span>
        </button>`).join('');

    $('gTitle').value = GREETINGS[0].title;
    $('gBody').value = GREETINGS[0].body;

    const steps = [...document.querySelectorAll('.wiz-step')];
    const tabs = [...document.querySelectorAll('.wiz-tab')];

    function goStep(n, opts = {}) {
        state.step = n;
        steps.forEach((s) => { s.hidden = Number(s.dataset.step) !== n; });
        tabs.forEach((t) => {
            const i = Number(t.dataset.go);
            t.setAttribute('aria-selected', String(i === n));
            t.classList.toggle('done', i < n);
        });
        if (n === 3) refresh();
        if (!opts.silent) $('wiz').scrollIntoView({ block: 'start' });
        if (typeof gtag === 'function') gtag('event', 'card_step', { step: n });
    }

    $('cardGallery').addEventListener('click', (e) => {
        const b = e.target.closest('.pickcard');
        if (!b) return;
        state.card = CARDS.find((c) => c.slug === b.dataset.slug);
        document.querySelectorAll('.pickcard').forEach((x) =>
            x.setAttribute('aria-pressed', String(x === b)));
    });

    $('presets').addEventListener('click', (e) => {
        const b = e.target.closest('.preset');
        if (!b) return;
        document.querySelectorAll('.preset').forEach((x) =>
            x.setAttribute('aria-pressed', String(x === b)));
        const g = GREETINGS[Number(b.dataset.i)];
        $('gTitle').value = g.title;
        $('gBody').value = g.body;
    });

    $('wiz').addEventListener('click', (e) => {
        const b = e.target.closest('[data-go]');
        if (b) goStep(Number(b.dataset.go));
    });

    let queued = false;
    function refresh() {
        if (queued) return;
        queued = true;
        const run = async () => {
            queued = false;
            await paint($('cardCanvas'), {
                card: state.card,
                title: $('gTitle').value.trim(),
                body: $('gBody').value.trim(),
                sign: $('gSign').value.trim()
            });
            const link = buildLink();
            $('shareLink').value = link;
            const msg = `${$('gTitle').value.trim()}\n${link}`;
            // sms: takes the body after a ? on Android and after & on iOS;
            // both accept this form.
            $('sendSms').href = 'sms:?&body=' + encodeURIComponent(msg);
            $('sendWa').href = 'https://wa.me/?text=' + encodeURIComponent(msg);
            $('linkLen').textContent = link.length + ' תווים';
        };
        document.hidden ? run() : requestAnimationFrame(run);
    }

    ['gTitle', 'gBody', 'gSign'].forEach((id) => $(id).addEventListener('input', refresh));

    $('copyLink').addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText($('shareLink').value);
            showToast('הקישור הועתק 📋');
        } catch (_) {
            $('shareLink').select();
            showToast('סמנו והעתיקו ידנית');
        }
    });

    $('btnDownload').addEventListener('click', () => {
        $('cardCanvas').toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'gmar-hatima-tova.jpg';
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 4000);
            showToast('הגלויה ירדה 🕊️');
        }, 'image/jpeg', 0.92);
    });

    let canShareFile = false;
    try {
        const probe = new File([new Blob(['x'])], 'p.jpg', { type: 'image/jpeg' });
        canShareFile = !!navigator.canShare && navigator.canShare({ files: [probe] });
    } catch (_) { }

    function shareImage() {
        $('cardCanvas').toBlob(async (blob) => {
            const file = new File([blob], 'gmar-hatima-tova.jpg', { type: 'image/jpeg' });
            try {
                await navigator.share({ files: [file], title: FEST.shareTitle });
                if (typeof gtag === 'function') gtag('event', 'share_card', { method: 'file' });
            } catch (err) {
                if (err && err.name !== 'AbortError') showToast('השיתוף נכשל - אפשר להוריד ולשלוח ידנית');
            }
        }, 'image/jpeg', 0.92);
    }

    if (canShareFile) {
        $('btnShare').hidden = false;
        $('btnShare').addEventListener('click', shareImage);

        // The green button sends the picture through the phone's share sheet,
        // where WhatsApp is one of the destinations. A wa.me link would have
        // sent the page instead, and WhatsApp would preview the site's own
        // Open Graph image rather than this card.
        const wa = $('sendWa');
        wa.removeAttribute('href');
        wa.removeAttribute('target');
        wa.setAttribute('role', 'button');
        wa.textContent = '🟢 שליחת הגלויה כתמונה';
        wa.addEventListener('click', (e) => { e.preventDefault(); shareImage(); });
        $('shareHint').textContent = 'הכפתור הירוק שולח את התמונה עצמה. ה-SMS שולח קישור, כי הודעת טקסט לא יכולה לשאת תמונה.';
    } else {
        $('shareHint').textContent = 'במחשב אפשר להוריד את הגלויה ולצרף אותה ידנית. מהטלפון היא נשלחת כתמונה.';
    }

    goStep(1, { silent: true });
}

/* ══════════════ TOAST ══════════════ */
let toastTimer = null;
function showToast(msg) {
    const t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 3600);
}
