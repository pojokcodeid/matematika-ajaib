#!/usr/bin/env node
/* shot.js — utilitas dev: ambil screenshot layar Peta Petualangan.
   Jalankan: node test/shot.js [fileKeluaran.png] */
'use strict';

const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const CDP_PORT = 9444;
const OUT = path.resolve(process.argv[2] || path.join(os.tmpdir(), 'peta-petualangan.png'));
const W = parseInt(process.argv[3] || '900', 10) || 900;
const H = parseInt(process.argv[4] || '2000', 10) || 2000;

if (!fs.existsSync(CHROME)) { console.error('Chrome tidak ada'); process.exit(1); }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function getJSON(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let b = '';
      res.on('data', (c) => { b += c; });
      res.on('end', () => { try { resolve(JSON.parse(b)); } catch (e) { reject(e); } });
    }).on('error', reject);
  });
}

class CDP {
  constructor(ws) { this.ws = ws; this.id = 0; this.waiting = new Map();
    ws.addEventListener('message', (ev) => {
      let m; try { m = JSON.parse(ev.data); } catch (e) { return; }
      if (m.id && this.waiting.has(m.id)) {
        const s = this.waiting.get(m.id); this.waiting.delete(m.id); clearTimeout(s.timer);
        m.error ? s.reject(new Error(m.error.message)) : s.resolve(m.result);
      }
    });
  }
  send(method, params) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { this.waiting.delete(id); reject(new Error(method + ' timeout')); }, 30000);
      this.waiting.set(id, { resolve, reject, timer });
      this.ws.send(JSON.stringify({ id, method, params: params || {} }));
    });
  }
  eval(body) {
    return this.send('Runtime.evaluate', {
      expression: '(async function(){' + body + '})()',
      returnByValue: true, awaitPromise: true
    }).then((r) => {
      if (r.exceptionDetails) throw new Error((r.exceptionDetails.exception || {}).description || 'eval gagal');
      return r.result.value;
    });
  }
}

(async function main() {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'ma-shot-'));
  const chrome = require('child_process').spawn(CHROME, [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--no-first-run',
    '--no-default-browser-check', '--disable-extensions', '--mute-audio',
    '--allow-file-access-from-files',
    '--remote-debugging-port=' + CDP_PORT, '--user-data-dir=' + profile,
    'about:blank'
  ], { stdio: 'ignore' });

  let cdp = null;
  try {
    let page = null;
    for (let i = 0; i < 80 && !page; i++) {
      try {
        const t = await getJSON('http://127.0.0.1:' + CDP_PORT + '/json/list');
        page = t.find((x) => x.type === 'page' && x.webSocketDebuggerUrl);
      } catch (e) { /* belum siap */ }
      if (!page) await sleep(250);
    }
    if (!page) throw new Error('DevTools tidak tersedia');
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((res, rej) => {
      ws.addEventListener('open', res, { once: true });
      ws.addEventListener('error', () => rej(new Error('WS gagal')), { once: true });
    });
    cdp = new CDP(ws);
    await cdp.send('Runtime.enable');
    await cdp.send('Page.enable');
    await cdp.send('Page.addScriptToEvaluateOnNewDocument', {
      source: `window.__shotErrors = [];
        window.addEventListener('error', function (e) { window.__shotErrors.push('ERROR: ' + e.message); });
        window.addEventListener('unhandledrejection', function (e) { window.__shotErrors.push('REJECT: ' + e.reason); });`
    });
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: W, height: H, deviceScaleFactor: 1, mobile: W < 600
    });

    await cdp.send('Page.navigate', { url: 'file://' + path.join(ROOT, 'index.html') });

    // tunggu boot
    for (let i = 0; i < 120; i++) {
      await sleep(200);
      const s = await cdp.eval(`var l = document.getElementById('loader');
        return l ? l.className : 'NO';`);
      if (/\bhide\b/.test(s)) break;
    }

    // mainkan Bab 1 sempurna supaya penanda & jalur terlihat berprogress
    await cdp.eval(`
      var DB = window.MG.db, Game = window.MG.game;
      Game.start(1, 'adv');
      while (!Game.state().finished) {
        var q = Game.beginQuestion();
        Game.answer(q.answerIndex, false);
        if (!Game.state().finished) Game.nextQuestion();
      }
      DB.recordAttempt(Game.summary());
      DB.saveNow();
      return 'ok';
    `);

    await cdp.eval(`window.MG.ui.show('levels');
      await new Promise(function (r) { setTimeout(r, 200); });
      var b = document.querySelector('#track-tabs button[data-track="adv"]');
      b.click();
      await new Promise(function (r) { setTimeout(r, 900); });
      return 'tab adv dibuka';`);

    const info = await cdp.eval(`
      var m = document.getElementById('adv-map');
      return {
        hidden: m.hidden,
        nodes: m.querySelectorAll('.map-node').length,
        current: !!m.querySelector('.map-node.current'),
        done: m.querySelectorAll('.map-node .node-check').length,
        trails: m.querySelectorAll('.map-trail path').length,
        scrollY: Math.round(window.scrollY),
        errors: (window.__shotErrors || []).slice(0, 5)
      };`);
    console.log('peta:', JSON.stringify(info));

    const shot = await cdp.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: true,
      clip: { x: 0, y: 0, width: W, height: H, scale: 1 }
    });
    fs.writeFileSync(OUT, Buffer.from(shot.data, 'base64'));
    console.log('screenshot tersimpan:', OUT);
  } finally {
    try { chrome.kill('SIGKILL'); } catch (e) { /* */ }
    try { fs.rmSync(profile, { recursive: true, force: true }); } catch (e) { /* */ }
    process.exit(0);
  }
})().catch((e) => { console.error('GAGAL:', e.message); process.exit(1); });
