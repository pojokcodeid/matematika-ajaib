/* ============================================================
 *  i18n.js  —  Dua bahasa: English (default) & Bahasa Indonesia
 *
 *  Paling penting: skrip ini dimuat PERTAMA (sebelum config.js),
 *  supaya setiap modul bisa memakai T('English text', 'Teks Indonesia')
 *  tepat saat file-nya dibaca.
 *
 *  Cara kerja:
 *    - T(en, id)  -> mengembalikan teks sesuai bahasa aktif.
 *    - Elemen HTML yang punya atribut data-id akan diganti isinya
 *      (teks asli di HTML dipakai sebagai versi Inggris).
 *    - Mengganti bahasa menyimpan pilihan lalu memuat ulang halaman,
 *      jadi semua teks (HTML statis maupun data di JS) ikut konsisten.
 * ============================================================ */
(function (global) {
  'use strict';

  var MG = global.MG = global.MG || {};

  var KEY = 'ma:lang';
  var DEFAULT = 'en';

  var lang = DEFAULT;

  /** Baca pilihan bahasa: localStorage dulu, lalu ?lang= di URL (cadangan). */
  function readStored() {
    try {
      var s = global.localStorage ? global.localStorage.getItem(KEY) : null;
      if (s === 'id' || s === 'en') return s;
    } catch (e) { /* file:// kadang menolak localStorage */ }
    try {
      var m = /[?&]lang=(id|en)\b/.exec((global.location && global.location.search) || '');
      if (m) return m[1];
    } catch (e) { /* abaikan */ }
    return null;
  }

  lang = readStored() || DEFAULT;

  /**
   * Teks sesuai bahasa aktif.
   * Selalu isi DUA argumen: T('English', 'Indonesia').
   */
  function T(en, id) {
    if (arguments.length < 2) {
      try { console.warn('[i18n] terjemahan hilang untuk: ' + en); } catch (e) { /* abaikan */ }
    }
    return lang === 'id' ? (id == null ? en : id) : en;
  }

  function current() { return lang; }

  /** Simpan pilihan bahasa lalu muat ulang halaman. */
  function set(next) {
    var v = (next === 'id') ? 'id' : 'en';
    var saved = false;
    try { global.localStorage.setItem(KEY, v); saved = true; } catch (e) { /* coba cara lain */ }

    // Cadangan bila localStorage tidak tersedia: simpan di ?lang= pada URL.
    if (!saved) {
      try {
        var loc = global.location;
        if (loc && global.history && global.history.replaceState && loc.pathname != null) {
          // buang ?lang= lama, lalu buang tanda ? di depan supaya tidak dobel
          var q = (loc.search || '')
            .replace(/[?&]lang=(id|en)\b&?/g, '')
            .replace(/^\?&/, '?')
            .replace(/[?&]$/, '')
            .replace(/^\?/, '');
          var url = loc.pathname + (q ? '?' + q + '&' : '?') + 'lang=' + v + (loc.hash || '');
          global.history.replaceState(null, '', url);
        }
      } catch (e) { /* abaikan */ }
    }

    if (v === lang) return v;
    if (global.location && global.location.reload) global.location.reload();
    return v;
  }

  function toggle() { return set(lang === 'en' ? 'id' : 'en'); }

  /**
   * Terapkan teks statis di HTML.
   * Elemen beratribut data-id: isi HTML aslinya disimpan sebagai versi
   * Inggris, lalu diganti dengan data-id bila bahasa aktif Indonesia.
   */
  function applyDom() {
    var d = global.document;
    if (!d) return;

    d.documentElement.lang = lang;

    var meta = d.querySelector('meta[name="description"]');
    if (meta) {
      if (meta.__en == null) {
        meta.__en = meta.getAttribute('content') || '';
        meta.__id = meta.getAttribute('data-id') || meta.__en;
      }
      meta.content = (lang === 'id') ? meta.__id : meta.__en;
    }

    var nodes = d.querySelectorAll('[data-id], [data-id-title]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.tagName === 'META') continue;

      // Judul tooltip (tombol ikon yang isinya hanya emoji)
      if (el.hasAttribute && el.hasAttribute('data-id-title')) {
        if (el.__enTitle == null) {
          el.__enTitle = el.getAttribute('title') || '';
          el.__idTitle = el.getAttribute('data-id-title') || el.__enTitle;
        }
        el.setAttribute('title', (lang === 'id') ? el.__idTitle : el.__enTitle);
      }

      if (!el.hasAttribute || !el.hasAttribute('data-id')) continue;

      // <input>/<textarea> tak punya isi HTML; data-id dipakai sebagai
      // placeholder (mis. "Nama anak" untuk "Child's name").
      var isField = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA';
      if (isField) {
        if (el.__enPh == null) {
          el.__enPh = el.getAttribute('placeholder') || '';
          el.__idPh = el.getAttribute('data-id') || el.__enPh;
        }
        el.setAttribute('placeholder', (lang === 'id') ? el.__idPh : el.__enPh);
        continue;
      }

      if (el.__en == null) el.__en = el.innerHTML;
      el.innerHTML = (lang === 'id') ? (el.getAttribute('data-id') || el.__en) : el.__en;
    }
  }

  MG.I18N = {
    KEY: KEY,
    DEFAULT: DEFAULT,
    current: current,
    set: set,
    toggle: toggle,
    T: T,
    apply: applyDom
  };
  MG.t = T;

  // Skrip ini berada setelah seluruh isi <body>, jadi DOM sudah siap.
  if (global.document) applyDom();

})(window);
