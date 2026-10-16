// Pixel Pilot end-to-end smoke test. Every loop iteration must pass this before committing.
// Run:  NODE_PATH=$(npm root -g) node tests/smoke.js [path/to/index.html]   (defaults to preview/index.html)
// All network calls are mocked, so it runs offline. Screenshots land in tests/out/.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const PAGE = path.resolve(ROOT, process.argv[2] || 'preview/index.html');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const now = Math.floor(Date.now() / 1000), H = 3600;
const results = []; const check = (name, ok, info = '') => { results.push({ name, ok: !!ok, info }); };

function weather() {
  const times = []; for (let i = -2; i < 30; i++) times.push(Math.floor(now / H) * H + i * H);
  return { current: { time: now, temperature_2m: 72, apparent_temperature: 70, relative_humidity_2m: 50, is_day: 1, weather_code: 1, wind_speed_10m: 8, wind_direction_10m: 270 },
    hourly: { time: times, temperature_2m: times.map((t, i) => 70 + Math.sin(i / 4) * 6), precipitation_probability: times.map((t, i) => i > 6 ? 60 : 5), weather_code: times.map((t, i) => i > 6 ? 61 : 1), is_day: times.map(() => 1) },
    daily: { temperature_2m_max: [78, 77], temperature_2m_min: [47, 55], sunrise: [now - 6 * H, now + 18 * H], sunset: [now + 4 * H, now + 28 * H], uv_index_max: [7, 5], precipitation_probability_max: [60, 10] } };
}
const MAIL = [
  { id: 'm1', from: 'Dana Lee <dana@greenhouse.io>', subject: 'Interview availability for Design Assurance Engineer', snippet: 'Hi Chance, thanks for applying. Are you free Tuesday for a phone screen?', labels: ['UNREAD', 'INBOX', 'IMPORTANT', 'CATEGORY_PERSONAL'] },
  { id: 'm2', from: 'SoCal Edison <billing@sce.com>', subject: 'Your bill is ready: payment due Oct 24', snippet: 'Amount due $84.12', labels: ['UNREAD', 'INBOX', 'CATEGORY_UPDATES'] },
  { id: 'm3', from: 'Mom <mom@example.com>', subject: 'Dinner Sunday?', snippet: 'Are you coming over this weekend', labels: ['INBOX', 'UNREAD', 'CATEGORY_PERSONAL'] },
  { id: 'm4', from: 'Big Store <deals@store.com>', subject: '48 hour SALE ends tonight', snippet: 'Up to 60% off &amp; free shipping', labels: ['UNREAD', 'INBOX', 'CATEGORY_PROMOTIONS'], list: true },
  { id: 'm5', from: 'Weekly Digest <news@digest.com>', subject: 'This week in tech', snippet: 'Top stories', labels: ['INBOX', 'CATEGORY_UPDATES'], list: true },
  { id: 'm6', from: 'Google <no-reply@accounts.google.com>', subject: 'Security alert: new sign-in', snippet: 'A new sign-in on iPad', labels: ['INBOX', 'UNREAD', 'CATEGORY_UPDATES'] }
];
const gmsg = m => ({ id: m.id, threadId: 't' + m.id, labelIds: m.labels, snippet: m.snippet, internalDate: String(Date.now() - 3600e3),
  payload: { headers: [{ name: 'From', value: m.from }, { name: 'Subject', value: m.subject }].concat(m.list ? [{ name: 'List-Unsubscribe', value: '<mailto:x>' }] : []) } });
