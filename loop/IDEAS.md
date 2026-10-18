# Ideas for the hub

Hypothetical additions, roughly ranked by usefulness against effort. Tags say what each needs:

- **[free]** a public API with no key
- **[google]** reuses the Google sign-in
- **[device]** a browser sensor
- **[relay]** a secret key, so it needs a small Cloudflare Worker
- **[hw]** hardware

Promote an idea by adding it to `backlog.json` with acceptance criteria.

## Personal assistant
- **Calendar countdown [google].** Next meeting, travel time to it, Pip pings 10 minutes before. *(in backlog)*
- **Job search pipeline [google].** Auto-built from recruiter and ATS emails: company, stage, days since last reply, nudges to follow up. *(in backlog)*
- **Bills radar [google].** Due dates parsed from bill emails, a "3 days left" countdown, Pip's stern face when overdue. *(in backlog)*
- **Package tracker [google].** "Out for delivery" from shipping emails; Pip carries a little box. *(in backlog)*
- **Morning brief at a set time.** Pip reads the brief automatically at 7:30 AM when the iPad is awake on its stand. Needs a wake lock and a quiet-hours setting.
- **Reply drafts [relay].** Tap an email and Pip drafts a short reply with Claude, which you send from Gmail. Needs an API key behind a relay.
- **To-do capture.** Say or type "remind me…" and it shows on the Brief. Local storage first, Google Tasks later.
- **Focus timer.** 25/5 pomodoro, Pip wears headphones and tracks a streak. *(in backlog)*

## Car (the Honda Fit build)
- **Live OBD-II gauges [hw].** BLE dongle plus Android Chrome; speed, RPM, coolant, MPG, range. *(in backlog)*
- **Driving mode.** Huge calm gauges, only critical alerts, no taps needed above 5 mph. *(in backlog)*
- **Trip log.** Every drive saved with distance, average MPG and top speed, plus a weekly fuel-cost estimate.
- **Maintenance reminders.** Oil change every N miles from the odometer you enter, tire rotation, registration date.
- **Track-day page (Miata).** G-force circle from phone motion sensors, lap timer by GPS.
- **Parked-car finder.** Saves GPS when the car disconnects; Pip points home.

## Home and garage
- **ADU project board.** Permit status, inspection dates, budget versus spend, contractor contacts. Feeds the Brief.
- **Air quality and fire smoke [free].** AQI, Pip mask mood, red-flag warnings for the San Fernando Valley. *(in backlog)*
- **Earthquake feed [free].** USGS, nearby M3+ with distance and a shake animation. *(in backlog)*
- **Smart home [relay or hw].** Home Assistant entities (garage door, lights, temperature) as tappable tiles.
- **Package-at-door camera [hw].** A frame from a doorbell camera when motion triggers.

## Projects
- **Robot arm console [hw].** Pip talks to the 6-DOF arm's local server over WebSocket: joint angles, servo temperatures, a camera snapshot and a "home" button.
- **Matcha cart dashboard.** Daily sales tally, inventory (matcha tins, milk, cups), weather-based demand guess, events calendar.
- **Learning tracker.** Certification study streak, next exam date, flashcard of the day.

## Health and fitness
- **Gym streak.** Tap to log a workout, weekly split view, and Pip flexes when you hit your weekly goal.
- **Water and steps [device].** Steps from phone motion where available; otherwise manual taps.

## Money
- **Watchlist [free/relay].** A few tickers or crypto with sparkline trends; Pip reacts to big moves.
- **Monthly spend snapshot [google].** Totals parsed from receipt emails by category.

## Fun and polish
- **Mic visualizer [device].** The equalizer bars follow the room's music; Pip dances on the beat.
- **Tilt Pip [device].** Pip rolls around when you tilt the iPad.
- **Night dim.** Auto-dim after sunset for the car or the nightstand. *(in backlog)*
- **Pip outfits.** Seasonal or holiday costumes, unlocked by streaks.
- **Swappable sprites.** Drop in PixelLab or Retro Diffusion sprite sheets for Pip's moods.

- Calendar: tap an event row to open it in Google Calendar; "leave now" heads-up using travel time to the event's location; show tomorrow's first event at night.

- Job tracker: recruiters on an ATS with no company in the subject group under their own name (e.g. "Dana Lee"). Could read the signature or the job title from the body (needs format=full, heavier). Also: "mark as not a job" per company, and a weekly "applications sent" count.
