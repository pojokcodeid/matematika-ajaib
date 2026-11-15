# 🎓 Matematika Ajaib

**Game edukasi matematika untuk anak TK (usia 4–6) dan sekolah dasar kelas 1
sampai kelas 6.**

Tiga jalur belajar — **8 level TK**, **20 level SD**, dan **10 bab Petualangan
Matematika** — dengan kesulitan yang meningkat bertahap, soal matematika acak
(4 pilihan jawaban + ilustrasi + waktu yang bisa diatur, termasuk **tanpa
batas waktu**), dan progres yang tersimpan di database **SQLite** — bisa
langsung dibuka dari file, tanpa instalasi apa pun.

Satu perangkat bisa dipakai **beberapa anak sekaligus**: tiap pemain punya
progres, pengaturan, dan lencana sendiri, plus **papan peringkat** lokal dan
daring.

---

## 🌐 Bahasa / Language

Game ini tersedia dalam **dua bahasa — English (default) dan Bahasa Indonesia**.

This game ships in two languages — **English (the default)** and **Bahasa
Indonesia**.

- Tekan tombol **🌐** di bilah atas, atau pilih bahasa pada **⚙️ Pengaturan →
  🌐 Language**, untuk berpindah.
  Tap the **🌐** button in the top bar (or pick a language in **⚙️ Settings →
  🌐 Language**) to switch.
- Pilihan disimpan di perangkat (`localStorage`, kunci `ma:lang`) sehingga game
  membukanya dengan bahasa yang sama pada kunjungan berikutnya.
  Your choice is stored on the device (`localStorage`, key `ma:lang`), so the
  game opens in that language next time.
- Ganti bahasa memuat ulang halaman sebentar supaya seluruh soal, petunjuk,
  nama level, lencana, dan label ikut berbahasa baru.
  Switching reloads the page once so every question, hint, level name, badge
  and label switches with it.
- Mata uang ikut menyesuaikan: **$20,000** (English) / **Rp20.000**
  (Indonesia).
  Currency follows the language automatically.

---

## 🚀 Menjalankan Game

### Cara 1 — Langsung (paling gampang) ✅ *portable*

Klik 2 kali berkas **`index.html`**.

Selesai. Tidak perlu Node.js, tidak perlu koneksi internet, tidak perlu
menginstal apa pun. Salin folder ini ke flashdisk atau share ke komputer
mana saja dan game tetap jalan.

### Cara 2 — Klik peluncur

| Sistem | Berkas |
|---|---|
| macOS | Klik 2 kali **`Main Game.command`** |
| Windows | Klik 2 kali **`Main Game.bat`** |

Otomatis memakai server lokal kalau Node.js ada, kalau tidak langsung membuka
`index.html` saja.

#### Catatan untuk pengguna Windows

- Kalau muncul peringatan **Windows Defender / SmartScreen** (*"Windows
  protecting your PC"*), klik **More info** lalu **Run anyway**. Peringatan ini
  muncul untuk semua berkas `.bat` hasil unduhan, bukan karena game ini
  berbahaya.
- Kalau Node.js belum terpasang, ambil dari **https://nodejs.org** (pilih versi
  LTS). Tanpa Node.js game tetap bisa dimainkan lewat klik 2x `index.html`,
  hanya papan peringkat daring yang tidak aktif.
- Saat server pertama kali menyala, Windows Firewall akan menanyakan izin.
  Pilih **Allow access** untuk jaringan **Private** supaya game bisa dibuka juga
  dari HP di Wi-Fi yang sama. Pilih **Cancel** kalau tidak perlu — game tetap
  berjalan normal di komputer itu.
- Server dijalankan di **jendela cmd kecil** berjudul *Matematika Ajaib - Server*.
  Untuk menghentikannya: tutup jendela kecil itu, atau buka **Task Manager** →
  klik kanan `node.exe` → **End task**.
- Ingin memakai port lain? Dari Command Prompt: `set PORT=9000` lalu jalankan
  `Main Game.bat` seperti biasa.

### Cara 3 — Lewat server lokal (opsional)

