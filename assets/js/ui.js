/* ============================================================
 *  ui.js  —  Tampilan: navigasi layar, kartu level, kartu soal,
 *  tombol jawaban, timer, umpan balik, hasil, pengaturan, statistik.
 * ============================================================ */
(function (global) {
  'use strict';

  var MG = global.MG = global.MG || {};
  var U = MG.utils;
  var T = MG.t;
  var $ = U.$, $$ = U.$$, on = U.on, el = U.el;
  var UI = MG.ui = {};

  var currentScreen = 'home';
  var levelTrack = 'sd';   // jalur di peta level ('sd' | 'tk' | 'adv')

  /* ============================================================
   *  NAVIGASI LAYAR
   * ============================================================ */
  UI.show = function (name) {
    $$('.screen').forEach(function (s) {
      s.classList.toggle('is-active', s.id === 'screen-' + name);
    });
    currentScreen = name;
    try { window.scrollTo(0, 0); } catch (e) { }

    // judul header
    var sub = $('#topbar-sub');
    var titles = {
      home: T('Pick a level to start', 'Pilih level untuk mulai'),
      levels: T('3 tracks: Elementary, Preschool & Adventure', '3 jalur: SD, TK & Petualangan'),
      play: T('Answer quickly!', 'Jawab dengan cepat!'),
      result: T('Game results', 'Hasil permainan'),
      settings: T('Set it up your way', 'Atur sesuai kebutuhanmu'),
      stats: T('Your learning journey', 'Rekam jejak belajar'),
      players: T('Each player has their own progress', 'Tiap pemain punya progres sendiri'),
      leaderboard: T('See who has the highest score', 'Lihat siapa yang paling Nilainya'),
      help: T('Read how to play', 'Baca aturan mainnya')
    };
    if (sub) sub.textContent = titles[name] || '';
    $('#btn-home').style.visibility = (name === 'home' || name === 'play') ? 'hidden' : 'visible';

    if (name !== 'play') {
      hideAdvWorldMap();
      var playScreen = $('#screen-play');
      if (playScreen) playScreen.classList.remove('is-adv-mode');
      var advStage = $('#adv-play-stage');
      if (advStage) advStage.hidden = true;
    }

    if (name === 'levels') UI.renderLevels();
    if (name === 'stats') UI.renderStats();
    if (name === 'settings') UI.fillSettings();
    if (name === 'players') UI.renderPlayers();
    if (name === 'leaderboard') UI.renderLeaderboard();
  };
  UI.current = function () { return currentScreen; };

  /* ============================================================
   *  BERANDA
   * ============================================================ */
  UI.refreshHome = function () {
    var ov = MG.db.getOverview();
    $('#home-stars').textContent = ov.stars;
    $('#home-badges').textContent = Object.keys(MG.db.getBadges()).length;
    $('#home-done').textContent = ov.cleared + '/' + MG.totalLevels();
    $('#home-acc').textContent = Math.round(ov.accuracy * 100) + '%';

    var p = MG.db.getPlayer();
    if (p) {
      $('#chip-avatar').textContent = p.avatar;
      $('#chip-name').textContent = p.name;
      $('#switch-name').textContent = p.name.split(' ')[0];
    }
    $('#mascot-home').innerHTML = MG.art.mascot(ov.cleared === 0 ? 'happy' : 'cheer');
  };

  var BUBBLES = [
    T('Hi! I\'m Bobi. Let\'s learn together! 😊', 'Halo! Aku Bobi. Ayo belajar bareng! 😊'),
    T('Do you know how to play yet? 😄', 'Sudah tahu cara mainnya belum? 😄'),
    T('If you\'re ready, click Start Learning! 🚀', 'Kalau siap, klik Mulai Belajar! 🚀')
  ];

  UI.showBubble = function (text, ms) {
    var b = $('#mascot-bubble');
    if (!b) return;
    b.innerHTML = text;
    b.classList.add('show');
    clearTimeout(UI._bubbleT);
    UI._bubbleT = setTimeout(function () { b.classList.remove('show'); }, ms || 4200);
  };

  /* ============================================================
   *  PETA LEVEL
   * ============================================================ */
  UI.setLevelTrack = function (track) {
    levelTrack = MG.normTrack(track);
    $$('#track-tabs button').forEach(function (b) {
      b.classList.toggle('on', b.getAttribute('data-track') === levelTrack);
    });
    UI.renderLevels();
  };

  UI.renderLevels = function () {
    var grid = $('#level-grid');
    var mapBox = $('#adv-map');
    var legend = $('#adv-map-legend');
    grid.innerHTML = '';
    if (mapBox) mapBox.innerHTML = '';
    var track = levelTrack;
    var isTk = track === 'tk';
    var isAdv = track === 'adv';
    var levels = MG.levelList(track);
    var total = MG.levelCount(track);
    var progress = MG.db.getAllProgress(track);
    var unlocked = MG.db.getUnlockedLevel(track);

    // Jalur Petualangan memakai peta jelajah; jalur SD & TK tetap pakai kartu.
    if (mapBox) mapBox.hidden = !isAdv;
    if (legend) legend.hidden = !isAdv;
    grid.hidden = isAdv;

    if (isAdv) {
      renderAdvMap(levels, progress, unlocked);
    } else {
      levels.forEach(function (LV) {
        var p = progress[LV.n];
        var locked = LV.n > unlocked;
        var stars = p ? p.best_stars : 0;
        var cleared = p && p.cleared;

        var card = el('button', 'level-card' + (locked ? ' locked' : '') + (LV.n === unlocked && !locked ? ' current' : '') +
          (isTk ? ' tk-card' : ''));
        card.style.animationDelay = (LV.n * 0.02) + 's';
        card.style.borderColor = locked ? '' : 'hsl(' + LV.hue + ' 85% 62%)';

        var starsHtml = '';
        for (var i = 0; i < 3; i++) {
          starsHtml += '<span class="s' + (i < stars ? ' on' : '') + '">' +
            (i < stars ? '⭐' : '☆') + '</span>';
        }

        var label = isTk ? (T('K ', 'TK ') + LV.n) : (T('Lv ', 'Lv ') + LV.n);
        card.innerHTML =
          '<span class="lv-n">' + label + '</span>' +
          (cleared ? '<span class="lv-check">✓</span>' : '') +
          '<span class="lv-emoji">' + LV.emoji + '</span>' +
          '<span class="lv-title">' + LV.title + '</span>' +
          '<span class="lv-stars">' + starsHtml + '</span>';

        card.title = MG.levelLabel(track, LV.n) + '. ' + LV.title + ' — ' + LV.desc;
        on(card, 'click', function () { openLevel(track, LV, locked); });
        grid.appendChild(card);
      });
    }

    var done = MG.db.getClearedCount(track);
    $('#levels-progress').style.width = (done / total * 100) + '%';
    $('#levels-progress-text').textContent = done + T(' of ', ' dari ') + total + (isAdv ? T(' chapters', ' bab') : T(' levels', ' level')) + T(' done', ' selesai');
  };

  /** Buka level: modal bila terkunci, langsung main bila terbuka. */
  function openLevel(track, LV, locked) {
    if (locked) {
      MG.audio.play('lock');
      var prev = MG.levelOf(track, LV.n - 1);
      U.modal({
        emoji: '🔒', title: MG.levelLabel(track, LV.n) + T(' Locked', ' Terkunci'),
        text: T('Finish <b>', 'Selesaikan <b>') + MG.levelLabel(track, LV.n - 1) + (prev ? ' — ' + prev.title : '') +
          '</b>' + T(' first to unlock ', ' dulu untuk membuka ') + (track === 'adv' ? T('this chapter', 'bab ini') : T('this level', 'level ini')) + '.',
        buttons: [{ label: T('Play ', 'Main ') + MG.levelLabel(track, LV.n - 1), cls: 'btn-primary', onClick: function () { UI.startLevel(LV.n - 1, track); } },
        { label: T('OK', 'OK') }]
      });
      return;
    }
    MG.audio.play('tap');
    UI.startLevel(LV.n, track);
  }

  /* ============================================================
   *  PETA PETUALANGAN — jalur 'adv' ditampilkan seperti
   *  menelusuri peta: jalan berkelok, simpul bab, penanda posisi.
   * ============================================================ */

  /** Posisi tiap bab pada peta (x = % lebar, y = % tinggi peta). */
  var ADV_MAP_POS = [
    { x: 50, y: 8 }, { x: 73, y: 17 }, { x: 33, y: 26 }, { x: 67, y: 35 },
    { x: 27, y: 44 }, { x: 71, y: 53 }, { x: 35, y: 62 }, { x: 65, y: 71 },
    { x: 29, y: 80 }, { x: 55, y: 89 }
  ];

  /** Hiasan peta (sengaja di pinggir supaya tidak menutupi simpul). */
  var ADV_MAP_DECO = [
    { e: '🌲', x: 6, y: 9, s: 26 }, { e: '🌳', x: 88, y: 6, s: 24 },
    { e: '⛰️', x: 9, y: 21, s: 30 }, { e: '🌴', x: 87, y: 24, s: 24 },
    { e: '🏕️', x: 7, y: 37, s: 24 }, { e: '🌵', x: 90, y: 44, s: 26 },
    { e: '🏞️', x: 8, y: 55, s: 26 }, { e: '🪨', x: 89, y: 62, s: 24 },
    { e: '🗻', x: 7, y: 71, s: 28 }, { e: '❄️', x: 90, y: 79, s: 24 },
    { e: '🏰', x: 8, y: 88, s: 26 }, { e: '🏆', x: 77, y: 91, s: 26 }
  ];

  /** Garis jalan halus (Catmull-Rom → Bezier) melewati semua simpul. */
  function mapPathD(p) {
    if (p.length < 2) return '';
    var d = 'M ' + p[0].x + ',' + p[0].y;
    for (var i = 0; i < p.length - 1; i++) {
      var p0 = p[i - 1] || p[i];
      var p1 = p[i], p2 = p[i + 1];
      var p3 = p[i + 2] || p2;
      d += ' C ' + (p1.x + (p2.x - p0.x) / 6) + ',' + (p1.y + (p2.y - p0.y) / 6) +
        ' ' + (p2.x - (p3.x - p1.x) / 6) + ',' + (p2.y - (p3.y - p1.y) / 6) +
        ' ' + p2.x + ',' + p2.y;
    }
    return d;
  }

  function renderAdvMap(levels, progress, unlocked) {
    var mapBox = $('#adv-map');
    if (!mapBox) return;
    mapBox.innerHTML = '';

    var pts = ADV_MAP_POS;
    // bagian jalur yang sudah dilewati = splin dari bab 1 sampai bab terbuka
    var reached = Math.max(1, Math.min(unlocked, levels.length));
    var dFull = mapPathD(pts);
    var dDone = reached > 1 ? mapPathD(pts.slice(0, reached)) : '';

    var trail = el('div', 'map-trail');
    trail.innerHTML =
      '<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">' +
      '<path class="trail-base" d="' + dFull + '"></path>' +
      (dDone ? '<path class="trail-done" d="' + dDone + '"></path>' : '') +
      '</svg>';
    mapBox.appendChild(trail);

    ADV_MAP_DECO.forEach(function (dc) {
      var s = el('span', 'map-deco', dc.e);
      s.style.left = dc.x + '%';
      s.style.top = dc.y + '%';
      s.style.fontSize = dc.s + 'px';
      mapBox.appendChild(s);
    });

    mapBox.appendChild(el('span', 'map-badge', T('🧭 Adventure Map', '🧭 Peta Petualangan')));

    var currentNode = null;
    levels.forEach(function (LV, idx) {
      var pos = pts[idx] || { x: 50, y: 50 };
      var p = progress[LV.n];
      var locked = LV.n > unlocked;
      var stars = p ? p.best_stars : 0;
      var cleared = p && p.cleared;
      var isCurrent = !locked && LV.n === unlocked;

      var node = el('button', 'map-node' + (locked ? ' locked' : '') + (isCurrent ? ' current' : ''));
      node.style.left = pos.x + '%';
      node.style.top = pos.y + '%';
      node.style.animationDelay = (0.2 + idx * 0.07) + 's';
      node.style.setProperty('--node-color', 'hsl(' + LV.hue + ' 85% 62%)');

      var starsHtml = '';
      for (var s2 = 0; s2 < 3; s2++) {
        starsHtml += '<span class="s' + (s2 < stars ? ' on' : '') + '">' + (s2 < stars ? '⭐' : '☆') + '</span>';
      }

      node.innerHTML =
        '<span class="node-pin">' +
        '<span class="node-emoji">' + LV.emoji + '</span>' +
        (locked ? '<span class="node-lock">🔒</span>' : '') +
        (cleared ? '<span class="node-check">✓</span>' : '') +
        '</span>' +
        '<span class="node-label">' + T('Chapter ', 'Bab ') + LV.n + '</span>' +
        '<span class="node-title">' + LV.title + '</span>' +
        '<span class="node-stars">' + starsHtml + '</span>';

      node.title = MG.levelLabel('adv', LV.n) + '. ' + LV.title + ' — ' + LV.desc;

      if (isCurrent) {
        node.appendChild(el('span', 'node-here', T('📍 You are here', '📍 Kamu di sini')));
        currentNode = node;
      }

      (function (L, lk) {
        on(node, 'click', function () { openLevel('adv', L, lk); });
      })(LV, locked);

      mapBox.appendChild(node);
    });

    // Gulir ke posisi anak supaya terasa seperti menelusuri peta.
    if (currentNode) setTimeout(function () { scrollToNode(currentNode); }, 350);
  }

  /** Bawa simpul "kamu di sini" ke tengah layar (kalau di luar jangkauan). */
  function scrollToNode(node) {
    try {
      var r = node.getBoundingClientRect();
      if (r.top >= 70 && r.bottom <= window.innerHeight - 20) return;
      var y = (window.pageYOffset || document.documentElement.scrollTop || 0) + r.top - (window.innerHeight / 2);
      y = Math.max(0, y);
      try { window.scrollTo({ top: y, behavior: 'smooth' }); }
      catch (e2) { window.scrollTo(0, y); }
    } catch (e) { /* browser lama: abaikan */ }
  }

  /* ============================================================
   *  STAGE PETUALANGAN 2D — TAMPILAN PETA SAAT MENJAWAB SOAL (🧭)
   * ============================================================ */

  /** Posisi 10 simpul pos di kanvas stage 2D (lebar 1000 x tinggi 220). */
  var ADV_STAGE_POS = [
    { x: 80,  y: 155 }, // Pos 1
    { x: 175, y: 115 }, // Pos 2
    { x: 270, y: 160 }, // Pos 3
    { x: 365, y: 105 }, // Pos 4
    { x: 460, y: 155 }, // Pos 5 (Pos Istirahat)
    { x: 555, y: 110 }, // Pos 6
    { x: 650, y: 165 }, // Pos 7
    { x: 745, y: 115 }, // Pos 8
    { x: 840, y: 155 }, // Pos 9
    { x: 935, y: 110 }  // Pos 10 (Gerbang Utama / Landmark)
  ];

  /** Tema visual 2D untuk masing-masing 10 Bab Petualangan */
  var ADV_THEMES = {
    1: {
      name: T('Peaceful Village', 'Desa Damai'),
      skyTop: '#70C5F8', skyBot: '#CDEEFF',
      groundColor: '#58A527', hillsBack: '#8CD358',
      roadColor: '#D8B87A', roadBorder: '#8A6930',
      sun: { cx: 80, cy: 45, r: 24, fill: '#FFD93D' },
      goalEmoji: '🏰',
      props: [
        { e: '🏡', x: 25, y: 115, s: 32 }, { e: '🌳', x: 125, y: 80, s: 28 },
        { e: '🌸', x: 215, y: 140, s: 20 }, { e: '🐑', x: 310, y: 85, s: 24 },
        { e: '🌬️', x: 410, y: 70, s: 28 }, { e: '🌳', x: 505, y: 75, s: 28 },
        { e: '🌼', x: 600, y: 140, s: 20 }, { e: '🏡', x: 695, y: 80, s: 30 },
        { e: '🌻', x: 790, y: 140, s: 22 }
      ],
      encounters: [T('🍎 Picnic Apple', '🍎 Apel Bekal'), T('🐰 Meadow Rabbit', '🐰 Kelinci Padang'), T('🪵 Village Fence', '🪵 Pagar Desa'), T('🐑 Little Lamb', '🐑 Domba Cilik'), T('🌬️ Windmill', '🌬️ Kincir Angin'), T('🥖 Bread Loaf', '🥖 Bekal Roti'), T('🧒 Adventure Buddy', '🧒 Kawan Petualang'), T('🐴 Pony', '🐴 Kuda Poni'), T('👴 Village Chief', '👴 Pak Kades'), T('🏆 Adventure Gate', '🏆 Gerbang Petualangan')],
      encounterEmojis: ['🍎', '🐰', '🪵', '🐑', '🌬️', '🥖', '🧒', '🐴', '👴', '🏆']
    },
    2: {
      name: T('Forbidden Forest', 'Hutan Terlarang'),
      skyTop: '#132A2F', skyBot: '#285852',
      groundColor: '#1E472A', hillsBack: '#163E27',
      roadColor: '#8C7752', roadBorder: '#4E3E22',
      sun: { cx: 900, cy: 42, r: 20, fill: '#E0F4EE' },
      goalEmoji: '🏛️',
      props: [
        { e: '🌲', x: 30, y: 85, s: 34 }, { e: '🍄', x: 125, y: 140, s: 24 },
        { e: '🌲', x: 220, y: 75, s: 36 }, { e: '🦉', x: 320, y: 70, s: 24 },
        { e: '🌲', x: 410, y: 70, s: 32 }, { e: '✨', x: 510, y: 80, s: 20 },
        { e: '🍄', x: 605, y: 145, s: 24 }, { e: '🌲', x: 700, y: 75, s: 36 },
        { e: '🪨', x: 795, y: 140, s: 24 }
      ],
      encounters: [T('🍄 Corner Mushroom', '🍄 Jamur Penjuru'), T('🦉 Ancient Owl', '🦉 Burung Hantu Kuno'), T('🌲 Guardian Tree', '🌲 Pohon Penjaga'), T('🦊 Forest Fox', '🦊 Rubah Hutan'), T('🌿 Thorny Bush', '🌿 Semak Berduri'), T('✨ Wise Fireflies', '✨ Kunang-kunang Bijak'), T('🦌 Forest Deer', '🦌 Rusa Hutan'), T('🪨 Secret Stone', '🪨 Batu Rahasia'), T('🐺 Mist Wolf', '🐺 Serigala Kabut'), T('🏛️ Magic Forest Gate', '🏛️ Gerbang Hutan Magis')],
      encounterEmojis: ['🍄', '🦉', '🌲', '🦊', '🌿', '✨', '🦌', '🪨', '🐺', '🏛️']
    },
    3: {
      name: T('Rushing River', 'Sungai Derau'),
      skyTop: '#4BA3E3', skyBot: '#9BD6F8',
      groundColor: '#3C8D2F', hillsBack: '#68BA56',
      roadColor: '#C4A46C', roadBorder: '#7C5F2B',
      river: true,
      goalEmoji: '🏮',
      props: [
        { e: '🦆', x: 35, y: 140, s: 24 }, { e: '🌊', x: 125, y: 85, s: 24 },
        { e: '🌉', x: 220, y: 80, s: 30 }, { e: '🦀', x: 315, y: 140, s: 24 },
        { e: '🛶', x: 410, y: 85, s: 26 }, { e: '🐸', x: 505, y: 140, s: 22 },
        { e: '💧', x: 600, y: 80, s: 24 }, { e: '🪨', x: 700, y: 140, s: 24 },
        { e: '🐊', x: 795, y: 85, s: 26 }
      ],
      encounters: [T('🦆 Crossing Duck', '🦆 Bebek Penyeberang'), T('🐟 Jumping Fish', '🐟 Ikan Loncatan'), T('🦀 River Crab', '🦀 Kepiting Sungai'), T('🪨 Stepping Stone', '🪨 Batu Loncatan Derau'), T('🛶 Crossing Raft', '🛶 Rakit Seberang'), T('🐸 Guard Frog', '🐸 Katak Penjaga'), T('💧 Thundering Waterfall', '💧 Air Terjun Gemuruh'), T('🌉 Rope Bridge', '🌉 Jembatan Tali'), T('🐊 River Friend', '🐊 Sahabat Sungai'), T('🏮 Far Lighthouse', '🏮 Mercusuar Seberang')],
      encounterEmojis: ['🦆', '🐟', '🦀', '🪨', '🛶', '🐸', '💧', '🌉', '🐊', '🏮']
    },
    4: {
      name: T('Treasure Cave', 'Gua Harta Karun'),
      skyTop: '#1A1429', skyBot: '#352952',
      groundColor: '#3F355A', hillsBack: '#251C3B',
      roadColor: '#A39272', roadBorder: '#5D4F35',
      goalEmoji: '🎁',
      props: [
        { e: '🔥', x: 30, y: 80, s: 26 }, { e: '💎', x: 130, y: 75, s: 24 },
        { e: '🦇', x: 220, y: 65, s: 24 }, { e: '🪙', x: 315, y: 140, s: 22 },
        { e: '🔥', x: 410, y: 80, s: 26 }, { e: '📦', x: 505, y: 75, s: 26 },
        { e: '💎', x: 605, y: 80, s: 24 }, { e: '🗿', x: 700, y: 75, s: 28 },
        { e: '⏰', x: 795, y: 75, s: 26 }
      ],
      encounters: [T('🔥 Cave Torch', '🔥 Obor Masuk Gua'), T('🦇 Crystal Bat', '🦇 Kelelawar Kristal'), T('💎 Sparkling Crystal', '💎 Kristal Berkilau'), T('🪙 Ancient Coins', '🪙 Tumpukan Koin Kuno'), T('⚖️ Cave Scales', '⚖️ Timbangan Gua'), T('📦 Bronze Chest', '📦 Peti Perunggu'), T('🗿 Coin Guardian Golem', '🗿 Golem Penjaga Koin'), T('💎 Golden Stalactite', '💎 Stalaktit Emas'), T('⏰ Cave Keeper Clock', '⏰ Jam Penjaga Gua'), T('🎁 Open Golden Chest!', '🎁 Peti Emas Terbuka!')],
      encounterEmojis: ['🔥', '🦇', '💎', '🪙', '⚖️', '📦', '🗿', '💎', '⏰', '🎁']
    },
    5: {
      name: T('Number Tower', 'Menara Angka'),
      skyTop: '#4D2B69', skyBot: '#8D5EA8',
      groundColor: '#44375A', hillsBack: '#433060',
      roadColor: '#B09ECE', roadBorder: '#644F83',
      goalEmoji: '🗼',
      props: [
        { e: '🪜', x: 30, y: 130, s: 28 }, { e: '📜', x: 125, y: 75, s: 24 },
        { e: '🏰', x: 220, y: 75, s: 30 }, { e: '🦅', x: 315, y: 65, s: 24 },
        { e: '☁️', x: 415, y: 75, s: 28 }, { e: '📖', x: 510, y: 75, s: 24 },
        { e: '⚙️', x: 605, y: 80, s: 24 }, { e: '🔮', x: 700, y: 75, s: 26 },
        { e: '🕰️', x: 795, y: 75, s: 26 }
      ],
      encounters: [T('🪜 Tower First Steps', '🪜 Tangga Dasar Menara'), T('📜 Number Scroll', '📜 Gulungan Bilangan'), T('🗿 Tower Guard Statue', '🗿 Patung Penjaga Menara'), T('🦅 Space Eagle', '🦅 Elang Angkasa'), T('☁️ Cloudy Tower Balcony', '☁️ Balkon Awan Menara'), T('📖 Magic Formula Book', '📖 Kitab Rumus Ajaib'), T('⚙️ Number Gear', '⚙️ Roda Gigi Angka'), T('🔮 Counting Crystal Ball', '🔮 Bola Kristal Hitung'), T('🕰️ Tower Star Clock', '🕰️ Jam Astronomi Menara'), T('🗼 Top of the Number Tower!', '🗼 Puncak Menara Angka!')],
      encounterEmojis: ['🪜', '📜', '🗿', '🦅', '☁️', '📖', '⚙️', '🔮', '🕰️', '🗼']
    },
    6: {
      name: T('Desert', 'Padang Pasir'),
      skyTop: '#E58339', skyBot: '#FCD89E',
      groundColor: '#D89E3E', hillsBack: '#BA7A20',
      roadColor: '#F5CE7C', roadBorder: '#A1731E',
      sun: { cx: 880, cy: 50, r: 28, fill: '#FF5722' },
      goalEmoji: '🏛️',
      props: [
        { e: '🌵', x: 30, y: 120, s: 28 }, { e: '🐪', x: 125, y: 75, s: 28 },
        { e: '🦂', x: 220, y: 140, s: 22 }, { e: '🌴', x: 315, y: 75, s: 30 },
        { e: '⛺', x: 415, y: 80, s: 28 }, { e: '🌵', x: 510, y: 125, s: 26 },
        { e: '🏺', x: 605, y: 140, s: 22 }, { e: '🦁', x: 700, y: 75, s: 28 },
        { e: '📐', x: 795, y: 80, s: 26 }
      ],
      encounters: [T('🌵 Signpost Cactus', '🌵 Kaktus Penunjuk Jalan'), T('🐪 Desert Camel Caravan', '🐪 Kafilah Unta Gurun'), T('🦂 Golden Scorpion', '🦂 Kalajengking Emas'), T('🌴 Secret Cool Oasis', '🌴 Oasis Sejuk Rahasia'), T('⛺ Desert Trader Tent', '⛺ Tenda Pedagang Gurun'), T('🌪️ Sand Swirl', '🌪️ Pusaran Angin Pasir'), T('🏺 Ancient Water Jar', '🏺 Bejana Air Kuno'), T('🦁 Desert Guard Sphinx', '🦁 Sphinx Penjaga Gurun'), T('📐 Pyramid Mystery Tomb', '📐 Makam Misteri Piramida'), T('🏛️ Great Golden Pyramid!', '🏛️ Piramida Emas Agung!')],
      encounterEmojis: ['🌵', '🐪', '🦂', '🌴', '⛺', '🌪️', '🏺', '🦁', '📐', '🏛️']
    },
    7: {
      name: T('Fishing Village', 'Desa Nelayan'),
      skyTop: '#439FD4', skyBot: '#9FE1F8',
      groundColor: '#CCA56A', hillsBack: '#5DAECF',
      roadColor: '#DEC391', roadBorder: '#8C6C38',
      goalEmoji: '🏮',
      props: [
        { e: '⛵', x: 30, y: 75, s: 30 }, { e: '🐟', x: 125, y: 140, s: 22 },
        { e: '🕊️', x: 220, y: 65, s: 22 }, { e: '🐙', x: 315, y: 140, s: 24 },
        { e: '⚓', x: 415, y: 80, s: 26 }, { e: '⛵', x: 510, y: 75, s: 28 },
        { e: '🐢', x: 605, y: 140, s: 24 }, { e: '🧑‍✈️', x: 700, y: 75, s: 26 },
        { e: '🌊', x: 795, y: 80, s: 24 }
      ],
      encounters: [T('⛵ Dock Fishing Boat', '⛵ Perahu Dermaga Nelayan'), T('🐟 Caught Fish Weigh', '🐟 Timbangan Ikan Tangkapan'), T('🕊️ Ocean Seagull', '🕊️ Burung Camar Samudra'), T('🐙 Clever Beach Octopus', '🐙 Gurita Cerdik Pantai'), T('⚓ Old Dock Anchor', '⚓ Jangkar Besi Tua Dermaga'), T('🧺 Basket of Catch', '🧺 Keranjang Hasil Laut'), T('🐢 Wise Sea Turtle', '🐢 Penyu Laut Bijaksana'), T('🧑‍✈️ Sea Fishing Captain', '🧑‍✈️ Kapten Nelayan Laut'), T('🌊 Beach Tide Wave', '🌊 Gelombang Pasang Pantai'), T('🏮 Glowing Sea Lighthouse!', '🏮 Mercusuar Samudra Bercahaya!')],
      encounterEmojis: ['⛵', '🐟', '🕊️', '🐙', '⚓', '🧺', '🐢', '🧑‍✈️', '🌊', '🏮']
    },
    8: {
      name: T('Snowy Mountain', 'Gunung Salju'),
      skyTop: '#68B6D8', skyBot: '#C4E9F7',
      groundColor: '#D8EEF8', hillsBack: '#90C4DD',
      roadColor: '#BEDBE8', roadBorder: '#6F9BB0',
      goalEmoji: '👑',
      props: [
        { e: '🌲', x: 30, y: 80, s: 32 }, { e: '🐇', x: 125, y: 140, s: 22 },
        { e: '⛄', x: 220, y: 75, s: 28 }, { e: '🧊', x: 315, y: 140, s: 24 },
        { e: '🌲', x: 415, y: 75, s: 34 }, { e: '🛷', x: 510, y: 85, s: 26 },
        { e: '❄️', x: 605, y: 70, s: 22 }, { e: '🐻‍❄️', x: 700, y: 75, s: 28 },
        { e: '🏔️', x: 795, y: 70, s: 32 }
      ],
      encounters: [T('🌲 Evergreen Pine', '🌲 Pinus Salju Abadi'), T('🐇 Mountain Snow Bunny', '🐇 Kelinci Salju Gunung'), T('⛄ Snowman Guard', '⛄ Manusia Salju Penjaga'), T('🧊 Ice Block', '🧊 Balok Es Pecahan'), T('🛷 Peak Sled', '🛷 Kereta Luncur Puncak'), T('🦅 Snow Peak Eagle', '🦅 Elang Puncak Salju'), T('❄️ Pure Ice Crystal', '❄️ Kristal Es Murni'), T('🐻‍❄️ Friendly Polar Bear', '🐻‍❄️ Beruang Salju Ramah'), T('🏔️ Tall Snow Cliff', '🏔️ Tebing Salju Menjulang'), T('👑 Snow Peak Crown Reached!', '👑 Mahkota Puncak Salju Diraih!')],
      encounterEmojis: ['🌲', '🐇', '⛄', '🧊', '🛷', '🦅', '❄️', '🐻‍❄️', '🏔️', '👑']
    },
    9: {
      name: T('Cloud Palace', 'Istana Awan'),
      skyTop: '#5B4EB3', skyBot: '#A994DC',
      groundColor: '#ECE7F8', hillsBack: '#9681CE',
      roadColor: '#D9C8F5', roadBorder: '#8E73B9',
      goalEmoji: '🏰',
      props: [
        { e: '☁️', x: 30, y: 75, s: 32 }, { e: '🌈', x: 125, y: 70, s: 30 },
        { e: '⭐', x: 220, y: 65, s: 22 }, { e: '🧚', x: 315, y: 75, s: 26 },
        { e: '🏝️', x: 415, y: 75, s: 30 }, { e: '🎵', x: 510, y: 70, s: 24 },
        { e: '☁️', x: 605, y: 75, s: 32 }, { e: '🦄', x: 700, y: 75, s: 28 },
        { e: '⛩️', x: 795, y: 70, s: 32 }
      ],
      encounters: [T('☁️ First Step Cloud', '☁️ Awan Pijakan Awal'), T('🌈 Magic Rainbow Bridge', '🌈 Jembatan Pelangi Ajaib'), T('⭐ Sky Guide Star', '⭐ Bintang Penunjuk Langit'), T('🧚 Palace Guard Fairy', '🧚 Peri Penjaga Istana'), T('🏝️ Floating Sky Island', '🏝️ Pulau Terbang Khayangan'), T('🎵 Sky Wind Harp', '🎵 Harpa Angin Langit'), T('⚖️ Palace Treasure Scales', '⚖️ Timbangan Harta Istana'), T('🦄 Golden Winged Unicorn', '🦄 Unicorn Bersayap Emas'), T('⛩️ Kingdom Crown Gate', '⛩️ Gerbang Mahkota Kerajaan'), T('🏰 Grand Cloud Palace Conquered!', '🏰 Istana Awan Megah Takluk!')],
      encounterEmojis: ['☁️', '🌈', '⭐', '🧚', '🏝️', '🎵', '⚖️', '🦄', '⛩️', '🏰']
    },
    10: {
      name: T('Dragon\'s Lair', 'Sarang Naga'),
      skyTop: '#2A0B10', skyBot: '#5E1B23',
      groundColor: '#301A1D', hillsBack: '#2E1116',
      roadColor: '#8C4B3C', roadBorder: '#481912',
      goalEmoji: '🐉',
      props: [
        { e: '🌋', x: 30, y: 70, s: 32 }, { e: '🔥', x: 125, y: 80, s: 24 },
        { e: '🦎', x: 220, y: 140, s: 24 }, { e: '🪨', x: 315, y: 80, s: 26 },
        { e: '💥', x: 415, y: 75, s: 26 }, { e: '🥚', x: 510, y: 80, s: 26 },
        { e: '⛓️', x: 605, y: 75, s: 26 }, { e: '🗡️', x: 700, y: 75, s: 28 },
        { e: '🔥', x: 795, y: 80, s: 26 }
      ],
      encounters: [T('🌋 Fire Crater Mouth', '🌋 Mulut Kawah Berapi'), T('🔥 Glowing Magma Tongue', '🔥 Lidah Magma Membara'), T('🦎 Lava Rock Salamander', '🦎 Salamander Batu Lahar'), T('🪨 Black Obsidian Cliff', '🪨 Tebing Obsidian Hitam'), T('💥 Fireball Burst', '💥 Ledakan Bara Api'), T('🥚 Ancient Golden Dragon Egg', '🥚 Telur Naga Emas Kuno'), T('⛓️ Locking Iron Chain', '⛓️ Rantai Besi Pengunci'), T('🗡️ True Hero Sword', '🗡️ Pedang Pahlawan Sejati'), T('🔥 Dragon Fire Breath', '🔥 Napas Api Sang Naga'), T('🐉 Great Dragon Defeated!', '🐉 Sang Naga Agung Ditaklukkan!')],
      encounterEmojis: ['🌋', '🔥', '🦎', '🪨', '💥', '🥚', '⛓️', '🗡️', '🔥', '🐉']
    }
  };

  /** Kurva jalan setapak halus menghubungkan kemah awal dan seluruh 10 pos */
  function stageSplineD(pts) {
    var p = [{ x: 25, y: 160 }].concat(pts);
    var d = 'M ' + p[0].x + ',' + p[0].y;
    for (var i = 0; i < p.length - 1; i++) {
      var p0 = p[i - 1] || p[i];
      var p1 = p[i], p2 = p[i + 1];
      var p3 = p[i + 2] || p2;
      d += ' C ' + (p1.x + (p2.x - p0.x) / 6) + ',' + (p1.y + (p2.y - p0.y) / 6) +
        ' ' + (p2.x - (p3.x - p1.x) / 6) + ',' + (p2.y - (p3.y - p1.y) / 6) +
        ' ' + p2.x + ',' + p2.y;
    }
    return d;
  }

  /** Render bagian dalam SVG kanvas 2D panggung petualangan */
  function buildAdvStageSVGInner(chapterNo, currentIndex, T, pts) {
    var dFull = stageSplineD(pts);
    var dDone = currentIndex > 0 ? stageSplineD(pts.slice(0, Math.min(currentIndex, pts.length))) : '';
    var p = MG.db.getPlayer();
    var playerAvatar = (p && p.avatar) ? p.avatar : '🙂';
    var curPos = pts[Math.min(currentIndex, pts.length - 1)] || pts[0];
    var encEmoji = (T.encounterEmojis && T.encounterEmojis[currentIndex]) ? T.encounterEmojis[currentIndex] : '👾';

    var out = '<defs>' +
      '<linearGradient id="advSkyGrad" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0%" stop-color="' + T.skyTop + '"/>' +
        '<stop offset="100%" stop-color="' + T.skyBot + '"/>' +
      '</linearGradient>' +
    '</defs>' +
    '<rect width="1000" height="220" fill="url(#advSkyGrad)"/>';

    if (T.sun) {
      out += '<circle cx="' + T.sun.cx + '" cy="' + T.sun.cy + '" r="' + T.sun.r + '" fill="' + T.sun.fill + '" opacity=".85"/>';
    }

    out += '<path d="M 0,135 Q 240,65 500,115 T 1000,95 L 1000,220 L 0,220 Z" fill="' + T.hillsBack + '"/>' +
      '<path d="M 0,165 Q 260,115 520,155 T 1000,135 L 1000,220 L 0,220 Z" fill="' + T.groundColor + '"/>';

    if (T.river) {
      out += '<path d="M 0,185 Q 280,145 540,180 T 1000,160 L 1000,220 L 0,220 Z" fill="#2980B9" opacity=".6"/>';
    }

    if (T.props) {
      T.props.forEach(function (pr) {
        out += '<text x="' + pr.x + '" y="' + pr.y + '" font-size="' + pr.s + '" text-anchor="middle" ' +
          'style="user-select:none;pointer-events:none;filter:drop-shadow(0 2px 3px rgba(0,0,0,.2));">' + pr.e + '</text>';
      });
    }

    out += '<path class="trail-stage-border" d="' + dFull + '" stroke="' + T.roadBorder + '"/>' +
      '<path class="trail-stage-base" d="' + dFull + '" stroke="' + T.roadColor + '"/>' +
      '<path class="trail-stage-dash" d="' + dFull + '"/>' +
      (dDone ? '<path class="trail-stage-done" d="' + dDone + '"/>' : '') +
      '<text x="24" y="166" font-size="24" text-anchor="middle" style="user-select:none;">⛺</text>';

    pts.forEach(function (pos, i) {
      if (i < currentIndex) {
        out += '<g class="adv-wp cleared" data-index="' + i + '">' +
          '<circle cx="' + pos.x + '" cy="' + pos.y + '" r="15" class="adv-wp-circle"/>' +
          '<text x="' + pos.x + '" y="' + (pos.y + 1) + '" class="adv-wp-label">✓</text>' +
          '<text x="' + pos.x + '" y="' + (pos.y + 24) + '" font-size="9.5" font-weight="900" fill="#fff" text-anchor="middle" style="filter:drop-shadow(0 1px 2px rgba(0,0,0,.6));">' + MG.t('Stop ', 'Pos ') + (i + 1) + '</text>' +
          '</g>';
      } else if (i === currentIndex) {
        out += '<g class="adv-wp current" data-index="' + i + '">' +
          '<circle cx="' + pos.x + '" cy="' + pos.y + '" r="22" class="adv-beacon"/>' +
          '<circle cx="' + pos.x + '" cy="' + pos.y + '" r="17" class="adv-wp-circle"/>' +
          '<text x="' + pos.x + '" y="' + (pos.y + 1) + '" class="adv-wp-label">' + (i + 1) + '</text>' +
          '<text x="' + pos.x + '" y="' + (pos.y + 26) + '" font-size="10.5" font-weight="900" fill="#FFD166" text-anchor="middle" style="filter:drop-shadow(0 1px 3px rgba(0,0,0,.8));">' + MG.t('📍 Stop ', '📍 Pos ') + (i + 1) + '</text>' +
          '</g>';
      } else {
        out += '<g class="adv-wp upcoming" data-index="' + i + '">' +
          '<circle cx="' + pos.x + '" cy="' + pos.y + '" r="13" class="adv-wp-circle"/>' +
          '<text x="' + pos.x + '" y="' + (pos.y + 1) + '" class="adv-wp-label">' + (i + 1) + '</text>' +
          '<text x="' + pos.x + '" y="' + (pos.y + 22) + '" font-size="9" font-weight="900" fill="rgba(255,255,255,.75)" text-anchor="middle" style="filter:drop-shadow(0 1px 2px rgba(0,0,0,.6));">' + MG.t('Stop ', 'Pos ') + (i + 1) + '</text>' +
          '</g>';
      }
    });

    out += '<text x="940" y="75" font-size="36" text-anchor="middle" style="user-select:none;filter:drop-shadow(0 4px 6px rgba(0,0,0,.3));">' + (T.goalEmoji || '🏆') + '</text>';

    out += '<g id="adv-hero-sprite" class="adv-hero-sprite" style="transform:translate(' + curPos.x + 'px,' + (curPos.y - 4) + 'px);">' +
      '<ellipse cx="0" cy="18" rx="14" ry="5" fill="rgba(0,0,0,.32)"/>' +
      '<g class="hero-body">' +
      '<circle cx="0" cy="-6" r="15" fill="#fff" stroke="#5B4BE8" stroke-width="2.5"/>' +
      '<text x="0" y="0" font-size="19" text-anchor="middle" style="user-select:none;">' + playerAvatar + '</text>' +
      '<text x="8" y="-14" font-size="15" style="user-select:none;">🪶</text>' +
      '</g>' +
      '</g>';

    out += '<g id="adv-target-sprite" class="adv-target-sprite" style="transform:translate(' + (curPos.x + 28) + 'px,' + (curPos.y - 10) + 'px);">' +
      '<ellipse cx="0" cy="16" rx="12" ry="4" fill="rgba(0,0,0,.28)"/>' +
      '<text x="0" y="8" font-size="24" text-anchor="middle" style="user-select:none;">' + encEmoji + '</text>' +
      '<circle cx="10" cy="-12" r="7" fill="#E74C3C" stroke="#fff" stroke-width="1.5"/>' +
      '<text x="10" y="-8" font-size="9" font-weight="900" fill="#fff" text-anchor="middle">!</text>' +
      '</g>';

    return out;
  }

  /** Inisialisasi kanvas panggung petualangan 2D */
  function initAdvStage(chapterNo) {
    var LV = MG.advLevel(chapterNo);
    var T = ADV_THEMES[chapterNo] || ADV_THEMES[1];
    var badge = $('#adv-hud-badge');
    var name = $('#adv-hud-name');
    var sc = $('#adv-hud-score');

    if (badge) badge.textContent = '🧭 ' + MG.levelLabel('adv', chapterNo);
    if (name) name.textContent = LV ? LV.title : T.name;
    if (sc) sc.textContent = '0';

    updateAdvStage(0, false);
  }

  /** Geser viewport peta agar karakter pahlawan tetap di tengah layar */
  function scrollHeroToCenter(heroX) {
    var wrap = $('#adv-stage-canvas-wrap');
    if (!wrap) return;
    var wrapW = wrap.clientWidth || 300;
    var targetScroll = Math.max(0, heroX - (wrapW / 2));
    try {
      wrap.scrollTo({ left: targetScroll, behavior: 'smooth' });
    } catch (e) {
      wrap.scrollLeft = targetScroll;
    }
  }

  /** Perbarui posisi karakter, simpul, dan rintangan di panggung 2D */
  function updateAdvStage(currentIndex, isHop) {
    var st = MG.game.state();
    if (!st || st.track !== 'adv') return;
    var ch = st.level;
    var T = ADV_THEMES[ch] || ADV_THEMES[1];
    var pts = ADV_STAGE_POS;
    var curPos = pts[Math.min(currentIndex, pts.length - 1)] || pts[0];

    var sc = $('#adv-hud-score');
    if (sc) sc.textContent = st.score;

    var ind = $('#adv-step-indicator');
    if (ind) ind.textContent = MG.t('📍 Stop ', '📍 Pos ') + (currentIndex + 1) + MG.t(' of ', ' dari ') + 10;

    var enc = $('#adv-step-encounter');
    var encText = (T.encounters && T.encounters[currentIndex]) ? T.encounters[currentIndex] : (MG.t('Stop ', 'Tantangan Pos ') + (currentIndex + 1));
    if (enc) enc.textContent = MG.t('Challenge: ', 'Tantangan: ') + encText;

    var svg = $('#adv-stage-svg');
    if (svg) {
      svg.innerHTML = buildAdvStageSVGInner(ch, currentIndex, T, pts);
      var hero = $('#adv-hero-sprite');
      if (hero && isHop) {
        hero.classList.add('hero-hop');
      }
    }

    scrollHeroToCenter(curPos.x);
  }

  /** Animasi reaksi pahlawan & rintangan saat menjawab */
  function advHeroReact(type) {
    var hero = $('#adv-hero-sprite');
    var target = $('#adv-target-sprite');
    if (!hero) return;
    if (type === 'win') {
      hero.classList.remove('hero-win', 'hero-hurt', 'hero-hop');
      void hero.offsetWidth;
      hero.classList.add('hero-win');
      if (target) target.classList.add('target-cleared');
    } else if (type === 'hurt') {
      hero.classList.remove('hero-win', 'hero-hurt', 'hero-hop');
      void hero.offsetWidth;
      hero.classList.add('hero-hurt');
    }
  }

  /** Tampilkan modal Peta Seluruh Kerajaan (10 Bab) */
  function showAdvWorldMap() {
    var modal = $('#adv-world-modal');
    var wrap = $('#adv-world-map-wrap');
    var summary = $('#adv-world-summary');
    if (!modal || !wrap) return;

    var st = MG.game.state();
    var currentBab = st ? st.level : 1;
    var levels = MG.CONFIG.ADV_LEVELS;
    var progress = MG.db.getAllProgress('adv');
    var unlocked = MG.db.getUnlockedLevel('adv');
    var totalStars = MG.db.getStars('adv');

    if (summary) {
      summary.textContent = T('Chapter ', 'Bab ') + currentBab + T(' of ', ' dari ') + 10 + ' · ⭐ ' + totalStars + T(' Stars Collected', ' Bintang Terkumpul');
    }

    var html = '<div class="adv-world-grid">';
    levels.forEach(function (LV) {
      var p = progress[LV.n];
      var isCur = LV.n === currentBab;
      var isLock = LV.n > unlocked;
      var isClear = p && p.cleared;
      var stars = p ? p.best_stars : 0;
      var starTxt = '';
      for (var s = 0; s < 3; s++) starTxt += (s < stars ? '⭐' : '☆');

      html += '<div class="adv-world-card' + (isCur ? ' active' : '') + (isClear ? ' cleared' : '') + (isLock ? ' locked' : '') + '">' +
        '<span class="card-emoji">' + LV.emoji + '</span>' +
        '<div class="card-info">' +
          '<strong class="card-title">' + T('Chapter ', 'Bab ') + LV.n + ' · ' + LV.title + '</strong>' +
          '<span class="card-sub">' + (isCur ? T('📍 Playing now', '📍 Sedang Dimainkan') : isClear ? T('Cleared (', 'Tuntas (') + starTxt + ')' : isLock ? T('🔒 Locked', '🔒 Terkunci') : T('Available', 'Tersedia')) + '</span>' +
        '</div>' +
        '<span class="card-badge">' + (isCur ? T('NOW', 'KINI') : isClear ? T('DONE', 'SELESAI') : isLock ? T('LOCKED', 'KUNCI') : T('OPEN', 'BUKA')) + '</span>' +
      '</div>';
    });
    html += '</div>';

    wrap.innerHTML = html;
    modal.hidden = false;
    modal.classList.add('show');
  }

  function hideAdvWorldMap() {
    var modal = $('#adv-world-modal');
    if (!modal) return;
    modal.classList.remove('show');
    modal.hidden = true;
  }

  /* ============================================================
   *  PEMAIN BANYAK ORANG
   * ============================================================ */

  var draftAvatar = null;
  var draftGrade = 1;

  function gradeName(g) { return T('Grade ', 'Kelas ') + (g || 1); }

  function buildGradePicker(box, selected, onPick) {
    if (!box) return;
    box.innerHTML = '';
    for (var g = 1; g <= 6; g++) {
      (function (n) {
        var b = el('button', n === selected ? 'on' : '', String(n));
        b.title = T('Grade ', 'Kelas ') + n;
        on(b, 'click', function () {
          $$('#' + box.id + ' button').forEach(function (x) { x.classList.remove('on'); });
          b.classList.add('on');
          MG.audio.play('tap');
          onPick(n);
        });
        box.appendChild(b);
      })(g);
    }
  }

  function buildAvatarPicker(box, selected, onPick) {
    if (!box) return;
    box.innerHTML = '';
    MG.CONFIG.AVATARS.forEach(function (a) {
      var b = el('button', a === selected ? 'on' : '', a);
      on(b, 'click', function () {
        $$('#' + box.id + ' button').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        MG.audio.play('tap');
        onPick(a);
      });
      box.appendChild(b);
    });
  }

  UI.renderPlayers = function () {
    var grid = $('#player-grid');
    if (!grid) return;
    grid.innerHTML = '';

    var activeId = MG.db.activePlayerId();
    var players = MG.db.listPlayers();

    if (!players.length) {
      grid.innerHTML = '<p class="hint-text" style="text-align:center">' + T('No players yet. Add one below.', 'Belum ada pemain. Tambahkan dulu di bawah.') + '</p>';
      return;
    }

    players.forEach(function (p) {
      var s = MG.db.playerSummary(p.id);
      var card = el('button', 'pcard' + (p.id === activeId ? ' active' : ''));
      card.style.borderColor = p.id === activeId ? '' : (p.color || '');
      if (p.color) card.style.boxShadow = '0 0 0 3px ' + p.color + '33, var(--sh-md)';

      var when = T('Never played', 'Belum pernah main');
      if (s.lastSeen) when = T('Played ', 'Main ') + U.formatDate(s.lastSeen);

      card.innerHTML =
        (p.id === activeId ? '<span class="p-tag">' + T('ACTIVE', 'AKTIF') + '</span>' : '') +
        (players.length > 1 ? '<span class="p-del" title="' + T('Delete player', 'Hapus pemain') + '">🗑️</span>' : '') +
        '<span class="p-av">' + U.esc(p.avatar) + '</span>' +
        '<span class="p-name">' + U.esc(p.name) + '</span>' +
        '<span class="p-meta">' + gradeName(p.grade) + '</span>' +
        '<span class="p-stats">' +
        '<span>⭐ ' + s.stars + '</span>' +
        '<span>✅ ' + s.cleared + '</span>' +
        '<span>🎯 ' + Math.round(s.accuracy * 100) + '%</span>' +
        '</span>' +
        '<span class="p-meta">' + U.esc(when) + '</span>';

      card.title = p.name + ' — ' + gradeName(p.grade) + ' · ' + s.stars + T(' stars, ', ' bintang, ') +
        s.cleared + T(' levels done', ' level selesai');

      // tombol hapus (saat ini kartu adalah <button>, jadi butuh stopPropagation)
      var del = card.querySelector('.p-del');
      if (del) {
        on(del, 'click', function (ev) {
          ev.stopPropagation();
          ev.preventDefault();
          UI.confirmDeletePlayer(p);
        });
      }

      on(card, 'click', function () {
        MG.audio.play('click');
        UI.switchPlayer(p.id);
      });

      grid.appendChild(card);
    });
  };

  UI.confirmDeletePlayer = function (p) {
    var s = MG.db.playerSummary(p.id);
    U.modal({
      emoji: '🗑️', title: T('Delete player ', 'Hapus pemain ') + p.name + '?',
      text: T('Progress for <b>', 'Progres <b>') + U.esc(p.name) + '</b> (' + s.stars + T(' stars, ', ' bintang, ') +
        s.cleared + T(' levels done', ' level selesai') + T(') will be deleted forever from this device. ', ') akan dihapus permanen dari perangkat ini. ') +
        T('Other players are <b>not</b> affected.', 'Pemain lain <b>tidak</b> terpengaruh.'),
      buttons: [
        { label: T('Cancel', 'Batal'), cls: 'btn-ghost' },
        {
          label: T('Yes, Delete', 'Ya, Hapus'), cls: 'btn-danger', onClick: function () {
            var ok = MG.db.deletePlayer(p.id);
            if (!ok) { U.toast(T('The last player cannot be deleted.', 'Pemain terakhir tidak bisa dihapus.'), 'warn'); return; }
            MG.audio.play('lose');
            U.toast(T('Player ', 'Pemain ') + p.name + T(' deleted.', ' dihapus.'));
            UI.renderPlayers();
            UI.refreshHome();
            MG.db.saveNow();
          }
        }
      ]
    });
  };

  /** Ganti pemain aktif lalu muat ulang semua layar. */
  UI.switchPlayer = function (id) {
    var p = MG.db.selectPlayer(id);
    if (!p) { U.toast(T('Player not found.', 'Pemain tidak ditemukan.'), 'err'); return; }

    UI.applyPlayerSettings();
    UI.refreshHome();
    UI.renderPlayers();
    MG.db.publishScore(true);
    MG.db.saveNow();
    U.toast(T('Hello, ', 'Halo, ') + p.name + '! 👋');
    UI.show('home');
  };

  /* ---- form pemain baru ---- */
  UI.openNewPlayerForm = function () {
    var card = $('#card-new-player');
    if (!card) return;
    draftGrade = 1;
    draftAvatar = MG.CONFIG.AVATARS[Math.floor(Math.random() * MG.CONFIG.AVATARS.length)];
    $('#inp-pname').value = '';
    buildGradePicker($('#grade-picker'), 1, function (g) { draftGrade = g; });
    buildAvatarPicker($('#new-avatar-picker'), draftAvatar, function (a) { draftAvatar = a; });
    card.hidden = false;
    MG.audio.play('whoosh');
    try { $('#inp-pname').focus(); } catch (e) { }
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  UI.closeNewPlayerForm = function () {
    var card = $('#card-new-player');
    if (card) card.hidden = true;
  };

  UI.saveNewPlayer = function () {
    var input = $('#inp-pname');
    var name = input ? input.value.trim() : '';
    if (!name) {
      U.toast(T('Please write the player\'s name first.', 'Tuliskan nama pemain dulu ya.'), 'warn');
      if (input) input.focus();
      return;
    }
    var p = MG.db.createPlayer(name, draftAvatar || '🙂', draftGrade);
    UI.closeNewPlayerForm();
    UI.applyPlayerSettings();
    MG.audio.play('badge');
    U.toast(T('New player is ready to play! 🎉', 'Pemain baru siap main! 🎉'));
    UI.renderPlayers();
    UI.refreshHome();
    MG.db.saveNow();
    UI.show('home');
    return p;
  };

  /* ============================================================
   *  PAPAN PERINGKAT
   * ============================================================ */

  var lbTab = 'local';
  var lbRows = [];
  var lbLoading = false;

  UI.setLeaderboardTab = function (tab) {
    lbTab = tab;
    $$('#lb-tabs button').forEach(function (b) {
      b.classList.toggle('on', b.getAttribute('data-tab') === tab);
    });
    UI.renderLeaderboard();
  };

  UI.renderLeaderboard = function () {
    var podium = $('#lb-podium');
    var tbody = $('#lb-tbody');
    var note = $('#lb-note');
    var sub = $('#lb-sub');
    if (!podium || !tbody) return;

    var me = MG.db.getPlayer();

    if (lbTab === 'local') {
      if (sub) sub.textContent = T('All players on this device (', 'Semua pemain di perangkat ini (') +
        MG.db.playerCount() + T(' players)', ' orang)');
      lbRows = MG.db.getLocalLeaderboard(20);
      lbLoading = false;
      if (note) {
        note.textContent = T('Ranking is based on stars, levels cleared, then accuracy. ', 'Peringkat dihitung dari bintang, level yang selesai, lalu ketelitian. ') +
          T('This data is saved on this device, so it stays even without the internet.', 'Data ini tersimpan di perangkat ini, jadi tetap ada tanpa internet.');
      }
      drawLeaderboard(podium, tbody, lbRows);
      return;
    }

    // ---- tab online ----
    if (!MG.db.onlineAvailable()) {
      if (sub) sub.textContent = T('Ranking from the server', 'Peringkat dari server');
      lbRows = [];
      drawLeaderboard(podium, tbody, []);
      if (note) {
        note.innerHTML = T('The online leaderboard needs a server. Run <code>node server.js</code> ', 'Papan peringkat online butuh server. Jalankan <code>node server.js</code> ') +
          T('or double-click <code>Main Game.command</code>, then open the address that shows up in your browser.', 'atau klik 2x <code>Main Game.command</code>, lalu buka lewat alamat yang muncul di browser.');
      }
      return;
    }

    if (lbLoading) return;
    lbLoading = true;
    drawLeaderboard(podium, tbody, lbRows);
    if (sub) sub.textContent = T('Loading ranking from the server…', 'Memuat peringkat dari server…');

    // kirim skor kita dulu supaya peringkat di server selalu ter-update
    MG.db.publishScore(true).then(function () {
      return MG.db.fetchLeaderboard(20);
    }).then(function (res) {
      lbLoading = false;
      if (UI.current() !== 'leaderboard') return;
      if (!res.ok) {
        if (sub) sub.textContent = T('Ranking from the server', 'Peringkat dari server');
        lbRows = [];
        drawLeaderboard(podium, tbody, []);
        if (note) note.textContent = T('The server cannot be reached. Check whether server.js is still running.', 'Server tidak bisa dihubungi. Cek apakah server.js masih berjalan.');
        return;
      }
      lbRows = res.rows.map(function (r) {
        return Object.assign({}, r, { isMe: !!(r.uid && me && r.uid === me.uid) });
      });
      if (sub) {
        sub.textContent = res.rows.length
          ? res.rows.length + T(' registered players', ' pemain terdaftar')
          : T('No players on the server yet', 'Belum ada pemain di server');
      }
      if (note) {
        var txt = T('This ranking is shared with all devices using the same server. ', 'Peringkat ini dibagikan ke semua perangkat yang memakai server yang sama. ');
        if (res.myRank) txt += T('Your position: #', 'Posisimu: #') + res.myRank + T(' of ', ' dari ') + (res.total || res.rows.length) + '.';
        note.textContent = txt;
      }
      drawLeaderboard(podium, tbody, lbRows);
    });
  };

  function drawLeaderboard(podium, tbody, rows) {
    // podium untuk 3 teratas
    podium.innerHTML = '';
    var top = rows.slice(0, 3);
    var order = [1, 0, 2];    // tampilkan nominee ke-2, ke-1, ke-3
    order.forEach(function (idx) {
      var r = top[idx];
      if (!r) return;
      var medal = ['🥇', '🥈', '🥉'][idx];
      var pod = el('div', 'lb-pod p' + (idx + 1),
        '<span class="lb-medal">' + medal + '</span>' +
        '<span class="lb-av">' + U.esc(r.avatar || '🙂') + '</span>' +
        '<span class="lb-name">' + U.esc(r.name) + '</span>' +
        '<span class="lb-stars">⭐ ' + r.stars + '</span>' +
        '<span class="lb-points">' + U.thousand(r.points != null ? r.points : 0) + T(' points', ' poin') + '</span>');
      pod.title = T('Rank ', 'Peringkat ') + (idx + 1) + ': ' + r.name;
      podium.appendChild(pod);
    });

    // tabel lengkap
    tbody.innerHTML = '';
    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#6B6490">' +
        T('No data yet. Play one level first! 🎮', 'Belum ada data peringkat. Mainkan satu level dulu ya! 🎮') + '</td></tr>';
      return;
    }

    var meUid = (MG.db.getPlayer() || {}).uid;
    rows.forEach(function (r, i) {
      var isMe = !!(meUid && r.uid && r.uid === meUid);
      var tr = el('tr', isMe ? 'me' : '');
      tr.innerHTML =
        '<td>' + (r.rank != null ? r.rank : i + 1) + '</td>' +
        '<td><span class="lb-who"><span>' + U.esc(r.avatar || '🙂') + '</span>' +
        '<span>' + U.esc(r.name) + (isMe ? T(' (you)', ' (kamu)') : '') + '</span></span></td>' +
        '<td>' + r.stars + '</td>' +
        '<td>' + r.cleared + '/' + MG.totalLevels() + '</td>' +
        '<td>' + Math.round((r.accuracy || 0) * 100) + '%</td>' +
        '<td>' + U.thousand(r.points != null ? r.points : 0) + '</td>';
      tbody.appendChild(tr);
    });
  }

  /* ============================================================
   *  MULAI LEVEL
   * ============================================================ */

  /** Bab petualangan yang ceritanya sudah ditampilkan pada sesi ini. */
  var storyShown = {};

  UI.startLevel = function (n, track) {
    track = MG.normTrack(track);
    // Samakan tab jalur dengan level yang sedang dibuka.
    if (levelTrack !== track) {
      levelTrack = track;
      $$('#track-tabs button').forEach(function (b) {
        b.classList.toggle('on', b.getAttribute('data-track') === track);
      });
    }

    // Jalur Petualangan: buka tiap bab dengan cerita (cukup sekali per sesi).
    var LV = MG.levelOf(track, n);
    if (track === 'adv' && LV && LV.story && !storyShown['adv-' + n]) {
      storyShown['adv-' + n] = 1;
      MG.audio.play('whoosh');
      U.modal({
        emoji: LV.emoji,
        title: MG.levelLabel('adv', n) + ' — ' + LV.title,
        text: '<b>' + LV.desc + '</b><br><br>' + LV.story,
        buttons: [
          { label: T('🎮 Start Adventure', '🎮 Mulai Petualangan'), cls: 'btn-primary', onClick: function () { beginLevel(n, track); } },
          { label: T('Maybe later', 'Nanti dulu'), onClick: function () { if (currentScreen !== 'home') UI.show('levels'); } }
        ]
      });
      return;
    }
    beginLevel(n, track);
  };

  function beginLevel(n, track) {
    track = MG.normTrack(track);
    var s = MG.game.start(n, track);
    var LV = s.levelInfo;

    var playScreen = $('#screen-play');
    if (track === 'adv') {
      playScreen.classList.add('is-adv-mode');
      var advStage = $('#adv-play-stage');
      if (advStage) advStage.hidden = false;
      initAdvStage(n);
    } else {
      playScreen.classList.remove('is-adv-mode');
      var advStage2 = $('#adv-play-stage');
      if (advStage2) advStage2.hidden = true;
    }

    $('#play-level-name').innerHTML = '<span style="font-size:20px">' + LV.emoji + '</span> ' +
      MG.levelLabel(track, n) + ' · ' + LV.title;
    $('#play-score').textContent = '0';
    $('#btn-nextlevel').style.display = '';
    $('#btn-nextlevel').disabled = (n >= MG.levelCount(track));

    MG.audio.play('whoosh');
    UI.show('play');
    UI.nextQuestion();
  }

  /* ============================================================
   *  MASKOT BOBI & PESAN MENARIK
   * ============================================================ */
  var CHEER_TEXTS = [
    T('Come on, focus! You can do it! ⭐', 'Ayo fokus! Kamu pasti bisa! ⭐'),
    T('Read the question carefully! 💡', 'Baca soal dengan teliti ya! 💡'),
    T('You can surely answer it! 🚀', 'Pasti bisa dijawab! 🚀'),
    T('Bobi is cheering for you! Go for it! 🧸', 'Bobi mendukungmu! Semangat! 🧸'),
    T('Math is fun and magical! ✨', 'Matematika itu seru dan ajaib! ✨'),
    T('Cool! Let\'s finish this question! 🎯', 'Keren! Yuk selesaikan soal ini! 🎯')
  ];

  var PRAISES = [
    { title: T('Amazing! 🌟', 'Luar Biasa! 🌟'), emoji: '🌟' },
    { title: T('Right on Target! 🎯', 'Tepat Sasaran! 🎯'), emoji: '🎯' },
    { title: T('So Great! 🚀', 'Hebat Sekali! 🚀'), emoji: '🚀' },
    { title: T('Super Fast! ⚡', 'Super Cepat! ⚡'), emoji: '⚡' },
    { title: T('Smart Answer! 💡', 'Jawaban Pintar! 💡'), emoji: '💡' },
    { title: T('So Cool! 😎', 'Keren Banget! 😎'), emoji: '😎' },
    { title: T('Little Mathematician! 🎓', 'Matematikawan Cilik! 🎓'), emoji: '🎓' },
    { title: T('Correct! Smart! 🎊', 'Benar! Pintar! 🎊'), emoji: '🎉' }
  ];

  var ENCOURAGEMENTS = [
    T('Don\'t give up, you can do it! 💪', 'Jangan menyerah, kamu pasti bisa! 💪'),
    T('That\'s okay, let\'s learn from it! ✨', 'Tidak apa-apa, ayo belajar dari sini! ✨'),
    T('Take a breath, focus on the next question! 🌈', 'Tarik napas, fokus soal berikutnya! 🌈'),
    T('Almost right! Keep it up! 🚀', 'Sedikit lagi benar! Tetap semangat! 🚀'),
    T('Every try makes you smarter! 💡', 'Setiap mencoba membuatmu makin pintar! 💡')
  ];

  var MATH_FACTS = [
    T('Honeybee combs are hexagonal because that shape saves the most space and is the sturdiest shape in nature!', 'Sarang lebah madu berbentuk segi enam (heksagonal) karena itu bentuk paling hemat ruang dan paling kokoh di alam!'),
    T('The number zero (0) was first widely used in ancient India and introduced to the world by the scientist Al-Khawarizmi!', 'Angka nol (0) pertama kali dikembangkan secara luas di India kuno dan diperkenalkan ke dunia oleh ilmuwan Al-Khawarizmi!'),
    T('The equals sign \'=\' was created in 1557 by Robert Recorde because nothing is more equal than two parallel lines!', 'Tanda sama dengan \'=\' diciptakan tahun 1557 oleh Robert Recorde karena tidak ada dua hal yang lebih sama dari dua garis sejajar!'),
    T('Analog wall clocks turn clockwise, following the shadow of a sundial in the northern hemisphere!', 'Jam dinding analog berputar searah jarum jam mengikuti arah bayangan jam matahari di belahan bumi utara!'),
    T('Adding all the numbers from 1 to 100 (1 + 2 + 3 + ... + 100) gives exactly 5,050!', 'Jumlah angka 1 sampai 100 jika dijumlahkan semuanya (1 + 2 + 3 + ... + 100) hasilnya tepat 5.050!'),
    T('Cats have 18 toes: 5 toes on each front paw and 4 toes on each back paw!', 'Kucing memiliki 18 jari kaki: 5 jari di setiap kaki depan dan 4 jari di setiap kaki belakang!'),
    T('A sphere has the smallest surface area for holding the biggest volume of air!', 'Bola adalah bangun ruang yang memiliki luas permukaan terkecil untuk menampung volume udara terbanyak!'),
    T('Any number multiplied by zero (0) always gives zero!', 'Bilangan berapa pun jika dikalikan dengan nol (0) hasilnya akan selalu nol!'),
    T('A circle makes one full turn of exactly 360 degrees!', 'Sebuah lingkaran memiliki sudut putaran penuh tepat 360 derajat!'),
    T('The radius of a circle is always exactly half the length of the diameter!', 'Jari-jari lingkaran selalu tepat setengah dari panjang diameter (garis tengahnya)!'),
    T('Triangles are the sturdiest shape in buildings because they cannot change shape without breaking their sides!', 'Segitiga adalah bentuk paling kokoh dalam arsitektur karena bentuknya tidak bisa berubah tanpa merusak sisinya!'),
    T('When you roll a standard die, the two opposite sides always add up to 7!', 'Jika kamu melempar sebuah dadu standar, jumlah dua sisi yang saling berhadapan selalu sama dengan 7!'),
    T('The number 2 is the only even number that is also a prime number!', 'Angka 2 adalah satu-satunya bilangan genap yang juga merupakan bilangan prima!'),
    T('Sunflowers grow their seeds in a very tidy spiral, following the Fibonacci math pattern!', 'Bunga matahari menumbuhkan biji-bijinya mengikuti pola spiral deret matematika Fibonacci yang sangat rapi!'),
    T('One day has 24 hours, which is 1,440 minutes, or 86,400 seconds!', 'Dalam satu hari ada 24 jam, atau sama dengan 1.440 menit, atau 86.400 detik!'),
    T('Ancient Roman numbers had no symbol for zero (0)!', 'Angka romawi kuno tidak memiliki simbol atau lambang untuk angka nol (0)!'),
    T('A four-sided flat shape always has angles that add up to exactly 360 degrees!', 'Sebuah bangun datar segi empat selalu memiliki jumlah sudut total tepat 360 derajat!')
  ];

  UI.updateBobi = function (mood, speech) {
    var artEl = $('#play-bobi-art');
    var speechEl = $('#play-bobi-speech');
    var bobiBox = $('#play-bobi');
    if (artEl) artEl.innerHTML = MG.art.mascot(mood || 'happy', 30);
    if (speechEl && speech) speechEl.textContent = speech;
    if (bobiBox) {
      bobiBox.classList.remove('bobi-pop');
      void bobiBox.offsetWidth;
      bobiBox.classList.add('bobi-pop');
    }
  };

  /* ============================================================
   *  SOAL BERIKUTNYA
   * ============================================================ */
  UI.nextQuestion = function () {
    var st = MG.game.state();
    var q;

    if (st.index >= st.questions.length) { UI.finishGame(); return; }
    q = MG.game.beginQuestion();

    if (!q) { UI.finishGame(); return; }

    var total = MG.game.state().questions.length;
    $('#play-qnum').textContent = (st.index + 1) + '/' + total;
    $('#play-progress').style.width = (st.index / total * 100) + '%';
    UI.renderHearts();

    // semangati lewat Bobi
    var bobiSpeech = (st.track === 'adv')
      ? (T('Move to stop ', 'Maju ke Pos ') + (st.index + 1) + T('! Let\'s conquer the challenge! 🧭', '! Ayo taklukkan tantangannya! 🧭'))
      : CHEER_TEXTS[st.index % CHEER_TEXTS.length];
    UI.updateBobi('happy', bobiSpeech);

    if (st.track === 'adv') {
      updateAdvStage(st.index, true);
    }

    // kartu soal
    var card = $('#q-card');
    card.style.animation = 'none';
    void card.offsetWidth;           // paksa reflow agar animasi ulang
    card.style.animation = '';

    $('#q-art').innerHTML = MG.art.render(q.art);
    $('#q-text').innerHTML = q.text;
    $('#q-topic').textContent = q.topicName || '';

    // pilihan jawaban
    var box = $('#options');
    box.innerHTML = '';
    q.answers.forEach(function (a, i) {
      var b = el('button', 'opt', U.esc(a));
      b.style.animationDelay = (i * 0.06) + 's';
      b.setAttribute('data-key', 'ABCD'[i]);
      b.setAttribute('aria-label', T('Option ', 'Pilihan ') + 'ABCD'[i]);
      on(b, 'click', function () { UI.pickAnswer(i); });
      box.appendChild(b);
    });

    $('#btn-hint').disabled = !q.hint;
    // petunjuk disembunyikan lewat pengaturan -> tombol ikut hilang
    $('#btn-hint').style.display = MG.game.settings.hideHint ? 'none' : '';
    $('#btn-skip').disabled = false;
    UI.startTimer();

    // sapaan dari maskot untuk soal pertama
    if (st.index === 0) {
      UI.showBubble(T('Come on, first question! Pick the right answer 💪', 'Ayo, soal pertama! Pilih jawaban yang benar 💪'), 3500);
    }
  };

  /* ============================================================
   *  TIMER
   * ============================================================ */
  var timerRAF = null, timerStart = 0, timerLimit = 0, lastTickSec = -1;

  UI.startTimer = function () {
    UI.stopTimer();
    timerLimit = MG.game.timeForQuestion() * 1000;
    timerStart = performance.now();
    lastTickSec = -1;

    var wrap = $('#timer'), fill = $('#timer-fill'), label = $('#timer-label');
    var advWrap = $('#adv-timer'), advFill = $('#adv-timer-fill'), advLabel = $('#adv-timer-label');
    wrap.classList.remove('warn', 'danger');
    if (advWrap) advWrap.classList.remove('warn', 'danger');

    // Tanpa batas waktu: tampilkan penanda damai, tanpa hitung mundur.
    if (timerLimit <= 0) {
      wrap.classList.add('unlimited');
      fill.style.width = '100%';
      label.textContent = '∞';
      if (advWrap) {
        advWrap.classList.add('unlimited');
        if (advFill) advFill.style.width = '100%';
        if (advLabel) advLabel.textContent = '∞';
      }
      return;
    }
    wrap.classList.remove('unlimited');
    if (advWrap) advWrap.classList.remove('unlimited');

    function frame(now) {
      var left = Math.max(0, timerLimit - (now - timerStart));
      var pct = (left / timerLimit) * 100;
      fill.style.width = pct + '%';
      if (advFill) advFill.style.width = pct + '%';

      var secs = Math.ceil(left / 1000);
      if (secs !== lastTickSec) {
        lastTickSec = secs;
        label.textContent = secs + 's';
        if (advLabel) advLabel.textContent = secs + 's';
        if (secs <= 5 && secs > 0) MG.audio.play('tick');
        if (secs <= 3) {
          wrap.classList.add('danger');
          if (advWrap) advWrap.classList.add('danger');
        } else if (secs <= 8) {
          wrap.classList.add('warn');
          if (advWrap) advWrap.classList.add('warn');
        }
      }

      if (left <= 0) {
        UI.stopTimer();
        UI.timeUp();
        return;
      }
      timerRAF = requestAnimationFrame(frame);
    }
    timerRAF = requestAnimationFrame(frame);
  };

  UI.stopTimer = function () {
    if (timerRAF) cancelAnimationFrame(timerRAF);
    timerRAF = null;
  };

  /* ============================================================
   *  MENJAWAB
   * ============================================================ */
  UI.pickAnswer = function (i) {
    var st = MG.game.state();
    if (st.finished || $('#feedback').classList.contains('show')) return;
    if (st.answered > st.index) return;      // sudah dijawab soal ini

    UI.stopTimer();
    MG.audio.play('click');

    var q = st.questions[st.index];
    var res = MG.game.answer(i, false);
    var opts = $$('#options .opt');

    opts.forEach(function (b, k) { b.disabled = true; });
    opts[i].classList.add(res.correct ? 'correct' : 'wrong');
    if (!res.correct) opts[res.correctIndex].classList.add('correct');
    opts.forEach(function (b, k) { if (k !== i && k !== res.correctIndex) b.classList.add('dim'); });

    if (res.correct) {
      MG.audio.play('correct');
      if (st.track === 'adv') advHeroReact('win');
      if (res.combo >= 2) {
        MG.audio.play('combo', res.combo);
        UI.showCombo(res.combo);
        UI.updateBobi('cheer', T('Great! ', 'Hebat! ') + res.combo + T('× in a row! 🔥', '× beruntun! 🔥'));
      } else {
        UI.updateBobi('cheer', T('Correct! So cool! 🎉', 'Benar! Keren sekali! 🎉'));
      }
      FX.confettiSmall();
    } else {
      MG.audio.play('wrong');
      FX.shake();
      if (st.track === 'adv') advHeroReact('hurt');
      UI.renderHearts(res.hearts);
      UI.updateBobi('thinking', T('Try again! You can do it! 💪', 'Ayo coba lagi! Kamu pasti bisa! 💪'));
    }

    UI.showFeedback(res, q);
  };

  UI.timeUp = function () {
    var st = MG.game.state();
    if (st.finished || $('#feedback').classList.contains('show')) return;
    if (st.answered > st.index) return;

    MG.audio.play('timeout');
    var res = MG.game.answer(null, true);
    var opts = $$('#options .opt');
    opts.forEach(function (b) { b.disabled = true; b.classList.add('dim'); });
    opts[res.correctIndex].classList.remove('dim');
    opts[res.correctIndex].classList.add('correct');
    if (st.track === 'adv') advHeroReact('hurt');
    UI.renderHearts(res.hearts);
    UI.updateBobi('thinking', T('Time is up! Keep going! ⏰', 'Waktu habis! Tetap semangat ya! ⏰'));
    FX.shake();

    var q = st.questions[st.index];
    UI.showFeedback(res, q, true);
  };

  UI.showCombo = function (combo) {
    var d = el('div', 'combo-badge', '🔥 ' + combo + T('× in a row!', '× beruntun!'));
    document.body.appendChild(d);
    setTimeout(function () { d.remove(); }, 1600);
  };

  UI.renderHearts = function (override) {
    var st = MG.game.state();
    var h = override == null ? st.hearts : override;
    var box = $('#hearts');
    box.innerHTML = '';
    for (var i = 0; i < MG.CONFIG.START_HEARTS; i++) {
      box.appendChild(el('span', 'heart' + (i < h ? '' : ' lost'), i < h ? '❤️' : '🤍'));
    }
    var advBox = $('#adv-step-hearts');
    if (advBox) {
      advBox.innerHTML = '';
      for (var j = 0; j < MG.CONFIG.START_HEARTS; j++) {
        advBox.appendChild(el('span', 'heart' + (j < h ? '' : ' lost'), j < h ? '❤️' : '🤍'));
      }
    }
  };

  /* ============================================================
   *  UMPAN BALIK
   * ============================================================ */
  UI.showFeedback = function (res, q, timedOut) {
    var fb = $('#feedback');
    var title = $('#feedback-title');
    var sub = $('#feedback-sub');
    var emoji = $('#feedback-emoji');
    var next = $('#btn-next');

    if (res.correct) {
      var fast = res.timeMs <= 5000;
      var pr = PRAISES[Math.floor(Math.random() * PRAISES.length)];
      emoji.textContent = res.combo >= 3 ? '🔥' : (fast ? '⚡' : pr.emoji);
      title.textContent = res.combo >= 3 ? T('Great! ', 'Hebat! ') + res.combo + T('× in a row!', '× beruntun!') : pr.title;
      title.className = 'feedback-title good';
      var speedTxt = res.timeMs <= 3000 ? T('Lightning fast! ', 'Kilat! ') :
        res.timeMs <= 7000 ? T('Fast! ', 'Cepat! ') :
          res.timeMs <= 12000 ? '' : T('Slow, but correct. ', 'Pelan, tapi benar. ');
      sub.innerHTML = speedTxt + (res.combo > 1 ? T('Combo bonus ', 'Bonus beruntun ') + res.combo + '×!' : '') +
        '<br><span class="pt">+' + res.gained + T(' points', ' poin') + '</span>';
    } else {
      var enc = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
      emoji.textContent = timedOut ? '⏰' : '🤔';
      title.textContent = timedOut ? T('Time is up!', 'Waktu habis!') : T('Almost right!', 'Hampir benar!');
      title.className = 'feedback-title bad';
      sub.innerHTML = T('The correct answer: <b>', 'Jawaban yang benar: <b>') + U.esc(q.answers[res.correctIndex]) + '</b>' +
        (q.hint && !MG.game.settings.hideHint ? '<br><small>' + q.hint + '</small>' : '') +
        '<br><span class="encouragement">' + enc + '</span>';
    }

    next.textContent = res.finished ? T('See Results ➜', 'Lihat Hasil ➜') : T('Next ➜', 'Lanjut ➜');
    fb.classList.add('show');
  };

  UI.dismissFeedback = function () {
    $('#feedback').classList.remove('show');
    var st = MG.game.state();
    // hati habis -> permainan selesai lebih cepat
    if (st.hearts <= 0) { UI.finishGame(); return; }
    // majukan penanda soal; null berarti sudah tidak ada soal tersisa
    if (!MG.game.nextQuestion()) { UI.finishGame(); return; }
    UI.nextQuestion();
  };

  /* ============================================================
   *  HASIL
   * ============================================================ */
  UI.finishGame = function () {
    UI.stopTimer();
    $('#feedback').classList.remove('show');

    var res = MG.game.summary();
    var rec = MG.db.recordAttempt(res);
    var earned = MG.game.checkBadges(res);

    var track = MG.normTrack(res.track);
    var passed = res.cleared;

    // tampilkan
    $('#result-mascot').innerHTML = MG.art.mascot(passed ? 'cheer' : 'sad');
    $('#result-title').textContent = passed
      ? (res.stars === 3 ? T('Perfect, ', 'Sempurna, ') + res.levelInfo.title + '!' : MG.levelLabel(track, res.level) + T(' Cleared!', ' Tuntas!'))
      : MG.levelLabel(track, res.level) + T(' Not Cleared', ' Belum Tuntas');
    $('#result-sub').textContent = passed
      ? res.starsLabel + T(' — next level, ', ' — lanjut ke level berikutnya, ') + firstName() + '!'
      : T('You need at least 60% correct answers. Try again!', 'Butuh minimal 60% jawaban benar. Ayo coba lagi!');

    var starsBox = $('#result-stars');
    starsBox.innerHTML = '';
    for (var i = 0; i < 3; i++) {
      starsBox.innerHTML += MG.art.star(i < res.stars, 54).replace('class="art-svg"', 'class="art-svg' + (i < res.stars ? '' : ' off') + '"');
    }

    $('#result-correct').textContent = res.correct + '/' + res.total;
    $('#result-acc').textContent = Math.round(res.accuracy * 100) + '%';
    $('#result-time').textContent = Math.round(res.durationMs / 1000) + T('s', 'd');
    $('#result-score').textContent = res.score;

    // rekor
    var p = MG.db.getLevelProgress(res.level, track);
    var bestMsg = '';
    if (rec.newStars) bestMsg = T('⭐ New record! You got ', '⭐ Rekor baru! Kamu dapat ') + res.stars + T(' stars in ', ' bintang di ') + MG.levelLabel(track, res.level) + '.';
    else if (rec.newBest) bestMsg = T('🏅 New high score: ', '🏅 Skor tertinggi baru: ') + res.score + T(' points!', ' poin!');
    else if (p) bestMsg = T('Your best record: ', 'Rekor terbaikmu: ') + p.best_stars + T(' stars · ', ' bintang · ') + p.best_score + T(' points.', ' poin.');
    $('#result-best').textContent = bestMsg;

    // fakta matematika menarik
    var factBox = $('#result-fact');
    if (factBox) {
      var fact = MATH_FACTS[Math.floor(Math.random() * MATH_FACTS.length)];
      factBox.innerHTML = '<div class="fact-head">' + T('💡 Did You Know?', '💡 Tahukah Kamu?') + '</div><div class="fact-body">' + fact + '</div>';
    }

    // lencana baru
    var bx = $('#result-badges');
    bx.innerHTML = '';
    earned.forEach(function (b, i) {
      var n = el('div', 'nbadge', '<i>' + b.emoji + '</i> ' + b.name);
      n.style.animationDelay = (0.15 + i * 0.1) + 's';
      bx.appendChild(n);
    });

    // tombol level berikutnya
    var nextLv = res.level + 1;
    var nextBtn = $('#btn-nextlevel');
    if (!passed || nextLv > MG.levelCount(track)) {
      nextBtn.style.display = 'none';
    } else {
      nextBtn.style.display = '';
      nextBtn.innerHTML = '➡️ ' + MG.levelLabel(track, nextLv) + ': ' + MG.levelOf(track, nextLv).title;
      nextBtn.disabled = false;
    }

    if (passed) {
      MG.audio.play(res.stars === 3 ? 'win' : 'levelUp');
      FX.confettiBig();
    } else {
      MG.audio.play('lose');
    }
    if (earned.length) setTimeout(function () { MG.audio.play('badge'); }, 600);

    UI.show('result');
    MG.db.saveNow();
    lbRows = [];                 // peringkat lokal perlu dihitung ulang
    MG.db.publishScore(true);    // kirim ke papan peringkat server
  };

  function firstName() {
    var p = MG.db.getPlayer();
    return p ? p.name.split(' ')[0] : T('you', 'kamu');
  }

  /* ============================================================
   *  STATISTIK
   * ============================================================ */
  UI.renderStats = function () {
    var p = MG.db.getPlayer();
    $('#stats-player').textContent = T('Player: ', 'Pemain: ') + (p ? p.name + ' ' + p.avatar : '-');

    var progressSd = MG.db.getAllProgress('sd');
    var progressTk = MG.db.getAllProgress('tk');
    var progressAdv = MG.db.getAllProgress('adv');
    var tbody = $('#stats-tbody');
    tbody.innerHTML = '';

    function addRow(LV, track, pr, label, emoji) {
      var stars = pr ? '⭐'.repeat(pr.best_stars) + '☆'.repeat(3 - pr.best_stars) : '—';
      var tr = el('tr');
      tr.innerHTML =
        '<td>' + label + ' ' + emoji + '</td>' +
        '<td>' + LV.title + '</td>' +
        '<td class="stars-cell">' + stars + '</td>' +
        '<td>' + (pr ? pr.best_correct + '/' + MG.CONFIG.QUESTIONS_PER_LEVEL : '—') + '</td>' +
        '<td>' + (pr ? pr.plays : 0) + 'x</td>' +
        '<td>' + (pr && pr.last_played_at ? U.formatDate(pr.last_played_at) : '—') + '</td>';
      tbody.appendChild(tr);
    }

    MG.CONFIG.TK_LEVELS.forEach(function (LV) {
      addRow(LV, 'tk', progressTk[LV.n], T('Kindergarten ', 'TK ') + LV.n, LV.emoji);
    });
    MG.CONFIG.LEVELS.forEach(function (LV) {
      addRow(LV, 'sd', progressSd[LV.n], T('Level ', 'Lv ') + LV.n, LV.emoji);
    });
    MG.CONFIG.ADV_LEVELS.forEach(function (LV) {
      addRow(LV, 'adv', progressAdv[LV.n], T('Chapter ', 'Bab ') + LV.n, LV.emoji);
    });

    // lencana
    var owned = MG.db.getBadges();
    var bg = $('#badge-grid');
    bg.innerHTML = '';
    MG.BADGES.forEach(function (b) {
      var got = !!owned[b.code];
      var cell = el('div', 'badge-cell' + (got ? ' got' : ''),
        '<span class="bico">' + b.emoji + '</span><span class="bname">' + b.name + '</span>');
      cell.title = got ? (b.desc + T(' — earned ', ' — didapat ') + U.formatDate(owned[b.code])) : (T('Not earned yet: ', 'Belum didapat: ') + b.desc);
      bg.appendChild(cell);
    });

    // riwayat
    var hist = MG.db.getHistory(20);
    var hb = $('#history-tbody');
    hb.innerHTML = '';
    if (!hist.length) {
      hb.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#6B6490">' + T('No games yet. Let\'s start! 🎮', 'Belum ada permainan. Ayo mulai! 🎮') + '</td></tr>';
    } else {
      hist.forEach(function (h, i) {
        var hTrack = MG.normTrack(h.track);
        var tr = el('tr');
        tr.innerHTML =
          '<td>' + (i + 1) + '</td>' +
          '<td>' + MG.levelLabel(hTrack, h.level) + ' ' + MG.levelOf(hTrack, h.level).emoji + '</td>' +
          '<td>' + (h.cleared ? T('✅ Passed', '✅ Lulus') : T('💪 Not yet', '💪 Belum')) + '</td>' +
          '<td>' + h.correct + '/' + h.total + '</td>' +
          '<td>' + U.formatDuration(h.duration_ms) + '</td>' +
          '<td>' + h.score + '</td>' +
          '<td>' + U.formatDate(h.played_at) + '</td>';
        hb.appendChild(tr);
      });
    }
  };

  /* ============================================================
   *  PENGATURAN
   * ============================================================ */

  /** Muat pengaturan milik pemain ke MG.game.settings. */
  UI.applyPlayerSettings = function () {
    var s = MG.game.settings;
    var p = MG.db.getPlayer();

    if (p) {
      s.playerName = p.name;
      s.avatar = p.avatar;
      s.grade = p.grade || 1;
    }

    // waktu & kesulitan: nilai pemain dulu, baru nilai bawaan perangkat
    // 0 berarti tanpa batas waktu.
    var t = parseInt(MG.db.getPlayerSetting('time_limit', MG.db.getSetting('time_limit', '20')), 10);
    s.timeLimit = (t === 0 || (t >= 5 && t <= 180)) ? t : 20;

    var d = MG.db.getPlayerSetting('difficulty', MG.db.getSetting('difficulty', 'sedang'));
    s.difficulty = MG.CONFIG.DIFFICULTY[d] ? d : 'sedang';

    s.sfx = MG.db.getSetting('sfx', '1') !== '0';
    s.music = MG.db.getSetting('music', '1') !== '0';

    // petunjuk: milik pemain dulu, baru bawaan perangkat ('' = belum diatur)
    s.hideHint = MG.db.getPlayerSetting('hide_hint', MG.db.getSetting('hide_hint', '0')) === '1';
    // kalau layar bermain sedang terbuka, samakan tampilan tombolnya sekarang
    var hintBtn = $('#btn-hint');
    if (hintBtn) hintBtn.style.display = s.hideHint ? 'none' : '';
    return p;
  };

  var settingsGrade = 1;

  /** Perbarui label waktu pada layar pengaturan. */
  function paintTimeLabel() {
    var s = MG.game.settings;
    var unlimited = $('#inp-time-unlimited').checked;
    $('#inp-time').disabled = unlimited;
    $('#time-val').textContent = unlimited ? T('Unlimited ∞', 'Tanpa batas ∞') : (s.timeLimit + T(' seconds', ' detik'));
  }

  UI.fillSettings = function () {
    var s = MG.game.settings;
    var p = MG.db.getPlayer();
    var unlimited = MG.game.isUnlimited();
    $('#inp-name').value = p ? p.name : s.playerName;
    $('#inp-time').value = unlimited ? 20 : s.timeLimit;
    $('#inp-time-unlimited').checked = unlimited;
    paintTimeLabel();
    $('#inp-sfx').checked = !!s.sfx;
    $('#inp-music').checked = !!s.music;
    $('#inp-hide-hint').checked = !!s.hideHint;
    $$('#seg-difficulty button').forEach(function (b) {
      b.classList.toggle('on', b.getAttribute('data-diff') === s.difficulty);
    });
    settingsGrade = p ? (p.grade || 1) : (s.grade || 1);
    buildGradePicker($('#grade-picker-settings'), settingsGrade, function (g) { settingsGrade = g; });
    buildAvatarPicker($('#avatar-picker'), p ? p.avatar : s.avatar, function (a) {
      var nm = $('#inp-name').value.trim() || T('Player', 'Pemain');
      MG.db.updatePlayer(nm, a);
      MG.game.settings.avatar = a;
      UI.refreshHome();
    });
  };

  UI.saveSettings = function () {
    var s = MG.game.settings;
    var nm = $('#inp-name').value.trim() || T('Player', 'Pemain');
    var avBtn = $('#avatar-picker button.on');
    var av = (avBtn && avBtn.textContent) || s.avatar || '🙂';
    var unlimited = $('#inp-time-unlimited').checked;
    var t = unlimited ? 0 : (parseInt($('#inp-time').value, 10) || 20);

    s.playerName = nm;
    s.avatar = av;
    s.timeLimit = t;
    s.sfx = $('#inp-sfx').checked;
    s.music = $('#inp-music').checked;
    s.hideHint = $('#inp-hide-hint').checked;

    var onBtn = $('#seg-difficulty button.on');
    s.difficulty = (onBtn && onBtn.getAttribute('data-diff')) || 'sedang';

    MG.db.updatePlayer(nm, av, settingsGrade);

    // Waktu & kesulitan disimpan untuk pemain ini (dan juga jadi nilai bawaan
    // pemain baru di perangkat ini). Suara & musik berlaku untuk seluruh perangkat.
    MG.db.setPlayerSetting('time_limit', t);
    MG.db.setPlayerSetting('difficulty', s.difficulty);
    MG.db.setPlayerSetting('hide_hint', s.hideHint ? 1 : 0);
    MG.db.setSetting('time_limit', t);
    MG.db.setSetting('difficulty', s.difficulty);
    MG.db.setSetting('sfx', s.sfx ? 1 : 0);
    MG.db.setSetting('music', s.music ? 1 : 0);
    MG.db.setSetting('hide_hint', s.hideHint ? 1 : 0);

    MG.audio.setSfx(s.sfx);
    MG.audio.setMusic(s.music);
    MG.db.publishScore(true);
    UI.refreshHome();
  };

  /* ============================================================
   *  EFEK VISUAL (kanvas)
   * ============================================================ */
  var FX = UI.fx = {};
  var canvas = null, ctx = null, particles = [], rafId = null;

  FX.init = function () {
    canvas = $('#fx-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    FX.resize();
    on(global, 'resize', FX.resize);
  };

  FX.resize = function () {
    if (!canvas) return;
    var dpr = Math.min(2, global.devicePixelRatio || 1);
    canvas.width = global.innerWidth * dpr;
    canvas.height = global.innerHeight * dpr;
    canvas.style.width = global.innerWidth + 'px';
    canvas.style.height = global.innerHeight + 'px';
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  var COLORS = ['#FF5C8A', '#FFC93C', '#4ECDC4', '#7C6BFF', '#35A7FF', '#3FBF6F', '#FF7B4D'];

  function spawnConfetti(count, originY, spread) {
    for (var i = 0; i < count; i++) {
      particles.push({
        x: global.innerWidth * (0.2 + Math.random() * 0.6),
        y: originY == null ? -20 - Math.random() * 120 : originY,
        vx: (Math.random() - 0.5) * (spread || 8),
        vy: 2.5 + Math.random() * 5.5,
        w: 7 + Math.random() * 7,
        h: 10 + Math.random() * 12,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.3,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        life: 150
      });
    }
    startLoop();
  }

  FX.confettiSmall = function () { spawnConfetti(34, global.innerHeight * 0.32, 12); };
  FX.confettiBig = function () { spawnConfetti(130, -20, 10); };

  function startLoop() {
    if (rafId) return;
    rafId = requestAnimationFrame(loop);
  }

  function loop() {
    if (!ctx) { rafId = null; return; }
    ctx.clearRect(0, 0, global.innerWidth, global.innerHeight);

    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.14;          // gravitasi
      p.vx *= 0.995;
      p.rot += p.vr;
      p.life--;

      if (p.life <= 0 || p.y > global.innerHeight + 40) { particles.splice(i, 1); continue; }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 40));
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }

    if (particles.length) rafId = requestAnimationFrame(loop);
    else { rafId = null; ctx.clearRect(0, 0, global.innerWidth, global.innerHeight); }
  }

  FX.shake = function () {
    var el = $('#q-card');
    if (!el) return;
    el.animate([
      { transform: 'translateX(0)' },
      { transform: 'translateX(-9px)' },
      { transform: 'translateX(8px)' },
      { transform: 'translateX(-6px)' },
      { transform: 'translateX(0)' }
    ], { duration: 340, easing: 'ease-in-out' });
  };

  /* ============================================================
   *  PASANG SEMUA ACARA
   * ============================================================ */
  UI.bind = function () {
    /* navigasi */
    on($('#btn-home'), 'click', function () { MG.audio.play('tap'); UI.show('home'); UI.refreshHome(); });

    /** Level pada jalur yang paling layak dilanjutkan (belum tuntas / belum 3 bintang). */
    function resumeLevel(track) {
      var n = MG.db.getUnlockedLevel(track);
      var progress = MG.db.getAllProgress(track);
      for (var lv = 1; lv <= n; lv++) {
        var pr = progress[lv];
        if (!pr || !pr.cleared || pr.best_stars < 3) { n = lv; break; }
      }
      return n;
    }

    on($('#btn-play'), 'click', function () {
      MG.audio.play('click');
      UI.startLevel(resumeLevel('sd'), 'sd');
    });
    on($('#btn-levels'), 'click', function () { MG.audio.play('tap'); UI.show('levels'); });
    on($('#btn-play-tk'), 'click', function () {
      MG.audio.play('click');
      UI.startLevel(resumeLevel('tk'), 'tk');
    });
    on($('#btn-play-adv'), 'click', function () {
      MG.audio.play('click');
      UI.startLevel(resumeLevel('adv'), 'adv');
    });
    on($('#btn-stats'), 'click', function () { MG.audio.play('tap'); UI.show('stats'); });
    on($('#btn-help'), 'click', function () { MG.audio.play('tap'); UI.show('help'); });
    on($('#btn-leaderboard'), 'click', function () { MG.audio.play('tap'); lbTab = 'local'; lbRows = []; UI.setLeaderboardTab('local'); UI.show('leaderboard'); });
    on($('#btn-help-close'), 'click', function () { MG.audio.play('tap'); UI.back(); });
    on($('#btn-stats-close'), 'click', function () { MG.audio.play('tap'); UI.back(); });
    on($('#btn-lb-close'), 'click', function () { MG.audio.play('tap'); UI.back(); });
    on($('#btn-settings'), 'click', function () { MG.audio.play('tap'); UI.show('settings'); });

    /* ganti / tambah pemain */
    on($('#chip-player'), 'click', function () { MG.audio.play('tap'); UI.show('players'); });
    on($('#btn-switch-player'), 'click', function () { MG.audio.play('tap'); UI.show('players'); });
    on($('#btn-manage-players'), 'click', function () { MG.audio.play('tap'); UI.show('players'); });
    on($('#btn-players-close'), 'click', function () { MG.audio.play('tap'); UI.back(); });
    on($('#btn-add-player'), 'click', function () { UI.openNewPlayerForm(); });
    on($('#btn-cancel-player'), 'click', function () { MG.audio.play('tap'); UI.closeNewPlayerForm(); });
    on($('#btn-save-player'), 'click', function () { UI.saveNewPlayer(); });
    on($('#inp-pname'), 'keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); UI.saveNewPlayer(); }
    });
    on($('#inp-pname'), 'keydown', function (e) {
      if (e.key === 'Escape') UI.closeNewPlayerForm();
    });

    /* tab papan peringkat */
    $$('#lb-tabs button').forEach(function (b) {
      on(b, 'click', function () {
        MG.audio.play('tap');
        lbRows = [];
        UI.setLeaderboardTab(b.getAttribute('data-tab'));
      });
    });

    /* tombol suara */
    on($('#btn-sound'), 'click', function () {
      var s = MG.game.settings;
      s.sfx = !s.sfx;
      MG.audio.setSfx(s.sfx);
      MG.db.setSetting('sfx', s.sfx ? 1 : 0);
      this.classList.toggle('off', !s.sfx);
      this.querySelector('.ico').textContent = s.sfx ? '🔊' : '🔇';
    });

    /* permainan */
    on($('#btn-next'), 'click', function () { MG.audio.play('click'); UI.dismissFeedback(); });
    on($('#btn-hint'), 'click', function () {
      var st = MG.game.state();
      if (!st) return;
      if (MG.game.settings.hideHint) return;   // petunjuk dimatikan di pengaturan
      var q = st.questions[st.index];
      if (!q || !q.hint) return;
      MG.game.useHint();
      MG.audio.play('tap');
      U.toast('💡 ' + q.hint, '');
      // tampilkan petunjuk di kartu soal
      var t = $('#q-topic');
      t.textContent = '💡 ' + q.hint;
      this.disabled = true;
    });
    on($('#btn-skip'), 'click', function () {
      MG.audio.play('tap');
      UI.timeUp();
    });
    on($('#btn-quit'), 'click', function () {
      MG.audio.play('tap');
      U.modal({
        emoji: '🤔', title: T('Leave this level?', 'Keluar dari level?'),
        text: T('Progress in this level so far <b>will not be saved</b>.', 'Progres level ini yang sudah berjalan <b>tidak akan disimpan</b>.'),
        buttons: [
          { label: T('Keep Playing', 'Lanjut Main'), cls: 'btn-primary' },
          {
            label: T('Leave', 'Keluar'), cls: 'btn-danger', onClick: function () {
              UI.stopTimer();
              UI.show('levels');
            }
          }
        ]
      });
    });

    /* Petualangan 2D */
    on($('#btn-adv-quit'), 'click', function () {
      $('#btn-quit').click();
    });
    on($('#btn-adv-world-map'), 'click', function () {
      MG.audio.play('tap');
      showAdvWorldMap();
    });
    on($('#btn-adv-world-close'), 'click', function () {
      MG.audio.play('tap');
      hideAdvWorldMap();
    });
    on($('#btn-adv-world-resume'), 'click', function () {
      MG.audio.play('tap');
      hideAdvWorldMap();
    });

    /* hasil */
    on($('#btn-retry'), 'click', function () {
      MG.audio.play('click');
      var st = MG.game.state();
      UI.startLevel(st.level, st.track);
    });
    on($('#btn-nextlevel'), 'click', function () {
      MG.audio.play('click');
      var st = MG.game.state();
      UI.startLevel(st.level + 1, st.track);
    });
    on($('#btn-tomap'), 'click', function () { MG.audio.play('tap'); UI.show('levels'); });

    /* tab jalur level (SD / TK) */
    $$('#track-tabs button').forEach(function (b) {
      on(b, 'click', function () {
        MG.audio.play('tap');
        UI.setLevelTrack(b.getAttribute('data-track'));
      });
    });

    /* pengaturan */
    on($('#inp-time'), 'input', function () {
      MG.game.settings.timeLimit = parseInt(this.value, 10) || 20;
      paintTimeLabel();
    });
    on($('#inp-time-unlimited'), 'change', function () {
      MG.audio.play('tap');
      MG.game.settings.timeLimit = this.checked ? 0 : (parseInt($('#inp-time').value, 10) || 20);
      paintTimeLabel();
    });
    on($('#inp-sfx'), 'change', function () {
      MG.audio.setSfx(this.checked);
      if (this.checked) MG.audio.play('tap');
    });
    on($('#inp-music'), 'change', function () { MG.audio.setMusic(this.checked); });
    $$('#seg-difficulty button').forEach(function (b) {
      on(b, 'click', function () {
        $$('#seg-difficulty button').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        MG.audio.play('tap');
      });
    });
    on($('#btn-settings-close'), 'click', function () {
      UI.saveSettings();
      MG.audio.play('click');
      U.toast(T('Settings saved ✅', 'Pengaturan disimpan ✅'));
      UI.back();
    });
    on($('#btn-export'), 'click', function () { UI.exportData(); });
    on($('#btn-import'), 'click', function () { $('#file-import').click(); });
    on($('#file-import'), 'change', function () { UI.importData(this.files[0]); });
    on($('#btn-reset'), 'click', function () {
      var p = MG.db.getPlayer();
      U.modal({
        emoji: '🗑️', title: T('Delete progress for ', 'Hapus progres ') + (p ? p.name : T('this player', 'pemain ini')) + '?',
        text: T('Progress, scores, stars, and badges owned by <b>', 'Progres, skor, bintang, dan lencana milik <b>') +
          U.esc(p ? p.name : T('this player', 'pemain ini')) + '</b>' + T(' will be deleted forever. ', ' akan dihapus permanen. ') +
          T('Other players on this device are <b>not</b> affected. ', 'Pemain lain di perangkat ini <b>tidak</b> terpengaruh. ') +
          T('This cannot be undone.', 'Tindakan ini tidak bisa dibatalkan.'),
        buttons: [
          { label: T('Cancel', 'Batal'), cls: 'btn-ghost' },
          {
            label: T('Yes, Delete', 'Ya, Hapus'), cls: 'btn-danger', onClick: function () {
              MG.db.reset().then(function () {
                U.toast(T('Progress of ', 'Progres ') + (p ? p.name : T('this player', 'pemain ini')) + T(' has been deleted.', ' telah dihapus.'), 'warn');
                lbRows = [];
                UI.refreshHome();
                UI.show('home');
              });
            }
          }
        ]
      });
    });
    on($('#btn-reset-all'), 'click', function () {
      U.modal({
        emoji: '💣', title: T('Delete ALL players?', 'Hapus SEMUA pemain?'),
        text: T('All players and their progress will be deleted forever from this device, including the server leaderboard. <b>This cannot be undone.</b>', 'Seluruh pemain dan progresnya akan dihapus permanen dari perangkat ini, termasuk papan peringkat di server. <b>Tindakan ini tidak bisa dibatalkan.</b>'),
        buttons: [
          { label: T('Cancel', 'Batal'), cls: 'btn-ghost' },
          {
            label: T('Yes, Delete All', 'Ya, Hapus Semua'), cls: 'btn-danger', onClick: function () {
              MG.db.reset(true).then(function () {
                U.toast(T('All data has been deleted.', 'Semua data telah dihapus.'), 'warn');
                lbRows = [];
                UI.refreshHome();
                UI.show('home');
              });
            }
          }
        ]
      });
    });

    /* pintasan keyboard: A/B/C/D atau 1-4 untuk menjawab */
    on(document, 'keydown', function (e) {
      if (UI.current() !== 'play') return;
      if ($('#feedback').classList.contains('show')) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); UI.dismissFeedback(); }
        return;
      }
      var k = e.key.toUpperCase();
      var idx = 'ABCD'.indexOf(k);
      if (idx >= 0 && idx < 4) { UI.pickAnswer(idx); return; }
      if (['1', '2', '3', '4'].indexOf(e.key) >= 0) { UI.pickAnswer(+e.key - 1); return; }
      if (e.key === 'h' || e.key === 'H') {
        if (MG.game.settings.hideHint) return;
        $('#btn-hint').click();
      }
    });
  };

  UI.back = function () {
    UI.show('home');
    UI.refreshHome();
  };

  /* ---------- ekspor / impor ---------- */
  UI.exportData = function () {
    var b64 = MG.db.exportBase64();
    if (!b64) { U.toast(T('No data to export yet.', 'Belum ada data untuk diekspor.'), 'warn'); return; }
    var payload = JSON.stringify({
      app: 'matematika-ajaib',
      version: 1,
      exported_at: U.now(),
      db: b64
    });
    var blob = new Blob([payload], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = T('magic-math-progress-', 'progres-matematika-ajaib-') + U.today() + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
    U.toast(T('Progress exported successfully 📥', 'Progres berhasil diekspor 📥'));
  };

  UI.importData = function (file) {
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      var data;
      try { data = JSON.parse(String(reader.result)); }
      catch (e) { U.toast(T('The file cannot be read.', 'File tidak bisa dibaca.'), 'err'); return; }

      if (!data || data.app !== 'matematika-ajaib' || !data.db) {
        U.toast(T('That is not this game\'s progress file.', 'Itu bukan file progres game ini.'), 'err');
        return;
      }
      U.modal({
        emoji: '📥', title: T('Import progress?', 'Impor progres?'),
        text: T('Your current progress will be <b>replaced</b> with the file contents.', 'Progres yang ada sekarang akan <b>diganti</b> dengan isi file.'),
        buttons: [
          { label: T('Cancel', 'Batal'), cls: 'btn-ghost' },
          {
            label: T('Yes, Import', 'Ya, Impor'), cls: 'btn-primary', onClick: function () {
              MG.db.importBase64(data.db).then(function () {
                U.toast(T('Progress imported successfully! 🎉', 'Progres berhasil diimpor! 🎉'));
                UI.refreshHome();
                UI.show('home');
              }, function (err) {
                U.toast(err.message || T('Import failed.', 'Gagal mengimpor.'), 'err');
              });
            }
          }
        ]
      });
    };
    reader.readAsText(file);
  };

})(window);
