# Sistem Perhitungan PPh Pasal 21 — Tahun 2026

Aplikasi web untuk menghitung, menyimpan, dan merekap **PPh Pasal 21/26** pegawai
dengan metode **Tarif Efektif Rata-rata (TER)** bulanan (PP 58/2023) dan penghitungan
ulang **Pasal 17 (UU HPP)** secara tahunan.

Struktur & logikanya diadaptasi langsung dari workbook
*"PERHITUNGAN PPH PASAL 21 TAHUN 2026"* — seluruh sheet acuan (T-PTKP, TER A/B/C,
ELEMEN PPh 21, KALKULATOR, sheet bulanan JAN–DES, TAHUNAN, SUMMARY) dijadikan dasar
perhitungan dan skema database.

## Arsitektur

```
┌──────────────────────┐      GET ?action=...       ┌──────────────────────────┐
│  Frontend (GitHub     │  ───────────────────────▶  │  Google Apps Script        │
│  Pages) HTML/CSS/JS   │  ◀───────────────────────  │  (Web App, doGet)          │
└──────────────────────┘        JSON response        └────────────┬─────────────┘
                                                                    │
                                                      ┌─────────────▼─────────────┐
                                                      │  Google Sheets = DATABASE  │
                                                      │  Pegawai · Pajak · Ref_*   │
                                                      └────────────────────────────┘
```

Semua request memakai **GET** (parameter `action` + `payload`) agar bebas dari CORS
preflight — pola yang sama dengan proyek sebelumnya yang di-deploy di GitHub Pages.

## Fitur

- **Dasbor** — ringkasan bruto, PPh terutang, jumlah pegawai, grafik per masa & komposisi TER.
- **Kalkulator** — input penghasilan teratur/tidak teratur, premi BPJS, hitung TER otomatis + terbilang.
- **Pegawai** — master data (CRUD) dengan identitas perpajakan & status PTKP.
- **Data Pajak** — baris perhitungan per pegawai per masa (mirror sheet bulanan), ekspor CSV.
- **Tahunan** — penyetahunan, biaya jabatan, PTKP, PKP, dan selisih kurang/lebih potong.
- **Referensi** — tabel PTKP, pemetaan TER, dan seluruh bracket TER A/B/C.
- **Pengaturan** — identitas perusahaan & pemotong.
- **Mode demo** — jalankan tanpa server (data di `localStorage`) untuk uji coba.

## Cara deploy

### 1. Backend (Google Apps Script)

1. Buat Google Spreadsheet baru (ini akan jadi database).
2. `Ekstensi → Apps Script`, hapus isi default, tempel seluruh isi `backend/Code.gs`.
3. `Deploy → New deployment → Web app`:
   - **Execute as:** Me
   - **Who has access:** Anyone
4. Salin **Web app URL** (berakhiran `/exec`).
5. Buka URL `…/exec?action=bootstrap` sekali di browser untuk membuat semua sheet & data referensi.

### 2. Frontend (GitHub Pages)

1. Push folder ini ke repo GitHub.
2. `Settings → Pages → Source: main branch / root`.
3. Buka URL Pages. Pada layar Setup, tempel **Web app URL** lalu klik **Sambungkan**.
   - Alternatif: isi `API_URL` di `config.js` agar tersambung otomatis.

## Catatan perhitungan

- **Bruto sebulan** = gaji + tunjangan PPh + tunjangan lain/lembur + honorarium + bonus/THR + natura + premi (JKK+JKM+Kesehatan yang dibayar pemberi kerja).
- **PPh sebulan** = bruto × TER. Kategori TER dipilih dari status PTKP
  (TK/0–TK/1 & K/0 → A; TK/2–TK/3, K/1–K/2 → B; K/3 & K/I/* → C).
- **Tahunan**: biaya jabatan 5% (maks Rp6.000.000/thn), kurangi iuran pensiun/JHT & zakat,
  kurangi PTKP, lalu kenakan tarif progresif Pasal 17 (5/15/25/30/35%).

> Aplikasi ini alat bantu hitung; pastikan angka final divalidasi sesuai ketentuan DJP yang berlaku.
