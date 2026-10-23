export type PageType = 
  | 'home' 
  | 'booking' 
  | 'promo' 
  | 'riwayat' 
  | 'akun' 
  | 'layanan' 
  | 'status' 
  | 'berhasil' 
  | 'detail_booking' 
  | 'membership'
  | 'login'
  | 'register';

export interface MembershipSettings {
  benefitBronze?: string[];
  benefitSilver?: string[];
  benefitGold?: string[];
  benefitPlatinum?: string[];
  diskonJasaBronze?: number;
  diskonJasaSilver?: number;
  diskonJasaGold?: number;
  diskonJasaPlatinum?: number;
  diskonSparepartBronze?: number;
  diskonSparepartSilver?: number;
  diskonSparepartGold?: number;
  diskonSparepartPlatinum?: number;
  minTransaksiSilver?: number;
  minTransaksiGold?: number;
  minTransaksiPlatinum?: number;
  minPoinRedeem?: number;
  nilaiRupiahPerPoin?: number;
  poinPerKelipatanTransaksi?: number;
  masaAktifTipe?: string;
  biayaPendaftaran?: number;
}

export interface UserAccount {
  id: string; // e.g. DNE-MBR-202608001
  nomorMember?: string;
  nama: string;
  email?: string;
  whatsapp: string; // Key utama (normalized 628...)
  wa?: string;
  password?: string;
  kendaraanDefault?: string;
  kendaraanList?: string[];
  kategoriDefault?: string;
  alamat?: string;
  level: string; // Bronze, Silver, Gold, Platinum
  masaBerlaku?: string;
  masa_aktif?: string;
  tanggal_berakhir?: string;
  tanggalBergabung?: string;
  poin?: number;
  jumlah_poin: number;
  totalKunjungan?: number | string;
  totalTransaksi?: number | string;
  status: string; // Aktif, Menunggu Verifikasi, Ditolak, Nonaktif
  qrCode?: string;
  qr_code?: string;
  barcode?: string;
  createdAt?: string;
}

export interface BengkelSettings {
  nama_bengkel?: string;
  lokasi?: string;
  rating?: string;
  jumlah_kendaraan?: string;
  pengalaman?: string;
  garansi?: string;
  whatsapp_admin?: string;
  tagline?: string;
  receiptFooter?: string;
}

export interface HeroBannerItem {
  id?: string;
  url_gambar?: string;
  banner?: string;
  displayImageUrl?: string;
  link_tujuan?: string;
  action_url?: string;
  actionTarget?: string;
  link?: string;
  url?: string;
  status?: string | boolean;
  nomor_urut?: number | string;
  is_clickable?: boolean;
  clickable?: boolean;
  tanggal_aktif?: string;
  tanggal_berakhir?: string;
}

export interface ServiceRincian {
  nama: string;
  harga: string;
}

export interface ServiceItem {
  id: string;
  judul: string;
  icon?: string;
  status?: string;
  deskripsi?: string;
  tag?: string;
  rincian?: ServiceRincian[];
}

export interface PromoItem {
  id: string;
  judul?: string;
  name?: string;
  deskripsi?: string;
  description?: string;
  banner?: string;
  url_gambar?: string;
  displayBannerUrl?: string;
  status?: string | boolean;
  tanggal_mulai?: string;
  tanggal_berakhir?: string;
  tanggal?: string;
  badge?: string;
  diskon_jasa_persen?: number;
}

export interface BookingData {
  id: string;
  nama: string;
  whatsapp: string;
  tanggal_servis: string;
  kategori: string;
  jenis_kendaraan?: string;
  kendaraan: string;
  plat_nomor?: string;
  keluhan: string;
  promo?: string;
  promoId?: string;
  status: 'Menunggu' | 'Proses' | 'Menunggu Sparepart' | 'Selesai' | 'Batal' | string;
  montir?: string;
  tanggal: string;
  alamat?: string;
  share_loc?: string;
  jam_booking?: string;
  jam?: string;
  created_at?: number;
  timestamp?: number;
  biaya_jasa?: number;
  biaya_sparepart?: number;
  catatan_mekanik?: string;
  jasa_detail?: string;
  sparepart_detail?: string;
  rekomendasi_kilometer?: number;
  userId?: string;
}

export interface MemberBenefit {
  nama?: string;
  keterangan?: string;
}

export interface MemberData {
  id: string; // e.g. DNE-MBR-202608001
  nomorMember?: string;
  nomor_member?: string;
  nama: string;
  namaPelanggan?: string;
  whatsapp?: string; // Key utama (628...)
  wa?: string;
  email?: string;
  level?: string; // Bronze, Silver, Gold, Platinum
  masaBerlaku?: string;
  masa_berlaku?: string;
  masa_aktif?: string;
  tanggal_berakhir?: string;
  tanggalBergabung?: string;
  tanggal_bergabung?: string;
  poin?: number;
  jumlah_poin?: number | string;
  totalKunjungan?: number | string;
  total_kunjungan?: string;
  totalTransaksi?: number | string;
  total_transaksi?: string;
  kendaraan?: string;
  kendaraanList?: string[];
  kendaraan_registered?: string;
  alamat?: string;
  catatan?: string;
  status?: string; // Aktif, Ditolak, Menunggu, Nonaktif
  qrCode?: string;
  qr_code?: string;
  barcode?: string;
  benefit?: MemberBenefit[] | string[] | string;
  alasanPenolakan?: string;
  alasan_penolakan?: string;
}

export interface NotificationModal {
  icon: string;
  title: string;
  desc: string;
  show: boolean;
}
