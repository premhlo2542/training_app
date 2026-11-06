'use strict';
/* ====== สร้างรูปภาพสำหรับส่งออก (Canvas) ====== */
const FONT = '"Sarabun","Noto Sans Thai","Leelawadee UI",system-ui,sans-serif';

function rr(c, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
function hexA(h, a) { const n = parseInt(h.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; }
function fit(c, t, maxW) {
  t = String(t); if (c.measureText(t).width <= maxW) return t;
  while (t.length > 1 && c.measureText(t + '…').width > maxW) t = t.slice(0, -1);
  return t + '…';
}
async function loadFonts() {
  try {
    await Promise.race([
      Promise.all([document.fonts.load(`400 30px ${FONT}`), document.fonts.load(`700 30px ${FONT}`), document.fonts.load(`800 30px ${FONT}`)]),
      new Promise(r => setTimeout(r, 2500))]);
  } catch (e) { /* ignore */ }
}
function loadImg(url) {
  return new Promise(res => {
    const im = new Image(); im.crossOrigin = 'anonymous';
    const t = setTimeout(() => res(null), 7000);
    im.onload = () => { clearTimeout(t); res(im); }; im.onerror = () => { clearTimeout(t); res(null); };
    im.src = url;
  });
}
function mkCanvas(w, h) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; return cv; }
function header(c, W, H, theme, eyebrow, title, line2, line3) {
  const [a, b] = THEMES[theme] || THEMES.sunset;
  const g = c.createLinearGradient(0, 0, W, H); g.addColorStop(0, a); g.addColorStop(1, b);
  c.save(); rr(c, 0, -80, W, H + 80, 70); c.fillStyle = g; c.fill(); c.clip();
  c.fillStyle = 'rgba(255,255,255,.12)'; c.beginPath(); c.arc(W - 90, 40, 230, 0, 7); c.fill();
  c.fillStyle = 'rgba(255,255,255,.08)'; c.beginPath(); c.arc(90, H + 10, 190, 0, 7); c.fill();
  c.restore();
  c.fillStyle = '#fff'; c.textBaseline = 'alphabetic'; c.textAlign = 'left';
  c.font = `700 26px ${FONT}`; c.globalAlpha = .85;
  if (c.letterSpacing !== undefined) c.letterSpacing = '4px';
  c.fillText(eyebrow, 64, 96);
  if (c.letterSpacing !== undefined) c.letterSpacing = '0px';
  c.globalAlpha = 1; c.font = `800 68px ${FONT}`; c.fillText(fit(c, title, W - 128), 64, 180);
  c.font = `600 38px ${FONT}`; c.globalAlpha = .95; if (line2) c.fillText(fit(c, line2, W - 128), 64, 240);
  c.font = `500 30px ${FONT}`; c.globalAlpha = .85; if (line3) c.fillText(fit(c, line3, W - 128), 64, 292);
  c.globalAlpha = 1;
}
function footer(c, W, y, left) {
  c.textAlign = 'center'; c.fillStyle = '#8A91A5'; c.font = `600 28px ${FONT}`;
  c.fillText(left, W / 2, y + 40); c.font = `500 22px ${FONT}`; c.fillStyle = '#B0B6C6'; c.fillText('PT Planner', W / 2, y + 78);
  c.textAlign = 'left';
}

/* ---------- ตารางสัปดาห์ ---------- */
async function drawWeek(ws, o) {
  await loadFonts();
  const W = 1080, P = 48, HEAD = 340, CH = 86, GAP = 12, [ta, tb] = THEMES[o.theme] || THEMES.sunset;
  const days = [...Array(7)].map((_, i) => addD(ws, i));
  const data = days.map(d => S.sessions.filter(s => s.date === d && s.status !== 'cancel' && (!o.clientId || s.clientId === o.clientId)).sort(cmpS));
  const rowH = data.map(l => Math.max(168, 40 + l.length * (CH + GAP) - GAP));
  const H = HEAD + 40 + rowH.reduce((a, b) => a + b + 22, 0) + 130;
  const cv = mkCanvas(W, H), c = cv.getContext('2d');
  c.fillStyle = '#F2F4F9'; c.fillRect(0, 0, W, H);
  const cl = o.clientId ? client(o.clientId) : null, total = data.reduce((a, l) => a + l.length, 0);
  const we = addD(ws, 6), s0 = pd(ws), s1 = pd(we);
  const range = s0.getMonth() === s1.getMonth() ? `${s0.getDate()} – ${s1.getDate()} ${MON[s1.getMonth()]} ${s1.getFullYear() + 543}` : `${s0.getDate()} ${MONS[s0.getMonth()]} – ${s1.getDate()} ${MONS[s1.getMonth()]} ${s1.getFullYear() + 543}`;
  header(c, W, HEAD, o.theme, 'WEEKLY TRAINING SCHEDULE', cl ? `ตารางเทรนของ ${cl.name}` : 'ตารางเทรนประจำสัปดาห์', range, S.settings.trainer ? `เทรนเนอร์: ${S.settings.trainer}` : `ทั้งหมด ${total} นัด`);
  let y = HEAD + 40;
  days.forEach((d, i) => {
    const h = rowH[i], list = data[i], cw = W - P * 2, dt = pd(d), has = list.length > 0;
    c.save(); c.shadowColor = 'rgba(30,40,80,.10)'; c.shadowBlur = 28; c.shadowOffsetY = 8; rr(c, P, y, cw, h, 40); c.fillStyle = '#fff'; c.fill(); c.restore();
    // date tile
    const tx = P + 14, tw = 170, th = h - 28;
    rr(c, tx, y + 14, tw, th, 30);
    if (has) { const g = c.createLinearGradient(tx, y, tx + tw, y + th); g.addColorStop(0, ta); g.addColorStop(1, tb); c.fillStyle = g; } else c.fillStyle = '#EEF0F6';
    c.fill();
    c.textAlign = 'center'; c.fillStyle = has ? '#fff' : '#9AA1B4'; const cx = tx + tw / 2, cy = y + 14 + th / 2;
    c.font = `700 28px ${FONT}`; c.textBaseline = 'middle'; c.fillText(DOW[dt.getDay()], cx, cy - 48);
    c.font = `800 64px ${FONT}`; c.fillText(String(dt.getDate()), cx, cy + 2);
    c.font = `600 25px ${FONT}`; c.fillText(MONS[dt.getMonth()], cx, cy + 48);
    c.textAlign = 'left';
    const x0 = tx + tw + 26, x1 = P + cw - 26;
    if (!has) { c.fillStyle = '#B4BACB'; c.font = `600 32px ${FONT}`; c.fillText('วันพัก 😴', x0, y + h / 2); }
    list.forEach((s, k) => {
      const cc = client(s.clientId), cy2 = y + 20 + k * (CH + GAP), col = cc?.color || '#888';
      rr(c, x0, cy2, x1 - x0, CH, 26); c.fillStyle = hexA(col, .13); c.fill();
      rr(c, x0, cy2, 14, CH, 7); c.fillStyle = col; c.fill();
      c.fillStyle = '#1B2030'; c.font = `800 34px ${FONT}`; c.textBaseline = 'middle';
      const t = `${s.time}–${endTime(s)}`; c.fillText(t, x0 + 36, cy2 + CH / 2 + 1);
      const tw2 = c.measureText(t).width; c.font = `700 34px ${FONT}`;
      const rightPad = s.status === 'done' ? 70 : 20;
      c.fillStyle = '#1B2030'; c.fillText(fit(c, cc?.name || '', x1 - (x0 + 36 + tw2 + 28) - rightPad), x0 + 36 + tw2 + 28, cy2 + CH / 2 + 1);
      if (s.status === 'done') { c.fillStyle = '#16A34A'; c.beginPath(); c.arc(x1 - 38, cy2 + CH / 2, 22, 0, 7); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 5; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(x1 - 48, cy2 + CH / 2 + 1); c.lineTo(x1 - 40, cy2 + CH / 2 + 9); c.lineTo(x1 - 27, cy2 + CH / 2 - 8); c.stroke(); }
    });
    y += h + 22;
  });
  c.textBaseline = 'alphabetic';
  footer(c, W, y + 6, `รวม ${total} นัด${S.settings.trainer ? ' • ' + S.settings.trainer : ''}`);
  return cv;
}

/* ---------- โปรแกรมการเล่น ---------- */
async function drawProgram(p, o) {
  await loadFonts();
  const W = 1080, P = 48, HEAD = 360, RH = 148, RG = 12, [ta, tb] = THEMES[o.theme] || THEMES.sunset;
  const days = o.day === 'all' || o.day == null ? p.days : [p.days[+o.day]].filter(Boolean);
  const exs = [...new Set(days.flatMap(d => d.items.map(i => i.ex)))];
  const imgs = {};
  await Promise.all(exs.map(async id => { const u = exImgs(exById(id))[0]; imgs[id] = u ? await loadImg(u) : null; }));
  const dayH = days.map(d => 96 + Math.max(1, d.items.length) * (RH + RG) + 26);
  const H = HEAD + 30 + dayH.reduce((a, b) => a + b, 0) + 130;
  const cv = mkCanvas(W, H), c = cv.getContext('2d');
  c.fillStyle = '#F2F4F9'; c.fillRect(0, 0, W, H);
  const cl = client(p.clientId), g = GOALS[p.goal];
  header(c, W, HEAD, o.theme, 'PERSONAL TRAINING PROGRAM', p.name, cl ? `สำหรับ ${cl.name}` : '', `เป้าหมาย: ${g.th} • ${PLACES[p.place || 'gym'].th} • ${days.length} วัน${S.settings.trainer ? ' • โค้ช ' + S.settings.trainer : ''}`);
  let y = HEAD + 30;
  days.forEach((d, di) => {
    c.textBaseline = 'middle'; c.textAlign = 'left';
    rr(c, P, y + 14, 14, 56, 7); const gr = c.createLinearGradient(P, y, P, y + 70); gr.addColorStop(0, ta); gr.addColorStop(1, tb); c.fillStyle = gr; c.fill();
    c.fillStyle = '#1B2030'; c.font = `800 42px ${FONT}`; c.fillText(fit(c, d.name, W - P * 2 - 40), P + 34, y + 42);
    let yy = y + 96;
    if (!d.items.length) { c.fillStyle = '#B4BACB'; c.font = `600 30px ${FONT}`; c.fillText('ยังไม่มีท่า', P + 10, yy + 40); yy += RH + RG; }
    d.items.forEach((it, i) => {
      const e = exById(it.ex), cw = W - P * 2;
      c.save(); c.shadowColor = 'rgba(30,40,80,.09)'; c.shadowBlur = 22; c.shadowOffsetY = 6; rr(c, P, yy, cw, RH, 34); c.fillStyle = '#fff'; c.fill(); c.restore();
      const ix = P + 14, iy = yy + 14, is = RH - 28;
      c.save(); rr(c, ix, iy, is, is, 24); c.clip(); c.fillStyle = '#EEF0F6'; c.fillRect(ix, iy, is, is);
      const im = imgs[it.ex];
      if (im) { const s = Math.min(im.width, im.height); c.drawImage(im, (im.width - s) / 2, (im.height - s) / 2, s, s, ix, iy, is, is); }
      else { c.font = `60px ${FONT}`; c.textAlign = 'center'; c.fillStyle = '#000'; c.fillText((MUSCLES[e.m] || MUSCLES.core).e, ix + is / 2, iy + is / 2 + 4); c.textAlign = 'left'; }
      c.restore();
      const tx = ix + is + 26, maxW = P + cw - 24 - tx - 4;
      c.fillStyle = ta; c.font = `800 26px ${FONT}`; c.fillText(String(i + 1).padStart(2, '0'), tx, yy + 32);
      c.fillStyle = '#1B2030'; c.font = `800 34px ${FONT}`; c.fillText(fit(c, e.th, maxW - 50), tx + 46, yy + 34);
      c.fillStyle = '#5B6279'; c.font = `600 29px ${FONT}`;
      let s = `${it.sets} เซ็ต × ${it.reps}`; if (it.weight) s += ` • ${it.weight}`; c.fillText(fit(c, s, maxW), tx, yy + 82);
      c.fillStyle = '#9AA1B4'; c.font = `500 25px ${FONT}`;
      let s2 = +it.rest ? `พัก ${it.rest} วินาที` : ''; if (it.note) s2 += (s2 ? ' • ' : '') + it.note; if (s2) c.fillText(fit(c, s2, maxW), tx, yy + 120);
      yy += RH + RG;
    });
    y += dayH[di];
  });
  c.textBaseline = 'alphabetic';
  footer(c, W, y + 6, S.settings.trainer ? `โปรแกรมโดย ${S.settings.trainer}` : 'ตั้งใจ สม่ำเสมอ ผลลัพธ์จะตามมา 💪');
  return cv;
}