```bash
node server.js
```

Lalu buka **http://localhost:8080**

Keuntungan mode ini:

- Progres ikut tersimpan di berkas **`data/game.sqlite`** (SQLite asli di disk).
- Bisa dibuka dari HP atau komputer lain di Wi-Fi yang sama (alamat IP
  ditampilkan saat server start).
- **Papan peringkat daring aktif** — semua orang yang memakai server yang sama
  bisa saling melihat peringkatnya.
- Tiap pemain punya **slot simpanan sendiri**, jadi progres satu anak tidak
  akan menimpa progres anak lain di perangkat yang sama.

---

## 🎮 Cara Bermain

| | |
|---|---|
| 🧸 **8 level TK** | Jalur khusus usia 4–6: kenal angka, berhitung, bentuk, warna, pola, tambah/kurang visual, jam & uang |
| 🗺️ **20 level SD** | Kesulitan naik terus dari "Kenali Angka" sampai "Olimpiade" |
| 🧭 **10 bab Petualangan** | Jalur bergaya petualangan yang ditampilkan sebagai **peta jelajah** (jalan setapak berkelok + simpul bab + penanda 📍 "kamu di sini"): Desa Damai → Hutan Terlarang → Gua Harta Karun → … → Sarang Naga, tiap bab punya cerita pembuka dan soal cerita yang makin menantang |
| ❓ **10 soal per level** | Soal acak, tiap level punya 10 soal berbeda |
| 🔤 **4 pilihan** | Setiap soal punya tepat 4 jawaban |
| ⏱️ **Waktu per soal** | Bisa diatur 5–180 detik, atau **∞ tanpa batas waktu**, di menu ⚙️ Pengaturan |
| 🖼️ **Ilustrasi** | Gambar SVG asli (apel, jam, pecahan, koin, balok, dan lain-lain) |
| ❤️ **3 hati** | Salah menjawab mengurangi 1 hati |
| 🔥 **Beruntun** | Jawaban benar beruntun dapat pengali skor sampai 4× |
| ⭐ **3 bintang** | Makin banyak benar & makin cepat, makin banyak bintang |
| 💡 **Petunjuk opsional** | Bisa disembunyikan lewat ⚙️ Pengaturan → 💡 Petunjuk (per pemain) |
| 🏅 **14 lencana** | Hadiah kecil yang terbuka sendiri setelah syaratnya tercapai |
| 🧸 **Maskot Bobi** | Pendamping bermain interaktif yang memberi semangat, bersorak saat benar, dan mendukung saat keliru |
| 💡 **Tahukah Kamu?** | Fakta unik matematika ramah anak di setiap akhir level untuk menambah wawasan |
| 👥 **Banyak pemain** | Satu perangkat bisa dipakai beberapa anak, masing-masing punya progres sendiri |
| 🏆 **Papan peringkat** | Peringkat antar-pemain di perangkat ini, dan antar-perangkat lewat server |
| 🌐 **Dua bahasa** | **English** (default) & **Bahasa Indonesia** — ganti lewat tombol 🌐 di bilah atas |

### Menampilkan jawaban dengan cepat

Untuk hasil terbaik, jawab **sebelum waktu habis** — jawaban benar lebih awal
mendapat bonus poin. Bisa juga pakai tombol pintasan keyboard:

| Tombol | Fungsi |
|---|---|
| `A` `B` `C` `D` atau `1`–`4` | pilih jawaban |
| `H` | tampilkan petunjuk (nonaktif bila petunjuk disembunyikan di pengaturan) |
| `Enter` / `Spasi` | lanjut ke soal berikutnya |

---

## 👥 Banyak Pemain & Papan Peringkat

### Beralih pemain

Ada tiga cara masuk ke layar **👥 Pilih Pemain**:

| Cara | Letaknya |
|---|---|
| Ketuk nama di kanan atas | kotak berisi nama & avatar di header |
| Tombol **👥 Ganti Pemain** | di beranda, di bawah tombol-tombol utama |
| Tombol **👥 Ganti / Tambah Pemain** | di ⚙️ Pengaturan |

