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
