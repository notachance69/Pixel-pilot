# Pixel Pilot

Pip is an animated pixel emoticon assistant that shows live local weather, the sun and moon, and real stats from the device you open it on. Pip's mood changes with the weather, and every tap gets an animation.

**Live page:** https://notachance69.github.io/Pixel-pilot/

**What's on it:** a Brief of your day, a Gmail inbox that flags what matters, live weather and a 12-hour forecast, the sun and moon, device stats, Spotify now playing (with controls), and a live ISS tracker with pass predictions for your location.

Open it in Safari on an iPad or phone, turn the device sideways, and tap **Use my location** (or search a city). Add it to your Home Screen to run it full-screen.

## Data sources
- Weather, forecast, sunrise and sunset: [Open-Meteo](https://open-meteo.com) (free, no key)
- Place name from your location: BigDataCloud reverse geocoding (free client endpoint)
- Spotify now playing: Spotify Web API (sign in with your own developer app's Client ID; Premium required)
- ISS orbit: TLE from wheretheiss.at (CelesTrak fallback), propagated in the browser with satellite.js
- World map: Natural Earth land via world-atlas
- Moon phase, frame rate, screen size, CPU cores, ping and uptime are computed on the device

Everything is one self-contained `index.html`. Your chosen location is saved only in your browser.

## Connect Gmail (one-time, about 10 minutes)

Pixel Pilot reads Gmail **read-only** in your browser. Nothing goes through a server, and emails are never stored in this repo.

1. Go to [console.cloud.google.com](https://console.cloud.google.com), create a project called **Pixel Pilot**.
2. **APIs & Services → Library →** search **Gmail API** → Enable.
3. **Google Auth Platform → Branding / Audience:** app name *Pixel Pilot*, your email as support contact, audience **External**, then add your own Gmail address under **Test users**.
4. **Data access → Add scopes:** `https://www.googleapis.com/auth/gmail.readonly`.
5. **Clients → Create client → Web application.**
   - Authorized JavaScript origins: `https://notachance69.github.io`
   - Authorized redirect URIs: `https://notachance69.github.io/Pixel-pilot/` **and** `https://notachance69.github.io/Pixel-pilot/preview/`
6. Copy the **Client ID** (ends in `.apps.googleusercontent.com`), open Pixel Pilot → **Settings** → paste it → **Connect**.
   Google will warn that the app isn't verified. That's expected for your own test app: tap **Continue**.

## Talk to Pip

Type (or tap the keyboard mic and speak) in the box under Pip:

- "hide job emails" / "show job emails". Works for bills, deadlines, travel, deliveries, security codes, promos, newsletters and social.
- "mute emails from linkedin" / "unmute emails from linkedin"
- "hide emails about crypto"
- "make mom a VIP", "flag emails about escrow"
- "only show unread", "set my gym goal to 3", "sound on", "open gym"
- "what are my rules", "reset my rules", "help"
- Questions: "will it rain?", "any new emails?", "when's the ISS?", "what song is this?"

Rules live on your device. See or remove them in Settings → Rules you told Pip.

## Gym days from 24 Hour Fitness

Pixel Pilot has no direct line to 24 Hour Fitness, so it reads your gym days from Gmail (connect Gmail first).

**Your history:** in the 24GO app, open **Check-In History** and choose **email yourself a report**. Pip finds it in Gmail and fills in the heatmap.

**Automatic from now on (optional, iPhone):**
1. Open **Shortcuts → Automation → + → App**, choose **24GO**, tick **Is Opened**, and pick **Run Immediately**.
2. Add the action **Send Email**: To = your Gmail, Subject = `Pixel Pilot gym check-in`. Expand the action and turn **Show Compose Sheet** off.
3. Optional Gmail filter: subject `Pixel Pilot gym check-in` → Skip the Inbox. Pip still finds them.

Every time you open 24GO to scan in, the day is logged. You can also tap **I WENT TODAY**, or tap any day on the map to mark or unmark it.

## How it gets built

See [`loop/LOOP.md`](loop/LOOP.md). Every change goes through `src/app.html` → `preview/` → tests → and only reaches the live page when promoted.
Preview: https://notachance69.github.io/Pixel-pilot/preview/