// gym: a 24GO check-in report (dates in the body + a CSV attachment), a Shortcut check-in email, and gym marketing that must not count
const dayOff = n => { const d = new Date(); d.setDate(d.getDate() - n); return d; };
const mdy = d => `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`;
const ymd = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const b64 = s => Buffer.from(s).toString('base64url');
const GYM = {
  g1: { id: 'g1', internalDate: String(Date.now()), payload: { mimeType: 'multipart/mixed', headers: [{ name: 'From', value: '24 Hour Fitness <noreply@24hourfitness.com>' }, { name: 'Subject', value: 'Your 24GO Check-In History' }],
    parts: [{ mimeType: 'text/plain', body: { data: b64(`Check-In History\nReport generated ${mdy(dayOff(0))}\n${mdy(dayOff(2))}  Northridge Super-Sport  6:12 AM\n${mdy(dayOff(3))}  Northridge Super-Sport  6:30 AM\n${mdy(dayOff(5))}  Northridge Super-Sport  5:58 AM\n${mdy(dayOff(9))}  Northridge Super-Sport  6:05 AM\n`) } },
      { mimeType: 'text/csv', filename: 'checkins.csv', body: { attachmentId: 'a1' } }] } },
  g2: { id: 'g2', internalDate: String(dayOff(1).getTime()), payload: { mimeType: 'text/plain', headers: [{ name: 'From', value: 'Chance <chance@example.com>' }, { name: 'Subject', value: 'Pixel Pilot gym check-in' }], body: { data: b64('checked in') } } },
  g3: { id: 'g3', internalDate: String(Date.now()), payload: { mimeType: 'text/plain', headers: [{ name: 'From', value: '24 Hour Fitness <deals@24hourfitness.com>' }, { name: 'Subject', value: 'Fall deal: join for $0' }],
    body: { data: b64(`Visit your club! Offer ends ${mdy(dayOff(-20))}.`) } } },
  // modeled on Chance's real 24 Hour Fitness promos: "Check-In" in the subject, a yearless future date, labeled Promotions
  g4: { id: 'g4', labelIds: ['CATEGORY_PROMOTIONS', 'INBOX'], internalDate: String(dayOff(10).getTime()), payload: { mimeType: 'text/html', headers: [{ name: 'From', value: '24 Hour Fitness <email@member.24hourfitness.com>' }, { name: 'Subject', value: 'Your Club Check-In Is Changing' }],
    body: { data: b64(`<p>Check in with 24GO. Visit your club.</p><p>Special Rams ticket offer for ${dayOff(-5).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}th. Training Day ${dayOff(14).getMonth() + 1}/${dayOff(14).getDate()}.</p>`) } } },
  g5: { id: 'g5', internalDate: String(dayOff(4).getTime()), payload: { mimeType: 'text/plain', headers: [{ name: 'From', value: '24 Hour Fitness <email@member.24hourfitness.com>' }, { name: 'Subject', value: 'Get Ready for Training Day' }],
    body: { data: b64(`Visit us on ${dayOff(-3).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} for a free session.`) } } }
};
const GYM_CSV = `Date,Club\n${ymd(dayOff(12))},Northridge Super-Sport\n`;
const topo = { type: 'Topology', transform: { scale: [1, 1], translate: [0, 0] }, objects: { land: { type: 'GeometryCollection', geometries: [{ type: 'MultiPolygon', arcs: [[[0]], [[1]]] }] } },
  arcs: [[[-125, 50], [55, 0], [0, -25], [-45, 0], [-10, -10]], [[-80, 10], [45, 0], [0, -55], [-35, 0], [-10, 55]]] };

