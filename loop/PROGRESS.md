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
