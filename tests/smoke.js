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
// bills: SoCal Edison due in 2 days (Pip goes stern), Chase statement due in 10 days, Spectrum billed then paid,
// Netflix on autopay, an old water bill long past (dropped) and a bank promo (ignored). b8 is a payment that arrives later.
const mdShort = d => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
const bmsg = (id, from, subject, snippet, days, labels = ['INBOX', 'CATEGORY_UPDATES']) => ({ id, threadId: 't' + id, labelIds: labels, internalDate: dAgo(days), snippet,
  payload: { headers: [{ name: 'From', value: from }, { name: 'Subject', value: subject }] } });
const BILLS = {};
const addBill = (...a) => { BILLS[a[0]] = bmsg(...a); };
addBill('b1', 'SoCal Edison <billing@sce.com>', 'Your SoCal Edison bill is ready', `Amount due: $84.12. Payment due date: ${mdShort(dayOff(-2))}. View your bill online.`, 3);
addBill('b2', 'Chase <no.reply.alerts@chase.com>', 'Your credit card statement is ready', `New balance $612.40. Minimum payment due $35.00 by ${mdy(dayOff(-10))}.`, 2);
addBill('b3', 'Spectrum <billing@spectrum.net>', 'Your Spectrum bill is ready', `Your bill of $70.00 is due ${mdShort(dayOff(-5))}.`, 6);
addBill('b4', 'Spectrum <billing@spectrum.net>', 'Thank you for your payment', 'We received your payment of $70.00. It may take 1-2 days to post.', 1);
addBill('b5', 'Netflix <info@account.netflix.com>', 'Your membership renews soon', `Your plan will renew on ${mdShort(dayOff(-6))} and you will be charged $15.49.`, 1);
addBill('b6', 'City Water <ebill@citywater.org>', 'Your water bill', `Amount due $41.00, due ${mdShort(dayOff(25))}.`, 40);
addBill('b7', 'Chase <offers@chase.com>', 'Earn 5% cash back this month', 'Limited time deal on your card statement credits', 1, ['INBOX', 'CATEGORY_PROMOTIONS']);
addBill('b8', 'SoCal Edison <billing@sce.com>', 'Payment received: thank you', 'We received your payment of $84.12 for account ending 1234.', 0);
const billIds = ['b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7'];
let billQ = '';
// packages: an Amazon charger shipped then out for delivery today (same order), REI via UPS arriving in 2 days, a Target order
// not shipped yet, a Best Buy order running late, an Etsy order delivered 2 days ago, a sale email and a "how was your delivery" survey.
// p8 is the delivery email that arrives later.
const wkday = d => d.toLocaleDateString('en-US', { weekday: 'long' });
const PKGS = {};
const addPkg = (...a) => { PKGS[a[0]] = bmsg(...a); };
addPkg('p1', 'Amazon.com <shipment-tracking@amazon.com>', 'Shipped: "Anker USB-C Charger 65W..."', `Your package is on the way. Arriving ${wkday(dayOff(-2))}. Order #113-1234567-1234567`, 2);
addPkg('p2', 'Amazon.com <shipment-tracking@amazon.com>', 'Out for delivery: "Anker USB-C Charger 65W..."', 'Arriving today by 8 PM. Order #113-1234567-1234567', 0);
addPkg('p3', 'UPS <mcinfo@ups.com>', `UPS Update: Package Scheduled for Delivery ${wkday(dayOff(-2))}`, `Shipment from REI. Tracking Number 1Z999AA10123456784. Scheduled delivery: ${wkday(dayOff(-2))}`, 1);
addPkg('p4', 'Target <orders@target.com>', 'Thanks for your order!', "Order #102938475. We'll let you know when it ships.", 1);
addPkg('p5', 'Best Buy <BestBuyInfo@emailinfo.bestbuy.com>', 'Your order is delayed', `Sorry, your order is running late. New delivery date: ${mdShort(dayOff(-4))}. Order #BBY01-806543`, 1);
addPkg('p6', 'Etsy <transaction@etsy.com>', 'Your Etsy order has been delivered', 'Order #2849301 from PixelPrints was delivered.', 2);
addPkg('p7', 'Big Store <deals@store.com>', '48 hour SALE: free shipping on everything', 'Your order ships free', 0, ['INBOX', 'CATEGORY_PROMOTIONS']);
addPkg('p9', 'Amazon.com <no-reply@amazon.com>', 'How was your delivery?', 'Rate your experience with your recent order', 0);
addPkg('p8', 'Amazon.com <shipment-tracking@amazon.com>', 'Delivered: "Anker USB-C Charger 65W..."', 'Your package was delivered. It was handed to a resident. Order #113-1234567-1234567', 0);
PKGS.p8.internalDate = String(Date.now() - 60e3);
const pkgIds = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p9'];
let pkgQ = '';
// air quality: Open-Meteo US AQI. Clean by default so the other mood checks are unaffected; the air checks raise it.
let AIR = 42, AIRPEAK = 48, airQ = '';
function air() {
  const times = []; for (let i = -2; i < 30; i++) times.push(Math.floor(now / H) * H + i * H);
  return { current: { time: now, us_aqi: AIR, pm2_5: AIR / 4 }, hourly: { time: times, us_aqi: times.map((t, i) => i > 7 && i < 12 ? AIRPEAK : AIR) } };
}
const topo = { type: 'Topology', transform: { scale: [1, 1], translate: [0, 0] }, objects: { land: { type: 'GeometryCollection', geometries: [{ type: 'MultiPolygon', arcs: [[[0]], [[1]]] }] } },
  arcs: [[[-125, 50], [55, 0], [0, -25], [-45, 0], [-10, -10]], [[-80, 10], [45, 0], [0, -55], [-35, 0], [-10, 55]]] };

