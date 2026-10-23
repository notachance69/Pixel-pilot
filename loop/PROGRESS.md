# Progress log

Append-only. Newest at the bottom. Each entry: date, task, result, rubric scores (Works / Useful / Delight / Clarity / Resilience / Privacy / Performance), next.

---

## Before the loop (Oct 13–15, 2026)
Built in conversation: the pixel Pip character, Y2K chrome style, live weather and sky, device stats, interaction animations, Spotify (with token-refresh race fix), ISS tracker, header tabs, and the Home Screen self-updater. Live at https://notachance69.github.io/Pixel-pilot/.

## 2026-10-16, round 0: loop setup
- Added `src/app.html` (single source), `tools/build.py` (preview + promote), `tests/smoke.js` (mocked end-to-end, 20 checks), and this loop folder.
- Result: kept.

## 2026-10-16, round 1: Gmail inbox
- Task: `inbox`. Browser-only Google sign-in (token flow, silent renew with prompt=none and a 10-minute guard), gmail.readonly, last 3 days of inbox every 2 minutes.
- Importance = Gmail flags (Important, Primary, Starred, Unread) + rules (JOBS incl. ATS and medtech domains, MONEY, DEADLINE, TRAVEL, DELIVERY, SECURITY) + VIP senders and keywords from Settings − promotions/social/newsletters.
- Inbox tab with filters, expandable rows, Open in Gmail, Pip "NEW MAIL" mood with an envelope.
- First test run: 17/20. The suite caught a bill scoring 40 (cutoff 45) and a sort that ignored score. Fixed: MONEY weight 35, rank by score. 20/20.
- Scores: Works 5, Useful 5, Delight 4, Clarity 4, Resilience 4, Privacy 5, Performance 4.

## 2026-10-16, round 2: Brief tab
- Task: `brief`. Greeting, weather/inbox/sky/music cards that jump to their tab, up to 4 Pip suggestions, and READ IT TO ME (bubble + iOS text-to-speech).
- Settings sheet added (sound moved there; Gmail Client ID, VIP and keyword rules, build number, check for updates).
- Scores: Works 5, Useful 5, Delight 4, Clarity 4, Resilience 4, Privacy 5, Performance 4.

## 2026-10-16, round 3: critique pass
- Screenshot review found the Brief greeting wrapping to 3 lines and clipping the tips, and the speech bubble shrinking under Pip so the last line was hidden.
- Fixed: smaller balanced heading, wider greeting column, `flex:none` on the bubble, and email tips ordered before weather.
- 20/20. Clarity 4 → 5.
- Next: `calendar` (reuses the Google sign-in), then `job-tracker`.

## 2026-10-16, round 4: Gym tab (Chance asked for 24 Hour Fitness days)
- 24 Hour Fitness has no public API, but 24GO's Check-In History can "email yourself a report". Pip searches Gmail for those reports and reads dates from the body, HTML, CSV/TXT and PDF attachments (pdf.js, loaded only when needed).
- Going forward: an optional iOS Shortcut emails "Pixel Pilot gym check-in" when 24GO opens. Those emails are hidden from the Inbox tab.
- Gym marketing emails are ignored: they need check-in/visit wording, and only past dates count. The report's own date counts only on a line about a check-in.
- Gym tab: 18-week heatmap (cyan = from email, pink = tapped), this week vs goal, week streak, month count, last visit, tap a day to mark or unmark it. Pip "GAINS" mood with a sweatband and dumbbells. Brief nudges after 3+ days off. Goal in Settings.
- Tests: 25 checks. The first run failed one: the gym note pushed the rain warning out of the Brief. Fixed by only nudging when actionable and ranking it after weather.
- Scores: Works 5, Useful 5, Delight 5, Clarity 4, Resilience 4, Privacy 5 (only dates stored), Performance 5.
- Next: confirm the real 24GO report format with Chance; then `calendar`.

## 2026-10-16, round 5: real-data check + promote
- Checked Chance's real Gmail via the Claude Gmail connector: about 200 emails from 24 Hour Fitness, all promotions ("Training Day 10/15", "Rams tickets October 18th", "Your Club Check-In Is Changing"). No check-in reports yet.
- Found a false-positive bug: a yearless future date in a promo was rolled back a year and counted as a gym day. Fixed: Promotions/Social mail never counts, report text must read like a check-in history, no year rollback, and the Gmail query skips promotions.
- Added two tests modeled on the real promos. 25/25.
- Promoted to live at Chance's request (he expected to see the new tabs on the live link).
- Note: connecting Gmail to Claude is not the same as Pixel Pilot's own Google sign-in; the page still needs its OAuth Client ID.

