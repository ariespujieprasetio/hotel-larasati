export type Locale = "id" | "en";
export const localeCookie = "larasati-language";
export function parseLocale(value: unknown): Locale {
  return value === "en" ? "en" : "id";
}

// English source messages are stable keys. User-entered records never pass through this catalog.
export const indonesian: Record<string, string> = {
  Overview: "Ringkasan",
  Dashboard: "Dasbor",
  Workspace: "Ruang kerja",
  "Front office": "Resepsionis",
  "Hotel operations": "Operasional hotel",
  Guests: "Tamu",
  Finance: "Keuangan",
  Reports: "Laporan",
  Management: "Manajemen",
  Reservations: "Reservasi",
  "Check-in": "Check-in",
  "Check-out": "Check-out",
  "In-house guests": "Tamu menginap",
  Rooms: "Kamar",
  Housekeeping: "Tata graha",
  Maintenance: "Pemeliharaan",
  "Guest list": "Daftar tamu",
  "Folios / Billing": "Tagihan",
  Payments: "Pembayaran",
  Expenses: "Pengeluaran",
  Occupancy: "Okupansi",
  Revenue: "Pendapatan",
  "Payment report": "Laporan pembayaran",
  "Financial reports": "Laporan keuangan",
  Users: "Pengguna",
  Settings: "Pengaturan",
  "Audit logs": "Log audit",
  "Hotel workspace": "Ruang kerja hotel",
  "Thoughtful hospitality, every day.": "Pelayanan sepenuh hati, setiap hari.",
  "Hotel navigation": "Navigasi hotel",
  "Open navigation": "Buka navigasi",
  "Main navigation": "Navigasi utama",
  "Sign out": "Keluar",
  "Skip to content": "Langsung ke konten",
  Close: "Tutup",
  Soon: "Segera hadir",
  "HOTEL MANAGEMENT": "MANAJEMEN HOTEL",
  "HOTEL LARASATI": "HOTEL LARASATI",
  "HOSPITALITY, MADE PERSONAL": "PELAYANAN SEPENUH HATI",
  "THE ART OF HOSPITALITY": "SENI MELAYANI TAMU",
  "Exceptional stays.": "Pengalaman menginap istimewa.",
  "Thoughtfully managed.": "Dikelola sepenuh hati.",
  "The details behind every warm welcome. One quiet place to care for your guests, your rooms, and your team.":
    "Perhatian di balik setiap sambutan hangat. Satu tempat untuk mengelola tamu, kamar, dan tim Anda.",
  "Hotel Larasati · Staff workspace": "Hotel Larasati · Ruang kerja staf",
  "Welcome back": "Selamat datang kembali",
  "Welcome back,": "Selamat datang kembali,",
  "Sign in with your staff account to continue.":
    "Masuk dengan akun staf untuk melanjutkan.",
  "Email address": "Alamat email",
  Password: "Kata sandi",
  "Sign in": "Masuk",
  "Signing in…": "Sedang masuk…",
  "Need access? Contact your hotel administrator.":
    "Butuh akses? Hubungi administrator hotel.",
  "Authorized hotel staff only": "Khusus staf hotel yang berwenang",
  "Setup required": "Pengaturan diperlukan",
  "Connect Supabase to enable staff sign-in. Your administrator can follow the project README.":
    "Hubungkan Supabase agar staf dapat masuk. Administrator dapat mengikuti README proyek.",
  "/ Daily overview": "/ Ringkasan harian",
  "A little clarity for a well-run day.":
    "Ringkasan operasional untuk menjalani hari dengan lancar.",
  Refresh: "Muat ulang",
  "New reservation": "Reservasi baru",
  Updated: "Diperbarui",
  "Occupied rooms": "Kamar terisi",
  "Ready rooms": "Kamar siap",
  "Today's arrivals": "Kedatangan hari ini",
  "Today's departures": "Keberangkatan hari ini",
  "Open housekeeping jobs": "Tugas tata graha aktif",
  "Room occupancy": "Okupansi kamar",
  "A view of your property": "Kondisi hotel Anda",
  "active rooms occupied": "kamar aktif terisi",
  "ready to welcome guests": "siap menerima tamu",
  blocked: "diblokir",
  "Room board": "Papan kamar",
  "Your next steps": "Langkah berikutnya",
  "Keep the day moving": "Jaga kelancaran operasional",
  "Arrivals waiting": "Menunggu kedatangan",
  "Departures due / overdue": "Keberangkatan hari ini / terlambat",
  "Unassigned cleaning jobs": "Tugas kebersihan tanpa petugas",
  "Today's recorded payments": "Pembayaran tercatat hari ini",
  "Recorded receipts and reversals for today, grouped by currency.":
    "Penerimaan dan pembatalan pembayaran hari ini, menurut mata uang.",
  "No payments recorded yet today. Receipts will appear here as your team records them.":
    "Belum ada pembayaran hari ini. Penerimaan akan tampil setelah dicatat oleh tim.",
  "Property essentials": "Informasi hotel",
  "Current property configuration": "Pengaturan hotel saat ini",
  "Occupancy uses all active rooms, including rooms under maintenance. Arrivals exclude cancelled and no-show bookings. Departures include checked-in and checked-out bookings scheduled for today. Only data allowed for your role is shown.":
    "Okupansi mencakup seluruh kamar aktif, termasuk kamar dalam pemeliharaan. Kedatangan tidak mencakup reservasi batal atau tamu tidak datang. Keberangkatan mencakup tamu check-in dan check-out yang dijadwalkan hari ini. Data ditampilkan sesuai hak akses Anda.",
  Add: "Tambah",
  Edit: "Ubah",
  Cancel: "Batal",
  Save: "Simpan",
  Search: "Cari",
  "Search by": "Cari berdasarkan",
  "Search by name": "Cari berdasarkan nama",
  Filter: "Filter",
  "Apply filters": "Terapkan filter",
  Reset: "Atur ulang",
  "Sort by": "Urutkan berdasarkan",
  View: "Tampilan",
  Table: "Tabel",
  Previous: "Sebelumnya",
  Next: "Berikutnya",
  Page: "Halaman",
  of: "dari",
  From: "Dari",
  Through: "Sampai",
  through: "sampai",
  to: "ke",
  All: "Semua",
  "All statuses": "Semua status",
  Active: "Aktif",
  Inactive: "Nonaktif",
  Open: "Terbuka",
  Closed: "Ditutup",
  Cancelled: "Dibatalkan",
  Confirmed: "Dikonfirmasi",
  Pending: "Menunggu",
  "No-show": "Tidak datang",
  Status: "Status",
  Action: "Tindakan",
  Name: "Nama",
  Description: "Deskripsi",
  Notes: "Catatan",
  Reason: "Alasan",
  "Reason:": "Alasan:",
  Category: "Kategori",
  Priority: "Prioritas",
  Date: "Tanggal",
  "Date (WIB)": "Tanggal (WIB)",
  "Newest first": "Terbaru",
  "Recently updated": "Terakhir diperbarui",
  Latest: "Terbaru",
  "Not recorded": "Belum dicatat",
  "Try again": "Coba lagi",
  Access: "Akses",
  "Access restricted": "Akses dibatasi",
  "Return to sign in": "Kembali ke halaman masuk",
  "Staff access required": "Akses staf diperlukan",
  "Your staff profile is missing or inactive. Ask your hotel administrator to activate your account.":
    "Profil staf Anda belum tersedia atau nonaktif. Minta administrator hotel mengaktifkan akun Anda.",
  Room: "Kamar",
  "Room number": "Nomor kamar",
  "Room type": "Tipe kamar",
  "Room types": "Tipe kamar",
  "Room readiness": "Kesiapan kamar",
  "Room assignment": "Penempatan kamar",
  Floor: "Lantai",
  Inventory: "Inventaris",
  "Add room": "Tambah kamar",
  "Add room type": "Tambah tipe kamar",
  "Edit room": "Ubah kamar",
  "Edit room type": "Ubah tipe kamar",
  "Edit type": "Ubah tipe",
  "Active room": "Kamar aktif",
  "Active room type": "Tipe kamar aktif",
  "All rooms": "Semua kamar",
  "All room types": "Semua tipe kamar",
  "All types": "Semua tipe",
  "Back to rooms": "Kembali ke kamar",
  "View room": "Lihat kamar",
  Type: "Tipe",
  "Type name": "Nama tipe",
  "Base price": "Harga dasar",
  Capacity: "Kapasitas",
  "Bed type": "Jenis tempat tidur",
  "Size (m²)": "Luas (m²)",
  Amenities: "Fasilitas",
  "Amenities (comma separated)": "Fasilitas (pisahkan dengan koma)",
  "New status": "Status baru",
  "Change status": "Ubah status",
  "Room type saved successfully.": "Tipe kamar berhasil disimpan.",
  "Changes saved successfully.": "Perubahan berhasil disimpan.",
  "Every room, ready for its next chapter. Manage inventory and readiness.":
    "Kelola inventaris dan kesiapan setiap kamar untuk tamu berikutnya.",
  "No rooms found": "Tidak ada kamar",
  "Adjust your filters, or add a room type and your first room.":
    "Sesuaikan filter, atau tambahkan tipe kamar dan kamar pertama Anda.",
  "No room types found. Add your first room type or adjust the filters.":
    "Tidak ada tipe kamar. Tambahkan tipe kamar pertama atau sesuaikan filter.",
  "Create an active room type before adding a room.":
    "Buat tipe kamar aktif sebelum menambahkan kamar.",
  "New rooms start as Available. Status changes are recorded separately on the room detail page.":
    "Kamar baru berstatus Tersedia. Perubahan status dicatat melalui halaman detail kamar.",
  "No manual status changes available for this room and role.":
    "Tidak ada perubahan status manual untuk kamar dan peran ini.",
  "Rooms matching the selected filters": "Kamar sesuai filter",
  "matching rooms · Page": "kamar sesuai filter · Halaman",
  "room types · Sorted by name": "tipe kamar · Diurutkan berdasarkan nama",
  "· Floor": "· Lantai",
  "· max": "· maks.",
  "/ night": "/ malam",
  Guest: "Tamu",
  "Guest code": "Kode tamu",
  "Full name": "Nama lengkap",
  "Personal information": "Informasi pribadi",
  "Identity type": "Jenis identitas",
  "Identity number": "Nomor identitas",
  Nationality: "Kewarganegaraan",
  Gender: "Jenis kelamin",
  "Date of birth": "Tanggal lahir",
  Phone: "Telepon",
  "Phone (optional)": "Telepon (opsional)",
  Address: "Alamat",
  Company: "Perusahaan",
  "Company name": "Nama perusahaan",
  Male: "Laki-laki",
  Female: "Perempuan",
  Other: "Lainnya",
  "Prefer not to say": "Tidak ingin menyebutkan",
  "Add guest": "Tambah tamu",
  "Edit guest": "Ubah tamu",
  "Edit guest ·": "Ubah tamu ·",
  "Active guest record": "Data tamu aktif",
  "Back to guests": "Kembali ke tamu",
  "Guest saved successfully.": "Data tamu berhasil disimpan.",
  "No guests found": "Tidak ada tamu",
  "Adjust the search or add your first guest.":
    "Sesuaikan pencarian atau tambahkan tamu pertama Anda.",
  "Find existing guests before creating a new record.":
    "Cari data tamu yang sudah ada sebelum membuat data baru.",
  "Full name is required. Identity and contact details can be completed later. Guest codes are assigned automatically.":
    "Nama lengkap wajib diisi. Identitas dan kontak dapat dilengkapi kemudian. Kode tamu dibuat otomatis.",
  "Guest search results": "Hasil pencarian tamu",
  "Bookings, stays & payments": "Reservasi, masa inap & pembayaran",
  "Recent reservations": "Reservasi terbaru",
  "All guests": "Semua tamu",
  "No reservations yet.": "Belum ada reservasi.",
  "Recent record changes": "Perubahan data terbaru",
  "No recorded changes.": "Belum ada perubahan tercatat.",
  guests: "tamu",
  "guests ·": "tamu ·",
  "matching guests · Page": "tamu sesuai filter · Halaman",
  "Email:": "Email:",
  "Staff notes": "Catatan staf",
  "Operational notes": "Catatan operasional",
  "Bookings, room assignments and scheduled arrivals.":
    "Reservasi, penempatan kamar, dan jadwal kedatangan.",
  Booking: "Reservasi",
  "Reservation number": "Nomor reservasi",
  "Arrival date": "Tanggal kedatangan",
  "Arrival from": "Kedatangan mulai",
  "Arrival through": "Kedatangan sampai",
  Departure: "Keberangkatan",
  Arrival: "Kedatangan",
  "Newest booking": "Reservasi terbaru",
  Total: "Total",
  "No reservations found": "Tidak ada reservasi",
  "Create a booking or adjust the filters.":
    "Buat reservasi atau sesuaikan filter.",
  "Reservation search results": "Hasil pencarian reservasi",
  "reservations · Page": "reservasi · Halaman",
  "All reservations": "Semua reservasi",
  "Back to reservations": "Kembali ke reservasi",
  "Back to reservation": "Kembali ke reservasi",
  "Edit booking": "Ubah reservasi",
  "View reservation": "Lihat reservasi",
  "View reservation and stay details": "Lihat reservasi dan detail menginap",
  "Reservation saved successfully.": "Reservasi berhasil disimpan.",
  "1. Guest": "1. Tamu",
  "2. Stay & room": "2. Masa inap & kamar",
  "3. Booking details": "3. Detail reservasi",
  "Find existing guest": "Cari tamu terdaftar",
  "Add guest in new tab": "Tambah tamu di tab baru",
  "After adding a guest, search here to select them. Up to 20 matches are shown.":
    "Setelah menambah tamu, cari di sini untuk memilihnya. Maksimal 20 hasil ditampilkan.",
  "No active guests found. Try a more specific search or add the guest.":
    "Tidak ada tamu aktif ditemukan. Perjelas pencarian atau tambahkan tamu.",
  "Selected:": "Dipilih:",
  Adults: "Dewasa",
  Children: "Anak-anak",
  "Check-in date": "Tanggal check-in",
  "Check-out date": "Tanggal check-out",
  "Select a room type": "Pilih tipe kamar",
  "Discount amount": "Nominal diskon",
  Source: "Sumber",
  "Initial status": "Status awal",
  "Special requests": "Permintaan khusus",
  "Assign an available room automatically":
    "Pilih kamar tersedia secara otomatis",
  "No rooms available. Change the dates or room type.":
    "Tidak ada kamar tersedia. Ubah tanggal atau tipe kamar.",
  "rooms available for these dates. Dirty/cleaning rooms still require housekeeping before check-in.":
    "kamar tersedia pada tanggal ini. Kamar kotor/dibersihkan harus disiapkan sebelum check-in.",
  "Check availability after changing dates, guest count, room type or discount.":
    "Periksa ketersediaan setelah mengubah tanggal, jumlah tamu, tipe kamar, atau diskon.",
  "Changing dates, room type or discount recalculates current rates. Other edits retain the saved price.":
    "Perubahan tanggal, tipe kamar, atau diskon menghitung ulang tarif terkini. Perubahan lainnya mempertahankan harga tersimpan.",
  "Pending bookings also hold a room. Saving reserves the stay; check-in and payments are handled separately.":
    "Reservasi menunggu juga menahan kamar. Penyimpanan memesan masa inap; check-in dan pembayaran dilakukan terpisah.",
  "Review total:": "Periksa total:",
  ". Availability is checked again when saving.":
    ". Ketersediaan diperiksa kembali saat menyimpan.",
  "Service charge applies after discount. Tax applies to the discounted room subtotal plus service charge.":
    "Biaya layanan dihitung setelah diskon. Pajak dihitung dari subtotal setelah diskon ditambah biaya layanan.",
  "Update booking status": "Ubah status reservasi",
  "Reason (required for cancellation/no-show)":
    "Alasan (wajib untuk pembatalan/tidak datang)",
  "Cancellation reason": "Alasan pembatalan",
  "This booking can no longer be edited":
    "Reservasi ini tidak dapat diubah lagi",
  "Recent booking activity": "Aktivitas reservasi terbaru",
  "Closure reason:": "Alasan penutupan:",
  "Guest arrival": "Kedatangan tamu",
  "Guest checked in successfully.": "Tamu berhasil check-in.",
  "Guest details and room assignment have been verified.":
    "Data tamu dan penempatan kamar telah diverifikasi.",
  "Confirm the guest has arrived and room":
    "Pastikan tamu telah datang dan kamar",
  "is ready. Check-in records the arrival time and marks the room occupied.":
    "sudah siap. Check-in mencatat waktu kedatangan dan menandai kamar terisi.",
  "Confirm the booking before checking in. After arrival, open the guest bill to record payments and check out.":
    "Konfirmasi reservasi sebelum check-in. Setelah tamu datang, buka tagihan untuk mencatat pembayaran dan check-out.",
  "Departure date has passed. Review dates or mark no-show.":
    "Tanggal keberangkatan telah lewat. Periksa tanggal atau tandai tidak datang.",
  "Review arrival": "Periksa kedatangan",
  "No confirmed arrivals to review.":
    "Tidak ada kedatangan terkonfirmasi untuk diperiksa.",
  "Confirmed arrivals due today or earlier (WIB). Open a booking to review guest details and check in. Confirm pending bookings in Reservations first.":
    "Kedatangan terkonfirmasi hari ini atau sebelumnya (WIB). Buka reservasi untuk memeriksa tamu dan check-in. Konfirmasi reservasi menunggu terlebih dahulu.",
  "View in-house guests": "Lihat tamu menginap",
  "No guests currently checked in.": "Tidak ada tamu yang sedang menginap.",
  "occupied rooms. Arrival times shown in WIB. Open Check-out to settle a bill and record departure.":
    "kamar terisi. Waktu kedatangan dalam WIB. Buka Check-out untuk melunasi tagihan dan mencatat keberangkatan.",
  Arrived: "Tiba",
  "Expected departure:": "Rencana keberangkatan:",
  "Review departures & bills": "Periksa keberangkatan & tagihan",
  Currency: "Mata uang",
  "Currency:": "Mata uang:",
  Received: "Diterima",
  "Received:": "Diterima:",
  Reversed: "Dibatalkan",
  "Reversed:": "Dibatalkan:",
  "Net received": "Penerimaan bersih",
  "Net received:": "Penerimaan bersih:",
  "Net payments": "Pembayaran bersih",
  Method: "Metode",
  Amount: "Nominal",
  "Amount (": "Nominal (",
  "Balance due": "Sisa tagihan",
  "Balance:": "Sisa tagihan:",
  "Total:": "Total:",
  "Total bill": "Total tagihan",
  "Payment history": "Riwayat pembayaran",
  "View payment history": "Lihat riwayat pembayaran",
  "View individual payment history": "Lihat riwayat pembayaran terperinci",
  Recorded: "Dicatat",
  "Entry:": "Entri:",
  "Entry / method": "Entri / metode",
  "Open bills": "Tagihan terbuka",
  "Back to bills": "Kembali ke tagihan",
  "Back to bill": "Kembali ke tagihan",
  "Open guest bill": "Buka tagihan tamu",
  "Guest bill": "Tagihan tamu",
  "Guest & stay": "Tamu & masa inap",
  "Agreed room charges": "Biaya kamar yang disepakati",
  "Room bills open automatically at check-in. Review charges, record received payments, and settle departures.":
    "Tagihan kamar dibuka otomatis saat check-in. Periksa biaya, catat pembayaran, dan selesaikan keberangkatan.",
  "No bills match these filters.": "Tidak ada tagihan sesuai filter.",
  "Room prices stay as agreed. Extra charges are added at their final price. Pre-arrival deposits and refund processing are not available yet.":
    "Harga kamar sesuai kesepakatan. Biaya tambahan memakai harga akhir. Deposit sebelum kedatangan dan pengembalian dana belum tersedia.",
  "Review bill & check out": "Periksa tagihan & check-out",
  "Review the guest bill and settle room and extra charges before departure. Early departure retains the agreed booking total.":
    "Periksa dan lunasi tagihan kamar serta biaya tambahan sebelum keberangkatan. Keberangkatan lebih awal tetap memakai total yang disepakati.",
  "Record received payment": "Catat pembayaran diterima",
  "Record money already received. This form does not charge a card or send a bank transfer.":
    "Catat uang yang sudah diterima. Formulir ini tidak menagih kartu atau melakukan transfer bank.",
  "Transaction reference (required for non-cash)":
    "Referensi transaksi (wajib untuk nontunai)",
  "Payment recorded.": "Pembayaran dicatat.",
  "I verified this payment was received and has not already been recorded.":
    "Saya telah memastikan pembayaran diterima dan belum pernah dicatat.",
  "No payments recorded.": "Belum ada pembayaran tercatat.",
  "Reverse incorrect entry": "Batalkan pencatatan keliru",
  "Corrects the recorded bill balance. No money is refunded or transferred.":
    "Memperbaiki saldo tagihan tercatat. Tidak ada uang yang dikembalikan atau ditransfer.",
  "Reason for correcting this record": "Alasan koreksi pencatatan",
  "I confirm this entry was recorded incorrectly.":
    "Saya memastikan pencatatan ini keliru.",
  "This bill is closed. Payment entries and the departure record are retained for review.":
    "Tagihan ditutup. Riwayat pembayaran dan keberangkatan tetap tersimpan.",
  "Settle the balance before check-out.":
    "Lunasi sisa tagihan sebelum check-out.",
  "Check-out complete. The room is now DIRTY and ready for housekeeping.":
    "Check-out selesai. Kamar berstatus Kotor dan siap ditangani tata graha.",
  "I reviewed the final bill and confirm the guest has departed.":
    "Saya telah memeriksa tagihan akhir dan memastikan tamu telah pergi.",
  "Check-out closes this bill and marks the room DIRTY. Add all services before settling the balance. Room prices are retained for early or late departure; no automatic late fees or refunds are calculated.":
    "Check-out menutup tagihan dan menandai kamar Kotor. Tambahkan seluruh layanan sebelum pelunasan. Harga kamar tetap untuk keberangkatan awal atau terlambat; denda dan pengembalian dana tidak dihitung otomatis.",
  "Front office or management completes check-out after the balance is settled.":
    "Resepsionis atau manajemen menyelesaikan check-out setelah tagihan lunas.",
  "Recorded receipts and corrections. Open a bill to record a payment.":
    "Penerimaan dan koreksi tercatat. Buka tagihan untuk mencatat pembayaran.",
  "ledger entries": "entri buku pembayaran",
  "Add extra charge": "Tambah biaya tambahan",
  "Service or item": "Layanan atau barang",
  Quantity: "Jumlah",
  "Final unit price (": "Harga akhir satuan (",
  "Use the final unit price in": "Gunakan harga akhir satuan dalam",
  ", including any applicable tax or service. No additional percentages are applied.":
    ", termasuk pajak atau layanan yang berlaku. Tidak ada persentase tambahan.",
  "I verified this charge and checked it has not already been recorded.":
    "Saya telah memastikan biaya ini benar dan belum pernah dicatat.",
  "Charge added.": "Biaya ditambahkan.",
  "Active extra charges": "Biaya tambahan aktif",
  "Extra charge history": "Riwayat biaya tambahan",
  "No extra charges on this page.": "Tidak ada biaya tambahan di halaman ini.",
  "Previous charges": "Biaya sebelumnya",
  "Next charges": "Biaya berikutnya",
  "Previous history": "Riwayat sebelumnya",
  "Next history": "Riwayat berikutnya",
  "entries, including cancelled charges · Page":
    "entri, termasuk biaya dibatalkan · Halaman",
  "(final price)": "(harga akhir)",
  "Print / Save PDF": "Cetak / Simpan PDF",
  "Choose Save as PDF in the print dialog. Refresh this page before printing an open bill.":
    "Pilih Simpan sebagai PDF pada dialog cetak. Muat ulang halaman sebelum mencetak tagihan terbuka.",
  "This bill is open and may change before checkout.":
    "Tagihan masih terbuka dan dapat berubah sebelum check-out.",
  "Scheduled arrival": "Jadwal kedatangan",
  "Scheduled departure": "Jadwal keberangkatan",
  "Bill opened (WIB)": "Tagihan dibuka (WIB)",
  "Bill closed (WIB)": "Tagihan ditutup (WIB)",
  Generated: "Dibuat",
  ". Hotel contact details are current at printing.":
    ". Kontak hotel sesuai data saat pencetakan.",
  "Extra charges use final prices. Cancelled charges are excluded. Reversals reduce recorded payments.":
    "Biaya tambahan memakai harga akhir. Biaya dibatalkan tidak dihitung. Pembatalan pembayaran mengurangi pembayaran tercatat.",
  "Charges (": "Biaya (",
  "WIB · Bill version": "WIB · Versi tagihan",
  "Room subtotal": "Subtotal kamar",
  Discount: "Diskon",
  "Service charge": "Biaya layanan",
  Tax: "Pajak",
  "Extra charges": "Biaya tambahan",
  Paid: "Dibayar",
  Balance: "Sisa tagihan",
  Nights: "Malam",
  "Nightly rate": "Tarif per malam",
  "Cleaning tasks follow room readiness automatically. Assign staff, record notes, and prepare rooms for arrival.":
    "Tugas kebersihan mengikuti kesiapan kamar secara otomatis. Tugaskan petugas, catat keterangan, dan siapkan kamar untuk kedatangan.",
  "All staff": "Semua staf",
  "Assigned to me": "Ditugaskan kepada saya",
  Unassigned: "Belum ditugaskan",
  "Assigned to": "Ditugaskan kepada",
  "Assigned to:": "Ditugaskan kepada:",
  "Assigned staff": "Staf yang ditugaskan",
  Assignment: "Penugasan",
  "Active jobs": "Tugas aktif",
  "No housekeeping jobs match these filters. Jobs appear when rooms need cleaning.":
    "Tidak ada tugas sesuai filter. Tugas muncul saat kamar membutuhkan pembersihan.",
  "Back to housekeeping": "Kembali ke tata graha",
  "Current room status:": "Status kamar saat ini:",
  "Job opened:": "Tugas dibuka:",
  "Job closed:": "Tugas ditutup:",
  "Save assignment": "Simpan penugasan",
  "Save note": "Simpan catatan",
  "Take this task": "Ambil tugas ini",
  "Cleaning or inspection note (optional)":
    "Catatan pembersihan atau pemeriksaan (opsional)",
  "Confirm the work is complete before advancing the room status.":
    "Pastikan pekerjaan selesai sebelum melanjutkan status kamar.",
  "I verified the room is ready for this step.":
    "Saya telah memastikan kamar siap untuk tahap ini.",
  "Work history": "Riwayat pekerjaan",
  "Manage cleaning": "Kelola kebersihan",
  "Add a note without changing status": "Tambah catatan tanpa mengubah status",
  "No active housekeeping accounts. Management can still progress the task.":
    "Belum ada akun tata graha aktif. Manajemen tetap dapat melanjutkan tugas.",
  "Inactive assignee - select another": "Petugas nonaktif - pilih lainnya",
  ". Management can reassign this task.":
    ". Manajemen dapat mengganti petugas.",
  "DIRTY → CLEANING → CLEAN → INSPECTED → AVAILABLE. Changes from the Rooms page are recorded here too.":
    "Kotor → Dibersihkan → Bersih → Diperiksa → Tersedia. Perubahan dari halaman Kamar juga dicatat di sini.",
  "Report room issue": "Laporkan kerusakan kamar",
  "Report and track repairs. Reports do not change room availability. Management blocks or releases rooms separately in Rooms after reviewing reservations and readiness.":
    "Laporkan dan pantau perbaikan. Laporan tidak mengubah ketersediaan kamar. Manajemen memblokir atau membuka kamar melalui halaman Kamar setelah memeriksa reservasi dan kesiapan.",
  "Back to maintenance": "Kembali ke pemeliharaan",
  "Task history": "Riwayat tugas",
  "Note / resolution (required for NOTE, COMPLETE and CANCEL)":
    "Catatan / penyelesaian (wajib untuk Catatan, Selesai, dan Batal)",
  "Assignee (ASSIGN action only)": "Petugas (khusus tindakan Penugasan)",
  "Current assignee unavailable - reassign":
    "Petugas saat ini tidak tersedia - tugaskan ulang",
  "Owner/manager approval required.": "Memerlukan persetujuan pemilik/manajer.",
  "No maintenance tasks match this filter.":
    "Tidak ada tugas pemeliharaan sesuai filter.",
  Title: "Judul",
  "Record paid expense": "Catat pengeluaran",
  "Payment date": "Tanggal pembayaran",
  "Reference (required for non-cash)": "Referensi (wajib untuk nontunai)",
  "I verified this money was paid and has not already been recorded.":
    "Saya telah memastikan uang dibayarkan dan belum pernah dicatat.",
  "Cancel incorrect expense": "Batalkan pengeluaran keliru",
  "Record money already paid. Cancellation corrects an incorrect record; it does not issue or record a refund. Original details and cancellation history are retained.":
    "Catat uang yang sudah dibayarkan. Pembatalan memperbaiki pencatatan keliru, bukan menerbitkan atau mencatat pengembalian dana. Data asli dan riwayat pembatalan tetap tersimpan.",
  "Active expenses by currency and category":
    "Pengeluaran aktif menurut mata uang dan kategori",
  "No active expenses in this period.":
    "Tidak ada pengeluaran aktif pada periode ini.",
  "No expenses match this filter.": "Tidak ada pengeluaran sesuai filter.",
  "Financial totals and CSV": "Ringkasan keuangan dan CSV",
  Staff: "Staf",
  "Staff accounts": "Akun staf",
  "Staff name": "Nama staf",
  "Staff email": "Email staf",
  "Staff ID:": "ID staf:",
  Role: "Peran",
  "All roles": "Semua peran",
  "All accounts": "Semua akun",
  "Add staff": "Tambah staf",
  "Add staff account": "Tambah akun staf",
  "Back to staff": "Kembali ke staf",
  "Initial password": "Kata sandi awal",
  "Active account - allow access according to this role":
    "Akun aktif - izinkan akses sesuai peran",
  "Staff account saved.": "Akun staf disimpan.",
  "Manage access for hotel staff. Only owners can create or change accounts.":
    "Kelola akses staf hotel. Hanya pemilik yang dapat membuat atau mengubah akun.",
  "Managers can review staff accounts. An owner must make changes.":
    "Manajer dapat melihat akun staf. Perubahan harus dilakukan pemilik.",
  "Ask another owner to change your own role or active status.":
    "Minta pemilik lain untuk mengubah peran atau status aktif Anda.",
  "Use at least 12 characters. Give the credentials directly to the staff member; no invitation email is sent.":
    "Gunakan minimal 12 karakter. Berikan kredensial langsung kepada staf; email undangan tidak dikirim.",
  "I verified that this email belongs to the staff member and approve this account.":
    "Saya telah memastikan email ini milik staf dan menyetujui akun ini.",
  "Deactivation removes app access. Existing housekeeping assignments remain in history; reassign open jobs in Housekeeping.":
    "Penonaktifan mencabut akses aplikasi. Riwayat penugasan tetap tersimpan; alihkan tugas terbuka di Tata graha.",
  "Email changes are managed through Supabase Authentication.":
    "Perubahan email dikelola melalui Supabase Authentication.",
  "Account activity": "Aktivitas akun",
  "No matching staff accounts.": "Tidak ada akun staf sesuai filter.",
  "No changes recorded since staff management was enabled.":
    "Belum ada perubahan sejak pengelolaan staf diaktifkan.",
  "Account creation needs server setup":
    "Pembuatan akun memerlukan pengaturan server",
  "You can still edit roles and activate accounts already created in Supabase Authentication from the Users list.":
    "Anda tetap dapat mengubah peran dan mengaktifkan akun yang sudah dibuat melalui daftar Pengguna.",
  "The Auth account was created, but profile setup could not be confirmed. Review the current role and active status below, then save. Do not create the account again.":
    "Akun autentikasi telah dibuat, tetapi pengaturan profil belum terkonfirmasi. Periksa peran dan status aktif lalu simpan. Jangan membuat ulang akun.",
  "to the server environment and restart the app. Follow the Staff management section in README.":
    "ke lingkungan server lalu mulai ulang aplikasi. Ikuti bagian pengelolaan staf di README.",
  "Hotel settings": "Pengaturan hotel",
  "Manage property details and defaults for new reservation quotes.":
    "Kelola informasi hotel dan nilai bawaan untuk penawaran reservasi baru.",
  "Settings saved.": "Pengaturan disimpan.",
  "Only owners and managers can access hotel settings.":
    "Hanya pemilik dan manajer yang dapat mengakses pengaturan hotel.",
  "Hotel name": "Nama hotel",
  "Check-in time": "Waktu check-in",
  "Check-out time": "Waktu check-out",
  "Currency code": "Kode mata uang",
  "Tax percentage": "Persentase pajak",
  "Service charge percentage": "Persentase biaya layanan",
  "Reservation prefix": "Awalan nomor reservasi",
  "Check-in:": "Check-in:",
  "Check-out:": "Check-out:",
  "Tax:": "Pajak:",
  "Service:": "Layanan:",
  "Tax and service apply to new or repriced reservation quotes. Existing agreed prices and closed bills stay unchanged. Changing currency does not convert room prices; review room type prices before creating new bookings.":
    "Pajak dan layanan berlaku untuk penawaran baru atau yang dihitung ulang. Harga yang disepakati dan tagihan tertutup tetap. Mengubah mata uang tidak mengonversi harga kamar; periksa tarif sebelum membuat reservasi baru.",
  "Hotel contact details appear on newly printed bills, including old folios. The reservation prefix applies to new bookings; existing numbers remain unchanged. Times are defaults, not automatic arrival/departure restrictions.":
    "Kontak hotel tampil pada tagihan yang dicetak, termasuk tagihan lama. Awalan reservasi berlaku untuk reservasi baru; nomor lama tetap. Waktu merupakan nilai bawaan, bukan pembatasan otomatis kedatangan/keberangkatan.",
  "Show report": "Tampilkan laporan",
  "Export CSV": "Ekspor CSV",
  "Export CSV (by method)": "Ekspor CSV (per metode)",
  "No matching activity or balances.":
    "Tidak ada aktivitas atau saldo yang sesuai.",
  "No payments or reversals recorded in this period.":
    "Tidak ada pembayaran atau pembatalan pada periode ini.",
  "Recorded receipts minus reversals, by payment entry date in Asia/Jakarta. This report measures recorded payments, not earned revenue or bank settlement.":
    "Penerimaan dikurangi pembatalan menurut tanggal pencatatan di Asia/Jakarta. Laporan menunjukkan pembayaran tercatat, bukan pendapatan yang diperoleh atau penyelesaian bank.",
  "Currencies are kept separate. Reversals are counted on their own recording date, so a period can have negative net receipts. CSV contains all method groups for the selected period; it is not an individual transaction export.":
    "Mata uang dipisahkan. Pembatalan dihitung pada tanggal pencatatannya, sehingga penerimaan bersih dapat negatif. CSV mencakup seluruh kelompok metode pada periode pilihan, bukan transaksi individual.",
  "Choose valid dates in order, up to 366 days, ending no later than today WIB.":
    "Pilih tanggal berurutan, maksimal 366 hari, dan berakhir paling lambat hari ini WIB.",
  "Enter valid dates in order, up to 366 days.":
    "Masukkan tanggal berurutan, maksimal 366 hari.",
  "Select valid dates in order, at most 366 days.":
    "Pilih tanggal berurutan, maksimal 366 hari.",
  ", inclusive · Updated": ", inklusif · Diperbarui",
  Module: "Modul",
  "Actor:": "Pelaku:",
  "Recent activity": "Aktivitas terbaru",
  "Combined operational history for management review. Sensitive field values, identity numbers, bank references, passwords, and task notes are not displayed here.":
    "Riwayat operasional gabungan untuk tinjauan manajemen. Nilai data sensitif, nomor identitas, referensi bank, kata sandi, dan catatan tugas tidak ditampilkan.",
  "Invalid dates were replaced with the current month.":
    "Tanggal tidak valid diganti dengan bulan berjalan.",
  "No audit events match this filter.":
    "Tidak ada aktivitas audit sesuai filter.",
  "matching events · page": "aktivitas sesuai filter · halaman",
  "This page combines business-operation audit records. Authentication sign-in/sign-out events and Supabase platform administration are not recorded by this application log.":
    "Halaman ini menggabungkan audit operasional. Aktivitas masuk/keluar akun dan administrasi platform Supabase tidak dicatat dalam log aplikasi ini.",
  "System or deleted staff": "Sistem atau staf yang dihapus",
  "No additional metadata": "Tidak ada informasi tambahan",
  "Latest 20 changes · Times shown in WIB":
    "20 perubahan terbaru · Waktu dalam WIB",
  "Latest 20 changes · WIB": "20 perubahan terbaru · WIB",
  "· Entity:": "· Objek:",
  "· Entry": "· Entri",
  "· Generated": "· Dibuat",
  "· Reference:": "· Referensi:",
  "· Room": "· Kamar",
  "· Staff:": "· Staf:",
  "WIB · Staff:": "WIB · Staf:",
  "WIB by": "WIB oleh",
  "entries · WIB": "entri · WIB",
  "events · WIB": "aktivitas · WIB",
  "entries)": "entri)",
  OWNER: "Pemilik",
  MANAGER: "Manajer",
  "FRONT OFFICE": "Resepsionis",
  HOUSEKEEPING: "Tata graha",
  FINANCE: "Keuangan",
  AVAILABLE: "Tersedia",
  OCCUPIED: "Terisi",
  RESERVED: "Dipesan",
  DIRTY: "Kotor",
  CLEANING: "Dibersihkan",
  CLEAN: "Bersih",
  INSPECTED: "Diperiksa",
  "OUT OF ORDER": "Tidak dapat digunakan",
  MAINTENANCE: "Pemeliharaan",
  PENDING: "Menunggu",
  CONFIRMED: "Dikonfirmasi",
  "CHECKED IN": "Sudah check-in",
  "CHECKED OUT": "Sudah check-out",
  CANCELLED: "Dibatalkan",
  "NO SHOW": "Tidak datang",
  OPEN: "Terbuka",
  "IN PROGRESS": "Dikerjakan",
  COMPLETED: "Selesai",
  LOW: "Rendah",
  NORMAL: "Normal",
  HIGH: "Tinggi",
  URGENT: "Mendesak",
  ASSIGN: "Tugaskan",
  ASSIGNED: "Ditugaskan",
  START: "Mulai",
  COMPLETE: "Selesaikan",
  CANCEL: "Batalkan",
  NOTE: "Catatan",
  ADVANCE: "Lanjutkan",
  CREATE: "Dibuat",
  CREATED: "Dibuat",
  UPDATE: "Diubah",
  DEACTIVATE: "Dinonaktifkan",
  REACTIVATE: "Diaktifkan kembali",
  "ROOM STATUS": "Status kamar",
  "ROOM CHANGED": "Kamar diubah",
  "EXTRA CREATE": "Biaya ditambahkan",
  "EXTRA VOID": "Biaya dibatalkan",
  VOID: "Dibatalkan",
  PAYMENT: "Pembayaran",
  REVERSAL: "Pembatalan pembayaran",
  CASH: "Tunai",
  "BANK TRANSFER": "Transfer bank",
  CARD: "Kartu",
  QRIS: "QRIS",
  UTILITIES: "Utilitas",
  LAUNDRY: "Penatu",
  SUPPLIES: "Perlengkapan",
  PAYROLL: "Gaji",
  REPAIRS: "Perbaikan",
  OTHER: "Lainnya",
  "WALK IN": "Datang langsung",
  PHONE: "Telepon",
  WHATSAPP: "WhatsApp",
  DIRECT: "Langsung",
  OTA: "OTA",
  "TRAVEL AGENT": "Agen perjalanan",
  PASSPORT: "Paspor",
  MALE: "Laki-laki",
  FEMALE: "Perempuan",
  "PREFER NOT TO SAY": "Tidak ingin menyebutkan",
  ALL: "Semua",
  ROOMS: "Kamar",
  GUESTS: "Tamu",
  RESERVATIONS: "Reservasi",
  BILLING: "Tagihan",
  STAFF: "Staf",
  EXPENSES: "Pengeluaran",
  SETTINGS: "Pengaturan",
  TOTAL: "TOTAL",
};

