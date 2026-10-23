import React, { useState, useEffect } from 'react';
import { BookingData, PageType, NotificationModal, UserAccount } from '../types';
import { getWIBDateString, database } from '../services/firebase';
import { ref, get, set } from 'firebase/database';
import { MapPin, CheckCircle, ArrowRight, ArrowLeft, UserCheck } from 'lucide-react';

interface BookingSectionProps {
  initialKategori?: string;
  initialTanggal?: string;
  initialJam?: string;
  claimedPromo: { id: string; title: string } | null;
  currentUser?: UserAccount | null;
  onClearPromo: () => void;
  onBookingSuccess: (bookingId: string) => void;
  onShowModal: (modal: Omit<NotificationModal, 'show'>) => void;
  prefilledKeluhan?: string;
}

export const BookingSection: React.FC<BookingSectionProps> = ({
  initialKategori,
  initialTanggal,
  initialJam,
  claimedPromo,
  currentUser,
  onClearPromo,
  onBookingSuccess,
  onShowModal,
  prefilledKeluhan
}) => {
  const [step, setStep] = useState(1);
  const todayStr = getWIBDateString();

  // Form states initialized with currentUser if present
  const [tanggalBooking, setTanggalBooking] = useState(initialTanggal || todayStr);
  const [jamBooking, setJamBooking] = useState(initialJam || "08:00");
  
  const [nama, setNama] = useState(currentUser?.nama || "");
  const [whatsapp, setWhatsapp] = useState(currentUser?.whatsapp || "");
  const [shareLoc, setShareLoc] = useState("");
  const [alamat, setAlamat] = useState(currentUser?.alamat || "");
  const [kategori, setKategori] = useState(initialKategori || currentUser?.kategoriDefault || "Mobil (Car Service) 🚗");
  const [kendaraan, setKendaraan] = useState(currentUser?.kendaraanDefault || "");
  const [keluhan, setKeluhan] = useState(prefilledKeluhan || "");

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialTanggal) setTanggalBooking(initialTanggal);
    if (initialJam) setJamBooking(initialJam);
    if (initialKategori) setKategori(initialKategori);
    if (prefilledKeluhan) setKeluhan(prefilledKeluhan);
  }, [initialTanggal, initialJam, initialKategori, prefilledKeluhan]);

  useEffect(() => {
    if (currentUser) {
      if (!nama) setNama(currentUser.nama);
      if (!whatsapp) setWhatsapp(currentUser.whatsapp);
      if (!alamat && currentUser.alamat) setAlamat(currentUser.alamat);
      if (!kendaraan && currentUser.kendaraanDefault) setKendaraan(currentUser.kendaraanDefault);
      if (currentUser.kategoriDefault && !initialKategori) setKategori(currentUser.kategoriDefault);
    }
  }, [currentUser]);

  const handleGpsClick = () => {
    if (navigator.geolocation) {
      setShareLoc("Mendeteksi lokasi...");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const locUrl = `https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`;
          setShareLoc(locUrl);
          onShowModal({
            icon: '📍',
            title: 'Lokasi Berhasil Ditemukan',
            desc: 'Titik koordinat lokasi Anda berhasil disematkan ke formulir booking.'
          });
        },
        () => {
          setShareLoc("");
          onShowModal({
            icon: '⚠️',
            title: 'Kendala Lokasi',
            desc: 'Kami belum berhasil mendeteksi lokasi GPS Anda secara otomatis. Silakan tulis alamat manual.'
          });
        }
      );
    } else {
      onShowModal({
        icon: '⚠️',
        title: 'GPS Tidak Didukung',
        desc: 'Browser Anda tidak mendukung deteksi lokasi otomatis. Silakan tulis alamat manual.'
      });
    }
  };

  const handleNextToStep2 = () => {
    if (!tanggalBooking) {
      onShowModal({
        icon: '💡',
        title: 'Tanggal Belum Dipilih',
        desc: 'Silakan pilih tanggal booking servis terlebih dahulu.'
      });
      return;
    }
    setStep(2);
  };

  const handleNextToStep3 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !whatsapp.trim() || !kendaraan.trim() || !keluhan.trim()) {
      onShowModal({
        icon: '💡',
        title: 'Data Belum Lengkap',
        desc: 'Mohon isi nama, WhatsApp, data kendaraan, dan keluhan secara lengkap.'
      });
      return;
    }
    setStep(3);
  };

  const handleSubmitBooking = async () => {
    setIsSubmitting(true);
    let wa = whatsapp.trim();
    if (wa.startsWith('0')) wa = '62' + wa.slice(1);

    try {
      // 1. Check if user already has an active booking
      let adaBookingAktif = false;
      const snapshot = await get(ref(database, 'bookings'));
      if (snapshot.exists()) {
        const allBookings = snapshot.val();
        Object.keys(allBookings).forEach((key) => {
          const b = allBookings[key];
          if (b && (b.whatsapp === wa || b.whatsapp === whatsapp.trim())) {
            const statusB = (b.status || '').toLowerCase();
            if (statusB === 'menunggu' || statusB === 'proses' || statusB === 'menunggu sparepart') {
              adaBookingAktif = true;
            }
          }
        });
      }

      if (adaBookingAktif) {
        setIsSubmitting(false);
        onShowModal({
          icon: '⚠️',
          title: 'Gagal Melakukan Booking',
          desc: 'Anda masih memiliki riwayat servis yang <strong>belum selesai</strong> di sistem. Anda baru bisa membuat booking baru setelah status sebelumnya berubah menjadi <strong>Selesai</strong>.'
        });
        return;
      }

      // 2. Check if promo is still valid
      if (claimedPromo?.id) {
        try {
          const promoSnap = await get(ref(database, `promos/${claimedPromo.id}`));
          if (promoSnap.exists()) {
            const pData = promoSnap.val();
            const todayWIB = getWIBDateString();
            if (pData.tanggal_berakhir && todayWIB > pData.tanggal_berakhir) {
              setIsSubmitting(false);
              onShowModal({
                icon: '❌',
                title: 'Promo Ditolak Sistem',
                desc: `Maaf, promo <strong>${claimedPromo.title}</strong> sudah berstatus <strong>EXPIRED</strong> dan tidak dapat digunakan.`
              });
              return;
            }
          }
        } catch {
          // ignore network glitch and proceed
        }
      }

      // 3. Generate Unique Booking ID
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hour = String(now.getHours()).padStart(2, '0');
      const minute = String(now.getMinutes()).padStart(2, '0');
      const randomSuffix = Math.floor(10 + Math.random() * 90);
      const idBooking = `DNE-${year}${month}${day}${hour}${minute}${randomSuffix}`;

      const dataBooking: BookingData = {
        id: idBooking,
        nama: nama.trim(),
        whatsapp: wa,
        tanggal_servis: `${tanggalBooking} (${jamBooking} WIB)`,
        kategori,
        kendaraan: kendaraan.trim(),
        keluhan: keluhan.trim(),
        promo: claimedPromo ? claimedPromo.title : 'Tidak Ada',
        promoId: claimedPromo ? claimedPromo.id : '',
        status: 'Menunggu',
        montir: 'Belum ditentukan',
        tanggal: getWIBDateString(),
        alamat: alamat.trim(),
        share_loc: shareLoc.trim(),
        jam_booking: jamBooking
      };

      // 4. Save to Firebase RTDB
      try {
        await set(ref(database, 'bookings/' + idBooking), dataBooking);
      } catch (err) {
        console.warn('Realtime database write error, continuing with local state', err);
      }

      // 5. Save to Local Storage for user history
      let riwayat: BookingData[] = [];
      try {
        const local = localStorage.getItem('dne_riwayat_booking');
        if (local) riwayat = JSON.parse(local);
      } catch {
        riwayat = [];
      }
      riwayat.unshift(dataBooking);
      localStorage.setItem('dne_riwayat_booking', JSON.stringify(riwayat));

      setIsSubmitting(false);
      onBookingSuccess(idBooking);
    } catch {
      setIsSubmitting(false);
      onShowModal({
        icon: '⚠️',
        title: 'Kendala Koneksi',
        desc: 'Mohon maaf, terjadi kendala saat menyimpan pesanan. Silakan periksa koneksi dan coba lagi.'
      });
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-4 pb-16">
      <h2 className="text-base font-bold uppercase tracking-wider text-white mb-3">
        Booking <span className="text-red-600">Servis</span>
      </h2>

      {/* Stepper Header */}
      <div className="bg-[#14141c] border border-[#22222e] rounded-xl p-3 mb-4 flex justify-between items-center shadow-md">
        {[
          { num: 1, label: 'Jadwal' },
          { num: 2, label: 'Kendaraan' },
          { num: 3, label: 'Konfirmasi' },
          { num: 4, label: 'Selesai' }
        ].map((item) => {
          const isCompleted = step > item.num;
          const isActive = step === item.num;
          return (
            <div key={item.num} className="flex flex-col items-center gap-1 z-10 flex-1">
              <div
                className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center border-2 transition-all ${
                  isActive
                    ? 'bg-red-600 border-red-500 text-white shadow-[0_0_10px_rgba(220,38,38,0.6)]'
                    : isCompleted
                    ? 'bg-emerald-600 border-emerald-500 text-white'
                    : 'bg-[#22222e] border-[#2a2a3c] text-zinc-500'
                }`}
              >
                {isCompleted ? '✓' : item.num}
              </div>
              <span className={`text-[9px] font-semibold ${isActive ? 'text-white' : 'text-slate-400'}`}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* STEP 1: JADWAL */}
      {step === 1 && (
        <div className="bg-[#14141c] border border-[#22222e] rounded-2xl p-5 shadow-xl animate-in fade-in duration-200">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
            Pilih Jadwal Kunjungan Servis
          </h3>

          {claimedPromo && (
            <div className="mb-3.5 p-3 rounded-lg bg-amber-500/10 border border-dashed border-amber-500 flex justify-between items-center">
              <div>
                <span className="text-[9px] uppercase tracking-wider font-bold text-amber-400 block">Voucher Digunakan</span>
                <span className="text-xs font-semibold text-white">{claimedPromo.title}</span>
              </div>
              <button
                type="button"
                onClick={onClearPromo}
                className="text-[10px] text-red-400 hover:text-red-300 font-bold px-2 py-1"
              >
                Hapus
              </button>
            </div>
          )}

          <div className="space-y-3.5">
            <div>
              <label className="block text-[10px] font-semibold text-slate-300 uppercase mb-1">
                Tanggal Booking
              </label>
              <input
                type="date"
                min={todayStr}
                value={tanggalBooking}
                onChange={(e) => setTanggalBooking(e.target.value)}
                className="w-full bg-[#0b0b0e] border border-[#2a2a3c] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-300 uppercase mb-1">
                Pilih Jam Operasional Bengkel
              </label>
              <select
                value={jamBooking}
                onChange={(e) => setJamBooking(e.target.value)}
                className="w-full bg-[#0b0b0e] border border-[#2a2a3c] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600 transition-colors"
              >
                <option value="08:00">08:00 WIB (Pagi)</option>
                <option value="10:00">10:00 WIB (Siang Awal)</option>
                <option value="13:00">13:00 WIB (Siang)</option>
                <option value="15:00">15:00 WIB (Sore)</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextToStep2}
              className="w-full mt-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded-lg shadow-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Lanjutkan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: DATA KENDARAAN & PEMILIK */}
      {step === 2 && (
        <form onSubmit={handleNextToStep3} className="bg-[#14141c] border border-[#22222e] rounded-2xl p-5 shadow-xl animate-in fade-in duration-200">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
            Data Kendaraan & Pemilik
          </h3>

          {currentUser && (
            <div className="mb-3.5 px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-2 text-xs text-emerald-400">
              <UserCheck className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Data terisi otomatis dari akun member Anda (<strong>{currentUser.nama}</strong>).</span>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-semibold text-slate-300 uppercase mb-1">
                Nama Pemilik / Pemesan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Masukkan nama lengkap Anda"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="w-full bg-[#0b0b0e] border border-[#2a2a3c] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-600 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-300 uppercase mb-1">
                Nomor WhatsApp Aktif <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                placeholder="Contoh: 081234567890"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full bg-[#0b0b0e] border border-[#2a2a3c] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-600 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-300 uppercase mb-1">
                Titik Peta / GPS <span className="text-amber-400 font-normal">(Opsional)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Klik tombol Cari GPS di samping"
                  value={shareLoc}
                  onChange={(e) => setShareLoc(e.target.value)}
                  className="flex-1 bg-[#0b0b0e] border border-[#2a2a3c] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-600 transition-colors"
                />
                <button
                  type="button"
                  onClick={handleGpsClick}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] px-3 py-2 rounded-lg flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                >
                  <MapPin className="w-3 h-3" />
                  <span>GPS</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-300 uppercase mb-1">
                Alamat Lengkap Kunjungan / Penjemputan
              </label>
              <input
                type="text"
                placeholder="Nama jalan, nomor rumah, atau patokan lokasi"
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                className="w-full bg-[#0b0b0e] border border-[#2a2a3c] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-600 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-300 uppercase mb-1">
                Kategori Kendaraan <span className="text-red-500">*</span>
              </label>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="w-full bg-[#0b0b0e] border border-[#2a2a3c] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600 transition-colors"
                required
              >
                <option value="Mobil (Car Service) 🚗">Mobil (Car Service) 🚗</option>
                <option value="Motor (Motor Service) 🏍️">Motor (Motor Service) 🏍️</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-300 uppercase mb-1">
                Merek & Tipe Kendaraan, Plat Nomor <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Honda Vario 150 / R 1234 DNE"
                value={kendaraan}
                onChange={(e) => setKendaraan(e.target.value)}
                className="w-full bg-[#0b0b0e] border border-[#2a2a3c] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-600 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-300 uppercase mb-1">
                Keluhan & Detail Kerusakan / Servis <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Tuliskan keluhan kendaraan, getaran, bunyi abnormal, atau servis yang diinginkan..."
                value={keluhan}
                onChange={(e) => setKeluhan(e.target.value)}
                className="w-full bg-[#0b0b0e] border border-[#2a2a3c] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-600 transition-colors"
                required
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali</span>
              </button>
              <button
                type="submit"
                className="flex-[2] bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded-lg shadow-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Konfirmasi</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </form>
      )}

      {/* STEP 3: KONFIRMASI */}
      {step === 3 && (
        <div className="bg-[#14141c] border border-[#22222e] rounded-2xl p-5 shadow-xl animate-in fade-in duration-200">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
            Konfirmasi Pesanan Servis
          </h3>
          <p className="text-[11px] text-slate-400 mb-4">
            Pastikan seluruh data di bawah sudah sesuai sebelum disimpan ke sistem bengkel.
          </p>

          <div className="bg-[#0b0b0e] rounded-xl p-4 border border-[#22222e] space-y-2 text-xs mb-5">
            <div className="flex justify-between border-b border-[#1f1f2e] pb-1.5">
              <span className="text-slate-400">Jadwal Servis:</span>
              <span className="text-white font-semibold">{tanggalBooking} ({jamBooking} WIB)</span>
            </div>
            <div className="flex justify-between border-b border-[#1f1f2e] pb-1.5">
              <span className="text-slate-400">Pemesan:</span>
              <span className="text-white font-semibold">{nama}</span>
            </div>
            <div className="flex justify-between border-b border-[#1f1f2e] pb-1.5">
              <span className="text-slate-400">WhatsApp:</span>
              <span className="text-emerald-400 font-semibold">{whatsapp}</span>
            </div>
            <div className="flex justify-between border-b border-[#1f1f2e] pb-1.5">
              <span className="text-slate-400">Kategori:</span>
              <span className="text-white font-semibold">{kategori}</span>
            </div>
            <div className="flex justify-between border-b border-[#1f1f2e] pb-1.5">
              <span className="text-slate-400">Kendaraan:</span>
              <span className="text-white font-semibold">{kendaraan}</span>
            </div>
            {alamat && (
              <div className="flex justify-between border-b border-[#1f1f2e] pb-1.5">
                <span className="text-slate-400">Alamat:</span>
                <span className="text-slate-200 text-right truncate max-w-[200px]">{alamat}</span>
              </div>
            )}
            {claimedPromo && (
              <div className="flex justify-between border-b border-[#1f1f2e] pb-1.5">
                <span className="text-slate-400">Voucher Promo:</span>
                <span className="text-amber-400 font-bold">{claimedPromo.title}</span>
              </div>
            )}
            <div className="pt-1">
              <span className="text-slate-400 block mb-1">Keluhan / Layanan:</span>
              <p className="text-slate-300 bg-[#14141c] p-2.5 rounded-lg border border-[#22222e] text-[11px] leading-relaxed">
                {keluhan}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setStep(2)}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              Ubah Data
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmitBooking}
              className="flex-[2] bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded-lg shadow-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Memproses...</span>
              ) : (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Kirim Booking</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
