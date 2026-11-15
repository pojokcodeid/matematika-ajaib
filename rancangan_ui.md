# 22. Visual Design System & UI/UX Specification

## 22.1 Konsep Desain

Menggunakan konsep **Fantasy Learning Adventure**.

Karakteristik desain:
- Colorful cartoon illustration.
- Fantasy adventure environment.
- Rounded UI components.
- Soft shadows dan gradient.
- Friendly character illustrations.
- Animated feedback.
- Playful typography.
- Responsive layout.

Tujuan desain adalah membuat game terasa seperti petualangan, bukan aplikasi ujian matematika.

## 22.2 Color Palette

| Penggunaan | Warna |
|---|---|
| Primary | #2864C5 |
| Secondary | #42B7E9 |
| Success | #4CAF50 |
| Warning | #FFC83D |
| Danger | #F05D68 |
| Background | #EAF6FF |
| Card | #FFFFFF |
| Text | #24345B |
| Locked | #929BA8 |

## 22.3 Typography

- Heading: font rounded dan playful.
- Body: font sans-serif yang mudah dibaca.
- Question: ukuran besar dan tebal.
- Button: bold dan kontras.

## 22.4 Main Menu

Komponen:
- Logo Matematika Ajaib.
- Profil pemain.
- Total bintang.
- Total coins.
- Tombol pengaturan.
- Pilihan Preschool.
- Pilihan Elementary.
- Pilihan Math Adventure.

## 22.5 Adventure Map

Komponen:
- Background dunia fantasi.
- Jalur perjalanan.
- Node level.
- Ikon gembok.
- Bintang pencapaian.
- Karakter pemain.
- Peti reward.
- Indikator progres.

Status node:
- Locked.
- Available.
- Completed.
- Perfect.

## 22.6 Level Detail

Komponen:
- Ilustrasi lokasi.
- Nama bab dan level.
- Materi pembelajaran.
- Deskripsi misi.
- Jumlah soal.
- Target pencapaian.
- Reward.
- Tombol Mulai.

## 22.7 Gameplay Screen

Komponen:
- Karakter/avatar.
- Heart indicator.
- Timer.
- Nomor soal.
- Progress bar.
- Pertanyaan matematika.
- Empat pilihan jawaban.
- Hint.
- Pause button.

Pertanyaan menjadi elemen visual utama dan harus mudah dibaca.

## 22.8 Answer Feedback

Jawaban benar:
- Animasi bintang.
- Efek suara positif.
- Penambahan skor.
- Combo multiplier.
- Pesan motivasi.

Jawaban salah:
- Animasi ringan.
- Penjelasan jawaban.
- Pengurangan heart.
- Kesempatan melanjutkan selama heart tersedia.

## 22.9 Result Screen

Komponen:
- Ilustrasi trophy.
- Total skor.
- Jumlah bintang.
- Akurasi.
- Waktu pengerjaan.
- Coins yang diperoleh.
- Achievement.
- Tombol Ulangi.
- Tombol Lanjut.

## 22.10 Visual Interaction

- Tombol memiliki hover dan pressed state.
- Node level memiliki animasi ketika dibuka.
- Reward menggunakan animasi sederhana.
- Transisi antarhalaman menggunakan fade atau slide.
- Feedback jawaban ditampilkan secara langsung.
- Animasi tidak boleh menghambat proses menjawab soal.

## 22.11 Responsive Design

Desktop:
- Peta dan detail level dapat ditampilkan berdampingan.
- Gameplay menggunakan layout terpusat.

Tablet:
- Layout menyesuaikan lebar layar.
- Navigasi tetap mudah dijangkau.

Mobile:
- Layout satu kolom.
- Tombol jawaban besar.
- Peta dapat di-scroll.
- HUD tidak menutupi soal.

## 22.12 UX Principles

1. Pemain harus mengetahui apa yang harus dilakukan tanpa membaca instruksi panjang.
2. Soal harus menjadi fokus utama saat gameplay.
3. Status level harus mudah dibedakan.
4. Reward harus terasa menyenangkan.
5. Warna tidak menjadi satu-satunya indikator status.
6. Hindari animasi berlebihan.
7. Seluruh interaksi harus nyaman untuk anak-anak.