Object.assign(indonesian, {
  "Enter a valid email address.": "Masukkan alamat email yang valid.",
  "Enter your password.": "Masukkan kata sandi Anda.",
  "Password is too long.": "Kata sandi terlalu panjang.",
  "Enter a valid email address and password.":
    "Masukkan email dan kata sandi yang valid.",
  "Unable to sign in. Check your credentials or try again shortly.":
    "Gagal masuk. Periksa email dan kata sandi atau coba lagi sebentar.",
  "The sign-in service could not be reached. Please try again.":
    "Layanan masuk tidak dapat dihubungi. Silakan coba lagi.",
  "Unable to complete sign-in. Please try again.":
    "Gagal menyelesaikan proses masuk. Silakan coba lagi.",
  "Sign-in is not configured. Contact your administrator.":
    "Fitur masuk belum dikonfigurasi. Hubungi administrator.",
  "Unable to sign out. Please try again.": "Gagal keluar. Silakan coba lagi.",
  "Staff access is unavailable. Contact your administrator to activate your profile.":
    "Akses staf tidak tersedia. Hubungi administrator untuk mengaktifkan profil Anda.",
  "Please try again. If the problem continues, ask your administrator to check the connection and database setup.":
    "Silakan coba lagi. Jika masalah berlanjut, minta administrator memeriksa koneksi dan pengaturan database.",
  "We couldn’t load this page": "Halaman tidak dapat dimuat",
  "Report unavailable": "Laporan tidak tersedia",
  "Bill unavailable. Contact your administrator.":
    "Tagihan tidak tersedia. Hubungi administrator.",
  "Loading audit logs...": "Memuat log audit...",
  "Loading billing data…": "Memuat data tagihan…",
  "Loading dashboard...": "Memuat dasbor...",
  "Loading expenses...": "Memuat pengeluaran...",
  "Loading guest stays…": "Memuat data menginap…",
  "Loading guests…": "Memuat tamu…",
  "Loading hotel settings...": "Memuat pengaturan hotel...",
  "Loading housekeeping tasks…": "Memuat tugas tata graha…",
  "Loading maintenance...": "Memuat pemeliharaan...",
  "Loading payment report...": "Memuat laporan pembayaran...",
  "Loading report...": "Memuat laporan...",
  "Loading reservations…": "Memuat reservasi…",
  "Loading room inventory…": "Memuat inventaris kamar…",
  "Loading staff management tasks…": "Memuat pengelolaan staf…",
  "Arrival data is unavailable": "Data kedatangan tidak tersedia",
  "Audit logs are unavailable": "Log audit tidak tersedia",
  "Billing data is unavailable": "Data tagihan tidak tersedia",
  "Dashboard is unavailable": "Dasbor tidak tersedia",
  "Expenses could not be loaded": "Pengeluaran tidak dapat dimuat",
  "Guest data is unavailable": "Data tamu tidak tersedia",
  "Hotel settings could not be loaded": "Pengaturan hotel tidak dapat dimuat",
  "Housekeeping data is unavailable": "Data tata graha tidak tersedia",
  "Maintenance is unavailable": "Pemeliharaan tidak tersedia",
  "Reservation data is unavailable": "Data reservasi tidak tersedia",
  "Room data is unavailable": "Data kamar tidak tersedia",
  "Staff data is unavailable": "Data staf tidak tersedia",
  "Enter the guest's full name.": "Masukkan nama lengkap tamu.",
  "Enter a valid phone number.": "Masukkan nomor telepon yang valid.",
  "KTP must contain exactly 16 digits.":
    "Nomor KTP harus terdiri dari tepat 16 digit.",
  "Use letters, numbers, spaces or hyphens.":
    "Gunakan huruf, angka, spasi, atau tanda hubung.",
  "Use a valid birth date between 1900 and today.":
    "Gunakan tanggal lahir yang valid antara tahun 1900 dan hari ini.",
  "Enter at least two characters to find a guest.":
    "Masukkan minimal dua karakter untuk mencari tamu.",
  "Guest search failed.": "Pencarian tamu gagal.",
  "Unable to search guests.": "Tidak dapat mencari tamu.",
  "Guest could not be saved. Check the connection and database setup.":
    "Tamu tidak dapat disimpan. Periksa koneksi dan pengaturan database.",
  "Unable to save the guest. Please try again.":
    "Tidak dapat menyimpan tamu. Silakan coba lagi.",
  "Reload the guest before editing.": "Muat ulang data tamu sebelum mengubah.",
  "This guest was changed by another staff member. Reload before saving.":
    "Data tamu diubah oleh staf lain. Muat ulang sebelum menyimpan.",
  "Check the guest details, identity number and birth date.":
    "Periksa data tamu, nomor identitas, dan tanggal lahir.",
  "A guest with this identity type and number already exists. Search existing and inactive guests.":
    "Tamu dengan jenis dan nomor identitas ini sudah ada. Cari di data tamu aktif maupun nonaktif.",
  "Cancel or complete active reservations before deactivating this guest.":
    "Batalkan atau selesaikan reservasi aktif sebelum menonaktifkan tamu.",
  "Use 1–12 letters, numbers or hyphens.":
    "Gunakan 1–12 huruf, angka, atau tanda hubung.",
  "Maximum 30 amenities.": "Maksimal 30 fasilitas.",
  "Select an active room type.": "Pilih tipe kamar aktif.",
  "Select a valid room and status.": "Pilih kamar dan status yang valid.",
  "Reload this record before editing.": "Muat ulang data sebelum mengubah.",
  "This room changed since you opened it. Reload before saving.":
    "Data kamar telah berubah. Muat ulang sebelum menyimpan.",
  "This room type changed since you opened it. Reload before saving.":
    "Tipe kamar telah berubah. Muat ulang sebelum menyimpan.",
  "That room number or room type name already exists, including inactive records.":
    "Nomor kamar atau nama tipe sudah ada, termasuk pada data nonaktif.",
  "Choose an active room type before activating this room.":
    "Pilih tipe kamar aktif sebelum mengaktifkan kamar.",
  "Deactivate or reassign active rooms before deactivating this type.":
    "Nonaktifkan atau ubah tipe kamar aktif sebelum menonaktifkan tipe ini.",
  "Reassign or cancel active reservations before blocking or changing this room.":
    "Pindahkan atau batalkan reservasi aktif sebelum memblokir atau mengubah kamar.",
  "Existing bookings exceed this capacity. Reassign them first.":
    "Reservasi yang ada melebihi kapasitas ini. Pindahkan terlebih dahulu.",
  "Occupied and reserved statuses are managed by reservation workflows.":
    "Status Terisi dan Dipesan dikelola melalui alur reservasi.",
  "That status transition is not permitted.":
    "Perubahan status tersebut tidak diizinkan.",
  "Unable to save the room. Please try again.":
    "Tidak dapat menyimpan kamar. Silakan coba lagi.",
  "Unable to save the room type. Please try again.":
    "Tidak dapat menyimpan tipe kamar. Silakan coba lagi.",
  "Unable to update the room status. Please try again.":
    "Tidak dapat mengubah status kamar. Silakan coba lagi.",
  "Another staff member changed this room. Reload to see its latest status.":
    "Staf lain mengubah kamar ini. Muat ulang untuk melihat status terbaru.",
  "Check the entered values and selected room type.":
    "Periksa nilai yang dimasukkan dan tipe kamar pilihan.",
  "The change could not be saved. Check the database setup and try again.":
    "Perubahan tidak dapat disimpan. Periksa pengaturan database lalu coba lagi.",
  "Select a guest.": "Pilih tamu.",
  "Select an active guest.": "Pilih tamu aktif.",
  "Select a room type.": "Pilih tipe kamar.",
  "Select a stay between 1 and 365 nights.":
    "Pilih masa inap antara 1 dan 365 malam.",
  "Checkout must follow check-in, up to 365 nights.":
    "Check-out harus setelah check-in, maksimal 365 malam.",
  "A new arrival date cannot be in the past.":
    "Tanggal kedatangan baru tidak boleh di masa lalu.",
  "The discount cannot exceed the room subtotal.":
    "Diskon tidak boleh melebihi subtotal kamar.",
  "The guest count exceeds the room type capacity.":
    "Jumlah tamu melebihi kapasitas tipe kamar.",
  "Only an owner or manager can change the discount.":
    "Hanya pemilik atau manajer yang dapat mengubah diskon.",
  "Enter a cancellation reason (3-500 characters).":
    "Masukkan alasan pembatalan (3–500 karakter).",
  "Reload this reservation before editing.":
    "Muat ulang reservasi sebelum mengubah.",
  "This reservation can no longer be edited.":
    "Reservasi ini tidak dapat diubah lagi.",
  "Another staff member changed this reservation. Reload before saving.":
    "Staf lain mengubah reservasi ini. Muat ulang sebelum menyimpan.",
  "The selected room is no longer available. Check availability again.":
    "Kamar pilihan tidak lagi tersedia. Periksa ketersediaan kembali.",
  "Rates or hotel charges changed. Check availability again before saving.":
    "Tarif atau biaya hotel berubah. Periksa ketersediaan sebelum menyimpan.",
  "Another operation changed inventory. Please check availability and retry.":
    "Operasi lain mengubah inventaris. Periksa ketersediaan dan coba lagi.",
  "No-show is only available on or after the arrival date.":
    "Status tidak datang hanya dapat dipilih pada atau setelah tanggal kedatangan.",
  "Invalid reservation. Reload and try again.":
    "Reservasi tidak valid. Muat ulang dan coba lagi.",
  "Unable to check availability. Please try again.":
    "Tidak dapat memeriksa ketersediaan. Silakan coba lagi.",
  "Unable to save the reservation. Please try again.":
    "Tidak dapat menyimpan reservasi. Silakan coba lagi.",
  "Unable to update the reservation.": "Tidak dapat memperbarui reservasi.",
  "This status change is not permitted.":
    "Perubahan status ini tidak diizinkan.",
  "Confirm the reservation before check-in.":
    "Konfirmasi reservasi sebelum check-in.",
  "Activate the guest record before check-in.":
    "Aktifkan data tamu sebelum check-in.",
  "The assigned room is unavailable. Review the booking.":
    "Kamar yang ditetapkan tidak tersedia. Periksa reservasi.",
  "The previous guest still occupies this room.":
    "Tamu sebelumnya masih menempati kamar ini.",
  "The room must be AVAILABLE or INSPECTED. Complete cleaning first.":
    "Kamar harus Tersedia atau Diperiksa. Selesaikan pembersihan terlebih dahulu.",
  "The room type is inactive or its capacity is insufficient.":
    "Tipe kamar nonaktif atau kapasitas tidak mencukupi.",
  "This reservation changed. Reload before checking in.":
    "Reservasi berubah. Muat ulang sebelum check-in.",
  "Check-in is allowed from the arrival date until the day before departure (WIB). Edit the booking dates if needed.":
    "Check-in diperbolehkan dari tanggal kedatangan hingga sehari sebelum keberangkatan (WIB). Ubah tanggal reservasi bila perlu.",
  "Check-in could not be completed. Reload and try again.":
    "Check-in tidak dapat diselesaikan. Muat ulang dan coba lagi.",
  "Unable to check in. Please try again.":
    "Tidak dapat check-in. Silakan coba lagi.",
  "Review room readiness (": "Periksa kesiapan kamar (",
  "Enter a positive amount with at most two decimals.":
    "Masukkan nominal positif dengan maksimal dua angka desimal.",
  "Enter a positive payment amount.": "Masukkan nominal pembayaran positif.",
  "Enter a positive price with at most two decimals.":
    "Masukkan harga positif dengan maksimal dua angka desimal.",
  "Enter the bank, card or QRIS transaction reference.":
    "Masukkan referensi transaksi bank, kartu, atau QRIS.",
  "Enter a valid payment amount, method and transaction reference.":
    "Masukkan nominal, metode, dan referensi pembayaran yang valid.",
  "Enter a valid description, quantity and final unit price.":
    "Masukkan deskripsi, jumlah, dan harga akhir satuan yang valid.",
  "Enter a reason (at least 3 characters).":
    "Masukkan alasan (minimal 3 karakter).",
  "Enter a reason of 3-500 characters.":
    "Masukkan alasan sepanjang 3–500 karakter.",
  "Enter a reason with at least 3 characters.":
    "Masukkan alasan minimal 3 karakter.",
  "Enter a reason with at least three characters.":
    "Masukkan alasan minimal tiga karakter.",
  "Charge is too large.": "Biaya terlalu besar.",
  "The total exceeds the supported amount.":
    "Total melebihi batas nominal yang didukung.",
  "The payment exceeds the current balance. Reload and review the bill.":
    "Pembayaran melebihi sisa tagihan. Muat ulang dan periksa tagihan.",
  "This bill is closed and cannot be changed.":
    "Tagihan ditutup dan tidak dapat diubah.",
  "The bill changed. Reload and review it before continuing.":
    "Tagihan berubah. Muat ulang dan periksa sebelum melanjutkan.",
  "Record the remaining payment before check-out.":
    "Catat pelunasan sisa tagihan sebelum check-out.",
  "Reload the bill before checking out.":
    "Muat ulang tagihan sebelum check-out.",
  "This reservation is not currently checked in.":
    "Reservasi ini tidak sedang berstatus check-in.",
  "The room and stay records do not match. Check-out was not completed.":
    "Data kamar dan masa inap tidak cocok. Check-out tidak diselesaikan.",
  "This charge would exceed the maximum bill amount.":
    "Biaya ini akan melebihi batas total tagihan.",
  "This cancellation would make payments exceed the bill. Review the recorded payments first; refunds are not supported here.":
    "Pembatalan ini membuat pembayaran melebihi tagihan. Periksa pembayaran terlebih dahulu; pengembalian dana tidak didukung di sini.",
  "This payment request was already used for different details. Reload before retrying.":
    "Permintaan pembayaran ini sudah digunakan untuk data berbeda. Muat ulang sebelum mencoba lagi.",
  "This request was used for different charge details. Review the history before retrying.":
    "Permintaan ini dipakai untuk biaya berbeda. Periksa riwayat sebelum mencoba lagi.",
  "Unable to record payment. Retry with the same details to avoid duplicate recording.":
    "Tidak dapat mencatat pembayaran. Coba lagi dengan data yang sama agar tidak tercatat ganda.",
  "Unable to reverse payment. Please try again.":
    "Tidak dapat membatalkan pembayaran. Silakan coba lagi.",
  "Unable to check out. Reload and try again.":
    "Tidak dapat check-out. Muat ulang dan coba lagi.",
  "Unable to cancel this charge. Reload and review its status.":
    "Tidak dapat membatalkan biaya. Muat ulang dan periksa statusnya.",
  "Unable to confirm the charge. Retry the same details, or check charge history before creating another.":
    "Biaya belum terkonfirmasi. Coba lagi dengan data sama atau periksa riwayat sebelum membuat biaya lain.",
  "The request could not be completed. Check the details and database setup.":
    "Permintaan tidak dapat diselesaikan. Periksa data dan pengaturan database.",
  "The request could not be completed. Reload and try again.":
    "Permintaan tidak dapat diselesaikan. Muat ulang dan coba lagi.",
  "Active room not found. Enter its exact room number.":
    "Kamar aktif tidak ditemukan. Masukkan nomor kamar dengan tepat.",
  "Room is unavailable or you do not have access.":
    "Kamar tidak tersedia atau Anda tidak memiliki akses.",
  "Start the task before completing it.":
    "Mulai tugas sebelum menyelesaikannya.",
  "Enter a note before saving.": "Masukkan catatan sebelum menyimpan.",
  "Enter a note with at least three characters.":
    "Masukkan catatan minimal tiga karakter.",
  "Select an active housekeeping staff member.": "Pilih staf tata graha aktif.",
  "Select an active staff member.": "Pilih staf aktif.",
  "Take the task before adding a note.":
    "Ambil tugas sebelum menambahkan catatan.",
  "This task is already closed.": "Tugas ini sudah ditutup.",
  "This task is already closed. Reload to see the latest room status.":
    "Tugas sudah ditutup. Muat ulang untuk melihat status kamar terbaru.",
  "This task belongs to another staff member. Ask management to reassign it.":
    "Tugas milik staf lain. Minta manajemen mengganti penugasan.",
  "This cleaning task is assigned to another staff member. Ask management to reassign it.":
    "Tugas kebersihan diberikan kepada staf lain. Minta manajemen mengganti penugasan.",
  "Room readiness changed. Reload the task.":
    "Kesiapan kamar berubah. Muat ulang tugas.",
  "The room changed. Reload and try again.":
    "Kamar berubah. Muat ulang dan coba lagi.",
  "This cleaning step is no longer available. Reload the room.":
    "Tahap pembersihan tidak lagi tersedia. Muat ulang kamar.",
  "Task changed. Reload before continuing.":
    "Tugas berubah. Muat ulang sebelum melanjutkan.",
  "The task changed since you opened it. Reload before saving.":
    "Tugas berubah sejak dibuka. Muat ulang sebelum menyimpan.",
  "Your role or assignment does not allow this change.":
    "Peran atau penugasan Anda tidak mengizinkan perubahan ini.",
  "Unable to update housekeeping. Please try again.":
    "Tidak dapat memperbarui tata graha. Silakan coba lagi.",
  "The task could not be updated. Reload and try again.":
    "Tugas tidak dapat diperbarui. Muat ulang dan coba lagi.",
  "Task could not be changed. Reload and try again.":
    "Tugas tidak dapat diubah. Muat ulang dan coba lagi.",
  "Unable to confirm update. Reload to review task history.":
    "Perubahan belum terkonfirmasi. Muat ulang untuk memeriksa riwayat tugas.",
  "Report could not be saved. Check the migration and retry.":
    "Laporan kerusakan tidak tersimpan. Periksa migrasi dan coba lagi.",
  "Unable to confirm report. Retry the same details or check the task list.":
    "Laporan belum terkonfirmasi. Coba ulang data yang sama atau periksa daftar tugas.",
  "This request was used for different details. Check the task list before retrying.":
    "Permintaan dipakai untuk data berbeda. Periksa daftar tugas sebelum mencoba lagi.",
  "Enter the staff name.": "Masukkan nama staf.",
  "Use at least 12 characters.": "Gunakan minimal 12 karakter.",
  "Use at most 72 UTF-8 bytes for the password.":
    "Gunakan kata sandi maksimal 72 byte UTF-8.",
  "Confirm you have verified the staff email.":
    "Konfirmasi bahwa email staf telah diverifikasi.",
  "Only an active OWNER can create staff.":
    "Hanya pemilik aktif yang dapat membuat akun staf.",
  "Only an active OWNER can manage staff.":
    "Hanya pemilik aktif yang dapat mengelola staf.",
  "Keep at least one active OWNER. Activate another owner before changing this account.":
    "Harus ada minimal satu pemilik aktif. Aktifkan pemilik lain sebelum mengubah akun ini.",
  "This account changed. Reload before saving.":
    "Akun berubah. Muat ulang sebelum menyimpan.",
  "This staff account is no longer available.":
    "Akun staf ini tidak lagi tersedia.",
  "An account already uses this email. Find it in Users or Supabase Authentication.":
    "Email sudah digunakan. Cari akun di Pengguna atau Supabase Authentication.",
  "The password does not meet the Supabase password policy.":
    "Kata sandi tidak memenuhi kebijakan Supabase.",
  "Staff changes could not be saved. Reload and try again.":
    "Perubahan staf tidak tersimpan. Muat ulang dan coba lagi.",
  "Unable to update staff. Please try again.":
    "Tidak dapat memperbarui staf. Silakan coba lagi.",
  "Unable to confirm account creation. Check Users before retrying.":
    "Pembuatan akun belum terkonfirmasi. Periksa Pengguna sebelum mencoba lagi.",
  "Account creation is not configured on the server. See the Users setup instructions.":
    "Pembuatan akun belum dikonfigurasi di server. Lihat petunjuk pengaturan Pengguna.",
  "Apply the staff management migration before creating accounts.":
    "Terapkan migrasi pengelolaan staf sebelum membuat akun.",
  "Account creation failed. Check the email, password policy and server configuration. If a previous attempt was interrupted, check Users before retrying.":
    "Pembuatan akun gagal. Periksa email, kebijakan kata sandi, dan konfigurasi server. Jika percobaan sebelumnya terputus, periksa Pengguna terlebih dahulu.",
  "Expense could not be recorded. Check the fields, payment date and migration.":
    "Pengeluaran tidak tercatat. Periksa isian, tanggal pembayaran, dan migrasi.",
  "Unable to confirm save. Retry the same details or check the list before creating another expense.":
    "Penyimpanan belum terkonfirmasi. Coba ulang data sama atau periksa daftar sebelum membuat pengeluaran lain.",
  "Cancellation failed. Reload and try again.":
    "Pembatalan gagal. Muat ulang dan coba lagi.",
  "Unable to confirm cancellation. Reload to review its status.":
    "Pembatalan belum terkonfirmasi. Muat ulang untuk memeriksa status.",
  "Request already used for different details. Review history before retrying.":
    "Permintaan sudah dipakai untuk data berbeda. Periksa riwayat sebelum mencoba lagi.",
  "Use HH:mm time.": "Gunakan format waktu JJ:mm.",
  "Use a percentage with at most two decimals.":
    "Gunakan persentase dengan maksimal dua angka desimal.",
  "Percentage must be between 0 and 100.": "Persentase harus antara 0 dan 100.",
  "Settings changed in another session. Reload this page and review before saving.":
    "Pengaturan diubah di sesi lain. Muat ulang dan periksa sebelum menyimpan.",
  "Settings could not be saved. Check the settings migration and try again.":
    "Pengaturan tidak tersimpan. Periksa migrasi pengaturan dan coba lagi.",
  "Unable to save settings. Reload and try again.":
    "Tidak dapat menyimpan pengaturan. Muat ulang dan coba lagi.",
});

