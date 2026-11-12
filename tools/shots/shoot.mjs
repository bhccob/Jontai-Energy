// Headless screenshots and checks for verifying the site (development only, not shipped).
//
//   node tools/shots/shoot.mjs <url> <outPrefix> <width> <height> <targets>
//
// Targets run in order, comma-separated (a js= target may contain commas only inside parentheses or quotes; put it
// last or keep it comma-free when in doubt). Only t=, y= and selectors capture <outPrefix>-NN.jpg.
//   t=MS          wait until MS after the first navigation, then capture
//   wait=MS       wait
//   y=PX | sel    scroll there (through window.__lenis when present), wait 1.7s, capture
//   js=CODE       evaluate CODE in the page (promises awaited) and print the result; never navigate from here
//   reload        reload the page
//   go=PATH       navigate to PATH (relative to the url)
//   size=WxH      change the viewport without reloading
//   media=reduce  emulate prefers-reduced-motion: reduce, then reload
//   media=opaque  emulate prefers-reduced-transparency: reduce, then reload
//   nojs          disable page scripts, then reload
//   block=PATTERN block requests matching PATTERN (e.g. *\/_next/static/chunks/*), then reload
//   key=KEY       press a real key (e.g. key=Tab), so later focus counts as keyboard focus (:focus-visible)
//   hover=SEL     move the mouse to the middle of SEL (for :hover)
// Chrome comes from CHROME_PATH, or Playwright's Chromium under %LOCALAPPDATA%. Page exceptions print at the end.
import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

const CHROME = process.env.CHROME_PATH ?? join(process.env.LOCALAPPDATA ?? '', 'ms-playwright/chromium-1248/chrome-win64/chrome.exe');
const [url, out, w = '1440', h = '900', targets = 't=0'] = process.argv.slice(2);
if (!url || !out) {
  console.error('usage: node tools/shots/shoot.mjs <url> <outPrefix> <width> <height> <targets>');
  process.exit(2);
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Split on commas that are not inside (), [], {} or quotes, so js= code can hold its own commas.
function splitTargets(s) {
  const parts = [];
  let depth = 0, quote = '', cur = '';
  for (const ch of s) {
    if (quote) { if (ch === quote) quote = ''; cur += ch; continue; }
    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; cur += ch; continue; }
    if ('([{'.includes(ch)) depth++;
    if (')]}'.includes(ch)) depth--;
    if (ch === ',' && depth === 0) { parts.push(cur); cur = ''; continue; }
    cur += ch;
  }
  if (cur) parts.push(cur);
  return parts;
}

