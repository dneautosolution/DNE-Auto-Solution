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

export interface UserAccount {
  id: string; // e.g. MBR-2026-004821
  nama: string;
  email: string;
  whatsapp: string;
  password?: string;
  kendaraanDefault?: string;
  kategoriDefault?: string;
  alamat?: string;
  level: string;
  masa_aktif: string;
  tanggal_berakhir: string;
  jumlah_poin: number;
  status: string;
  qr_code?: string;
  createdAt: string;
}

export interface BengkelSettings {
  nama_bengkel?: string;
  lokasi?: string;
  rating?: string;
  jumlah_kendaraan?: string;
  pengalaman?: string;
  garansi?: string;
  whatsapp_admin?: string;
}

export interface HeroBannerItem {
  id?: string;
  url_gambar?: string;
  banner?: string;
  link_tujuan?: string;
  link?: string;
  url?: string;
  status?: string | boolean;
  nomor_urut?: number | string;
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
  status?: string | boolean;
  tanggal_mulai?: string;
  tanggal_berakhir?: string;
  tanggal?: string;
}

export interface BookingData {
  id: string;
  nama: string;
  whatsapp: string;
  tanggal_servis: string;
  kategori: string;
  kendaraan: string;
  keluhan: string;
  promo?: string;
  promoId?: string;
  status: 'Menunggu' | 'Proses' | 'Menunggu Sparepart' | 'Selesai' | 'Batal' | string;
  montir?: string;
  tanggal: string;
  alamat?: string;
  share_loc?: string;
  jam_booking?: string;
}

export interface MemberBenefit {
  nama?: string;
  keterangan?: string;
}

export interface MemberData {
  id: string;
  nama: string;
  whatsapp?: string;
  level?: string;
  masa_aktif?: string;
  tanggal_berakhir?: string;
  jumlah_poin?: number | string;
  status?: 'AKTIF' | 'DITOLAK' | 'MENUNGGU' | string;
  qr_code?: string;
  benefit?: MemberBenefit[] | string;
  alasan_penolakan?: string;
  alasan?: string;
}

export interface NotificationModal {
  icon: string;
  title: string;
  desc: string;
  show: boolean;
}
