const FEST = FESTIVALS[document.documentElement.dataset.festival];
const GREETINGS = FEST.greetings;
const PROMPTS = FEST.prompts;
const STYLE_PREVIEW = FEST.stylePreview;

/* ══════════════ FESTIVAL BOOTSTRAP ══════════════
   The markup is identical for every festival; only these pieces are data. */
document.querySelectorAll('[data-fest]').forEach((el) => {
    const v = FEST[el.dataset.fest];
    if (v) el.textContent = v;
});

document.getElementById('styleChips').innerHTML = FEST.styles.map((st, i) => `
    <button type="button" class="chip" data-style="${st.key}" role="radio" aria-checked="${i === 0}">
        <img src="${st.after}" alt="" loading="eager" decoding="async">
        <span>${st.label}</span>
    </button>`).join('');

document.getElementById('previewAfter').src = FEST.styles[0].after;



/* ══════════════ PERSONAL GREETING ══════════════ */
/* ══════════════ CLIPBOARD ══════════════ */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (_) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        ta.setAttribute('readonly', '');
        document.body.appendChild(ta);
        ta.select();
        let ok = false;
        try { ok = document.execCommand('copy'); } catch (_) { ok = false; }
        document.body.removeChild(ta);
        return ok;
    }
}

/* ══════════════ TOAST ══════════════ */
let toastTimer = null;
function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 4200);
}

/* ══════════════ REVEAL ON SCROLL ══════════════ */
const reveals = document.querySelectorAll('.reveal');
const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const peers = Array.from(el.parentElement.querySelectorAll('.reveal'));
        el.style.transitionDelay = (peers.indexOf(el) * 130) + 'ms';
        el.classList.add('visible');
        revealIO.unobserve(el);
    });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
reveals.forEach((el) => revealIO.observe(el));

/* ══════════════ BEFORE / AFTER SLIDER ══════════════
   Pointer Events cover mouse, touch and pen in one path.
   Keyboard: arrows nudge, Home/End jump — the slider is focusable
   and exposes role="slider" so it is usable without a pointer.     */
function setSlider(el, pct) {
    pct = Math.max(0, Math.min(100, pct));
    el.querySelector('.ba-after').style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
    el.querySelector('.ba-slider-line').style.left = pct + '%';
    el.querySelector('.ba-slider-handle').style.left = pct + '%';
    const rounded = Math.round(pct);
    el.setAttribute('aria-valuenow', rounded);
    el.setAttribute('aria-valuetext', rounded + ' אחוז');
}

function pctFromEvent(el, e) {
    const rect = el.getBoundingClientRect();
    return ((e.clientX - rect.left) / rect.width) * 100;
}

document.querySelectorAll('[data-ba]').forEach((el) => {
    el.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        el.setPointerCapture(e.pointerId);
        setSlider(el, pctFromEvent(el, e));
    });

    el.addEventListener('pointermove', (e) => {
        if (!el.hasPointerCapture(e.pointerId)) return;
        e.preventDefault();
        setSlider(el, pctFromEvent(el, e));
    });

    const release = (e) => {
        if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    };
    el.addEventListener('pointerup', release);
    el.addEventListener('pointercancel', release);

    el.addEventListener('keydown', (e) => {
        const now = parseFloat(el.getAttribute('aria-valuenow')) || 50;
        const step = e.shiftKey ? 10 : 4;
        let next = null;
        // RTL: ArrowRight moves the handle right on screen either way
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = now + step;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = now - step;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = 100;
        if (next === null) return;
        e.preventDefault();
        setSlider(el, next);
    });
});

/* ══════════════ GREETING STUDIO ══════════════
   The AI is no longer asked to write Hebrew — it leaves the top of the
   frame clean and the greeting is composited here on a canvas. That is
   the only way to get correct spelling every time, let the text be
   edited after the fact, and produce one file per family from a single
   generated image.

   renderGreetingCard() deliberately returns a Blob rather than driving
   the download itself: the sharing layer added later consumes the same
   Blob without touching any of this.                                  */

