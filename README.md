# Aplikasi PPh Pasal 21 (TER — PP 58/2023)

Web app perhitungan PPh Pasal 21 dengan **Google Apps Script + Google Sheets sebagai database**, frontend HTML/JS untuk **GitHub Pages**.

## Fitur
- **Kalkulator PPh 21** per karyawan (TER bulanan, Desember/Pasal 17, tahunan)
- **CRUD Data Karyawan** (nama, NIK, NPWP, status PTKP, dll.)
- **Rekap Bulanan** dengan total per periode
- **Summary Tahunan** (matriks PPh per bulan per karyawan)
- **Cetak/Ekspor Bukti Potong** (print → PDF)

Database tersimpan di Google Sheets: `DB_KARYAWAN`, `DB_PERHITUNGAN`, `REF_PTKP`, `REF_TER`.

---

## Cara Deploy

### 1. Backend (Google Apps Script)
1. Buka [sheets.new](https://sheets.new) untuk membuat Spreadsheet baru.
2. Menu **Extensions → Apps Script**.
3. Hapus isi default, **tempel seluruh isi `Code.gs`**, lalu Save.
4. Pilih fungsi **`setup`** di dropdown, klik **Run** (izinkan akses saat diminta).
   Ini otomatis membuat semua sheet + tabel referensi PTKP & TER.
5. Klik **Deploy → New deployment → Web app**:
   - **Execute as:** Me
   - **Who has access:** Anyone
6. Salin **Web app URL** (berakhiran `/exec`).

> Setiap kali mengubah `Code.gs`, lakukan **Deploy → Manage deployments → Edit → New version**.

### 2. Frontend (GitHub Pages)
1. Buka `config.js`, ganti `API_URL` dengan URL `/exec` dari langkah di atas.
2. Push folder ini ke repo GitHub.
3. **Settings → Pages → Source: branch `main` / root**.
4. Buka URL GitHub Pages — aplikasi siap dipakai.

---

## Catatan Teknis
- Komunikasi memakai **JSONP (GET-only)** agar bebas masalah **CORS** dari GitHub Pages ke Apps Script.
- Tabel TER & PTKP digandakan di backend (`Code.gs`) dan frontend (`calc.js`) — perhitungan dilakukan di sisi klien, backend murni penyimpanan.
- Karyawan tanpa NPWP otomatis dikenakan tarif **+20%**.
- Desember memakai **tarif Pasal 17** dengan biaya jabatan 5% (maks Rp6.000.000/tahun) dikurangi PPh yang sudah dipotong Jan–Nov.

## Struktur File
```
index.html   — UI
config.js    — konfigurasi API_URL
calc.js      — mesin perhitungan (TER, PTKP, Pasal 17)
api.js       — JSONP client
app.js       — logika aplikasi & render
Code.gs      — backend Apps Script (taruh di editor Apps Script, bukan di GitHub Pages)
```
