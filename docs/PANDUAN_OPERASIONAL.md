# Panduan Operasional Hotel Larasati

Dokumen ini menjelaskan alur kerja harian dari tamu datang sampai tamu meninggalkan hotel. Nama menu mengikuti tampilan aplikasi saat ini. Aplikasi dapat digunakan dalam bahasa Indonesia atau Inggris melalui pemilih bahasa di kanan atas.

## 1. Persiapan sebelum operasional

Sebelum menerima tamu, pastikan:

1. Tipe kamar dan nomor kamar sudah dibuat di **Hotel operations → Rooms**.
2. Kamar yang siap dijual berstatus **AVAILABLE** atau **INSPECTED**.
3. Data hotel, mata uang, pajak, service charge, dan prefix nomor reservasi sudah benar di **Management → Settings**.
4. Staf sudah dibuat dan diaktifkan di **Management → Users**.
5. Kamar yang masih kotor atau bermasalah sudah ditangani melalui menu **Housekeeping** atau **Maintenance**.

## 2. Membuat reservasi

Reservasi dapat dibuat sebelum tamu datang atau saat tamu datang langsung.

1. Buka **Front office → Reservations**.
2. Pilih **New reservation**.
3. Pilih tamu yang sudah ada. Jika belum ada, buka **Guests → Guest list → Add guest**, isi data tamu, lalu simpan.
4. Pilih tipe kamar, tanggal check-in dan check-out, jumlah dewasa dan anak.
5. Pilih sumber reservasi, misalnya walk-in, phone, WhatsApp, direct, OTA, atau travel agent.
6. Periksa kamar yang tersedia.
7. Pilih nomor kamar yang diinginkan.
8. Masukkan permintaan khusus atau catatan jika diperlukan.
9. Periksa harga kamar, diskon, service charge, pajak, dan total.
10. Simpan sebagai **PENDING** atau **CONFIRMED**.

Diskon yang mengubah harga awal memerlukan hak manager untuk front office. Harga yang sudah tersimpan menjadi dasar tagihan tamu.

## 3. Kedatangan tamu dan check-in

Saat tamu tiba:

1. Buka **Front office → Check-in** atau buka detail reservasi dari **Reservations**.
2. Cari nomor reservasi atau nama tamu.
3. Pastikan status reservasi **CONFIRMED**.
4. Verifikasi identitas dan data tamu.
5. Pastikan kamar berstatus **AVAILABLE** atau **INSPECTED**.
6. Klik **Check in**.
7. Setelah berhasil, status reservasi berubah menjadi **CHECKED_IN**, kamar menjadi **OCCUPIED**, dan folio/tagihan tamu dibuat otomatis.
8. Untuk melihat tamu yang sedang menginap, buka **Front office → In-house guests**.

Tamu tidak dapat check-in sebelum tanggal kedatangan atau pada tanggal check-out. Reservasi harus dikonfirmasi terlebih dahulu.

## 4. Selama tamu menginap

### Melihat detail tamu

1. Buka **Front office → In-house guests**.
2. Pilih **View reservation**.
3. Dari halaman tersebut, buka **Open guest bill** untuk melihat folio.

### Menambahkan biaya tambahan

Gunakan biaya tambahan untuk laundry, restoran, minibar, transportasi, atau layanan lain.

1. Buka **Finance → Folios/Billing**.
2. Buka folio tamu.
3. Pilih **Add extra**.
4. Isi deskripsi, jumlah, dan harga satuan.
5. Simpan.
6. Total folio akan bertambah otomatis.

Biaya tambahan yang sudah dibayar tidak dapat dihapus sembarangan. Pembatalan biaya membutuhkan alasan dan hak manager.

### Menerima pembayaran sebelum check-out

1. Buka folio tamu.
2. Pilih **Record payment**.
3. Isi jumlah pembayaran dan metode: cash, bank transfer, card, atau QRIS.
4. Isi referensi transaksi untuk metode non-tunai.
5. Simpan pembayaran.
6. Pastikan nilai **Balance** berkurang.

Pembayaran yang sama dapat dikirim ulang dengan request ID yang sama tanpa membuat transaksi ganda. Pembalikan pembayaran hanya dapat dilakukan oleh owner atau manager.

### Memindahkan tamu ke kamar lain

Perpindahan kamar hanya dapat dilakukan untuk tamu berstatus **CHECKED_IN** dan kamar tujuan harus aktif, siap, tidak sedang ditempati, serta memiliki tipe kamar yang sama.

1. Buka detail reservasi tamu atau **Front office → In-house guests**.
2. Klik **Move room**.
3. Pilih nomor kamar tujuan.
4. Masukkan alasan perpindahan, minimal tiga karakter.
5. Klik **Confirm move**.
6. Sistem memindahkan stay dan reservasi ke kamar baru.
7. Kamar lama berubah menjadi **DIRTY** dan masuk antrean housekeeping.
8. Kamar baru berubah menjadi **OCCUPIED**.

Jika tombol tidak muncul, tidak ada kamar aktif yang tersedia dengan tipe yang sama. Jika perlu upgrade atau downgrade tipe kamar, lakukan kebijakan manual sesuai prosedur hotel karena alur saat ini hanya mengizinkan tipe yang sama.