/* GREETINGS and PROMPTS come from festivals.js */

/* Two palettes, because one does not survive both looks: a dark scrim
   with gold lettering reads on a dusk photograph and ruins the pale
   sky of the watercolour, and the ink-on-cream pair does the reverse. */
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

const studio = {
    img: null,
    pos: 'top',
    style: 'dark',
    el: {
        dropzone: document.getElementById('dropzone'),
        dzTitle: document.getElementById('dzTitle'),
        dzSub: document.getElementById('dzSub'),
        file: document.getElementById('fileInput'),
        presets: document.getElementById('presets'),
        title: document.getElementById('gTitle'),
        body: document.getElementById('gBody'),
        family: document.getElementById('gFamily'),
        posSeg: document.getElementById('posSeg'),
        styleSeg: document.getElementById('styleSeg'),
        canvas: document.getElementById('cardCanvas'),
        empty: document.getElementById('stageEmpty'),
        download: document.getElementById('btnDownload'),
        share: document.getElementById('btnShare')
    }
};

/* ── preset list ── */
GREETINGS.forEach((g, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'preset';
    b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
    b.innerHTML = '<span class="preset-title"></span><span class="preset-body"></span>';
    b.querySelector('.preset-title').textContent = g.title;
    b.querySelector('.preset-body').textContent = g.body;
    b.addEventListener('click', () => {
        studio.el.presets.querySelectorAll('.preset')
            .forEach((p) => p.setAttribute('aria-pressed', 'false'));
        b.setAttribute('aria-pressed', 'true');
        studio.el.title.value = g.title;
        studio.el.body.value = g.body;
        draw();
    });
    studio.el.presets.appendChild(b);
});
studio.el.title.value = GREETINGS[0].title;
studio.el.body.value = GREETINGS[0].body;

/* ── image intake: click, drag, paste ── */
function loadImageFile(file) {
    if (!file || !file.type.startsWith('image/')) {
        showToast('זה לא קובץ תמונה');
        return;
    }
    const url = URL.createObjectURL(file);
    const im = new Image();
    im.onload = () => {
        studio.img = im;
        studio.el.dropzone.classList.remove('pulse');
        studio.el.dropzone.classList.add('loaded');
        if (wiz.step !== 4) goStep(4);
        studio.el.dzTitle.textContent = 'תמונה נטענה ✓';
        studio.el.dzSub.textContent = im.naturalWidth + '×' + im.naturalHeight + ' - לחצו להחלפה';
        draw();
    };
    im.onerror = () => {
        URL.revokeObjectURL(url);
        showToast('לא הצלחנו לפתוח את התמונה');
    };
    im.src = url;
}

studio.el.file.addEventListener('change', (e) => loadImageFile(e.target.files[0]));

['dragenter', 'dragover'].forEach((ev) =>
    studio.el.dropzone.addEventListener(ev, (e) => {
        e.preventDefault();
        studio.el.dropzone.classList.add('over');
    }));
['dragleave', 'drop'].forEach((ev) =>
    studio.el.dropzone.addEventListener(ev, (e) => {
        e.preventDefault();
        studio.el.dropzone.classList.remove('over');
    }));
studio.el.dropzone.addEventListener('drop', (e) => {
    if (e.dataTransfer.files.length) loadImageFile(e.dataTransfer.files[0]);
});

// paste straight from the AI chat — the shortest path there is
window.addEventListener('paste', (e) => {
    const item = [...(e.clipboardData?.items || [])].find((i) => i.type.startsWith('image/'));
    if (!item) return;
    loadImageFile(item.getAsFile());
    document.getElementById('studio').scrollIntoView({ block: 'center' });
});

/* ── controls ── */
[studio.el.title, studio.el.body, studio.el.family].forEach((el) =>
    el.addEventListener('input', draw));