Pilih salah satu kartu untuk langsung bermain sebagai pemain itu, atau tekan
**➕ Tambah Pemain Baru** untuk membuat profil baru (isi nama, pilih kelas 1–6
dan avatar).

Yang **terpisah penuh** antar pemain:

| Milik pemain | Boleh berbeda? |
|---|---|
| Bintang, level yang terbuka, skor terbaik (per jalur TK/SD/Petualangan) | ✅ ya |
| Riwayat bermain & jawaban | ✅ ya |
| Lencana | ✅ ya |
| Statistik per topik | ✅ ya |
| Waktu per soal (5–180 detik atau tanpa batas) | ✅ ya |
| Kesulitan (gampang / sedang / sulit) | ✅ ya |
| Sembunyikan petunjuk | ✅ ya |
| Kelas 1–6 | ✅ ya |
| Suara & musik | ❌ berlaku untuk seluruh perangkat |

Pemain yang sedang dipakai disimpan di tabel `settings` (`active_player`), jadi
keluar-masuk aplikasi tidak membuat progres tertukar. **Pemain terakhir tidak
bisa dihapus** supaya aplikasi selalu punya profil aktif untuk kembali.

### Papan peringkat

Buka **🏆 Papan Peringkat** dari beranda. Ada dua tab:

| Tab | Isinya | Butuh server? |
|---|---|---|
| 📱 **Perangkat Ini** | Semua pemain yang terdaftar di perangkat ini | tidak |
| 🌐 **Semua Pemain** | Pemain dari HP & komputer lain: dari `server.js`, atau dari Google Sheets bila `LEADERBOARD_API` diisi | ya |

Peringkat dihitung dari **bintang → level selesai → ketelitian**, dengan bobot
bintang jauh lebih besar (10.000 vs 100 vs 100 poin). Jadi mengumpulkan bintang
tetap jadi tujuan utama, dan ketelitian hanya jadi pemutus akhir saat dua
pemain sama-sama punya bintang dan level yang sama. Baris pemain sendiri
ditandai **kuning** dan diberi keterangan *(kamu)*.

Saat game ditutup dengan klik 2x (`file://`), tab **🌐 Semua Pemain**
otomatis menampilkan petunjuk cara menjalankan `server.js`, bukan error.

### 🌍 Papan peringkat di GitHub Pages (Google Sheets)

GitHub Pages itu **static hosting**: hanya menyajikan file HTML/CSS/JS.
`server.js` tidak pernah berjalan di sana, jadi tab **🌐 Semua Pemain**
akan menampilkan *"Tidak ada server papan peringkat di halaman ini"*.
Supaya skor tetap terkumpul, arahkan papan peringkat ke **Google
Sheets** lewat Apps Script — gratis, tanpa server, dan riwayatnya bisa
Anda buka kapan saja di Sheet.

1. Buka **https://script.google.com** → proyek baru, lalu tempel isi
   [`google-apps-script/Leaderboard.gs`](google-apps-script/Leaderboard.gs).
2. Klik **Run** → fungsi `setup` → izinkan akses (*Advanced → Go to
   project → Allow*). Skrip membuat spreadsheet **"Magic Math —
   Leaderboard"** sendiri. (Mau memakai spreadsheet milik Anda? Isi
   `SPREADSHEET_ID` di bagian atas skrip.)
3. **Deploy → New deployment → Type: Web app**
   - *Execute as*: **Me**
   - *Who has access*: **Anyone**
   - klik **Deploy**, salin URL yang berakhiran **`/exec`**.
4. Tempel URL itu di `assets/js/config.js`:

   ```js
   LEADERBOARD_API: 'https://script.google.com/macros/s/XXXX/exec',
   ```

5. Upload ulang ke GitHub Pages. Tab **🌐 Semua Pemain** kini membaca &
   menulis ke Sheet itu.

Catatan:

- Dengan `LEADERBOARD_API` diisi, versi lokal (Cara 1/2/3) juga memakai
  Google Sheets. Kosongkan lagi (`''`) untuk kembali ke `server.js`.
