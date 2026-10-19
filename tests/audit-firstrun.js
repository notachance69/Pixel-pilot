// Ad-hoc UX audit: screenshots of a brand-new user's first minute (not part of the smoke suite).
const path = require("path"); const fsx = require("fs");
const src = fsx.readFileSync(path.join(__dirname, "smoke.js"), "utf8").replace("const fs = require('fs'), path = require('path');", "var fs = fsx;").split('(async () => {')[0];
const OUTDIR = process.argv[3] || path.join(__dirname, 'out', 'audit');
eval(src.replace(/^const /gm, "var ").replace("var OUT = path.join(__dirname, 'out');", "var OUT = OUTDIR;"));
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  for (const [name, vp] of [['ipad', { width: 1180, height: 740 }], ['phone', { width: 844, height: 390 }]]) {
    const ctx = await browser.newContext({ viewport: vp, geolocation: { latitude: 34.24, longitude: -118.53 }, permissions: ['geolocation'] });
    const page = await ctx.newPage(); await mock(page);
    await page.goto('file://' + PAGE); 
    for (const s of [1500, 4000, 9000]) { await page.waitForTimeout(s === 1500 ? 1500 : s - 1500); await page.screenshot({ path: path.join(OUTDIR, `${name}-t${s}.png`) }); }
    for (const tab of ['brief', 'inbox', 'music', 'gym', 'iss', 'car']) {
      if (!(await page.$('#tab-' + tab))) continue;
      await page.click('#tab-' + tab); await page.waitForTimeout(900);
      await page.screenshot({ path: path.join(OUTDIR, `${name}-${tab}.png`) });
    }
    await page.click('#setBtn'); await page.waitForTimeout(600); await page.screenshot({ path: path.join(OUTDIR, `${name}-settings.png`), fullPage: true });
    await ctx.close();
  }
  await browser.close();
})();
