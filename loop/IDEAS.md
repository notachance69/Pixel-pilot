# Ideas for the hub

**Rule: automatic, not manual.** Every idea must fill itself from data Chance already produces. Manual input is only allowed as one-time setup or a correction. Each idea names its **automatic source**.

Tags:
- **[google]** uses the Google sign-in (Gmail, Calendar, Tasks)
- **[free]** a public feed, no key
- **[device]** a browser or phone sensor
- **[shortcut]** an iOS Shortcuts automation, set up once, that runs on its own and emails or posts data
- **[relay]** needs a secret key, so it needs a small Cloudflare Worker
- **[hw]** hardware

Promote an idea by adding it to `backlog.json` with acceptance criteria.

## Personal assistant
- **Bills radar [google].** Due dates and amounts parsed from bill emails. A payment-confirmation email marks the bill paid. *(in backlog)*
- **Package tracker [google].** Status from shipping emails, advancing as new ones arrive. *(in backlog)*
- **Subscriptions and spend [google].** Monthly totals and recurring charges from receipt and order emails, plus "this renews in 3 days" alerts.
- **Calendar extras [google].**
  - "Leave now" alert from the event's location plus travel time.
  - Tomorrow's first event shown at night.
  - Tap an event to open it.
- **Job tracker extras [google].**
  - A weekly "applications sent" count, from confirmation emails.
  - Company names read from recruiter signatures.
  - A one-time "not a job" correction per company.
- **Tasks from email [google].** Starred emails and Google Tasks show in the Brief, with nothing typed into Pixel Pilot itself.
- **Morning brief at a set time [device].** Pip reads the brief at 7:30 AM when the iPad is awake on its stand (wake lock plus quiet hours).
- **Reply drafts [relay].** Pip drafts a short reply with Claude for important emails, which you send from Gmail.

## Car (the Honda Fit build)
- **Live OBD-II gauges [hw].** *(built in preview; Android Chrome plus a BLE adapter)*
- **MPG and range [hw].** From the MAF and fuel-level sensors. Fill-ups are detected automatically, so there's no "filled up" button. *(in backlog)*
- **Driving mode [hw].** Switches on by itself above 5 mph. *(in backlog)*
- **Trip log [hw].** Every drive recorded automatically from engine on/off: distance, MPG, top speed and a weekly fuel cost.
- **Maintenance from mileage [hw][google].** Odometer from OBD distance; service history from dealer and shop emails; oil change due at N miles.
- **Check-engine explainer [hw].** Reads trouble codes (Mode 03) the moment the light comes on, and Pip explains them.
- **Parked-car finder [device].** Saves GPS when the car's Bluetooth disconnects.

## Home and garage
- **Air quality and fire smoke [free].** AQI from Open-Meteo, with Pip in a mask. *(in backlog)*
- **Weather alerts [free].** National Weather Service red flag, heat and wind alerts. *(in backlog)*
- **Earthquake feed [free].** USGS, M3+ within 100 mi. *(in backlog)*
- **ADU project board [google].** Permit status and inspection dates from LADBS and contractor emails and calendar events; spend from invoice emails.
- **Smart home [relay or hw].** Home Assistant states (garage door, lights, temperature) pushed live.

## Health and fitness
- **Gym days [google][shortcut].** *(built)* An iOS automation emails a check-in when the 24GO app opens, so nothing to tap.
- **Steps, sleep and workouts [shortcut].** A nightly Shortcut exports Apple Health totals by email, and Pip charts them.

## Projects and money
- **Robot arm console [hw].** Live joint angles and servo temperatures pushed over WebSocket from the arm's local server.
- **Matcha cart sales [relay].** Sales and inventory pulled from Square or Stripe, plus a weather-based demand guess.
- **Learning tracker [google].** Course progress and exam dates from course-platform and certification emails.
- **Watchlist [free/relay].** A few tickers with sparklines, and Pip reacts to big moves.

## Fun and polish (automatic by nature)
- **Night dim [free].** Auto-dims after sunset. *(in backlog)*
- **Mic visualizer [device].** The equalizer follows the room's music.
- **Tilt Pip [device].** Pip rolls when the iPad tilts.
- **Pip outfits.** Seasonal costumes, unlocked by streaks.
- **Swappable sprites.** PixelLab or Retro Diffusion sprite sheets.

## Parked: manual
These need routine input, so they don't get built unless an automatic source turns up.
- **Focus timer:** needs a start tap. Revisit if it can start from calendar focus blocks.
- **Manual water and step logging:** replaced by the Apple Health Shortcut idea.
- **Manual to-do capture:** replaced by "Tasks from email".
- **Tank-size "filled up" button:** replaced by fuel-level fill-up detection.
