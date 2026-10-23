import React, { useState } from 'react';
import { BookingData, NotificationModal } from '../types';
import { database } from '../services/firebase';
import { ref, get } from 'firebase/database';
import { Search } from 'lucide-react';

interface StatusSectionProps {
  onSelectBookingForDetail: (booking: BookingData) => void;
  onShowModal: (modal: Omit<NotificationModal, 'show'>) => void;
}

export const StatusSection: React.FC<StatusSectionProps> = ({
  onSelectBookingForDetail,
  onShowModal
}) => {
  const [digit4, setDigit4] = useState('');
  const [loading, setLoading] = useState(false);
  const [matchingBookings, setMatchingBookings] = useState<BookingData[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null);

  const handleCheckStatus = async () => {
    const trimmed = digit4.trim();
    if (!trimmed || trimmed.length !== 4) {
      onShowModal({
        icon: '💡',
        title: 'Perhatian',
        desc: 'Silakan masukkan tepat 4 digit terakhir nomor booking Anda ya (contoh: 4587).'
      });
      return;
    }

    setLoading(true);
    setSelectedBooking(null);
    setMatchingBookings([]);

    try {
      let matched: BookingData[] = [];

      // Query directly from integrated Firebase Realtime Database
      try {
        const snap = await get(ref(database, 'bookings'));
        if (snap.exists()) {
          const all = snap.val();
          Object.keys(all).forEach((k) => {
            const b = all[k];
            if (!b) return;
            const match = (
              (b.id && (b.id.endsWith(trimmed) || b.id.includes(trimmed))) ||
              (b.whatsapp && b.whatsapp.endsWith(trimmed)) ||
              (b.plat_nomor && b.plat_nomor.replace(/\s+/g, '').includes(trimmed))
            );
            if (match) {
              matched.push({
                ...b,
                id: b.id || k,
                kategori: b.kategori || b.jenis_kendaraan || 'Servis',
                kendaraan: b.kendaraan || 'Kendaraan',
                tanggal_servis: b.tanggal_servis || b.tanggal || '',
                status: b.status || 'Menunggu'
              });
            }
          });
        }
      } catch {
        // Fallback to local storage
      }

      // Also check local storage for newly created offline bookings
      try {
        const local = localStorage.getItem('dne_riwayat_booking');
        if (local) {
          const list: BookingData[] = JSON.parse(local);
          list.forEach((b) => {
            if (b.id && b.id.endsWith(trimmed) && !matched.some(m => m.id === b.id)) {
              matched.push(b);
            }
          });
        }
      } catch {
        // ignore
      }

      setLoading(false);

      if (matched.length === 1) {
        setSelectedBooking(matched[0]);
      } else if (matched.length > 1) {
        setMatchingBookings(matched);
      } else {
        onShowModal({
          icon: '🔍',
          title: 'Data Tidak Ditemukan',
          desc: `Maaf, kami tidak menemukan data booking dengan 4 digit akhir "<strong>${trimmed}</strong>". Pastikan nomor yang dimasukkan sudah sesuai.`
        });
      }
    } catch {
      setLoading(false);
      onShowModal({
        icon: '⚠️',
        title: 'Gagal Memeriksa Status',
        desc: 'Terjadi kendala saat menghubungkan ke database servis. Silakan coba kembali.'
      });
    }
  };

  const getStatusBadgeClass = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'selesai') return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40';
    if (s === 'proses') return 'bg-blue-500/20 text-blue-400 border border-blue-500/40';
    if (s === 'menunggu') return 'bg-amber-500/20 text-amber-400 border border-amber-500/40';
    if (s === 'menunggu sparepart') return 'bg-purple-500/20 text-purple-400 border border-purple-500/40';
    return 'bg-red-500/20 text-red-400 border border-red-500/40';
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 pb-16">
      <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-2">
        Cek <span className="text-red-600">Status Servis</span>
      </h2>

      <div className="bg-[#14141c] border border-[#22222e] rounded-2xl p-5 shadow-xl">
        <label className="block text-[10px] font-semibold text-slate-300 uppercase mb-1">
          4 Digit Terakhir Nomor Booking
        </label>
        
        <div className="flex gap-2 mb-1.5">
          <input
            type="text"
            maxLength={4}
            placeholder="Contoh: 4587"
            value={digit4}
            onChange={(e) => setDigit4(e.target.value.replace(/\D/g, ''))}
            className="flex-1 bg-[#0b0b0e] border border-[#2a2a3c] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-600 transition-colors font-mono tracking-widest text-center"
          />
          <button
            onClick={handleCheckStatus}
            disabled={loading}
            className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase px-4 py-2 rounded-lg flex items-center gap-1 shrink-0 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Search className="w-3.5 h-3.5" />
            <span>{loading ? 'Cek...' : 'Cek'}</span>
          </button>
        </div>
        <span className="text-[9px] text-slate-400 block mb-4">
          Ketik 4 digit akhir ID booking Anda (misal ID: DNE-20261022094587, ketik 4587)
        </span>

        {/* Multiple Matches List */}
        {matchingBookings.length > 0 && (
          <div className="mt-4 pt-3 border-t border-[#1f1f2e]">
            <p className="text-[11px] text-amber-400 mb-2 font-medium">
              Ditemukan {matchingBookings.length} booking dengan 4 digit akhir "{digit4}". Silakan pilih:
            </p>
            <div className="space-y-2">
              {matchingBookings.map((b) => (
                <div
                  key={b.id}
                  onClick={() => {
                    setSelectedBooking(b);
                    setMatchingBookings([]);
                  }}
                  className="bg-[#0b0b0e] border border-[#22222e] hover:border-red-500/50 p-3 rounded-xl cursor-pointer flex justify-between items-center transition-all"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white">{b.kendaraan} ({b.id})</h4>
                    <p className="text-[10px] text-slate-400">Pemesan: {b.nama} | {b.tanggal_servis}</p>
                  </div>
                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${getStatusBadgeClass(b.status)}`}>
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Single Booking Result */}
        {selectedBooking && (
          <div className="mt-4 bg-[#0b0b0e] border-l-4 border-l-red-600 border border-[#22222e] rounded-xl p-4 text-left animate-in fade-in duration-200">
            <div className="flex justify-between items-center mb-3">
              <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${getStatusBadgeClass(selectedBooking.status)}`}>
                {selectedBooking.status}
              </span>
              <span className="font-mono text-xs text-slate-400">{selectedBooking.id}</span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300 mb-4">
              <p><strong className="text-white">Nama Pemesan:</strong> {selectedBooking.nama}</p>
              <p><strong className="text-white">Kendaraan:</strong> {selectedBooking.kategori} - {selectedBooking.kendaraan}</p>
              <p><strong className="text-white">Jadwal:</strong> {selectedBooking.tanggal_servis}</p>
              <p><strong className="text-white">Keluhan:</strong> {selectedBooking.keluhan || 'Tidak ada catatan'}</p>
              <p><strong className="text-white">Montir Penanggung Jawab:</strong> <span className="text-emerald-400 font-semibold">{selectedBooking.montir || 'Belum ditentukan'}</span></p>
            </div>

            <button
              onClick={() => onSelectBookingForDetail(selectedBooking)}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs uppercase tracking-wider py-2 px-3 rounded-lg shadow-md transition-all cursor-pointer"
            >
              Lihat Timeline Pengerjaan Lengkap →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