Object.assign(indonesian, {
  "Save guest": "Simpan tamu",
  "Save room": "Simpan kamar",
  "Save room type": "Simpan tipe kamar",
  "Save settings": "Simpan pengaturan",
  "Save staff": "Simpan staf",
  "Save changes": "Simpan perubahan",
  "Create account": "Buat akun",
  "Save account": "Simpan akun",
  "Create staff account": "Buat akun staf",
  "Save reservation": "Simpan reservasi",
  "Create reservation": "Buat reservasi",
  "Update reservation": "Perbarui reservasi",
  "Record payment": "Catat pembayaran",
  "Record expense": "Catat pengeluaran",
  "Create report": "Buat laporan",
  "Update task": "Perbarui tugas",
  "Update status": "Perbarui status",
  "Check in guest": "Check-in tamu",
  "Complete check-out": "Selesaikan check-out",
  "Add charge": "Tambah biaya",
  "Cancel charge": "Batalkan biaya",
  "Reverse entry": "Batalkan entri",
  "Check availability & price": "Periksa ketersediaan & harga",
  "Saving...": "Menyimpan...",
  "Saving…": "Menyimpan…",
  "Updating…": "Memperbarui…",
  "Updating...": "Memperbarui...",
  "Checking…": "Memeriksa…",
  "Checking in...": "Memproses check-in...",
  "Checking out...": "Memproses check-out...",
  "Recording...": "Mencatat...",
  "Cancelling...": "Membatalkan...",
  "Reversing...": "Membatalkan...",
  "Creating...": "Membuat...",
  "Start cleaning": "Mulai membersihkan",
  "Mark clean": "Tandai bersih",
  "Mark inspected": "Tandai diperiksa",
  "Release room": "Buka kamar",
  "Mark available": "Tandai tersedia",
  "Identity number (optional)": "Nomor identitas (opsional)",
  "Check-in time (WIB)": "Waktu check-in (WIB)",
  "Check-out time (WIB)": "Waktu check-out (WIB)",
  "Currency code (e.g. IDR, USD, SGD)": "Kode mata uang (mis. IDR, USD, SGD)",
  "Room tax (%)": "Pajak kamar (%)",
  "Room service charge (%)": "Biaya layanan kamar (%)",
  "Search room number": "Cari nomor kamar",
  "Type name or email": "Ketik nama atau email",
  "Connection failed. Please try again.": "Koneksi gagal. Silakan coba lagi.",
  "Connection failed. Reload and try again.":
    "Koneksi gagal. Muat ulang dan coba lagi.",
  "Occupancy report": "Laporan okupansi",
  "Revenue / closed bills": "Pendapatan / tagihan ditutup",
  "Occupied at snapshot": "Terisi saat pencatatan",
  "Active rooms at snapshot": "Kamar aktif saat pencatatan",
  "Occupancy (%)": "Okupansi (%)",
  "Actual check-ins": "Check-in aktual",
  "Actual check-outs": "Check-out aktual",
  "Closing date (WIB)": "Tanggal penutupan (WIB)",
  "Closed bills": "Tagihan ditutup",
  Service: "Layanan",
  "Extras (final prices)": "Tambahan (harga akhir)",
  "Billed total": "Total ditagihkan",
  "Period receipts": "Penerimaan periode",
  "Period reversals": "Pembatalan periode",
  "Period net receipts": "Penerimaan bersih periode",
  "Period expenses": "Pengeluaran periode",
  "Recorded net cash flow": "Arus kas bersih tercatat",
  "Period closed bills": "Tagihan ditutup pada periode",
  "Open bills NOW": "Tagihan terbuka SAAT INI",
  "Outstanding NOW": "Sisa tagihan SAAT INI",
  "From (WIB)": "Dari (WIB)",
  "Through (WIB)": "Sampai (WIB)",
  "Generated at (UTC)": "Dibuat pada (UTC)",
  Entries: "Entri",
  "Occupied rooms immediately before midnight WIB for past days; today uses the generation time. Capacity is reconstructed from room activity and includes all active rooms, including maintenance. Same-day stays appear in check-ins/check-outs but may not be occupied at the snapshot. A dash means zero recorded capacity.":
    "Kamar terisi dihitung tepat sebelum tengah malam WIB untuk hari sebelumnya; hari ini memakai waktu pembuatan laporan. Kapasitas dihitung dari riwayat aktivitas kamar dan mencakup semua kamar aktif, termasuk pemeliharaan. Masa inap sehari tampil pada check-in/check-out tetapi belum tentu terisi saat pencatatan. Tanda hubung berarti kapasitas tercatat nol.",
  "Agreed room charges and active extras on folios closed during the selected period, grouped by closing date. Includes tax/service and is not nightly earned revenue or cash receipts. TOTAL rows summarize each currency; do not add totals to daily rows.":
    "Biaya kamar yang disepakati dan tambahan aktif pada tagihan yang ditutup dalam periode pilihan, menurut tanggal penutupan. Termasuk pajak/layanan; bukan pendapatan per malam atau penerimaan kas. Baris TOTAL merangkum tiap mata uang; jangan jumlahkan lagi dengan baris harian.",
  "Receipts, reversals and closed bills use the selected period. Open bills and outstanding balances are CURRENT at generation time, not historical balances at the period end. Currencies are separate. Expenses use the entered payment date. Cancelled mistakes are excluded, including from past periods. Net cash flow is receipts minus reversals and expenses; it is not accounting profit.":
    "Penerimaan, pembatalan, dan tagihan ditutup memakai periode pilihan. Tagihan terbuka dan sisa tagihan adalah kondisi SAAT INI, bukan saldo historis akhir periode. Mata uang dipisahkan. Pengeluaran memakai tanggal pembayaran yang diisi. Pencatatan keliru yang dibatalkan tidak dihitung, termasuk pada periode lalu. Arus kas bersih adalah penerimaan dikurangi pembatalan dan pengeluaran; bukan laba akuntansi.",
});

