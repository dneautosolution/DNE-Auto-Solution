import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getDatabase, 
  ref, 
  set, 
  get, 
  child, 
  onValue, 
  update
} from 'firebase/database';
import { 
  BengkelSettings, 
  BookingData, 
  HeroBannerItem, 
  MemberData, 
  PromoItem, 
  ServiceItem, 
  UserAccount, 
  MembershipSettings 
} from '../types';

const firebaseConfig = { 
  databaseURL: "https://dneautosolution-5a2b1-default-rtdb.firebaseio.com/" 
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const database = getDatabase(app);

// Strict WhatsApp Normalization to standard 628...
export function normalizeWhatsApp(phone?: string): string {
  if (!phone) return '';
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) {
    digits = '62' + digits.slice(1);
  } else if (digits.startsWith('8')) {
    digits = '62' + digits;
  }
  return digits;
}

// Helper WIB (Asia/Jakarta)
export function getWIBDateString(): string {
  try {
    const options: Intl.DateTimeFormatOptions = { 
      timeZone: 'Asia/Jakarta', 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    };
    const formatter = new Intl.DateTimeFormat('en-CA', options);
    return formatter.format(new Date()); // YYYY-MM-DD
  } catch {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }
}

// Format Rupiah currency
export function formatRupiah(amount: number | string = 0): string {
  const num = typeof amount === 'number' ? amount : parseInt(String(amount).replace(/\D/g, '') || '0', 10);
  return 'Rp ' + num.toLocaleString('id-ID');
}

// Default settings if offline
export const defaultSettings: BengkelSettings = {
  nama_bengkel: "DNE Auto Solution",
  lokasi: "Purwokerto & Sekitarnya",
  rating: "4.9/5",
  jumlah_kendaraan: "1.000+",
  pengalaman: "10+",
  garansi: "100%",
  whatsapp_admin: "62881080809993"
};

export const defaultMembershipSettings: MembershipSettings = {
  benefitBronze: ["Diskon Jasa 2%", "Diskon Sparepart 1%", "Gratis Pengecekan Kendaraan"],
  benefitSilver: ["Diskon Jasa 5%", "Diskon Sparepart 3%", "Gratis Pengecekan Kendaraan", "Gratis Reminder Service"],
  benefitGold: ["Diskon Jasa 10%", "Diskon Sparepart 5%", "Gratis Pengecekan & Cuci", "Gratis Reminder Service", "Prioritas Booking"],
  benefitPlatinum: ["Diskon Jasa 15%", "Diskon Sparepart 10%", "Gratis Pengecekan & Cuci VIP", "Gratis Reminder Service", "Prioritas Utama Booking", "Voucher Ulang Tahun & Bonus Poin"],
  biayaPendaftaran: 20000,
  diskonJasaBronze: 3,
  diskonJasaSilver: 5,
  diskonJasaGold: 7,
  diskonJasaPlatinum: 10,
  diskonSparepartBronze: 1,
  diskonSparepartSilver: 3,
  diskonSparepartGold: 5,
  diskonSparepartPlatinum: 7,
  masaAktifTipe: "Seumur Hidup",
  nilaiRupiahPerPoin: 500,
  poinPerKelipatanTransaksi: 10000
};

// Retrieve benefit array based on membership level from management settings
export function getBenefitsForLevel(level: string = 'Bronze', settings?: MembershipSettings): string[] {
  const s = settings || defaultMembershipSettings;
  const l = (level || '').toLowerCase();
  if (l.includes('plat')) return s.benefitPlatinum || defaultMembershipSettings.benefitPlatinum!;
  if (l.includes('gold')) return s.benefitGold || defaultMembershipSettings.benefitGold!;
  if (l.includes('silv')) return s.benefitSilver || defaultMembershipSettings.benefitSilver!;
  return s.benefitBronze || defaultMembershipSettings.benefitBronze!;
}

export const defaultBanners: HeroBannerItem[] = [
  {
    id: "banner-1",
    url_gambar: "https://i.ibb.co.com/bM4vs9b4/hero1.png",
    link_tujuan: "Tidak Ada",
    status: "Aktif",
    nomor_urut: 1
  },
  {
    id: "banner-2",
    url_gambar: "https://i.ibb.co.com/JFBL22yf/1785726613711.png",
    link_tujuan: "booking",
    status: "Aktif",
    nomor_urut: 2
  },
  {
    id: "banner-3",
    url_gambar: "https://i.ibb.co.com/Y42DLkmH/1785726842327.png",
    link_tujuan: "Tidak Ada",
    status: "Aktif",
    nomor_urut: 3
  }
];