- Yang dikirim ke Sheets **hanya baris papan peringkat** (nama, bintang,
  level selesai, ketelitian, poin). Progres game tetap di perangkat
  (IndexedDB) dan tetap bisa diekspor seperti biasa.
- Skor tidak pernah turun: kalau baris pemain sudah ada, diambil nilai
  terbaik yang pernah tercatat — sama seperti `server.js`.
- Kalau tab masih bilang "server tidak bisa dihubungi", ulangi langkah 3
  (akses harus **Anyone**) dan pastikan URL berakhiran `/exec`.

### Bagaimana satu orang bisa lanjut di perangkat berbeda?

Tiap pemain punya **`uid`** pendek yang tetap (mis. `a7k3f9x2`). Identifier ini
dipakai sebagai kunci:

- **Slot simpanan di server** — `POST /api/state?slot=<uid>`. Jadi progres
  Budi tidak akan menimpa progres Sari meski dari perangkat yang sama.
- **Baris papan peringkat di server** — `POST /api/score`.

Kalau progres diekspor ke perangkat lain, seluruh profil ikut terbawa
(uid-nya ikut), jadi orang yang sama lanjut dari tempat yang sama.

### 🛡️ Pengaman data

Tarik otomatis dari server **tidak akan menimpa** kalau data itu membuat
pemain yang ada di perangkat ini hilang. Kalau ada pemain yang tidak ada di
data server tapi sudah punya bintang, tarikan dibatalkan dan muncul catatan di
konsol peramban (`[db] tarikan server dibatalkan: …`).

Artinya, menyalakan game di perangkat atau jaringan yang salah **tidak mungkin**
menghapus progres anak-anak di rumah. Pengaman ini sudah diuji dua arah: tarikan
berbahaya ditolak, tarikan yang aman tetap berjalan.

```
game/
├── index.html                 ← titik masuk, cukup klik 2x
├── Main Game.command          ← peluncur 2-klik untuk macOS (pakai server kalau ada)
├── Main Game.bat              ← peluncur 2-klik untuk Windows (samoa perlakuannya)
├── server.js                  ← server lokal opsional (Node.js, tanpa dependency)
├── package.json               ← hanya untuk `npm test` / `npm start`, tanpa dependency
├── google-apps-script/
│   └── Leaderboard.gs         ← backend papan peringkat untuk GitHub Pages (Google Sheets)
├── assets/
│   ├── css/style.css          ← seluruh tampilan
│   ├── js/
│   │   ├── i18n.js            ← dua bahasa (English default & Indonesia), dimuat paling awal
│   │   ├── config.js          ← pengaturan global + definisi 8 level TK, 20 level SD & 10 bab Petualangan
│   │   ├── utils.js           ← pembantu: acak, format angka, modal, toast
│   │   ├── art.js             ← 100+ ilustrasi SVG (digambar sendiri)
│   │   ├── audio.js           ← efek suara & musik (Web Audio, tanpa berkas)
│   │   ├── topics.js          ← 84 generator soal matematika
│   │   ├── db.js              ← lapisan database SQLite
│   │   ├── game.js            ← mesin permainan: skor, waktu, hati, lencana
│   │   ├── ui.js              ← tampilan layar & tombol
│   │   └── main.js            ← penyalaan aplikasi
│   └── vendor/
│       ├── sql-wasm.js        ← sql.js v1.13.0 (MIT)
│       └── sql-wasm-binary.js ← binary WebAssembly-nya (base64, agar jalan dari file://)
├── test/
│   ├── topics.test.js         ← uji ribuan soal (jawaban & ilustrasi)
│   ├── db.test.js             ← uji database SQLite & banyak pemain
│   ├── server.test.js         ← uji server.js, sinkronisasi, papan peringkat
│   ├── smoke.js               ← uji aplikasi di Chrome sungguhan
│   ├── env.js                 ← shim DOM biar bisa diuji tanpa browser
│   └── run-all.js             ← menjalankan semua uji sekaligus
├── data/                      ← dibuat otomatis (hanya untuk mode server)
│   ├── game.sqlite            ← cadangan progres + papan peringkat (SQLite di disk)
│   └── progress.bin           ← salinan file SQLite dari peramban
```