async function mock(page) {
  await page.route('**/*', async r => {
    const u = r.request().url();
    if (u.startsWith('file:')) return r.continue();
    if (u.includes('satellite.min.js')) return r.fulfill({ body: fs.readFileSync(path.join(__dirname, 'satmock.js'), 'utf8'), contentType: 'application/javascript' });
    if (u.includes('land-110m.json')) return r.fulfill({ json: topo });
    if (u.includes('api.open-meteo.com')) return r.fulfill({ json: weather() });
    if (u.includes('bigdatacloud')) return r.fulfill({ json: { city: 'Northridge' } });
    if (u.includes('api.wheretheiss.at')) return r.fulfill({ json: { line1: '1 25544U', line2: '2 25544' } });
    if (u.includes('accounts.spotify.com/api/token')) return r.fulfill({ json: { access_token: 'AT', refresh_token: 'RT2', expires_in: 3600 } });
    if (u.includes('api.spotify.com/v1/me/player')) return r.request().method() !== 'GET' ? r.fulfill({ status: 204, body: '' }) :
      r.fulfill({ json: { is_playing: true, progress_ms: 60000, device: { name: 'iPad' }, item: { type: 'track', id: 't1', name: 'Midnight Pixel Drive', duration_ms: 214000, artists: [{ name: 'Neon Synth' }], album: { name: 'Chrome Stars', images: [{ url: 'https://i.scdn.co/a' }, { url: 'https://i.scdn.co/b' }] } } } });
    if (u.includes('i.scdn.co')) return r.fulfill({ body: fs.readFileSync(path.join(__dirname, 'art.png')), contentType: 'image/png', headers: { 'Access-Control-Allow-Origin': '*' } });
    if (u.includes('gmail.googleapis.com')) {
      if (u.includes('/profile')) return r.fulfill({ json: { emailAddress: 'chance@example.com' } });
      if (u.includes('/attachments/a1')) return r.fulfill({ json: { data: b64(GYM_CSV) } });
      const g = u.match(/messages\/(g\d)/); if (g) return r.fulfill({ json: GYM[g[1]] });
      const m = u.match(/messages\/(m\d)/); if (m) return r.fulfill({ json: gmsg(MAIL.find(x => x.id === m[1])) });
      if (u.includes('/messages?')) {
        if (decodeURIComponent(u).includes('24hourfitness')) return r.fulfill({ json: { messages: Object.keys(GYM).map(id => ({ id })) } });
        return r.fulfill({ json: { messages: MAIL.map(x => ({ id: x.id, threadId: 't' + x.id })) } });
      }
    }
    return r.abort();
  });
}

