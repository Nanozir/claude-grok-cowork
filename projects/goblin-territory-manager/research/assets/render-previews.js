// Renders PNG previews of the storyboard and a character/icon contact sheet.
// Output goes to ./previews/ (git-ignored: AGENTS.md keeps large assets out of the repo).
// Run: node render-previews.js   (needs Playwright)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const dir = __dirname;
  const out = path.join(dir, 'previews');
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1760, height: 1000 }, deviceScaleFactor: 2 });

  await page.goto('file://' + path.join(dir, 'first-session-flow.html'));
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(out, 'first-session-flow.png'), fullPage: true });

  const chars = fs.readdirSync(dir).filter(f => f.startsWith('char-') && f.endsWith('.svg'));
  const sprite = fs.readFileSync(path.join(dir, 'icons.svg'), 'utf8');
  const ids = [...sprite.matchAll(/<symbol id="([^"]+)"/g)].map(m => m[1]);
  const html = `<!doctype html><body style="margin:0;padding:24px;background:#15171c;color:#9aa1ad;font:13px system-ui">
    <div style="display:none">${sprite}</div>
    <div style="display:flex;gap:24px;align-items:flex-end">${chars.map(f =>
      `<figure style="margin:0;text-align:center"><img src="${f}" height="260"><figcaption>${f.replace('.svg', '')}</figcaption></figure>`).join('')}</div>
    <div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:24px">${ids.map(id =>
      `<div style="background:#1e2129;border:1px solid #343a47;border-radius:6px;padding:10px;text-align:center;width:110px">
        <svg width="16" height="16"><use href="#${id}"/></svg> <svg width="24" height="24"><use href="#${id}"/></svg> <svg width="48" height="48"><use href="#${id}"/></svg>
        <div>${id.replace('i-', '')}</div></div>`).join('')}</div></body>`;
  // Write the sheet next to the SVGs so relative <img> paths resolve, render it, then delete it.
  const tmp = path.join(dir, '_contact-sheet.tmp.html');
  fs.writeFileSync(tmp, html);
  await page.setViewportSize({ width: 1400, height: 600 });
  await page.goto('file://' + tmp);
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(out, 'contact-sheet.png'), fullPage: true });
  fs.unlinkSync(tmp);
  await browser.close();
  console.log('Wrote previews/first-session-flow.png and previews/contact-sheet.png');
})();
