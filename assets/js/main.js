/* ============================================================
 *  main.js  —  Titik masuk aplikasi.
 *  Menyalakan database, memuat pengaturan, lalu menyerahkan kontrol ke UI.
 * ============================================================ */
(function (global) {
  'use strict';

  var MG = global.MG;
  var U = MG.utils;
  var T = MG.t;
  var $ = U.$;

  /* ============================================================
   *  PESAN DARI MASCOT (acak, muncul satu kali saat aplikasi dibuka)
   * ============================================================ */
  var GREETINGS = [
    T("Hi! I'm <b>Bobi</b>. Let's learn math while having fun! 🎉",
      'Halo! Aku <b>Bobi</b>. Ayo belajar matematika sambil bermain! 🎉'),
    T('Ready for a study buddy? Tap <b>Start Learning</b>! 🚀',
      'Siap jadi teman belajarmu? Pilih <b>Mulai Belajar</b> ya! 🚀'),
    T('There are <b>20 levels</b> waiting. Which one will you try? 🗺️',
      'Ada <b>20 level</b> menunggu. Mau coba yang mana? 🗺️'),
    T('Remember: answering before the time runs out earns bonus points! ⏱️',
      'Ingat: jawab sebelum waktu habis dapat bonus poin! ⏱️'),
    T('Done with today\u2019s tasks? Ten minutes of study is already plenty! 📚',
      'Sudah selesai tugas hari ini? Belajar 10 menit saja sudah cukup! 📚')
  ];

  /* Nama acak untuk pemain baru */
  var RANDOM_NAMES = [
    T('Tom', 'Budi'), T('Anna', 'Sari'), T('Leo', 'Dodo'),
    T('Lina', 'Lina'), T('Riko', 'Riko'), T('Maya', 'Maya')
  ];

  /* ============================================================
   *  GANTI BAHASA (tombol 🌐 di bilah atas & segmen di pengaturan)
   * ============================================================ */
  function bindLanguage() {
    var btn = $('#btn-lang');
    if (btn) U.on(btn, 'click', function () { MG.audio.play('tap'); MG.I18N.toggle(); });

    var seg = $('#seg-language');
    if (!seg) return;
    var active = MG.I18N.current();
    U.$$('button[data-lang]', seg).forEach(function (b) {
      b.classList.toggle('on', b.getAttribute('data-lang') === active);
    });
    seg.addEventListener('click', function (e) {
      var b = e.target && e.target.closest ? e.target.closest('button[data-lang]') : null;
      if (!b) return;
      MG.audio.play('tap');
      MG.I18N.set(b.getAttribute('data-lang'));
    });
  }

  /* ============================================================
   *  MUAT PENGATURAN DARI DATABASE
   *
   *  Satu perangkat bisa dipakai beberapa anak, jadi saat aplikasi
   *  dibuka kita kembali ke pemain yang terakhir dipakai. Kalau belum
   *  ada pemain sama sekali, buat satu dengan nama acak yang ramah.
   * ============================================================ */
  function loadSettings() {
    var player = MG.db.getPlayer();

    if (!player) {
      var namaAcak = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
      player = MG.db.createPlayer(namaAcak,
        MG.CONFIG.AVATARS[Math.floor(Math.random() * 6)],
        1 + Math.floor(Math.random() * 6));
    }

    MG.ui.applyPlayerSettings();
    return player;
  }

  /* ============================================================
   *  NYALAKAN APLIKASI
   * ============================================================ */
  function boot() {
    var loaderText = $('#loader-text');
    var loaderMascot = $('#loader-mascot');
    if (loaderMascot) loaderMascot.innerHTML = MG.art.mascot('happy');

    // Ganti bahasa bisa dilakukan sejak layar pemuatan
    bindLanguage();

    // Efek suara baru boleh bunyi setelah pengguna berinteraksi
    var unlock = function () {
      MG.audio.unlock();
      if (MG.game.settings.music) MG.audio.startMusic();
      document.removeEventListener('pointerdown', unlock);
      document.removeEventListener('keydown', unlock);
    };
    document.addEventListener('pointerdown', unlock);
    document.addEventListener('keydown', unlock);

    if (loaderText) loaderText.textContent = T('Preparing database…', 'Menyiapkan database…');

    MG.db.init().then(function (ok) {
      if (!ok) {
        if (loaderText) loaderText.textContent = T('Could not open the database…', 'Gagal membuka database…');
        return;
      }
      if (loaderText) loaderText.textContent = T('Preparing the game…', 'Menyiapkan permainan…');

      var player = loadSettings();

      // Terapkan pengaturan ke modul suara
      MG.audio.sfxOn = MG.game.settings.sfx;
      MG.audio.musicOn = MG.game.settings.music;

      // Ikon tombol suara
      var btnSound = $('#btn-sound');
      if (btnSound) {
        btnSound.classList.toggle('off', !MG.game.settings.sfx);
        btnSound.querySelector('.ico').textContent = MG.game.settings.sfx ? '🔊' : '🔇';
      }

      // Efek visual (partikel confetti) dan pengaitkan tombol
      MG.ui.fx.init();
      MG.ui.bind();
      MG.ui.refreshHome();
      MG.ui.show('home');

      // Sembunyikan loader
      var loader = $('#loader');
      if (loader) {
        loader.classList.add('hide');
        setTimeout(function () { loader.style.display = 'none'; }, 500);
      }

      // Sapaan dari Bobi
      var greeting = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
      setTimeout(function () { MG.ui.showBubble(greeting, 5200); }, 620);

      // Sinkronkan dengan server bila game dijalankan lewat server.js
      MG.db.pullFromServer().then(function (changed) {
        if (changed) {
          MG.ui.applyPlayerSettings();
          MG.ui.refreshHome();
          U.toast(T('Progress updated from server ☁️', 'Progres diperbarui dari server ☁️'));
        }
      });

      // Daftarkan ke papan peringkat online bila server tersedia
      MG.db.publishScore(true);

      // Simpan juga saat tab ditutup
      global.addEventListener('beforeunload', function () { MG.db.saveNow(); });
      document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'hidden') MG.db.saveNow();
      });

      console.log('%c' + T('Magic Math', 'Matematika Ajaib'), 'font-size:20px;font-weight:900;color:#5B4BE8',
        '\n' + T('Player: ', 'Pemain: ') + player.name + ' ' + T('(grade ', '(kelas ') + (player.grade || 1) + ')',
        '\n' + T('Players: ', 'Jumlah pemain: ') + MG.db.playerCount(),
        '\n' + T('Storage: ', 'Penyimpanan: ') + MG.db.storageKind(),
        '\n' + T('Unlocked levels: ', 'Level terbuka: ') + MG.db.getUnlockedLevel(),
        '\n' + T('Server mode: ', 'Mode server: ') + MG.db.serverSyncEnabled(),
        '\n' + T('Online leaderboard: ', 'Leaderboard online: ') + MG.db.onlineAvailable());
    });
  }

  /* ============================================================
   *  ERROR GLOBAL
   * ============================================================ */
  global.addEventListener('error', function (e) {
    console.error('[error]', e.error || e.message);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})(window);