studio.el.posSeg.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-pos]');
    if (!b) return;
    studio.pos = b.dataset.pos;
    studio.el.posSeg.querySelectorAll('button')
        .forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    draw();
});

studio.el.styleSeg.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-style]');
    if (!b) return;
    studio.style = b.dataset.style;
    studio.el.styleSeg.querySelectorAll('button')
        .forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    draw();
});

studio.el.family.addEventListener('input', () => { studio.el.family.dataset.touched = '1'; });

/* ── canvas render ── */
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

async function paint() {
    const img = studio.img;
    if (!img) return null;

    // Heebo must be resolved before the first measureText, otherwise every
    // width is computed against the fallback face and the wrap is wrong.
    try {
        await Promise.all([
            document.fonts.load('800 100px Heebo'),
            document.fonts.load('400 100px Heebo'),
            document.fonts.load('700 100px Heebo')
        ]);
        await document.fonts.ready;
    } catch (_) { /* fall back to system face */ }

    const MAX = 1600;
    const scale = Math.min(1, MAX / Math.max(img.naturalWidth, img.naturalHeight));
    const W = Math.round(img.naturalWidth * scale);
    const H = Math.round(img.naturalHeight * scale);

    const c = studio.el.canvas;
    c.width = W;
    c.height = H;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(img, 0, 0, W, H);

    const title = studio.el.title.value.trim();
    const body = studio.el.body.value.trim();
    const family = studio.el.family.value.trim();
    if (!title && !body && !family) return c;

    const top = studio.pos === 'top';
    const fsTitle = W * 0.072;
    const fsBody = W * 0.036;
    const fsFam = W * 0.032;
    const maxW = W * 0.84;

    ctx.direction = 'rtl';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    ctx.font = `400 ${fsBody}px Heebo, Arial, sans-serif`;
    const bodyLines = body ? wrapLines(ctx, body, maxW) : [];

    const lhBody = fsBody * 1.5;
    const blockH = (title ? fsTitle * 1.30 : 0)
        + (bodyLines.length ? fsBody * 0.5 + bodyLines.length * lhBody : 0)
        + (family ? fsFam * 1.7 : 0);

    // readability scrim — a gradient, not a text shadow: shadows lose
    // against a bright sky, a scrim never does
    const pad = H * 0.055;
    const scrimH = Math.min(H * 0.62, blockH + pad * 2.4);
    const T = TEXT_STYLES[studio.style] || TEXT_STYLES.dark;
    const sc = T.scrim.join(',');
    const g = top
        ? ctx.createLinearGradient(0, 0, 0, scrimH)
        : ctx.createLinearGradient(0, H, 0, H - scrimH);
    g.addColorStop(0, `rgba(${sc},${T.scrimAlpha})`);
    g.addColorStop(0.55, `rgba(${sc},${T.scrimAlpha * 0.49})`);
    g.addColorStop(1, `rgba(${sc},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(0, top ? 0 : H - scrimH, W, scrimH);

    let y = top ? pad : H - pad - blockH;
    const cx = W / 2;

    if (title) {
        ctx.font = `800 ${fsTitle}px Heebo, Arial, sans-serif`;
        ctx.fillStyle = T.title;
        ctx.shadowColor = T.shadow;
        ctx.shadowBlur = fsTitle * 0.22;
        ctx.fillText(title, cx, y);
        ctx.shadowBlur = 0;
        y += fsTitle * 1.30;

        // gold rule under the title
        const rw = Math.min(maxW * 0.5, ctx.measureText(title).width * 0.8);
        const rg = ctx.createLinearGradient(cx - rw / 2, 0, cx + rw / 2, 0);
        rg.addColorStop(0, T.rule + '0)');
        rg.addColorStop(0.5, T.rule + '0.95)');
        rg.addColorStop(1, T.rule + '0)');
        ctx.fillStyle = rg;
        ctx.fillRect(cx - rw / 2, y - fsTitle * 0.14, rw, Math.max(1, W * 0.0016));
    }

    if (bodyLines.length) {
        y += fsBody * 0.5;
        ctx.font = `400 ${fsBody}px Heebo, Arial, sans-serif`;
        ctx.fillStyle = T.body;
        ctx.shadowColor = T.shadow;
        ctx.shadowBlur = fsBody * 0.3;
        bodyLines.forEach((ln) => { ctx.fillText(ln, cx, y); y += lhBody; });
        ctx.shadowBlur = 0;
    }

    if (family) {
        y += fsFam * 0.5;
        ctx.font = `700 ${fsFam}px Heebo, Arial, sans-serif`;
        ctx.fillStyle = T.sign;
        ctx.shadowColor = T.shadow;
        ctx.shadowBlur = fsFam * 0.3;
        ctx.fillText(family, cx, y);
        ctx.shadowBlur = 0;
    }

    return c;
}

let drawQueued = false;
async function draw() {
    if (drawQueued) return;
    drawQueued = true;
    const run = async () => {
        drawQueued = false;
        const c = await paint();
        const ready = !!c;
        studio.el.canvas.hidden = !ready;
        studio.el.empty.hidden = ready;
        studio.el.download.disabled = !ready;
        studio.el.share.disabled = !ready;
    };
    // rAF is throttled to nothing in a background tab, which would leave
    // the preview stale and the buttons dead after a tab switch
    if (document.hidden) run();
    else requestAnimationFrame(run);
}

/* Returns the finished card as a Blob. The share layer plugs in here. */
async function renderGreetingCard() {
    const c = await paint();
    if (!c) return null;
    return new Promise((res) => c.toBlob(res, 'image/jpeg', 0.92));
}

/* Web Share with a file attached — the phone's own share sheet, so the
   card reaches WhatsApp without a download-then-attach detour. Feature
   detection has to probe with a real File: several browsers expose
   navigator.share while refusing files. */
(function wireShare() {
    let supported = false;
    try {
        const probe = new File([new Blob(['x'])], 'p.jpg', { type: 'image/jpeg' });
        supported = !!navigator.canShare && navigator.canShare({ files: [probe] });
    } catch (_) { supported = false; }

    if (!supported) return;          // stays hidden; download carries the flow
    studio.el.share.hidden = false;

    studio.el.share.addEventListener('click', async () => {
        const blob = await renderGreetingCard();
        if (!blob) return;
        const file = new File([blob], 'shana-tova.jpg', { type: 'image/jpeg' });
        try {
            await navigator.share({ files: [file], title: FEST.shareTitle });
            if (typeof gtag === 'function') {
                gtag('event', 'share_card', { method: 'web_share' });
            }
        } catch (err) {
            // dismissing the sheet throws AbortError; that is not a failure
            if (err && err.name !== 'AbortError') {
                showToast('השיתוף נכשל - אפשר להוריד ולשלוח ידנית');
            }
        }
    });
})();

studio.el.download.addEventListener('click', async () => {
    const blob = await renderGreetingCard();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shana-tova.jpg';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    showToast('הגלויה ירדה 🍎');
    if (typeof gtag === 'function') {
        gtag('event', 'download_card', {
            position: studio.pos,
            has_family: studio.el.family.value.trim().length > 0
        });
    }
});


/* ══════════════ WIZARD ══════════════ */
const WIZ_KEY = 'roshHashana:wiz';
const wiz = {
    step: 1,
    style: null,
    el: {
        root: document.getElementById('wiz'),
        nav: document.getElementById('wizNav'),
        steps: [...document.querySelectorAll('.wiz-step')],
        tabs: [...document.querySelectorAll('.wiz-tab')]
    }
};

function wizReachable(n) {
    if (n <= 1) return true;
    return !!wiz.style;           // nothing downstream means anything without a style
}

function goStep(n, opts = {}) {
    if (!wizReachable(n)) return;
    wiz.step = n;
    wiz.el.steps.forEach((sec) => { sec.hidden = Number(sec.dataset.step) !== n; });
    wiz.el.tabs.forEach((t) => {
        const i = Number(t.dataset.go);
        t.setAttribute('aria-selected', String(i === n));
        t.classList.toggle('done', i < n);
        t.disabled = !wizReachable(i);
    });
    if (!opts.silent) wiz.el.root.scrollIntoView({ block: 'start' });
    saveWiz();
    if (typeof gtag === 'function') gtag('event', 'wizard_step', { step: n, style: wiz.style || '' });
}

function pickStyle(key) {
    wiz.style = key;
    document.querySelectorAll('.chip').forEach((c) =>
        c.setAttribute('aria-checked', String(c.dataset.style === key)));
    const after = document.getElementById('previewAfter');
    if (after && STYLE_PREVIEW[key]) after.src = STYLE_PREVIEW[key];
    const n1 = document.getElementById('next1');
    if (n1) n1.disabled = false;
    wiz.el.tabs.forEach((t) => { t.disabled = !wizReachable(Number(t.dataset.go)); });
    saveWiz();
}


document.getElementById('styleChips').addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (chip) pickStyle(chip.dataset.style);
});

wiz.el.root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-go]');
    if (!b || b.classList.contains('card')) return;
    goStep(Number(b.dataset.go));
});

/* ── step 3: hand off with the chosen style's prompt ── */
document.querySelectorAll('.launch-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
        const variants = PROMPTS[wiz.style];
        if (!variants) { goStep(1); return; }
        const target = btn.dataset.target;
        const prompt = target === 'chatgpt' ? variants.chatgpt : variants.gemini;

        const copyPromise = copyToClipboard(prompt);

        if (target !== 'copy') {
            // AI Studio accepts ?prompt=, but running anything there needs a
            // Cloud project with billing attached — on an ordinary account it
            // answers "permission denied". The Gemini app is free and works;
            // it just has no prompt parameter, so it opens blank and the
            // visitor pastes what is already on the clipboard.
            const url = target === 'chatgpt'
                ? 'https://chatgpt.com/?q=' + encodeURIComponent(prompt)
                : 'https://gemini.google.com/app';
            window.open(url, '_blank', 'noopener');
            markLeftForChat();
        }

        const ok = await copyPromise;

        if (typeof gtag === 'function') {
            gtag('event', 'copy_prompt', { template: wiz.style, target: target });
        }

        if (target === 'copy') {
            showToast(ok ? 'הפרומפט הועתק 📋' : 'ההעתקה נכשלה - סמנו והעתיקו ידנית');
        } else if (target === 'chatgpt') {
            showToast('הפרומפט כבר בצ׳אט - צרפו את התמונה ושלחו 📸');
        } else if (ok) {
            showToast('הפרומפט הועתק! צרפו תמונה, הדביקו (Ctrl+V) ושלחו');
        } else {
            showToast('פתחנו את Gemini - חזרו ולחצו "העתק פרומפט בלבד"');
        }
    });
});

/* ── remember every choice, so the return trip resumes ── */
function saveWiz() {
    try {
        localStorage.setItem(WIZ_KEY, JSON.stringify({
            step: wiz.step,
            style: wiz.style,
            title: studio.el.title.value,
            body: studio.el.body.value,
            family: studio.el.family.value,
            pos: studio.pos,
            textStyle: studio.style
        }));
    } catch (_) { }
}

pickStyle(FEST.styles[0].key);          // a sensible default beats an empty first screen

(function restoreWiz() {
    let d = null;
    try { d = JSON.parse(localStorage.getItem(WIZ_KEY) || 'null'); } catch (_) { }
    if (!d) { goStep(1, { silent: true }); return; }

    if (d.style && PROMPTS[d.style]) pickStyle(d.style);
    if (d.title) studio.el.title.value = d.title;
    if (d.body) studio.el.body.value = d.body;
    if (d.family) studio.el.family.value = d.family;
    if (d.pos) {
        studio.pos = d.pos;
        studio.el.posSeg.querySelectorAll('button')
            .forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.pos === d.pos)));
    }
    if (d.textStyle) {
        studio.style = d.textStyle;
        studio.el.styleSeg.querySelectorAll('button')
            .forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.style === d.textStyle)));
    }
    // step 4 without an image is a dead end on reload; fall back to 3
    const step = d.step === 4 && !studio.img ? 3 : (d.step || 1);
    goStep(wizReachable(step) ? step : 1, { silent: true });
})();

[studio.el.title, studio.el.body, studio.el.family].forEach((el) =>
    el.addEventListener('input', saveWiz));
studio.el.posSeg.addEventListener('click', saveWiz);
studio.el.styleSeg.addEventListener('click', saveWiz);

/* ══════════════ RETURN FROM THE CHAT ══════════════
   Coming back to a page scrolled to the top means hunting for the next
   step. If they left for a chat and still have no image loaded, put the
   drop zone in front of them.                                        */
const LEFT_KEY = 'roshHashana:leftForChat';

function markLeftForChat() {
    try { localStorage.setItem(LEFT_KEY, '1'); } catch (_) { }
}

document.addEventListener('visibilitychange', () => {
    if (document.hidden) return;
    let left = false;
    try { left = localStorage.getItem(LEFT_KEY) === '1'; } catch (_) { }
    if (!left || studio.img) return;
    try { localStorage.removeItem(LEFT_KEY); } catch (_) { }
    goStep(4);
    studio.el.dropzone.classList.add('pulse');
    setTimeout(() => studio.el.dropzone.classList.remove('pulse'), 4000);
});

/* A coarse pointer has no Ctrl+V and no drag — say what actually works. */
(function dropzoneCopy() {
    const touch = window.matchMedia('(pointer: coarse)').matches;
    studio.el.dzTitle.textContent = touch
        ? 'לחצו כאן לבחירת התמונה'
        : 'הדביקו כאן (Ctrl+V) או גררו';
    studio.el.dzSub.textContent = touch
        ? 'שמרו את התמונה מהצ׳אט, ואז בחרו אותה מהגלריה'
        : 'בצ׳אט: קליק ימני על התמונה ← העתקת תמונה. אין צורך להוריד קובץ';
})();

/* ══════════════ CAMERA PUSH ON SCROLL ══════════════
   The backdrop drifts slower than the page, so the frame reads as
   having depth. One rAF, one transform — nothing layout-affecting.  */
(function parallax() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const aurora = document.getElementById('aurora');
    if (!aurora) return;
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            // capped so the layer can never slide off its own overscan
            const y = Math.min(window.scrollY * 0.12, 150);
            aurora.style.transform = `translate3d(0, ${y}px, 0)`;
            ticking = false;
        });
    }, { passive: true });
})();

/* ══════════════ LETTERBOX FAILSAFE ══════════════
   The opening bars start covering the viewport. If the CSS animation
   never runs the page would stay black, so drop them unconditionally. */
setTimeout(() => {
    document.querySelectorAll('.film-bar').forEach((b) => b.remove());
}, 2200);

/* ══════════════ FLOATING MOTES ══════════════ */
(function seedMotes() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const host = document.getElementById('motes');
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 22; i++) {
        const m = document.createElement('span');
        m.className = 'mote';
        m.style.left = Math.random() * 100 + '%';
        m.style.animationDuration = (13 + Math.random() * 16) + 's';
        m.style.animationDelay = (Math.random() * -26) + 's';
        const size = 3 + Math.random() * 5;
        m.style.width = m.style.height = size + 'px';
        if (i % 3 === 0) {
            m.style.background = 'var(--pom-hot)';
            m.style.boxShadow = '0 0 12px var(--pom)';
        }
        frag.appendChild(m);
    }
    host.appendChild(frag);
})();
