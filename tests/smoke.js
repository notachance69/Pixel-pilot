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
// jobs: 30 days of job mail + sent replies. Medtronic is waiting on Chance (5 days), Edwards got a reply, Stryker said no,
// Abbott came through an ATS (company read from the subject), and a LinkedIn job alert must not count.
const dAgo = n => String(Date.now() - n * 864e5);
const JOBS = {
  j1: { id: 'j1', threadId: 'tj1', labelIds: ['INBOX', 'CATEGORY_PERSONAL'], internalDate: dAgo(5), snippet: 'Could you share your availability for an onsite interview next week?',
    payload: { headers: [{ name: 'From', value: 'Sarah Kim <sarah.kim@medtronic.com>' }, { name: 'Subject', value: 'Next steps: onsite interview' }] } },
  j2: { id: 'j2', threadId: 'tj2', labelIds: ['INBOX', 'CATEGORY_UPDATES'], internalDate: dAgo(20), snippet: 'We received your application for Quality Engineer II.',
    payload: { headers: [{ name: 'From', value: 'Medtronic Careers <no-reply@medtronic.com>' }, { name: 'Subject', value: 'Thank you for applying to Medtronic' }] } },
  j3: { id: 'j3', threadId: 'tj3', labelIds: ['INBOX', 'CATEGORY_UPDATES'], internalDate: dAgo(12), snippet: 'Our team will review your application.',
    payload: { headers: [{ name: 'From', value: 'Hiring Team <no-reply@greenhouse.io>' }, { name: 'Subject', value: 'Thank you for applying to Abbott' }] } },
  j4: { id: 'j4', threadId: 'tj4', labelIds: ['INBOX', 'CATEGORY_UPDATES'], internalDate: dAgo(3), snippet: 'Unfortunately, we have decided to move forward with other candidates.',
    payload: { headers: [{ name: 'From', value: 'Stryker Careers <careers@stryker.com>' }, { name: 'Subject', value: 'Update on your application' }] } },
  j5: { id: 'j5', threadId: 'tj5', labelIds: ['INBOX', 'CATEGORY_UPDATES'], internalDate: dAgo(1), snippet: 'Quality Engineer at Acme and 29 more',
    payload: { headers: [{ name: 'From', value: 'LinkedIn Job Alerts <jobalerts-noreply@linkedin.com>' }, { name: 'Subject', value: '30 new jobs for you: quality engineer' }, { name: 'List-Unsubscribe', value: '<mailto:x>' }] } },
  j6: { id: 'j6', threadId: 'tj6', labelIds: ['INBOX', 'CATEGORY_PERSONAL'], internalDate: dAgo(6), snippet: "Great talking today! I'll share feedback with the hiring manager soon.",
    payload: { headers: [{ name: 'From', value: 'Erin Park <erin.park@edwards.com>' }, { name: 'Subject', value: 'Phone screen recap' }] } },
  s1: { id: 's1', threadId: 'tj6', labelIds: ['SENT'], internalDate: dAgo(5), snippet: 'Thanks Erin', payload: { headers: [{ name: 'To', value: 'Erin Park <erin.park@edwards.com>' }, { name: 'Subject', value: 'Re: Phone screen recap' }] } },
  s2: { id: 's2', threadId: 'ts2', labelIds: ['SENT'], internalDate: dAgo(2), snippet: 'See you Sunday', payload: { headers: [{ name: 'To', value: 'Mom <mom@example.com>' }, { name: 'Subject', value: 'Re: Dinner Sunday?' }] } }
};
let jobQ = '';
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
// calendar: next meeting in 25 min, a declined one (hidden), an all-day event, and later ones
const iso = ms => new Date(ms).toISOString(), M_ = 60e3, t0 = Date.now();
const CAL = { items: [
  { id: 'c0', summary: "Mom's birthday", start: { date: ymd(dayOff(0)) }, end: { date: ymd(dayOff(-1)) } },
  { id: 'c1', summary: 'Phone screen with Dana', location: 'Zoom, https://zoom.us/j/1', start: { dateTime: iso(t0 + 25 * M_) }, end: { dateTime: iso(t0 + 55 * M_) } },
  { id: 'c2', summary: 'Team lunch', start: { dateTime: iso(t0 + 60 * M_) }, end: { dateTime: iso(t0 + 120 * M_) }, attendees: [{ email: 'chance@example.com', self: true, responseStatus: 'declined' }] },
  { id: 'c3', summary: 'Dentist', start: { dateTime: iso(t0 + 180 * M_) }, end: { dateTime: iso(t0 + 240 * M_) } },
  { id: 'c4', summary: 'Spin class', start: { dateTime: iso(t0 + 26 * 60 * M_) }, end: { dateTime: iso(t0 + 27 * 60 * M_) } },
  { id: 'c5', summary: 'Cancelled thing', status: 'cancelled', start: { dateTime: iso(t0 + 30 * M_) }, end: { dateTime: iso(t0 + 40 * M_) } }
] };
let calHits = 0;
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
    if (u.includes('www.googleapis.com/calendar/v3/calendars/primary/events')) { calHits++; return r.fulfill({ json: CAL }); }
    if (u.includes('gmail.googleapis.com')) {
      if (u.includes('/profile')) return r.fulfill({ json: { emailAddress: 'chance@example.com' } });
      if (u.includes('/attachments/a1')) return r.fulfill({ json: { data: b64(GYM_CSV) } });
      const j = u.match(/messages\/([js]\d)/); if (j) return r.fulfill({ json: JOBS[j[1]] });
      const g = u.match(/messages\/(g\d)/); if (g) return r.fulfill({ json: GYM[g[1]] });
      const m = u.match(/messages\/(m\d)/); if (m) return r.fulfill({ json: gmsg(MAIL.find(x => x.id === m[1])) });
      if (u.includes('/messages?')) {
        const dq = decodeURIComponent(u);
        if (dq.includes('q=in:sent')) return r.fulfill({ json: { messages: [{ id: 's1' }, { id: 's2' }] } });
        if (dq.includes('newer_than:30d')) { jobQ = dq; return r.fulfill({ json: { messages: ['m1', 'j1', 'j2', 'j3', 'j4', 'j5', 'j6'].map(id => ({ id })) } }); }
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
    set('pp.loc', { lat: 34.24, lon: -118.53, name: 'Northridge' }); set('pp.seenTabs', true); set('pp.seenAsk', true); set('pp.tab', 'fc');
    set('pp.spotTok', { access: 'AT', refresh: 'RT', exp: Date.now() + 3600e3 }); set('pp.spotId', '0123456789abcdef0123456789abcdef');
    set('pp.gOn', true); set('pp.gId', 'x.apps.googleusercontent.com'); set('pp.gTok', { access: 'GT', exp: Date.now() + 3600e3 }); set('pp.vip', 'mom'); set('pp.gCal', true);
  });
  const page = await ctx.newPage(); const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await mock(page);
  await page.goto('file://' + PAGE);
  const t = async sel => (await page.textContent(sel).catch(() => '')) || '';
  // job nudge on load: Pip says Medtronic is waiting on a reply, then goes back to the weather
  const nudged = await page.waitForFunction(() => document.querySelector('#mood').textContent.trim() === 'YOUR MOVE', null, { timeout: 7000 }).then(() => true).catch(() => false);
  await page.waitForTimeout(1600);
  check('Pip nudges when a recruiter has waited 3+ days', nudged && /Medtronic wrote 5 days ago and is waiting on your reply/.test(await t('#say')), (await t('#mood')) + ' / ' + (await t('#say')).slice(0, 80));
  await page.screenshot({ path: path.join(OUT, '0-job-nudge.png') });
  await page.waitForFunction(() => !/YOUR MOVE/.test(document.querySelector('#mood').textContent), null, { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(1500);

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

  // Ask Pip: plain-language rules
  const ask = async q => { await page.fill('#askIn', q); await page.press('#askIn', 'Enter'); await page.waitForTimeout(2200); return t('#say'); };
  let reply = await ask("i don't want to see any of the job related emails");
  const rowsAfterHide = await page.$$eval('#mlist .mrow', rs => rs.map(r => r.textContent).join('|'));
  check('Ask Pip hides job emails', !rowsAfterHide.includes('Dana Lee') && /hiding job emails/i.test(reply), reply.slice(0, 90));
  check('inbox shows hidden-by-rules count', /1 HIDDEN BY YOUR RULES/.test(await t('#inNote')), await t('#inNote'));
  reply = await ask('show job emails');
  check('Ask Pip brings job emails back', (await page.$$eval('#mlist .mrow', rs => rs.map(r => r.textContent).join('|'))).includes('Dana Lee'), reply.slice(0, 60));
  reply = await ask('mute emails from mom');
  check('Ask Pip mutes a sender (even a VIP)', !(await page.$$eval('#mlist .mrow', rs => rs.map(r => r.textContent).join('|'))).includes('Mom') && /Muted emails from mom/.test(reply), reply.slice(0, 60));
  reply = await ask('set my gym goal to 3');
  check('Ask Pip sets gym goal', /Gym goal set to 3/.test(reply), reply.slice(0, 60));
  reply = await ask('what are my rules');
  check('Ask Pip lists rules', /mute mom/i.test(reply), reply.slice(0, 90));
  reply = await ask('flibber jabber');
  check('Ask Pip handles nonsense politely', /didn't get that/i.test(reply), reply.slice(0, 60));
  await page.click('#setBtn'); await page.waitForTimeout(500);
  check('Settings lists rule chips', (await t('#ruleChips')).includes('MUTE MOM'), await t('#ruleChips'));
  await page.click('#ruleChips .rchip >> text=MUTE MOM'); await page.waitForTimeout(400);
  check('tapping a rule chip removes it', !(await t('#ruleChips')).includes('MUTE MOM'));
  await page.click('#setClose'); await page.waitForTimeout(400);
  await page.click('#tab-inbox'); await page.waitForTimeout(500);

  // job tracker
  check('job search covers 30 days and skips promos', /newer_than:30d/.test(jobQ) && /-category:promotions/.test(jobQ), jobQ.slice(0, 80));
  await page.click('.fchip[data-f="jobs"]'); await page.waitForTimeout(900);
  const jrows = await page.$$eval('#mlist .jrow', rs => rs.map(r => r.textContent));
  check('JOBS shows one row per company, waiting-on-you first', jrows.length === 5 && /^Medtronic\s*INTERVIEW/.test(jrows[0]) && /YOUR REPLY · 5D/.test(jrows[0]), jrows.join(' | ').slice(0, 200));
  check('ATS email grouped under the company from its subject', jrows.some(r => /^Abbott\s*APPLIED/.test(r)), jrows.join(' | ').slice(0, 200));
  check('rejection marks the company closed', jrows.some(r => /^Stryker\s*CLOSED/.test(r)));
  check('job alerts are not companies', !jrows.some(r => /LinkedIn|new jobs/i.test(r)));
  check('sent reply means waiting on them, not you', jrows.some(r => /^Edwards\s*SCREEN/.test(r) && /Waiting on them/.test(r) && !/YOUR REPLY/.test(r)), jrows.find(r => /Edwards/.test(r)));
  check('jobs summary counts active and your move', (await t('#inImp')).trim() === '4' && (await t('#inUnread')).trim() === '1' && /Your move/i.test(await t('#inUnreadL')), (await t('#inImp')) + '/' + (await t('#inUnread')));
  await page.click('#mlist .jrow'); await page.waitForTimeout(2600);
  check('tapping a company makes Pip explain it', /Medtronic: interviewing\. 2 emails/.test(await t('#say')) && await page.$('#mlist .jrow.open .jhist') !== null, (await t('#say')).slice(0, 90));
  await page.screenshot({ path: path.join(OUT, '2a-jobs.png') });
  reply = await ask("how's my job search");
  check('Ask Pip sums up the job search', /4 active companies in 30 days: 1 interview, 2 in screening, 1 applied\. Medtronic is waiting/.test(reply), reply.slice(0, 120));
  await page.click('.fchip[data-f="imp"]'); await page.waitForTimeout(400);
  check('switching back to IMPORTANT restores the inbox', /Important/i.test(await t('#inImpL')) && /^\d+$/.test((await t('#inImp')).trim()) && /CHECKED/.test(await t('#inNote')) && (await page.$$('#mlist .jrow')).length === 0, await t('#inImp'));

  await page.click('#tab-gym'); await page.waitForTimeout(1500);
  const gnote = await t('#gyNote');
  check('gym imports 24GO report (body + CSV) and Shortcut email, ignores gym marketing', /^6 GYM DAYS FOUND/.test(gnote), gnote);
  check('gym last visit is yesterday', (await t('#gyLast')).trim() === 'Yesterday', await t('#gyLast'));
  await page.waitForTimeout(10);
  await page.click('#gyBtn'); await page.waitForTimeout(700);
  check('I WENT TODAY makes Pip celebrate', (await t('#mood')).trim() === 'GAINS', await t('#mood'));
  check('logging today counts it', /^7 GYM DAYS FOUND/.test(await t('#gyNote')) && (await t('#gyLast')).trim() === 'Today', await t('#gyNote'));
  check('gym day does not show in the inbox list', !(await page.$$eval('#mlist .mrow', rs => rs.map(r => r.textContent).join('|'))).includes('Pixel Pilot gym'));
  await page.screenshot({ path: path.join(OUT, '2b-gym.png') });

  await page.click('#tab-brief'); await page.waitForTimeout(900);
  const tips = await t('#bTips');
  check('brief has a job tip', /Job email from Dana Lee/.test(tips), tips.slice(0, 120));
  check('brief tip names who is waiting on a reply', /Medtronic is waiting on your reply \(5 days\)/.test(tips), tips.slice(0, 160));
  check('brief has a rain tip', /Rain likely/.test(tips));
  check('brief inbox card', /new/.test(await t('#bIn')), await t('#bIn'));
  await page.screenshot({ path: path.join(OUT, '3-brief.png') });

  // calendar
  check('calendar fetched with the Google token', calHits > 0, 'hits=' + calHits);
  check('calendar card counts down to the next meeting', /^IN 2\dM$/.test((await t('#bCal')).trim()), await t('#bCal'));
  const calRows = await page.$$eval('#bCalL li', ls => ls.map(l => l.textContent));
  check('calendar shows next 3 events, skips declined and cancelled', calRows.length === 3 && /Phone screen/.test(calRows.join('|')) && /Dentist/.test(calRows.join('|')) && !/Team lunch|Cancelled/.test(calRows.join('|')), calRows.join(' | '));
  check('brief leads with the upcoming meeting', /^"Phone screen with Dana" at .* in 2\d minutes\. Zoom\./.test(await t('#bTips li')), await t('#bTips li'));
  await page.waitForTimeout(3000);   // let the gym celebration finish so its mood change doesn't talk over the tap
  await page.click('#pane-brief .bCal'); await page.waitForTimeout(2600);
  check('tapping the calendar card makes Pip explain it', /Next up: "Phone screen with Dana"/.test(await t('#say')), (await t('#say')).slice(0, 90));
  reply = await ask("what's next");
  check('Ask Pip answers what\'s next', /Next up: "Phone screen with Dana"/.test(reply) && /more this week/.test(reply), reply.slice(0, 120));
  await page.evaluate(() => { const { CAL } = window.__pipCal; CAL.list.find(e => e.id === 'c1').start = Date.now() + 8 * 60e3; });
  await page.waitForTimeout(2600);
  check('Pip says heads up 10 minutes before a meeting', (await t('#mood')).trim() === 'HEADS UP' && /Heads up: "Phone screen with Dana" starts in 8 minutes/.test(await t('#say')), (await t('#mood')) + ' / ' + (await t('#say')).slice(0, 80));
  await page.screenshot({ path: path.join(OUT, '3b-heads-up.png') });
  await page.evaluate(() => { const { CAL } = window.__pipCal; CAL.list.find(e => e.id === 'c1').start = Date.now() + 25 * 60e3; });
  await page.waitForTimeout(400);
  check('heads up ends when the meeting is not close', (await t('#mood')).trim() !== 'HEADS UP', await t('#mood'));
  await page.evaluate(() => { const { CAL, renderBrief } = window.__pipCal; CAL.ok = false; renderBrief(); });
  check('ALLOW CALENDAR shows when calendar access is missing', await page.isVisible('#calAllow'));
  await page.evaluate(() => { const { CAL, renderBrief } = window.__pipCal; CAL.ok = true; renderBrief(); });
  check('ALLOW CALENDAR hides once granted', !(await page.isVisible('#calAllow')));

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
  await page.click('#tab-brief'); await page.waitForTimeout(700);
  const calClip = await page.$eval('#pane-brief .bCal', e => e.getBoundingClientRect().height > 30 && e.scrollWidth <= e.clientWidth + 1);
  check('calendar card fits on phone landscape', calClip);
  await page.screenshot({ path: path.join(OUT, '7b-phone-brief.png') });
  await page.click('#tab-inbox'); await page.click('.fchip[data-f="jobs"]'); await page.waitForTimeout(700);
  const jFit = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1 && [...document.querySelectorAll('#mlist .jrow .mfrom')].every(e => e.getBoundingClientRect().width > 40));
  check('jobs pipeline fits on phone landscape', jFit);
  await page.screenshot({ path: path.join(OUT, '7c-phone-jobs.png') });

  check('no page errors', errors.length === 0, errors.join(' | '));
  await browser.close();
  const failed = results.filter(r => !r.ok);
  results.forEach(r => console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.info && !r.ok ? '  -> ' + r.info : ''}`));
  console.log(`\n${results.length - failed.length}/${results.length} passed. Screenshots in tests/out/`);
  process.exit(failed.length ? 1 : 0);
})();