---

## 🗄️ Database (SQLite)

Database memakai **SQLite** lewat pustaka **sql.js** (versi 1.13.0, lisensi
MIT — SQLite (public domain)). Yang disimpan adalah **berkas `.sqlite`
sungguhan**, bukan karangan format sendiri.

### Cara penyimpanannya

| Lingkup | Lokasi | Keterangan |
|---|---|---|
| Mode file:// | `IndexedDB` (cadangan: `localStorage`) | berkas SQLite utuh disimpan di peramban |
| Mode server | `data/game.sqlite` | SQLite asli di disk |

Penyimpanan dipilih otomatis saat aplikasi dibuka: `IndexedDB` → `localStorage`
→ memori. Yang dipakai bisa dilihat di **⚙️ Pengaturan**. Kalau `IndexedDB`
macet, aplikasi otomatis pindah ke `localStorage` tanpa membuat halaman
menunggu.

### Isi tabel

| Tabel | Fungsi |
|---|---|
| `players` | Profil pemain: nama, avatar, **uid**, kelas 1–6, warna, waktu & kesulitan pribadi, opsi sembunyikan petunjuk, terakhir main |
| `level_progress` | Skor & bintang terbaik tiap level |
| `attempts` | Riwayat setiap permainan |
| `question_log` | Detail tiap soal: topik, jawaban, benar/salah, lama menjawab |
| `topic_stats` | Rekap jawaban benar per topik (untuk cari topik yang perlu dilatih) |
| `badges` | Lencana yang sudah didapat |
| `settings` | Pengaturan perangkat + **`active_player`** (pemain yang sedang dipakai) |

Semua tabel progress menunjuk `player_id`, jadi data seorang anak tidak pernah
salah masuk ke akun anak lain di perangkat yang sama. Database versi lama
selalu **dimigrasikan otomatis** saat dibuka (kolom baru ditambahkan lewat
`ALTER TABLE`), jadi tidak ada progres yang hilang saat game diperbarui.

Lihat isi database kapan saja:

```bash
sqlite3 data/game.sqlite "SELECT name, avatar, grade FROM players;"
sqlite3 data/game.sqlite "SELECT * FROM level_progress;"
sqlite3 data/game.sqlite "SELECT topic, SUM(correct), SUM(total) FROM topic_stats GROUP BY topic;"
sqlite3 data/game.sqlite "SELECT uid, name, stars FROM leaderboard ORDER BY stars DESC;"
```

### Ekspor & Impor Progres

Menu **⚙️ Pengaturan → 💾 Data**:

- **⬇️ Ekspor Progres** → mengunduh berkas `.json` (isi database dalam bentuk base64).
- **⬆️ Impor Progres** → memulihkan progres dari berkas tersebut.

Berguna kalau ingin memindahkan progres ke komputer atau HP lain. Karena yang
diekspor adalah **seluruh** database, semua profil pemain ikut terbawa —
termasuk `uid` masing-masing, supaya papan peringkat di server tidak terduplikasi.

### API server.js

Semua endpoint memakai `data/game.sqlite` sebagai tempat menyimpan.

| Method & jalur | Fungsi |
|---|---|
| `GET /api/info` | Informasi server: versi Node, apakah SQLite aktif, jumlah pemain di papan peringkat |
| `GET /api/state?slot=<uid>` | Tarik progres seorang pemain (404 kalau belum pernah disimpan) |
| `POST /api/state?slot=<uid>` | Simpan progres seorang pemain (juga bisa lewat header `X-MA-Player`) |
| `POST /api/score` | Kirim ringkasan pemain ke papan peringkat (JSON) |
| `GET /api/leaderboard?limit=&uid=` | Ambil papan peringkat; `uid` dipakai untuk ikut melaporkan posisi sendiri |

Contoh:

```bash
curl -X POST http://localhost:8080/api/score \
  -H 'Content-Type: application/json' \
  -d '{"uid":"a7k3f9x2","name":"Budi","grade":2,"stars":42,"cleared":14,
       "score":9800,"accuracy":0.91,"attempts":15}'

curl "http://localhost:8080/api/leaderboard?limit=10&uid=a7k3f9x2"
```

Semua nilai yang masuk **dibersihkan dan dipotong** diam-diam: `uid` hanya
boleh huruf/angka/garis (maks 40 karakter, jadi `../../etc/passwd` aman),
nama maksimum 24 karakter, kelas dikunci 1–6, dan akurasi dikunci 0–1. Rekor
bintang, level, dan skor tidak pernah turun kalau data dikirim ulang.

---

## 🧪 Menjalankan Uji

```bash
npm test                       # semua uji sekaligus

node test/topics.test.js 400   # 80.000 soal — cek jawaban & ilustrasi valid
node test/db.test.js           # database SQLite + banyak pemain
node test/server.test.js       # server.js, sinkronisasi, papan peringkat
node test/smoke.js             # jalankan game di Chrome sungguhan
```

| Berkas uji | Yang diperiksa |
|---|---|
| `topics.test.js` | Tiap soal: selalu tepat 4 pilihan berbeda, jawaban benar selalu ada di pilihan, teks & ilustrasi tidak rusak, tiap level menghasilkan 10 soal |
| `db.test.js` | 8 tabel, 20 level SD dimainkan penuh → 60 bintang, seluruh lencana, ekspor → reset → impor, hasil ekspor dibuka lagi dengan `node:sqlite`, **isolasi antar-pemain** (pemain baru mulai dari nol, tidak ada data yang bocor), hapus pemain tidak merusak pemain lain, pengaturan waktu per-pemain, urutan papan peringkat lokal, **probe papan peringkat (membedakan `file://`, GitHub Pages, `server.js` & Apps Script)**, **kirim & baca papan peringkat lewat `LEADERBOARD_API` (Google Sheets)**, **jalur TK terpisah dari SD walau nomor levelnya sama**, **jalur Petualangan (10 bab, cerita pembuka, progres terpisah)**, dan mode **waktu tanpa batas** |
| `server.test.js` | Server menyala, berkas statis tersaji, path traversal ditolak, progres terkirim & ditarik ulang, **slot simpanan terpisah per pemain**, papan peringkat terurut benar, rekor tidak pernah turun saat data dikirim ulang, dan uid berbahaya dibersihkan |
| `smoke.js` | Menjalankan `index.html` di Chrome headless lewat DevTools Protocol pada dua mode (server `server.js` sungguhan & `file://`): tidak ada error, database siap, 20 kartu level SD & 8 kartu level TK muncul, satu level bisa dimainkan sampai selesai lewat klik UI, bintang bertambah, tujuh layar terbuka bersih, **tambah pemain lewat UI benar-benar memisahkan progres**, papan peringkat daring benar-benar terisi dari server, pengaturan tersimpan, **tab jalur TK berfungsi tanpa mengubah bintang SD**, **tab jalur Petualangan menampilkan peta jelajah berisi 10 simpul bab + cerita pembuka tanpa mengubah bintang TK/SD**, **timer tanpa batas menampilkan ∞**, waktu habis mengurangi hati, dan **ganti bahasa 🌐 (English → Bahasa Indonesia, pilihan tersimpan, halaman dimuat ulang bersih)** |
| `shot.js` | *Utilitas dev (bukan uji)* — mengambil screenshot Peta Petualangan di Chrome headless: `node test/shot.js keluaran.png [lebar] [tinggi]` |

Butuh Node.js 22 ke atas. `npm install` tidak perlu dijalankan — tidak ada
dependency.

---

## 🧪 Daftar Topik Soal

**Level TK (1–8)** memakai **15 jenis soal** khusus anak usia 4–6, semuanya
bergambar agar bisa dikerjakan tanpa membaca lancar: menghitung benda, kenal
angka, urutan angka, membandingkan, besar/kecil & panjang/pendek, pola bentuk
dan warna, bentuk, warna, mengelompokkan, tambah/kurang visual, membaca jam
bulat, uang koin, bagi rata, dan soal cerita "siapa yang lebih banyak".