(async () => {
  if (!fs.existsSync(PAGE)) { console.error('missing ' + PAGE + ' (run tools/build.py first)'); process.exit(2); }
  const browser = await chromium.launch({ executablePath: fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined }).catch(() => chromium.launch());
  const ctx = await browser.newContext({ viewport: { width: 1180, height: 740 } });
  await ctx.addInitScript(() => {
    if (sessionStorage.getItem('seeded')) return; sessionStorage.setItem('seeded', '1');
    const set = (k, v) => localStorage.setItem(k, JSON.stringify(v));
    set('pp.loc', { lat: 34.24, lon: -118.53, name: 'Northridge' }); set('pp.seenTabs', true); set('pp.tab', 'fc');
    set('pp.spotTok', { access: 'AT', refresh: 'RT', exp: Date.now() + 3600e3 }); set('pp.spotId', '0123456789abcdef0123456789abcdef');
    set('pp.gOn', true); set('pp.gId', 'x.apps.googleusercontent.com'); set('pp.gTok', { access: 'GT', exp: Date.now() + 3600e3 }); set('pp.vip', 'mom');
  });
  const page = await ctx.newPage(); const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await mock(page);
  await page.goto('file://' + PAGE);
  await page.waitForTimeout(5500);
  const t = async sel => (await page.textContent(sel).catch(() => '')) || '';

  check('weather loads', (await t('#temp')).trim() === '72', await t('#temp'));
  check('mood set', (await t('#mood')).trim().length > 0, await t('#mood'));
  const hdr = await page.$eval('header.top', e => e.getBoundingClientRect().height);
  check('header fits one row on iPad landscape', hdr < 64, 'height ' + Math.round(hdr));
  await page.screenshot({ path: path.join(OUT, '1-forecast.png') });

  await page.click('#tab-inbox'); await page.waitForTimeout(900);
  const imp = (await t('#inImp')).trim(), unread = (await t('#inUnread')).trim();
  check('inbox counts important (recruiter, bill, VIP)', imp === '3', 'important=' + imp);
  check('inbox counts unread', unread === '5', 'unread=' + unread);
  const firstRow = await t('#mlist .mrow .mfrom');
  check('recruiter email ranks first', /Dana Lee/.test(firstRow) && /JOBS/.test(firstRow), firstRow);
  check('promo and newsletter not important', !(await page.$$eval('#mlist .mrow', rs => rs.map(r => r.textContent).join('|'))).includes('SALE'));
  await page.click('#mlist .mrow'); await page.waitForTimeout(2600);
  check('tapping an email makes Pip explain it', /Interview availability/.test(await t('#say')), (await t('#say')).slice(0, 80));
  check('email expands with Gmail link', await page.$('#mlist .mmore a[href*="mail.google.com"]') !== null);
  await page.screenshot({ path: path.join(OUT, '2-inbox.png') });

  await page.click('#tab-gym'); await page.waitForTimeout(1500);
  const gnote = await t('#gyNote');
  check('gym imports 24GO report (body + CSV) and Shortcut email, ignores gym marketing', /^6 GYM DAYS FOUND/.test(gnote), gnote);
  check('gym last visit is yesterday', (await t('#gyLast')).trim() === 'Yesterday', await t('#gyLast'));
  await page.click('#gyBtn'); await page.waitForTimeout(700);
  check('I WENT TODAY makes Pip celebrate', (await t('#mood')).trim() === 'GAINS', await t('#mood'));
  check('logging today counts it', /^7 GYM DAYS FOUND/.test(await t('#gyNote')) && (await t('#gyLast')).trim() === 'Today', await t('#gyNote'));
  check('gym day does not show in the inbox list', !(await page.$$eval('#mlist .mrow', rs => rs.map(r => r.textContent).join('|'))).includes('Pixel Pilot gym'));
  await page.screenshot({ path: path.join(OUT, '2b-gym.png') });

  await page.click('#tab-brief'); await page.waitForTimeout(900);
  const tips = await t('#bTips');
  check('brief has a job tip', /Job email from Dana Lee/.test(tips), tips.slice(0, 120));
  check('brief has a rain tip', /Rain likely/.test(tips));
  check('brief inbox card', /new/.test(await t('#bIn')), await t('#bIn'));
  await page.screenshot({ path: path.join(OUT, '3-brief.png') });

  await page.click('#tab-music'); await page.waitForTimeout(900);
  check('spotify now playing', (await t('#mTitle')).includes('Midnight Pixel Drive'));
  await page.screenshot({ path: path.join(OUT, '4-music.png') });

  await page.click('#tab-iss'); await page.waitForTimeout(1500);
  check('ISS position shown', /°[NS]/.test(await t('#issOver')), await t('#issOver'));
  check('ISS pass text', (await t('#issPass')).length > 10, await t('#issPass'));
  await page.screenshot({ path: path.join(OUT, '5-iss.png') });

  await page.click('#setBtn'); await page.waitForTimeout(500);
  check('settings opens', await page.isVisible('#settings .sheetBox'));
  check('settings shows Gmail connected', /Connected as chance@example.com/.test(await t('#gStatus')), await t('#gStatus'));
  await page.screenshot({ path: path.join(OUT, '6-settings.png') });
  await page.click('#setClose'); await page.waitForTimeout(400);

  for (let i = 0; i < 7; i++) { await page.click('#face'); await page.waitForTimeout(80); }
  await page.waitForTimeout(300);
  check('rapid pokes make Pip dizzy', (await t('#mood')).trim() === 'DIZZY', await t('#mood'));

  // phone landscape layout sanity
  await page.setViewportSize({ width: 844, height: 390 }); await page.waitForTimeout(600);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
  check('no horizontal overflow on phone landscape', !overflow);
  await page.screenshot({ path: path.join(OUT, '7-phone.png') });

  check('no page errors', errors.length === 0, errors.join(' | '));
  await browser.close();
  const failed = results.filter(r => !r.ok);
  results.forEach(r => console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.info && !r.ok ? '  -> ' + r.info : ''}`));
  console.log(`\n${results.length - failed.length}/${results.length} passed. Screenshots in tests/out/`);
  process.exit(failed.length ? 1 : 0);
})();