## 2026-10-16, round 6: Google Client ID built in
- Chance created the Google Cloud project without billing (direct console links skip the free-trial card prompt) and sent the public OAuth Client ID. Built into src/app.html, 25/25, promoted to live.

## 2026-10-16, round 7: Ask Pip (Chance asked to adjust features by talking to Pip)
- Command bar under Pip with a mic button where the browser supports speech (iOS keyboard dictation works everywhere). Pattern-based: hide/show email types (jobs, bills, deadlines, travel, deliveries, security, promos, newsletters, social), mute/unmute senders, hide emails about a topic, VIP senders, flag words, only show unread/important/all, gym goal, sound, open a tab, list/reset rules, plus quick answers (weather, rain, inbox, ISS, song, gym, sun, moon).
- Rules apply to Inbox, Brief, read-aloud, Pip's facts and new-mail alerts. Inbox shows "N hidden by your rules". Settings lists rules as chips; tap to remove.
- Tests 34/34 (9 new). Screenshot caught the one-time intro talking over a question; intro now waits and skips if you're typing.
- Shipped live at Chance's request.

## 2026-10-17, round 8: Google Calendar (scheduled run)
- Task: `calendar` (top unbuilt backlog item). Baseline 34/34 green first.
- calendar.readonly rides on the existing Google sign-in. Interactive Connect asks for Gmail + Calendar; silent renewals only ask for scopes already granted, so an older Gmail-only sign-in never gets bounced. If Calendar isn't granted, the Brief shows ALLOW CALENDAR. A 403 tells you to enable the Calendar API.
- Brief: new tall "Next up · Calendar" card with a countdown (IN 25M / NOW / FREE) and the next 3 events (skips declined and cancelled; all-day events tagged). The other four cards are now a 2×2 grid. A meeting within 3 hours leads the tips and the read-aloud.
- Pip: HEADS UP mood 10 minutes before a timed event: yellow Pip, ringing alarm clock above his head, alarm chirp, Brief badge, "Heads up: X starts in 8 minutes, at Zoom." Tap the card or ask "what's next" / "am I free" for a spoken summary.
- Polls every 5 minutes alongside Gmail, only while visible. Event data stays in memory.
- Tests 45/45 (11 new, Calendar API mocked). The first run caught a syntax slip in Pip's help text and a test-timing race with the gym celebration. Screenshots checked at iPad and phone landscape; tightened the list on short screens so 3 events fit.
- Scores: Works 5, Useful 5, Delight 5, Clarity 4 (phone Brief is dense), Resilience 4, Privacy 5, Performance 5.
- Chance's one-time step: enable Google Calendar API in the Pixel Pilot Cloud project (and add the calendar.readonly scope under Data access), then tap ALLOW CALENDAR on the Brief tab.
- Next: `job-tracker`.

## 2026-10-17, round 8b: Calendar promoted (Chance asked to turn it on)
- Enabled the Google Calendar API in the Pixel Pilot Cloud project from Chance's Chrome. Calendar now works once he taps ALLOW CALENDAR on the Brief tab.
- A live session built a second calendar version in parallel; kept the scheduled run's (safer scope handling on silent renew, more tests) and discarded the other.
- Ported two fixes from it: mood changes no longer talk over a fresh Ask Pip answer (7 s hold, alerts still speak), and the Brief shows at most two email tips so the weather tip isn't pushed out by a meeting tip.
- Tests 45/45. Promoted to live.
- Found in the Cloud console: the only test user is chance.c.castle@gmail.com. chancecastle100@gmail.com needs adding (or Publish app) before it can sign in.

