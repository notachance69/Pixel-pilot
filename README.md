# Pixel Pilot

Pip is an animated pixel emoticon assistant that shows live local weather, the sun and moon, and real stats from the device you open it on. Pip's mood changes with the weather, and every tap gets an animation.

**Live page:** https://notachance69.github.io/Pixel-pilot/

**What's on it:** live weather and a 12-hour forecast, the sun and moon, device stats, Spotify now playing (with controls), and a live ISS tracker with pass predictions for your location.

Open it in Safari on an iPad or phone, turn the device sideways, and tap **Use my location** (or search a city). Add it to your Home Screen to run it full-screen.

## Data sources
- Weather, forecast, sunrise and sunset: [Open-Meteo](https://open-meteo.com) (free, no key)
- Place name from your location: BigDataCloud reverse geocoding (free client endpoint)
- Spotify now playing: Spotify Web API (sign in with your own developer app's Client ID; Premium required)
- ISS orbit: TLE from wheretheiss.at (CelesTrak fallback), propagated in the browser with satellite.js
- World map: Natural Earth land via world-atlas
- Moon phase, frame rate, screen size, CPU cores, ping and uptime are computed on the device

Everything is one self-contained `index.html`. Your chosen location is saved only in your browser.