async function mock(page) {
  await page.route('**/*', async r => {
    const u = r.request().url();
    if (u.startsWith('file:')) return r.continue();
    if (u.includes('satellite.min.js')) return r.fulfill({ body: fs.readFileSync(path.join(__dirname, 'satmock.js'), 'utf8'), contentType: 'application/javascript' });
    if (u.includes('land-110m.json')) return r.fulfill({ json: topo });
    if (u.includes('air-quality-api.open-meteo.com')) { airQ = u; return r.fulfill({ json: air() }); }
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
      const b = u.match(/messages\/(b\d)/); if (b) return r.fulfill({ json: BILLS[b[1]] });
      const pk = u.match(/messages\/(p\d)/); if (pk) return r.fulfill({ json: PKGS[pk[1]] });
      const g = u.match(/messages\/(g\d)/); if (g) return r.fulfill({ json: GYM[g[1]] });
      const m = u.match(/messages\/(m\d)/); if (m) return r.fulfill({ json: gmsg(MAIL.find(x => x.id === m[1])) });
      if (u.includes('/messages?')) {
        const dq = decodeURIComponent(u);
        if (dq.includes('q=in:sent')) return r.fulfill({ json: { messages: [{ id: 's1' }, { id: 's2' }] } });
        if (dq.includes('newer_than:21d')) { pkgQ = dq; return r.fulfill({ json: { messages: pkgIds.map(id => ({ id })) } }); }
        if (dq.includes('newer_than:45d')) { billQ = dq; return r.fulfill({ json: { messages: billIds.map(id => ({ id })) } }); }
        if (dq.includes('newer_than:30d')) { jobQ = dq; return r.fulfill({ json: { messages: ['m1', 'j1', 'j2', 'j3', 'j4', 'j5', 'j6'].map(id => ({ id })) } }); }
        if (decodeURIComponent(u).includes('24hourfitness')) return r.fulfill({ json: { messages: Object.keys(GYM).map(id => ({ id })) } });
        return r.fulfill({ json: { messages: MAIL.map(x => ({ id: x.id, threadId: 't' + x.id })) } });
      }
    }
    return r.abort();
  });
}