## 5. Housekeeping

### Menangani kamar kotor

1. Buka **Hotel operations → Housekeeping**.
2. Pilih task kamar.
3. Jika belum ada petugas, gunakan **Assign** untuk menugaskan staf housekeeping.
4. Staf yang ditugaskan menjalankan urutan:
   - **DIRTY → CLEANING** saat mulai bekerja.
   - **CLEANING → CLEAN** setelah kamar selesai dibersihkan.
   - **CLEAN → INSPECTED** setelah pemeriksaan.
   - **INSPECTED → AVAILABLE** saat kamar siap dijual.
5. Tambahkan catatan bila ada masalah atau kebutuhan khusus.

Staf housekeeping hanya dapat mengubah status kebersihan dan tidak dapat mengubah nomor kamar, tipe kamar, atau konfigurasi kamar.

## 6. Maintenance atau kerusakan kamar

Jika ada kerusakan:

1. Buka **Hotel operations → Maintenance**.
2. Pilih **Create report**.
3. Pilih kamar.
4. Isi judul, deskripsi, dan prioritas.
5. Simpan laporan.
6. Owner atau manager menugaskan laporan kepada staf yang tersedia.
7. Petugas memilih **Start**, menambahkan catatan jika perlu, lalu memilih **Complete** setelah perbaikan selesai.
8. Gunakan **Cancel** hanya jika laporan tidak lagi diperlukan dan isi alasannya.

## 7. Check-out tamu

Check-out hanya dapat dilakukan jika folio sudah lunas.

1. Buka **Front office → Check-out** atau buka folio dari detail reservasi.
2. Periksa rincian kamar, biaya tambahan, pembayaran, dan **Balance**.
3. Jika masih ada saldo, gunakan **Record payment**.
4. Setelah saldo menjadi nol, klik **Check out**.
5. Sistem akan:
   - menutup folio,
   - mengubah reservasi menjadi **CHECKED_OUT**,
   - mencatat waktu dan petugas check-out,
   - mengubah kamar menjadi **DIRTY**.
6. Cetak atau simpan invoice melalui **Print folio** jika diperlukan.

Setelah itu housekeeping harus memproses kamar sampai statusnya **AVAILABLE** atau **INSPECTED** kembali.

## 8. Laporan dan rekonsiliasi

Gunakan menu **Reports** untuk memeriksa operasional:

- **Occupancy report**: okupansi, kedatangan, dan keberangkatan.
- **Revenue report**: total tagihan kamar, diskon, service charge, pajak, dan biaya tambahan.
- **Financial report**: penerimaan, pembalikan, pengeluaran, saldo tagihan terbuka, dan arus kas bersih.
- **Payment report**: penerimaan berdasarkan mata uang dan metode pembayaran.
- **Expense summary**: pengeluaran berdasarkan kategori dan mata uang.

Untuk mencatat pengeluaran:

1. Buka **Finance → Expenses**.
2. Pilih **Add expense**.
3. Isi tanggal, kategori, jumlah, mata uang, metode, deskripsi, dan referensi.
4. Simpan.

Pengeluaran yang salah dapat di-void oleh owner atau manager dengan alasan yang jelas.

## 9. Audit log

Owner dan manager dapat membuka **Reports → Audit log** untuk melihat aktivitas penting seperti perubahan reservasi, pembayaran, housekeeping, maintenance, staff, settings, dan pengeluaran.

Gunakan filter tanggal, modul, dan actor untuk menemukan aktivitas tertentu. Audit log bersifat baca saja dan tidak dapat dihapus dari aplikasi.

## 10. Status utama

### Reservasi

`PENDING → CONFIRMED → CHECKED_IN → CHECKED_OUT`

Reservasi dapat berakhir sebagai `CANCELLED` atau `NO_SHOW` sesuai kondisi.

### Kamar

Status operasional yang umum:

- `AVAILABLE`: siap dijual.
- `RESERVED`: memiliki reservasi.
- `OCCUPIED`: sedang ditempati.
- `DIRTY`: perlu dibersihkan.
- `CLEANING`: sedang dibersihkan.
- `CLEAN`: sudah dibersihkan.
- `INSPECTED`: sudah diperiksa dan siap disetujui.
- `OUT_OF_ORDER` atau `MAINTENANCE`: tidak dapat dijual.

## 11. Penanganan masalah umum

- **Kamar tidak muncul saat reservasi**: periksa tipe kamar aktif dan status kamar `AVAILABLE`/`INSPECTED`.
- **Tombol Move room tidak muncul**: pastikan ada kamar lain yang aktif, siap, dan bertipe sama.
- **Check-out ditolak**: periksa saldo folio; saldo harus nol.
- **Pembayaran ditolak**: pastikan jumlah memakai maksimal dua angka desimal dan referensi diisi untuk pembayaran non-tunai.
- **Task housekeeping tidak dapat dilanjutkan**: pastikan petugas sudah mengambil atau ditugaskan pada task tersebut dan gunakan urutan status yang benar.
- **Data terlihat tidak berubah**: refresh halaman dan periksa apakah versi data sudah berubah karena sistem memakai optimistic locking untuk mencegah perubahan yang saling menimpa.

