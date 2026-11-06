'use strict';
/* ============ PT Planner — แอปจัดการลูกเทรนสำหรับเทรนเนอร์ ============ */

/* ---------- helpers ---------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const pad = n => String(n).padStart(2, '0');
const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const pd = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addD = (s, n) => { const d = pd(s); d.setDate(d.getDate() + n); return ymd(d); };
const today = () => ymd(new Date());
const DOW = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
const DOWS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
const MON = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
const MONS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const fmtShort = s => { const d = pd(s); return `${d.getDate()} ${MONS[d.getMonth()]}`; };
const fmtMid = s => { const d = pd(s); return `${DOWS[d.getDay()]} ${d.getDate()} ${MONS[d.getMonth()]}`; };
const fmtLong = s => { const d = pd(s); return `${DOW[d.getDay()]}ที่ ${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear() + 543}`; };
const fmtMonth = s => { const d = pd(s); return `${MON[d.getMonth()]} ${d.getFullYear() + 543}`; };
const wkStart = s => { const d = pd(s); d.setDate(d.getDate() - ((d.getDay() - S.settings.weekStart + 7) % 7)); return ymd(d); };
const toMin = t => { const [h, m] = (t || '0:0').split(':').map(Number); return h * 60 + m; };
const fromMin = m => { m = ((m % 1440) + 1440) % 1440; return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`; };
const endTime = s => fromMin(toMin(s.time) + (s.dur || 60));
const cmpS = (a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time);
const baht = n => '฿' + Number(n || 0).toLocaleString('th-TH');
const initial = n => ([...String(n || '?').trim()][0] || '?').toUpperCase();

const ICONS = {
  home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  cal: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  dumbbell: '<path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  gear: '<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>',
  l: '<polyline points="15 18 9 12 15 6"/>', r: '<polyline points="9 18 15 12 9 6"/>',
  check: '<polyline points="20 6 9 17 4 12"/>', x: '<path d="M18 6L6 18M6 6l12 12"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  share: '<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
  trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  up: '<polyline points="18 15 12 9 6 15"/>', down: '<polyline points="6 9 12 15 18 9"/>',
  play: '<polygon points="5 3 19 12 5 21 5 3"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  down2: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  up2: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
  more: '<circle cx="12" cy="5" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="12" cy="19" r="1.2"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  refresh: '<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>',
  video: '<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  scale: '<path d="M12 3v18M5 7h14M5 7l-3 8a4 4 0 0 0 6 0zM19 7l-3 8a4 4 0 0 0 6 0z"/>'
};
const ic = (n, c = '') => `<svg class="i ${c}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ''}</svg>`;

const COLORS = ['#FF6A3D', '#5B6CFF', '#10B981', '#F59E0B', '#EC4899', '#06B6D4', '#8B5CF6', '#EF4444', '#14B8A6', '#84CC16'];
const ACCENTS = ['#FF5A3C', '#E11D48', '#7C3AED', '#2563EB', '#0891B2', '#059669'];

/* ---------- state ---------- */
const KEY = 'ptplanner.v1';
const DEF = () => ({ v: 1, settings: { trainer: '', weekStart: 1, course: 10, dur: 60, theme: 'auto', accent: '#FF5A3C', lastTime: '17:00' }, clients: [], sessions: [], programs: [], customEx: [] });
let S = load();
function load() {
  try {
    const r = JSON.parse(localStorage.getItem(KEY));
    if (r && Array.isArray(r.clients)) { const d = DEF(); return Object.assign(d, r, { settings: Object.assign(d.settings, r.settings) }); }
  } catch (e) { /* ignore */ }
  return DEF();
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); }
  catch (e) { toast('พื้นที่จัดเก็บเต็ม — กรุณาสำรองข้อมูลและลบรูปที่ไม่ใช้'); }
}
const ui = { lc: 'all', ln: 48, lp: 'all', cm: 'week', cd: today(), cf: 'all', cq: '', ct: 'hist', pd: 0, lm: 'all', lq: '' };
const client = id => S.clients.find(c => c.id === id);
const prog = id => S.programs.find(p => p.id === id);

/* ---------- exercises ---------- */
let _exMap = null;
function allEx() { return EX.concat(S.customEx.map(e => ({ cat: 'strength', pm: e.pm || [], sm: [], aud: '', lvl: 'b', ...e, custom: true }))); }
function exById(id) {
  if (!_exMap) _exMap = new Map(allEx().map(e => [e.id, e]));
  return _exMap.get(id) || { id, th: '(ท่าที่ถูกลบ)', en: '', m: 'core', eq: 'other', tip: '', db: false };
}
const resetEx = () => { _exMap = null; };
function exImgs(ex) {
  if (ex.custom) return ex.img ? [ex.img] : [];
  return ex.db ? [IMG_BASE + ex.id + '/0.jpg', IMG_BASE + ex.id + '/1.jpg'] : [];
}
function media(ex, cls = '') {
  const im = exImgs(ex);
  const ph = `<div class="ph">${(MUSCLES[ex.m] || MUSCLES.core).e}</div>`;
  return `<div class="media ${cls} ${im.length > 1 ? 'anim' : ''}">${ph}${im.map(u => `<img src="${esc(u)}" loading="lazy" alt="" onerror="this.hidden=true">`).join('')}</div>`;
}
const ytLink = ex => ex.video || ('https://www.youtube.com/results?search_query=' + encodeURIComponent((ex.en || ex.th) + ' exercise proper form'));

/* ---------- course stats ---------- */
function stats(c) {
  const done = S.sessions.filter(x => x.clientId === c.id && x.status === 'done').length;
  let rest = done; const packs = [];
  (c.packs || []).forEach(p => {
    const pr = Math.min(p.prior || 0, p.total), cap = p.total - pr, f = Math.max(0, Math.min(cap, rest));
    rest -= f; packs.push({ p, used: pr + f, total: p.total });
  });
  const cur = packs.find(x => x.used < x.total) || null;
  const last = packs[packs.length - 1] || null;
  return { done, packs, cur, show: cur || last, left: cur ? cur.total - cur.used : 0, over: rest };
}
function doneLabels(c) {
  const ds = S.sessions.filter(x => x.clientId === c.id && x.status === 'done').sort(cmpS);
  const map = {}; let i = 0;
  (c.packs || []).forEach((p, pi) => {
    for (let k = Math.min(p.prior || 0, p.total); k < p.total && i < ds.length; k++, i++) map[ds[i].id] = `คอร์ส ${pi + 1} • ครั้งที่ ${k + 1}/${p.total}`;
  });
  for (; i < ds.length; i++) map[ds[i].id] = 'นอกคอร์ส';
  return map;
}
const sessionsOn = d => S.sessions.filter(s => s.date === d).sort(cmpS);
const isPast = s => s.date < today() || (s.date === today() && endTime(s) <= fromMin(new Date().getHours() * 60 + new Date().getMinutes()));

/* ---------- ui primitives ---------- */
let toastT;
function toast(msg, undo) {
  $('.toast')?.remove(); clearTimeout(toastT);
  const t = document.createElement('div'); t.className = 'toast';
  t.innerHTML = `<span>${msg}</span>${undo ? '<button>เลิกทำ</button>' : ''}`;
  if (undo) t.querySelector('button').onclick = () => { undo(); t.remove(); };
  document.body.appendChild(t);
  toastT = setTimeout(() => t.remove(), undo ? 5000 : 2800);
}
let sheetEl = null, popCb = null;
function sheet(title, body, o = {}) {
  const had = !!sheetEl;
  if (sheetEl) { sheetEl.remove(); sheetEl = null; }
  const w = document.createElement('div'); w.className = 'wrap';
  w.innerHTML = `<div class="sheet ${o.tall ? 'tall' : ''}" role="dialog" aria-modal="true">
    <div class="sh-h"><h2>${title}</h2><button class="ib" data-a="closeSheet" aria-label="ปิด">${ic('x')}</button></div>
    <div class="sh-b">${body}</div>${o.footer ? `<div class="sh-f">${o.footer}</div>` : ''}</div>`;
  w.addEventListener('click', e => { if (e.target === w) closeSheet(); });
  document.body.appendChild(w); sheetEl = w; document.body.style.overflow = 'hidden';
  if (!had) history.pushState({ sheet: 1 }, '');
  return w;
}
function removeSheet() { if (sheetEl) { sheetEl.remove(); sheetEl = null; } document.body.style.overflow = ''; }
function closeSheet(cb) {
  if (!sheetEl) { cb && cb(); return; }
  if (history.state && history.state.sheet) { popCb = cb || null; history.back(); }
  else { removeSheet(); cb && cb(); }
}
window.addEventListener('popstate', () => {
  if (sheetEl) removeSheet();
  if (popCb) { const f = popCb; popCb = null; f(); }
});
const fld = (label, inner, cls = '') => `<label class="fld ${cls}"><span>${label}</span>${inner}</label>`;
const go = p => { location.hash = p; };
function askConfirm(msg) { return window.confirm(msg); }
async function shareOrDownload(blob, filename, title) {
  const file = new File([blob], filename, { type: blob.type });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title: title || filename }); return; }
    catch (e) { if (e.name === 'AbortError') return; }
  }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

