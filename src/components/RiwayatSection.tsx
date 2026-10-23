import React, { useEffect, useState } from 'react';
import { BookingData, UserAccount } from '../types';
import { database } from '../services/firebase';
import { ref, onValue } from 'firebase/database';
import { Search, Filter, History, Calendar, CheckCircle2 } from 'lucide-react';

interface RiwayatSectionProps {
  currentUser?: UserAccount | null;
  onSelectBooking: (booking: BookingData) => void;
  onNavigateToBooking: () => void;
}

export const RiwayatSection: React.FC<RiwayatSectionProps> = ({
  currentUser,
  onSelectBooking,
  onNavigateToBooking
}) => {
  const [riwayatList, setRiwayatList] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<'my' | 'all'>('my');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // 1. Initial read from localStorage
    let localBookings: BookingData[] = [];
    try {
      const local = localStorage.getItem('dne_riwayat_booking');
      if (local) localBookings = JSON.parse(local);
    } catch {
      localBookings = [];
    }

    // 2. Real-time Firebase RTDB synchronization for bookings
    const bookingsRef = ref(database, 'bookings');
    const unsubscribe = onValue(bookingsRef, (snapshot) => {
      setLoading(false);
      if (snapshot.exists()) {
        const serverBookingsObj = snapshot.val();
        const serverList: BookingData[] = [];

        Object.keys(serverBookingsObj).forEach((k) => {
          const item = serverBookingsObj[k];
          if (item) {
            serverList.push({
              ...item,
              id: item.id || k,
              nama: item.nama || 'Pelanggan',
              whatsapp: item.whatsapp || '',
              kendaraan: item.kendaraan || 'Kendaraan',
              tanggal_servis: item.tanggal_servis || item.tanggal || '',
              status: item.status || 'Menunggu',
              kategori: item.kategori || item.jenis_kendaraan || 'Servis'
            });
          }
        });

        // Sort latest first
        serverList.sort((a, b) => {
          const tA = (a as any).timestamp || (a as any).created_at || 0;
          const tB = (b as any).timestamp || (b as any).created_at || 0;
          return tB - tA;
        });

        // If user is logged in, prioritize user's bookings
        if (currentUser) {
          const cleanWa = currentUser.whatsapp.trim();
          const cleanWa0 = cleanWa.startsWith('62') ? '0' + cleanWa.slice(2) : cleanWa;
          const userMatching = serverList.filter(b => 
            (b.whatsapp && (b.whatsapp === cleanWa || b.whatsapp === cleanWa0 || b.whatsapp === currentUser.whatsapp)) ||
            (b.nama && b.nama.toLowerCase().includes(currentUser.nama.toLowerCase())) ||
            ((b as any).userId && (b as any).userId === currentUser.id)
          );

          if (userMatching.length > 0) {
            setRiwayatList(userMatching);
            return;
          }
        }

        // Merge with local items if available
        if (localBookings.length > 0) {
          const merged = localBookings.map(loc => {
            const serverMatch = serverList.find(s => s.id === loc.id);
            return serverMatch ? { ...loc, ...serverMatch } : loc;
          });
          setRiwayatList(merged);
        } else {
          // If no local bookings, show recent server bookings
          setRiwayatList(serverList.slice(0, 10));
        }
      } else {
        setRiwayatList(localBookings);
      }
    }, () => {
      setLoading(false);
      setRiwayatList(localBookings);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const filteredBookings = riwayatList.filter(item => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.id.toLowerCase().includes(q) ||
      item.kendaraan.toLowerCase().includes(q) ||
      item.nama.toLowerCase().includes(q) ||
      (item.whatsapp && item.whatsapp.includes(q))
    );
  });

  const getStatusBadgeClass = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'selesai') return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40';
    if (s === 'proses') return 'bg-blue-500/20 text-blue-400 border border-blue-500/40';
    if (s === 'menunggu') return 'bg-amber-500/20 text-amber-400 border border-amber-500/40';
    if (s === 'menunggu sparepart') return 'bg-purple-500/20 text-purple-400 border border-purple-500/40';
    return 'bg-red-500/20 text-red-400 border border-red-500/40';
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 pb-20">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-sm font-bold uppercase tracking-wider text-white">
          Riwayat <span className="text-red-600">Booking Servis</span>
        </h2>
        <span className="text-[10px] text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
          Live Firebase Sync
        </span>
      </div>

      <p className="text-xs text-slate-400 mb-3">
        Data pesanan pengerjaan servis Anda disinkronkan secara realtime dengan server bengkel DNE Auto Solution.
      </p>

      {/* Search Filter */}
      <div className="relative mb-4">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Cari berdasarkan ID Booking, Kendaraan, atau Nama..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#14141c] border border-[#2a2a3c] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-600 transition-colors"
        />
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 text-xs">
          <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          Menyinkronkan riwayat booking dari Firebase...
        </div>
      ) : filteredBookings.length > 0 ? (
        <div className="space-y-3">
          {filteredBookings.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectBooking(item)}
              className="bg-[#14141c] border border-[#22222e] hover:border-red-600/60 rounded-xl p-3.5 cursor-pointer flex justify-between items-center shadow-md transition-all hover:-translate-y-0.5 group"
            >
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-red-400 transition-colors">
                  {item.kendaraan}
                </h4>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  ID: <span className="text-emerald-400">{item.id}</span> | Pemesan: {item.nama}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  <span>{item.tanggal_servis}</span>
                </p>
              </div>

              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span className={`text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-full ${getStatusBadgeClass(item.status)}`}>
                  {item.status}
                </span>
                <span className="text-[9px] text-red-400 group-hover:underline">Lihat Detail →</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#14141c] border border-[#22222e] rounded-2xl p-8 text-center">
          <History className="w-10 h-10 text-slate-500 mx-auto mb-2 opacity-50" />
          <p className="text-xs text-slate-400 mb-4">
            {searchQuery ? `Tidak ada booking yang cocok dengan "${searchQuery}".` : 'Belum ada data riwayat booking untuk akun ini.'}
          </p>
          <button
            onClick={onNavigateToBooking}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs uppercase px-4 py-2 rounded-lg shadow-md transition-all cursor-pointer"
          >
            Buat Booking Sekarang
          </button>
        </div>
      )}
    </div>
  );
};