Object.assign(indonesian, {
  "Make available": "Tandai tersedia",
  "Deactivate this guest? Their record and history will be retained.":
    "Nonaktifkan tamu ini? Data dan riwayatnya tetap tersimpan.",
  "Deactivate this room? It will be removed from active inventory.":
    "Nonaktifkan kamar ini? Kamar akan dikeluarkan dari inventaris aktif.",
  "Deactivate this room type? All its rooms must be inactive or reassigned first.":
    "Nonaktifkan tipe kamar ini? Semua kamarnya harus nonaktif atau dipindahkan ke tipe lain terlebih dahulu.",
});

export function translate(locale: Locale, message: string): string {
  if (locale === "en") return message;
  const key = message.replace(/\s+/g, " ").trim();
  const translated =
    indonesian[key] ??
    indonesian[key.replaceAll("_", " ")] ??
    indonesian[key.toUpperCase()];
  if (translated)
    return (
      (message.match(/^\s*/)?.[0] ?? "") +
      translated +
      (message.match(/\s*$/)?.[0] ?? "")
    );
  if (key.startsWith("Check your ") && /migration|connection|role/.test(key))
    return "Periksa koneksi, hak akses, dan migrasi modul terkait. Hubungi administrator jika masalah berlanjut.";
  if (/^(You do not have permission|Your role cannot access)/.test(key))
    return "Anda tidak memiliki izin untuk mengakses atau mengubah data ini.";
  const occupancy = key.match(/^([\d.]+)% of (\d+) active rooms$/);
  if (occupancy) return `${occupancy[1]}% dari ${occupancy[2]} kamar aktif`;
  const ready = key.match(/^Available or inspected; (\d+) rooms blocked$/);
  if (ready) return `Tersedia atau diperiksa; ${ready[1]} kamar diblokir`;
  const arrivals = key.match(/^(\d+) pending or confirmed arrivals remaining$/);
  if (arrivals) return `${arrivals[1]} kedatangan menunggu atau terkonfirmasi`;
  const departures = key.match(
    /^(\d+) still in house; (\d+) overdue departures$/,
  );
  if (departures)
    return `${departures[1]} masih menginap; ${departures[2]} keberangkatan terlambat`;
  const jobs = key.match(/^(\d+) unassigned; (\d+) assigned to you$/);
  if (jobs)
    return `${jobs[1]} tanpa petugas; ${jobs[2]} ditugaskan kepada Anda`;
  if (key === "No active rooms yet") return "Belum ada kamar aktif";
  return message;
}
