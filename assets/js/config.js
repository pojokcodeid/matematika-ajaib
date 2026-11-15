/* ============================================================
 *  config.js  —  Pengaturan global & definisi 20 level
 *  Game: Matematika Ajaib (game edukasi matematika SD kelas 1-6)
 * ============================================================ */
(function (global) {
  'use strict';

  var MG = global.MG = global.MG || {};
  var T = MG.t;

  MG.CONFIG = {
    TITLE: T('Magic Math', 'Matematika Ajaib'),
    TAGLINE: T('Learning math through play', 'Belajar matematika sambil bermain'),
    LEVELS_COUNT: 20,
    TK_LEVELS_COUNT: 8,
    ADV_LEVELS_COUNT: 10,
    QUESTIONS_PER_LEVEL: 10,
    OPTIONS_COUNT: 4,
    START_HEARTS: 3,
    DB_FILE: 'matematika-ajaib.sqlite',
    STORAGE_KEY: 'matematika-ajaib.db',

    /*
     * PAPAN PERINGKAT ONLINE (opsional)
     *
     * Kosongkan ('')  -> memakai server.js lokal (/api/leaderboard).
     * Diisi URL       -> memakai Google Sheets lewat Web App Apps Script
     *                    (berakhiran /exec), jadi tetap jalan di GitHub Pages.
     * Langkah deploy ada di README, skripnya di google-apps-script/.
     */
    LEADERBOARD_API: '',

    // Penskoran
    SCORE: {
      BASE: 10,           // poin dasar tiap jawaban benar
      TIME_BONUS_MAX: 10, // bonus maksimal karena cepat
      HINT_PENALTY: 3,    // pengurangan poin bila memakai petunjuk
      COMBO_STEP: 1,      // pengali combo: 1x, 2x, 3x, ...
      COMBO_MAX: 4        // batas pengali combo
    },

    // Bintang per level
    STARS: [
      { need: 0.6, stars: 1, label: T('Good!', 'Bagus!') },
      { need: 0.8, stars: 2, label: T('Great!', 'Hebat!') },
      { need: 1.0, stars: 3, label: T('Perfect!', 'Sempurna!') }
    ],

    // Kesulitan → pengali bonus waktu
    DIFFICULTY: {
      santai: { label: T('Relaxed', 'Santai'), timeBonus: 0.6, timeLabel: T('play time', 'waktu plasmanya') },
      sedang: { label: T('Normal', 'Sedang'), timeBonus: 1.0, timeLabel: T('normal time', 'waktu biasa') },
      sulit: { label: T('Hard', 'Sulit'), timeBonus: 1.5, timeLabel: T('fast time', 'waktu cepat') }
    },

    AVATARS: ['🙂', '👦', '👧', '🧒', '👧‍🚀', '🦊', '🐼', '🐨', '🦁', '🐯', '🐸', '🦄', '🐙', '🤖', '👽', '🦖'],

    // ------------------------------------------------------------------
    //  20 LEVEL —difficultynya naik bertahap (bukan diikat kelas).
    //  Setiap level memilih soal acak dari daftar topik + jangkauan angka
    //  yang mengikuti tingkat kesulitan level tersebut.
    // ------------------------------------------------------------------
    LEVELS: [
      {
        n: 1, title: T('Know Your Numbers', 'Kenali Angka'), emoji: '🐣', hue: 45,
        desc: T('Getting to know numbers, counting, and comparing small numbers.', 'Mengenal angka, menghitung, dan membandingkan bilangan kecil.'),
        topics: ['count', 'addSmall', 'subSmall', 'compare', 'shapeCount', 'numberOrder'],
        scale: { max: 10, countMax: 10 }
      },
      {
        n: 2, title: T('Add & Subtract', 'Tambah & Kurang'), emoji: '🧮', hue: 30,
        desc: T('Addition and subtraction up to 20.', 'Penjumlahan dan pengurangan sampai 20.'),
        topics: ['addSmall', 'subSmall', 'missingAdd', 'compare', 'count', 'oddEven', 'addChain'],
        scale: { max: 20, countMax: 20 }
      },
      {
        n: 3, title: T('Number Patterns', 'Pola Angka'), emoji: '🔢', hue: 15,
        desc: T('Finding number patterns and the missing numbers.', 'Menentukan pola bilangan dan angka yang hilang.'),
        topics: ['addSmall', 'subSmall', 'missingAdd', 'pattern', 'compare', 'subMissing', 'minMax'],
        scale: { max: 20, countMax: 20 }
      },
      {
        n: 4, title: T('Numbers to Hundreds', 'Bilang Ratusan'), emoji: '💯', hue: 350,
        desc: T('Adding, subtracting, and place value up to 100.', 'Tambah, kurang, dan nilai tempat sampai 100.'),
        topics: ['add100', 'sub100', 'missing100', 'numberline', 'placeValue2', 'rounding', 'romanNumeral'],
        scale: { max: 100, countMax: 20 }
      },
      {
        n: 5, title: T('Clocks & Money', 'Jam & Uang'), emoji: '⏰', hue: 200,
        desc: T('Reading analog clocks and counting money.', 'Membaca jam analog dan menghitung uang.'),
        topics: ['add100', 'sub100', 'timeHour', 'moneySimple', 'missing100', 'timeDuration', 'moneyChange'],
        scale: { max: 100, countMax: 20 }
      },
      {
        n: 6, title: T('Multiplication', 'Kaliplication'), emoji: '✖️', hue: 260,
        desc: T('Multiplying by 2 and 5, plus number patterns.', 'Perkalian 2 dan 5, serta pola bilangan.'),
        topics: ['mul25', 'add100', 'sub100', 'pattern', 'numberline', 'doubleHalf', 'oddEven'],
        scale: { max: 100, countMax: 20 }
      },
      {
        n: 7, title: T('Multiplication Flow', 'Perkalian Fluid'), emoji: '🚀', hue: 285,
        desc: T('Multiplying by 2, 3, 4, and 5 up to 100.', 'Perkalian 2, 3, 4, dan 5 sampai 100.'),
        topics: ['mul25', 'mul345', 'add200', 'sub200', 'beforeAfter', 'fractionOf', 'doubleHalf'],
        scale: { max: 200, countMax: 20 }
      },
      {
        n: 8, title: T('Starting Division', 'Mulai Pembagian'), emoji: '➗', hue: 320,
        desc: T('Exact division by 2 and 5, plus story problems.', 'Pembagian tepat dengan 2 dan 5, serta soal cerita.'),
        topics: ['div25', 'mul345', 'sub200', 'wordAddSub', 'timeMinute', 'divRemainder', 'moneyChange'],
        scale: { max: 200, countMax: 20 }
      },
      {
        n: 9, title: T('Times Tables', 'Tabel Perkalian'), emoji: '📋', hue: 165,
        desc: T('Multiplication up to 10 and place value of hundreds.', 'Perkalian sampai 10 dan nilai tempat ratusan.'),
        topics: ['timesTable', 'div25', 'divSmall', 'add200', 'placeValue3', 'rounding', 'numberOrder'],
        scale: { max: 500, countMax: 20 }
      },
      {
        n: 10, title: T('Three-Digit Numbers', 'Angka Tiga Digit'), emoji: '🏙️', hue: 145,
        desc: T('Adding and subtracting three-digit numbers, plus division.', 'Penjumlahan/pengurangan tiga angka dan pembagian.'),
        topics: ['add3digit', 'sub3digit', 'divSmall', 'timesTable', 'wordMulDiv', 'divRemainder', 'romanNumeral'],
        scale: { max: 1000, countMax: 20 }
      },
      {
        n: 11, title: T('Perimeter & Area', 'Keliling & Luas'), emoji: '📐', hue: 190,
        desc: T('Finding the perimeter and area of squares, rectangles, and triangles.', 'Menghitung keliling dan luas persegi, persegi panjang, segitiga.'),
        topics: ['rectArea', 'rectPerimeter', 'compare', 'add3digit', 'divSmall', 'geoName', 'rectMissingSide', 'triangleArea'],
        scale: { max: 1000, countMax: 20 }
      },
      {
        n: 12, title: T('Introduction to Fractions', 'Mulai Pecahan'), emoji: '🥧', hue: 225,
        desc: T('Meeting fractions, comparing them, and simple angles.', 'Mengenal pecahan, membandingkan, dan sudut sederhana.'),
        topics: ['fractionIntro', 'fractionCompare', 'angleBasic', 'compare', 'divSmall', 'fractionOf'],
        scale: { max: 1000, countMax: 20 }
      },
      {
        n: 13, title: T('Volume & Decimals', 'Volume & Desimal'), emoji: '🧊', hue: 175,
        desc: T('Volume of cubes, multiplying two-digit numbers, and decimals.', 'Volume kubus, perkalian dua angka, dan bilangan desimal.'),
        topics: ['volume', 'mul2digit', 'decimalIntro', 'fractionIntro', 'rectArea', 'decimalCompare'],
        scale: { max: 2000, countMax: 20 }
      },
      {
        n: 14, title: T('Percentages', 'Persen'), emoji: '💯', hue: 5,
        desc: T('Percentages, whole numbers, and the order of operations.', 'Menghitung persen, bilangan bulat, dan urutan operasi.'),
        topics: ['percent', 'integerOps', 'orderOps', 'decimalIntro', 'fractionCompare', 'decimalCompare'],
        scale: { max: 5000, countMax: 20 }
      },
      {
        n: 15, title: T('Ratios & Units', 'Rasio & Satuan'), emoji: '⚖️', hue: 95,
        desc: T('Simple ratios, unit conversion, and averages.', 'Perbandingan sederhana, konversi satuan, dan rata-rata.'),
        topics: ['ratioSimple', 'unitConvert', 'average', 'percent', 'decimalArith', 'averageMissing'],
        scale: { max: 5000, countMax: 20 }
      },
      {
        n: 16, title: T('Algebra', 'Aljabar'), emoji: '🔤', hue: 265,
        desc: T('Simple equations, prime factors, and GCD/LCM.', 'Persamaan sederhana, faktor prima, dan FPB/LCM.'),
        topics: ['algebra', 'primeFactor', 'gcdlcm', 'average', 'orderOps', 'averageMissing'],
        scale: { max: 10000, countMax: 20 }
      },
      {
        n: 17, title: T('Speed', 'Kecepatan'), emoji: '🚗', hue: 205,
        desc: T('Speed, distance, time, and fractions with the same denominator.', 'Kecepatan, jarak, waktu, dan pecahan berpenyebut sama.'),
        topics: ['speed', 'fractionAddSame', 'decimalArith', 'ratioSimple', 'volume', 'timeDuration'],
        scale: { max: 10000, countMax: 20 }
      },
      {
        n: 18, title: T('Squares & Shapes', 'Kuadrat & Gabungan'), emoji: '🧮', hue: 240,
        desc: T('Squaring numbers, area of compound shapes, and long story problems.', 'Kuadrat bilangan, luas bangun majemuk, dan soal cerita panjang.'),
        topics: ['square', 'compositeArea', 'wordMulti', 'fractionAddSame', 'percent', 'rectMissingSide'],
        scale: { max: 20000, countMax: 20 }
      },
      {
        n: 19, title: T('Challenge', 'Tantangan'), emoji: '🔥', hue: 20,
        desc: T('Multi-step story problems and mathematical reasoning.', 'Soal cerita langkah banyak dan penalaran matematis.'),
        topics: ['wordMulti', 'ratioSimple', 'percent', 'integerOps', 'algebra', 'fractionAddSame', 'averageMissing'],
        scale: { max: 20000, countMax: 20 }
      },
      {
        n: 20, title: T('Olympiad', 'Olimpiade'), emoji: '👑', hue: 285,
        desc: T('The toughest level! Mixed operations, number logic, and story problems.', 'Level tersulit! Gabungan operasi, logika angka, dan soal cerita.'),
        topics: ['hardMix', 'algebra', 'ratioSimple', 'percent', 'fractionAddSame', 'orderOps', 'speed', 'decimalCompare'],
        scale: { max: 50000, countMax: 20 }
      }
    ],

    // ------------------------------------------------------------------
    //  8 LEVEL TK — untuk anak usia 4-6 tahun (sebelum masuk SD).
    //  Semua soal memakai gambar agar bisa dikerjakan tanpa membaca
    //  lancar. Jalur ini terpisah dari 20 level SD supaya progres
    //  level SD yang lama tidak terganggu.
    // ------------------------------------------------------------------
    TK_LEVELS: [
      {
        n: 1, track: 'tk', title: T('Meet the Numbers', 'Kenal Angka'), emoji: '1️⃣', hue: 320,
        desc: T('Learning number symbols 1 to 5.', 'Mengenal lambang bilangan 1 sampai 5.'),
        topics: ['tkNumberRecognize', 'tkCount', 'tkCompare', 'tkColor', 'tkWhoMore'],
        scale: { max: 5, countMax: 5 }
      },
      {
        n: 2, track: 'tk', title: T('Counting', 'Berhitung'), emoji: '🔟', hue: 300,
        desc: T('Counting objects up to 10 and the numbers before and after.', 'Menghitung benda sampai 10 dan angka sebelum/sesudah.'),
        topics: ['tkCount', 'tkNumberRecognize', 'tkBeforeAfter', 'tkCompare', 'tkColor', 'tkShareVisual'],
        scale: { max: 10, countMax: 10 }
      },
      {
        n: 3, track: 'tk', title: T('Shapes & Colors', 'Bentuk & Warna'), emoji: '🔺', hue: 260,
        desc: T('Learning shapes and colors, and sorting objects.', 'Mengenal bentuk, warna, dan mengelompokkan benda.'),
        topics: ['tkShape', 'tkColor', 'tkClassify', 'tkPattern', 'tkCount'],
        scale: { max: 10, countMax: 10 }
      },
      {
        n: 4, track: 'tk', title: T('More or Less', 'Lebih Banyak'), emoji: '⚖️', hue: 200,
        desc: T('Comparing which has more, is bigger, and is longer.', 'Membandingkan mana yang lebih banyak, lebih besar, lebih panjang.'),
        topics: ['tkCompare', 'tkBigSmall', 'tkClassify', 'tkCount', 'tkPattern', 'tkWhoMore'],
        scale: { max: 10, countMax: 10 }
      },
      {
        n: 5, track: 'tk', title: T('Happy Patterns', 'Pola Ceria'), emoji: '🎨', hue: 150,
        desc: T('Continuing repeating patterns of shapes and colors.', 'Melanjutkan pola bentuk dan warna yang berulang.'),
        topics: ['tkPattern', 'tkShape', 'tkColor', 'tkBigSmall', 'tkCount'],
        scale: { max: 10, countMax: 10 }
      },
      {
        n: 6, track: 'tk', title: T('Fun Addition', 'Tambah Seru'), emoji: '➕', hue: 45,
        desc: T('Simple addition up to 5 with picture help.', 'Penjumlahan sederhana sampai 5 dengan bantuan gambar.'),
        topics: ['tkAddVisual', 'tkCount', 'tkNumberRecognize', 'tkCompare', 'tkPattern'],
        scale: { max: 5, countMax: 5 }
      },
      {
        n: 7, track: 'tk', title: T('Fun Subtraction', 'Kurang Seru'), emoji: '➖', hue: 20,
        desc: T('Simple subtraction up to 5 with picture help.', 'Pengurangan sederhana sampai 5 dengan bantuan gambar.'),
        topics: ['tkSubVisual', 'tkAddVisual', 'tkCount', 'tkCompare', 'tkShape'],
        scale: { max: 5, countMax: 5 }
      },
      {
        n: 8, track: 'tk', title: T('Clocks & Money', 'Jam & Uang'), emoji: '⏰', hue: 100,
        desc: T('Reading clocks on the hour and learning simple money values.', 'Membaca jam bulat dan mengenal nilai uang sederhana.'),
        topics: ['tkClockHour', 'tkMoneySimple', 'tkCount', 'tkAddVisual', 'tkBigSmall', 'tkShareVisual'],
        scale: { max: 10, countMax: 10 }
      }
    ],

    // ------------------------------------------------------------------
    //  10 BAB PETUALANGAN MATEMATIKA — jalur ketiga bergaya petualangan.
    //  Tiap level adalah satu bab cerita (desa → hutan → gunung → dst)
    //  dengan soal cerita supaya terasa seperti perjalanan. Jalur ini
    //  terpisah dari TK & SD, jadi progres lama tidak tersentuh.
    // ------------------------------------------------------------------
    ADV_LEVELS: [
      {
        n: 1, track: 'adv', title: T('Peaceful Village', 'Desa Damai'), emoji: '🏡', hue: 140,
        desc: T('Chapter 1 — Counting the village supplies before setting off on the adventure.', 'Bab 1 — Menghitung harta di desa sebelum berangkat petualangan.'),
        story: T('You live in <b>Peaceful Village</b>. The Village Chief asks for your help counting the supplies you will bring: apples, bread, and coins. Finish the counting, then set off!', 'Kamu tinggal di <b>Desa Damai</b>. Pak Kepala Desa minta tolong menghitung bekal yang akan kamu bawa: apel, roti, dan koin. Selesaikan hitungannya, lalu berangkatlah!'),
        topics: ['count', 'addSmall', 'subSmall', 'compare', 'numberOrder', 'wordAddSub'],
        scale: { max: 10, countMax: 10 }
      },
      {
        n: 2, track: 'adv', title: T('Forbidden Forest', 'Hutan Terlarang'), emoji: '🌲', hue: 120,
        desc: T('Chapter 2 — Counting steps and spotting patterns in the forest.', 'Bab 2 — Menghitung langkah dan melihat pola di dalam hutan.'),
        story: T('The path leads into a thick forest. There is a <b>pattern of leaves</b> that shows the right way. Get the pattern wrong and you could get lost. Count carefully!', 'Jalur menuju hutan berpohon lebat. Ada <b>pola dedaunan</b> yang menunjukkan jalan yang benar. Salah pola, kamu bisa tersesat. Hitung dengan teliti!'),
        topics: ['addSmall', 'subSmall', 'missingAdd', 'pattern', 'compare', 'wordAddSub', 'oddEven'],
        scale: { max: 20, countMax: 20 }
      },
      {
        n: 3, track: 'adv', title: T('Roaring River', 'Sungai Derau'), emoji: '🌊', hue: 195,
        desc: T('Chapter 3 — Crossing the river by putting the stepping stones in order.', 'Bab 3 — Menyeberang sungai sambil mengurutkan batu loncatan.'),
        story: T('A <b>river crab</b> guards the stepping stones. He only lets you pass if you can put the stones in order and count the jump distances up to 100.', 'Seekor <b>kepiting sungai</b> menjaga batu loncatan. Dia hanya mengizinkan kamu lewat kalau kamu bisa mengurutkan batu dan menghitung jarak loncatan sampai 100.'),
        topics: ['add100', 'sub100', 'missing100', 'numberline', 'compare', 'minMax', 'wordAddSub'],
        scale: { max: 100, countMax: 20 }
      },
      {
        n: 4, track: 'adv', title: T('Treasure Cave', 'Gua Harta Karun'), emoji: '🪙', hue: 40,
        desc: T('Chapter 4 — Counting coins and opening the cave door in time.', 'Bab 4 — Menghitung koin dan membuka pintu gua tepat waktu.'),
        story: T('Inside the cave stands a locked <b>golden chest</b>. Its door opens only if you count the coins correctly and read the cave keeper’s clock.', 'Di dalam gua berdiri <b>peti emas</b> yang terkunci. Pintunya membuka hanya bila kamu menghitung koin dengan benar dan membaca jam penjaga gua.'),
        topics: ['moneySimple', 'timeHour', 'add100', 'sub100', 'moneyChange', 'timeDuration', 'wordAddSub'],
        scale: { max: 100, countMax: 20 }
      },
      {
        n: 5, track: 'adv', title: T('Number Tower', 'Menara Angka'), emoji: '🗼', hue: 265,
        desc: T('Chapter 5 — Climbing the tower one multiplication step at a time.', 'Bab 5 — Naik menara dengan anak tangga perkalian.'),
        story: T('To climb the <b>number tower</b>, every step must be counted with multiplication by 2, 3, 4, and 5. Finish all the steps to light up the tower!', 'Untuk naik ke <b>menara angka</b>, setiap anak tangga harus dihitung dengan perkalian 2, 3, 4, dan 5. Rampungkan semua langkah agar menara menyala!'),
        topics: ['mul25', 'mul345', 'pattern', 'add100', 'doubleHalf', 'oddEven', 'wordMulDiv'],
        scale: { max: 100, countMax: 20 }
      },
      {
        n: 6, track: 'adv', title: T('Desert', 'Padang Pasir'), emoji: '🏜️', hue: 30,
        desc: T('Chapter 6 — Sharing supplies and solving story problems in the desert.', 'Bab 6 — Membagi bekal dan menyelesaikan soal cerita di padang.'),
        story: T('In the <b>desert</b>, supplies must be shared equally so all your friends get enough. Watch the leftover supplies and the travelling merchants’ story problems.', 'Di <b>padang pasir</b>, bekal harus dibagi rata agar semua kawanmu kenyang. Perhatikan sisa bekal dan soal cerita para pedagang keliling.'),
        topics: ['div25', 'mul345', 'wordAddSub', 'wordMulDiv', 'sub200', 'divRemainder', 'beforeAfter'],
        scale: { max: 200, countMax: 20 }
      },
      {
        n: 7, track: 'adv', title: T('Fishing Village', 'Desa Nelayan'), emoji: '⛵', hue: 210,
        desc: T('Chapter 7 — Weighing fish and finding the place value of the catch.', 'Bab 7 — Menimbang ikan dan menghitung nilai tempat hasil tangkapan.'),
        story: T('The fishers of <b>Fishing Village</b> weigh their catch. Count the fish weights, read the place values, and use the times table to add up the baskets.', 'Nelayan <b>Desa Nelayan</b> menimbang hasil tangkapan. Hitung berat ikannya, baca nilai tempat, dan pakai tabel perkalian untuk menjumlahkan keranjang.'),
        topics: ['timesTable', 'divSmall', 'placeValue3', 'add3digit', 'sub3digit', 'rounding', 'wordMulDiv'],
        scale: { max: 500, countMax: 20 }
      },
      {
        n: 8, track: 'adv', title: T('Snowy Mountain', 'Gunung Salju'), emoji: '🏔️', hue: 190,
        desc: T('Chapter 8 — Solving the fraction and shape riddles on the mountaintop.', 'Bab 8 — Memecahkan rebusan pecahan dan bentuk di puncak gunung.'),
        story: T('At <b>Snowy Mountain</b> there is a gate patterned with fractions. Solve the fraction riddle and measure the gatekeeper’s flat shapes so the path to the top opens.', 'Di <b>Gunung Salju</b> ada gerbang bercorak pecahan. Selesaikan rebusan pecahan dan ukur bangun datar penjaga gerbang agar jalan ke puncak terbuka.'),
        topics: ['fractionIntro', 'fractionCompare', 'geoName', 'rectArea', 'rectPerimeter', 'angleBasic', 'divSmall'],
        scale: { max: 1000, countMax: 20 }
      },
      {
        n: 9, track: 'adv', title: T('Cloud Palace', 'Istana Awan'), emoji: '☁️', hue: 285,
        desc: T('Chapter 9 — Checking the palace treasure: percentages, decimals, and averages.', 'Bab 9 — Menimbang harta di istana: persen, desimal, dan rata-rata.'),
        story: T('At <b>Cloud Palace</b>, the treasurer asks you to check the treasure records: tax percentages, decimals, averages, and the kingdom’s unit conversions.', 'Di <b>Istana Awan</b>, bendahara meminta kamu memeriksa catatan harta: persen pajak, bilangan desimal, rata-rata, dan konversi satuan kerajaan.'),
        topics: ['percent', 'decimalIntro', 'decimalArith', 'average', 'ratioSimple', 'unitConvert', 'integerOps'],
        scale: { max: 5000, countMax: 20 }
      },
      {
        n: 10, track: 'adv', title: T('Dragon’s Nest', 'Sarang Naga'), emoji: '🐉', hue: 5,
        desc: T('Chapter 10 — The final chapter! Defeat the dragon with logic and story problems.', 'Bab 10 — Bab terakhir! Kalahkan sang naga dengan logika dan soal cerita.'),
        story: T('The dragon guarding the crown awaits you at <b>Dragon’s Nest</b>. Answer the long story problems, algebra, and order-of-operations questions correctly to defeat it. You are almost there!', 'Naga penjaga mahkota menantimu di <b>Sarang Naga</b>. Jawab soal cerita panjang, aljabar, dan urutan operasi dengan tepat untuk menaklukkannya. Kamu hampir sampai!'),
        topics: ['hardMix', 'algebra', 'orderOps', 'wordMulti', 'speed', 'fractionAddSame', 'gcdlcm'],
        scale: { max: 20000, countMax: 20 }
      }
    ]
  };


  MG.level = function (n) {
    return MG.CONFIG.LEVELS[Math.max(1, Math.min(MG.CONFIG.LEVELS_COUNT, n)) - 1];
  };

  /** Level TK ke-n (1..TK_LEVELS_COUNT). */
  MG.tkLevel = function (n) {
    return MG.CONFIG.TK_LEVELS[Math.max(1, Math.min(MG.CONFIG.TK_LEVELS_COUNT, n)) - 1];
  };

  /** Bab petualangan ke-n (1..ADV_LEVELS_COUNT). */
  MG.advLevel = function (n) {
    return MG.CONFIG.ADV_LEVELS[Math.max(1, Math.min(MG.CONFIG.ADV_LEVELS_COUNT, n)) - 1];
  };

  /** Normalisasi nama jalur: 'sd' | 'tk' | 'adv'. */
  MG.normTrack = function (track) {
    return (track === 'tk' || track === 'adv') ? track : 'sd';
  };

  /** Daftar semua level pada sebuah jalur. */
  MG.levelList = function (track) {
    var t = MG.normTrack(track);
    return t === 'tk' ? MG.CONFIG.TK_LEVELS : t === 'adv' ? MG.CONFIG.ADV_LEVELS : MG.CONFIG.LEVELS;
  };

  /** Banyak level pada sebuah jalur ('sd', 'tk', atau 'adv'). */
  MG.levelCount = function (track) {
    var t = MG.normTrack(track);
    return t === 'tk' ? MG.CONFIG.TK_LEVELS_COUNT
      : t === 'adv' ? MG.CONFIG.ADV_LEVELS_COUNT
        : MG.CONFIG.LEVELS_COUNT;
  };

  /** Total semua level di seluruh jalur. */
  MG.totalLevels = function () {
    return MG.CONFIG.LEVELS_COUNT + MG.CONFIG.TK_LEVELS_COUNT + MG.CONFIG.ADV_LEVELS_COUNT;
  };

  /** Ambil definisi level pada jalur tertentu. */
  MG.levelOf = function (track, n) {
    var t = MG.normTrack(track);
    return t === 'tk' ? MG.tkLevel(n) : t === 'adv' ? MG.advLevel(n) : MG.level(n);
  };

  /** Teks label level untuk ditampilkan, mis. "TK 3", "Bab 5", atau "Level 12". */
  MG.levelLabel = function (track, n) {
    var t = MG.normTrack(track);
    return t === 'tk' ? (T('Kindergarten ', 'TK ') + n)
      : t === 'adv' ? (T('Chapter ', 'Bab ') + n)
        : (T('Level ', 'Level ') + n);
  };

})(window);
