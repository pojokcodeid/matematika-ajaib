/* ============================================================
 *  Leaderboard.gs  —  Papan peringkat Magic Math di Google Sheets
 *
 *  Skrip ini menggantikan server.js untuk versi yang di-hosting
 *  statis (GitHub Pages). Game tinggal melakukan GET/POST ke URL
 *  Web App ini, jadi tidak perlu server yang selalu menyala.
 *
 *  CARA PAKAI (sekali saja, sekitar 5 menit)
 *  -----------------------------------------
 *   1. Buka https://script.google.com  ->  New project (Blank).
 *   2. Ganti isi Code.gs dengan berkas ini.
 *   3. Klik Run -> fungsi "setup" -> izinkan akses (Advanced ->
 *      Go to project -> Allow). Skrip membuat spreadsheet sendiri
 *      dan menyalin ID-nya ke Script Properties.
 *      (Mau pakai spreadsheet sendiri? Isi SPREADSHEET_ID di bawah.)
 *   4. Deploy -> New deployment -> Type: Web app
 *        Execute as        : Me
 *        Who has access    : Anyone
 *      -> Deploy -> salin URL yang berakhiran /exec.
 *   5. Tempel URL itu ke assets/js/config.js:
 *        LEADERBOARD_API: 'https://script.google.com/macros/s/XXXX/exec'
 *
 *  Skrip ini tidak menyimpan progres game — hanya baris papan
 *  peringkat. Progres tetap di perangkat masing-masing (IndexedDB).
 * ============================================================ */

/** Kosongkan bila ingin skrip membuat spreadsheet sendiri saat setup(). */
var SPREADSHEET_ID = '';

var SHEET_NAME = 'Leaderboard';
var COLS = ['uid', 'name', 'avatar', 'grade', 'stars', 'cleared',
  'score', 'accuracy', 'plays', 'points', 'updated_at'];

/* ---------- Util ---------- */

function num_(v) {
  var n = parseFloat(v);
  return isFinite(n) ? n : 0;
}

/** Poin persis seperti server.js: bintang paling berbobot. */
function points_(r) {
  return Math.round(num_(r.stars) * 10000 + num_(r.cleared) * 100 +
    Math.round(num_(r.accuracy) * 100));
}

function cmp_(a, b) {
  return (b.points - a.points) || (b.stars - a.stars) ||
    String(a.name).localeCompare(String(b.name));
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function ss_() {
  if (SPREADSHEET_ID) return SpreadsheetApp.openById(SPREADSHEET_ID);

  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('SPREADSHEET_ID');
  if (id) {
    try { return SpreadsheetApp.openById(id); } catch (e) { /* dibuat ulang */ }
  }
  var created = SpreadsheetApp.create('Magic Math — Leaderboard');
  props.setProperty('SPREADSHEET_ID', created.getId());
  return created;
}

function sheet_() {
  var sh = ss_().getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss_().insertSheet(SHEET_NAME);
    sh.appendRow(COLS);
  } else if (sh.getLastRow() === 0) {
    sh.appendRow(COLS);
  }
  return sh;
}

/** Jalankan sekali: menyiapkan tab "Leaderboard" lalu kembalikan URL sheet. */
function setup() {
  sheet_();
  return 'Siap: ' + ss_().getUrl();
}

function readRows_() {
  var values = sheet_().getDataRange().getValues();
  if (values.length < 2) return [];

  var head = values[0];
  var idx = {};
  COLS.forEach(function (c) { idx[c] = head.indexOf(c); });

  var out = [];
  for (var i = 1; i < values.length; i++) {
    var v = values[i];
    var r = {};
    COLS.forEach(function (c) { r[c] = idx[c] >= 0 ? v[idx[c]] : ''; });
    if (!r.uid) continue;
    r.grade = Math.max(1, Math.min(6, Math.round(num_(r.grade)) || 1));
    r.points = points_(r);
    out.push(r);
  }
  return out;
}

function rankOf_(rows, uid) {
  if (!uid) return 0;
  for (var i = 0; i < rows.length; i++) if (rows[i].uid === uid) return i + 1;
  return 0;
}

/* ---------- API: dibaca oleh game (GET) ---------- */

function doGet(e) {
  var p = (e && e.parameter) || {};

  // dipakai game untuk memastikan benar-benar ada backend
  if (p.action === 'ping') return json_({ ok: true, app: 'Magic Math' });

  try {
    var rows = readRows_().sort(cmp_);
    var total = rows.length;
    var limit = Math.max(1, Math.min(100, parseInt(p.limit, 10) || 20));
    var uid = String(p.uid || '');

    var out = rows.slice(0, limit).map(function (r, i) {
      return {
        rank: i + 1,
        uid: r.uid,
        name: r.name,
        avatar: r.avatar,
        grade: r.grade,
        stars: r.stars,
        cleared: r.cleared,
        score: r.score,
        accuracy: r.accuracy,
        plays: r.plays,
        points: r.points
      };
    });

    return json_({ rows: out, rank: rankOf_(rows, uid), total: total });
  } catch (err) {
    return json_({ rows: [], rank: 0, total: 0, error: String(err) });
  }
}

/* ---------- API: dikirim oleh game (POST) ---------- */

function doPost(e) {
  try {
    var data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var uid = String(data.uid || '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 40);
    if (!uid) return json_({ ok: false, reason: 'uid tidak valid' });

    var row = {
      uid: uid,
      name: String(data.name || 'Player').slice(0, 24),
      avatar: String(data.avatar || '\uD83D\uDE42').slice(0, 8),
      grade: Math.max(1, Math.min(6, Math.round(num_(data.grade)) || 1)),
      stars: Math.max(0, Math.round(num_(data.stars))),
      cleared: Math.max(0, Math.round(num_(data.cleared))),
      score: Math.max(0, Math.round(num_(data.score))),
      accuracy: Math.max(0, Math.min(1, num_(data.accuracy))),
      plays: Math.max(0, Math.round(num_(data.attempts != null ? data.attempts : data.plays))),
      updated_at: new Date().toISOString()
    };
    row.points = points_(row);

    var sh = sheet_();
    var values = sh.getDataRange().getValues();
    var uidCol = COLS.indexOf('uid');
    var target = -1;

    for (var i = 1; i < values.length; i++) {
      if (String(values[i][uidCol]) === uid) { target = i + 1; break; }
    }

    if (target > 0) {
      // jangan turunkan rekor: ambil nilai terbaik yang pernah tercatat
      var old = {};
      COLS.forEach(function (c, ci) { old[c] = values[target - 1][ci]; });
      row.stars = Math.max(num_(old.stars), row.stars);
      row.cleared = Math.max(num_(old.cleared), row.cleared);
      row.score = Math.max(num_(old.score), row.score);
      row.points = points_(row);

      var line = COLS.map(function (c) { return row[c]; });
      sh.getRange(target, 1, 1, COLS.length).setValues([line]);
    } else {
      sh.appendRow(COLS.map(function (c) { return row[c]; }));
    }

    var rows = readRows_().sort(cmp_);
    return json_({ ok: true, uid: uid, rank: rankOf_(rows, uid) });
  } catch (err) {
    return json_({ ok: false, reason: String(err) });
  }
}
