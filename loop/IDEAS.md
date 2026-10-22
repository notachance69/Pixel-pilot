# Ideas for the hub

These are for an ordinary person's day: things most people deal with, filled in automatically from data they already have.

**Rules:**
- **Automatic.** Manual input is only for one-time setup or corrections.
- **Natural.** New things show up on Today and in Ask Pip first. A new tab is only for something you'd browse.
- **Optional.** Niche things are modules the person switches on.

Each idea names its automatic source with a tag:
- **[google]** the Google sign-in (Gmail, Calendar, Tasks)
- **[free]** a public feed, no key
- **[device]** a browser or phone sensor
- **[shortcut]** an iOS Shortcuts automation, set up once, that runs by itself
- **[relay]** a secret key, so it needs a small Cloudflare Worker
- **[hw]** hardware

Promote an idea by adding it to `backlog.json` with acceptance criteria.

## Every day (core)
- **Bills and due dates [google].** Due dates and amounts from bill emails. A payment-confirmation email marks the bill paid. *(built in preview 2026-10-20)* Next: read the full email body when the preview text has no date; group a payee's different sending domains (billing@ vs payments@); a "bills this month" total on Today.
- **Deliveries [google].** "Arriving today" and "delivered" from shipping emails, advancing as new emails arrive. *(built in preview 2026-10-21)* Next: a carrier tracking feed behind a relay for live scan events; "porch pirate" heads-up if a delivered package sits for hours after dark (needs a doorbell feed).
- **Leave-on-time [google][free].** The next event with a location gets a travel-time estimate and a "leave in 10 min" heads-up.
- **Subscriptions and renewals [google].** Recurring charges found in receipts, plus "renews in 3 days" alerts and a monthly total.
- **Appointments and reservations [google].** Doctor, dentist, haircut, restaurant and flight confirmations pulled from email onto Today, even if they never made it to the calendar.
- **Travel day [google].** Flight, hotel and car confirmations become a trip card with check-in time, gate changes from airline emails, and the weather at the destination.
- **To-dos without typing [google].** Starred emails, Google Tasks, and anything with "please send" or "by Friday" in an important email.
- **Morning and evening brief [device].** Pip reads Today at a set time when the device is awake. The evening version previews tomorrow.
- **Reply drafts [relay].** Pip suggests a short reply to important emails, and you send it from Gmail.

## Home and surroundings
- **Air quality and smoke [free].** *(built 2026-10-22, preview)* Next: pollen (Open-Meteo has alder/birch/grass/ragweed for Europe only; US needs another source) and a UV + AQI "good time to be outside" window.
- **Severe weather alerts [free].** *(in backlog)*
- **Earthquakes [free].** *(in backlog; useful mostly on the West Coast, so it's a module)*
- **Trash and recycling day.** Set once, with a reminder the night before. Some cities have open APIs.
- **Sun, pollen and UV [free].** Pollen from Open-Meteo, and "sunscreen" and "allergy" tips on Today.
- **Smart home [relay or hw].** Home Assistant states (doors, lights, thermostat) as tiles.

## Health and habits (modules)
- **Activity, sleep and workouts [shortcut].** A nightly iOS Shortcut exports Apple Health totals, and Pip charts the week.
- **Gym visits [google][shortcut].** *(built: check-in emails plus a one-time iOS automation)* Generalize beyond 24 Hour Fitness to any gym that sends check-in emails.
- **Medication and refill reminders [google].** Refill-ready emails from the pharmacy.

## Money (modules)
- **Subscription audit [google].** From the bills list: every renewal Pip has seen, monthly total, and which ones went up in price.
- **Spending snapshot [google].** Totals from receipt and order emails by category.
- **Watchlist [free/relay].** A few stocks or crypto, and Pip reacts to big moves.

## Car (module)
- **Live gauges [hw].** *(built in preview; Android Chrome plus a BLE OBD adapter)*
- **MPG and range [hw].** Fill-ups auto-detected from the fuel sensor. *(in backlog)*
- **Driving mode [hw].** Switches on by itself above 5 mph. *(in backlog)*
- **Trip log, maintenance due and check-engine explainer [hw][google].**
- **Parked-car finder [device].** Saves GPS when the car's Bluetooth disconnects.

## Career (module)
- **Job search pipeline [google].** *(built in preview)* Applications by company and stage, and "your reply" nudges.

## Fun and polish
- **Night dim [free].** Auto-dims after sunset. *(in backlog)*
- **Mic visualizer [device].** The equalizer follows the room's music.
- **Tilt Pip [device].** Pip rolls when the device tilts.
- **Pip outfits.** Seasonal costumes, unlocked by streaks.
- **Swappable sprites.** PixelLab or Retro Diffusion sprite sheets.
- **Space station passes [free].** *(built; becomes a module)*

## Flow and polish backlog (UX)
- A setup checklist on Today until everything the person chose is connected.
- Undo for Ask Pip rule changes ("undo that").
- A "What can Pip do?" sheet with tappable examples, generated from the enabled modules.
- Swipe between tabs on touch screens.
- A haptic and sound theme picker (quiet, classic, arcade).

## Parked: manual
These need routine input, so they don't get built unless an automatic source turns up.
- **Focus timer:** revisit if it can start from calendar focus blocks.
- **Manual water and step logging:** replaced by the Apple Health Shortcut.
- **Manual to-do capture:** replaced by "To-dos without typing".