// car: a fake Bluetooth LE ELM327 adapter (FFF0 service, FFF1 notify, FFF2 write) that answers like a real one,
// including "SEARCHING...", spaced and unspaced hex, 20-byte BLE chunks, engine-off and a dropped link
function fakeBluetooth() {
  const elm = window.__elm = { kmh: 68, rpm: 2100, coolC: 91, volt: 14.1, thr: 46, load: 89, ecu: true, log: [] };
  const hx = n => n.toString(16).toUpperCase().padStart(2, '0');
  const reply = c => {
    c = c.trim().toUpperCase(); elm.log.push(c);
    if (c === 'ATZ') return '\r\rELM327 v1.5\r\r>';
    if (c === 'ATRV') return elm.volt.toFixed(1) + 'V\r\r>';
    if (c.startsWith('AT')) return 'OK\r\r>';
    if (!elm.ecu) return 'UNABLE TO CONNECT\r\r>';
    if (c === '0100') return 'SEARCHING...\r41 00 BE 3E B8 11\r\r>';
    const r4 = Math.round(elm.rpm * 4), m = { '0D': hx(elm.kmh), '0C': hx(r4 >> 8) + ' ' + hx(r4 & 255), '05': hx(elm.coolC + 40), '11': hx(elm.thr), '04': hx(elm.load) }[c.slice(2)];
    return m ? `41 ${c.slice(2)} ${m}\r\r>` : 'NO DATA\r\r>';
  };
  const rx = { properties: { notify: true }, value: null, fns: [], startNotifications: async () => rx, addEventListener: (t, f) => rx.fns.push(f) };
  const tx = { properties: { write: true, writeWithoutResponse: true }, writeValue: async d => tx.writeValueWithoutResponse(d),
    writeValueWithoutResponse: async d => { if (!gatt.connected) throw new Error('GATT disconnected'); const r = new TextEncoder().encode(reply(new TextDecoder().decode(d)));
      setTimeout(() => { for (let i = 0; i < r.length; i += 20) { rx.value = new DataView(r.slice(i, i + 20).buffer); rx.fns.forEach(f => f({ target: rx })); } }, 15); } };
  const svc = { getCharacteristics: async () => [rx, tx] };
  const lis = [];
  const gatt = { connected: false, connect: async () => { gatt.connected = true; rx.fns = []; return { getPrimaryService: async u => { if (u === 0xfff0) return svc; throw new Error('NotFoundError'); } }; },
    disconnect: () => { gatt.connected = false; lis.forEach(f => f()); } };
  const dev = { name: 'IOS-Vlink', gatt, addEventListener: (t, f) => lis.push(f) };
  window.__elmDrop = () => { gatt.connected = false; lis.forEach(f => f()); };
  Object.defineProperty(navigator, 'bluetooth', { configurable: true, value: { requestDevice: async o => { window.__btOpts = o; return dev; }, getDevices: async () => [] } });
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
  await ctx.addInitScript(fakeBluetooth);
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
  // bill due in 2 days: Pip goes stern right after the job nudge (queued, not talking over it)
  const stern = await page.waitForFunction(() => document.querySelector('#mood').textContent.trim() === 'BILL DUE', null, { timeout: 4000 }).then(() => true).catch(() => false);
  await page.waitForTimeout(2000);
  check('Pip goes stern when a bill is due within 3 days', stern && /Your SoCal Edison bill \(\$84\.12\) is due in 2 days/.test(await t('#say')), (await t('#mood')) + ' / ' + (await t('#say')).slice(0, 80));
  await page.screenshot({ path: path.join(OUT, '0b-bill-due.png') });
  await page.waitForFunction(() => !/BILL DUE/.test(document.querySelector('#mood').textContent), null, { timeout: 8000 }).catch(() => {});
  // package out for delivery: Pip carries a box right after the bill (queued, not talking over it)
  const boxDay = await page.waitForFunction(() => document.querySelector('#mood').textContent.trim() === 'DELIVERY DAY', null, { timeout: 4000 }).then(() => true).catch(() => false);
  await page.waitForTimeout(2000);
  check('Pip carries a box when a package is out for delivery', boxDay && /Your Anker USB-C Charger 65W from Amazon is out for delivery\. Arriving today\./.test(await t('#say')), (await t('#mood')) + ' / ' + (await t('#say')).slice(0, 90));
  await page.screenshot({ path: path.join(OUT, '0c-delivery-day.png') });
  await page.waitForFunction(() => !/DELIVERY DAY/.test(document.querySelector('#mood').textContent), null, { timeout: 8000 }).catch(() => {});
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
  // wait for Pip to finish typing (the bubble stops changing) so long answers aren't read half-typed
  const settled = async () => { let prev = null; for (let i = 0; i < 20; i++) { const cur = await t('#say'); if (cur === prev) return cur; prev = cur; await page.waitForTimeout(250); } return prev; };
  const ask = async q => { await page.fill('#askIn', q); await page.press('#askIn', 'Enter'); await page.waitForTimeout(2200); return settled(); };
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

  // bills
  check('bills search covers 45 days and skips promos', /newer_than:45d/.test(billQ) && /-category:promotions/.test(billQ), billQ.slice(0, 80));
  const dueParse = await page.evaluate(() => { const { dueOf } = window.__pipBills, base = new Date(2026, 9, 20).getTime(), k = t => t == null ? null : new Date(t).toDateString();
    return [k(dueOf('Payment due date: Nov 3', base)), k(dueOf('due by November 3, 2026', base)), k(dueOf('Pay by 11/03/26', base)), k(dueOf('Your bill is due tomorrow', base)), k(dueOf('Statement for Dec 31 - due Jan 2', base)), k(dueOf('Hello there', base))]; });
  check('due dates read from common bill wording', JSON.stringify(dueParse) === JSON.stringify(['Tue Nov 03 2026', 'Tue Nov 03 2026', 'Tue Nov 03 2026', 'Wed Oct 21 2026', 'Sat Jan 02 2027', null]), JSON.stringify(dueParse));
  await page.click('.fchip[data-f="bills"]'); await page.waitForTimeout(900);
  const brows = await page.$$eval('#mlist .brow', rs => rs.map(r => r.textContent));
  check('BILLS lists one row per payee, soonest due first', brows.length === 4 && /^SoCal Edison\s*DUE/.test(brows[0]) && /DUE IN 2 DAYS · \$84\.12/.test(brows[0]) && /^Chase\s*DUE/.test(brows[1]) && /\$612\.40/.test(brows[1]), brows.join(' | ').slice(0, 240));
  check('a payment email marks the bill paid', brows.some(r => /^Spectrum\s*PAID/.test(r)), brows.join(' | ').slice(0, 240));
  check('a renewal is autopay, not a nag', brows.some(r => /^Netflix\s*AUTOPAY/.test(r) && /\$15\.49 · renews/.test(r) && /pays itself/.test(r)), brows.find(r => /Netflix/.test(r)));
  check('promos and long-past bills are skipped', !brows.some(r => /cash back|City Water/i.test(r)), brows.join(' | ').slice(0, 240));
  check('bills summary counts due soon and the total to pay', (await t('#inImp')).trim() === '1' && (await t('#inUnread')).trim() === '$697' && /To pay/i.test(await t('#inUnreadL')), (await t('#inImp')) + '/' + (await t('#inUnread')));
  await page.click('#mlist .brow'); await page.waitForTimeout(2600);
  check('tapping a bill makes Pip explain it', /SoCal Edison: \$84\.12 due .*in 2 days\. I'll mark it paid/.test(await t('#say')) && await page.$('#mlist .brow.open a[href*="mail.google.com"]') !== null, (await t('#say')).slice(0, 100));
  await page.screenshot({ path: path.join(OUT, '2c-bills.png') });
  reply = await ask('what bills are due');
  check('Ask Pip sums up bills', /^2 to pay: SoCal Edison \$84\.12 due in 2 days, Chase \$612\.40 due in 10 days\. 1 on autopay\. 1 paid recently\./.test(reply), reply.slice(0, 200));
  reply = await ask('hide bill emails');
  check('"hide bill emails" still makes an inbox rule', /hiding bill and money emails/i.test(reply), reply.slice(0, 80));
  await ask('show bill emails');
  await page.click('#tab-brief'); await page.waitForTimeout(700);
  check('Today shows the bill countdown on the inbox card', /^SoCal Edison \$84\.12 due in 2 days\./.test(await t('#bInT')), await t('#bInT'));
  billIds.push('b8');
  await page.evaluate(() => { const { BL, loadBills } = window.__pipBills; BL.at = 0; return loadBills(); });
  const paid = await page.waitForFunction(() => document.querySelector('#mood').textContent.trim() === 'PAID!', null, { timeout: 4000 }).then(() => true).catch(() => false);
  await page.waitForTimeout(1800);
  check('Pip cheers when a payment email clears a bill', paid && /SoCal Edison is paid \(\$84\.12\)\. One less thing\./.test(await t('#say')), (await t('#mood')) + ' / ' + (await t('#say')).slice(0, 80));
  await page.screenshot({ path: path.join(OUT, '2d-bill-paid.png') });
  check('paid bill leaves the Today countdown', !/SoCal Edison/.test(await t('#bInT')), await t('#bInT'));
  await page.waitForFunction(() => !/PAID!/.test(document.querySelector('#mood').textContent), null, { timeout: 8000 }).catch(() => {});
  await page.click('#tab-inbox'); await page.click('.fchip[data-f="imp"]'); await page.waitForTimeout(300);

  // packages
  check('packages search covers 3 weeks of shipping mail', /newer_than:21d/.test(pkgQ) && /out for delivery/.test(pkgQ) && /-in:sent/.test(pkgQ), pkgQ.slice(0, 80));
  const etaParse = await page.evaluate(() => { const { etaOf, trackOf } = window.__pipPkgs, base = new Date(2026, 9, 21, 9).getTime(), k = t => t == null ? null : new Date(t).toDateString();
    return [k(etaOf('Arriving Friday', base)), k(etaOf('Estimated delivery: Oct 27', base)), k(etaOf('Expected delivery 11/02', base)), k(etaOf('Arriving tomorrow by 9 PM', base)), k(etaOf('Out for delivery', base)), k(etaOf('Scheduled for Delivery Wednesday', base)), k(etaOf('Thanks for your order', base)), (trackOf('Tracking Number 1Z999AA10123456784') || {}).carrier, (trackOf('USPS 9400111899223817572490') || {}).carrier]; });
  check('delivery dates and tracking numbers read from common shipping wording', JSON.stringify(etaParse) === JSON.stringify(['Fri Oct 23 2026', 'Tue Oct 27 2026', 'Mon Nov 02 2026', 'Thu Oct 22 2026', 'Wed Oct 21 2026', 'Wed Oct 21 2026', null, 'UPS', 'USPS']), JSON.stringify(etaParse));
  await page.click('.fchip[data-f="pkgs"]'); await page.waitForTimeout(900);
  const prows = await page.$$eval('#mlist .prow', rs => rs.map(r => r.textContent));
  check('PACKAGES joins emails about one order and lists arriving today first', prows.length === 5 && /^Amazon\s*TODAY/.test(prows[0]) && /OUT FOR DELIVERY · Anker USB-C Charger 65W/.test(prows[0]) && /^Best Buy\s*DELAYED/.test(prows[1]) && /RUNNING LATE · NOW/.test(prows[1]), prows.join(' | ').slice(0, 300));
  check('a carrier email is named for the store and dated', prows.some(r => /^REI\s*SHIPPED/.test(r) && new RegExp('Arrives ' + new Date(Date.now() + 2 * 864e5).toLocaleDateString([], { weekday: 'long' }) + ' .*UPS').test(r)), prows.find(r => /REI|UPS/.test(r)));
  check('ordered and delivered packages show their state', prows.some(r => /^Target\s*ORDERED/.test(r)) && prows.some(r => /^Etsy\s*DELIVERED/.test(r) && /Delivered 2 days ago/.test(r)), prows.join(' | ').slice(0, 300));
  check('sale emails and delivery surveys are skipped', !prows.some(r => /SALE|How was your delivery|Big Store/i.test(r)), prows.join(' | ').slice(0, 300));
  check('packages summary counts arriving today and on the way', (await t('#inImp')).trim() === '1' && (await t('#inUnread')).trim() === '4' && /Arriving today/i.test(await t('#inImpL')), (await t('#inImp')) + '/' + (await t('#inUnread')));
  await page.click('#mlist .prow:nth-child(3)'); await page.waitForTimeout(2600);
  check('tapping a package makes Pip explain it, with a tracking link', /^Your REI package shipped with UPS\. It should arrive /.test(await t('#say')) && await page.$('#mlist .prow.open a[href^="https://www.ups.com/track?tracknum=1Z999AA10123456784"]') !== null && await page.$('#mlist .prow.open a[href*="mail.google.com"]') !== null, (await t('#say')).slice(0, 100));
  await page.screenshot({ path: path.join(OUT, '2e-packages.png') });
  reply = await ask('where are my packages');
  check('Ask Pip sums up packages', /^4 on the way: Anker USB-C Charger 65W from Amazon arrives today; Best Buy package is running late; REI package arrives \w+\. 1 delivered recently\./.test(reply), reply.slice(0, 200));
  reply = await ask('hide delivery emails');
  check('"hide delivery emails" still makes an inbox rule', /hiding delivery emails/i.test(reply), reply.slice(0, 80));
  await ask('show delivery emails');
  await page.click('#tab-brief'); await page.waitForTimeout(700);
  check('Today shows package day on the inbox card', /^Package day: Anker USB-C Charger 65W from Amazon arrives today\./.test(await t('#bInT')), await t('#bInT'));
  pkgIds.push('p8');
  await page.evaluate(() => { const { PK, loadPkgs } = window.__pipPkgs; PK.at = 0; return loadPkgs(); });
  const landed = await page.waitForFunction(() => document.querySelector('#mood').textContent.trim() === 'DELIVERED!', null, { timeout: 4000 }).then(() => true).catch(() => false);
  await page.waitForTimeout(1800);
  check('Pip cheers when the delivery email arrives', landed && /Your Anker USB-C Charger 65W from Amazon was delivered\. Go grab it\./.test(await t('#say')), (await t('#mood')) + ' / ' + (await t('#say')).slice(0, 80));
  await page.screenshot({ path: path.join(OUT, '2f-delivered.png') });
  check('delivered package leaves the Today card', !/Package day/.test(await t('#bInT')) && !/out for delivery/.test(await t('#bTips')), await t('#bInT'));
  await page.waitForFunction(() => !/DELIVERED!/.test(document.querySelector('#mood').textContent), null, { timeout: 8000 }).catch(() => {});
  await page.click('#tab-inbox'); await page.click('.fchip[data-f="imp"]'); await page.waitForTimeout(300);

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

  // car: OBD-II over Web Bluetooth (mocked adapter)
  await page.click('#tab-car'); await page.waitForTimeout(3500);   // let the Ask Pip answer hold expire
  check('car tab offers CONNECT CAR', await page.isVisible('#crGo') && (await t('#crGo')).trim() === 'CONNECT CAR', await t('#crGo'));
  await page.click('#crGo'); await page.waitForTimeout(2500);
  const btOpts = await page.evaluate(() => JSON.stringify(window.__btOpts || {}));
  check('connect asks for BLE OBD adapters (FFF0/FFE0 services or adapter names)', /"services":\[65520\]/.test(btOpts) && /"services":\[65504\]/.test(btOpts) && /"namePrefix":"OBD"/.test(btOpts), btOpts.slice(0, 120));
  check('adapter is initialized with ELM327 AT commands', await page.evaluate(() => ['ATZ', 'ATE0', 'ATSP0', '0100'].every(c => window.__elm.log.includes(c))));
  check('car shows live adapter name', /IOS-VLINK · LIVE/.test(await t('#crWho')), await t('#crWho'));
  const gauges = { speed: (await t('#crSpeed')).trim(), rpm: (await t('#crRpm')).trim(), cool: (await t('#crCool')).trim(), volt: (await t('#crVolt')).trim(), thr: (await t('#crThr')).trim(), load: (await t('#crLoad')).trim() };
  check('car reads speed, RPM, coolant, voltage, throttle and load', gauges.speed === '42MPH' && gauges.rpm === '2100' && gauges.cool === '196°F' && gauges.volt === '14.1V' && gauges.thr === '18%' && gauges.load === '35%', JSON.stringify(gauges));
  check('RPM bar lights up', (await page.$$('#crSegs i.on')).length === 5);
  check('Pip cruises while the car is moving', (await t('#mood')).trim() === 'CRUISING' && /Cruising at 42 mph/.test(await t('#say')), (await t('#mood')) + ' / ' + (await t('#say')).slice(0, 60));
  await page.screenshot({ path: path.join(OUT, '3c-car.png') });
  await page.click('#pane-car [data-say="carCool"]'); await page.waitForTimeout(2200);
  check('tapping coolant makes Pip explain it', /Coolant is 196°F\. Normal is about 195 to 220°/.test(await t('#say')), (await t('#say')).slice(0, 80));
  await page.evaluate(() => { window.__elm.rpm = 6200; }); await page.waitForTimeout(1500);
  check('Pip warns at redline', (await t('#mood')).trim() === 'REDLINE' && /6,200 RPM/.test(await t('#say')) && (await page.$$('#crSegs i.on.r')).length > 0, (await t('#mood')) + ' / ' + (await t('#say')).slice(0, 60));
  await page.screenshot({ path: path.join(OUT, '3d-car-redline.png') });
  await page.evaluate(() => { window.__elm.rpm = 2100; window.__elm.coolC = 115; }); await page.waitForTimeout(2600);
  check('Pip warns when the engine runs hot', (await t('#mood')).trim() === 'ENGINE HOT' && /239°F/.test(await t('#say')) && await page.$('#crCool.warn') !== null, (await t('#mood')) + ' / ' + (await t('#say')).slice(0, 60));
  await page.evaluate(() => { window.__elm.coolC = 91; window.__elm.ecu = false; window.__elm.volt = 11.5; }); await page.waitForTimeout(9000);
  check('Pip warns about a low car battery with the engine off', (await t('#mood')).trim() === 'LOW BATTERY' && /Car battery is low: 11\.5 V/.test(await t('#say')), (await t('#mood')) + ' / ' + (await t('#say')).slice(0, 60));
  check('engine off shows a key-on hint', /TURN THE KEY/.test(await t('#crNote')), await t('#crNote'));
  await page.evaluate(() => { window.__elm.ecu = true; window.__elm.volt = 14.1; }); await page.waitForTimeout(5000);
  await page.evaluate(() => window.__elmDrop()); await page.waitForTimeout(300);
  check('dropped adapter shows reconnecting', /RECONNECTING/.test(await t('#crNote')), await t('#crNote'));
  await page.waitForTimeout(4500);
  check('car reconnects by itself after a dropped link', /LIVE/.test(await t('#crWho')) && (await t('#crSpeed')).trim() === '42MPH', (await t('#crWho')) + ' ' + (await t('#crSpeed')));
  reply = await ask("how's my car");
  check('Ask Pip sums up the car', /Doing 42 mph at 2,100 RPM, coolant 196°F, battery 14\.1 V\. All looks normal\./.test(reply), reply.slice(0, 100));
  await page.click('#crOut'); await page.waitForTimeout(1200);
  const last = await page.evaluate(() => JSON.parse(localStorage.getItem('pp.carLast') || 'null'));
  check('disconnect keeps last readings on the device', !!last && Math.round(last.speed) === 42 && /last seen/i.test(await t('#crSpeedL')) && /RECONNECT CAR/.test(await t('#crGo')), JSON.stringify(last));
  check('Pip stops cruising after disconnect', (await t('#mood')).trim() !== 'CRUISING', await t('#mood'));

  // air quality: tile on the weather tab, Pip masks up when it's bad, brief tip, Ask Pip, forecast warning
  const airReload = async (a, pk) => { AIR = a; AIRPEAK = pk; await page.evaluate(() => { window.__pipAir.AQ.tried = 0; return window.__pipAir.loadAir(); }); await page.waitForTimeout(400); };
  await page.click('#tab-fc'); await page.waitForTimeout(700);
  check('air quality fetched for your spot (US AQI, next hours)', /latitude=34\.24/.test(airQ) && /us_aqi/.test(airQ) && /hourly=us_aqi/.test(airQ), airQ.slice(0, 120));
  check('weather tab shows the air quality tile', (await t('#aqi')).replace(/\s/g, '') === '42GOOD', await t('#aqi'));
  reply = await ask("how's the air today");
  check('Ask Pip answers how the air is', /^Air in Northridge is good: AQI 42, fine particles 11 µg\/m³\. Breathe easy\./.test(reply), reply.slice(0, 100));
  await airReload(165, 170);
  const masked = await page.waitForFunction(() => document.querySelector('#mood').textContent.trim() === 'BAD AIR', null, { timeout: 5000 }).then(() => true).catch(() => false);
  await page.waitForTimeout(2600);
  check('Pip masks up when the air is bad', masked && /Bad air in Northridge: AQI 165\. Mask on, windows shut/.test(await t('#say')), (await t('#mood')) + ' / ' + (await t('#say')).slice(0, 80));
  check('air tile turns red with BAD', (await t('#aqi')).replace(/\s/g, '') === '165BAD' && await page.$eval('#airTile', e => e.dataset.l) === '4', await t('#aqi'));
  await page.screenshot({ path: path.join(OUT, '1b-bad-air.png') });
  await page.click('#airTile'); await page.waitForTimeout(3600);
  check('tapping the air tile makes Pip explain AQI', /^Air quality index 165: unhealthy\. Under 50 is clean/.test(await t('#say')), (await t('#say')).slice(0, 80));
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('pp.air') || 'null'));
  check('last air reading kept on the device', !!stored && stored.d.aqi === 165 && stored.k === '34.24,-118.53', JSON.stringify(stored || {}).slice(0, 80));
  await page.click('#tab-brief'); await page.waitForTimeout(800);
  check('brief warns about bad air', /Air quality is unhealthy \(AQI 165\)\. Keep windows shut/.test(await t('#bTips')) && /Air: AQI 165\./.test(await t('#bWxT')), (await t('#bTips')).slice(0, 200));
  await page.screenshot({ path: path.join(OUT, '3f-brief-bad-air.png') });
  await airReload(45, 125);
  await page.waitForTimeout(1500);
  check('Pip drops the mask once the air clears', !/BAD AIR|HAZY AIR/.test(await t('#mood')), await t('#mood'));
  check('brief warns when the air gets worse later', /Air gets worse around .* \(AQI 125\)\. Get outside earlier/.test(await t('#bTips')), (await t('#bTips')).slice(0, 200));
  await airReload(42, 48);

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
  await page.click('.fchip[data-f="bills"]'); await page.waitForTimeout(700);
  const bFit = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1 && [...document.querySelectorAll('#mlist .brow .mfrom')].every(e => e.getBoundingClientRect().width > 40) && [...document.querySelectorAll('.filters .fchip')].filter(b => !b.hidden).every(b => b.getBoundingClientRect().bottom <= innerHeight));
  check('bills list and filter chips fit on phone landscape', bFit);
  await page.screenshot({ path: path.join(OUT, '7e-phone-bills.png') });
  await page.click('.fchip[data-f="pkgs"]'); await page.waitForTimeout(700);
  const pFit = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1 && document.querySelectorAll('#mlist .prow').length > 0 && [...document.querySelectorAll('#mlist .prow .mfrom')].every(e => e.getBoundingClientRect().width > 40));
  check('packages list fits on phone landscape', pFit);
  await page.screenshot({ path: path.join(OUT, '7f-phone-packages.png') });

  await page.click('#tab-car'); await page.waitForTimeout(600);
  const carFit = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1 && ['crSpeed', 'crVolt', 'crLoad', 'crGo'].every(id => { const r = document.getElementById(id).getBoundingClientRect(); return r.width > 20 && r.bottom <= innerHeight + 1; }));
  check('car tab fits on phone landscape', carFit);
  await page.click('#tab-fc'); await page.waitForTimeout(600);
  const airFit = await page.evaluate(() => { const a = document.getElementById('airTile').getBoundingClientRect(), b = document.getElementById('aqi'); return document.documentElement.scrollWidth <= innerWidth + 1 && a.width > 30 && a.right <= innerWidth && b.scrollWidth <= b.clientWidth + 1; });
  check('air tile fits on phone landscape', airFit);
  await page.screenshot({ path: path.join(OUT, '7g-phone-weather.png') });
  await page.click('#tab-car'); await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT, '7d-phone-car.png') });

  // iPhone/iPad: no Web Bluetooth, so the car tab explains why and hides the button
  const ctx2 = await browser.newContext({ viewport: { width: 1180, height: 740 } });
  await ctx2.addInitScript(() => { Object.defineProperty(Navigator.prototype, 'bluetooth', { configurable: true, get: () => undefined }); try { localStorage.setItem('pp.tab', JSON.stringify('car')); } catch (e) {} });
  const p2 = await ctx2.newPage(); p2.on('pageerror', e => errors.push('no-bt: ' + e.message)); await mock(p2);
  await p2.goto('file://' + PAGE); await p2.waitForTimeout(2500);
  check('car tab explains iPhone/iPad have no Web Bluetooth', /IPHONE AND IPAD/.test((await p2.textContent('#crNote')) || '') && !(await p2.isVisible('#crGo')), await p2.textContent('#crNote'));
  await p2.screenshot({ path: path.join(OUT, '3e-car-no-bluetooth.png') });
  await ctx2.close();

  // A brand-new person: guided setup, Today first, optional extras, name in the greeting
  const ctx3 = await browser.newContext({ viewport: { width: 1180, height: 740 }, geolocation: { latitude: 34.24, longitude: -118.53 }, permissions: ['geolocation'] });
  const p3 = await ctx3.newPage(); p3.on('pageerror', e => errors.push('first-run: ' + e.message)); await mock(p3);
  const t3 = async sel => (await p3.textContent(sel).catch(() => '')) || '';
  await p3.goto('file://' + PAGE); await p3.waitForTimeout(3200);
  check('first run opens guided setup', await p3.isVisible('#setup .suBox'));
  check('app opens on Today', (await p3.getAttribute('#tab-brief', 'aria-selected')) === 'true' && (await p3.$eval('.tabs .tab', b => b.id)) === 'tab-brief');
  check('niche tabs are off for a new person', !(await p3.isVisible('#tab-gym')) && !(await p3.isVisible('#tab-car')) && await p3.isVisible('#tab-iss'));
  await p3.screenshot({ path: path.join(OUT, '8a-setup-hello.png') });
  await p3.fill('#suName', 'Alex'); await p3.click('#suNext'); await p3.waitForTimeout(700);
  check('setup step 2 asks for location', await p3.isVisible('.suStep[data-step="1"]') && /Nice to meet you, Alex/.test(await t3('#say')), await t3('#say'));
  await p3.click('#suLoc'); await p3.waitForTimeout(2200);
  check('setup finds your location', /Got it: Northridge/.test(await t3('#suLocMsg')), await t3('#suLocMsg'));
  await p3.click('#suNext'); await p3.waitForTimeout(600);
  check('setup step 3 offers Google and Spotify', await p3.isVisible('#suG') && await p3.isVisible('#suS'));
  await p3.screenshot({ path: path.join(OUT, '8b-setup-accounts.png') });
  await p3.click('#suSkip'); await p3.waitForTimeout(600);
  check('setup step 4 lists the extras', (await p3.$$('#suMods .suMod')).length === 4);
  await p3.click('#suMods .suMod[data-k="gym"]'); await p3.waitForTimeout(300);
  check('switching on an extra adds its tab', await p3.isVisible('#tab-gym'));
  await p3.screenshot({ path: path.join(OUT, '8c-setup-extras.png') });
  await p3.click('#suNext'); await p3.waitForTimeout(1200);
  check('finishing setup lands on Today with your name', !(await p3.isVisible('#setup .suBox')) && (await p3.getAttribute('#tab-brief', 'aria-selected')) === 'true' && /, Alex$/.test((await t3('#bHi')).trim()), await t3('#bHi'));
  check('glance tiles show date and rain instead of device stats', /\d/.test(await t3('#gDate')) && (await t3('#gRain')).trim() !== '--' && !(await p3.isVisible('#fps')), (await t3('#gDate')) + ' / ' + (await t3('#gRain')));
  check('Today offers FINISH SETUP while Google is not connected', await p3.isVisible('#bSetup'));
  await p3.screenshot({ path: path.join(OUT, '8d-today-after-setup.png') });
  await p3.click('#bSetup'); await p3.waitForTimeout(700);
  check('FINISH SETUP jumps to the missing step', await p3.isVisible('.suStep[data-step="2"]'));
  await p3.click('#suSkip'); await p3.waitForTimeout(400); await p3.click('#suNext'); await p3.waitForTimeout(800);
  await p3.fill('#askIn', 'turn off gym'); await p3.press('#askIn', 'Enter'); await p3.waitForTimeout(800);
  check('Ask Pip turns an extra off', !(await p3.isVisible('#tab-gym')) && /Gym visits is off/.test(await t3('#say')), await t3('#say'));
  await p3.reload(); await p3.waitForTimeout(3000);
  check('setup does not come back after it is done', !(await p3.isVisible('#setup .suBox')));
  await ctx3.close();

  check('no page errors', errors.length === 0, errors.join(' | '));
  await browser.close();
  const failed = results.filter(r => !r.ok);
  results.forEach(r => console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.info && !r.ok ? '  -> ' + r.info : ''}`));
  console.log(`\n${results.length - failed.length}/${results.length} passed. Screenshots in tests/out/`);
  process.exit(failed.length ? 1 : 0);
})();