/* ---------- theme ---------- */
function applyTheme() {
  const t = S.settings.theme, dark = t === 'dark' || (t === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.t = dark ? 'dark' : 'light';
  const a = S.settings.accent || '#FF5A3C';
  document.documentElement.style.setProperty('--acc', a);
  document.documentElement.style.setProperty('--acc2', mix(a, '#FFB347', .45));
  $('meta[name=theme-color]')?.setAttribute('content', dark ? '#0E1017' : '#F3F4F8');
}
function mix(h1, h2, t) {
  const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const a = p(h1), b = p(h2);
  return '#' + a.map((v, i) => pad(Math.round(v + (b[i] - v) * t).toString(16))).join('');
}
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', applyTheme);

/* ---------- router ---------- */
const route = () => (location.hash.slice(1) || '/home').split('/').filter(Boolean);
let lastKey = '';
function render() {
  const r = route(), name = r[0] || 'home', y = window.scrollY, key = location.hash;
  const V = { home: vHome, cal: vCal, clients: vClients, client: vClient, lib: vLib, program: vProgram, train: vTrain, settings: vSettings }[name] || vHome;
  const app = $('#app');
  app.className = name === 'train' ? 'notab' : '';
  app.innerHTML = V(r[1], r[2]);
  const tabOf = { home: 'home', cal: 'cal', clients: 'clients', client: 'clients', program: 'clients', lib: 'lib', settings: 'home', train: 'clients' }[name];
  $$('.tab').forEach(t => t.classList.toggle('on', t.dataset.tab === tabOf));
  $('.tabbar').classList.toggle('hide', name === 'train');
  window.scrollTo(0, key === lastKey ? y : 0); lastKey = key;
}
window.addEventListener('hashchange', () => { if (sheetEl) removeSheet(); render(); });

function hdr(title, o = {}) {
  return `<div class="hdr">${o.back ? `<button class="ib" data-a="back" aria-label="กลับ">${ic('l')}</button>` : ''}<h1 class="${o.sm ? 'sm' : ''}">${title}</h1>${o.right || ''}</div>`;
}
const placeTag = pl => { const x = PLACES[pl || 'gym']; return `<span class="tag">${x.e} ${x.th}</span>`; };
const placeSeg = (v, name = 'place') => `<div class="fld"><span>สถานที่ฝึก</span><div class="seg">${Object.entries(PLACES).map(([k, x]) => `<label><input type="radio" name="${name}" value="${k}" ${v === k ? 'checked' : ''}><span>${x.e} ${x.th}</span></label>`).join('')}</div></div>`;
const goalTag = g => `<span class="tag ${g}">${GOALS[g].e} ${GOALS[g].th}</span>`;

/* ---------- session card ---------- */
function sCard(s, o = {}) {
  const c = client(s.clientId); if (!c) return '';
  const late = s.status === 'planned' && isPast(s);
  const right = s.status === 'planned'
    ? `<button class="chk" data-a="quickDone" data-id="${s.id}" aria-label="บันทึกว่าเทรนแล้ว">${ic('check')}</button>`
    : s.status === 'done' ? '<span class="badge ok">✓ เทรนแล้ว</span>' : '<span class="badge no">ยกเลิก</span>';
  let meta = o.date ? fmtMid(s.date) + ' • ' : '';
  meta += s.dur + ' นาที' + (late ? ' • ยังไม่บันทึก' : '') + (s.note ? ' • ' + esc(s.note) : '');
  return `<div class="scard ${s.status} ${late ? 'past-planned' : ''}" style="--c:${c.color}" data-a="openSession" data-id="${s.id}">
    <div class="stime"><b>${s.time}</b><span>${endTime(s)}</span></div>
    <div class="sbody"><div class="sname">${esc(c.name)}</div><div class="smeta">${meta}</div></div>${right}</div>`;
}

/* ============ VIEWS ============ */
function vHome() {
  const t = today(), h = new Date().getHours();
  const hi = h < 12 ? 'สวัสดีตอนเช้า' : h < 17 ? 'สวัสดีตอนบ่าย' : 'สวัสดีตอนเย็น';
  const tod = sessionsOn(t);
  const ws = wkStart(t), we = addD(ws, 7);
  const wk = S.sessions.filter(x => x.date >= ws && x.date < we && x.status !== 'cancel');
  const active = S.clients.filter(c => !c.archived);
  const monthKey = t.slice(0, 7);
  const income = S.clients.reduce((a, c) => a + (c.packs || []).filter(p => (p.start || '').startsWith(monthKey)).reduce((x, p) => x + (+p.price || 0), 0), 0);
  const alerts = active.map(c => ({ c, st: stats(c) })).filter(o => o.st.packs.length && (!o.st.cur || o.st.left <= 2));
  const pending = S.sessions.filter(s => s.status === 'planned' && isPast(s) && s.date >= addD(t, -30)).sort((a, b) => cmpS(b, a)).slice(0, 5);
  const upcoming = S.sessions.filter(s => s.status === 'planned' && s.date > t).sort(cmpS).slice(0, 4);

  let h1 = `<div class="hdr"><h1 style="font-size:15px;font-weight:700;color:var(--mut)">${fmtLong(t)}</h1><button class="ib" data-go="/settings" aria-label="ตั้งค่า">${ic('gear')}</button></div>`;
  h1 += `<div class="hero"><div class="hi">${hi}</div><div class="nm">${esc(S.settings.trainer || 'เทรนเนอร์')} 👋</div>
    <div class="stats"><div class="stat"><b>${tod.filter(s => s.status !== 'cancel').length}</b><span>นัดวันนี้</span></div>
    <div class="stat"><b>${wk.filter(s => s.status === 'done').length}/${wk.length}</b><span>เสร็จสัปดาห์นี้</span></div>
    <div class="stat"><b>${active.length}</b><span>ลูกเทรน</span></div></div></div>`;

  if (!S.clients.length) {
    h1 += `<div class="card"><h3>🚀 เริ่มต้นใช้งาน</h3>
      <div class="tip">เพิ่มลูกเทรนคนแรกพร้อมคอร์ส 10 ครั้ง</div>
      <div class="tip">นัดเทรนในปฏิทิน แล้วแตะ ✓ เมื่อเทรนเสร็จ ระบบนับครั้งให้อัตโนมัติ</div>
      <div class="tip">สร้างโปรแกรมเฉพาะบุคคลพร้อมภาพท่าออกกำลังกาย</div>
      <div style="display:grid;gap:8px;margin-top:12px"><button class="btn pri block" data-a="newClient">${ic('plus')} เพิ่มลูกเทรนคนแรก</button>
      <button class="btn block" data-a="demo">ลองใช้ด้วยข้อมูลตัวอย่าง</button></div></div>`;
    return h1;
  }

  h1 += `<div class="sec">วันนี้<span class="link" data-a="newSession" data-date="${t}">+ นัดเทรน</span></div>`;
  h1 += tod.length ? tod.map(s => sCard(s)).join('') : `<div class="card empty"><div class="big">🌤️</div>วันนี้ยังไม่มีนัดเทรน</div>`;

  if (pending.length) h1 += `<div class="sec">รอบันทึกผล <small>นัดที่ผ่านมาแล้ว</small></div>` + pending.filter(s => s.date !== t).map(s => sCard(s, { date: 1 })).join('');
  if (alerts.length) {
    h1 += `<div class="sec">ใกล้หมดคอร์ส</div><div class="card" style="padding:6px 14px">` + alerts.map(({ c, st }) =>
      `<div class="hist" data-go="/client/${c.id}"><div class="av" style="--c:${c.color};width:38px;height:38px;border-radius:12px;font-size:16px">${esc(initial(c.name))}</div>
      <div class="m"><b style="color:var(--text)">${esc(c.name)}</b><br>${st.cur ? `เหลือ ${st.left} ครั้ง` : 'จบคอร์สแล้ว'}</div>
      <button class="btn sm pri" data-a="renew" data-id="${c.id}">ต่อคอร์ส</button></div>`).join('') + '</div>';
  }
  if (upcoming.length) h1 += `<div class="sec">นัดถัดไป</div>` + upcoming.map(s => sCard(s, { date: 1 })).join('');
  if (income > 0) h1 += `<div class="card" style="display:flex;align-items:center;gap:12px"><div style="font-size:28px">💰</div><div style="flex:1"><div class="sub">ยอดคอร์สที่เริ่มเดือนนี้</div><b style="font-size:22px">${baht(income)}</b></div></div>`;
  return h1;
}

/* ----- calendar ----- */
function vCal() {
  const t = today(), wide = ui.cm === 'week';
  let h = '';
  if (wide) {
    const ws = wkStart(ui.cd), we = addD(ws, 6);
    const same = pd(ws).getMonth() === pd(we).getMonth();
    const title = same ? `${pd(ws).getDate()}–${pd(we).getDate()} ${MONS[pd(ws).getMonth()]}` : `${fmtShort(ws)} – ${fmtShort(we)}`;
    h += hdr(title, { right: `<button class="ib" data-a="calExport" aria-label="ส่งออกรูป">${ic('image')}</button><button class="ib acc" data-a="newSession" data-date="${ui.cd}" aria-label="เพิ่มนัด">${ic('plus')}</button>` });
    h += `<div class="sub" style="margin:-4px 2px 10px">${fmtMonth(ws)}</div>`;
    h += calBar();
    const days = [...Array(7)].map((_, i) => addD(ws, i));
    h += '<div class="dstrip">' + days.map(d => {
      const n = sessionsOn(d).filter(s => s.status !== 'cancel').length;
      return `<button class="dpill ${d === t ? 'today' : ''}" data-a="scrollDay" data-date="${d}"><small>${DOWS[pd(d).getDay()]}</small><b>${pd(d).getDate()}</b><i>${'<s></s>'.repeat(Math.min(n, 4))}</i></button>`;
    }).join('') + '</div>';
    let total = 0, done = 0;
    days.forEach(d => {
      const ss = sessionsOn(d); total += ss.filter(s => s.status !== 'cancel').length; done += ss.filter(s => s.status === 'done').length;
      h += `<div class="dayh ${d === t ? 'today' : ''}" id="d-${d}" style="scroll-margin-top:12px"><div class="nm">${DOW[pd(d).getDay()]}<small>${fmtShort(d)}</small></div><button class="add" data-a="newSession" data-date="${d}" aria-label="เพิ่มนัด">${ic('plus', 's')}</button></div>`;
      h += ss.length ? ss.map(s => sCard(s)).join('') : '<div class="free">ว่าง</div>';
    });
    h += `<div class="card" style="margin-top:18px;text-align:center" ><span class="sub">สัปดาห์นี้ทั้งหมด</span><br><b style="font-size:22px">${done}/${total}</b> <span class="sub">นัด เทรนเสร็จแล้ว</span></div>`;
  } else {
    const d0 = pd(ui.cd), first = new Date(d0.getFullYear(), d0.getMonth(), 1);
    const start = wkStart(ymd(first));
    let cells = [...Array(42)].map((_, i) => addD(start, i));
    if (pd(cells[35]).getMonth() !== d0.getMonth()) cells = cells.slice(0, 35);
    const hd = [...Array(7)].map((_, i) => DOWS[(S.settings.weekStart + i) % 7]);
    const mk = ymd(first).slice(0, 7);
    const ms = S.sessions.filter(s => s.date.startsWith(mk) && s.status !== 'cancel');
    h += hdr(fmtMonth(ui.cd), { right: `<button class="ib acc" data-a="newSession" data-date="${ui.cd}" aria-label="เพิ่มนัด">${ic('plus')}</button>` });
    h += calBar();
    h += '<div class="mgrid">' + hd.map(x => `<div class="dw">${x}</div>`).join('') + cells.map(d => {
      const ss = sessionsOn(d).filter(s => s.status !== 'cancel'), cols = [...new Set(ss.map(s => client(s.clientId)?.color).filter(Boolean))];
      return `<button class="mc ${pd(d).getMonth() !== d0.getMonth() ? 'out' : ''} ${d === t ? 'today' : ''} ${d === ui.cd ? 'sel' : ''}" data-a="calSel" data-date="${d}">${pd(d).getDate()}
        <span class="dd">${cols.slice(0, 3).map(c => `<s style="--c:${c}"></s>`).join('')}</span>${ss.length > 3 ? `<span class="more">+${ss.length - 3}</span>` : ''}</button>`;
    }).join('') + '</div>';
    h += `<div class="sub" style="margin:10px 4px 0">เดือนนี้ ${ms.filter(s => s.status === 'done').length}/${ms.length} นัดเทรนเสร็จแล้ว</div>`;
    const ss = sessionsOn(ui.cd);
    h += `<div class="dayh ${ui.cd === t ? 'today' : ''}"><div class="nm">${fmtLong(ui.cd)}</div></div>`;
    h += ss.length ? ss.map(s => sCard(s)).join('') : '<div class="free">ไม่มีนัดในวันนี้</div>';
  }
  return h;
}
function calBar() {
  return `<div style="display:flex;gap:8px;margin-bottom:12px;align-items:center">
    <button class="ib" data-a="calPrev" aria-label="ก่อนหน้า">${ic('l')}</button>
    <button class="ib" data-a="calNext" aria-label="ถัดไป">${ic('r')}</button>
    <button class="btn sm" data-a="calToday" style="box-shadow:var(--sh);background:var(--card);height:42px">วันนี้</button>
    <div class="seg card-bg" style="flex:1"><button class="${ui.cm === 'week' ? 'on' : ''}" data-a="calMode" data-m="week">สัปดาห์</button><button class="${ui.cm === 'month' ? 'on' : ''}" data-a="calMode" data-m="month">เดือน</button></div>
    <button class="ib" data-a="calMenu" aria-label="เพิ่มเติม">${ic('more')}</button></div>`;
}

/* ----- clients ----- */
function clientData() {
  const q = ui.cq.trim().toLowerCase();
  return S.clients.map(c => ({ c, st: stats(c) })).filter(({ c, st }) => {
    if (ui.cf === 'arch') return c.archived;
    if (c.archived) return false;
    if (ui.cf === 'fat' || ui.cf === 'muscle') return c.goal === ui.cf;
    if (ui.cf === 'low') return st.packs.length && (!st.cur || st.left <= 2);
    return true;
  }).filter(({ c }) => !q || c.name.toLowerCase().includes(q));
}
function vClients() {
  const list = clientData();
  const f = (k, l) => `<button class="chip ${ui.cf === k ? 'on' : ''}" data-a="cfilter" data-k="${k}">${l}</button>`;
  let h = hdr('ลูกเทรน', { right: `<button class="ib acc" data-a="newClient" aria-label="เพิ่มลูกเทรน">${ic('plus')}</button>` });
  h += `<div class="search">${ic('search')}<input id="cq" type="search" placeholder="ค้นหาชื่อ" value="${esc(ui.cq)}" autocomplete="off"></div>`;
  h += `<div class="chips">${f('all', 'ทั้งหมด')}${f('fat', '🔥 ลดไขมัน')}${f('muscle', '💪 สร้างกล้าม')}${f('low', '⚠️ ใกล้หมดคอร์ส')}${f('arch', 'เก็บถาวร')}</div>`;
  h += `<div id="clist">${clientRows(list)}</div>`;
  return h;
}
function clientRows(list) {
  if (!list.length) return `<div class="empty"><div class="big">🧑‍🤝‍🧑</div>${S.clients.length ? 'ไม่พบรายการ' : 'ยังไม่มีลูกเทรน<br>แตะ + เพื่อเพิ่มคนแรก'}</div>`;
  return list.map(({ c, st }) => {
    const sh = st.show;
    const dots = sh ? [...Array(Math.min(sh.total, 30))].map((_, i) => `<i class="${i < sh.used ? 'on' : ''}"></i>`).join('') : '';
    const right = !sh ? '<span class="tag">ไม่มีคอร์ส</span>' : st.cur ? `<b style="color:${st.left <= 2 ? 'var(--warn)' : 'var(--text)'}">${sh.used}/${sh.total}</b><span>เหลือ ${st.left}</span>` : `<b style="color:var(--ok)">✓</b><span>จบคอร์ส</span>`;
    return `<div class="crow" data-go="/client/${c.id}" style="--c:${c.color}"><div class="av">${esc(initial(c.name))}</div>
      <div class="cinfo"><div class="cname"><span class="n">${esc(c.name)}</span>${goalTag(c.goal)}</div><div class="dots">${dots}</div></div><div class="cright">${right}</div></div>`;
  }).join('');
}

/* ----- client detail ----- */
function ring(used, total, color) {
  const r = 42, C = 2 * Math.PI * r, p = total ? Math.min(1, used / total) : 0;
  return `<div class="ring"><svg width="96" height="96" viewBox="0 0 96 96"><circle cx="48" cy="48" r="${r}" fill="none" stroke="var(--line)" stroke-width="10"/>
    <circle cx="48" cy="48" r="${r}" fill="none" stroke="${color}" stroke-width="10" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - p)}"/></svg>
    <div class="t"><div><b>${used}</b><br><span>จาก ${total}</span></div></div></div>`;
}
function vClient(id) {
  const c = client(id); if (!c) return hdr('ไม่พบลูกเทรน', { back: 1 });
  const st = stats(c), sh = st.show, t = today();
  let h = hdr('', { back: 1, right: `<button class="ib" data-a="clientMenu" data-id="${c.id}" aria-label="เมนู">${ic('more')}</button>` });
  let ringHtml;
  if (!sh) ringHtml = `<div class="ringrow"><div style="font-size:40px">🎟️</div><div class="ringinfo"><div class="l1">ยังไม่มีคอร์ส</div><div class="sub">เพิ่มคอร์สเพื่อเริ่มนับจำนวนครั้ง</div></div></div>`;
  else {
    const dots = [...Array(Math.min(sh.total, 30))].map((_, i) => `<i class="${i < sh.used ? 'on' : ''}"></i>`).join('');
    ringHtml = `<div class="ringrow" style="--c:${c.color}">${ring(sh.used, sh.total, c.color)}<div class="ringinfo">
      <div class="l1">${st.cur ? `เหลืออีก ${st.left} ครั้ง` : 'จบคอร์สแล้ว 🎉'}</div>
      <div class="sub">คอร์สที่ ${st.packs.indexOf(sh) + 1}${sh.p.start ? ' • เริ่ม ' + fmtShort(sh.p.start) : ''}</div><div class="dots">${dots}</div>
      ${st.over ? `<div class="badge warn" style="display:inline-block;margin-top:6px">เทรนเกินคอร์ส ${st.over} ครั้ง</div>` : ''}</div></div>`;
  }
  h += `<div class="chero"><div class="top"><div class="av lg" style="--c:${c.color}">${esc(initial(c.name))}</div><div style="flex:1;min-width:0">
    <h2>${esc(c.name)}</h2>${goalTag(c.goal)} ${c.archived ? '<span class="tag">เก็บถาวร</span>' : ''}</div>
    ${c.phone ? `<a class="ib" href="tel:${esc(c.phone)}" aria-label="โทร">${ic('phone')}</a>` : ''}</div>${ringHtml}
    <div class="actions"><button class="btn pri" data-a="logToday" data-id="${c.id}">${ic('check', 's')} บันทึกเทรน</button>
    <button class="btn" data-a="newSession" data-client="${c.id}" data-date="${t}">${ic('cal', 's')} นัดเทรน</button>
    <button class="btn" data-a="renew" data-id="${c.id}">${ic('refresh', 's')} ${st.cur || !sh ? 'เพิ่มคอร์ส' : 'ต่อคอร์ส'}</button></div></div>`;
  if (c.health) h += `<div class="card" style="background:rgba(245,158,11,.12);box-shadow:none"><h3>⚠️ ข้อควรระวัง</h3><div style="font-size:14px;white-space:pre-wrap">${esc(c.health)}</div></div>`;

  const T = (k, l) => `<button class="${ui.ct === k ? 'on' : ''}" data-a="ctab" data-k="${k}">${l}</button>`;
  h += `<div class="seg card-bg" style="margin-bottom:14px">${T('hist', 'ประวัติ')}${T('prog', 'โปรแกรม')}${T('body', 'ร่างกาย')}${T('info', 'คอร์ส/ข้อมูล')}</div>`;
  if (ui.ct === 'hist') h += clientHist(c, st);
  else if (ui.ct === 'prog') h += clientProgs(c);
  else if (ui.ct === 'body') h += clientBody(c);
  else h += clientInfo(c, st);
  return h;
}
function clientHist(c) {
  const t = today(), labels = doneLabels(c);
  const all = S.sessions.filter(s => s.clientId === c.id).sort((a, b) => cmpS(b, a));
  const up = all.filter(s => s.status === 'planned' && s.date >= t).reverse();
  const past = all.filter(s => !(s.status === 'planned' && s.date >= t));
  let h = '';
  if (up.length) h += `<div class="card"><h3>📅 นัดที่จะถึง</h3>${up.slice(0, 6).map(s => histRow(s, labels)).join('')}${up.length > 6 ? `<div class="sub" style="padding-top:8px">และอีก ${up.length - 6} นัด</div>` : ''}</div>`;
  h += `<div class="card"><h3>🕘 ประวัติการเทรน <span class="grow"></span><button class="link" data-a="addPast" data-id="${c.id}">+ บันทึกย้อนหลัง</button></h3>`;
  if (!past.length) h += '<div class="empty" style="padding:14px">ยังไม่มีประวัติ</div>';
  let mk = '';
  past.forEach(s => { const k = s.date.slice(0, 7); if (k !== mk) { mk = k; h += `<div class="mh">${fmtMonth(s.date)}</div>`; } h += histRow(s, labels); });
  return h + '</div>';
}
function histRow(s, labels) {
  const d = pd(s.date), st = s.status;
  const badge = st === 'done' ? '<span class="badge ok">✓</span>' : st === 'cancel' ? '<span class="badge no">ยกเลิก</span>' : '<span class="badge warn">นัดไว้</span>';
  return `<div class="hist" data-a="openSession" data-id="${s.id}"><div class="d">${d.getDate()} ${MONS[d.getMonth()]}<small>${DOWS[d.getDay()]} • ${s.time}</small></div>
    <div class="m">${st === 'done' ? esc(labels[s.id] || '') : ''}${s.note ? (st === 'done' ? ' • ' : '') + esc(s.note) : ''}</div>${badge}</div>`;
}
function clientProgs(c) {
  const ps = S.programs.filter(p => p.clientId === c.id);
  let h = `<button class="btn pri block" style="margin-bottom:12px" data-a="newProgram" data-client="${c.id}">${ic('plus', 's')} สร้างโปรแกรมใหม่</button>`;
  if (!ps.length) return h + `<div class="card empty"><div class="big">📋</div>ยังไม่มีโปรแกรมเฉพาะบุคคล<br>สร้างจากเทมเพลต ลดไขมัน/สร้างกล้ามเนื้อ แล้วปรับแต่งได้</div>`;
  return h + ps.map(p => `<div class="pcard" data-go="/program/${p.id}" style="background:var(--card);box-shadow:var(--sh)"><div class="gi">${GOALS[p.goal].e}</div>
    <div style="flex:1;min-width:0"><b>${esc(p.name)}</b><div class="sub">${GOALS[p.goal].th} • ${PLACES[p.place || 'gym'].th} • ${p.days.length} วัน • ${p.days.reduce((a, d) => a + d.items.length, 0)} ท่า</div></div>${ic('r')}</div>`).join('');
}
function clientBody(c) {
  const m = (c.metrics || []).slice().sort((a, b) => a.date.localeCompare(b.date));
  let h = `<button class="btn pri block" style="margin-bottom:12px" data-a="addMetric" data-id="${c.id}">${ic('plus', 's')} บันทึกน้ำหนัก/สัดส่วน</button>`;
  if (!m.length) return h + `<div class="card empty"><div class="big">⚖️</div>บันทึกน้ำหนักและไขมันเพื่อดูความก้าวหน้า</div>`;
  const w = m.filter(x => x.weight);
  if (w.length >= 1) {
    const diff = w[w.length - 1].weight - w[0].weight;
    h += `<div class="card"><h3>น้ำหนัก (กก.) <span class="grow"></span><span class="tag ${diff <= 0 ? 'fat' : 'muscle'}">${w.length > 1 ? (diff > 0 ? '+' : '') + diff.toFixed(1) + ' กก.' : 'เริ่มต้น'}</span></h3>${lineChart(w.map(x => ({ d: x.date, v: x.weight })), c.color)}</div>`;
  }
  h += `<div class="card"><h3>บันทึกทั้งหมด</h3>` + m.slice().reverse().map(x =>
    `<div class="mrow"><div><b>${fmtShort(x.date)}</b><div class="sub">${esc(x.note || '')}</div></div><div style="text-align:right">${x.weight ? x.weight + ' กก.' : ''}${x.fat ? ' • ไขมัน ' + x.fat + '%' : ''}${x.waist ? ' • เอว ' + x.waist + ' ซม.' : ''}</div>
    <button class="link" data-a="delMetric" data-id="${c.id}" data-mid="${x.id}" aria-label="ลบ">${ic('trash', 's')}</button></div>`).join('') + '</div>';
  return h;
}
function lineChart(pts, color) {
  const W = 320, H = 140, P = 22; const vs = pts.map(p => p.v);
  let mn = Math.min(...vs), mx = Math.max(...vs); if (mn === mx) { mn -= 1; mx += 1; }
  const X = i => pts.length === 1 ? W / 2 : P + i * (W - 2 * P) / (pts.length - 1), Y = v => H - P - (v - mn) / (mx - mn) * (H - 2 * P);
  const line = pts.map((p, i) => `${X(i)},${Y(p.v)}`).join(' ');
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><polyline points="${line}" fill="none" stroke="${color}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
    ${pts.map((p, i) => `<circle cx="${X(i)}" cy="${Y(p.v)}" r="4" fill="${color}"/><text x="${X(i)}" y="${Y(p.v) - 9}" text-anchor="middle" font-size="10" fill="var(--mut)">${p.v}</text>`).join('')}</svg>`;
}
function clientInfo(c, st) {
  let h = `<div class="card"><h3>🎟️ คอร์สทั้งหมด</h3>`;
  if (!st.packs.length) h += '<div class="sub">ยังไม่มีคอร์ส</div>';
  h += st.packs.map((x, i) => `<div class="hist" data-a="editPack" data-id="${c.id}" data-pid="${x.p.id}"><div class="d">คอร์ส ${i + 1}<small>${x.p.start ? fmtShort(x.p.start) : ''}</small></div>
    <div class="m">${x.used}/${x.total} ครั้ง${x.p.price ? ' • ' + baht(x.p.price) : ''}</div>${x.used >= x.total ? '<span class="badge ok">จบ</span>' : '<span class="badge warn">กำลังใช้</span>'}</div>`).join('') + '</div>';
  h += `<div class="card"><h3>ข้อมูล</h3>
    <div class="mrow"><span class="sub">เบอร์โทร</span><b>${esc(c.phone || '-')}</b></div>
    <div class="mrow"><span class="sub">เริ่มเป็นลูกเทรน</span><b>${c.created ? fmtShort(c.created) : '-'}</b></div>
    <div class="mrow"><span class="sub">เทรนไปแล้วทั้งหมด</span><b>${st.done} ครั้ง</b></div>
    ${c.note ? `<div class="mrow" style="display:block"><span class="sub">โน้ต</span><div style="white-space:pre-wrap">${esc(c.note)}</div></div>` : ''}</div>`;
  return h;
}

/* ----- library ----- */
function filterEx(f) {
  const q = (f.q || '').trim().toLowerCase();
  return allEx().filter(e => (!f.m || f.m === 'all' || e.m === f.m) && (!f.c || f.c === 'all' || e.cat === f.c)
    && (!f.p || f.p === 'all' || (f.p === 'home' ? homeOk(e) : (e.aud || '').includes(f.p === 'women' ? 'w' : 'k')))
    && (!q || (e.th + ' ' + (e.en || '')).toLowerCase().includes(q)));
}
const mTh = m => (MUSCLE_INFO[m]?.th || m).replace(/ \(.*\)/, '');
function libList() {
  const l = filterEx({ q: ui.lq, m: ui.lm, c: ui.lc, p: ui.lp });
  let h = '';
  if (ui.lp === 'kids') h += `<div class="card" style="background:rgba(91,108,255,.1);box-shadow:none;font-size:14px">🧒 <b>ท่าสำหรับเด็ก</b> — ใช้น้ำหนักตัวหรืออุปกรณ์เบามาก เน้นความสนุกและท่าทางที่ถูกต้อง มีผู้ใหญ่ดูแลเสมอ ไม่ควรยกหนักหรือฝึกจนล้า (เด็กควรได้เล่นออกแรงรวมวันละ ~60 นาที)</div>`;
  if (ui.lp === 'women') h += `<div class="card" style="background:rgba(236,72,153,.1);box-shadow:none;font-size:14px">👩 <b>ท่าที่เหมาะกับผู้หญิง</b> — เน้นก้น สะโพก ต้นขา และแกนกลางลำตัว เพื่อความกระชับและแข็งแรง การเล่นเวทไม่ทำให้ตัวใหญ่เกินไป เริ่มจากน้ำหนักเบาแล้วค่อยเพิ่ม</div>`;
  h += `<div class="sub" style="margin:0 4px 8px">พบ ${l.length} ท่า</div>`;
  if (!l.length) return h + '<div class="empty"><div class="big">🔍</div>ไม่พบท่าที่ค้นหา</div>';
  h += '<div class="grid2">' + l.slice(0, ui.ln).map(e => `<div class="excard" data-a="openEx" data-id="${esc(e.id)}">${media(e)}<div class="nm">${esc(e.th)}<small>${esc(e.en && e.en !== e.th ? e.en : '')}</small>
    <small style="margin-top:4px">${CAT_E[e.cat] || ''} ${(e.pm && e.pm.length) ? esc(e.pm.slice(0, 2).map(mTh).join(', ')) : esc((MUSCLES[e.m] || MUSCLES.core).th)}</small></div></div>`).join('') + '</div>';
  if (l.length > ui.ln) h += `<button class="btn block" style="margin-top:14px;background:var(--card);box-shadow:var(--sh)" data-a="libMore">แสดงเพิ่ม (เหลืออีก ${l.length - ui.ln} ท่า)</button>`;
  return h;
}
function vLib() {
  const ch = (k, l) => `<button class="chip ${ui.lm === k ? 'on' : ''}" data-a="libM" data-k="${k}">${l}</button>`;
  const cc = (k, l) => `<button class="chip ${ui.lc === k ? 'on' : ''}" data-a="libC" data-k="${k}">${l}</button>`;
  const pp = (k, l) => `<button class="${ui.lp === k ? 'on' : ''}" data-a="libP" data-k="${k}">${l}</button>`;
  return hdr('คลังท่าออกกำลังกาย', { right: `<button class="ib acc" data-a="newEx" aria-label="เพิ่มท่า">${ic('plus')}</button>` }) +
    `<div class="search">${ic('search')}<input id="lq" type="search" placeholder="ค้นหา ${allEx().length} ท่า (ไทย/English)" value="${esc(ui.lq)}" autocomplete="off"></div>
    <div class="seg card-bg" style="margin-bottom:10px">${pp('all', 'ทุกท่า')}${pp('home', '🏠 บ้าน')}${pp('women', '👩 ผู้หญิง')}${pp('kids', '🧒 เด็ก')}</div>
    <div class="chips">${cc('all', 'ทุกประเภท')}${Object.entries(CAT_TH).map(([k, v]) => cc(k, CAT_E[k] + ' ' + v)).join('')}</div>
    <div class="chips" style="padding-top:0">${ch('all', 'ทุกกล้ามเนื้อ')}${Object.entries(MUSCLES).map(([k, v]) => ch(k, v.e + ' ' + v.th)).join('')}</div>
    <div id="liblist">${libList()}</div>
    <div class="sub" style="text-align:center;margin-top:18px">ภาพประกอบ: free-exercise-db • แตะท่าเพื่อดูภาพเคลื่อนไหว กล้ามเนื้อที่ใช้ และวิดีโอสาธิต</div>`;
}

/* ----- program ----- */
function summary(it) {
  let s = `${it.sets} เซ็ต × ${esc(it.reps)}`;
  if (it.weight) s += ` • ${esc(it.weight)}`;
  if (+it.rest) s += ` • พัก ${it.rest}″`;
  return s;
}
function vProgram(id) {
  const p = prog(id); if (!p) return hdr('ไม่พบโปรแกรม', { back: 1 });
  const c = client(p.clientId); if (ui.pd >= p.days.length) ui.pd = 0;
  const d = p.days[ui.pd];
  let h = hdr(esc(p.name), { back: 1, sm: 1, right: `<button class="ib" data-a="progMenu" data-id="${p.id}" aria-label="เมนู">${ic('more')}</button>` });
  h += `<div style="display:flex;gap:8px;align-items:center;margin:0 2px 12px;flex-wrap:wrap">${goalTag(p.goal)}${placeTag(p.place)}${c ? `<span class="tag" style="--c:${c.color}" data-go="/client/${c.id}">${ic('user', 's')} ${esc(c.name)}</span>` : ''}</div>`;
  h += `<div class="dtabs">${p.days.map((x, i) => `<button class="dtab ${i === ui.pd ? 'on' : ''}" data-a="pday" data-i="${i}">${esc(x.name.split('•')[0].trim())}</button>`).join('')}<button class="dtab" data-a="addDay" data-id="${p.id}">+ เพิ่มวัน</button></div>`;
  if (!d) return h + '<div class="empty">ยังไม่มีวันฝึก</div>';
  h += `<div class="card" style="display:flex;align-items:center;gap:10px"><div style="flex:1;min-width:0"><b>${esc(d.name)}</b><div class="sub">${d.items.length} ท่า</div></div>
    <button class="btn sm" data-a="dayMenu" data-id="${p.id}">${ic('edit', 's')} จัดการ</button></div>`;
  h += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px"><button class="btn pri" data-go="/train/${p.id}/${ui.pd}">${ic('play', 's')} เริ่มเทรน</button>
    <button class="btn" data-a="expProg" data-id="${p.id}">${ic('image', 's')} ส่งออกรูป</button></div>`;
  if (!d.items.length) h += `<div class="card empty"><div class="big">🏋️</div>ยังไม่มีท่าในวันนี้</div>`;
  h += d.items.map((it, i) => { const e = exById(it.ex); return `<div class="item"><div class="idx">${i + 1}</div>
    <div style="width:62px;flex:none" data-a="openEx" data-id="${esc(e.id)}">${media(e, 'thumb')}</div>
    <div class="info" data-a="editItem" data-id="${p.id}" data-i="${i}"><div class="n">${esc(e.th)}</div><div class="p">${summary(it)}</div>${it.note ? `<div class="p">📝 ${esc(it.note)}</div>` : ''}</div>
    <button class="ib" style="box-shadow:none;background:var(--card2)" data-a="editItem" data-id="${p.id}" data-i="${i}" aria-label="แก้ไข">${ic('edit', 's')}</button></div>`; }).join('');
  h += `<button class="btn block" style="margin-top:4px;background:var(--card);box-shadow:var(--sh)" data-a="addEx" data-id="${p.id}">${ic('plus', 's')} เพิ่มท่า</button>`;
  const g = GOALS[p.goal];
  h += `<div class="card" style="margin-top:18px"><h3>${g.e} แนวทางสำหรับเป้าหมาย "${g.th}"</h3>${g.tips.map(t => `<div class="tip">${t}</div>`).join('')}</div>`;
  return h;
}

/* ----- train mode ----- */
let TR = null, trTimer = null;
function vTrain(id, di) {
  const p = prog(id); if (!p) return hdr('ไม่พบโปรแกรม', { back: 1 });
  di = +di || 0; const d = p.days[di]; if (!d) return hdr('ไม่พบวัน', { back: 1 });
  if (!TR || TR.key !== id + '/' + di) { TR = { key: id + '/' + di, done: {}, end: 0 }; }
  const tot = d.items.reduce((a, i) => a + (+i.sets || 1), 0), dn = Object.values(TR.done).reduce((a, s) => a + s.size, 0);
  let h = hdr(esc(d.name), { back: 1, sm: 1 });
  h += `<div class="sub" style="margin:0 2px">เสร็จแล้ว ${dn}/${tot} เซ็ต</div><div class="pbar"><i style="width:${tot ? dn / tot * 100 : 0}%"></i></div>`;
  h += d.items.map((it, i) => {
    const e = exById(it.ex), set = TR.done[it.id] || new Set(), n = +it.sets || 1, full = set.size >= n;
    return `<div class="tcard ${full ? 'done' : ''}"><div data-a="openEx" data-id="${esc(e.id)}">${media(e, 'wide contain')}</div><div class="tb"><h4>${i + 1}. ${esc(e.th)}</h4>
      <div class="sub">${summary(it)}</div>${it.note ? `<div class="sub">📝 ${esc(it.note)}</div>` : ''}
      <div class="sets">${[...Array(n)].map((_, k) => `<button class="setb ${set.has(k) ? 'on' : ''}" data-a="trSet" data-item="${it.id}" data-k="${k}" data-rest="${+it.rest || 0}" data-i="${i}">${set.has(k) ? '✓' : k + 1}</button>`).join('')}</div></div></div>`;
  }).join('');
  h += `<button class="btn pri block" style="margin:6px 0 20px;padding:16px" data-a="finishTrain" data-id="${p.id}">${ic('check', 's')} จบการเทรน & บันทึกว่าเทรนเสร็จ</button>`;
  h += `<div class="restbar hide" id="restbar"><div class="grow">⏱ พักระหว่างเซ็ต</div><b id="restn">0:00</b><button class="btn sm" data-a="restAdd">+15″</button><button class="btn sm" data-a="restStop">ข้าม</button></div>`;
  return h;
}
function startRest(sec) {
  if (!sec) return; TR.end = Date.now() + sec * 1000; $('#restbar')?.classList.remove('hide'); clearInterval(trTimer);
  const tick = () => {
    const left = Math.ceil((TR.end - Date.now()) / 1000), n = $('#restn');
    if (!n) { clearInterval(trTimer); return; }
    if (left <= 0) { clearInterval(trTimer); $('#restbar')?.classList.add('hide'); navigator.vibrate?.([250, 100, 250]); beep(); toast('หมดเวลาพัก — เซ็ตต่อไป! 💪'); return; }
    n.textContent = `${Math.floor(left / 60)}:${pad(left % 60)}`;
  };
  tick(); trTimer = setInterval(tick, 250);
}
function beep() {
  try { const a = new (window.AudioContext || window.webkitAudioContext)(), o = a.createOscillator(), g = a.createGain(); o.connect(g); g.connect(a.destination); o.frequency.value = 880; g.gain.value = .15; o.start(); setTimeout(() => { o.stop(); a.close(); }, 350); } catch (e) { /* ignore */ }
}
let wakeLock = null;
async function keepAwake() { try { wakeLock = await navigator.wakeLock?.request('screen'); } catch (e) { /* ignore */ } }

/* ----- settings ----- */
function vSettings() {
  const s = S.settings;
  return hdr('ตั้งค่า', { back: 1 }) + `
  <div class="card"><h3>โปรไฟล์เทรนเนอร์</h3>
    ${fld('ชื่อ/แบรนด์ (แสดงในรูปที่ส่งออก)', `<input id="s-trainer" value="${esc(s.trainer)}" placeholder="เช่น โค้ชเอ • PT Studio" autocomplete="off">`)}
    <div class="row2">${fld('ครั้งต่อคอร์ส (เริ่มต้น)', `<input id="s-course" type="number" inputmode="numeric" min="1" value="${s.course}">`)}
    ${fld('ระยะเวลาเทรน (นาที)', `<input id="s-dur" type="number" inputmode="numeric" min="15" step="5" value="${s.dur}">`)}</div>
    ${fld('สัปดาห์เริ่มต้นวัน', `<select id="s-ws"><option value="1" ${s.weekStart == 1 ? 'selected' : ''}>จันทร์</option><option value="0" ${s.weekStart == 0 ? 'selected' : ''}>อาทิตย์</option><option value="6" ${s.weekStart == 6 ? 'selected' : ''}>เสาร์</option></select>`)}
  </div>
  <div class="card"><h3>หน้าตาแอป</h3>
    <div class="seg" style="margin-bottom:14px">${[['auto', 'อัตโนมัติ'], ['light', 'สว่าง'], ['dark', 'มืด']].map(([k, l]) => `<button class="${s.theme === k ? 'on' : ''}" data-a="setTheme" data-k="${k}">${l}</button>`).join('')}</div>
    <div class="swatches">${ACCENTS.map(a => `<label style="--c:${a}"><input type="radio" name="acc" ${s.accent === a ? 'checked' : ''} data-a="setAccent" data-k="${a}"><span></span></label>`).join('')}</div></div>
  <div class="card"><h3>💾 สำรอง & ย้ายข้อมูล</h3>
    <div class="sub" style="margin-bottom:10px">ข้อมูลเก็บในเครื่องนี้ ควรสำรองเป็นประจำ (และก่อนเปลี่ยนมือถือ) เก็บไฟล์ไว้ใน LINE Keep / Google Drive / iCloud</div>
    <div style="display:grid;gap:8px"><button class="btn block" data-a="backup">${ic('down2', 's')} สำรองข้อมูล (ไฟล์ .json)</button>
    <label class="btn block" style="cursor:pointer">${ic('up2', 's')} กู้คืนจากไฟล์<input type="file" id="restore" accept=".json,application/json" hidden></label></div></div>
  <div class="card"><h3>📲 ติดตั้งเป็นแอป</h3>
    <div class="tip"><span><b>iPhone (Safari):</b> แตะปุ่มแชร์ → "เพิ่มไปยังหน้าจอโฮม"</span></div>
    <div class="tip"><span><b>Android (Chrome):</b> เมนู ⋮ → "ติดตั้งแอป" หรือ "เพิ่มไปยังหน้าจอหลัก"</span></div>
    <div class="sub">ใช้งานออฟไลน์ได้หลังเปิดครั้งแรก (ภาพท่าจะโหลดเมื่อมีเน็ตและจำไว้ให้)</div></div>
  <div class="card"><h3>อื่นๆ</h3><div style="display:grid;gap:8px">
    <button class="btn block" data-a="demo">โหลดข้อมูลตัวอย่าง</button>
    <button class="btn bad block" data-a="wipe">${ic('trash', 's')} ลบข้อมูลทั้งหมด</button></div></div>
  <div class="sub" style="text-align:center">PT Planner v1.0</div>`;
}

/* ============ FORMS / SHEETS ============ */
const forms = {};

/* --- client --- */
function clientForm(id) {
  const c = id ? client(id) : null, col = c ? c.color : COLORS[S.clients.length % COLORS.length];
  const body = `<form data-f="client" autocomplete="off"><input type="hidden" name="id" value="${c ? c.id : ''}">
    ${fld('ชื่อลูกเทรน *', `<input name="name" required value="${esc(c?.name)}" placeholder="เช่น คุณแพรว" autocapitalize="words">`)}
    ${fld('เบอร์โทร', `<input name="phone" type="tel" inputmode="tel" value="${esc(c?.phone)}" placeholder="08x-xxx-xxxx">`)}
    <div class="fld"><span>เป้าหมาย</span><div class="seg">${['fat', 'muscle'].map(g => `<label><input type="radio" name="goal" value="${g}" ${(c ? c.goal : 'fat') === g ? 'checked' : ''}><span>${GOALS[g].e} ${GOALS[g].th}</span></label>`).join('')}</div></div>
    ${placeSeg(c?.place || 'gym')}
    <div class="fld"><span>สีในปฏิทิน</span><div class="swatches">${COLORS.map(x => `<label style="--c:${x}"><input type="radio" name="color" value="${x}" ${x === col ? 'checked' : ''}><span></span></label>`).join('')}</div></div>
    ${fld('ข้อควรระวัง/อาการบาดเจ็บ', `<textarea name="health" placeholder="เช่น เข่าซ้ายเคยบาดเจ็บ, ความดันสูง">${esc(c?.health)}</textarea>`)}
    ${fld('โน้ตอื่นๆ', `<textarea name="note">${esc(c?.note)}</textarea>`)}
    ${c ? '' : `<div class="card" style="box-shadow:none;background:var(--card2)"><label class="sw" style="padding-top:0"><span>เริ่มคอร์สแรกทันที</span><input type="checkbox" name="startCourse" checked data-a="toggleCourse"></label>
      <div id="courseBox"><div class="row3">${fld('จำนวนครั้ง', `<input name="total" type="number" inputmode="numeric" min="1" value="${S.settings.course}">`)}${fld('เทรนมาแล้ว', `<input name="prior" type="number" inputmode="numeric" min="0" value="0">`)}${fld('ราคา (฿)', `<input name="price" type="number" inputmode="decimal" min="0" placeholder="0">`)}</div></div></div>`}
    <button class="btn pri block" style="padding:15px">บันทึก</button></form>`;
  sheet(c ? 'แก้ไขลูกเทรน' : 'เพิ่มลูกเทรน', body, { tall: true });
}
forms.client = d => {
  const name = (d.name || '').trim(); if (!name) return;
  if (d.id) {
    const c = client(d.id); Object.assign(c, { name, phone: d.phone.trim(), goal: d.goal, place: d.place, color: d.color, health: d.health.trim(), note: d.note.trim() });
  } else {
    const c = { id: uid(), name, phone: d.phone.trim(), goal: d.goal, place: d.place, color: d.color, health: d.health.trim(), note: d.note.trim(), created: today(), packs: [], metrics: [], archived: false };
    if (d.startCourse) c.packs.push({ id: uid(), total: Math.max(1, +d.total || 10), prior: Math.max(0, +d.prior || 0), price: +d.price || 0, start: today() });
    S.clients.push(c);
  }
  save(); closeSheet(() => { render(); toast('บันทึกแล้ว'); });
};

/* --- package --- */
function packForm(cid, pid) {
  const c = client(cid), p = pid ? c.packs.find(x => x.id === pid) : null;
  sheet(p ? 'แก้ไขคอร์ส' : 'คอร์สใหม่ • ' + esc(c.name), `<form data-f="pack" autocomplete="off"><input type="hidden" name="cid" value="${cid}"><input type="hidden" name="pid" value="${pid || ''}">
    <div class="row2">${fld('จำนวนครั้ง', `<input name="total" type="number" inputmode="numeric" min="1" value="${p ? p.total : S.settings.course}" required>`)}
    ${fld('ราคา (฿)', `<input name="price" type="number" inputmode="decimal" min="0" value="${p ? p.price || '' : ''}" placeholder="0">`)}</div>
    <div class="row2">${fld('วันที่เริ่ม', `<input name="start" type="date" value="${p ? p.start || today() : today()}" required>`)}
    ${fld('เทรนมาแล้ว (ก่อนใช้แอป)', `<input name="prior" type="number" inputmode="numeric" min="0" value="${p ? p.prior || 0 : 0}">`)}</div>
    <button class="btn pri block" style="padding:15px">บันทึก</button>
    ${p ? `<button type="button" class="btn bad block" style="margin-top:8px" data-a="delPack" data-id="${cid}" data-pid="${pid}">ลบคอร์สนี้</button>` : ''}</form>`);
}
forms.pack = d => {
  const c = client(d.cid), o = { total: Math.max(1, +d.total || 10), price: +d.price || 0, start: d.start, prior: Math.max(0, +d.prior || 0) };
  if (d.pid) Object.assign(c.packs.find(x => x.id === d.pid), o); else c.packs.push({ id: uid(), ...o });
  save(); closeSheet(() => { render(); toast('บันทึกคอร์สแล้ว'); });
};

/* --- session --- */
function sessionForm(id, pre = {}) {
  const s = id ? S.sessions.find(x => x.id === id) : null;
  const cl = S.clients.filter(c => !c.archived || (s && s.clientId === c.id));
  if (!cl.length) { toast('เพิ่มลูกเทรนก่อน'); return; }
  const v = s || { clientId: pre.clientId || cl[0].id, date: pre.date || today(), time: pre.time || S.settings.lastTime || '17:00', dur: S.settings.dur, note: '', status: pre.status || 'planned' };
  const wdOrder = [...Array(7)].map((_, i) => (S.settings.weekStart + i) % 7), dow = pd(v.date).getDay();
  const body = `<form data-f="session" autocomplete="off"><input type="hidden" name="id" value="${s ? s.id : ''}">
    ${fld('ลูกเทรน', `<select name="clientId">${cl.map(c => `<option value="${c.id}" ${c.id === v.clientId ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select>`)}
    <div class="row2">${fld('วันที่', `<input type="date" name="date" value="${v.date}" required>`)}${fld('เวลา', `<input type="time" name="time" value="${v.time}" required>`)}</div>
    <div class="row2">${fld('ระยะเวลา (นาที)', `<input type="number" name="dur" inputmode="numeric" min="10" step="5" value="${v.dur}">`)}
    ${fld('สถานะ', `<select name="status"><option value="planned" ${v.status === 'planned' ? 'selected' : ''}>นัดไว้</option><option value="done" ${v.status === 'done' ? 'selected' : ''}>เทรนแล้ว ✓</option><option value="cancel" ${v.status === 'cancel' ? 'selected' : ''}>ยกเลิก</option></select>`)}</div>
    ${fld('โน้ต', `<input name="note" value="${esc(v.note)}" placeholder="เช่น วันขา, เล่นกับหน้าท้อง">`)}
    ${s ? '' : `<div class="card" style="box-shadow:none;background:var(--card2)"><label class="sw" style="padding-top:0"><span>ทำซ้ำทุกสัปดาห์</span><input type="checkbox" name="repeat" data-a="toggleRepeat"></label>
      <div id="repBox" class="hide"><div class="wd" style="margin-bottom:10px">${wdOrder.map(i => `<label><input type="checkbox" name="wd" value="${i}" ${i === dow ? 'checked' : ''}><span>${DOWS[i]}</span></label>`).join('')}</div>
      ${fld('จำนวนสัปดาห์', `<select name="weeks">${[2, 3, 4, 6, 8, 10, 12, 16, 24].map(n => `<option value="${n}" ${n === 4 ? 'selected' : ''}>${n} สัปดาห์</option>`).join('')}</select>`)}</div></div>`}
    <button class="btn pri block" style="padding:15px">${s ? 'บันทึก' : 'เพิ่มนัด'}</button>
    ${s ? `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px"><button type="button" class="btn" data-go="/client/${s.clientId}">${ic('user', 's')} ดูลูกเทรน</button><button type="button" class="btn bad" data-a="delSession" data-id="${s.id}">${ic('trash', 's')} ลบ</button></div>` : ''}</form>`;
  sheet(s ? 'รายละเอียดนัด' : 'นัดเทรนใหม่', body, { tall: !s });
}
forms.session = (d, f, fd) => {
  const base = { clientId: d.clientId, time: d.time, dur: Math.max(10, +d.dur || 60), note: d.note.trim(), status: d.status };
  const clash = (date, id) => S.sessions.find(x => x.id !== id && x.date === date && x.status !== 'cancel' && toMin(x.time) < toMin(base.time) + base.dur && toMin(base.time) < toMin(x.time) + x.dur);
  if (d.id) {
    const s = S.sessions.find(x => x.id === d.id), was = s.status;
    const cl = base.status !== 'cancel' && clash(d.date, s.id);
    if (cl && !askConfirm(`เวลาชนกับนัดของ ${client(cl.clientId)?.name} (${cl.time}) บันทึกต่อไหม?`)) return;
    Object.assign(s, base, { date: d.date });
    S.settings.lastTime = base.time; save(); closeSheet(() => { render(); afterStatus(s, was); });
    return;
  }
  let dates = [d.date];
  if (d.repeat) {
    const wds = new Set(fd.getAll('wd').map(Number)), n = +d.weeks * 7; dates = [];
    for (let i = 0; i < n; i++) { const dt = addD(d.date, i); if (wds.has(pd(dt).getDay())) dates.push(dt); }
    if (!dates.length) dates = [d.date];
  }
  const clashes = dates.filter(dt => base.status !== 'cancel' && clash(dt));
  if (clashes.length && !askConfirm(`มี ${clashes.length} นัดที่เวลาชนกับนัดอื่น บันทึกต่อไหม?`)) return;
  dates.forEach(dt => S.sessions.push({ id: uid(), date: dt, ...base }));
  S.settings.lastTime = base.time; ui.cd = d.date; save();
  closeSheet(() => { render(); toast(dates.length > 1 ? `เพิ่ม ${dates.length} นัดแล้ว` : 'เพิ่มนัดแล้ว'); });
};
function afterStatus(s, was) {
  if (s.status === 'done' && was !== 'done') {
    const c = client(s.clientId), st = stats(c);
    if (st.packs.length && !st.cur) { toast(`${esc(c.name)} ครบคอร์สแล้ว 🎉`); setTimeout(() => packForm(c.id), 600); }
    else if (st.cur) toast(`บันทึกแล้ว • ครั้งที่ ${st.cur.used}/${st.cur.total}`);
    else toast('บันทึกแล้ว (ยังไม่มีคอร์ส)');
  }
}
function setStatus(id, status) {
  const s = S.sessions.find(x => x.id === id); if (!s) return; const was = s.status;
  s.status = status; save(); render(); afterStatus(s, was);
}
function quickDone(id) {
  const s = S.sessions.find(x => x.id === id); if (!s) return; const was = s.status;
  s.status = 'done'; save(); render();
  const c = client(s.clientId), st = stats(c);
  if (st.packs.length && !st.cur) { toast(`${esc(c.name)} ครบคอร์สแล้ว 🎉`, () => setStatus(id, 'planned')); setTimeout(() => { if (!$('.wrap')) packForm(c.id); }, 5200); }
  else toast(`${esc(c.name)} • ${st.cur ? `ครั้งที่ ${st.cur.used}/${st.cur.total}` : 'บันทึกแล้ว'}`, () => { s.status = was; save(); render(); });
}
function logToday(cid, date) {
  const now = new Date(), t = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const planned = S.sessions.find(s => s.clientId === cid && s.date === today() && s.status === 'planned');
  if (planned && !date) { quickDone(planned.id); return; }
  const s = { id: uid(), clientId: cid, date: date || today(), time: t, dur: S.settings.dur, note: '', status: 'done' };
  S.sessions.push(s); save(); render();
  const c = client(cid), st = stats(c);
  if (st.packs.length && !st.cur) { toast(`${esc(c.name)} ครบคอร์สแล้ว 🎉`, () => { S.sessions = S.sessions.filter(x => x.id !== s.id); save(); render(); }); setTimeout(() => { if (!$('.wrap')) packForm(cid); }, 5200); }
  else toast(`บันทึกเทรน ${esc(c.name)} • ${st.cur ? `ครั้งที่ ${st.cur.used}/${st.cur.total}` : 'แล้ว'}`, () => { S.sessions = S.sessions.filter(x => x.id !== s.id); save(); render(); });
}

/* --- metrics --- */
function metricForm(cid) {
  sheet('บันทึกร่างกาย', `<form data-f="metric" autocomplete="off"><input type="hidden" name="cid" value="${cid}">
    ${fld('วันที่', `<input type="date" name="date" value="${today()}" required>`)}
    <div class="row3">${fld('น้ำหนัก (กก.)', `<input name="weight" type="number" inputmode="decimal" step="0.1">`)}${fld('ไขมัน (%)', `<input name="fat" type="number" inputmode="decimal" step="0.1">`)}${fld('เอว (ซม.)', `<input name="waist" type="number" inputmode="decimal" step="0.1">`)}</div>
    ${fld('โน้ต', `<input name="note">`)}<button class="btn pri block" style="padding:15px">บันทึก</button></form>`);
}
forms.metric = d => {
  if (!d.weight && !d.fat && !d.waist) { toast('กรอกอย่างน้อย 1 ค่า'); return; }
  const c = client(d.cid); (c.metrics ||= []).push({ id: uid(), date: d.date, weight: +d.weight || 0, fat: +d.fat || 0, waist: +d.waist || 0, note: d.note.trim() });
  save(); closeSheet(() => render());
};

/* --- exercise detail & custom --- */
const BM = {
  front: [['neck', 'r', 45, 24, 10, 7, 3], ['shoulders', 'e', 32, 38, 8, 7], ['shoulders', 'e', 68, 38, 8, 7], ['chest', 'e', 42, 48, 9, 8], ['chest', 'e', 58, 48, 9, 8], ['abdominals', 'r', 41, 58, 18, 28, 6],
    ['biceps', 'e', 23, 56, 5, 11], ['biceps', 'e', 77, 56, 5, 11], ['forearms', 'e', 17, 83, 4.5, 13], ['forearms', 'e', 83, 83, 4.5, 13], ['hip flexors', 'e', 44, 95, 4, 6], ['hip flexors', 'e', 56, 95, 4, 6],
    ['abductors', 'e', 30, 94, 4.5, 7], ['abductors', 'e', 70, 94, 4.5, 7], ['adductors', 'e', 46.5, 114, 3.5, 14], ['adductors', 'e', 53.5, 114, 3.5, 14], ['quadriceps', 'e', 38, 115, 8, 22], ['quadriceps', 'e', 62, 115, 8, 22],
    ['calves', 'e', 38, 167, 5.5, 18], ['calves', 'e', 62, 167, 5.5, 18]],
  back: [['traps', 'e', 50, 35, 13, 7], ['shoulders', 'e', 32, 38, 8, 7], ['shoulders', 'e', 68, 38, 8, 7], ['lats', 'e', 40, 58, 8, 13], ['lats', 'e', 60, 58, 8, 13], ['middle back', 'r', 44, 42, 12, 14, 4],
    ['lower back', 'r', 43, 63, 14, 14, 4], ['triceps', 'e', 23, 56, 5, 11], ['triceps', 'e', 77, 56, 5, 11], ['forearms', 'e', 17, 83, 4.5, 13], ['forearms', 'e', 83, 83, 4.5, 13], ['abductors', 'e', 30, 92, 4.5, 6],
    ['abductors', 'e', 70, 92, 4.5, 6], ['glutes', 'e', 42, 94, 9, 8], ['glutes', 'e', 58, 94, 9, 8], ['hamstrings', 'e', 39, 124, 8, 20], ['hamstrings', 'e', 61, 124, 8, 20], ['calves', 'e', 38, 168, 6, 17], ['calves', 'e', 62, 168, 6, 17]]
};
function bodyMap(e) {
  const P = new Set(e.pm || []), Sx = new Set(e.sm || []);
  const draw = (arr) => arr.map(([m, t, a, b, c, d, r]) => {
    const f = P.has(m) ? 'var(--acc)' : Sx.has(m) ? 'var(--acc)' : 'var(--card)', o = P.has(m) ? 1 : Sx.has(m) ? .4 : .75;
    return t === 'e' ? `<ellipse cx="${a}" cy="${b}" rx="${c}" ry="${d}" fill="${f}" opacity="${o}"/>` : `<rect x="${a}" y="${b}" width="${c}" height="${d}" rx="${r}" fill="${f}" opacity="${o}"/>`;
  }).join('');
  const base = `<g stroke="var(--line)" stroke-linecap="round" fill="none"><path d="M34 36 L19 60 L16 92" stroke-width="11"/><path d="M66 36 L81 60 L84 92" stroke-width="11"/><path d="M42 98 L38 172" stroke-width="17"/><path d="M58 98 L62 172" stroke-width="17"/></g>
    <rect x="34" y="28" width="32" height="70" rx="13" fill="var(--line)"/><circle cx="50" cy="14" r="10" fill="var(--line)"/>`;
  const one = (arr, lbl) => `<div style="text-align:center"><svg viewBox="0 0 100 190" width="100%" style="max-width:150px">${base}${draw(arr)}</svg><div class="sub" style="font-size:12px">${lbl}</div></div>`;
  return `<div style="display:flex;gap:12px;justify-content:center;margin:4px 0 8px">${one(BM.front, 'ด้านหน้า')}${one(BM.back, 'ด้านหลัง')}</div>
    <div style="display:flex;gap:14px;justify-content:center;font-size:12px;color:var(--mut);margin-bottom:6px"><span><i style="display:inline-block;width:11px;height:11px;border-radius:50%;background:var(--acc);vertical-align:-1px"></i> กล้ามเนื้อหลัก</span><span><i style="display:inline-block;width:11px;height:11px;border-radius:50%;background:var(--acc);opacity:.4;vertical-align:-1px"></i> กล้ามเนื้อรอง</span></div>`;
}
function tipFor(e) {
  if (e.tip) return e.tip;
  if (e.cat === 'stretching') return 'ยืดจนรู้สึกตึงพอประมาณ (ไม่เจ็บ) ค้างไว้ 20–30 วินาที ทำ 2–3 รอบต่อข้าง หายใจเข้า-ออกช้าๆ ไม่กระตุกหรือเด้งตัว';
  if (e.cat === 'cardio') return 'เริ่มช้าๆ 3–5 นาทีเพื่อวอร์มอัพ แล้วค่อยเพิ่มความเร็ว ระดับพอดีคือพูดเป็นประโยคสั้นๆ ได้';
  if (e.cat === 'plyo') return 'วอร์มอัพให้พร้อมก่อน ลงพื้นนุ่มๆ งอเข่ารับแรง พักให้เต็มระหว่างเซ็ต หยุดเมื่อท่าเริ่มเสีย';
  if (e.cat === 'special') return 'ท่าขั้นสูง ควรเรียนกับเทรนเนอร์ ใช้น้ำหนักเบาฝึกเทคนิคก่อนเสมอ';
  return e.lvl === 'e' ? 'ท่ายาก ควรมีผู้ดูแล และฝึกท่าทางด้วยน้ำหนักเบาก่อน'
    : e.lvl === 'i' ? 'คุมท่าให้นิ่ง ไม่เหวี่ยงตัว ลงช้า 2–3 วินาที เพิ่มน้ำหนักเมื่อทำครบเซ็ตได้สบาย'
      : 'เริ่มด้วยน้ำหนักเบาเพื่อให้ท่าถูกต้อง แล้วค่อยเพิ่มน้ำหนัก ควบคุมจังหวะขึ้น-ลงให้ช้า';
}
function muscleBlock(e) {
  const pm = e.pm || [], sm = e.sm || []; if (!pm.length && !sm.length) return '';
  const st = e.cat === 'stretching';
  const row = (m, full) => { const i = MUSCLE_INFO[m] || { th: m, sub: '', d: '' };
    return `<div style="padding:9px 0;border-bottom:1px solid var(--line)"><b>${esc(i.th)}</b>${i.sub ? `<div class="sub" style="font-size:12px">${esc(i.sub)}</div>` : ''}${full && i.d ? `<div style="font-size:13.5px;margin-top:3px">${esc(i.d)}</div>` : ''}</div>`; };
  return `<div class="card"><h3>${st ? '🧘 ยืดแล้วโดนกล้ามเนื้อส่วนนี้' : '🎯 กล้ามเนื้อที่ใช้'}</h3>${bodyMap(e)}
    ${e.focus ? `<div style="background:rgba(255,90,60,.1);border-radius:12px;padding:10px 12px;font-size:14px;margin-bottom:6px">🔎 <b>เน้นที่:</b> ${esc(e.focus)}</div>` : ''}
    ${pm.length ? `<div class="mh">${st ? 'ตึงที่สุด (กล้ามเนื้อหลักที่ถูกยืด)' : 'กล้ามเนื้อหลัก'}</div>${pm.map(m => row(m, true)).join('')}` : ''}
    ${sm.length ? `<div class="mh">${st ? 'ยืดเพิ่มเติมที่รู้สึกได้' : 'กล้ามเนื้อรอง (ช่วยออกแรง)'}</div>${sm.map(m => row(m, false)).join('')}` : ''}</div>`;
}
function openEx(id) {
  const e = exById(id), mu = MUSCLES[e.m] || MUSCLES.core;
  const tags = `<span class="tag">${mu.e} ${mu.th}</span>${e.cat ? `<span class="tag">${CAT_E[e.cat] || ''} ${CAT_TH[e.cat] || ''}</span>` : ''}<span class="tag">${esc(EQUIP[e.eq] || '')}</span>${e.lvl ? `<span class="tag">ระดับ${LEVEL_TH[e.lvl]}</span>` : ''}${homeOk(e) ? '<span class="tag">🏠 ทำที่บ้านได้</span>' : ''}${(e.aud || '').split('').map(a => AUD[a] ? `<span class="tag">${AUD[a].e} ${AUD[a].th}</span>` : '').join('')}${e.custom ? '<span class="tag">ท่าของฉัน</span>' : ''}`;
  sheet(esc(e.th), `<div style="border-radius:18px;overflow:hidden;margin-bottom:12px">${media(e, 'wide contain')}</div>
    ${e.en && e.en !== e.th ? `<div class="sub" style="margin:-2px 2px 8px">${esc(e.en)}</div>` : ''}
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">${tags}</div>
    <a class="btn pri block" style="text-decoration:none;padding:14px;margin-bottom:12px" href="${esc(ytLink(e))}" target="_blank" rel="noopener">${ic('video', 's')} ดูวิดีโอสาธิต</a>
    <div class="card"><h3>💡 เทคนิคและข้อควรระวัง</h3><div style="font-size:15px">${esc(tipFor(e))}</div>
      ${(e.aud || '').includes('k') ? '<div class="sub" style="margin-top:8px">🧒 สำหรับเด็ก: มีผู้ใหญ่ดูแล ไม่ใช้น้ำหนักหนัก เน้นสนุกและท่าทางที่ถูกต้อง</div>' : ''}
      ${e.cat === 'stretching' ? '<div class="sub" style="margin-top:8px">ถ้ารู้สึกปวดแปลบ ชา หรือเสียวให้หยุดทันที</div>' : ''}</div>
    ${muscleBlock(e)}
    ${e.custom ? `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px"><button class="btn" data-a="editEx" data-id="${esc(e.id)}">${ic('edit', 's')} แก้ไข</button><button class="btn bad" data-a="delEx" data-id="${esc(e.id)}">${ic('trash', 's')} ลบ</button></div>` : ''}`, { tall: true });
}
let tmpImg = '';
function exForm(id) {
  const e = id ? S.customEx.find(x => x.id === id) : null; tmpImg = e?.img || '';
  sheet(e ? 'แก้ไขท่า' : 'เพิ่มท่าของฉัน', `<form data-f="ex" autocomplete="off"><input type="hidden" name="id" value="${e ? e.id : ''}">
    ${fld('ชื่อท่า *', `<input name="th" required value="${esc(e?.th)}">`)}
    <div class="row2">${fld('กล้ามเนื้อหลัก', `<select name="m">${Object.entries(MUSCLES).map(([k, v]) => `<option value="${k}" ${e?.m === k ? 'selected' : ''}>${v.th}</option>`).join('')}</select>`)}
    ${fld('อุปกรณ์', `<select name="eq">${Object.entries(EQUIP).map(([k, v]) => `<option value="${k}" ${e?.eq === k ? 'selected' : ''}>${v}</option>`).join('')}</select>`)}</div>
    ${fld('กล้ามเนื้อที่ใช้เป็นหลัก (แสดงบนภาพร่างกาย)', `<select name="pm"><option value="">— ไม่ระบุ —</option>${Object.entries(MUSCLE_INFO).map(([k, v]) => `<option value="${k}" ${e?.pm?.[0] === k ? 'selected' : ''}>${v.th}</option>`).join('')}</select>`)}
    ${fld('เทคนิค/คำแนะนำ', `<textarea name="tip">${esc(e?.tip)}</textarea>`)}
    <div class="fld"><span>รูปภาพ (ถ่ายหรือเลือกจากเครื่อง)</span><div id="exImgPrev" style="margin-bottom:8px">${tmpImg ? `<img src="${esc(tmpImg)}" style="width:120px;border-radius:12px">` : ''}</div>
      <input type="file" id="exFile" accept="image/*"></div>
    ${fld('ลิงก์วิดีโอ (YouTube ฯลฯ)', `<input name="video" type="url" inputmode="url" value="${esc(e?.video)}" placeholder="https://...">`)}
    <button class="btn pri block" style="padding:15px">บันทึก</button></form>`, { tall: true });
}
forms.ex = d => {
  const o = { th: d.th.trim(), en: d.th.trim(), m: d.m, eq: d.eq, tip: d.tip.trim(), video: d.video.trim(), img: tmpImg, pm: d.pm ? [d.pm] : [] };
  if (!o.th) return;
  if (d.id) Object.assign(S.customEx.find(x => x.id === d.id), o); else S.customEx.push({ id: 'c_' + uid(), ...o });
  resetEx(); save(); closeSheet(() => { render(); toast('บันทึกท่าแล้ว'); });
};
function resizeImage(file, max = 720) {
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => { const im = new Image(); im.onload = () => {
      const k = Math.min(1, max / Math.max(im.width, im.height)), cv = document.createElement('canvas');
      cv.width = Math.round(im.width * k); cv.height = Math.round(im.height * k); cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height);
      res(cv.toDataURL('image/jpeg', .82)); }; im.onerror = rej; im.src = fr.result; };
    fr.onerror = rej; fr.readAsDataURL(file);
  });
}

/* --- program --- */
function newProgramForm(cid) {
  const c = client(cid);
  sheet('โปรแกรมใหม่ • ' + esc(c.name), `<form data-f="program" autocomplete="off"><input type="hidden" name="cid" value="${cid}">
    ${fld('ชื่อโปรแกรม', `<input name="name" value="โปรแกรมเดือน ${MON[new Date().getMonth()]}" required>`)}
    <div class="fld"><span>เป้าหมาย</span><div class="seg">${['fat', 'muscle'].map(g => `<label><input type="radio" name="goal" value="${g}" ${c.goal === g ? 'checked' : ''}><span>${GOALS[g].e} ${GOALS[g].th}</span></label>`).join('')}</div></div>
    ${placeSeg(c.place || 'gym')}
    ${fld('เริ่มจาก', `<select name="tpl"><option value="auto">เทมเพลตตามเป้าหมายที่เลือก (แนะนำ)</option><option value="blank">โปรแกรมเปล่า</option></select>`)}
    <div class="sub" style="margin-bottom:12px">มีเทมเพลตครบ 4 แบบ: ลดไขมัน/สร้างกล้ามเนื้อ × ที่ยิม/ที่บ้าน<br>ที่บ้านใช้ท่าน้ำหนักตัวและดัมเบลเท่านั้น สร้างแล้วปรับท่า เซ็ต ครั้ง น้ำหนัก ได้ทั้งหมด</div>
    <button class="btn pri block" style="padding:15px">สร้างโปรแกรม</button></form>`);
}
forms.program = d => {
  const p = { id: uid(), clientId: d.cid, name: d.name.trim() || 'โปรแกรม', goal: d.goal, place: d.place, created: today(), days: [] };
  if (d.tpl === 'auto') {
    p.days = TEMPLATES[d.goal + '_' + d.place].days.map(dy => ({ id: uid(), name: dy.name, items: dy.items.map(([ex, sets, reps, rest]) => ({ id: uid(), ex, sets, reps, rest, weight: '', note: '' })) }));
  } else p.days = [{ id: uid(), name: 'วันที่ 1', items: [] }];
  S.programs.push(p); save(); ui.pd = 0; closeSheet(() => go('/program/' + p.id));
};
function itemForm(pid, i) {
  const p = prog(pid), it = p.days[ui.pd].items[i], e = exById(it.ex), last = i === p.days[ui.pd].items.length - 1;
  sheet(esc(e.th), `<form data-f="item" autocomplete="off"><input type="hidden" name="pid" value="${pid}"><input type="hidden" name="i" value="${i}">
    <div class="row3">${fld('เซ็ต', `<input name="sets" type="number" inputmode="numeric" min="1" value="${it.sets}">`)}${fld('ครั้ง/เวลา', `<input name="reps" value="${esc(it.reps)}">`)}${fld('พัก (วินาที)', `<input name="rest" type="number" inputmode="numeric" min="0" step="5" value="${it.rest}">`)}</div>
    ${fld('น้ำหนัก/ระดับ', `<input name="weight" value="${esc(it.weight)}" placeholder="เช่น 20 กก., เทา, ชัน 10%">`)}
    ${fld('โน้ตสำหรับท่านี้', `<input name="note" value="${esc(it.note)}" placeholder="เช่น ลงช้า 3 วินาที">`)}
    <button class="btn pri block" style="padding:15px">บันทึก</button>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:8px"><button type="button" class="btn" ${i === 0 ? 'disabled' : ''} data-a="moveItem" data-id="${pid}" data-i="${i}" data-dir="-1">${ic('up', 's')} ขึ้น</button>
    <button type="button" class="btn" ${last ? 'disabled' : ''} data-a="moveItem" data-id="${pid}" data-i="${i}" data-dir="1">${ic('down', 's')} ลง</button>
    <button type="button" class="btn bad" data-a="delItem" data-id="${pid}" data-i="${i}">${ic('trash', 's')} ลบ</button></div></form>`);
}
forms.item = d => {
  const it = prog(d.pid).days[ui.pd].items[+d.i];
  Object.assign(it, { sets: Math.max(1, +d.sets || 1), reps: d.reps.trim() || '10', rest: Math.max(0, +d.rest || 0), weight: d.weight.trim(), note: d.note.trim() });
  save(); closeSheet(() => render());
};
let PK = null;
function pickerSheet(pid) {
  PK = { pid, sel: [], q: '', m: 'all', c: 'all', home: (prog(pid).place === 'home') };
  const w = sheet('เพิ่มท่า', `<div class="search">${ic('search')}<input id="pq" type="search" placeholder="ค้นหาท่า" autocomplete="off"></div>
    <div class="chips" style="margin:0 -16px">${['all', ...Object.keys(MUSCLES)].map(k => `<button class="chip ${k === 'all' ? 'on' : ''}" data-a="pkM" data-k="${k}">${k === 'all' ? 'ทั้งหมด' : MUSCLES[k].e + ' ' + MUSCLES[k].th}</button>`).join('')}</div>
    <div class="chips" style="margin:0 -16px;padding-top:0">${['all', ...Object.keys(CAT_TH)].map(k => `<button class="chip ${k === 'all' ? 'on' : ''}" data-a="pkC" data-k="${k}">${k === 'all' ? 'ทุกประเภท' : CAT_E[k] + ' ' + CAT_TH[k]}</button>`).join('')}</div>
    <label class="sw"><span>🏠 แสดงเฉพาะท่าที่ทำที่บ้านได้</span><input type="checkbox" ${PK.home ? 'checked' : ''} data-a="pkHome"></label><div id="pklist"></div>`, { tall: true, footer: `<button class="btn pri block" id="pkgo" data-a="pkAdd" style="padding:14px" disabled>เลือกท่าที่ต้องการ</button>` });
  pkRender();
}
function pkRender() {
  const q = PK.q.trim().toLowerCase();
  const all = filterEx({ q: PK.q, m: PK.m, c: PK.c, p: PK.home ? 'home' : 'all' }), l = all.slice(0, 80);
  const el = $('#pklist'); if (!el) return;
  el.innerHTML = l.map(e => `<div class="pick ${PK.sel.includes(e.id) ? 'on' : ''}" data-a="pkToggle" data-id="${esc(e.id)}">${media(e, 'thumb')}<div class="n">${esc(e.th)}<small>${(MUSCLES[e.m] || MUSCLES.core).th} • ${CAT_TH[e.cat] || ''} • ${esc(EQUIP[e.eq] || '')}</small></div><div class="ck">${ic('check', 's')}</div></div>`).join('') || '<div class="empty">ไม่พบท่า</div>';
  if (all.length > 80) el.innerHTML += `<div class="sub" style="text-align:center;padding:10px">แสดง 80 จาก ${all.length} ท่า — พิมพ์ค้นหาหรือเลือกหมวดเพื่อกรอง</div>`;
  const b = $('#pkgo'); if (b) { b.disabled = !PK.sel.length; b.textContent = PK.sel.length ? `เพิ่ม ${PK.sel.length} ท่า` : 'เลือกท่าที่ต้องการ'; }
}

/* ============ EXPORT UI ============ */
const THEMES = { sunset: ['#FF5A3C', '#FF9A44'], ocean: ['#2563EB', '#06B6D4'], forest: ['#059669', '#84CC16'], night: ['#1F2937', '#6366F1'], rose: ['#E11D48', '#F472B6'] };
let EXP = null;
function exportSheet(title, file, opts, draw) {
  EXP = { file, draw, opts: { theme: 'sunset', ...opts }, blob: null, url: '' };
  const themes = `<div class="fld"><span>ธีมสี</span><div class="themes">${Object.entries(THEMES).map(([k, g]) => `<label><input type="radio" name="th" value="${k}" ${k === EXP.opts.theme ? 'checked' : ''} data-a="expOpt" data-k="theme"><span style="--g:linear-gradient(135deg,${g[0]},${g[1]})"></span></label>`).join('')}</div></div>`;
  sheet(title, (opts.extra || '') + themes + `<div class="prev" id="expPrev"><div class="spin"></div></div><div class="sub" style="text-align:center">กดค้างที่รูปเพื่อบันทึก หรือใช้ปุ่มด้านล่าง</div>`,
    { tall: true, footer: `<button class="btn block" data-a="expDl">${ic('down2', 's')} บันทึก</button><button class="btn pri block" data-a="expShare">${ic('share', 's')} แชร์รูป</button>` });
  expRun();
}
let expSeq = 0;
async function expRun() {
  const my = ++expSeq, prev = $('#expPrev'); if (prev) prev.innerHTML = '<div class="spin"></div>';
  try {
    const cv = await EXP.draw(EXP.opts); if (my !== expSeq || !EXP) return;
    EXP.blob = await new Promise(r => cv.toBlob(r, 'image/png'));
    if (EXP.url) URL.revokeObjectURL(EXP.url); EXP.url = URL.createObjectURL(EXP.blob);
    const p = $('#expPrev'); if (p) p.innerHTML = `<img alt="ตัวอย่าง" src="${EXP.url}">`;
  } catch (e) { console.error(e); const p = $('#expPrev'); if (p) p.innerHTML = '<div class="empty">สร้างรูปไม่สำเร็จ ลองใหม่อีกครั้ง</div>'; }
}
function weekExport(cid = '') {
  const ws = wkStart(ui.cd);
  const sel = `<div class="fld"><span>แสดงตารางของ</span><select id="expClient" data-a="expOpt" data-k="clientId"><option value="">ทุกคน</option>${S.clients.filter(c => !c.archived).map(c => `<option value="${c.id}" ${c.id === cid ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div>`;
  exportSheet('ส่งออกตารางสัปดาห์', `ตารางเทรน_${ws}.png`, { clientId: cid, extra: sel }, o => drawWeek(ws, o));
}

/* ============ ACTIONS ============ */
const A = {
  back() { history.length > 1 ? history.back() : go('/home'); },
  closeSheet() { closeSheet(); },
  newClient() { clientForm(); },
  editClient(d) { closeSheet(() => clientForm(d.id)); },
  cfilter(d) { ui.cf = d.k; render(); },
  ctab(d) { ui.ct = d.k; render(); },
  newSession(d) { sessionForm(null, { date: d.date, clientId: d.client }); },
  openSession(d) { sessionForm(d.id); },
  quickDone(d) { quickDone(d.id); },
  delSession(d) { if (askConfirm('ลบนัดนี้?')) { S.sessions = S.sessions.filter(s => s.id !== d.id); save(); closeSheet(() => { render(); toast('ลบแล้ว'); }); } },
  logToday(d) { logToday(d.id); },
  addPast(d) { sessionForm(null, { clientId: d.id, date: addD(today(), -1), status: 'done' }); },
  renew(d) { packForm(d.id); },
  editPack(d) { packForm(d.id, d.pid); },
  delPack(d) { if (askConfirm('ลบคอร์สนี้? (ประวัติการเทรนจะยังอยู่)')) { const c = client(d.id); c.packs = c.packs.filter(p => p.id !== d.pid); save(); closeSheet(() => render()); } },
  addMetric(d) { metricForm(d.id); },
  delMetric(d) { if (askConfirm('ลบบันทึกนี้?')) { const c = client(d.id); c.metrics = c.metrics.filter(m => m.id !== d.mid); save(); render(); } },
  clientMenu(d) {
    const c = client(d.id);
    sheet(esc(c.name), `<div class="menu"><button data-a="editClient" data-id="${c.id}">${ic('edit')} แก้ไขข้อมูล</button>
      <button data-a="shareSched" data-id="${c.id}">${ic('share')} ส่งตารางนัด (ข้อความ)</button>
      <button data-a="clientWeekImg" data-id="${c.id}">${ic('image')} ส่งออกตารางสัปดาห์เป็นรูป</button>
      <button data-a="archive" data-id="${c.id}">${ic('down2')} ${c.archived ? 'นำกลับมาใช้งาน' : 'เก็บถาวร (ซ่อนจากรายการ)'}</button>
      <button class="bad" data-a="delClient" data-id="${c.id}">${ic('trash')} ลบลูกเทรน</button></div>`);
  },
  shareSched(d) {
    const c = client(d.id), t = today(), st = stats(c);
    const up = S.sessions.filter(s => s.clientId === c.id && s.status === 'planned' && s.date >= t).sort(cmpS).slice(0, 12);
    const txt = `สวัสดีครับ คุณ${c.name} 🏋️\nตารางเทรนที่จะถึง:\n` + (up.length ? up.map(s => `• ${fmtMid(s.date)} เวลา ${s.time}–${endTime(s)} น.`).join('\n') : '(ยังไม่มีนัด)') + (st.cur ? `\n\nคอร์สเหลืออีก ${st.left} ครั้ง` : '') + (S.settings.trainer ? `\n— ${S.settings.trainer}` : '');
    closeSheet(async () => { if (navigator.share) { try { await navigator.share({ text: txt }); return; } catch (e) { if (e.name === 'AbortError') return; } } try { await navigator.clipboard.writeText(txt); toast('คัดลอกข้อความแล้ว'); } catch (e) { prompt('คัดลอกข้อความ', txt); } });
  },
  clientWeekImg(d) { ui.cd = today(); closeSheet(() => weekExport(d.id)); },
  archive(d) { const c = client(d.id); c.archived = !c.archived; save(); closeSheet(() => { render(); toast(c.archived ? 'เก็บถาวรแล้ว' : 'นำกลับมาแล้ว'); }); },
  delClient(d) {
    const c = client(d.id); if (!askConfirm(`ลบ "${c.name}" พร้อมประวัติ นัด และโปรแกรมทั้งหมด?\nการลบไม่สามารถกู้คืนได้`)) return;
    S.clients = S.clients.filter(x => x.id !== c.id); S.sessions = S.sessions.filter(s => s.clientId !== c.id); S.programs = S.programs.filter(p => p.clientId !== c.id);
    save(); closeSheet(() => { go('/clients'); toast('ลบแล้ว'); });
  },
  /* calendar */
  calPrev() { ui.cd = ui.cm === 'week' ? addD(ui.cd, -7) : shiftMonth(ui.cd, -1); render(); },
  calNext() { ui.cd = ui.cm === 'week' ? addD(ui.cd, 7) : shiftMonth(ui.cd, 1); render(); },
  calToday() { ui.cd = today(); render(); },
  calMode(d) { ui.cm = d.m; render(); },
  calSel(d) { ui.cd = d.date; render(); },
  scrollDay(d) { $('#d-' + d.date)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); },
  calExport() { weekExport(); },
  calMenu() {
    sheet('เพิ่มเติม', `<div class="menu"><button data-a="calExportM">${ic('image')} ส่งออกตารางสัปดาห์เป็นรูป</button>
      <button data-a="calIcs">${ic('cal')} ส่งนัดทั้งหมดไปปฏิทินมือถือ (.ics)</button>
      <button data-a="calGoto">${ic('clock')} ไปยังวันที่...</button></div>`);
  },
  calExportM() { closeSheet(() => weekExport()); },
  calIcs() { closeSheet(exportIcs); },
  calGoto() { sheet('ไปยังวันที่', `<form data-f="goto">${fld('วันที่', `<input type="date" name="d" value="${ui.cd}" required>`)}<button class="btn pri block" style="padding:14px">ไป</button></form>`); },
  /* export */
  expOpt(d, el) { EXP.opts[d.k] = el.value; expRun(); },
  expShare() { if (EXP?.blob) shareOrDownload(EXP.blob, EXP.file, EXP.file); },
  expDl() { if (!EXP?.blob) return; const a = document.createElement('a'); a.href = EXP.url; a.download = EXP.file; document.body.appendChild(a); a.click(); a.remove(); toast('บันทึกรูปแล้ว'); },
  /* library */
  libM(d) { ui.lm = d.k; ui.ln = 48; render(); },
  libP(d) { ui.lp = d.k; ui.ln = 48; render(); },
  libC(d) { ui.lc = d.k; ui.ln = 48; render(); },
  libMore() { ui.ln += 60; $('#liblist').innerHTML = libList(); },
  openEx(d) { openEx(d.id); },
  newEx() { exForm(); },
  editEx(d) { closeSheet(() => exForm(d.id)); },
  delEx(d) {
    const used = S.programs.some(p => p.days.some(dy => dy.items.some(i => i.ex === d.id)));
    if (!askConfirm(used ? 'ท่านี้ถูกใช้ในโปรแกรม ต้องการลบจริงหรือไม่?' : 'ลบท่านี้?')) return;
    S.customEx = S.customEx.filter(e => e.id !== d.id); resetEx(); save(); closeSheet(() => render());
  },
  /* program */
  newProgram(d) { newProgramForm(d.client); },
  pday(d) { ui.pd = +d.i; render(); },
  addDay(d) { const p = prog(d.id); p.days.push({ id: uid(), name: `วันที่ ${p.days.length + 1}`, items: [] }); ui.pd = p.days.length - 1; save(); render(); },
  dayMenu(d) {
    const p = prog(d.id);
    sheet('จัดการวันฝึก', `<form data-f="dayname"><input type="hidden" name="pid" value="${p.id}">${fld('ชื่อวัน', `<input name="name" value="${esc(p.days[ui.pd].name)}" required>`)}<button class="btn pri block" style="padding:14px">บันทึกชื่อ</button></form>
      <div class="menu" style="margin-top:10px"><button data-a="dupDay" data-id="${p.id}">${ic('copy')} ทำสำเนาวันนี้</button>${p.days.length > 1 ? `<button class="bad" data-a="delDay" data-id="${p.id}">${ic('trash')} ลบวันนี้</button>` : ''}</div>`);
  },
  dupDay(d) { const p = prog(d.id), src = p.days[ui.pd]; p.days.splice(ui.pd + 1, 0, { id: uid(), name: src.name + ' (สำเนา)', items: src.items.map(i => ({ ...i, id: uid() })) }); ui.pd++; save(); closeSheet(() => render()); },
  delDay(d) { if (!askConfirm('ลบวันฝึกนี้?')) return; const p = prog(d.id); p.days.splice(ui.pd, 1); ui.pd = 0; save(); closeSheet(() => render()); },
  addEx(d) { pickerSheet(d.id); },
  editItem(d) { itemForm(d.id, +d.i); },
  moveItem(d) { const it = prog(d.id).days[ui.pd].items, i = +d.i, j = i + +d.dir; if (j < 0 || j >= it.length) return; [it[i], it[j]] = [it[j], it[i]]; save(); closeSheet(() => render()); },
  delItem(d) { prog(d.id).days[ui.pd].items.splice(+d.i, 1); save(); closeSheet(() => render()); },
  progMenu(d) {
    const p = prog(d.id);
    sheet('โปรแกรม', `<form data-f="progname"><input type="hidden" name="pid" value="${p.id}">${fld('ชื่อโปรแกรม', `<input name="name" value="${esc(p.name)}" required>`)}
      <div class="fld"><span>เป้าหมาย</span><div class="seg">${['fat', 'muscle'].map(g => `<label><input type="radio" name="goal" value="${g}" ${p.goal === g ? 'checked' : ''}><span>${GOALS[g].e} ${GOALS[g].th}</span></label>`).join('')}</div></div>
      ${placeSeg(p.place || 'gym')}
      <button class="btn pri block" style="padding:14px">บันทึก</button></form>
      <div class="menu" style="margin-top:10px"><button data-a="expProg" data-id="${p.id}">${ic('image')} ส่งออกเป็นรูป</button><button data-a="dupProg" data-id="${p.id}">${ic('copy')} ทำสำเนาให้ลูกเทรนคนอื่น/คนเดิม</button><button class="bad" data-a="delProg" data-id="${p.id}">${ic('trash')} ลบโปรแกรม</button></div>`);
  },
  dupProg(d) {
    const p = prog(d.id), others = S.clients.filter(c => !c.archived);
    sheet('ทำสำเนาโปรแกรม', `<form data-f="dupprog"><input type="hidden" name="pid" value="${p.id}">${fld('ให้กับ', `<select name="cid">${others.map(c => `<option value="${c.id}" ${c.id === p.clientId ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select>`)}<button class="btn pri block" style="padding:14px">ทำสำเนา</button></form>`);
  },
  delProg(d) { if (!askConfirm('ลบโปรแกรมนี้?')) return; S.programs = S.programs.filter(p => p.id !== d.id); save(); closeSheet(() => { history.back(); }); },
  expProg(d) {
    const p = prog(d.id), c = client(p.clientId);
    const extra = `<div class="fld"><span>ส่งออก</span><select data-a="expOpt" data-k="day"><option value="all">ทุกวัน (รูปเดียว)</option>${p.days.map((x, i) => `<option value="${i}" ${i === ui.pd ? '' : ''}>${esc(x.name)}</option>`).join('')}</select></div>`;
    const go_ = () => exportSheet('ส่งออกโปรแกรม', `โปรแกรม_${c?.name || ''}_${p.name}.png`, { day: 'all', extra }, o => drawProgram(p, o));
    if (sheetEl) closeSheet(go_); else go_();
  },
  pkM(d) { PK.m = d.k; $$('[data-a=pkM]').forEach(b => b.classList.toggle('on', b.dataset.k === d.k)); pkRender(); },
  pkC(d) { PK.c = d.k; $$('[data-a=pkC]').forEach(b => b.classList.toggle('on', b.dataset.k === d.k)); pkRender(); },
  pkHome(d, el) { PK.home = el.checked; pkRender(); },
  pkToggle(d) { const i = PK.sel.indexOf(d.id); i >= 0 ? PK.sel.splice(i, 1) : PK.sel.push(d.id); pkRender(); },
  pkAdd() {
    const p = prog(PK.pid), g = p.goal, dy = p.days[ui.pd];
    PK.sel.forEach(id => {
      const e = exById(id), cardio = e.m === 'cardio', st = e.cat === 'stretching';
      dy.items.push({ id: uid(), ex: id, sets: st ? 2 : cardio ? 1 : 3, reps: st ? '30 วินาที/ข้าง' : cardio ? '10 นาที' : g === 'fat' ? '12–15' : '8–12', rest: st || cardio ? 0 : g === 'fat' ? 45 : 90, weight: '', note: '' });
    });
    save(); closeSheet(() => render());
  },
  /* train */
  trSet(d) {
    const set = (TR.done[d.item] ||= new Set()), k = +d.k;
    if (set.has(k)) set.delete(k); else { set.add(k); navigator.vibrate?.(30); keepAwake(); }
    const y = window.scrollY, nowSet = set.has(k); render(); window.scrollTo(0, y);
    if (nowSet && +d.rest) startRest(+d.rest);
    else if (TR.end > Date.now()) $('#restbar')?.classList.remove('hide');
  },
  restAdd() { TR.end += 15000; },
  restStop() { clearInterval(trTimer); $('#restbar')?.classList.add('hide'); },
  finishTrain(d) {
    const p = prog(d.id); if (!askConfirm('จบการเทรนและบันทึกว่าเทรนเสร็จ 1 ครั้ง?')) return;
    clearInterval(trTimer); wakeLock?.release?.(); TR = null;
    history.back(); setTimeout(() => logToday(p.clientId), 150);
  },
  /* settings */
  setTheme(d) { S.settings.theme = d.k; save(); applyTheme(); render(); },
  setAccent(d) { S.settings.accent = d.k; save(); applyTheme(); },
  backup() {
    const blob = new Blob([JSON.stringify({ app: 'ptplanner', exported: new Date().toISOString(), data: S })], { type: 'application/json' });
    shareOrDownload(blob, `ptplanner-backup-${today()}.json`, 'สำรองข้อมูล PT Planner');
  },
  demo() { if (S.clients.length && !askConfirm('เพิ่มข้อมูลตัวอย่างต่อท้ายข้อมูลเดิม?')) return; seedDemo(); render(); toast('เพิ่มข้อมูลตัวอย่างแล้ว'); },
  wipe() { if (askConfirm('ลบข้อมูลทั้งหมดในแอปนี้?\nควรสำรองข้อมูลก่อน') && askConfirm('ยืนยันอีกครั้ง — ลบทั้งหมดและเริ่มใหม่?')) { S = DEF(); save(); resetEx(); go('/home'); render(); toast('ลบข้อมูลทั้งหมดแล้ว'); } },
  toggleCourse(d, el) { $('#courseBox').classList.toggle('hide', !el.checked); },
  toggleRepeat(d, el) { $('#repBox').classList.toggle('hide', !el.checked); }
};
function shiftMonth(s, n) { const d = pd(s), day = d.getDate(); d.setDate(1); d.setMonth(d.getMonth() + n); const max = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(); d.setDate(Math.min(day, max)); return ymd(d); }

forms.goto = d => { ui.cd = d.d; closeSheet(() => render()); };
forms.dayname = d => { prog(d.pid).days[ui.pd].name = d.name.trim(); save(); closeSheet(() => render()); };
forms.progname = d => { const p = prog(d.pid); p.name = d.name.trim(); p.goal = d.goal; p.place = d.place; save(); closeSheet(() => render()); };
forms.dupprog = d => {
  const p = prog(d.pid), n = JSON.parse(JSON.stringify(p)); n.id = uid(); n.clientId = d.cid; n.name = p.name + ' (สำเนา)'; n.days.forEach(dy => { dy.id = uid(); dy.items.forEach(i => i.id = uid()); });
  S.programs.push(n); save(); closeSheet(() => go('/program/' + n.id));
};

/* ---------- ICS ---------- */
function exportIcs() {
  const t = today(), list = S.sessions.filter(s => s.status !== 'cancel' && s.date >= addD(t, -7));
  if (!list.length) { toast('ไม่มีนัดให้ส่งออก'); return; }
  const f = (d, tm) => d.replace(/-/g, '') + 'T' + tm.replace(':', '') + '00';
  const L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//PT Planner//TH', 'CALSCALE:GREGORIAN'];
  list.forEach(s => {
    const c = client(s.clientId); if (!c) return;
    L.push('BEGIN:VEVENT', `UID:${s.id}@ptplanner`, `DTSTAMP:${f(t, '00:00')}`, `DTSTART:${f(s.date, s.time)}`, `DTEND:${f(s.date, endTime(s))}`, `SUMMARY:เทรน ${c.name}`, `DESCRIPTION:${(s.note || '').replace(/\n/g, ' ')}`, 'END:VEVENT');
  });
  L.push('END:VCALENDAR');
  shareOrDownload(new Blob([L.join('\r\n')], { type: 'text/calendar' }), 'ptplanner-schedule.ics');
}

/* ---------- demo data ---------- */
function seedDemo() {
  const t = today(), ws = wkStart(t);
  const mk = (name, goal, color, used, total, price, health) => ({ id: uid(), name, phone: '', goal, color, health: health || '', note: '', created: addD(t, -40), archived: false, metrics: [], packs: [{ id: uid(), total, prior: 0, price, start: addD(t, -35) }] });
  const cs = [mk('คุณแพรว', 'fat', COLORS[0], 7, 10, 6500, 'เข่าซ้ายเคยเจ็บ หลีกเลี่ยงกระโดดแรงๆ'), mk('คุณบอม', 'muscle', COLORS[1], 4, 10, 8000), mk('คุณมายด์', 'fat', COLORS[2], 9, 10, 6500)];
  cs[0].metrics = [{ id: uid(), date: addD(t, -35), weight: 68.5, fat: 31, waist: 80, note: 'เริ่มต้น' }, { id: uid(), date: addD(t, -14), weight: 66.8, fat: 29.5, waist: 77, note: '' }, { id: uid(), date: addD(t, -2), weight: 65.4, fat: 28.2, waist: 75, note: '' }];
  [[cs[0], 7], [cs[1], 4], [cs[2], 9]].forEach(([c, n]) => { for (let i = 0; i < n; i++) S.sessions.push({ id: uid(), clientId: c.id, date: addD(t, -3 * (n - i) - 1), time: '17:00', dur: 60, note: '', status: 'done' }); });
  const plan = [[0, cs[0], '17:00'], [1, cs[1], '18:30'], [2, cs[2], '07:00'], [3, cs[0], '17:00'], [4, cs[1], '18:30'], [5, cs[2], '09:00']];
  plan.forEach(([o, c, tm]) => { const d = addD(ws, o); if (d >= t) S.sessions.push({ id: uid(), clientId: c.id, date: d, time: tm, dur: 60, note: '', status: 'planned' }); });
  S.clients.push(...cs);
  [[cs[0], 'fat'], [cs[1], 'muscle']].forEach(([c, g]) => S.programs.push({ id: uid(), clientId: c.id, name: g === 'fat' ? 'ลดไขมัน 8 สัปดาห์ (ที่บ้าน)' : 'สร้างกล้าม Upper/Lower (ยิม)', goal: g, place: g === 'fat' ? 'home' : 'gym', created: t,
    days: TEMPLATES[g + '_' + (g === 'fat' ? 'home' : 'gym')].days.map(dy => ({ id: uid(), name: dy.name, items: dy.items.map(([ex, sets, reps, rest]) => ({ id: uid(), ex, sets, reps, rest, weight: '', note: '' })) })) }));
  save();
}

/* ============ GLOBAL EVENTS ============ */
document.addEventListener('click', e => {
  const g = e.target.closest('[data-go]');
  const a = e.target.closest('[data-a]');
  // เลือกตัวที่อยู่ลึกกว่า (ใกล้ target มากกว่า)
  if (a && (!g || g.contains(a))) {
    if (a.tagName === 'INPUT' && a.type !== 'checkbox' && a.type !== 'radio') return;
    if (a.tagName === 'SELECT') return;
    if (a.type === 'checkbox' || a.type === 'radio') return; // handled by change
    A[a.dataset.a]?.(a.dataset, a, e); return;
  }
  if (g) { if (sheetEl) { const p = g.dataset.go; closeSheet(() => go(p)); } else go(g.dataset.go); return; }
  const tab = e.target.closest('[data-tab]');
  if (tab) { const t = tab.dataset.tab; go('/' + t); }
});
document.addEventListener('change', e => {
  const a = e.target.closest('[data-a]');
  if (a && (a.type === 'checkbox' || a.type === 'radio' || a.tagName === 'SELECT')) { A[a.dataset.a]?.(a.dataset, a, e); return; }
  if (e.target.id === 's-trainer') { S.settings.trainer = e.target.value.trim(); save(); }
  else if (e.target.id === 's-course') { S.settings.course = Math.max(1, +e.target.value || 10); save(); }
  else if (e.target.id === 's-dur') { S.settings.dur = Math.max(10, +e.target.value || 60); save(); }
  else if (e.target.id === 's-ws') { S.settings.weekStart = +e.target.value; save(); toast('บันทึกแล้ว'); }
  else if (e.target.id === 'restore') restoreFile(e.target.files[0]);
  else if (e.target.id === 'exFile' && e.target.files[0]) resizeImage(e.target.files[0]).then(u => { tmpImg = u; $('#exImgPrev').innerHTML = `<img src="${u}" style="width:120px;border-radius:12px">`; }).catch(() => toast('อ่านรูปไม่ได้'));
});
document.addEventListener('input', e => {
  if (e.target.id === 'cq') { ui.cq = e.target.value; $('#clist').innerHTML = clientRows(clientData()); }
  else if (e.target.id === 'lq') { ui.lq = e.target.value; ui.ln = 48; $('#liblist').innerHTML = libList(); }
  else if (e.target.id === 'pq') { PK.q = e.target.value; pkRender(); }
});
document.addEventListener('submit', e => {
  const f = e.target.closest('form[data-f]'); if (!f) return;
  e.preventDefault(); const fd = new FormData(f);
  forms[f.dataset.f]?.(Object.fromEntries(fd), f, fd);
});
function restoreFile(file) {
  if (!file) return;
  const fr = new FileReader();
  fr.onload = () => {
    try {
      const j = JSON.parse(fr.result), d = j.data || j;
      if (!Array.isArray(d.clients) || !Array.isArray(d.sessions)) throw 0;
      if (!askConfirm(`กู้คืนข้อมูล: ลูกเทรน ${d.clients.length} คน, ${d.sessions.length} นัด\nข้อมูลปัจจุบันจะถูกแทนที่ ต้องการต่อไหม?`)) return;
      const n = DEF(); S = Object.assign(n, d, { settings: Object.assign(n.settings, d.settings) }); save(); resetEx(); applyTheme(); go('/home'); render(); toast('กู้คืนข้อมูลแล้ว');
    } catch (err) { toast('ไฟล์ไม่ถูกต้อง'); }
  };
  fr.readAsText(file);
}
/* swipe ในปฏิทิน */
let sx = 0, sy = 0;
document.addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
document.addEventListener('touchend', e => {
  if (route()[0] !== 'cal' || sheetEl) return;
  const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
  if (Math.abs(dx) > 90 && Math.abs(dy) < 45) dx < 0 ? A.calNext() : A.calPrev();
}, { passive: true });

/* FAB */
function quickAdd() {
  sheet('เพิ่มใหม่', `<div class="menu"><button data-a="qSession">${ic('cal')} นัดเทรนใหม่</button><button data-a="qLog">${ic('check')} บันทึกเทรนเสร็จ (ลูกเทรน)</button><button data-a="qClient">${ic('user')} เพิ่มลูกเทรน</button></div>`);
}
Object.assign(A, {
  qSession() { closeSheet(() => sessionForm(null, { date: route()[0] === 'cal' ? ui.cd : today() })); },
  qClient() { closeSheet(() => clientForm()); },
  qLog() {
    const cl = S.clients.filter(c => !c.archived); if (!cl.length) { closeSheet(() => toast('เพิ่มลูกเทรนก่อน')); return; }
    sheet('บันทึกเทรนเสร็จ — เลือกลูกเทรน', `<div>${cl.map(c => { const st = stats(c); return `<div class="crow" data-a="qLogGo" data-id="${c.id}" style="--c:${c.color}"><div class="av">${esc(initial(c.name))}</div><div class="cinfo"><div class="cname">${esc(c.name)}</div><div class="sub">${st.cur ? `ครั้งต่อไป ${st.cur.used + 1}/${st.cur.total}` : st.packs.length ? 'จบคอร์สแล้ว' : 'ไม่มีคอร์ส'}</div></div>${ic('check')}</div>`; }).join('')}</div>`);
  },
  qLogGo(d) { closeSheet(() => logToday(d.id)); }
});

/* ============ BOOT ============ */
applyTheme();
document.addEventListener('DOMContentLoaded', () => {
  $('#fab').addEventListener('click', quickAdd);
  render();
});
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => { });
navigator.storage?.persist?.();
