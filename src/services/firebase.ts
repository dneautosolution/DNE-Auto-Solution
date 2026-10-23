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
import { BengkelSettings, BookingData, HeroBannerItem, MemberData, PromoItem, ServiceItem, UserAccount } from '../types';

const firebaseConfig = { 
  databaseURL: "https://dneautosolution-5a2b1-default-rtdb.firebaseio.com/" 
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const database = getDatabase(app);

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

// Fallback Defaults if offline or loading
export const defaultSettings: BengkelSettings = {
  nama_bengkel: "DNE Auto Solution",
  lokasi: "Purwokerto & Sekitarnya",
  rating: "4.9/5",
  jumlah_kendaraan: "1.000+",
  pengalaman: "10+",
  garansi: "100%",
  whatsapp_admin: "62881080809993"
};

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

// WhatsApp Admin launcher helper
export function openWhatsAppAdmin(customMessage?: string, adminPhone = "62881080809993") {
  let cleanPhone = adminPhone.trim();
  if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.slice(1);
  const text = encodeURIComponent(customMessage || 'Halo Kak, saya ingin bertanya seputar layanan di DNE Auto Solution.');
  window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
}

// Real-Time Firebase Synchronizer Helpers
export function subscribeToFirebaseConnection(onStatusChange: (connected: boolean) => void) {
  const connectedRef = ref(database, '.info/connected');
  return onValue(connectedRef, (snap) => {
    onStatusChange(Boolean(snap.val()));
  });
}

export function subscribeToLiveSettings(onSettings: (settings: BengkelSettings) => void) {
  // Listen to both settings and app_settings
  const appSettingsRef = ref(database, 'app_settings');
  const settingsRef = ref(database, 'settings');

  let merged: BengkelSettings = { ...defaultSettings };

  const unsubAppSettings = onValue(appSettingsRef, (snap) => {
    if (snap.exists()) {
      const data = snap.val();
      let phone = data.whatsapp || data.whatsapp_admin || merged.whatsapp_admin;
      if (phone && phone.startsWith('0')) phone = '62' + phone.slice(1);

      merged = {
        ...merged,
        nama_bengkel: data.company || data.nama_bengkel || merged.nama_bengkel,
        lokasi: data.address || data.lokasi || merged.lokasi,
        whatsapp_admin: phone,
        rating: data.rating || merged.rating || "4.9/5",
        jumlah_kendaraan: data.jumlah_kendaraan || merged.jumlah_kendaraan || "1.000+",
        pengalaman: data.pengalaman || merged.pengalaman || "10+",
        garansi: data.garansi || merged.garansi || "100%"
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
        whatsapp_admin: data.whatsapp_admin || data.whatsapp || merged.whatsapp_admin
      };
      onSettings(merged);
    }
  });

  return () => {
    unsubAppSettings();
    unsubSettings();
  };
}