**Bab Petualangan (1–10)** memakai ulang soal-soal jalur TK & SD yang diurutkan
menaik, dibalut cerita perjalanan: menghitung & membandingkan di **Desa Damai**,
pola bilangan di **Hutan Terlarang**, garis bilangan & urutan di **Sungai
Derau**, uang & jam di **Gua Harta Karun**, perkalian di **Menara Angka**,
pembagian & soal cerita di **Padang Pasir**, nilai tempat & tabel perkalian di
**Desa Nelayan**, pecahan & bangun datar di **Gunung Salju**, persen/desimal/
rata-rata di **Istana Awan**, dan campuran aljabar + soal cerita langkah banyak
di **Sarang Naga**. Setiap bab dibuka dengan jendela cerita pendek.

**Level SD 1–20** memakai **69 jenis soal** yang dipilih acak per level:

**Kelas 1–2** — menghitung, penjumlahan & pengurangan sampai 20, angka hilang,
pola bilangan, mengurutkan bilangan, ganjil/genap, penjumlahan tiga bilangan,
penjumlahan/pengurangan sampai 100, pembulatan, angka romawi, membaca jam,
selisih waktu, dan menghitung uang.

**Kelas 3–4** — perkalian 2/3/4/5, tabel perkalian (termasuk faktor yang
hilang), pembagian (termasuk pembagian bersisa), dobel & separuh, pecahan
sederhana, soal cerita, uang kembalian, bilangan tiga digit, nilai tempat
(bentuk penjumlahan), dan keliling & luas.

**Kelas 5–6** — pecahan (termasuk bagian yang tidak diwarnai), perbandingan
pecahan, sudut, volume, bilangan desimal (termasuk membandingkan & mengurutkan
desimal), persen, bilangan bulat, urutan operasi, perbandingan, konversi
satuan, rata-rata (termasuk mencari bilangan dari rata-rata), aljabar, faktor
prima, FPB/LCM, nama bangun datar, dan mencari sisi yang hilang.

**Tantangan** — kecepatan & jarak, selisih waktu, penjumlahan pecahan, kuadrat
& akar kuadrat, luas segitiga, luas bangun majemuk, soal cerita langkah
banyak, dan campuran semua topik di level 19–20.

---

## 📜 Lisensi & Kredit

| Komponen | Lisensi |
|---|---|
| Kode game ini | Bebas dipakai & diubah |
| [sql.js](https://github.com/sql-js/sql.js) v1.13.0 | MIT |
| SQLite | Public Domain |
| Ilustrasi SVG | Dibuat khusus untuk game ini |
| Efek suara & musik | Dibuat dengan Web Audio API (tidak ada berkas audio) |

Tidak ada gambar, font, atau audio yang diambil dari internet — semuanya dibuat
sendiri, jadi bebas masalah hak cipta.

---

## 💡 Catatan Teknis

- **Tanpa build step.** Kode HTML/CSS/JS langsung dipakai apa adanya, supaya
  mudah dibuka dan mudah diedit.
- **Tanpa framework.** Supaya ringan, cepat, dan tidak perlu `npm install`.
- **Hanya satu pustaka pihak ketiga** (sql.js), sudah disertakan di dalam
  folder — tidak perlu mengunduh apa-apa saat menjalankan.
- Binary WebAssembly-nya ditanam sebagai base64 supaya SQLite tetap bisa dibuka
  dari protokol `file://` yang biasanya melarang pembacaan berkas.
- Skrip sengaja ditulis gaya klasik (bukan ES module) karena modul di browser
  diblokir saat halaman dibuka lewat `file://`.
- Migrasi database dijamin aman: `CREATE TABLE IF NOT EXISTS` tidak menambah
  kolom ke tabel lama, jadi kolom baru ditambahkan lewat `PRAGMA table_info`
  + `ALTER TABLE` setiap kali database dibuka.
- Mendukung HP & tablet, mode landscape, dan `prefers-reduced-motion`.
