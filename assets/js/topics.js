/* ============================================================
 *  topics.js  —  Bank soal matematika SD
 *
 *  Setiap topic adalah fungsi (rng, level) => soal:
 *    {
 *      text : "2 + 3 = ?"          // teks soal (HTML aman, <b> boleh)
 *      art  : { kind:'items', ...} // deskripsi ilustrasi (opsional)
 *      answer : 5                   // nilai jawaban benar (angka/pecahan)
 *      answers : ["4","5","6","7"]  // 4 pilihan (teks)
 *      answerIndex : 1              // posisi jawaban benar
 *      topic : 'addSmall'           // label topik (untuk statistik)
 *      topicName : 'Penjumlahan'     // nama enak untuk ditampilkan
 *      hint : "..."                 // petunjuk singkat
 *    }
 *
 *  Tidak ada soal yang diulang 2x dalam satu level (dicek oleh game.js).
 * ============================================================ */
(function (global) {
  'use strict';

  var MG = global.MG = global.MG || {};
  var U = MG.utils;
  var T = MG.t;
  var Topics = MG.topics = {};

  var ri = U.randInt, pk = U.pick, sh = U.shuffle;

  /* ============================================================
   *  PEMBANTU
   * ============================================================ */

  /** Bikin soal dari nilai jawaban angka biasa. */
  function num(text, answer, o) {
    o = o || {};
    // Safety net: kalau jawaban bukan bilangan bulat, desimalnya dideteksi otomatis
    // supaya pilihan jawaban tidak pernah "membulatkan" jawaban yang benar.
    if (o.dec == null) o.dec = U.decimalsOf(answer);
    var safeAnswer = o.dec ? Math.round(answer * Math.pow(10, o.dec)) / Math.pow(10, o.dec) : Math.round(answer);
    var res = U.buildOptions(safeAnswer, o);
    return {
      text: text,
      art: o.art || null,
      answer: safeAnswer,
      answers: res.options,
      answerIndex: res.answerIndex,
      topic: o.topic,
      topicName: o.topicName,
      hint: o.hint || ''
    };
  }

  /** Bikin soal dari jawaban teks (mis. "3/4"). */
  function txt(text, answerText, wrongTexts, o) {
    o = o || {};
    var res = U.buildTextOptions(answerText, wrongTexts, o.rng || Math.random);
    return {
      text: text,
      art: o.art || null,
      answer: answerText,
      answers: res.options,
      answerIndex: res.answerIndex,
      topic: o.topic,
      topicName: o.topicName,
      hint: o.hint || ''
    };
  }

  /* Kata & nama untuk soal cerita */
  var NAMA = T(['Tom', 'Sara', 'Dodo', 'Lina', 'Riko', 'Maya', 'Tony', 'Citra', 'Adi', 'Nisa', 'Gilang', 'Putri'], ['Budi', 'Sari', 'Dodo', 'Lina', 'Riko', 'Maya', 'Toni', 'Citra', 'Adi', 'Nisa', 'Gilang', 'Putri']);
  var BARANG = T(['apples', 'balls', 'books', 'pens', 'cakes', 'stickers', 'chalk sticks', 'crayons', 'sugar cubes', 'candies'], ['apel', 'bola', 'buku', 'pena', 'kue', 'stiker', 'kapur', 'kelering', 'gula', 'permen']);
  var HEWAN = T(['rabbits', 'chickens', 'cats', 'birds', 'fish', 'goats', 'cows', 'dogs'], ['kelinci', 'ayam', 'kucing', 'burung', 'ikan', 'kambing', 'sapi', 'anjing']);
  var WARNA = T(['red', 'blue', 'yellow', 'green', 'pink', 'purple', 'orange', 'brown'], ['merah', 'biru', 'kuning', 'hijau', 'pink', 'ungu', 'jingga', 'cokelat']);

  /* ============================================================
   *  LEVEL 1-3: PENGHITUNGAN & PENJUMLAHAN KECIL
   * ============================================================ */

  Topics.count = function (rng, lv) {
    var max = Math.min(lv.scale.countMax, 12);
    var n = ri(rng, 3, max);
    var item = pk(rng, ['apple', 'star', 'fish', 'flower', 'balloon', 'cookie', 'duck', 'heart', 'leaf']);
    var art = { kind: 'items', count: n, item: item, jitter: true };
    // variasi: tanyakan berapa lagi agar jumlahnya mencapai target
    if (U.chance(rng, 0.3)) {
      var target = ri(rng, n + 1, Math.max(n + 1, max + 3));
      var q2 = T('There are <b>' + n + '</b> ' + Art_names(item) + '. How many more to make <b>' + target + '</b>?',
        'Ada <b>' + n + '</b> ' + Art_name(item) + '. Ditambah <b>berapa</b> lagi agar jumlahnya menjadi <b>' + target + '</b>?');
      return num(q2, target - n, {
        rng: rng, min: 1, spread: 1, topic: 'count', topicName: T('Counting', 'Menghitung'),
        art: art,
        hint: target + ' − ' + n + ' = ' + (target - n) + '.'
      });
    }
    var q = T('How many <b>' + (Art_names(item)) + '</b> do you see?',
      'Berapa banyak <b>' + (Art_name(item)) + '</b> yang terlihat?');
    return num(q, n, {
      rng: rng, min: 1, spread: 2, topic: 'count', topicName: T('Counting', 'Menghitung'),
      art: art,
      hint: T('Count one by one from left to right.', 'Hitung satu per satu dari kiri ke kanan.')
    });
  };

  function Art_name(k) {
    return (MG.art.itemNames[k] || T('object', 'benda'));
  }

  /** Jamak untuk teks Inggris: apple -> apples, leaf -> leaves. */
  function Art_names(k) {
    var s = Art_name(k);
    if (MG.I18N.current() === 'id') return s;
    if (s === 'fish') return s;
    if (/(s|x|z|ch|sh)$/.test(s)) return s + 'es';
    if (/[^aeiou]y$/.test(s)) return s.slice(0, -1) + 'ies';
    if (/f$/.test(s)) return s.slice(0, -1) + 'ves';
    return s + 's';
  }

  Topics.shapeCount = function (rng, lv) {
    var shapes = T(['square', 'triangle', 'circle', 'rectangle', 'parallelogram'],
      ['persegi', 'segitiga', 'lingkaran', 'persegi panjang', 'jajar genjang']);
    var shapesArt = T({ 'square': 'square', 'triangle': 'triangle', 'circle': 'circle', 'rectangle': 'rect', 'parallelogram': 'trapezoid' },
      { 'persegi': 'square', 'segitiga': 'triangle', 'lingkaran': 'circle', 'persegi panjang': 'rect', 'jajar genjang': 'trapezoid' });
    var SHAPE_EN = T({ 'square': 'square', 'triangle': 'triangle', 'circle': 'circle', 'rectangle': 'rectangle', 'parallelogram': 'parallelogram' },
      { 'persegi': 'square', 'segitiga': 'triangle', 'lingkaran': 'circle', 'persegi panjang': 'rectangle', 'jajar genjang': 'parallelogram' });
    var s = pk(rng, shapes);
    var n = ri(rng, 2, 6);
    var art = { kind: 'shape', shape: shapesArt[s], labels: {} };
    var q = T('The shape above is a <b>' + SHAPE_EN[s] + '</b>. If there are <b>' + n + '</b> ' + SHAPE_EN[s] + 's, what is the total number of sides?',
      'Gambar di atas adalah bentuk <b>' + s + '</b>. Kalau ada <b>' + n + '</b> ' + s + ', berapakah jumlah sisinya jika dijumlahkan?');
    // sederhana: jumlah sisi * jumlah -> hasil hitung sederhana
    var sisi = T({ 'square': 4, 'triangle': 3, 'circle': 0, 'rectangle': 4, 'parallelogram': 4 },
      { 'persegi': 4, 'segitiga': 3, 'lingkaran': 0, 'persegi panjang': 4, 'jajar genjang': 4 })[s];
    var ans = sisi * n;
    return num(q, ans, {
      rng: rng, min: 0, spread: 1, step: Math.max(1, Math.floor(ans / 5)), topic: 'shapeCount', topicName: T('Shapes & Sides', 'Bentuk & Sisi'),
      art: art,
      hint: T('One ' + SHAPE_EN[s] + ' has ' + sisi + ' sides, so the total is ' + ans + '.',
        'Banyaknya ' + s + ' = ' + sisi + ', jumlah sisinya ' + ans + '.')
    });
  };

  /** Soal kelompok: "a kelompok, tiap kelompok berisi b" → perkalian a × b. */
  Topics.mulGroups = function (rng, lv) {
    var max = lv.scale.max;
    var cap = max * 2;                 // hasil kali maksimum = 2× rentang angka level
    var a = ri(rng, 2, Math.max(2, Math.min(max - 2, Math.floor(cap / 2))));
    var b = ri(rng, 2, Math.max(2, Math.min(Math.max(2, max - a), Math.floor(cap / a))));
    var item = pk(rng, ['apple', 'star', 'ball', 'fish']);
    var total = a * b;
    return num(T('There are <b>' + a + '</b> groups. Each group has <b>' + b + '</b> ' + Art_names(item) +
      '. What is the total?',
      'Ada <b>' + a + '</b> kelompok. Setiap kelompok berisi <b>' + b + '</b> ' + Art_name(item) +
      '. Berapa jumlah semuanya?'), total, {
        rng: rng, min: 0, spread: 2, candidates: [a + b],   // a+b = jawaban salah yang paling sering
        topic: 'mulGroups', topicName: T('Multiplication', 'Perkalian'),
        art: { kind: 'groups', groups: a, per: b, item: item },
        hint: T(a + ' × ' + b + ' = ' + total + ' (' + a + ' groups of ' + b + ')',
          a + ' × ' + b + ' = ' + total + ' (' + b + ' sebanyak ' + a + ' kali).')
      });
  };

  Topics.addSmall = function (rng, lv) {
    // Gambar "kelompok" = perkalian (a kelompok × b isi), jadi dipakai sebagai soal
    // perkalian — bukan dijawab dengan a + b.
    if (lv.n <= 4 && U.chance(rng, 0.45)) return Topics.mulGroups(rng, lv);
    var max = lv.scale.max;
    var a = ri(rng, 1, Math.max(2, max - 2));
    var b = ri(rng, 1, Math.max(2, Math.max(2, max - a)));
    return num('<b>' + a + '</b> + <b>' + b + '</b> = ?', a + b, {
      rng: rng, min: 0, spread: 2, topic: 'addSmall', topicName: T('Addition', 'Penjumlahan'),
      hint: T(a + ' + ' + b + ' = ' + (a + b) + '. Remember: ' + (a + b - a) + ' + ' + a + '.',
        a + ' + ' + b + ' = ' + (a + b) + '. Ingat: ' + (a + b - a) + ' ditambah ' + a + '.')
    });
  };

  Topics.subSmall = function (rng, lv) {
    var max = lv.scale.max;
    var a = ri(rng, Math.min(4, max), max);
    var b = ri(rng, 1, Math.max(1, a - 1));
    // variasi: angka yang hilang di sisi kanan
    if (U.chance(rng, 0.25)) {
      return num(T('<b>' + a + '</b> − … = <b>' + (a - b) + '</b>  →  what is missing?',
        '<b>' + a + '</b> − … = <b>' + (a - b) + '</b>  →  berapa yang hilang?'), b, {
        rng: rng, min: 1, spread: 2, topic: 'subSmall', topicName: T('Subtraction', 'Pengurangan'),
        hint: a + ' − ' + (a - b) + ' = ' + b + '.'
      });
    }
    var q = '<b>' + a + '</b> − <b>' + b + '</b> = ?';
    return num(q, a - b, {
      rng: rng, min: 0, spread: 2, topic: 'subSmall', topicName: T('Subtraction', 'Pengurangan'),
      hint: T('From ' + a + ' minus ' + b + '. Try counting back ' + b + ' steps.',
        'Dari ' + a + ' dikurangi ' + b + '. Coba hitung mundur ' + b + ' langkah.')
    });
  };

  Topics.missingAdd = function (rng, lv) {
    var max = lv.scale.max;
    var a = ri(rng, 1, max - 2);
    var sum = a + ri(rng, 1, Math.min(max - a, 8));
    var q = T('<b>' + a + '</b> + … = <b>' + sum + '</b>  →  what is missing?',
      '<b>' + a + '</b> + … = <b>' + sum + '</b>  →  berapakah yang hilang?');
    return num(q, sum - a, {
      rng: rng, min: 1, spread: 1, topic: 'missingAdd', topicName: T('Missing Number', 'Angka Hilang'),
      hint: sum + ' − ' + a + ' = ' + (sum - a) + '.'
    });
  };

  Topics.compare = function (rng, lv) {
    var max = Math.max(4, Math.min(lv.scale.max, 1000));
    var a = ri(rng, 1, max);
    var b = ri(rng, 1, max);
    var guard = 0;
    while (b === a && guard++ < 20) b = ri(rng, 1, max);
    if (b === a) b = (a % max) + 1;
    var bigger = a > b ? a : b;
    var smaller = a > b ? b : a;
    var mode = ri(rng, 0, 2);
    var q, ans;
    if (mode === 0) {
      q = T('Which number is <b>bigger</b>?', 'Bilangan mana yang <b>lebih besar</b>?');
      ans = bigger;
    } else if (mode === 1) {
      q = T('Which number is <b>smaller</b>?', 'Bilangan mana yang <b>lebih kecil</b>?');
      ans = smaller;
    } else {
      q = T('Compare <b>' + a + '</b> and <b>' + b + '</b>. What is the difference?',
        'Bandingkan <b>' + a + '</b> dan <b>' + b + '</b>. Selisihnya berapa?');
      ans = bigger - smaller;
    }
    return num(q, ans, {
      rng: rng, min: 0, spread: Math.max(2, Math.floor(max / 12)), step: max > 200 ? 5 : 1,
      topic: 'compare', topicName: T('Comparing Numbers', 'Bandingkan Bilangan'),
      art: { kind: 'balance', left: a, right: b, leftItems: a, rightItems: b },
      hint: mode === 2 ? (bigger + ' − ' + smaller + ' = ' + ans + '.')
        : T('The bigger number is ' + bigger + '.', 'Yang lebih besar adalah ' + bigger + '.')
    });
  };

  Topics.pattern = function (rng, lv) {
    var mode = ri(rng, 0, 2);
    if (mode === 0) {
      // Pola kali / kelipatan (2, 4, 8, 16...)
      var mul = pk(rng, [2, 3]);
      var startM = pk(rng, [1, 2, 3]);
      var seq = [startM];
      for (var m = 0; m < 4; m++) seq.push(seq[seq.length - 1] * mul);
      var blankM = ri(rng, 1, 4);
      var ansM = seq[blankM];
      var shownM = seq.slice();
      shownM[blankM] = null;
      return num(T('Complete the following multiplication pattern!', 'Lengkapi pola kelipatan bilangan berikut!'), ansM, {
        rng: rng, min: 1, spread: Math.max(2, Math.floor(ansM / 3)), step: 1,
        topic: 'pattern', topicName: T('Number Patterns', 'Pola Bilangan'),
        art: { kind: 'pattern', items: shownM },
        hint: T('Each number is multiplied by ' + mul + ' from the previous number. So the answer is ' + ansM + '.',
          'Setiap angka dikalikan ' + mul + ' dari angka sebelumnya. Jadi jawabannya ' + ansM + '.')
      });
    }

    // Pola tambah / kurang
    var kinds = [T('add', 'tambah'), T('subtract', 'kurang')];
    var k = pk(rng, kinds);
    var start = ri(rng, 1, lv.n <= 3 ? 5 : 20);
    var step = ri(rng, 2, lv.n <= 3 ? 4 : 9);
    var items = [], val = start;
    var n = 5;
    for (var i = 0; i < n; i++) { items.push(val); val += (k === kinds[0] ? step : -step); }
    if (k === kinds[1] && items[items.length - 1] < 0) { start += step * n; val = start; items = []; for (i = 0; i < n; i++) { items.push(val); val -= step; } }
    var blankIdx = ri(rng, 1, n - 2);
    var answer = items[blankIdx];
    var shown = items.slice();
    shown[blankIdx] = null;
    return num(T('Complete the following number pattern!', 'Lengkapi pola bilangan berikut!'), answer, {
      rng: rng, min: 0, spread: Math.max(1, Math.floor(step / 2)), step: step > 4 ? 2 : 1,
      topic: 'pattern', topicName: T('Number Patterns', 'Pola Bilangan'),
      art: { kind: 'pattern', items: shown },
      hint: T('Each number ' + (k === kinds[0] ? 'increases by ' : 'decreases by ') + step + '.',
        'Setiap angka ' + (k === kinds[0] ? 'ditambah ' : 'dikurangi ') + step + '.')
    });
  };

  /* ============================================================
   *  LEVEL 4-6: SAMPAI 100, JAM, UANG
   * ============================================================ */

  Topics.add100 = function (rng, lv) {
    var max = lv.scale.max;
    var tens = ri(rng, 1, Math.floor(max / 10) - 1) * 10;
    var ones = ri(rng, 1, 9);
    var a = tens + ones;
    var b = ri(rng, 1, Math.max(1, max - a));
    // pendek: tambah satuan & tegak lurus bila memungkinkan
    var art = null;
    if (U.chance(rng, 0.35)) {
      art = { kind: 'numberline', min: 0, max: max > 200 ? 100 : Math.max(20, Math.ceil(a / 10) * 10), points: [a, a + b], highlight: 1 };
    }
    return num('<b>' + a + '</b> + <b>' + b + '</b> = ?', a + b, {
      rng: rng, min: 0, spread: 5, step: 1, topic: 'add100', topicName: T('Addition', 'Penjumlahan'),
      art: art,
      hint: T('Add the ones first, then the tens. (' + a + ' + ' + b + ')',
        'Jumlahkan satuan dulu, lalu puluhan. (' + a + ' + ' + b + ')')
    });
  };

  Topics.sub100 = function (rng, lv) {
    var max = lv.scale.max;
    var a = ri(rng, Math.max(20, Math.floor(max * 0.4)), max);
    var b = ri(rng, 1, Math.max(1, a - Math.floor(max * 0.2)));
    return num('<b>' + a + '</b> − <b>' + b + '</b> = ?', a - b, {
      rng: rng, min: 0, spread: 5, topic: 'sub100', topicName: T('Subtraction', 'Pengurangan'),
      hint: T('Subtract the ones first, then subtract the tens the same way.',
        'Kurangi satuannya dulu, lalu kurangi puluhannya dengan cara yang sama.')
    });
  };

  Topics.missing100 = function (rng, lv) {
    var max = lv.scale.max;
    var a = ri(rng, 10, max - 10);
    var sum = a + ri(rng, 5, Math.min(50, max - a));
    return num('<b>' + a + '</b> + … = <b>' + sum + '</b>', sum - a, {
      rng: rng, min: 1, spread: 3, topic: 'missing100', topicName: T('Missing Number', 'Angka Hilang'),
      hint: sum + ' − ' + a + ' = ' + (sum - a) + '.'
    });
  };

  Topics.numberline = function (rng, lv) {
    var max = lv.scale.max;
    var stepSize = pk(rng, [2, 5, 10]);
    var start = ri(rng, 0, 20);
    var end = Math.min(max, start + ri(rng, 3, 6) * stepSize);
    var pts = [start];
    for (var i = 1; i <= 4; i++) pts.push(Math.min(end, start + i * stepSize));
    var hi = ri(rng, 1, pts.length - 1);
    var ans = pts[hi];
    var q = T('Look at the number line. What number is marked by the <b>red dot</b>?',
      'Perhatikan garis bilangan. Berapakah bilangan yang ditandai <b>titik merah</b>?');
    return num(q, ans, {
      rng: rng, min: 0, spread: Math.max(1, stepSize / 2), step: stepSize > 4 ? 2 : 1,
      topic: 'numberline', topicName: T('Number Line', 'Garis Bilangan'),
      art: { kind: 'numberline', min: Math.max(0, start - stepSize * 2), max: pts[pts.length - 1] + stepSize * 2, points: pts, highlight: hi },
      hint: T('Each jump adds ' + stepSize + '.', 'Setiap langkah bertambah ' + stepSize + '.')
    });
  };

  Topics.placeValue2 = function (rng, lv) {
    var n = ri(rng, 10, lv.scale.max);
    var tens = Math.floor(n / 10) % 10;
    var askTens = U.chance(rng, 0.5);
    var q = T('In the number <b>' + n + '</b>, what is the value of its <b>' + (askTens ? 'tens' : 'ones') + '</b>?',
      'Pada bilangan <b>' + n + '</b>, berapakah nilai <b>' + (askTens ? 'puluhan' : 'satuan') + '</b>-nya?');
    return num(q, askTens ? tens : n % 10, {
      rng: rng, min: 0, spread: 1, topic: 'placeValue2', topicName: T('Place Value', 'Nilai Tempat'),
      art: { kind: 'placeValue', num: n },
      hint: T('Write ' + n + ' → its place value: ' + (askTens ? tens + ' tens' : (n % 10) + ' ones') + '.',
        'Tulis ' + n + ' → nilai tempatnya: ' + (askTens ? tens + ' puluh' : (n % 10) + ' satuan') + '.')
    });
  };

  Topics.placeValue3 = function (rng, lv) {
    // variasi: pecahan bilangan menjadi jumlah satuan tempatnya
    if (U.chance(rng, 0.35)) {
      var hi = Math.max(111, lv.scale.max);
      var r = ri(rng, 1, Math.min(9, Math.floor(hi / 100)));
      var p = ri(rng, 1, 9), s = ri(rng, 1, 9);
      var n2 = r * 100 + p * 10 + s;
      if (n2 <= lv.scale.max && n2 >= 100) {
        var ansText = (r * 100) + ' + ' + (p * 10) + ' + ' + s;
        var wrongs = [
          (r * 100) + ' + ' + p + ' + ' + (s * 10),
          (r * 10) + ' + ' + (p * 100) + ' + ' + s,
          (s * 100) + ' + ' + (p * 10) + ' + ' + r
        ].filter(function (x, i, arr) { return x !== ansText && arr.indexOf(x) === i; });
        return txt(T('Write the <b>addition</b> form of the number <b>' + n2 + '</b>?',
          'Bentuk <b>penjumlahan</b> dari bilangan <b>' + n2 + '</b> adalah?'), ansText, wrongs, {
          rng: rng, topic: 'placeValue3', topicName: T('Place Value', 'Nilai Tempat'),
          art: { kind: 'placeValue', num: n2 },
          hint: T(r * 100 + ' (hundreds) + ' + (p * 10) + ' (tens) + ' + s + ' (ones) = ' + n2 + '.',
            r * 100 + ' (ratusan) + ' + (p * 10) + ' (puluhan) + ' + s + ' (satuan) = ' + n2 + '.')
        });
      }
    }
    var n = ri(rng, 100, lv.scale.max);
    var ask = pk(rng, ['ratusan', 'puluhan', 'satuan']);
    var val = { 'ratusan': Math.floor(n / 100) % 10, 'puluhan': Math.floor(n / 10) % 10, 'satuan': n % 10 }[ask];
    var askEn = { 'ratusan': 'hundreds', 'puluhan': 'tens', 'satuan': 'ones' }[ask];
    var q = T('In the number <b>' + n + '</b>, what is the value of its <b>' + askEn + '</b>?',
      'Pada bilangan <b>' + n + '</b>, berapakah nilai <b>' + ask + '</b>-nya?');
    return num(q, val, {
      rng: rng, min: 0, spread: 1, topic: 'placeValue3', topicName: T('Place Value', 'Nilai Tempat'),
      art: { kind: 'placeValue', num: n },
      hint: T('The value of ' + askEn + ' in ' + n + ' is ' + val + '.',
        ask.charAt(0).toUpperCase() + ask.slice(1) + ' dari ' + n + ' adalah ' + val + '.')
    });
  };

  Topics.timeHour = function (rng, lv) {
    var h = ri(rng, 1, 12);
    return num(T('What time is shown? <b>(exactly on the hour)</b>', 'Jam berapa yang ditunjukkan? <b>(momen tepat di jam)</b>'), h, {
      rng: rng, min: 1, max: 12, spread: 1, topic: 'timeHour', topicName: T('Telling Time', 'Membaca Jam'),
      art: { kind: 'clock', h: h, m: 0 },
      hint: T('The long hand is on 12, the short hand points to ' + h + '.',
        'Jarum panjang di angka 12, jarum pendek menunjuk angka ' + h + '.')
    });
  };

  Topics.timeMinute = function (rng, lv) {
    var h = ri(rng, 1, 12);
    var m = pk(rng, [15, 30, 45]);
    var jam = (m === 15 ? h + 0.25 : m === 30 ? h + 0.5 : h + 0.75);
    // gunakan format "h:mm" agar tidak ada desimal
    var label = h + ':' + (m === 15 ? '15' : m === 30 ? '30' : '45');
    return txt(T('What time does the clock above show?', 'Jam berapa yang ditunjukkan oleh jam di atas?'), label, [
      h + ':00', h + ':10', h + ':20', h + ':25', h + ':35', h + ':40', h + ':50',
      (h % 12 + 1) + ':15', (h % 12 + 1) + ':30', (h % 12 + 1) + ':45'
    ].filter(function (x) { return x !== label; }).slice(0, 8), {
      rng: rng, topic: 'timeMinute', topicName: T('Telling Time', 'Membaca Jam'),
      art: { kind: 'clock', h: h, m: m },
      hint: T('The long hand is on ' + (m / 5) + ' → ' + m + ' minutes.',
        'Jarum panjang di angka ' + (m / 5) + ' → ' + m + ' menit.')
    });
  };

  Topics.moneySimple = function (rng, lv) {
    var nCoins = ri(rng, 2, 6);
    var nNotes = ri(rng, 0, 2);
    var total = nCoins * 100 + nNotes * 5000;
    // variasi: kurang berapa agar cukup membeli barang
    if (U.chance(rng, 0.3)) {
      var harga = total + ri(rng, 1, 10) * 100;
      return num(T('The money above totals <b>' + U.money(total) + '</b>. ' +
        'An item costs <b>' + U.money(harga) + '</b>. How much money is <b>short</b>?',
        'Uang di atas berjumlah <b>Rp' + U.thousand(total) + '</b>. ' +
        'Harga sebuah barang <b>Rp' + U.thousand(harga) + '</b>. Berapa uang yang <b>kurang</b>?'), harga - total, {
          rng: rng, min: 100, spread: 3, step: 100,
          topic: 'moneySimple', topicName: T('Money', 'Uang'),
          art: { kind: 'money', coins: nCoins, notes: nNotes },
          hint: T(U.money(harga) + ' − ' + U.money(total) + ' = ' + U.money(harga - total) + '.',
            'Rp' + U.thousand(harga) + ' − Rp' + U.thousand(total) + ' = Rp' + U.thousand(harga - total) + '.')
        });
    }
    var q = T('How much money in total is above?', 'Berapa rupiah semua uang di atas?');
    return num(q, total, {
      rng: rng, min: 0, spread: Math.max(100, nCoins * 100), step: 100,
      topic: 'moneySimple', topicName: T('Money', 'Uang'),
      art: { kind: 'money', coins: nCoins, notes: nNotes },
      hint: T(nCoins + ' coins × 100 = ' + (nCoins * 100) + (nNotes ? ', and ' + nNotes + ' notes of 5000 = ' + (nNotes * 5000) : '') + '.',
        nCoins + ' koin × 100 = ' + (nCoins * 100) + (nNotes ? ', dan ' + nNotes + ' uang 5000 = ' + (nNotes * 5000) : '') + '.')
    });
  };

  /* ============================================================
   *  LEVEL 6-10: PERKALIAN & PEMBAGIAN
   * ============================================================ */

  Topics.mul25 = function (rng, lv) {
    var k = pk(rng, [2, 5]);
    var n = ri(rng, 2, 10);
    var q = '<b>' + n + '</b> × <b>' + k + '</b> = ?';
    var useGroups = U.chance(rng, 0.4);
    return num(q, n * k, {
      rng: rng, min: 0, spread: k, step: 1, topic: 'mul25', topicName: T('Multiplication', 'Perkalian'),
      art: useGroups ? { kind: 'groups', groups: k, per: n, item: pk(rng, ['ball', 'star', 'flower']) } : null,
      hint: T(n + ' × ' + k + ' = ' + (n * k) + '. (' + n + ' added ' + k + ' times)',
        n + ' × ' + k + ' = ' + (n * k) + '. (tambah ' + n + ' sebanyak ' + k + ' kali)')
    });
  };

  Topics.mul345 = function (rng, lv) {
    var k = pk(rng, [3, 4]);
    var n = ri(rng, 2, 12);
    return num('<b>' + n + '</b> × <b>' + k + '</b> = ?', n * k, {
      rng: rng, min: 0, spread: k, step: 1, topic: 'mul345', topicName: T('Multiplication', 'Perkalian'),
      hint: T('Add ' + n + ' ' + k + ' times.', 'Tambah ' + n + ' sebanyak ' + k + ' kali.')
    });
  };

  Topics.timesTable = function (rng, lv) {
    var a = ri(rng, 2, 10), b = ri(rng, 2, 10);
    var ans = a * b;
    // variasi: faktor yang hilang
    if (U.chance(rng, 0.3)) {
      return num(T('<b>' + a + '</b> × … = <b>' + ans + '</b>  →  what factor is missing?',
        '<b>' + a + '</b> × … = <b>' + ans + '</b>  →  berapa faktor yang hilang?'), b, {
        rng: rng, min: 1, spread: Math.max(1, Math.floor(b / 2)), step: 1,
        candidates: [a],
        topic: 'timesTable', topicName: T('Multiplication', 'Perkalian'),
        hint: ans + ' ÷ ' + a + ' = ' + b + '.'
      });
    }
    return num(T('What is <b>' + a + '</b> × <b>' + b + '</b>?', 'Berapa <b>' + a + '</b> × <b>' + b + '</b>?'), ans, {
      rng: rng, min: 0, spread: Math.max(1, Math.floor(a / 2)), step: 1,
      topic: 'timesTable', topicName: T('Multiplication', 'Perkalian'),
      hint: a + ' × ' + b + ' = ' + ans + '.'
    });
  };

  Topics.divSmall = function (rng, lv) {
    var k = ri(rng, 2, 10);
    var n = ri(rng, 2, 10);
    var total = n * k;
    // variasi: pembagi yang hilang
    if (U.chance(rng, 0.3)) {
      return num(T('<b>' + total + '</b> ÷ … = <b>' + n + '</b>  →  what divisor is missing?',
        '<b>' + total + '</b> ÷ … = <b>' + n + '</b>  →  berapa pembagi yang hilang?'), k, {
        rng: rng, min: 2, spread: Math.max(1, Math.floor(k / 2)), step: 1,
        candidates: [n],
        topic: 'divSmall', topicName: T('Division', 'Pembagian'),
        hint: total + ' ÷ ' + n + ' = ' + k + '.'
      });
    }
    return num('<b>' + total + '</b> ÷ <b>' + k + '</b> = ?', n, {
      rng: rng, min: 0, spread: Math.max(1, Math.floor(n / 2)), step: 1,
      topic: 'divSmall', topicName: T('Division', 'Pembagian'),
      hint: T(total + ' divided by ' + k + ' equals ' + n + '.',
        total + ' dibagi ' + k + ' sama dengan ' + n + '.')
    });
  };

  Topics.div25 = function (rng, lv) {
    var k = pk(rng, [2, 5]);
    var n = ri(rng, 2, 20);
    var total = n * k;
    return num('<b>' + total + '</b> ÷ <b>' + k + '</b> = ?', n, {
      rng: rng, min: 0, spread: Math.max(1, Math.floor(n / 3)), step: 1,
      topic: 'div25', topicName: T('Division', 'Pembagian'),
      hint: T('How many ' + k + ' in ' + total + '? = ' + n + '.',
        'Berapa kali ' + k + ' dalam ' + total + '? = ' + n + '.')
    });
  };

  Topics.beforeAfter = function (rng, lv) {
    var n = ri(rng, 10, lv.scale.max);
    var askB = U.chance(rng, 0.5);
    var ans = askB ? n + 1 : n - 1;
    return num(T('The number <b>' + (askB ? 'after' : 'before') + '</b> <b>' + n + '</b> is?',
      'Bilangan <b>' + (askB ? 'setelah' : 'sebelum') + '</b> <b>' + n + '</b> adalah?'), ans, {
      rng: rng, min: 0, spread: 2, topic: 'beforeAfter', topicName: T('Before & After', 'Bilangan'),
      hint: T((askB ? 'Add 1 to ' + n : 'Subtract 1 from ' + n) + ' → ' + ans + '.',
        (askB ? 'Tambahkan 1 ke ' + n : 'Kurangi 1 dari ' + n) + ' → ' + ans + '.')
    });
  };

  Topics.add200 = function (rng, lv) {
    var max = lv.scale.max;
    var a = ri(rng, 10, max - 5);
    var b = ri(rng, 5, Math.max(5, max - a));
    return num('<b>' + a + '</b> + <b>' + b + '</b> = ?', a + b, {
      rng: rng, min: 0, spread: 10, step: 1, topic: 'add200', topicName: T('Addition', 'Penjumlahan'),
      hint: a + ' + ' + b + ' = ' + (a + b) + '.'
    });
  };

  Topics.sub200 = function (rng, lv) {
    var max = lv.scale.max;
    var a = ri(rng, Math.floor(max * 0.3), max);
    var b = ri(rng, 5, Math.max(5, a - Math.floor(max * 0.1)));
    return num('<b>' + a + '</b> − <b>' + b + '</b> = ?', a - b, {
      rng: rng, min: 0, spread: 10, topic: 'sub200', topicName: T('Subtraction', 'Pengurangan'),
      hint: a + ' − ' + b + ' = ' + (a - b) + '.'
    });
  };

  Topics.add3digit = function (rng, lv) {
    var a = ri(rng, 100, lv.scale.max);
    var b = ri(rng, 100, Math.max(100, Math.min(900, lv.scale.max - a + 100)));
    return num('<b>' + a + '</b> + <b>' + b + '</b> = ?', a + b, {
      rng: rng, min: 0, spread: 50, step: 10, topic: 'add3digit', topicName: T('Addition', 'Penjumlahan'),
      hint: T('Add thousands → hundreds → tens → ones.',
        'Jumlahkan ribuan → ratusan → puluhan → satuan.')
    });
  };

  Topics.sub3digit = function (rng, lv) {
    var a = ri(rng, 300, lv.scale.max);
    var b = ri(rng, 100, Math.max(100, a - 50));
    return num('<b>' + a + '</b> − <b>' + b + '</b> = ?', a - b, {
      rng: rng, min: 0, spread: 50, step: 10, topic: 'sub3digit', topicName: T('Subtraction', 'Pengurangan'),
      hint: T('Subtract in order from the ones to the thousands.',
        'Kurangkan berurutan dari satuan ke ribuan.')
    });
  };

  Topics.wordAddSub = function (rng, lv) {
    var nama = pk(rng, NAMA), barang = pk(rng, BARANG);
    var a = ri(rng, 5, 30);
    var b = ri(rng, 1, Math.min(20, a));
    var variant = ri(rng, 0, 4);
    var q, ans, hint;

    if (variant === 0) {
      // Donat / kue / camilan
      var kue = pk(rng, T(['chocolate donut', 'cupcake', 'cheese bread', 'sweet cake', 'strawberry pudding'],
        ['donat cokelat', 'kue mangkok', 'roti keju', 'bolu manis', 'puding stroberi']));
      var tambah = U.chance(rng, 0.5);
      if (tambah) {
        q = T('There are <b>' + a + '</b> ' + kue + ' on the table. Mom bakes <b>' + b + '</b> more. How many ' + kue + ' in all?',
          'Di meja ada <b>' + a + '</b> ' + kue + '. Ibu memanggang lagi <b>' + b + '</b>. Berapa ' + kue + ' semuanya?');
        ans = a + b;
        hint = a + ' + ' + b + ' = ' + ans + ' ' + kue + '.';
      } else {
        q = T('There are <b>' + a + '</b> ' + kue + ' in a jar. <b>' + b + '</b> are eaten with friends. How many are left?',
          'Ada <b>' + a + '</b> ' + kue + ' di toples. Dimakan bersama teman <b>' + b + '</b>. Berapa yang tersisa?');
        ans = a - b;
        hint = a + ' − ' + b + ' = ' + ans + ' ' + kue + '.';
      }
    } else if (variant === 1) {
      // Halaman buku / membaca
      var tambah2 = U.chance(rng, 0.5);
      if (tambah2) {
        q = T('<b>' + nama + '</b> read <b>' + a + '</b> book pages in the morning and <b>' + b + '</b> pages in the afternoon. What is the total number of pages read?',
          '<b>' + nama + '</b> membaca <b>' + a + '</b> halaman buku di pagi hari dan <b>' + b + '</b> halaman di sore hari. Berapa total halaman yang dibaca?');
        ans = a + b;
        hint = T(a + ' + ' + b + ' = ' + ans + ' pages.', a + ' + ' + b + ' = ' + ans + ' halaman.');
      } else {
        q = T('A story book has <b>' + a + '</b> pages. <b>' + nama + '</b> has read <b>' + b + '</b> pages. How many pages are still unread?',
          'Buku cerita punya <b>' + a + '</b> halaman. <b>' + nama + '</b> sudah membaca <b>' + b + '</b> halaman. Berapa halaman lagi yang belum dibaca?');
        ans = a - b;
        hint = T(a + ' − ' + b + ' = ' + ans + ' pages.', a + ' − ' + b + ' = ' + ans + ' halaman.');
      }
    } else if (variant === 2) {
      // Koleksi stiker / kelereng
      var koleksi = pk(rng, T(['cartoon stickers', 'rainbow marbles', 'animal cards', 'color pencils'],
        ['stiker kartun', 'kelereng pelangi', 'kartu hewan', 'pensil warna']));
      var tambah3 = U.chance(rng, 0.5);
      if (tambah3) {
        q = T('<b>' + nama + '</b> has <b>' + a + '</b> ' + koleksi + '. ' + nama + ' gets <b>' + b + '</b> more ' + koleksi + ' as a gift from an uncle. How many ' + koleksi + ' now?',
          '<b>' + nama + '</b> punya <b>' + a + '</b> ' + koleksi + '. Mendapat hadiah <b>' + b + '</b> ' + koleksi + ' lagi dari paman. Berapa koleksi ' + nama + ' sekarang?');
        ans = a + b;
        hint = a + ' + ' + b + ' = ' + ans + '.';
      } else {
        q = T('<b>' + nama + '</b> has <b>' + a + '</b> ' + koleksi + '. <b>' + nama + '</b> gives <b>' + b + '</b> to a younger sibling. How many does ' + nama + ' have left?',
          '<b>' + nama + '</b> punya <b>' + a + '</b> ' + koleksi + '. <b>' + nama + '</b> memberikan <b>' + b + '</b> kepada adiknya. Berapa sisa milik ' + nama + '?');
        ans = a - b;
        hint = a + ' − ' + b + ' = ' + ans + '.';
      }
    } else if (variant === 3) {
      // Burung / hewan di taman
      var hwn = pk(rng, T(['pigeons', 'pretty butterflies', 'koi fish'],
        ['burung merpati', 'kupu-kupu cantik', 'ikan koi']));
      var tambah4 = U.chance(rng, 0.5);
      if (tambah4) {
        q = T('There are <b>' + a + '</b> ' + hwn + ' in the pond. <b>' + b + '</b> more come. What is the total?',
          'Ada <b>' + a + '</b> ekor ' + hwn + ' di kolam. Datang lagi <b>' + b + '</b> ekor. Berapa jumlah seluruhnya?');
        ans = a + b;
        hint = T(a + ' + ' + b + ' = ' + ans + ' ' + hwn + '.', a + ' + ' + b + ' = ' + ans + ' ekor.');
      } else {
        q = T('There are <b>' + a + '</b> ' + hwn + ' in the garden. <b>' + b + '</b> fly away. How many are still there?',
          'Ada <b>' + a + '</b> ekor ' + hwn + ' di taman. Terbang <b>' + b + '</b> ekor. Berapa ekor yang masih tinggal?');
        ans = a - b;
        hint = T(a + ' − ' + b + ' = ' + ans + ' ' + hwn + '.', a + ' − ' + b + ' = ' + ans + ' ekor.');
      }
    } else {
      // Pola klasik
      var tambah5 = U.chance(rng, 0.5);
      q = tambah5
        ? T('<b>' + nama + '</b> has <b>' + a + '</b> ' + barang + '. Mom gives <b>' + b + '</b> more. How many ' + barang + ' does ' + nama + ' have now?',
          '<b>' + nama + '</b> punya <b>' + a + '</b> ' + barang + '. Ibu memberi lagi <b>' + b + '</b>. Berapa ' + barang + ' yang dimiliki ' + nama + ' sekarang?')
        : T('<b>' + nama + '</b> has <b>' + a + '</b> ' + barang + '. ' + nama + ' gives <b>' + b + '</b> ' + barang + ' to a friend. How many are left?',
          '<b>' + nama + '</b> punya <b>' + a + '</b> ' + barang + '. ' + nama + ' memberi <b>' + b + '</b> ' + barang + ' ke teman. Berapa yang tersisa?');
      ans = tambah5 ? a + b : a - b;
      hint = T((tambah5 ? 'Add: ' : 'Subtract: ') + a + (tambah5 ? ' + ' : ' − ') + b + ' = ' + ans + '.',
        (tambah5 ? 'Tambah: ' : 'Kurang: ') + a + (tambah5 ? ' + ' : ' − ') + b + ' = ' + ans + '.');
    }

    return num(q, ans, {
      rng: rng, min: 0, spread: 5, topic: 'wordAddSub', topicName: T('Story Problems', 'Soal Cerita'), hint: hint
    });
  };

  Topics.wordMulDiv = function (rng, lv) {
    var nama = pk(rng, NAMA), barang = pk(rng, BARANG);
    var k = ri(rng, 2, 5), n = ri(rng, 2, 8);
    var variant = ri(rng, 0, 4);
    var q, ans, hint;

    if (variant === 0) {
      // Baris dan formasi kursi / meja
      var tempat = pk(rng, T(['classroom', 'cinema hall', 'school hall'], ['ruang kelas', 'gedung bioskop', 'aula sekolah']));
      var benda = pk(rng, T(['chairs', 'desks'], ['kursi', 'meja belajar']));
      q = T('In the ' + tempat + ' there are <b>' + k + '</b> rows of ' + benda + '. Each row has <b>' + n + '</b> ' + benda + '. How many ' + benda + ' in all?',
        'Di ' + tempat + ' ada <b>' + k + '</b> baris ' + benda + '. Setiap baris terdiri dari <b>' + n + '</b> ' + benda + '. Berapa jumlah seluruh ' + benda + '?');
      ans = k * n;
      hint = T(k + ' rows × ' + n + ' = ' + ans + ' ' + benda + '.', k + ' baris × ' + n + ' = ' + ans + ' ' + benda + '.');
    } else if (variant === 1) {
      // Roda kendaraan
      var kend = pk(rng, [
        { nama: T('bicycles', 'sepeda santai'), roda: 2 },
        { nama: T('pedicabs', 'becak wisata'), roda: 3 },
        { nama: T('mini cars', 'mobil mini'), roda: 4 }
      ]);
      q = T('In the parking lot there are <b>' + k + '</b> ' + kend.nama + '. Each vehicle has <b>' + kend.roda + '</b> wheels. How many wheels in all?',
        'Di tempat parkir ada <b>' + k + '</b> buah ' + kend.nama + '. Tiap kendaraan memiliki <b>' + kend.roda + '</b> roda. Berapa jumlah semua rodanya?');
      ans = k * kend.roda;
      hint = T(k + ' × ' + kend.roda + ' = ' + ans + ' wheels.', k + ' × ' + kend.roda + ' = ' + ans + ' roda.');
    } else if (variant === 2) {
      // Paket kotak pensil / biskuit
      var wadah = pk(rng, T(['pencil boxes', 'biscuit packs', 'donut packs'], ['kotak pensil', 'bungkus biskuit', 'pak donat']));
      var isi = pk(rng, T(['pencils', 'chocolate biscuits', 'donuts'], ['pensil', 'biskuit cokelat', 'donat']));
      var isMul = U.chance(rng, 0.5);
      if (isMul) {
        q = T('<b>' + nama + '</b> buys <b>' + k + '</b> ' + wadah + '. Each box holds <b>' + n + '</b> ' + isi + '. How many ' + isi + ' in all?',
          '<b>' + nama + '</b> membeli <b>' + k + '</b> ' + wadah + '. Setiap wadah berisi <b>' + n + '</b> ' + isi + '. Berapa jumlah ' + isi + ' seluruhnya?');
        ans = k * n;
        hint = k + ' × ' + n + ' = ' + ans + ' ' + isi + '.';
      } else {
        q = T('There are <b>' + (k * n) + '</b> ' + isi + ' put equally into <b>' + k + '</b> ' + wadah + '. How many in each box?',
          'Ada <b>' + (k * n) + '</b> ' + isi + ' yang dimasukkan ke dalam <b>' + k + '</b> ' + wadah + ' sama rata. Berapa isi setiap wadah?');
        ans = n;
        hint = (k * n) + ' ÷ ' + k + ' = ' + n + ' ' + isi + '.';
      }
    } else if (variant === 3) {
      // Bagi rata kue / buah
      var buah = pk(rng, T(['apples', 'sweet oranges', 'cupcakes'], ['buah apel', 'jeruk manis', 'kue mangkok']));
      q = T('Mom shares <b>' + (k * n) + '</b> ' + buah + ' among <b>' + k + '</b> children equally. How many does each child get?',
        'Ibu membagikan <b>' + (k * n) + '</b> ' + buah + ' kepada <b>' + k + '</b> anak sama rata. Berapa yang didapat setiap anak?');
      ans = n;
      hint = T((k * n) + ' ÷ ' + k + ' = ' + n + ' per child.', (k * n) + ' ÷ ' + k + ' = ' + n + ' per anak.');
    } else {
      // Pola klasik
      var mul = U.chance(rng, 0.5);
      q = mul
        ? T('<b>' + nama + '</b> collects <b>' + k + '</b> packs of ' + barang + '. Each pack holds <b>' + n + '</b> ' + barang + '. How many ' + barang + ' in all?',
          '<b>' + nama + '</b> mengoleksi <b>' + k + '</b> bungkus ' + barang + '. Tiap bungkus berisi <b>' + n + '</b> ' + barang + '. Berapa jumlah ' + barang + ' semua?')
        : T('<b>' + nama + '</b> has <b>' + (k * n) + '</b> ' + barang + '. ' + nama + ' shares them equally among <b>' + k + '</b> friends. How many does each friend get?',
          '<b>' + nama + '</b> punya <b>' + (k * n) + '</b> ' + barang + '. ' + nama + ' membaginya kepada <b>' + k + '</b> teman sama banyak. Berapa yang diterima tiap teman?');
      ans = mul ? k * n : n;
      hint = T((mul ? 'Multiplication: ' : 'Division: ') + (mul ? (k + ' × ' + n) : (k * n + ' ÷ ' + k)) + ' = ' + ans + '.',
        (mul ? 'Perkalian: ' : 'Pembagian: ') + (mul ? (k + ' × ' + n) : (k * n + ' ÷ ' + k)) + ' = ' + ans + '.');
    }

    return num(q, ans, {
      rng: rng, min: 0, spread: Math.max(2, ans <= 10 ? 2 : Math.floor(ans / 3)),
      topic: 'wordMulDiv', topicName: T('Story Problems', 'Soal Cerita'), hint: hint
    });
  };

  Topics.wordMulti = function (rng, lv) {
    var nama = pk(rng, NAMA), barang = pk(rng, BARANG), hewan = pk(rng, HEWAN);
    var k = ri(rng, 3, 6), n = ri(rng, 3, 9), extra = ri(rng, 2, 10);
    var mode = ri(rng, 0, 3);
    var q, ans, hint;

    if (mode === 0) {
      // (kandang x isi) + tambahan
      q = T('At the zoo there are <b>' + k + '</b> cages. Each cage holds <b>' + n + '</b> ' + hewan +
        '. A keeper adds <b>' + extra + '</b> more ' + hewan + ' outside the cages. ' +
        'How many ' + hewan + ' in all now?',
        'Di kebun binatang ada <b>' + k + '</b> kandang. Tiap kandang berisi <b>' + n + '</b> ' + hewan +
        '. Petugas menambah <b>' + extra + '</b> ' + hewan + ' lagi di luar kandang. ' +
        'Berapa total ' + hewan + ' sekarang?');
      ans = k * n + extra;
      hint = T('First ' + k + ' \u00d7 ' + n + ' = ' + (k * n) + ', then ' + (k * n) + ' + ' + extra + ' = ' + ans + '.',
        'Pertama ' + k + ' \u00d7 ' + n + ' = ' + (k * n) + ', lalu ' + (k * n) + ' + ' + extra + ' = ' + ans + '.');
    } else if (mode === 1) {
      // beli sebagian, sisanya
      var punya = k * n + extra;
      var beli = k * extra;
      q = T('The store has <b>' + punya + '</b> ' + barang + '. <b>' + nama + '</b> buys <b>' +
        beli + '</b> ' + barang + '. How many ' + barang + ' are left?',
        'Toko punya <b>' + punya + '</b> ' + barang + '. <b>' + nama + '</b> membeli <b>' +
        beli + '</b> ' + barang + '. Berapa ' + barang + ' yang tersisa?');
      ans = punya - beli;
      hint = punya + ' \u2212 ' + beli + ' = ' + ans + ' ' + barang + '.';
    } else if (mode === 2) {
      // Skor lomba kuis
      var benar = ri(rng, 4, 8);
      var poinPer = pk(rng, [5, 10]);
      var bonus = ri(rng, 1, 5) * 5;
      q = T('In a math quiz, <b>' + nama + '</b> answers <b>' + benar + '</b> questions correctly, each worth <b>' + poinPer +
        '</b> points, and gets a bonus of <b>' + bonus + '</b> points. What is the total score of ' + nama + '?',
        'Dalam kuis matematika, <b>' + nama + '</b> menjawab benar <b>' + benar + '</b> soal berpoin <b>' + poinPer +
        '</b> dan mendapat poin bonus <b>' + bonus + '</b>. Berapa total skor ' + nama + '?');
      ans = benar * poinPer + bonus;
      hint = T(benar + ' × ' + poinPer + ' = ' + (benar * poinPer) + ', plus bonus ' + bonus + ' = ' + ans + ' points.',
        benar + ' × ' + poinPer + ' = ' + (benar * poinPer) + ', ditambah bonus ' + bonus + ' = ' + ans + ' poin.');
    } else {
      // (total / per) - dipakai
      var per = pk(rng, [3, 4, 5, 6]);
      var paket = ri(rng, 3, 8);
      var total = per * paket;
      var dipakai = ri(rng, 1, paket - 1);
      q = T('There are <b>' + total + '</b> ' + barang + ' shared equally among <b>' + paket + '</b> people. ' +
        nama + ' uses <b>' + dipakai + '</b> ' + barang + '. How many does ' + nama + ' have left?',
        'Ada <b>' + total + '</b> ' + barang + ' yang dibagi rata ke <b>' + paket + '</b> orang. ' +
        nama + ' memakai <b>' + dipakai + '</b> ' + barang + '. Sisa milik ' + nama + ' berapa?');
      ans = per - dipakai;
      hint = T(total + ' \u00f7 ' + paket + ' = ' + per + ' each, then ' + per + ' \u2212 ' + dipakai + ' = ' + ans + '.',
        total + ' \u00f7 ' + paket + ' = ' + per + ' per orang, lalu ' + per + ' \u2212 ' + dipakai + ' = ' + ans + '.');
    }
    return num(q, ans, {
      rng: rng, min: 0, spread: Math.max(2, Math.floor(Math.max(1, ans) / 2)),
      topic: 'wordMulti', topicName: T('Story Problems', 'Soal Cerita'), hint: hint
    });
  };

  /* ============================================================
   *  LEVEL 11-13: KELILING, LUAS, PECAHAN, DESIMAL
   * ============================================================ */

  Topics.rectArea = function (rng, lv) {
    var w = ri(rng, 2, 12), h = ri(rng, 2, 12);
    var ans = w * h;
    var obj = pk(rng, T(['study desk', 'drawing book', 'photo frame', 'mini whiteboard', 'ceramic tile'],
      ['meja belajar', 'buku gambar', 'pigura foto', 'papan tulis mini', 'ubin keramik']));
    var q = U.chance(rng, 0.4)
      ? T('A <b>' + obj + '</b> is rectangular, with length <b>' + Math.max(w, h) + ' cm</b> and width <b>' + Math.min(w, h) + ' cm</b>. What is its area (cm²)?',
        'Sebuah <b>' + obj + '</b> berbentuk persegi panjang dengan panjang <b>' + Math.max(w, h) + ' cm</b> dan lebar <b>' + Math.min(w, h) + ' cm</b>. Berapa luasnya (cm²)?')
      : T('What is the area of the rectangle above? (unit cm²)', 'Luas persegi panjang di atas berapa? (satuan cm²)');
    return num(q, ans, {
      rng: rng, min: 0, spread: Math.max(2, Math.floor(w / 2)), step: 1,
      topic: 'rectArea', topicName: T('Area', 'Luas'),
      art: { kind: 'rect', w: w, h: h, hl: 'w', hlLabel: w + ' cm' },
      hint: T('Area = length × width = ' + w + ' × ' + h + ' = ' + ans + ' cm².',
        'Luas = panjang × lebar = ' + w + ' × ' + h + ' = ' + ans + ' cm².')
    });
  };

  Topics.rectPerimeter = function (rng, lv) {
    var w = ri(rng, 2, 12), h = ri(rng, 2, 12);
    var ans = 2 * (w + h);
    var obj = pk(rng, T(['picture frame', 'mini garden', 'mini badminton court', 'poster board'],
      ['bingkai lukisan', 'taman mini', 'lapangan badminton mini', 'karton poster']));
    var q = U.chance(rng, 0.4)
      ? T('A <b>' + obj + '</b> measures <b>' + Math.max(w, h) + ' cm</b> long and <b>' + Math.min(w, h) + ' cm</b> wide. What is its perimeter (cm)?',
        'Sebuah <b>' + obj + '</b> berukuran panjang <b>' + Math.max(w, h) + ' cm</b> dan lebar <b>' + Math.min(w, h) + ' cm</b>. Berapa kelilingnya (cm)?')
      : T('What is the perimeter of the rectangle above? (unit cm)', 'Keliling persegi panjang di atas berapa? (satuan cm)');
    return num(q, ans, {
      rng: rng, min: 0, spread: Math.max(2, Math.floor(w)), step: 1,
      topic: 'rectPerimeter', topicName: T('Perimeter', 'Keliling'),
      art: { kind: 'rect', w: w, h: h, hl: 'h', hlLabel: h + ' cm' },
      hint: T('Perimeter = 2 × (l + w) = 2 × (' + w + ' + ' + h + ') = ' + ans + ' cm.',
        'Keliling = 2 × (p + l) = 2 × (' + w + ' + ' + h + ') = ' + ans + ' cm.')
    });
  };

  Topics.compositeArea = function (rng, lv) {
    // Luas bangun = luas penuh dikurangi sudut yang dipotong
    var w = ri(rng, 6, 14), h = ri(rng, 5, 12);
    var sw = ri(rng, 2, Math.floor(w / 2)), sh = ri(rng, 2, Math.floor(h / 2));
    var ans = w * h - sw * sh;
    var art = {
      kind: 'shape', shape: 'rect',
      labels: { w: w + ' cm', h: h + ' cm' }
    };
    return num(T('What is the area of the <b>blue</b> region in the picture? (Count the full area ' + w +
      ' \u00d7 ' + h + ', minus the red cut-out ' + sw + ' \u00d7 ' + sh + '.)',
      'Luas daerah <b>biru</b> pada gambar itu berapa? (Hitung dari luas penuh ' + w +
      ' \u00d7 ' + h + ', dikurangi potongan merah ' + sw + ' \u00d7 ' + sh + '.)'), ans, {
      rng: rng, min: 0, spread: Math.max(3, Math.floor(sw * sh / 3)), step: 1,
      topic: 'compositeArea', topicName: T('Composite Area', 'Luas Majemuk'), art: art,
      hint: T('Full: ' + w + ' \u00d7 ' + h + ' = ' + (w * h) + '. Cut out: ' + sw + ' \u00d7 ' + sh +
        ' = ' + (sw * sh) + '. Difference = ' + ans + '.',
        'Penuh: ' + w + ' \u00d7 ' + h + ' = ' + (w * h) + '. Dipotong: ' + sw + ' \u00d7 ' + sh +
        ' = ' + (sw * sh) + '. Selisih = ' + ans + '.')
    });
  };

  Topics.volume = function (rng, lv) {
    var a = ri(rng, 2, 8), b = ri(rng, 2, 8), c = pk(rng, [1, 2, 2, 3]);
    var ans = a * b * c;
    return num(T('What is the volume of the box above? (unit cm³)', 'Volume balok di atas berapa? (satuan cm³)'), ans, {
      rng: rng, min: 0, spread: Math.max(3, Math.floor(a)), step: 1,
      topic: 'volume', topicName: T('Volume', 'Volume'),
      art: { kind: 'cube', a: a, b: b, c: c },
      hint: T('Volume = length × width × height = ' + a + '×' + b + '×' + c + ' = ' + ans + ' cm³.',
        'Volume = p × l × t = ' + a + '×' + b + '×' + c + ' = ' + ans + ' cm³.')
    });
  };

  Topics.fractionIntro = function (rng, lv) {
    var d = pk(rng, [2, 3, 4, 5, 6, 8]);
    var n = ri(rng, 1, d);
    var artKind = U.chance(rng, 0.5) ? 'fractionCircle' : 'fractionBar';
    // variasi: tanyakan bagian yang TIDAK diwarnai
    var askWhite = U.chance(rng, 0.3) && n < d;
    var ansN = askWhite ? d - n : n;
    var ansText = ansN + '/' + d;
    var q = askWhite
      ? T('What fraction does the <b>uncolored</b> part of the picture show?',
        'Bagian yang <b>tidak diwarnai</b> pada gambar bernilai pecahan berapa?')
      : T('What fraction is shown in the picture?',
        'Bilangan pecahan yang ditunjukkan pada gambar adalah?');
    return txt(q, ansText, [
      n + '/' + d, (d - ansN) + '/' + d, ansN + '/' + (d + 1), (ansN + 1) + '/' + d,
      (ansN * 2) + '/' + (d * 2), '1/' + d, ansN + '/' + (d * 2)
    ].filter(function (x) { return x !== ansText && x.indexOf('/') > 0; }), {
      rng: rng, topic: 'fractionIntro', topicName: T('Fractions', 'Pecahan'),
      art: { kind: artKind, n: n, d: d },
      hint: T((askWhite ? 'The uncolored part is ' + (d - n) + ' of ' + d + ' parts → ' + ansText + '.'
        : 'The colored part is ' + n + ' of ' + d + ' parts → ' + ansText + '.'),
        (askWhite ? 'Bagian tidak diwarnai ' + (d - n) + ' dari total ' + d + ' bagian → ' + ansText + '.'
          : 'Bagian yang diwarnai ' + n + ' dari total ' + d + ' bagian → ' + ansText + '.'))
    });
  };

  Topics.fractionCompare = function (rng, lv) {
    // penyebut minimal 4 supaya ada beberapa pembilang berbeda
    var d = pk(rng, [4, 5, 6, 8, 10, 12]);
    var n1 = ri(rng, 1, d - 1), n2 = ri(rng, 1, d - 1);
    var guard = 0;
    while (n2 === n1 && guard++ < 20) n2 = ri(rng, 1, d - 1);
    if (n2 === n1) n2 = (n1 % (d - 1)) + 1;
    var bigger = n1 > n2 ? n1 + '/' + d : n2 + '/' + d;
    var smaller = n1 > n2 ? n2 + '/' + d : n1 + '/' + d;
    var askBig = U.chance(rng, 0.5);
    var answerText = askBig ? bigger : smaller;
    return txt(T('Which is <b>' + (askBig ? 'bigger' : 'smaller') + '</b>?',
      'Mana yang lebih <b>' + (askBig ? 'besar' : 'kecil') + '</b>?'), answerText,
      [smaller, bigger, '1/' + d, (n1 + 1) + '/' + d, (n2 + 1) + '/' + d]
        .filter(function (x, i, a) { return a.indexOf(x) === i && x !== answerText; }), {
        rng: rng, topic: 'fractionCompare', topicName: T('Comparing Fractions', 'Bandingkan Pecahan'),
        art: { kind: 'fractionCircle', n: n1, d: d },
        hint: T('Same denominator (' + d + '), so compare the numerators: ' + n1 + ' vs ' + n2 + '.',
          'Penyebut sama (' + d + '), jadi bandingkan pembilang: ' + n1 + ' vs ' + n2 + '.')
      });
  };

  Topics.fractionAddSame = function (rng, lv) {
    var d = pk(rng, [4, 5, 6, 8, 10, 12]);
    var a = ri(rng, 1, d - 2), b = ri(rng, 1, d - a);
    var s = a + b;
    var whole = Math.floor(s / d), rem = s % d;
    var ansText = rem === 0 ? String(whole) : (whole > 0 ? (whole + ' ' + rem + '/' + d) : (rem + '/' + d));
    return txt('<b>' + a + '/' + d + '</b> + <b>' + b + '/' + d + '</b> = ?', ansText, [
      (a + b) + '/' + (d * 2), (a * b) + '/' + d, rem + '/' + d,
      (s) + '/' + (d + 1), a + '/' + (a + b)
    ].filter(function (x) { return x !== ansText; }), {
      rng: rng, topic: 'fractionAddSame', topicName: T('Adding Fractions', 'Penjumlahan Pecahan'),
      art: { kind: 'fractionBar', n: a, d: d },
      hint: T('Same denominator, add the numerators: ' + a + ' + ' + b + ' = ' + s + '/' + d + (rem === 0 ? ' = ' + whole : '') + '.',
        'Penyebut sama, jumlahkan pembilang: ' + a + ' + ' + b + ' = ' + s + '/' + d + (rem === 0 ? ' = ' + whole : '') + '.')
    });
  };

  Topics.decimalIntro = function (rng, lv) {
    var whole = ri(rng, 1, 30);
    var d = ri(rng, 1, 9);
    var val = whole + d / 10;
    var askFrac = U.chance(rng, 0.5);
    if (askFrac) {
      var fr = U.decToFrac(val);
      return txt(T('Change the decimal number <b>' + U.trimNum(val) + '</b> into a fraction.',
        'Ubah bilangan desimal <b>' + U.trimNum(val) + '</b> menjadi pecahan.'), fr, [
        U.trimNum(whole) + '/' + d, (d) + '/' + 10, U.decToFrac(whole + (d + 1) / 10), U.decToFrac(whole - d / 10)
      ].filter(function (x) { return x !== fr; }), {
        rng: rng, topic: 'decimalIntro', topicName: T('Decimals', 'Bilangan Desimal'),
        hint: U.trimNum(val) + ' = ' + whole + ' + ' + d + '/10.'
      });
    }
    // tentukan tempat desimal
    var digit = d;
    return num(T('What digit is <b>' + digit + '</b> in the decimal number <b>' + U.trimNum(val) + '</b>? (its place value)',
      'Berapa digit <b>' + digit + '</b> pada bilangan desimal <b>' + U.trimNum(val) + '</b>? (nilai tempatnya)'), digit, {
      rng: rng, min: 0, max: 9, spread: 1,
      topic: 'decimalIntro', topicName: T('Decimals', 'Bilangan Desimal'),
      hint: T('The digit ' + digit + ' sits after the decimal point → the tenths place.',
        'Angka ' + digit + ' ada di belakang tanda koma → satuan desimal.')
    });
  };

  Topics.decimalArith = function (rng, lv) {
    var a = ri(rng, 10, 60), b = ri(rng, 10, 60);
    var da = ri(rng, 1, 9) / 10, db = ri(rng, 1, 9) / 10;
    var x = a + da, y = b + db;
    var add = U.chance(rng, 0.5);
    var ans = add ? x + y : x - y;
    return num(U.trimNum(x) + (add ? ' + ' : ' − ') + U.trimNum(y) + ' = ?', ans, {
      rng: rng, dec: 1, min: 0, spread: 2, step: 0.1,
      topic: 'decimalArith', topicName: T('Decimals', 'Desimal'),
      hint: T('Line up the decimal points first: ' + U.trimNum(x) + ' and ' + U.trimNum(y) + '.',
        'Samakan koma desimal dulu: ' + U.trimNum(x) + ' dan ' + U.trimNum(y) + '.')
    });
  };

  /* ============================================================
   *  LEVEL 14-16: PERSEN, RASIO, BILANGAN BULAT, SATUAN, ALJABAR
   * ============================================================ */

  function gcdFn(a, b) { while (b) { var t = a % b; a = b; b = t; } return a; }

  /* ---------- Topik tambahan: sudut ---------- */
  Topics.angleBasic = function (rng, lv) {
    var mode = ri(rng, 0, 2);

    if (mode === 0) {
      // Namai jenis sudut
      var deg = pk(rng, [30, 45, 60, 75, 90, 105, 120, 135, 150, 180]);
      var jenis = deg < 90 ? T('acute', 'lancip') : deg === 90 ? T('right', 'siku') : deg < 180 ? T('obtuse', 'tumpul') : T('straight', 'lurus');
      return txt(T('The angle below measures <b>' + deg + '°</b>. What <b>type of angle</b> is it?',
        'Sudut di bawah besarnya <b>' + deg + '°</b>. <b>Macam sudut</b> itu apa?'),
        jenis, [T('acute', 'lancip'), T('right', 'siku'), T('obtuse', 'tumpul'), T('straight', 'lurus'), 'reflex'].filter(function (x) { return x !== jenis; }), {
          rng: rng, topic: 'angleBasic', topicName: T('Angles', 'Sudut'),
          art: { kind: 'shape', shape: 'angle', labels: { deg: deg } },
          hint: T(deg < 90 ? 'Less than 90° = acute.' : deg === 90 ? 'Exactly 90° = right.' :
            deg < 180 ? 'Between 90° and 180° = obtuse.' : 'Exactly 180° = straight.',
            deg < 90 ? 'Kurang dari 90° = lancip.' : deg === 90 ? 'Tepat 90° = siku.' :
            deg < 180 ? 'Antara 90° dan 180° = tumpul.' : 'Tepat 180° = lurus.')
        });
    }

    if (mode === 1) {
      // Sudut pada jarum jam
      var clockAngles = [
        { jam: 3, sudut: T('right', 'siku'), deg: 90, h: 3, m: 0 },
        { jam: 6, sudut: T('straight', 'lurus'), deg: 180, h: 6, m: 0 },
        { jam: 9, sudut: T('right', 'siku'), deg: 90, h: 9, m: 0 },
        { jam: 1, sudut: T('acute', 'lancip'), deg: 30, h: 1, m: 0 },
        { jam: 2, sudut: T('acute', 'lancip'), deg: 60, h: 2, m: 0 },
        { jam: 4, sudut: T('obtuse', 'tumpul'), deg: 120, h: 4, m: 0 }
      ];
      var ca = pk(rng, clockAngles);
      return txt(T('At <b>' + (ca.jam < 10 ? '0' + ca.jam : ca.jam) + ':00</b>, what <b>kind of angle</b> do the two hands make?',
        'Pada <b>pukul ' + (ca.jam < 10 ? '0' + ca.jam : ca.jam) + '.00</b>, kedua jarum jam membentuk <b>sudut apa</b>?'),
        ca.sudut, [T('acute', 'lancip'), T('right', 'siku'), T('obtuse', 'tumpul'), T('straight', 'lurus')].filter(function (x) { return x !== ca.sudut; }), {
          rng: rng, topic: 'angleBasic', topicName: T('Angles', 'Sudut'),
          art: { kind: 'clock', h: ca.h, m: ca.m },
          hint: T('At ' + ca.jam + ':00, the angle measures ' + ca.deg + '° (a ' + ca.sudut + ' angle).',
            'Pada pukul ' + ca.jam + '.00, besar sudutnya adalah ' + ca.deg + '° (sudut ' + ca.sudut + ').')
        });
    }

    // Sudut ketiga segitiga (total 180°)
    var a1 = ri(rng, 3, 8) * 10;
    var a2 = ri(rng, 3, 14 - (a1 / 10)) * 10;
    var a3 = 180 - (a1 + a2);
    return num(T('Two angles in a triangle measure <b>' + a1 + '°</b> and <b>' + a2 + '°</b>. What is the <b>third angle</b>?',
      'Dua sudut dalam segitiga besarnya <b>' + a1 + '°</b> dan <b>' + a2 + '°</b>. Berapa besar <b>sudut ketiga</b>?'), a3, {
      rng: rng, min: 10, spread: 2, step: 10,
      topic: 'angleBasic', topicName: T('Angles', 'Sudut'),
      hint: T('The angles of a triangle always add up to 180°. 180° − (' + a1 + '° + ' + a2 + '°) = ' + a3 + '°.',
        'Jumlah seluruh sudut segitiga selalu 180°. 180° − (' + a1 + '° + ' + a2 + '°) = ' + a3 + '°.')
    });
  };

  /* ---------- Topik tambahan: perkalian angka 2 digit ---------- */
  Topics.mul2digit = function (rng, lv) {
    var mode = ri(rng, 0, 2);

    if (mode === 0) {
      var a = ri(rng, 11, 40), k = ri(rng, 2, 9);
      return num('<b>' + a + '</b> × <b>' + k + '</b> = ?', a * k, {
        rng: rng, min: 0, spread: Math.max(2, k), step: 1,
        topic: 'mul2digit', topicName: T('Multiplication', 'Perkalian'),
        hint: T(a + ' × ' + k + ' = ' + (a * k) + '. (' + a + ' added ' + k + ' times)',
          a + ' × ' + k + ' = ' + (a * k) + '. (' + a + ' dijumlahkan ' + k + ' kali)')
      });
    }

    if (mode === 1) {
      var n = ri(rng, 3, 12), k2 = ri(rng, 3, 9);
      var prod = n * k2;
      return num('<b>' + prod + '</b> ÷ <b>' + n + '</b> = ?', k2, {
        rng: rng, min: 0, spread: Math.max(2, k2), step: 1,
        topic: 'mul2digit', topicName: T('Multiplication & Division', 'Perkalian & Pembagian'),
        hint: T('How many ' + n + ' in ' + prod + '? = ' + k2 + '.',
          'Berapa kali ' + n + ' dalam ' + prod + '? = ' + k2 + '.')
      });
    }

    var x = ri(rng, 12, 25), y = ri(rng, 3, 6);
    return num(T('What is the area of <b>' + x + ' × ' + y + '</b>?',
      'Luas <b>' + x + ' × ' + y + '</b> sama dengan berapa?'), x * y, {
      rng: rng, min: 0, spread: Math.max(2, y), step: 1,
      topic: 'mul2digit', topicName: T('Multiplication', 'Perkalian'),
      art: { kind: 'rect', w: x, h: y, hl: 'w', hlLabel: x + ' cm' },
      hint: x + ' × ' + y + ' = ' + (x * y) + ' cm².'
    });
  };

  /** Bangun soal persen dengan jawaban yang SELALU bilangan bulat. */
  Topics.percent = function (rng, lv) {
    var mode = ri(rng, 0, 4);

    if (mode === 0) {
      // p% dari n  ->  pilih n sebagai kelipatan (100/gcd(p,100)) supaya hasilnya bulat
      var p = pk(rng, [10, 20, 25, 50, 75, 5, 30, 40, 60, 80]);
      var unit = 100 / gcdFn(p, 100);
      var n = unit * ri(rng, 1, 8);
      var ans = n * p / 100;
      return num(T('<b>' + p + '%</b> of <b>' + n + '</b> is what?',
        '<b>' + p + '%</b> dari <b>' + n + '</b> adalah?'), ans, {
        rng: rng, min: 0, spread: Math.max(2, Math.floor(ans / 4)), step: ans % 5 === 0 ? 5 : 1,
        topic: 'percent', topicName: T('Percent', 'Persen'),
        hint: n + ' × ' + p + '/100 = ' + ans + '.'
      });
    }

    if (mode === 1) {
      // x adalah p% dari berapa?
      var p2 = pk(rng, [10, 20, 25, 40, 50, 60, 75, 80]);
      var unit2 = 100 / gcdFn(p2, 100);
      var n2 = unit2 * ri(rng, 2, 10);
      var ans2 = n2 * p2 / 100;
      return num(T('<b>' + ans2 + '</b> is <b>' + p2 + '%</b> of what?',
        '<b>' + ans2 + '</b> itu <b>' + p2 + '%</b> dari berapa?'), n2, {
        rng: rng, min: 0, spread: Math.max(5, Math.floor(n2 / 4)), step: unit2 > 1 ? unit2 : 1,
        topic: 'percent', topicName: T('Percent', 'Persen'),
        hint: T(p2 + '% of ' + n2 + ' = ' + ans2 + '. So the answer is ' + n2 + '.',
          p2 + '% dari ' + n2 + ' = ' + ans2 + '. Jadi jawabannya ' + n2 + '.')
      });
    }

    if (mode === 2) {
      // x adalah berapa persen dari y  -> pasangan yang sudah dijamin bulat
      var pairs = [
        [200, 20], [200, 40], [200, 50], [200, 100], [200, 160], [200, 180],
        [400, 40], [400, 80], [400, 100], [400, 240], [400, 320],
        [500, 50], [500, 100], [500, 150], [500, 250], [500, 400],
        [800, 80], [800, 160], [800, 200], [800, 320], [800, 640],
        [1000, 100], [1000, 200], [1000, 250], [1000, 400], [1000, 800]
      ];
      var pr = pk(rng, pairs);
      var ansP = pr[1] / pr[0] * 100;
      return num(T('What percent is <b>' + pr[1] + '</b> of <b>' + pr[0] + '</b>?',
        'Berapa persen <b>' + pr[1] + '</b> dari <b>' + pr[0] + '</b>?'), ansP, {
        rng: rng, min: 0, spread: Math.max(5, ansP / 4), step: ansP % 10 === 0 ? 10 : 5,
        topic: 'percent', topicName: T('Percent', 'Persen'),
        candidates: [ansP + 10, ansP - 10, ansP * 2, ansP / 2],
        hint: pr[1] + ' ÷ ' + pr[0] + ' = ' + ansP + '%.'
      });
    }

    if (mode === 3) {
      // Diskon belanja
      var hargaAwal = pk(rng, [20000, 30000, 40000, 50000, 60000, 80000, 100000]);
      var diskonP = pk(rng, [10, 20, 25, 50]);
      var potongan = hargaAwal * diskonP / 100;
      var barangDiskon = pk(rng, T(['school shoes', 'backpack', 'warm jacket', 'encyclopedia'],
        ['sepatu sekolah', 'tas ransel', 'jaket hangat', 'buku ensiklopedia']));
      return num(T('A <b>' + barangDiskon + '</b> costing <b>' + U.money(hargaAwal) + '</b> gets a <b>' + diskonP + '%</b> discount. How much is the price cut?',
        'Sebuah <b>' + barangDiskon + '</b> seharga <b>Rp' + U.thousand(hargaAwal) + '</b> mendapat diskon <b>' + diskonP + '%</b>. Berapa rupiah potongan harganya?'), potongan, {
        rng: rng, min: 1000, spread: 3, step: 2000,
        topic: 'percent', topicName: T('Percent', 'Persen'),
        hint: T('Discount ' + diskonP + '% of ' + U.money(hargaAwal) + ' = ' + U.money(potongan) + '.',
          'Diskon ' + diskonP + '% dari Rp' + U.thousand(hargaAwal) + ' = Rp' + U.thousand(potongan) + '.')
      });
    }

    // Kelompok siswa / objek
    var totSiswa = pk(rng, [20, 30, 40, 50]);
    var pct = pk(rng, [10, 20, 25, 50]);
    var suka = totSiswa * pct / 100;
    var keg = pk(rng, T(['love math', 'love reading', 'join the science club', 'play soccer'],
      ['gemar matematika', 'suka membaca', 'mengikuti klub sains', 'bermain sepak bola']));
    return num(T('A class has <b>' + totSiswa + ' students</b>. <b>' + pct + '%</b> of the students ' + keg + '. How many students ' + keg + '?',
      'Di sebuah kelas terdapat <b>' + totSiswa + ' siswa</b>. Sebanyak <b>' + pct + '%</b> siswa ' + keg + '. Berapa banyak siswa yang ' + keg + '?'), suka, {
      rng: rng, min: 1, spread: 2,
      topic: 'percent', topicName: T('Percent', 'Persen'),
      hint: T(pct + '% of ' + totSiswa + ' = ' + suka + ' students.',
        pct + '% dari ' + totSiswa + ' = ' + suka + ' siswa.')
    });
  };

  Topics.integerOps = function (rng, lv) {
    var a = ri(rng, 2, 20), b = ri(rng, 1, 9);
    var mode = ri(rng, 0, 2);
    var q, ans, hint;
    if (mode === 0) {
      q = '(−' + a + ') + (' + b + ') = ?';
      ans = -a + b;
      hint = T('Integers: −' + a + ' + ' + b + ' = ' + ans + '.', 'Bilangan bulat: −' + a + ' + ' + b + ' = ' + ans + '.');
    } else if (mode === 1) {
      q = '(−' + a + ') − (' + b + ') = ?'; ans = -a - b;
      hint = '−' + a + ' − ' + b + ' = −' + (a + b) + '.';
    } else {
      q = '(+' + a + ') × (−' + b + ') = ?'; ans = -a * b;
      hint = T('Positive × negative = negative. ' + a + ' × ' + b + ' = ' + (a * b) + '.',
        'Positif × negatif = negatif. ' + a + ' × ' + b + ' = ' + (a * b) + '.');
    }
    return num(q, ans, {
      rng: rng, min: -a * b - 20, allowNegative: true, spread: Math.max(2, b), step: 1,
      topic: 'integerOps', topicName: T('Integers', 'Bilangan Bulat'),
      hint: hint
    });
  };

  Topics.orderOps = function (rng, lv) {
    var a = ri(rng, 2, 12), b = ri(rng, 2, 8), c = ri(rng, 2, 6);
    var mode = ri(rng, 0, 2);
    var q, ans, hint;
    if (mode === 0) {
      q = a + ' × ' + b + ' + ' + c + ' = ?'; ans = a * b + c;
      hint = T('Multiplication first: ' + a + '×' + b + '=' + (a * b) + ', then +' + c + '=' + ans + '.',
        'Perkalian dulu: ' + a + '×' + b + '=' + (a * b) + ', lalu +' + c + '=' + ans + '.');
    } else if (mode === 1) {
      q = '(' + a + ' + ' + b + ') × ' + c + ' = ?'; ans = (a + b) * c;
      hint = T('Parentheses first: ' + a + '+' + b + '=' + (a + b) + ', then ×' + c + '=' + ans + '.',
        'Tanda kurung dulu: ' + a + '+' + b + '=' + (a + b) + ', lalu ×' + c + '=' + ans + '.');
    } else {
      q = a + ' + ' + b + ' × ' + c + ' = ?'; ans = a + b * c;
      hint = T('Multiplication first: ' + b + '×' + c + '=' + (b * c) + ', then +' + a + '=' + ans + '.',
        'Perkalian dulu: ' + b + '×' + c + '=' + (b * c) + ', lalu +' + a + '=' + ans + '.');
    }
    return num(q, ans, { rng: rng, min: 0, spread: Math.max(2, Math.floor(ans / 5)), topic: 'orderOps', topicName: T('Order of Operations', 'Urutan Operasi'), hint: hint });
  };

  Topics.ratioSimple = function (rng, lv) {
    var a = ri(rng, 2, 12), b = ri(rng, 2, 12);
    var guard = 0;
    while (b === a && guard++ < 20) b = ri(rng, 2, 12);
    if (b === a) b = (a % 12) + 2;
    var mode = ri(rng, 0, 1);

    if (mode === 0) {
      // Sederhanakan perbandingan menjadi 1 : x
      var g = gcdFn(a, b);
      var x = (b / g);
      return txt(T('Simplify the ratio <b>' + a + ' : ' + b + '</b> to <b>1 : ?</b>',
        'Sederhanakan perbandingan <b>' + a + ' : ' + b + '</b> menjadi <b>1 : ?</b>'),
        String(x), [String(a), String(b), String(x + 1), String(x - 1), String(a + b)]
          .filter(function (v) { return v !== String(x) && +v > 0; }), {
          rng: rng, topic: 'ratioSimple', topicName: T('Ratio', 'Perbandingan'),
          art: { kind: 'balance', left: a, right: b, leftItems: a, rightItems: b },
          hint: T('GCD(' + a + ',' + b + ') = ' + g + '. So ' + a + '/' + g + ' : ' + b + '/' + g + ' = 1 : ' + x + '.',
            'FPB(' + a + ',' + b + ') = ' + g + '. Maka ' + a + '/' + g + ' : ' + b + '/' + g + ' = 1 : ' + x + '.')
        });
    }

    // Cari nilai x pada perbandingan Equivalent
    var t = ri(rng, 2, 6);
    var ans = a * t;
    return num(T('Look at this ratio:<br><b>' + a + ' : ' + b + ' = ' + (a * t) +
      ' : x</b><br>What is the value of <b>x</b>?',
      'Perhatikan perbandingan berikut:<br><b>' + a + ' : ' + b + ' = ' + (a * t) +
      ' : x</b><br>Nilai <b>x</b> adalah?'), ans, {
      rng: rng, min: 0, spread: Math.max(2, b), step: 1,
      topic: 'ratioSimple', topicName: T('Ratio', 'Perbandingan'),
      art: { kind: 'balance', left: a * t, right: b * t, leftItems: a, rightItems: b },
      hint: T('Cross multiply: ' + a + ' \u00d7 t = ' + (a * t) + ', so t = ' + t + '. Then x = ' + b + ' \u00d7 ' + t + ' = ' + ans + '.',
        'Perkalian silang: ' + a + ' \u00d7 t = ' + (a * t) + ', maka t = ' + t + '. Jadi x = ' + b + ' \u00d7 ' + t + ' = ' + ans + '.')
    });
  };

  Topics.unitConvert = function (rng, lv) {
    var kind = ri(rng, 0, 2);
    if (kind === 0) {
      var m = ri(rng, 2, 9);
      return num(T('<b>' + m + ' meters</b> = ... centimeters?', '<b>' + m + ' meter</b> = ... sentimeter?'), m * 100, {
        rng: rng, min: 0, spread: 50, step: 10, topic: 'unitConvert', topicName: T('Length Units', 'Satuan Panjang'),
        hint: '1 m = 100 cm. ' + m + ' × 100 = ' + (m * 100) + ' cm.'
      });
    } else if (kind === 1) {
      var kg = ri(rng, 2, 9);
      return num(T('<b>' + (kg * 1000) + ' grams</b> = ... kilograms?', '<b>' + (kg * 1000) + ' gram</b> = ... kilogram?'), kg, {
        rng: rng, min: 0, spread: 1, topic: 'unitConvert', topicName: T('Weight Units', 'Satuan Berat'),
        hint: T('1 kg = 1000 grams. ' + (kg * 1000) + ' ÷ 1000 = ' + kg + ' kg.',
          '1 kg = 1000 gram. ' + (kg * 1000) + ' ÷ 1000 = ' + kg + ' kg.')
      });
    } else {
      var jam = ri(rng, 2, 6);
      return num(T('<b>' + jam + ' hours</b> = ... minutes?', '<b>' + jam + ' jam</b> = ... menit?'), jam * 60, {
        rng: rng, min: 0, spread: 30, step: 10, topic: 'unitConvert', topicName: T('Time Units', 'Satuan Waktu'),
        hint: T('1 hour = 60 minutes. ' + jam + ' × 60 = ' + (jam * 60) + ' minutes.',
          '1 jam = 60 menit. ' + jam + ' × 60 = ' + (jam * 60) + ' menit.')
      });
    }
  };

  Topics.average = function (rng, lv) {
    var n = ri(rng, 3, 5);
    var vals = [];
    var sum = 0;
    for (var i = 0; i < n; i++) { var v = ri(rng, 2, 20); vals.push(v); sum += v; }
    // pastikan rata-rata tepat (pembagi habis)
    var guard = 0;
    while (sum % n !== 0 && guard++ < 200) { vals[n - 1]++; sum++; }
    return num(T('What is the average of ' + vals.join(', ') + '?',
      'Rata-rata dari ' + vals.join(', ') + ' adalah?'), sum / n, {
      rng: rng, min: 0, spread: 2, step: 1,
      topic: 'average', topicName: T('Average', 'Rata-rata'),
      hint: '(' + vals.join('+') + ') ÷ ' + n + ' = ' + sum + ' ÷ ' + n + ' = ' + (sum / n) + '.'
    });
  };

  Topics.algebra = function (rng, lv) {
    var mode = ri(rng, 0, 4);
    if (mode === 0) {
      var x = ri(rng, 2, 20);
      var a = ri(rng, 2, 12);
      return num(T('If <b>x = ' + x + '</b>, then <b>x × ' + a + '</b> = ?',
        'Jika <b>x = ' + x + '</b>, maka <b>x × ' + a + '</b> = ?'), x * a, {
        rng: rng, min: 0, spread: a, topic: 'algebra', topicName: T('Algebra', 'Aljabar'),
        hint: x + ' × ' + a + ' = ' + (x * a) + '.'
      });
    } else if (mode === 1) {
      var y = ri(rng, 2, 12);
      var b = ri(rng, 2, 12);
      var prod = y * b;
      return num(T('What is <b>y</b> if <b>y × ' + b + ' = ' + prod + '</b>?',
        'Nilai <b>y</b> jika <b>y × ' + b + ' = ' + prod + '</b>?'), y, {
        rng: rng, min: 0, spread: Math.max(1, Math.floor(y / 2)), topic: 'algebra', topicName: T('Algebra', 'Aljabar'),
        hint: prod + ' ÷ ' + b + ' = ' + y + '.'
      });
    } else if (mode === 2) {
      var n = ri(rng, 2, 12);
      var t = ri(rng, 2, 9);
      return num(T('If <b>n + ' + t + ' = ' + (n + t) + '</b>, then <b>n</b> = ?',
        'Jika <b>n + ' + t + ' = ' + (n + t) + '</b>, maka <b>n</b> = ?'), n, {
        rng: rng, min: 0, spread: 2, topic: 'algebra', topicName: T('Algebra', 'Aljabar'),
        hint: (n + t) + ' − ' + t + ' = ' + n + '.'
      });
    } else if (mode === 3) {
      // Simbol / Icon puzzle teka-teki logika
      var icons = ['🍎', '⭐', '🐱', '⚽', '🚀', '🍩', '💎'];
      var sym = pk(rng, icons);
      var val = ri(rng, 2, 10);
      var type = ri(rng, 0, 1);
      if (type === 0) {
        var tot = val * 2;
        return num(T('Logic puzzle: <b>' + sym + ' + ' + sym + ' = ' + tot + '</b>. What is the value of <b>' + sym + '</b>?',
          'Teka-teki logika: <b>' + sym + ' + ' + sym + ' = ' + tot + '</b>. Berapa nilai <b>' + sym + '</b>?'), val, {
          rng: rng, min: 1, spread: 2, topic: 'algebra', topicName: T('Algebra', 'Aljabar'),
          hint: T(tot + ' ÷ 2 = ' + val + '. So ' + sym + ' is ' + val + '.',
            tot + ' ÷ 2 = ' + val + '. Jadi nilai ' + sym + ' adalah ' + val + '.')
        });
      } else {
        var sym2 = pk(rng, icons.filter(function (it) { return it !== sym; }));
        var val2 = ri(rng, 1, 8);
        var sum1 = val * 2;
        var sum2 = val + val2;
        return num(T('Puzzle: <b>' + sym + ' + ' + sym + ' = ' + sum1 + '</b> and <b>' + sym + ' + ' + sym2 + ' = ' + sum2 + '</b>. The value of <b>' + sym2 + '</b> = ?',
          'Teka-teki: <b>' + sym + ' + ' + sym + ' = ' + sum1 + '</b> dan <b>' + sym + ' + ' + sym2 + ' = ' + sum2 + '</b>. Nilai <b>' + sym2 + '</b> = ?'), val2, {
          rng: rng, min: 1, spread: 2, topic: 'algebra', topicName: T('Algebra', 'Aljabar'),
          hint: T(sym + ' = ' + val + '. So ' + val + ' + ' + sym2 + ' = ' + sum2 + ' → ' + sym2 + ' = ' + val2 + '.',
            sym + ' = ' + val + '. Maka ' + val + ' + ' + sym2 + ' = ' + sum2 + ' → ' + sym2 + ' = ' + val2 + '.')
        });
      }
    } else {
      // Persamaan 2 langkah sederhana: 2x + a = b
      var valX = ri(rng, 2, 9);
      var coef = pk(rng, [2, 3]);
      var constA = ri(rng, 1, 8);
      var rhs = coef * valX + constA;
      return num(T('What is <b>x</b> if <b>' + coef + 'x + ' + constA + ' = ' + rhs + '</b>?',
        'Nilai <b>x</b> jika <b>' + coef + 'x + ' + constA + ' = ' + rhs + '</b>?'), valX, {
        rng: rng, min: 1, spread: 2, topic: 'algebra', topicName: T('Algebra', 'Aljabar'),
        hint: coef + 'x = ' + rhs + ' − ' + constA + ' = ' + (coef * valX) + '. x = ' + (coef * valX) + ' ÷ ' + coef + ' = ' + valX + '.'
      });
    }
  };

  Topics.primeFactor = function (rng, lv) {
    var mode = ri(rng, 0, 1);
    if (mode === 0) {
      var n = pk(rng, [12, 15, 18, 20, 21, 24, 25, 27, 28, 30, 36, 40, 42, 45, 48, 50, 60]);
      var count = primeFactorCount(n);
      return num(T('How many <b>different prime factors</b> does the number <b>' + n + '</b> have?',
        'Berapa banyak <b>faktor prima berbeda</b> dari bilangan <b>' + n + '</b>?'), count, {
        rng: rng, min: 1, spread: 1, topic: 'primeFactor', topicName: T('Prime Factors', 'Faktor Prima'),
        hint: T(primeFactorText(n) + ' → ' + count + ' different prime factors.',
          primeFactorText(n) + ' → ' + count + ' faktor prima berbeda.')
      });
    } else {
      var num2 = pk(rng, [12, 18, 20, 24, 30, 36, 40, 45, 60]);
      var largest = largestPrimeFactor(num2);
      return num(T('What is the largest prime factor of <b>' + num2 + '</b>?',
        'Faktor prima terbesar dari <b>' + num2 + '</b> adalah?'), largest, {
        rng: rng, min: 2, spread: 3, topic: 'primeFactor', topicName: T('Prime Factors', 'Faktor Prima'),
        hint: T(primeFactorText(num2) + ' → largest ' + largest + '.',
          primeFactorText(num2) + ' → terbesar ' + largest + '.')
      });
    }
  };

  function primeFactorText(n) {
    var res = [], c = 2;
    while (c * c <= n) { while (n % c === 0) { res.push(c); n /= c; } c++; }
    if (n > 1) res.push(n);
    return res.join(' × ');
  }
  function primeFactorCount(n) {
    var res = [], c = 2;
    while (c * c <= n) { if (n % c === 0) { res.push(c); while (n % c === 0) n /= c; } c++; }
    if (n > 1) res.push(n);
    return res.length;
  }
  function largestPrimeFactor(n) {
    var res = [], c = 2;
    while (c * c <= n) { if (n % c === 0) { res.push(c); while (n % c === 0) n /= c; } c++; }
    if (n > 1) res.push(n);
    return Math.max.apply(null, res);
  }

  Topics.gcdlcm = function (rng, lv) {
    var pairs = [[12, 18], [8, 12], [6, 9], [10, 15], [4, 8], [9, 15], [12, 24], [16, 20], [10, 20], [15, 25], [18, 24], [14, 21]];
    var p = pk(rng, pairs);
    var gcd = gcdFn(p[0], p[1]);
    var lcm = p[0] * p[1] / gcd;
    var askG = U.chance(rng, 0.5);
    return num(T('What is the GCD of <b>' + p[0] + '</b> and <b>' + p[1] + '</b>?' + (askG ? '' : ' (LCM)'),
      'FPB dari <b>' + p[0] + '</b> dan <b>' + p[1] + '</b> adalah?' + (askG ? '' : ' (LCM)')), askG ? gcd : lcm, {
      rng: rng, min: 1, spread: Math.max(2, Math.floor(gcd / 2)),
      candidates: [askG ? lcm : gcd, p[0] + p[1], p[0] * p[1]],
      topic: 'gcdlcm', topicName: T('GCD & LCM', 'FPB & LCM'),
      hint: askG ? T('The greatest common divisor = ' + gcd + '.', 'FPB terbesar yang membagi keduanya = ' + gcd + '.')
        : 'LCM = (' + p[0] + '×' + p[1] + ')÷' + gcd + ' = ' + lcm + '.'
    });
  };

  function gcdFn(a, b) { while (b) { var t = a % b; a = b; b = t; } return a; }

  /* ============================================================
   *  LEVEL 17-20: KECEPATAN, KUADRAT, MIX SULIT
   * ============================================================ */

  Topics.speed = function (rng, lv) {
    var mode = ri(rng, 0, 2);
    var vehicles = [
      { nama: T('Bullet train', 'Kereta cepat'), speed: pk(rng, [150, 200, 250, 300]), unit: T('km/h', 'km/jam') },
      { nama: T('Family car', 'Mobil keluarga'), speed: pk(rng, [40, 50, 60, 80]), unit: T('km/h', 'km/jam') },
      { nama: T('Casual cyclist', 'Pesepeda santai'), speed: pk(rng, [15, 20, 25]), unit: T('km/h', 'km/jam') },
      { nama: T('Marathon runner', 'Pelari maraton'), speed: pk(rng, [10, 12, 15]), unit: T('km/h', 'km/jam') }
    ];
    var v = pk(rng, vehicles);

    if (mode === 0) {
      var t = ri(rng, 2, 4);
      var d = v.speed * t;
      return num(T('<b>' + v.nama + '</b> travels at <b>' + v.speed + ' ' + v.unit + '</b> for <b>' +
        t + ' hours</b>. How far does it go (in km)?',
        '<b>' + v.nama + '</b> bergerak dengan kecepatan <b>' + v.speed + ' ' + v.unit + '</b> selama <b>' +
        t + ' jam</b>. Jarak yang ditempuh berapa km?'), d, {
        rng: rng, min: 0, spread: Math.max(10, v.speed), step: 5,
        topic: 'speed', topicName: T('Speed', 'Kecepatan'),
        art: { kind: 'items', count: 1, item: 'car' },
        hint: T('Distance = speed × time = ' + v.speed + ' \u00d7 ' + t + ' = ' + d + ' km.',
          'Jarak = kecepatan \u00d7 waktu = ' + v.speed + ' \u00d7 ' + t + ' = ' + d + ' km.')
      });
    }
    if (mode === 1) {
      var t2 = ri(rng, 2, 4);
      var s2 = v.speed;
      var d2 = s2 * t2;
      return num(T('<b>' + v.nama + '</b> covers <b>' + d2 + ' km</b> in <b>' + t2 + ' hours</b> at a constant speed. What is its average speed (in km/h)?',
        '<b>' + v.nama + '</b> menempuh jarak <b>' + d2 + ' km</b> dalam waktu <b>' + t2 + ' jam</b> dengan kecepatan tetap. ' +
        'Kecepatan rata-ratanya berapa km/jam?'), s2, {
        rng: rng, min: 0, spread: Math.max(5, Math.floor(s2 / 2)), step: 5,
        topic: 'speed', topicName: T('Speed', 'Kecepatan'),
        art: { kind: 'items', count: 1, item: 'car' },
        hint: T('Speed = distance ÷ time = ' + d2 + ' \u00f7 ' + t2 + ' = ' + s2 + ' km/h.',
          'Kecepatan = jarak \u00f7 waktu = ' + d2 + ' \u00f7 ' + t2 + ' = ' + s2 + ' km/jam.')
      });
    }
    var t3 = pk(rng, [1, 2, 3]);
    var d3 = v.speed * t3;
    return num(T('How many <b>hours</b> does <b>' + v.nama + '</b> need to travel <b>' + d3 +
      ' km</b> at <b>' + v.speed + ' ' + v.unit + '</b>?',
      'Berapa <b>waktu</b> (dalam jam) yang diperlukan <b>' + v.nama + '</b> untuk menempuh <b>' + d3 +
      ' km</b> dengan kecepatan <b>' + v.speed + ' ' + v.unit + '</b>?'), t3, {
      rng: rng, min: 1, spread: 1,
      topic: 'speed', topicName: T('Speed', 'Kecepatan'),
      art: { kind: 'items', count: 1, item: 'car' },
      hint: T('Time = distance ÷ speed = ' + d3 + ' \u00f7 ' + v.speed + ' = ' + t3 + ' hours.',
        'Waktu = jarak \u00f7 kecepatan = ' + d3 + ' \u00f7 ' + v.speed + ' = ' + t3 + ' jam.')
    });
  };

  Topics.square = function (rng, lv) {
    var mode = ri(rng, 0, 1);
    var n = ri(rng, 2, 15);
    if (mode === 0) {
      return num('<b>' + n + '²</b> = ?', n * n, {
        rng: rng, min: 0, spread: Math.max(3, n), topic: 'square', topicName: T('Squares & Powers', 'Kuadrat & Pangkat'),
        hint: n + '² = ' + n + ' × ' + n + ' = ' + (n * n) + '.'
      });
    }
    var root = ri(rng, 2, 12);
    var sq = root * root;
    return num('√<b>' + sq + '</b> = ?', root, {
      rng: rng, min: 0, spread: Math.max(1, Math.floor(root / 2)), topic: 'square', topicName: T('Squares & Powers', 'Kuadrat & Pangkat'),
      hint: root + ' × ' + root + ' = ' + sq + '.'
    });
  };

  /* Soal campuran tingkat olimpiade */
  Topics.hardMix = function (rng, lv) {
    var pool = ['percent', 'ratioSimple', 'fractionAddSame', 'algebra', 'speed', 'orderOps', 'average',
      'integerOps', 'square', 'averageMissing', 'divRemainder', 'decimalCompare', 'triangleArea',
      'rectMissingSide', 'numberOrder', 'minMax'];
    var t = pk(rng, pool);
    return Topics[t](rng, lv);
  };

  /* ============================================================
   *  LEVEL TK (usia 4-6) — pengenalan angka, berhitung, bentuk, warna,
   *  pola, perbandingan, tambah/kurang visual, jam & uang.
   *  Semua memakai gambar supaya bisa dikerjakan tanpa membaca lancar.
   * ============================================================ */

  var TK_ITEMS = ['apple', 'star', 'ball', 'fish', 'flower', 'balloon', 'cookie', 'duck', 'heart', 'leaf'];
  var TK_SHAPES = ['circle', 'square', 'triangle', 'rect', 'star', 'heart'];
  var TK_SHAPE_NAME = { circle: T('circle', 'lingkaran'), square: T('square', 'persegi'), triangle: T('triangle', 'segitiga'), rect: T('rectangle', 'persegi panjang'), star: T('star', 'bintang'), heart: T('heart', 'hati') };
  var TK_COLORS = [
    { hex: '#FF5C5C', name: T('red', 'merah') },
    { hex: '#4EA8FF', name: T('blue', 'biru') },
    { hex: '#FFC93C', name: T('yellow', 'kuning') },
    { hex: '#57B947', name: T('green', 'hijau') },
    { hex: '#FF8AC4', name: T('pink', 'pink') },
    { hex: '#B388FF', name: T('purple', 'ungu') }
  ];

  Topics.tkCount = function (rng, lv) {
    var max = Math.min(lv.scale.countMax || 10, 10);
    // variasi 1: hitung titik dadu (1..6)
    if (U.chance(rng, 0.25)) {
      var diceVal = ri(rng, 1, Math.min(6, max));
      return num(T('How many dots are on this <b>die</b>? Count them!', 'Ada berapa titik pada <b>dadu</b> ini? Ayo hitung!'), diceVal, {
        rng: rng, min: 1, spread: 2, topic: 'tkCount', topicName: T('Counting', 'Menghitung'),
        art: { kind: 'dice', value: diceVal },
        hint: T('Count the black dots on the die: there are ' + diceVal + ' dots.',
          'Hitung titik hitam pada dadu: ada ' + diceVal + ' titik.')
      });
    }
    // variasi 2: hitung bulatan kartu (1..4)
    if (U.chance(rng, 0.2)) {
      var pips = ri(rng, 1, Math.min(4, max));
      return num(T('How many colored dots are on the <b>card</b> above?', 'Berapa bulatan warna pada <b>kartu</b> di atas?'), pips, {
        rng: rng, min: 1, spread: 1, topic: 'tkCount', topicName: T('Counting', 'Menghitung'),
        art: { kind: 'cards', pips: pips },
        hint: T('Count the glowing colored dots: there are ' + pips + '.',
          'Hitung bulatan warna yang menyala: ada ' + pips + '.')
      });
    }
    var n = ri(rng, 2, Math.max(3, max));
    var item = pk(rng, TK_ITEMS);
    return num(T('How many <b>' + Art_name(item) + '</b> are there? Count them!',
      'Berapa banyak <b>' + Art_name(item) + '</b>? Ayo hitung!'), n, {
      rng: rng, min: 1, spread: 2, topic: 'tkCount', topicName: T('Counting', 'Menghitung'),
      art: { kind: 'items', count: n, item: item, jitter: true, cols: 5 },
      hint: T('Count one by one while pointing: 1, 2, 3, ...', 'Hitung satu per satu sambil menunjuk: 1, 2, 3, ...')
    });
  };

  Topics.tkNumberRecognize = function (rng, lv) {
    var max = Math.min(lv.scale.max || 5, 10);
    var n = ri(rng, 1, max);
    var item = pk(rng, TK_ITEMS);
    if (U.chance(rng, 0.5)) {
      return num(T('How many pictures are there? Pick the number!', 'Ada berapa gambar? Pilih angkanya!'), n, {
        rng: rng, min: 1, spread: 2, topic: 'tkNumberRecognize', topicName: T('Number Recognition', 'Kenal Angka'),
        art: { kind: 'items', count: n, item: item },
        hint: T('There are ' + n + ' pictures.', 'Jumlah gambarnya ' + n + '.')
      });
    }
    var wrongs = [];
    for (var i = 1; i <= max + 2; i++) if (i !== n) wrongs.push(String(i));
    return txt(T('Pick the <b>number</b> that matches the number of pictures!',
      'Pilih <b>angka</b> yang sesuai dengan jumlah gambar!'), String(n), wrongs, {
      rng: rng, topic: 'tkNumberRecognize', topicName: T('Number Recognition', 'Kenal Angka'),
      art: { kind: 'items', count: n, item: item },
      hint: T('Count the pictures, then pick the number ' + n + '.',
        'Hitung gambarnya, lalu pilih angka ' + n + '.')
    });
  };

  Topics.tkBeforeAfter = function (rng, lv) {
    var max = Math.max(4, Math.min(lv.scale.max || 10, 15));
    var n = ri(rng, 2, max - 1);
    // variasi: hitung mundur
    if (U.chance(rng, 0.35) && n >= 3) {
      var itemsDown = [n + 1, n, n - 1, null];
      return num(T('Count backwards! What number comes next?', 'Ayo hitung mundur! Angka apa selanjutnya?'), n - 2, {
        rng: rng, min: 0, spread: 2, topic: 'tkBeforeAfter', topicName: T('Number Order', 'Urutan Angka'),
        art: { kind: 'pattern', items: itemsDown },
        hint: T('Counting back: ' + (n + 1) + ', ' + n + ', ' + (n - 1) + ', then ' + (n - 2) + '.',
          'Hitung mundur: ' + (n + 1) + ', ' + n + ', ' + (n - 1) + ', lalu ' + (n - 2) + '.')
      });
    }
    var askAfter = U.chance(rng, 0.5);
    var ans = askAfter ? n + 1 : n - 1;
    var items = askAfter
      ? [Math.max(0, n - 2), n - 1, n, null]
      : [null, n, n + 1, n + 2];
    return num(T('Complete the number sequence!', 'Lengkapi urutan angkanya!'), ans, {
      rng: rng, min: 0, spread: 2, topic: 'tkBeforeAfter', topicName: T('Number Order', 'Urutan Angka'),
      art: { kind: 'pattern', items: items },
      hint: T('The numbers go up by 1. So the missing number is ' + ans + '.',
        'Urutan angkanya bertambah 1. Jadi angka yang hilang adalah ' + ans + '.')
    });
  };

  Topics.tkCompare = function (rng, lv) {
    var max = Math.min(lv.scale.countMax || 10, 10);
    var a = ri(rng, 1, max - 1);
    var b = ri(rng, 1, max - 1);
    var guard = 0;
    while (b === a && guard++ < 20) b = ri(rng, 1, max - 1);
    if (b === a) b = a === 1 ? 2 : 1;
    var askMore = U.chance(rng, 0.5);
    var answer = askMore ? Math.max(a, b) : Math.min(a, b);
    var other = askMore ? Math.min(a, b) : Math.max(a, b);
    return num(T('Which has <b>' + (askMore ? 'more' : 'fewer') + '</b>?',
      'Mana yang <b>' + (askMore ? 'lebih banyak' : 'lebih sedikit') + '</b>?'), answer, {
      rng: rng, min: 0, spread: 2, candidates: [other],
      topic: 'tkCompare', topicName: T('Comparing', 'Membandingkan'),
      art: { kind: 'balance', left: a, right: b, leftItems: a, rightItems: b },
      hint: T('The group with ' + answer + ' has ' + (askMore ? 'more' : 'fewer') + ' than ' + other + '.',
        'Kelompok ' + answer + ' lebih ' + (askMore ? 'banyak' : 'sedikit') + ' dari ' + other + '.')
    });
  };

  Topics.tkBigSmall = function (rng, lv) {
    var item = pk(rng, TK_ITEMS);
    if (U.chance(rng, 0.5)) {
      var bigLeft = U.chance(rng, 0.5);
      return txt(T('Which object is <b>bigger</b>?', 'Benda mana yang <b>lebih besar</b>?'),
        bigLeft ? T('left', 'kiri') : T('right', 'kanan'),
        [bigLeft ? T('right', 'kanan') : T('left', 'kiri'), T('same size', 'sama besar'), T('none', 'tidak ada')], {
          rng: rng, topic: 'tkBigSmall', topicName: T('Big & Small', 'Besar & Kecil'),
          art: { kind: 'sizeCompare', item: item, bigSide: bigLeft ? 'left' : 'right' },
          hint: T('Compare the size of both pictures.', 'Bandingkan ukuran kedua gambar.')
        });
    }
    var longTop = U.chance(rng, 0.5);
    return txt(T('Which line is <b>longer</b>?', 'Garis mana yang <b>lebih panjang</b>?'),
      longTop ? T('top', 'atas') : T('bottom', 'bawah'),
      [longTop ? T('bottom', 'bawah') : T('top', 'atas'), T('same length', 'sama panjang'), T('none', 'tidak ada')], {
        rng: rng, topic: 'tkBigSmall', topicName: T('Long & Short', 'Panjang & Pendek'),
        art: { kind: 'longShort', longTop: longTop },
        hint: T('The longer line is the ' + (longTop ? 'top' : 'bottom') + ' line.',
          'Garis yang lebih panjang adalah garis ' + (longTop ? 'atas' : 'bawah') + '.')
      });
  };

  Topics.tkPattern = function (rng, lv) {
    if (U.chance(rng, 0.5)) {
      var s1 = pk(rng, TK_SHAPES), s2 = pk(rng, TK_SHAPES);
      var guard = 0;
      while (s2 === s1 && guard++ < 20) s2 = pk(rng, TK_SHAPES);
      return txt(T('Continue the pattern! Which shape is missing?', 'Lanjutkan polanya! Bentuk apa yang hilang?'), TK_SHAPE_NAME[s2],
        TK_SHAPES.filter(function (s) { return s !== s2; }).map(function (s) { return TK_SHAPE_NAME[s]; }), {
          rng: rng, topic: 'tkPattern', topicName: T('Shape Patterns', 'Pola Bentuk'),
          art: { kind: 'shapePattern', items: [s1, s2, s1, s2, s1, null] },
          hint: T('The pattern alternates ' + TK_SHAPE_NAME[s1] + ' and ' + TK_SHAPE_NAME[s2] + '.',
            'Polanya bergantian ' + TK_SHAPE_NAME[s1] + ' dan ' + TK_SHAPE_NAME[s2] + '.')
        });
    }
    var c1 = pk(rng, TK_COLORS), c2 = pk(rng, TK_COLORS);
    var g = 0;
    while (c2.name === c1.name && g++ < 20) c2 = pk(rng, TK_COLORS);
    return txt(T('Continue the pattern! Which color is missing?', 'Lanjutkan polanya! Warna apa yang hilang?'), c2.name,
      TK_COLORS.filter(function (c) { return c.name !== c2.name; }).map(function (c) { return c.name; }), {
        rng: rng, topic: 'tkPattern', topicName: T('Color Patterns', 'Pola Warna'),
        art: { kind: 'colorPattern', items: [c1.hex, c2.hex, c1.hex, c2.hex, c1.hex, null] },
        hint: T('The pattern alternates the colors ' + c1.name + ' and ' + c2.name + '.',
          'Polanya bergantian warna ' + c1.name + ' dan ' + c2.name + '.')
      });
  };

  Topics.tkShape = function (rng, lv) {
    var shape = pk(rng, TK_SHAPES);
    return txt(T('What shape is this?', 'Bentuk apa ini?'), TK_SHAPE_NAME[shape],
      TK_SHAPES.filter(function (s) { return s !== shape; }).map(function (s) { return TK_SHAPE_NAME[s]; }), {
        rng: rng, topic: 'tkShape', topicName: T('Shapes', 'Bentuk'),
        art: { kind: 'tkShape', shape: shape },
        hint: T('This shape is called ' + TK_SHAPE_NAME[shape] + '.', 'Bentuk ini namanya ' + TK_SHAPE_NAME[shape] + '.')
      });
  };

  Topics.tkColor = function (rng, lv) {
    var c = pk(rng, TK_COLORS);
    return txt(T('What color is this?', 'Warna apa ini?'), c.name,
      TK_COLORS.filter(function (x) { return x.name !== c.name; }).map(function (x) { return x.name; }), {
        rng: rng, topic: 'tkColor', topicName: T('Colors', 'Warna'),
        art: { kind: 'color', hex: c.hex },
        hint: T('It is ' + c.name + '.', 'Warnanya ' + c.name + '.')
      });
  };

  Topics.tkClassify = function (rng, lv) {
    var set = U.sample(rng, TK_ITEMS, 3);
    var target = set[0];
    var wrongs = set.slice(1).map(function (it) { return Art_name(it); });
    return txt(T('What picture is in the box?', 'Gambar apa yang ada di kotak?'), Art_name(target), wrongs, {
      rng: rng, topic: 'tkClassify', topicName: T('Classifying', 'Mengelompokkan'),
      art: { kind: 'items', count: 1, item: target },
      hint: T('The picture is ' + Art_name(target) + '.', 'Gambar itu adalah ' + Art_name(target) + '.')
    });
  };

  Topics.tkAddVisual = function (rng, lv) {
    var max = Math.min(lv.scale.max || 5, 6);
    var a = ri(rng, 1, max - 1);
    var b = ri(rng, 1, max - a);
    var item = pk(rng, TK_ITEMS);
    var q = U.chance(rng, 0.45)
      ? T('There are <b>' + a + '</b> ' + Art_name(item) + ', and <b>' + b + '</b> more are added. How many in all?',
        'Ada <b>' + a + '</b> ' + Art_name(item) + ', ditambah lagi <b>' + b + '</b>. Berapa semuanya?')
      : '<b>' + a + '</b> + <b>' + b + '</b> = ?';
    return num(q, a + b, {
      rng: rng, min: 0, spread: 2, topic: 'tkAddVisual', topicName: T('Addition', 'Tambah'),
      art: { kind: 'twoGroups', left: a, right: b, item: item },
      hint: T(a + ' plus ' + b + ' equals ' + (a + b) + '.',
        a + ' ditambah ' + b + ' sama dengan ' + (a + b) + '.')
    });
  };

  Topics.tkSubVisual = function (rng, lv) {
    var max = Math.min(lv.scale.max || 5, 6);
    var total = ri(rng, 2, max);
    var take = ri(rng, 1, total - 1);
    var item = pk(rng, TK_ITEMS);
    var q = U.chance(rng, 0.45)
      ? T('There are <b>' + total + '</b> ' + Art_name(item) + ', and <b>' + take + '</b> are taken away. How many are left?',
        'Ada <b>' + total + '</b> ' + Art_name(item) + ', diambil <b>' + take + '</b>. Berapa yang tersisa?')
      : '<b>' + total + '</b> − <b>' + take + '</b> = ?';
    return num(q, total - take, {
      rng: rng, min: 0, spread: 2, topic: 'tkSubVisual', topicName: T('Subtraction', 'Kurang'),
      art: { kind: 'minusVisual', total: total, take: take, item: item },
      hint: T(total + ' objects, ' + take + ' crossed out, ' + (total - take) + ' left.',
        total + ' benda, dicoret ' + take + ', sisanya ' + (total - take) + '.')
    });
  };

  Topics.tkClockHour = function (rng, lv) {
    var h = ri(rng, 1, 12);
    var q = U.chance(rng, 0.4)
      ? T('Look at the wall clock above! What time is it now?', 'Lihat jam dinding di atas! Pukul berapa sekarang?')
      : T('What time is it?', 'Jam berapa ini?');
    return num(q, h, {
      rng: rng, min: 1, spread: 1, topic: 'tkClockHour', topicName: T('Telling Time', 'Membaca Jam'),
      art: { kind: 'clock', h: h, m: 0 },
      hint: T('The short hand points to ' + h + '.', 'Jarum pendek menunjuk angka ' + h + '.')
    });
  };

  Topics.tkMoneySimple = function (rng, lv) {
    var n = ri(rng, 1, 5);
    var q = U.chance(rng, 0.4)
      ? T('There are ' + n + ' Rp100 coins. What is the total amount of money?',
        'Ada ' + n + ' koin Rp100. Berapa rupiah jumlah uang semuanya?')
      : T('How much money in coins is in the picture?', 'Berapa jumlah uang koin di gambar?');
    return num(q, n * 100, {
      rng: rng, min: 100, spread: 2, step: 100,
      candidates: [(n + 1) * 100, (n + 2) * 100],
      topic: 'tkMoneySimple', topicName: T('Money', 'Uang'),
      art: { kind: 'money', coins: n, notes: 0 },
      hint: T(n + ' coins × 100 = ' + U.money(n * 100) + '.',
        n + ' koin seratus berarti ' + (n * 100) + ' rupiah.')
    });
  };

  /* ============================================================
   *  TOPIK BARU — menambah variasi & keragaman soal
   * ============================================================ */

  /** Ganjil & genap: pilih bilangan atau hitung banyaknya. */
  Topics.oddEven = function (rng, lv) {
    var hi = Math.max(12, Math.min(lv.scale.max, 99));
    if (U.chance(rng, 0.5)) {
      var wantOdd = U.chance(rng, 0.5);
      var ans = ri(rng, 1, Math.max(2, Math.floor((hi + 1) / 2))) * 2 - 1;
      if (!wantOdd) ans += 1;
      if (ans > hi) ans -= 2;
      if (ans < 1) ans = wantOdd ? 1 : 2;
      var wrongs = [], g = 0;
      while (wrongs.length < 3 && g++ < 300) {
        var w = ri(rng, 1, hi);
        if (w % 2 === ans % 2) continue;            // pilihan salah harus berkebalikan
        if (wrongs.indexOf(String(w)) >= 0) continue;
        wrongs.push(String(w));
      }
      return txt(T('Which number is <b>' + (wantOdd ? 'odd' : 'even') + '</b>?',
        'Mana bilangan yang <b>' + (wantOdd ? 'ganjil' : 'genap') + '</b>?'), String(ans), wrongs, {
        rng: rng, topic: 'oddEven', topicName: T('Odd & Even', 'Ganjil & Genap'),
        hint: T(wantOdd ? 'Odd numbers end in 1, 3, 5, 7, 9 — they are not divisible by 2.'
          : 'Even numbers are divisible by 2: 0, 2, 4, 6, 8, ...',
          wantOdd ? 'Ganjil berakhir pada 1, 3, 5, 7, 9 — tidak habis dibagi 2.'
            : 'Genap habis dibagi 2: 0, 2, 4, 6, 8, ...')
      });
    }
    var n = ri(rng, 5, 8);
    var nums = [], g2 = 0;
    while (nums.length < n && g2++ < 300) {
      var v = ri(rng, 1, hi);
      if (nums.indexOf(v) < 0) nums.push(v);
    }
    var wantOdd2 = U.chance(rng, 0.5);
    var cnt = nums.filter(function (x) { return x % 2 === 1; }).length;
    if (!wantOdd2) cnt = nums.length - cnt;
    return num(T('How many <b>' + (wantOdd2 ? 'odd' : 'even') + '</b> numbers are there among: <b>' +
      nums.join(', ') + '</b>?',
      'Berapa banyak bilangan <b>' + (wantOdd2 ? 'ganjil' : 'genap') + '</b> di antara: <b>' +
      nums.join(', ') + '</b>?'), cnt, {
        rng: rng, min: 0, max: nums.length, spread: 1, topic: 'oddEven', topicName: T('Odd & Even', 'Ganjil & Genap'),
        hint: T('Mark them one by one, then count. The answer is ' + cnt + '.',
          'Tandai satu per satu, lalu hitung. Jawabannya ' + cnt + '.')
      });
  };

  /** Mengurutkan bilangan & mencari posisi tertentu. */
  Topics.numberOrder = function (rng, lv) {
    var hi = Math.max(12, Math.min(lv.scale.max, 999));
    var vals = {}, g = 0;
    while (Object.keys(vals).length < 4 && g++ < 300) vals[ri(rng, 1, hi)] = 1;
    var asc = Object.keys(vals).map(Number).sort(function (x, y) { return x - y; });
    // Bilangan yang harus diurutkan ditampilkan dalam urutan acak (bukan urutan benar),
    // supaya soal tetap bisa dikerjakan — daftarnya wajib muncul di teks soal.
    var shown = asc.slice(), sg = 0;
    while (sg++ < 20) {
      shown = U.shuffle(rng, asc);
      if (shown.join(',') !== asc.join(',')) break;
    }
    var shownText = '<b>' + shown.join('</b>, <b>') + '</b>';
    if (U.chance(rng, 0.5)) {
      var ansText = asc.join(' < ');
      var wrongs = [
        [asc[1], asc[0], asc[2], asc[3]].join(' < '),
        [asc[3], asc[2], asc[1], asc[0]].join(' < '),
        [asc[0], asc[2], asc[1], asc[3]].join(' < ')
      ];
      return txt(T('Order these numbers from <b>smallest</b>: ' + shownText + '. Which order is correct?',
        'Urutkan bilangan berikut dari yang <b>paling kecil</b>: ' + shownText + '. Mana urutannya yang benar?'), ansText, wrongs, {
        rng: rng, topic: 'numberOrder', topicName: T('Ordering Numbers', 'Mengurutkan Bilangan'),
        hint: T('Start with the smallest: ' + asc[0] + ', then ' + asc[1] + ', ' + asc[2] + ', ' + asc[3] + '.',
          'Mulai dari yang terkecil: ' + asc[0] + ', lalu ' + asc[1] + ', ' + asc[2] + ', ' + asc[3] + '.')
      });
    }
    var idx = ri(rng, 1, 2);
    return num(T('After ordering from smallest, what is the <b>' + (idx + 1) + ' number</b> in ' + shownText + '?',
      'Setelah diurutkan dari yang paling kecil, bilangan <b>ke-' + (idx + 1) +
      '</b> dari ' + shownText + ' adalah?'), asc[idx], {
        rng: rng, min: 0, max: hi, spread: 1, topic: 'numberOrder', topicName: T('Ordering Numbers', 'Mengurutkan Bilangan'),
        hint: T('The order: ' + asc.join(', ') + '.', 'Urutannya: ' + asc.join(', ') + '.')
      });
  };

  /** Pembulatan ke puluhan / ratusan. */
  Topics.rounding = function (rng, lv) {
    var unit = U.chance(rng, 0.5) ? 10 : 100;
    var hi = Math.max(unit * 5, Math.min(lv.scale.max, 2000));
    var n = ri(rng, unit + 1, hi);
    var ans = Math.round(n / unit) * unit;
    var digit = unit === 10 ? n % 10 : Math.floor(n / 10) % 10;
    return num(T('Round <b>' + n + '</b> to the nearest ' + (unit === 10 ? 'ten' : 'hundred') + '!',
      'Bulatkan <b>' + n + '</b> ke ' + (unit === 10 ? 'puluhan' : 'ratusan') + ' terdekat!'), ans, {
      rng: rng, min: 0, spread: 2, step: unit, topic: 'rounding', topicName: T('Rounding', 'Pembulatan'),
      hint: T('The deciding digit is ' + digit + ' — ' + (digit >= 5 ? 'since ≥ 5, round up' : 'since < 5, keep it') +
        ' → ' + ans + '.',
        'Angka penentunya ' + digit + ' — ' + (digit >= 5 ? 'karena ≥ 5, naikkan' : 'karena < 5, tetap') +
        ' → ' + ans + '.')
    });
  };

  /** Penjumlahan tiga bilangan. */
  Topics.addChain = function (rng, lv) {
    var hi = Math.max(12, Math.min(lv.scale.max, 300));
    var a = ri(rng, 2, Math.max(3, Math.floor(hi / 3)));
    var b = ri(rng, 1, Math.max(2, Math.floor(hi / 3)));
    var c = ri(rng, 1, Math.max(2, Math.floor(hi / 3)));
    var ans = a + b + c;
    return num('<b>' + a + '</b> + <b>' + b + '</b> + <b>' + c + '</b> = ?', ans, {
      rng: rng, min: 0, spread: 3, topic: 'addChain', topicName: T('Addition', 'Penjumlahan'),
      hint: T('Add the first two: ' + a + ' + ' + b + ' = ' + (a + b) + ', then + ' + c + ' = ' + ans + '.',
        'Jumlahkan dua dulu: ' + a + ' + ' + b + ' = ' + (a + b) + ', lalu + ' + c + ' = ' + ans + '.')
    });
  };

  /** Pengurangan dengan bilangan hilang di sisi kanan. */
  Topics.subMissing = function (rng, lv) {
    var hi = Math.max(10, Math.min(lv.scale.max, 500));
    var a = ri(rng, Math.min(6, hi), hi);
    var res = ri(rng, 1, Math.max(1, a - 1));
    return num(T('<b>' + a + '</b> − … = <b>' + res + '</b>  →  what number is missing?',
      '<b>' + a + '</b> − … = <b>' + res + '</b>  →  berapa angka yang hilang?'), a - res, {
      rng: rng, min: 1, spread: 2, topic: 'subMissing', topicName: T('Missing Number', 'Angka Hilang'),
      hint: a + ' − ' + res + ' = ' + (a - res) + '.'
    });
  };

  /** Dobel (2×) dan separuh (÷2). */
  Topics.doubleHalf = function (rng, lv) {
    var hi = Math.max(10, Math.min(lv.scale.max, 200));
    if (U.chance(rng, 0.5)) {
      var n = ri(rng, 2, Math.max(3, Math.floor(hi / 2)));
      var q = pk(rng, [
        T('What is <b>double</b> of <b>' + n + '</b>?',
          'Berapa <b>dobel</b> dari <b>' + n + '</b>?'),
        T('As many as <b>2 × ' + n + '</b> is how many?',
          'Sebanyak <b>2 × ' + n + '</b> itu berapa?')
      ]);
      return num(q, n * 2, {
        rng: rng, min: 0, spread: Math.max(2, Math.floor(n / 2)), topic: 'doubleHalf', topicName: T('Double & Half', 'Dobel & Separuh'),
        hint: n + ' + ' + n + ' = ' + (n * 2) + '.'
      });
    }
    var m = ri(rng, 2, Math.max(3, Math.floor(hi / 2))) * 2;
    var q2 = pk(rng, [
      T('What is <b>half</b> of <b>' + m + '</b>?',
        'Berapa <b>separuh</b> dari <b>' + m + '</b>?'),
      T('<b>' + m + '</b> divided by 2 equals how many?',
        '<b>' + m + '</b> dibagi 2 sama dengan berapa?')
    ]);
    return num(q2, m / 2, {
      rng: rng, min: 0, spread: Math.max(2, Math.floor(m / 4)), topic: 'doubleHalf', topicName: T('Double & Half', 'Dobel & Separuh'),
      hint: m + ' ÷ 2 = ' + (m / 2) + '.'
    });
  };

  /** Sebagian dari suatu bilangan (1/2, 1/3, 1/4) dan kebalikannya. */
  Topics.fractionOf = function (rng, lv) {
    var d = pk(rng, [2, 3, 4]);
    var nama = T({ 2: 'half', 3: 'third', 4: 'quarter' }, { 2: 'setengah', 3: 'sepertiga', 4: 'seperempat' })[d];
    var mode = ri(rng, 0, 2);
    if (mode === 0) {
      var n = d * ri(rng, 2, 12);
      return num(T('What is <b>' + nama + '</b> of <b>' + n + '</b>?',
        'Berapa <b>' + nama + '</b> dari <b>' + n + '</b>?'), n / d, {
        rng: rng, min: 0, spread: Math.max(2, Math.floor(n / (d * 2))),
        topic: 'fractionOf', topicName: T('Simple Fractions', 'Pecahan Sederhana'),
        hint: n + ' ÷ ' + d + ' = ' + (n / d) + '.'
      });
    }
    if (mode === 1) {
      var n2 = d * ri(rng, 2, 12);
      return num(T('What is <b>1/' + d + '</b> of <b>' + n2 + '</b>?',
        'Berapa <b>1/' + d + '</b> dari <b>' + n2 + '</b>?'), n2 / d, {
        rng: rng, min: 0, spread: Math.max(2, Math.floor(n2 / (d * 2))),
        topic: 'fractionOf', topicName: T('Simple Fractions', 'Pecahan Sederhana'),
        hint: n2 + ' ÷ ' + d + ' = ' + (n2 / d) + '.'
      });
    }
    var part = ri(rng, 2, 12);
    return num(T('<b>' + part + '</b> is <b>1/' + d + '</b> of how many?',
      '<b>' + part + '</b> adalah <b>1/' + d + '</b> dari berapa?'), part * d, {
      rng: rng, min: 0, spread: Math.max(2, part), topic: 'fractionOf', topicName: T('Simple Fractions', 'Pecahan Sederhana'),
      hint: part + ' × ' + d + ' = ' + (part * d) + '.'
    });
  };

  /** Nilai terbesar / terkecil dari kumpulan bilangan. */
  Topics.minMax = function (rng, lv) {
    var hi = Math.max(12, Math.min(lv.scale.max, 999));
    var vals = {}, g = 0;
    while (Object.keys(vals).length < 4 && g++ < 300) vals[ri(rng, 1, hi)] = 1;
    var arr = Object.keys(vals).map(Number);
    var wantMax = U.chance(rng, 0.5);
    var ans = wantMax ? Math.max.apply(null, arr) : Math.min.apply(null, arr);
    var others = arr.filter(function (x) { return x !== ans; }).map(String);
    return txt(T('From the numbers <b>' + arr.join(', ') + '</b>, which is <b>' +
      (wantMax ? 'the largest' : 'the smallest') + '</b>?',
      'Dari bilangan <b>' + arr.join(', ') + '</b>, mana yang <b>' +
      (wantMax ? 'terbesar' : 'terkecil') + '</b>?'), String(ans), others, {
        rng: rng, topic: 'minMax', topicName: T('Greatest & Least Value', 'Nilai Terbesar & Terkecil'),
        hint: T((wantMax ? 'The largest' : 'The smallest') + ' among them is ' + ans + '.',
          (wantMax ? 'Terbesar' : 'Terkecil') + ' di antaranya adalah ' + ans + '.')
      });
  };

  /** Luas segitiga (½ × alas × tinggi). */
  Topics.triangleArea = function (rng, lv) {
    var b = ri(rng, 2, 20), t = ri(rng, 1, 9) * 2;
    var ans = b * t / 2;
    return num(T('How many cm² is the area of the triangle above? (unit cm²)',
      'Luas segitiga di atas berapa? (satuan cm²)'), ans, {
      rng: rng, min: 0, spread: Math.max(2, Math.floor(ans / 4)), step: 1,
      topic: 'triangleArea', topicName: T('Area', 'Luas'),
      art: { kind: 'shape', shape: 'triangle', labels: { b: b + ' cm', t: t + ' cm' } },
      hint: T('Area = ½ × base × height = ½ × ' + b + ' × ' + t + ' = ' + ans + ' cm².',
        'Luas = ½ × alas × tinggi = ½ × ' + b + ' × ' + t + ' = ' + ans + ' cm².')
    });
  };

  /** Pembagian dengan sisa. */
  Topics.divRemainder = function (rng, lv) {
    var k = ri(rng, 3, 9);
    var n = ri(rng, 2, 9);
    var s = ri(rng, 1, k - 1);
    var total = n * k + s;
    var ansText = T(n + ' remainder ' + s, n + ' sisa ' + s);
    var sisa2 = (s + 1 < k) ? s + 1 : s - 1;
    var wrongs = [
      T((n + 1) + ' remainder ' + s, (n + 1) + ' sisa ' + s),
      T((n > 1 ? n - 1 : n + 2) + ' remainder ' + s, (n > 1 ? n - 1 : n + 2) + ' sisa ' + s),
      T(n + ' remainder ' + sisa2, n + ' sisa ' + sisa2)
    ];
    return txt(T('<b>' + total + '</b> ÷ <b>' + k + '</b> = ? <i>(the quotient and the remainder)</i>',
      '<b>' + total + '</b> ÷ <b>' + k + '</b> = ? <i>(hasil bagi dan sisanya)</i>'), ansText, wrongs, {
      rng: rng, topic: 'divRemainder', topicName: T('Division with Remainder', 'Pembagian Bersisa'),
      hint: T(total + ' = (' + k + ' × ' + n + ') + ' + s + ' → quotient ' + n + ', remainder ' + s + '.',
        total + ' = (' + k + ' × ' + n + ') + ' + s + ' → hasil bagi ' + n + ', sisa ' + s + '.')
    });
  };

  /** Selisih waktu (menit & jam). */
  Topics.timeDuration = function (rng, lv) {
    function pad(x) { return x < 10 ? '0' + x : String(x); }
    if (U.chance(rng, 0.5)) {
      var h = ri(rng, 1, 12);
      var m1 = ri(rng, 0, 6) * 5;
      var cands = [10, 15, 20, 30, 45, 60].filter(function (d) { return m1 + d <= 60; });
      if (!cands.length) cands = [15];
      var dur = pk(rng, cands);
      var m2 = m1 + dur;
      var t2 = m2 === 60 ? ((h % 12) + 1) + ':00' : h + ':' + pad(m2);
      return num(T('From <b>' + h + ':' + pad(m1) + '</b> until <b>' + t2 +
        '</b> is how many <b>minutes</b>?',
        'Dari pukul <b>' + h + ':' + pad(m1) + '</b> sampai <b>' + t2 +
        '</b> itu berapa <b>menit</b>?'), dur, {
          rng: rng, min: 0, max: 60, spread: 5, step: 5,
          topic: 'timeDuration', topicName: T('Time Difference', 'Selisih Waktu'),
          hint: T((m2 === 60 ? 'Until ' + t2 + ' ' : '') + 'the difference is ' + dur + ' minutes.',
            (m2 === 60 ? 'Sampai pukul ' + t2 + ' ' : '') + 'selisihnya ' + dur + ' menit.')
        });
    }
    var h1 = ri(rng, 1, 9);
    var jam = ri(rng, 1, 3);
    var h2 = ((h1 + jam - 1) % 12) + 1;
    return num(T('From <b>' + h1 + ':00</b> until <b>' + h2 + ':00</b> is how many <b>hours</b>?',
      'Dari pukul <b>' + h1 + ':00</b> sampai <b>' + h2 + ':00</b> itu berapa <b>jam</b>?'), jam, {
      rng: rng, min: 0, max: 12, spread: 1, topic: 'timeDuration', topicName: T('Time Difference', 'Selisih Waktu'),
      art: { kind: 'clock', h: h1, m: 0 },
      hint: T('Count up from ' + h1 + ' to ' + h2 + ' → ' + jam + ' hours.',
        'Hitung mundur dari ' + h1 + ' ke ' + h2 + ' → ' + jam + ' jam.')
    });
  };

  /** Soal cerita uang kembalian. */
  Topics.moneyChange = function (rng, lv) {
    var nama = pk(rng, NAMA);
    var barangJual = pk(rng, T(
      ['picture story book', 'cute pencil case', 'chocolate ice cream', 'water bottle',
        'sweet cheese bread', 'toy ball', 'colored pencils', 'school hat'],
      ['buku cerita bergambar', 'kotak pensil lucu', 'es krim cokelat', 'tempat minum',
        'roti keju manis', 'bola mainan', 'pensil warna', 'topi sekolah']));
    var harga = ri(rng, 2, 12) * 500;
    var bayar = harga + ri(rng, 1, 8) * 500;
    var q = T('A <b>' + barangJual + '</b> costs <b>' + U.money(harga) + '</b>. <b>' + nama +
      '</b> pays with <b>' + U.money(bayar) + '</b>. How much is the change?',
      'Sebuah <b>' + barangJual + '</b> harganya <b>Rp' + U.thousand(harga) + '</b>. <b>' + nama +
      '</b> membayar dengan <b>Rp' + U.thousand(bayar) + '</b>. Berapa uang kembaliannya?');
    return num(q, bayar - harga, {
      rng: rng, min: 0, spread: 2, step: 500, topic: 'moneyChange', topicName: T('Money', 'Uang'),
      hint: T(U.money(bayar) + ' − ' + U.money(harga) + ' = ' + U.money(bayar - harga) + '.',
        'Rp' + U.thousand(bayar) + ' − Rp' + U.thousand(harga) + ' = Rp' + U.thousand(bayar - harga) + '.')
    });
  };

  /** Angka romawi (baca & tulis). */
  var ROMAN_PAIRS = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
    [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
  function toRoman(v) {
    var s = '', x = v;
    for (var i = 0; i < ROMAN_PAIRS.length; i++) {
      while (x >= ROMAN_PAIRS[i][0]) { s += ROMAN_PAIRS[i][1]; x -= ROMAN_PAIRS[i][0]; }
    }
    return s;
  }

  Topics.romanNumeral = function (rng, lv) {
    var pool = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 24, 25,
      29, 30, 31, 35, 39, 40, 44, 45, 49, 50, 55, 60, 64, 65, 70, 80, 90, 95, 99, 100,
      150, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
    var n = pk(rng, pool);
    if (U.chance(rng, 0.5)) {
      var ans = toRoman(n);
      var wrongs = [], cands = [n + 1, Math.max(1, n - 1), n + 5, Math.max(1, n - 5), n + 10, Math.max(1, n - 10)];
      for (var i = 0; i < cands.length && wrongs.length < 3; i++) {
        var w = toRoman(cands[i]);
        if (w && w !== ans && wrongs.indexOf(w) < 0) wrongs.push(w);
      }
      return txt(T('What is the Roman numeral for <b>' + n + '</b>?',
        'Angka romawi untuk bilangan <b>' + n + '</b> adalah?'), ans, wrongs, {
        rng: rng, topic: 'romanNumeral', topicName: T('Roman Numerals', 'Angka Romawi'),
        hint: T('Remember: I = 1, V = 5, X = 10, L = 50, C = 100, D = 500, M = 1000.',
          'Ingat: I = 1, V = 5, X = 10, L = 50, C = 100, D = 500, M = 1000.')
      });
    }
    var rom = toRoman(n);
    return num(T('What is the value of the Roman numeral <b>' + rom + '</b>?',
      'Berapa nilai angka romawi <b>' + rom + '</b>?'), n, {
      rng: rng, min: 1, max: 1000, spread: 4, topic: 'romanNumeral', topicName: T('Roman Numerals', 'Angka Romawi'),
      hint: T(rom + ' has the value ' + n + '.', rom + ' bernilai ' + n + '.')
    });
  };

  /** Membandingkan & mengurutkan bilangan desimal. */
  Topics.decimalCompare = function (rng, lv) {
    function mk() { return Math.round((ri(rng, 0, 90) / 10 + ri(rng, 0, 9) / 100) * 100) / 100; }
    function fmt(v) { return U.trimNum(v); }
    if (U.chance(rng, 0.5)) {
      var a = mk(), b = mk(), g = 0;
      while (a === b && g++ < 30) b = mk();
      var big = a > b ? a : b, small = a > b ? b : a;
      var askBig = U.chance(rng, 0.5);
      var ans = fmt(askBig ? big : small);
      var wrongs = [], pool = [fmt(askBig ? small : big), fmt(mk()), fmt(mk()), fmt(mk())];
      for (var i = 0; i < pool.length && wrongs.length < 3; i++) {
        if (pool[i] !== ans && wrongs.indexOf(pool[i]) < 0) wrongs.push(pool[i]);
      }
      var g2 = 0;
      while (wrongs.length < 3 && g2++ < 100) {
        var c = fmt(mk());
        if (c !== ans && wrongs.indexOf(c) < 0) wrongs.push(c);
      }
      return txt(T('Which is <b>' + (askBig ? 'greater' : 'less') + '</b>?',
        'Mana yang <b>' + (askBig ? 'lebih besar' : 'lebih kecil') + '</b>?'), ans, wrongs, {
        rng: rng, topic: 'decimalCompare', topicName: T('Decimals', 'Bilangan Desimal'),
        hint: T('Compare digit by digit after the decimal point: ' + small + ' and ' + big + '.',
          'Bandingkan satu per satu setelah tanda koma: ' + small + ' dan ' + big + '.')
      });
    }
    var vs = [], g3 = 0;
    while (vs.length < 3 && g3++ < 300) {
      var v = mk();
      if (vs.indexOf(v) < 0) vs.push(v);
    }
    if (vs.length < 3) vs = [1.25, 1.5, 1.75];
    var asc = vs.slice().sort(function (x, y) { return x - y; });
    var shown = U.shuffle(rng, asc), dg = 0;
    while (dg++ < 20 && shown.join(',') === asc.join(',')) shown = U.shuffle(rng, asc);
    var shownText = '<b>' + shown.map(fmt).join('</b>, <b>') + '</b>';
    var ansText = asc.map(fmt).join(' < ');
    var wrongs2 = [
      [asc[1], asc[0], asc[2]].map(fmt).join(' < '),
      asc.slice().reverse().map(fmt).join(' < '),
      [asc[0], asc[2], asc[1]].map(fmt).join(' < ')
    ];
    return txt(T('Order these decimals from <b>smallest</b>: ' + shownText + '. Which is correct?',
      'Urutkan desimal berikut dari yang <b>paling kecil</b>: ' + shownText + '. Mana yang benar?'), ansText, wrongs2, {
      rng: rng, topic: 'decimalCompare', topicName: T('Decimals', 'Bilangan Desimal'),
      hint: T('The order: ' + asc.map(fmt).join(', ') + '.', 'Urutannya: ' + asc.map(fmt).join(', ') + '.')
    });
  };

  /** Cari sisi yang hilang dari keliling / luas persegi panjang. */
  Topics.rectMissingSide = function (rng, lv) {
    var w = ri(rng, 3, 20), h = ri(rng, 3, 20);
    if (U.chance(rng, 0.5)) {
      var kel = 2 * (w + h);
      return num(T('The perimeter of a rectangle is <b>' + kel + ' cm</b>, its length is <b>' + w +
        ' cm</b>. What is its <b>width</b>?',
        'Keliling persegi panjang <b>' + kel + ' cm</b>, panjangnya <b>' + w +
        ' cm</b>. Berapa <b>lebar</b>-nya?'), h, {
          rng: rng, min: 1, max: 30, spread: 1, candidates: [w],
          topic: 'rectMissingSide', topicName: T('Perimeter', 'Keliling'),
          art: { kind: 'rect', w: w, h: h, hl: 'h', hlLabel: h + ' cm' },
          hint: '(' + kel + ' ÷ 2) − ' + w + ' = ' + h + ' cm.'
        });
    }
    var luas = w * h;
    return num(T('The area of a rectangle is <b>' + luas + ' cm²</b>, its length is <b>' + w +
      ' cm</b>. What is its <b>width</b>?',
      'Luas persegi panjang <b>' + luas + ' cm²</b>, panjangnya <b>' + w +
      ' cm</b>. Berapa <b>lebar</b>-nya?'), h, {
        rng: rng, min: 1, max: 30, spread: 1, candidates: [w],
        topic: 'rectMissingSide', topicName: T('Area', 'Luas'),
        art: { kind: 'rect', w: w, h: h, hl: 'h', hlLabel: h + ' cm' },
        hint: luas + ' ÷ ' + w + ' = ' + h + ' cm.'
      });
  };

  /** Cari bilangan terakhir dari rata-rata 4 bilangan. */
  Topics.averageMissing = function (rng, lv) {
    var avg = ri(rng, 5, 30);
    var v4 = ri(rng, 1, avg * 2);
    var sum3 = avg * 4 - v4;
    var v1 = ri(rng, 1, Math.max(1, sum3 - 2));
    var v2 = ri(rng, 1, Math.max(1, sum3 - v1 - 1));
    var v3 = sum3 - v1 - v2;
    if (v3 < 1) { v1 = 1; v2 = 1; v3 = sum3 - 2; }
    if (v3 < 1) { v1 = avg; v2 = avg; v3 = avg * 4 - v4 - avg * 2; }
    var q = T('The average of 4 numbers is <b>' + avg + '</b>. The first three numbers: <b>' +
      v1 + ', ' + v2 + ', ' + v3 + '</b>. What is the 4th number?',
      'Rata-rata dari 4 bilangan adalah <b>' + avg + '</b>. Tiga bilangan pertama: <b>' +
      v1 + ', ' + v2 + ', ' + v3 + '</b>. Berapa bilangan ke-4?');
    return num(q, v4, {
      rng: rng, min: 0, spread: 4, topic: 'averageMissing', topicName: T('Average', 'Rata-rata'),
      hint: '(' + avg + ' × 4) − (' + v1 + ' + ' + v2 + ' + ' + v3 + ') = ' + v4 + '.'
    });
  };

  /** Mengenal nama & sifat bangun datar. */
  var BENTUK_SISI = T([
    { n: 3, name: 'triangle' }, { n: 4, name: 'rectangle' }, { n: 5, name: 'pentagon' },
    { n: 6, name: 'hexagon' }, { n: 8, name: 'octagon' }
  ], [
    { n: 3, name: 'segitiga' }, { n: 4, name: 'persegi panjang' }, { n: 5, name: 'segi lima' },
    { n: 6, name: 'segi enam' }, { n: 8, name: 'segi delapan' }
  ]);
  var BENTUK_SIFAT = T([
    { name: 'square', desc: 'four sides of equal length and four right angles' },
    { name: 'rectangle', desc: 'four right angles, but the long and short sides differ' },
    { name: 'triangle', desc: 'has three sides and three angles' },
    { name: 'circle', desc: 'has no corners and every side is curved' },
    { name: 'parallelogram', desc: 'four sides, with opposite sides parallel' }
  ], [
    { name: 'persegi', desc: 'empat sisi sama panjang dan empat sudut siku' },
    { name: 'persegi panjang', desc: 'empat sudut siku, tetapi sisi panjang dan lebarnya berbeda' },
    { name: 'segitiga', desc: 'memiliki tiga sisi dan tiga sudut' },
    { name: 'lingkaran', desc: 'tidak bersudut dan seluruh sisinya lengkung' },
    { name: 'jajar genjang', desc: 'empat sisi, sisi bertentangannya sejajar' }
  ]);

  Topics.geoName = function (rng, lv) {
    if (U.chance(rng, 0.5)) {
      var b = pk(rng, BENTUK_SISI);
      var wrongs = BENTUK_SISI.filter(function (x) { return x.n !== b.n; })
        .map(function (x) { return x.name; }).slice(0, 3);
      return txt(T('What is a flat shape with <b>' + b.n + ' sides</b> called?',
        'Bangun datar dengan <b>' + b.n + ' sisi</b> disebut apa?'), b.name, wrongs, {
        rng: rng, topic: 'geoName', topicName: T('Flat Shapes', 'Bangun Datar'),
        hint: T(b.name + ' has ' + b.n + ' sides.', b.name + ' punya ' + b.n + ' sisi.')
      });
    }
    var s = pk(rng, BENTUK_SIFAT);
    var wrongs2 = BENTUK_SIFAT.filter(function (x) { return x.name !== s.name; })
      .map(function (x) { return x.name; }).slice(0, 3);
    return txt(T('Which flat shape <b>' + s.desc + '</b>?',
      'Manakah bangun datar yang <b>' + s.desc + '</b>?'), s.name, wrongs2, {
      rng: rng, topic: 'geoName', topicName: T('Flat Shapes', 'Bangun Datar'),
      hint: T('Its features match ' + s.name + '.', 'Ciri-cirinya cocok untuk ' + s.name + '.')
    });
  };

  /* ---------- Topik tambahan TK ---------- */

  /** Bagi rata (pembagian sederhana) dengan gambar. */
  Topics.tkShareVisual = function (rng, lv) {
    var maxTot = lv.scale.countMax || 10;
    var g = ri(rng, 2, 3);
    var per = ri(rng, 2, 4);
    var guard = 0;
    while (g * per > maxTot && guard++ < 20) {
      g = ri(rng, 2, 3);
      per = ri(rng, 2, Math.max(2, Math.min(4, Math.floor(maxTot / g))));
    }
    if (g * per > maxTot) { g = 2; per = Math.max(2, Math.min(3, Math.floor(maxTot / 2))); }
    var total = g * per;
    var item = pk(rng, TK_ITEMS);
    return num(T('Share <b>' + total + '</b> ' + Art_name(item) + ' equally among <b>' + g +
      '</b> children. How many does each child get?',
      'Bagi rata <b>' + total + '</b> ' + Art_name(item) + ' kepada <b>' + g +
      '</b> anak. Tiap anak dapat berapa?'), per, {
        rng: rng, min: 1, spread: 2, topic: 'tkShareVisual', topicName: T('Fair Share', 'Bagi Rata'),
        art: { kind: 'groups', groups: g, per: per, item: item },
        hint: T(total + ' ÷ ' + g + ' = ' + per + '.', total + ' dibagi ' + g + ' = ' + per + '.')
      });
  };

  /** Soal cerita: siapa yang lebih banyak. */
  Topics.tkWhoMore = function (rng, lv) {
    var max = Math.min(lv.scale.countMax || 10, 10);
    var n1 = pk(rng, NAMA), n2 = pk(rng, NAMA), g = 0;
    while (n2 === n1 && g++ < 20) n2 = pk(rng, NAMA);
    if (n2 === n1) n2 = NAMA[(NAMA.indexOf(n1) + 1) % NAMA.length];
    var a = ri(rng, 1, max - 1);
    var b = ri(rng, 1, max - 1);
    g = 0;
    while (b === a && g++ < 30) b = ri(rng, 1, max - 1);
    if (b === a) b = a === 1 ? 2 : 1;
    var ans = a > b ? n1 : n2;
    var other = a > b ? n2 : n1;
    var q = T('<b>' + n1 + '</b> has <b>' + a + '</b> apples, <b>' + n2 + '</b> has <b>' + b +
      '</b> apples. Who has <b>more</b> apples?',
      '<b>' + n1 + '</b> punya <b>' + a + '</b> apel, <b>' + n2 + '</b> punya <b>' + b +
      '</b> apel. Siapa yang <b>lebih banyak</b> apelnya?');
    return txt(q, ans, [other, T('the same amount', 'sama banyak'), T('both of them', 'dua-duanya')], {
      rng: rng, topic: 'tkWhoMore', topicName: T('Comparing', 'Membandingkan'),
      art: { kind: 'balance', left: a, right: b, leftItems: a, rightItems: b },
      hint: T((a > b ? n1 + ' has more (' + a + ' vs ' + b + ')' : n2 + ' has more (' + b + ' vs ' + a + ')') + '.',
        (a > b ? n1 + ' lebih banyak (' + a + ' vs ' + b + ')' : n2 + ' lebih banyak (' + b + ' vs ' + a + ')') + '.')
    });
  };

  /* ============================================================
   *  DAFTAR & PENJELASAN
   * ============================================================ */

  Topics.NAMES = {
    count: T('Counting', 'Menghitung'), shapeCount: T('Shapes & Sides', 'Bentuk & Sisi'), addSmall: T('Addition', 'Penjumlahan'), subSmall: T('Subtraction', 'Pengurangan'),
    missingAdd: T('Missing Number', 'Angka Hilang'), compare: T('Comparing', 'Bandingkan'), pattern: T('Number Patterns', 'Pola Bilangan'),
    add100: T('Addition', 'Penjumlahan'), sub100: T('Subtraction', 'Pengurangan'), missing100: T('Missing Number', 'Angka Hilang'), numberline: T('Number Line', 'Garis Bilangan'),
    placeValue2: T('Place Value', 'Nilai Tempat'), placeValue3: T('Place Value', 'Nilai Tempat'), timeHour: T('Telling Time', 'Jam'), timeMinute: T('Telling Time', 'Jam'),
    moneySimple: T('Money', 'Uang'), mul25: T('Multiplication', 'Perkalian'), mul345: T('Multiplication', 'Perkalian'), timesTable: T('Times Table', 'Perkalian'),
    divSmall: T('Division', 'Pembagian'), div25: T('Division', 'Pembagian'), beforeAfter: T('Before & After', 'Bilangan'), add200: T('Addition', 'Penjumlahan'),
    sub200: T('Subtraction', 'Pengurangan'), add3digit: T('Addition', 'Penjumlahan'), sub3digit: T('Subtraction', 'Pengurangan'),
    wordAddSub: T('Word Problems', 'Soal Cerita'), wordMulDiv: T('Word Problems', 'Soal Cerita'), wordMulti: T('Word Problems', 'Soal Cerita'),
    rectArea: T('Area', 'Luas'), rectPerimeter: T('Perimeter', 'Keliling'), compositeArea: T('Combined Area', 'Luas Majemuk'), volume: T('Volume', 'Volume'),
    angleBasic: T('Angles', 'Sudut'), mul2digit: T('Multiplication', 'Perkalian'),
    fractionIntro: T('Fractions', 'Pecahan'), fractionCompare: T('Comparing Fractions', 'Bandingkan Pecahan'), fractionAddSame: T('Adding Fractions', 'Penjumlahan Pecahan'),
    decimalIntro: T('Decimals', 'Desimal'), decimalArith: T('Decimals', 'Desimal'), percent: T('Percentages', 'Persen'), integerOps: T('Integers', 'Bilangan Bulat'),
    orderOps: T('Order of Operations', 'Urutan Operasi'), ratioSimple: T('Ratios', 'Perbandingan'), unitConvert: T('Units', 'Satuan'), average: T('Average', 'Rata-rata'),
    algebra: T('Algebra', 'Aljabar'), primeFactor: T('Prime Factors', 'Faktor Prima'), gcdlcm: T('GCD & LCM', 'FPB & LCM'), speed: T('Speed', 'Kecepatan'), square: T('Squares & Powers', 'Kuadrat'),
    hardMix: T('Mixed Practice', 'Campuran'),
    // Topik variasi tambahan
    oddEven: T('Odd & Even', 'Ganjil & Genap'), numberOrder: T('Ordering Numbers', 'Mengurutkan Bilangan'), rounding: T('Rounding', 'Pembulatan'),
    mulGroups: T('Multiplication', 'Perkalian'),
    addChain: T('Addition', 'Penjumlahan'), subMissing: T('Missing Number', 'Angka Hilang'), doubleHalf: T('Double & Half', 'Dobel & Separuh'),
    fractionOf: T('Simple Fractions', 'Pecahan Sederhana'), minMax: T('Greatest & Least Value', 'Nilai Terbesar & Terkecil'), triangleArea: T('Area', 'Luas'),
    divRemainder: T('Division with Remainder', 'Pembagian Bersisa'), timeDuration: T('Time Difference', 'Selisih Waktu'), moneyChange: T('Money', 'Uang'),
    romanNumeral: T('Roman Numerals', 'Angka Romawi'), decimalCompare: T('Decimals', 'Bilangan Desimal'), rectMissingSide: T('Perimeter & Area', 'Keliling & Luas'),
    averageMissing: T('Average', 'Rata-rata'), geoName: T('Flat Shapes', 'Bangun Datar'),
    // Level TK
    tkCount: T('Counting', 'Menghitung'), tkNumberRecognize: T('Number Recognition', 'Kenal Angka'), tkBeforeAfter: T('Number Order', 'Urutan Angka'),
    tkCompare: T('Comparing', 'Membandingkan'), tkBigSmall: T('Big & Long', 'Besar & Panjang'), tkPattern: T('Patterns', 'Pola'),
    tkShape: T('Shapes', 'Bentuk'), tkColor: T('Colors', 'Warna'), tkClassify: T('Sorting', 'Mengelompokkan'),
    tkAddVisual: T('Adding', 'Tambah'), tkSubVisual: T('Subtracting', 'Kurang'), tkClockHour: T('Telling Time', 'Jam'), tkMoneySimple: T('Money', 'Uang'),
    tkShareVisual: T('Fair Share', 'Bagi Rata'), tkWhoMore: T('Comparing', 'Membandingkan')
  };

  /** Daftar semua key yang tersedia (untuk validasi config). */
  Topics.keys = function () { return Object.keys(Topics.NAMES); };

})(window);