## 2026-10-18, round 9: Job tracker (scheduled run)
- Task: `job-tracker` (top unbuilt backlog item). Baseline 45/45 green first.
- Inbox gets a JOBS chip. It reads the last 30 days of job mail (skips Promotions, Social and job-alert digests) plus your sent mail, and groups by company: the sender's domain, or for Greenhouse/Lever/Workday-style senders the company named in the subject ("Thank you for applying to Abbott").
- Each company shows a stage tag (APPLIED, SCREEN, INTERVIEW, OFFER, CLOSED), days since last contact, and either YOUR REPLY · 5D (a person wrote and you haven't answered in 3+ days) or "You replied. Waiting on them." Tap a company for its last 3 emails and an Open in Gmail link; Pip explains where it stands.
- Pip: new green JOB NEWS mood with a briefcase. YOUR MOVE nudge once a day per company that's waiting on you; OFFER! with a big star burst; "moved you to interviews" when a stage advances. The Brief leads email tips with who is waiting on you. Ask Pip: "how's my job search" / "pipeline" / "any offers".
- Polls with Gmail every 30 minutes, only fetches messages it hasn't seen, nothing persisted but company stages and nudge dates.
- Tests 58/58 (13 new: Medtronic waiting, Edwards replied, Stryker rejected, Abbott via ATS, LinkedIn alert ignored, phone fit). First run caught a mock bug (the jobs query contains "-in:sent") and a wrong expectation in my own test.
- Scores: Works 5, Useful 5, Delight 5, Clarity 4 (phone shows 3 companies before scrolling), Resilience 4, Privacy 5, Performance 5.
- Next: `car-obd` (or `air-quality` as a quicker win). Check the pipeline against Chance's real job mail and tune company names.

## 2026-10-19, round 10: Car tab, slice 1 (scheduled run)
- Task: `car-obd` (top unbuilt backlog item). Baseline 58/58 green first. Split it: this run is live gauges and Pip; MPG/range is the new `car-mpg` item.
- New CAR tab. CONNECT CAR opens Chrome's Bluetooth picker filtered to OBD adapters (FFF0/FFE0/18F0/vLinker services, or names like OBD, Vlink, Veepeak). Pip sends the ELM327 setup (ATZ, ATE0, ATSP0...) and then reads speed, RPM, coolant, battery voltage, throttle and engine load. Speed and RPM about 2-3 times a second; the rest every few seconds. Polling stops while the page is hidden.
- Pip: CRUISING (shades, speed lines, stays on through red lights), REDLINE at 5,500 RPM, ENGINE HOT at 235°F, LOW BATTERY (under 11.8 V off, under 12.5 V running). Alerts chirp, flag the tab and talk over Ask Pip holds. Tap any gauge for an explanation; Ask Pip "how's my car" / "connect my car".
- Resilience: a dropped link reconnects by itself (3 tries with backoff); engine-off shows TURN THE KEY and ignores stale coolant; last readings kept on device and shown as "last seen". Chrome's getDevices reconnects without the picker where supported. Brief tip if the last battery reading was low.
- iPhone/iPad: no Web Bluetooth in any iOS browser, so the tab says so and hides the button.
- Tests 77/77 (19 new, with a fake BLE ELM327 that answers in 20-byte chunks, spaced hex, SEARCHING..., engine-off and a dropped link). First run caught a stale-coolant false alarm after engine off and an Ask Pip hold hiding the cruise line in the test.
- Scores: Works 5, Useful 3 (needs Android Chrome + a BLE adapter; untested on a real car), Delight 5, Clarity 4, Resilience 4, Privacy 5, Performance 4.
- Next: try it with a real adapter if Chance has one; then `car-mpg` or `air-quality` as a quick win for the iPad.

## 2026-10-19, rule change (Chance)
- New rule: features must track automatically from data Chance already produces; manual input only for one-time setup or corrections. Added to LOOP.md (Goal, rubric "Automatic", hard rules).
- Backlog re-ranked: bills, packages, air quality, weather alerts, quakes, night dim first (automatic and work on the iPad today), then car MPG (fill-ups now auto-detected from the fuel-level sensor) and driving mode. Focus timer parked.
- IDEAS.md rewritten so each idea names its automatic source; manual ideas moved to "Parked: manual".

## 2026-10-19, round 11: natural flow + general audience (Chance asked)
- Loop rules: build for a general person (nothing personal hard-coded; niche features are optional modules) and keep the flow natural (one guided setup, Today first, every empty state has a next step). Added "Flow" to the rubric. IDEAS.md rewritten around everyday needs.
- First-run audit found: no guided setup (connect buttons spread over 3 tabs), app opened on Forecast with the summary as the last tab, 7 equal tabs, developer stats on the main screen, "Chance" hard-coded.
- Built: guided setup (name, location, Google, Spotify, extras) that resumes after sign-in redirects; TODAY is the first tab and the default; tabs ordered Today, Inbox, Weather, Music, then optional Gym, Car, ISS; Job search is an optional module too. "At a glance" tiles (date, next event, important mail, next rain) replace device stats, which moved to Settings. Name from setup in greetings. Settings gains Your name, On your dashboard toggles, Run setup again. Ask Pip: "turn on/off gym|jobs|car|space station", "set up again". FINISH SETUP button on Today until location and Google are connected. Existing users keep every module on and skip setup.
- Tests 91/91 (14 new first-run checks). Bug caught: new copy put an apostrophe inside a single-quoted string.
- Scores: Works 5, Automatic 5, Useful 5, Flow 5, Delight 5, Clarity 5, Resilience 4, Privacy 5, Performance 5.
- Preview only. Next: `bills`.

## 2026-10-20, round 12: Bills (scheduled run)
- Task: `bills` (top unbuilt backlog item). Baseline 91/91 green first.
- New BILLS chip in the Inbox (on for everyone, not a module). Reads 45 days of bill, statement, renewal and payment emails (headers and preview text only), groups by payee (sender domain), and reads the amount and due date ("due Oct 22", "due by 11/03/26", "due tomorrow", "renews on...", year guessed when missing).
- Status per payee: DUE (with days left), OVERDUE (up to 7 days, then dropped as probably paid elsewhere), AUTOPAY (autopay/renewal wording, never nags) and PAID (a payment-confirmation email newer than the bill). Rows show amount, due date, and expand to the last emails plus Open in Gmail. Summary: due within 7 days and total to pay.
- Pip: new BILL DUE mood (yellow, stern brows, flat mouth, a $ bill swaying over his head) once a day per bill due within 3 days, queued after a job nudge instead of talking over it. PAID! mood (green, grin, the bill turns green) when a payment email clears a bill he'd flagged.
- Today: the inbox card leads with the countdown ("SoCal Edison $84.12 due in 2 days."); Brief tip when there's room; read-aloud always includes it. Ask Pip: "what bills are due" opens BILLS and sums up. "hide bill emails" still makes an inbox rule.
- Polls with Gmail every 30 minutes, only fetches messages it hasn't seen. Stored on device: payee -> status and nudge dates only.
- Tests 106/106 (15 new: due-date parser, payee rows and order, paid, autopay, promo and stale bills skipped, summary, tap, Ask Pip, Today countdown, Pip stern and paid moods, phone fit). Also made the Ask Pip test helper wait until Pip finishes typing (one existing check was flaky reading a half-typed answer). Screenshots caught the phone inbox summary clipping its note under the chips; short screens now hide the account line and use smaller numbers. Fixed "1 days ago".
- Scores: Works 5, Automatic 5, Useful 5, Flow 4 (Brief tips can be full of job items, so the countdown sits on the inbox card), Delight 5, Clarity 4, Resilience 4 (depends on the preview text holding the date), Privacy 5, Performance 5.
- Preview only. Next: `packages`. Check BILLS against Chance's real bill emails and tune payee names and date wording.

## 2026-10-21, round 13: Packages (scheduled run)
- Task: `packages` (top unbuilt backlog item). Baseline 106/106 green first.
- New PACKAGES chip in the Inbox (on for everyone, not a module). Reads 3 weeks of order, shipping and delivery emails (headers and preview text only) and joins emails about the same order by order number, tracking number, quoted item name or thread. The newest email sets the status; a delivery email always wins.
- Rows: ORDERED, SHIPPED (with "Arrives Friday" from wording like "arriving Friday", "estimated delivery Oct 27", "scheduled for delivery Thursday"), TODAY (out for delivery), DELAYED (with the new date) and DELIVERED (kept 3 days). Carrier emails are named for the store ("Shipment from REI"). Tap a row for Pip's explanation, the last emails, Open in Gmail and a TRACK ON UPS/USPS/FEDEX link when a tracking number is in the email.
- Pip: DELIVERY DAY mood (orange, grinning, holding a parcel), RUNNING LATE (flat face) and DELIVERED! (green, star eyes, parcel hops). On delivery day he keeps a small box by his side in everyday moods. Once a day per package; queued after the job and bill nudges.
- Today: the inbox card says "Package day: X arrives today." (added after the bill countdown when both apply); Brief tip when there's room; read-aloud always includes it. Ask Pip: "where are my packages" opens PACKAGES and sums up. "hide delivery emails" still makes an inbox rule.
- Polls every 10 minutes on delivery day, otherwise 30, only while Gmail polls. Only fetches messages it hasn't seen. Stored on device: hashed package ids -> status and nudge dates (no item names). Sale emails, delivery surveys, returns and food-delivery apps are skipped.
- Tests 121/121 (15 new: ETA and tracking parser, joined order, sort, carrier-named-for-store, ordered/delivered rows, noise skipped, summary, tap + tracking link, Ask Pip, Today card, Pip delivery-day and delivered moods, phone fit). Screenshots caught the parcel covering Pip's mouth (moved below his chin) and a carrier row repeating the email subject. One run had the existing "engine runs hot" check read Pip's line mid-typing; it passed on the next three runs. Worth making that check wait for typing.
- Scores: Works 5, Automatic 5, Useful 5, Flow 4 (Brief tips are often full, so package day leads the inbox card instead), Delight 5, Clarity 4, Resilience 4 (depends on shipping wording in the preview text), Privacy 5, Performance 5.
- Preview only. Next: `air-quality`. Check PACKAGES against Chance's real shipping emails (Amazon, UPS) and tune wording.

## 2026-10-22, round 14: Air quality (scheduled run)
- Task: `air-quality` (top unbuilt backlog item). Baseline 121/121 green first.
- New AIR tile on the Weather tab next to Feels, Humidity and Wind: US AQI with GOOD/OK/POOR/BAD, turning red when unhealthy. Source is Open-Meteo's free air-quality API (no key), current AQI and PM2.5 plus the next hours. It rides the weather poll, refreshing about every 30 minutes (2 minutes after an error); the last reading stays on the device for 3 hours and is dropped when the location changes.
- Pip: HAZY AIR (AQI 101-150, tan, face mask) and BAD AIR (151+, stern brows, mask, smoke drifting past, alarm chirp, flags the Weather tab). Bad air beats heat and music; hazy air sits after hot/cold. The mask puffs when he talks.
- Today: a Brief tip when the air is poor ("Air quality is unhealthy (AQI 165). Keep windows shut...") or will get worse in the next 12 hours ("Air gets worse around 3 PM (AQI 125)..."); the weather card adds "Air: AQI n." when poor. Ask Pip: "how's the air", "is it smoky", "aqi". Tapping the tile explains the scale.
- Tests 132/132 (11 new: request shape, tile, Ask Pip, mask mood + line, red tile, tap explanation, stored reading, brief warning + card, mask drops when air clears, worse-later tip, phone fit). Screenshots caught: a 4th tile in the Hi/Lo row squashed "78/47" into Rain max on phone (moved Air to the top row; phone hides the GOOD word and relies on color); the tap explanation overflowed the bubble (shortened). Also fixed a failed fetch making an old reading look fresh.
- Scores: Works 5, Automatic 5, Useful 4 (matters most on smoke days), Flow 5 (no setup, shows on Weather and Today), Delight 5, Clarity 4, Resilience 5, Privacy 5, Performance 5.
- Seen in passing: on phone landscape the Weather panel clips the bottom of the Hi/Lo row (already the case before this run). Worth a small layout fix.
- Preview only. Next: `alerts` (NWS weather alerts), then the phone Weather clip.

## 2026-10-23, round 15: Weather alerts (scheduled run)
- Task: `alerts` (top unbuilt backlog item). Baseline 132/132 green first.
- Source: the National Weather Service's free active-alerts feed for your spot (api.weather.gov, no key). Checked with the weather poll, about every 10 minutes (2 after an error). Repeats of the same alert for neighboring zones, expired alerts, test messages and cancellations are dropped. The last list stays on the device for an hour. Outside the US the feed answers with an error, so Pip stops asking until the location changes and says alerts are US-only.
- Weather panel: while an alert is active, a banner takes the place of the "Weather now" label: "RED FLAG WARNING · UNTIL TOMORROW 7 PM +1". Red with a slow pulse for warnings, yellow for watches and advisories, cyan for statements. Phone hides the time and keeps the name and count. Tap it for Pip's explanation and what to do.
- Pip: WEATHER ALERT mood whose label is the alert name, with a flashing warning sign over his head. Watches and advisories are called out once a day each, queued after job, bill and package nudges. Warnings jump the queue, sound the alarm, flag the Weather tab and stay up while they last (above storm, smoke and music). A short tip per alert type (red flag, heat, wind, flood, winter, tornado, fog, surf...), else the first line of the NWS instruction.
- Today: a warning is the first Brief tip; watches and advisories join the weather tips; the weather card leads with the alert. Ask Pip: "any weather alerts", "warnings", "red flag". Email phrases like "security alert" still go to the inbox rules.
- Tests 150/150 (18 new: request shape, calm day, Ask Pip none, advisory callout + banner, called out once, warning alarm + red banner with duplicates/expired/test/cancel dropped, warning stays up, tap explanation, stored list, Brief + card, Ask Pip list, email rule not hijacked, banner clears, non-US, phone fit). First runs caught the tap explanation overflowing the bubble (shortened) and zone duplicates slipping through when end times differ by milliseconds (now matched to 10 minutes).
- Scores: Works 5, Automatic 5, Useful 4 (rare but important days; US only), Flow 5 (no setup), Delight 5, Clarity 4 (Today weather card truncates long alert text), Resilience 4 (not tried against the live feed: the build sandbox can't reach api.weather.gov), Privacy 5, Performance 5.
- Still seen: phone landscape clips the bottom of the Weather Hi/Lo row (pre-existing).
- Preview only. Next: the phone Weather clip (small), then `quakes`.