await mkdir(dirname(out), { recursive: true });
const port = 9400 + Math.floor(Math.random() * 400);
const profile = await mkdtemp(join(tmpdir(), 'shoot-'));
const proc = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, '--hide-scrollbars', '--no-first-run', '--no-default-browser-check', `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });

let list;
for (let i = 0; i < 50; i++) {
  try {
    list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    if (list.find((t) => t.type === 'page')) break;
  } catch {}
  await sleep(200);
}
const ws = new WebSocket(list.find((t) => t.type === 'page').webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let id = 0;
const pending = new Map();
const logs = [];
ws.addEventListener('message', (m) => {
  const msg = JSON.parse(m.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg);
    pending.delete(msg.id);
  }
  if (msg.method === 'Runtime.exceptionThrown') logs.push('EXCEPTION ' + (msg.params.exceptionDetails.exception?.description ?? msg.params.exceptionDetails.text));
  if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') logs.push('console.error ' + msg.params.args.map((a) => a.value ?? a.description).join(' '));
});
const send = (method, params = {}) => new Promise((resolve) => { const i = ++id; pending.set(i, resolve); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluate = async (expression) => {
  const r = await Promise.race([
    send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }),
    sleep(30000).then(() => ({ result: { exceptionDetails: { text: 'timed out after 30s' } } })),
  ]);
  return r.result?.exceptionDetails ? `ERROR ${r.result.exceptionDetails.exception?.description ?? r.result.exceptionDetails.text}` : r.result?.result?.value;
};
const shoot = async (file) => {
  const s = await send('Page.captureScreenshot', { format: 'jpeg', quality: 82 });
  await writeFile(file, Buffer.from(s.result.data, 'base64'));
};
const reload = async () => { await send('Page.reload', {}); await sleep(400); };

await send('Page.enable');
await send('Runtime.enable');
// Behave as the focused window, so focus/focusin events fire (headless pages are otherwise never focused).
await send('Emulation.setFocusEmulationEnabled', { enabled: true });
await send('Emulation.setDeviceMetricsOverride', { width: +w, height: +h, deviceScaleFactor: 1, mobile: false });
const t0 = Date.now();
// A fresh headless Chrome sometimes drops the first navigation and stays on about:blank: retry until the page is there.
for (let attempt = 1; ; attempt++) {
  const nav = await send('Page.navigate', { url });
  if (nav.result?.errorText) console.log(`navigate: ${nav.result.errorText}`);
  let there = false;
  for (let i = 0; i < 20 && !there; i++) {
    await sleep(250);
    there = (await evaluate('location.href')) !== 'about:blank';
  }
  if (there) break;
  if (attempt === 4) throw new Error(`could not open ${url}`);
}

let n = 0;
for (const target of splitTargets(targets)) {
  if (target.startsWith('t=')) {
    await sleep(Math.max(0, +target.slice(2) - (Date.now() - t0)));
    const file = `${out}-${String(++n).padStart(2, '0')}.jpg`;
    await shoot(file);
    console.log(file, target);
  } else if (target.startsWith('wait=')) {
    await sleep(+target.slice(5));
  } else if (target === 'reload') {
    await reload();
  } else if (target.startsWith('go=')) {
    await send('Page.navigate', { url: new URL(target.slice(3), url).href });
    await sleep(400);
  } else if (target.startsWith('js=')) {
    console.log('js →', JSON.stringify(await evaluate(target.slice(3))));
  } else if (target.startsWith('size=')) {
    const [sw, sh] = target.slice(5).split('x').map(Number);
    await send('Emulation.setDeviceMetricsOverride', { width: sw, height: sh, deviceScaleFactor: 1, mobile: false });
  } else if (target === 'media=reduce') {
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    await reload();
  } else if (target === 'media=opaque') {
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-transparency', value: 'reduce' }] });
    await reload();
  } else if (target.startsWith('key=')) {
    const key = target.slice(4);
    const vk = { Tab: 9, Enter: 13, Escape: 27 }[key] ?? 0;
    for (const type of ['keyDown', 'keyUp']) await send('Input.dispatchKeyEvent', { type, key, code: key, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
  } else if (target.startsWith('hover=')) {
    const at = await evaluate(`(() => { const r = document.querySelector(${JSON.stringify(target.slice(6))})?.getBoundingClientRect(); return r ? [r.left + r.width / 2, r.top + r.height / 2] : [0, 0] })()`);
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: at[0], y: at[1] });
  } else if (target.startsWith('block=')) {
    await send('Network.enable');
    await send('Network.setBlockedURLs', { urls: [target.slice(6)] });
    await reload();
  } else if (target === 'nojs') {
    await send('Emulation.setScriptExecutionDisabled', { value: true });
    await reload();
  } else {
    const y = target.startsWith('y=')
      ? +target.slice(2)
      : await evaluate(`(() => { const e = document.querySelector(${JSON.stringify(target)}); return e ? Math.round(e.getBoundingClientRect().top + scrollY) : 0 })()`);
    await evaluate(`(window.__lenis ? window.__lenis.scrollTo(${y}, { immediate: true, force: true }) : scrollTo(0, ${y})), dispatchEvent(new Event('scroll')), true`);
    await sleep(1700);
    const file = `${out}-${String(++n).padStart(2, '0')}.jpg`;
    await shoot(file);
    console.log(file, target, y);
  }
}
if (logs.length) console.log(logs.join('\n'));
ws.close();
proc.kill();
