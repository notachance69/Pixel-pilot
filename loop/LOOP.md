# Pixel Pilot improvement loop

This is the program every build session follows, whether a person started it or the daily schedule did.
It borrows from three loops that work in practice:

- **Anthropic's long-running agent harness:** a JSON feature list where only the `passes` field changes, a progress log, one feature per session, and end-to-end testing before anything counts as done.
- **Huntley's "Ralph" loop:** the same instructions every run, one task per run, state kept in files on disk rather than in chat, and "search before assuming" something is missing.
- **Karpathy's autoresearch:** a fixed budget per run and a keep-or-discard decision against a score, with git as the undo button.

## Goal

Grow Pixel Pilot into Chance's personal hub: an animated pixel assistant (Pip) that shows what matters right now from his real data. That includes email, weather, sky, music, the space station, and later his car, calendar and projects. It runs as one HTML file on GitHub Pages, opened on an iPad, phone or car screen.

**Automatic, not manual (Chance's rule, 2026-10-19).** The point is to make life easier and more centralized. Every feature must fill itself from data Chance already produces: his Gmail, calendar, phone, car, accounts and public feeds. Manual input is allowed only as:
- a one-time setup step (a sign-in, a tank size, an iOS Shortcut automation), or
- a correction or fallback when the automatic source misses something.

A feature that needs routine typing or tapping to be useful does not get built. Rework it to an automatic source, or park it in IDEAS.md under "Parked: manual".

## Files

| File | What it is | Who edits it |
|---|---|---|
| `src/app.html` | The whole app. The only source file. | Every run |
| `tools/build.py` | `src/app.html` → `preview/index.html`. `--promote` copies preview → live `index.html`. | Rarely |
| `tests/smoke.js` | End-to-end test with all network mocked. Must pass. | Add checks, never remove or weaken |
| `loop/backlog.json` | Prioritized features. Change `passes`, `notes`, add new items. Don't delete items. | Every run |
| `loop/PROGRESS.md` | Append-only log, newest at the bottom. | Every run |
| `loop/IDEAS.md` | Hypothetical additions. New ideas go here, not straight into code. | When inspired |
| `preview/index.html` | Built preview, served at /Pixel-pilot/preview/ | Built by build.py |
| `index.html` | **The live app.** Only changes when Chance says "promote". | Promote only |

## One run, step by step

1. **Orient (5 min).** Read the last 3 entries of `loop/PROGRESS.md`, all of `loop/backlog.json`, and `git log --oneline -15`.
2. **Verify the baseline.** Run `python3 tools/build.py` and `NODE_PATH=$(npm root -g) node tests/smoke.js`. If anything fails, fixing it **is** this run's task. Don't start new features on a red baseline.
3. **Pick exactly one task.** The task is either the highest-priority backlog item with `"passes": false` whose `needs` are met, or a bug or rubric weakness you saw in the screenshots. Search the code first to confirm it isn't already partly built.
4. **Build it** in `src/app.html`. Match the existing style: the pixel art, the chrome Y2K look, Pip reacting to the new data, every tap getting an animation, and Pip explaining any stat that's tapped (`data-say` + `about()`).
5. **Test it like a user.** Add checks for the feature to `tests/smoke.js`, including a mock for any new API. Rebuild, run the suite and **look at the screenshots** in `tests/out/`. Check iPad landscape (1180×740) and phone landscape (844×390).
6. **Score it** against the rubric below. Keep the change only if all tests pass and no rubric line got worse. Otherwise `git checkout -- src/app.html` and log what you learned instead.
7. **Commit and push to `main`**, but only `src/`, `preview/`, `tests/`, `loop/` and `README.md`. Never touch `index.html` unless Chance said to promote. The message should say what changed and why.
8. **Write it down.** Append a PROGRESS entry (date, task, result, score, what's next). Update `backlog.json`, and add any ideas you had to `IDEAS.md`.
9. **Report** to Chance in 3–5 lines: what's new in the preview, the preview link, anything he must do (like a setup step), and "say *promote* to make it live."

Budget: one feature per run. If a feature is too big, split it in the backlog and do the first slice.

## Promote (only when Chance asks)

User-requested features built in a live conversation with Chance may go straight to live once tests pass. Scheduled runs always stop at preview.


`python3 tools/build.py --promote`, then commit and push. The live app's self-updater picks it up on the iPad within minutes.

## Rubric (score 1–5 each, log the scores)

- **Works:** `tests/smoke.js` is green, there are no console errors, and the app degrades gracefully offline, inside the Claude artifact sandbox, and with expired sign-ins.
- **Automatic:** it works with zero routine input after setup. Score 1 if it needs daily taps or typing; such a feature is discarded.
- **Useful:** it surfaces something Chance would act on, or wants to see at a glance.
- **Delight:** Pip reacts to it with animation and personality, and every action is animated.
- **Clarity:** it's readable at arm's length and at phone size, with no clipped text and no horizontal scroll.
- **Resilience:** network errors retry, sign-ins renew themselves where the provider allows, and state survives reloads.
- **Privacy:** no tokens, email content or personal data in the repo. Client IDs are fine because they're public. Data stays on the device.
- **Performance:** 60 fps on an iPad, no heavy work on hidden tabs, and polling no faster than the data changes.

## Hard rules

- Single file. Libraries come only from pinned CDN URLs. No build step beyond `tools/build.py`.
- Never commit secrets: API keys, client secrets or tokens. If a feature needs a secret, put it in IDEAS.md under "needs a relay" instead of building it.
- Don't delete or weaken existing tests.
- Respect `prefers-reduced-motion`.
- Sign-in redirect URIs must work for both `/Pixel-pilot/` and `/Pixel-pilot/preview/`.
- Pip's lines: plain, friendly and short. No emoji.
- No routine manual input (see Goal). When picking a task, prefer ones that work on the iPad today over ones that need hardware Chance hasn't confirmed he has.