export const defaultServices: Record<string, ServiceItem> = {
  "car_service": {
    id: "car_service",
    judul: "Car Service",
    icon: "🚗",
    status: "Active",
    deskripsi: "Tune-up mesin, ganti oli, servis sistem rem, perbaikan kelistrikan, ganti aki, dan kaki-kaki mobil.",
    rincian: [
      { nama: "Tune Up Mesin", harga: "Rp 250.000" },
      { nama: "Ganti Oli Mesin + Filter Oli", harga: "Rp 50.000" },
      { nama: "Servis Rem 4 Roda", harga: "Rp 200.000" },
      { nama: "Tune Up + Gurah", harga: "Rp 500.000" },
      { nama: "Layanan Darurat / Mogok", harga: "Biaya Sesuai Penanganan" }
    ]
  },
  "motor_service": {
    id: "motor_service",
    judul: "Motor Service",
    icon: "🏍️",
    status: "Active",
    deskripsi: "Servis berkala matic & manual, bersihkan injeksi/karburator, ganti oli, serta perawatan CVT.",
    rincian: [
      { nama: "Servis Ringan Berkala", harga: "Rp 60.000" },
      { nama: "Servis CVT", harga: "Rp 50.000" },
      { nama: "Bersihkan Injeksi / Karburator", harga: "Rp 50.000" },
      { nama: "Tune Up", harga: "Rp 110.000" },
      { nama: "Layanan Darurat / Mogok", harga: "Biaya Sesuai Penanganan" }
    ]
  },
  "service_sparepart": {
    id: "service_sparepart",
    judul: "Sparepart",
    icon: "⚙️",
    status: "Active",
    deskripsi: "Suku cadang dan oli berkualitas resmi untuk motor dan mobil.",
    rincian: [
      { nama: "Federal Oli Mesin 0.8 L", harga: "Rp 65.000" },
      { nama: "Federal Oli Mesin 1 L", harga: "Rp 75.000" },
      { nama: "Oli Gardan 150 ml", harga: "Rp 25.000" }
    ]
  }
};

export const defaultPromos: Record<string, PromoItem> = {};

// WhatsApp Admin launcher
export function openWhatsAppAdmin(customMessage?: string, adminPhone = "62881080809993") {
  const cleanPhone = normalizeWhatsApp(adminPhone) || "62881080809993";
  const text = encodeURIComponent(customMessage || 'Halo Admin, saya ingin bertanya seputar layanan di DNE Auto Solution.');
  window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
}

// Live Firebase Connection State
export function subscribeToFirebaseConnection(onStatusChange: (connected: boolean) => void) {
  const connectedRef = ref(database, '.info/connected');
  return onValue(connectedRef, (snap) => {
    onStatusChange(Boolean(snap.val()));
  });
}

// Live Settings Listener
export function subscribeToLiveSettings(onSettings: (settings: BengkelSettings) => void) {
  const appSettingsRef = ref(database, 'app_settings');
  const settingsRef = ref(database, 'settings');

  let merged: BengkelSettings = { ...defaultSettings };

  const unsubAppSettings = onValue(appSettingsRef, (snap) => {
    if (snap.exists()) {
      const data = snap.val();
      const phone = normalizeWhatsApp(data.whatsapp || data.whatsapp_admin) || merged.whatsapp_admin;

      merged = {
        ...merged,
        nama_bengkel: data.company || data.nama_bengkel || merged.nama_bengkel,
        lokasi: data.address || data.lokasi || merged.lokasi,
        whatsapp_admin: phone,
        rating: data.rating || merged.rating || "4.9/5",
        jumlah_kendaraan: data.jumlah_kendaraan || merged.jumlah_kendaraan || "1.000+",
        pengalaman: data.pengalaman || merged.pengalaman || "10+",
        garansi: data.garansi || merged.garansi || "100%",
        tagline: data.tagline || "Motor & Car Service",
        receiptFooter: data.receiptFooter
      };
      onSettings(merged);
    }
  });

  const unsubSettings = onValue(settingsRef, (snap) => {
    if (snap.exists()) {
      const data = snap.val();
      merged = {
        ...merged,
        ...data,
        nama_bengkel: data.nama_bengkel || data.company || merged.nama_bengkel,
        whatsapp_admin: normalizeWhatsApp(data.whatsapp_admin || data.whatsapp) || merged.whatsapp_admin
      };
      onSettings(merged);
    }
  });

  return () => {
    unsubAppSettings();
    unsubSettings();
  };
}

// Live Membership Settings Listener (Benefit & Rules from Management App)
export function subscribeToMembershipSettings(onSettings: (settings: MembershipSettings) => void) {
  const settingsRef = ref(database, 'membership_settings');
  return onValue(settingsRef, (snap) => {
    if (snap.exists()) {
      onSettings(snap.val());
    } else {
      onSettings(defaultMembershipSettings);
    }
  });
}

// Fetch member by WhatsApp without duplicate creation
export async function getMemberByWhatsApp(rawPhone: string): Promise<MemberData | null> {
  const cleanWa = normalizeWhatsApp(rawPhone);
  if (!cleanWa) return null;

  try {
    const snap = await get(ref(database, 'members'));
    if (snap.exists()) {
      const allMembers = snap.val();
      for (const k in allMembers) {
        const m = allMembers[k];
        if (!m) continue;
        const memberWa = normalizeWhatsApp(m.whatsapp || m.wa);
        if (memberWa === cleanWa) {
          return {
            ...m,
            id: m.id || m.nomorMember || k,
            nomorMember: m.nomorMember || m.id || k,
            nama: m.nama || m.namaPelanggan || 'Member',
            whatsapp: memberWa,
            level: m.level || 'Bronze',
            poin: m.poin !== undefined ? m.poin : (m.jumlah_poin !== undefined ? Number(m.jumlah_poin) : 0),
            status: m.status || 'Aktif',
            masaBerlaku: m.masaBerlaku || m.masa_berlaku || 'Seumur Hidup',
            kendaraan: m.kendaraan || (m.kendaraanList && m.kendaraanList[0]) || m.kendaraan_registered || ''
          };
        }
      }
    }
  } catch (err) {
    console.warn('Error fetching member by WhatsApp', err);
  }
  return null;
}
