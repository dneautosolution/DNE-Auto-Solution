import React, { useState, useEffect } from 'react';
import { MemberData, BookingData, NotificationModal, UserAccount, MembershipSettings } from '../types';
import { 
  database, 
  openWhatsAppAdmin, 
  normalizeWhatsApp, 
  formatRupiah,
  subscribeToMembershipSettings,
  defaultMembershipSettings,
  getBenefitsForLevel 
} from '../services/firebase';
import { ref, get, onValue } from 'firebase/database';
import { 
  Search, 
  Headphones, 
  QrCode, 
  Award, 
  Car, 
  Calendar, 
  Sparkles, 
  Clock, 
  CreditCard,
  Phone,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface MembershipSectionProps {
  currentUser?: UserAccount | null;
  onShowModal: (modal: Omit<NotificationModal, 'show'>) => void;
  onSelectBookingDetail: (booking: BookingData) => void;
  adminPhone?: string;
}

export const MembershipSection: React.FC<MembershipSectionProps> = ({
  currentUser,
  onShowModal,
  onSelectBookingDetail,
  adminPhone
}) => {
  const [searchWaInput, setSearchWaInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentMember, setCurrentMember] = useState<MemberData | null>(null);
  const [memberBookings, setMemberBookings] = useState<BookingData[]>([]);
  const [membershipSettings, setMembershipSettings] = useState<MembershipSettings>(defaultMembershipSettings);

  // Subscribe to live membership settings from management app
  useEffect(() => {
    const unsub = subscribeToMembershipSettings((settings) => {
      setMembershipSettings(settings);
    });
    return () => unsub();
  }, []);

  // When logged-in user changes, automatically fetch and bind member data by WhatsApp
  useEffect(() => {
    if (currentUser?.whatsapp) {
      lookupMemberByWhatsApp(currentUser.whatsapp);
    }
  }, [currentUser?.whatsapp]);

  const lookupMemberByWhatsApp = async (phoneInput: string) => {
    const cleanWa = normalizeWhatsApp(phoneInput);
    if (!cleanWa) return;

    setLoading(true);
    try {
      const snap = await get(ref(database, 'members'));
      if (snap.exists()) {
        const allMembers = snap.val();
        let matchedMember: MemberData | null = null;
        let matchedKey = '';

        for (const k in allMembers) {
          const m = allMembers[k];
          if (!m) continue;
          const memberWa = normalizeWhatsApp(m.whatsapp || m.wa);
          const memberId = (m.id || m.nomorMember || k).toLowerCase();

          // Match by full normalized WhatsApp or last 4 digits
          const matchWa = (memberWa === cleanWa) || (cleanWa.length >= 4 && memberWa.endsWith(cleanWa));
          const matchId = memberId === phoneInput.trim().toLowerCase() || memberId.endsWith(phoneInput.trim().toLowerCase());

          if (matchWa || matchId) {
            matchedMember = {
              ...m,
              id: m.id || m.nomorMember || k,
              nomorMember: m.nomorMember || m.id || k,
              nama: m.nama || m.namaPelanggan || 'Member DNE',
              whatsapp: memberWa,
              level: m.level || 'Bronze',
              poin: m.poin !== undefined ? Number(m.poin) : (m.jumlah_poin !== undefined ? Number(m.jumlah_poin) : 0),
              status: m.status || 'Aktif',
              masaBerlaku: m.masaBerlaku || m.masa_berlaku || 'Seumur Hidup',
              totalKunjungan: m.totalKunjungan || m.total_kunjungan || 0,
              totalTransaksi: m.totalTransaksi || m.total_transaksi || 0,
              kendaraan: m.kendaraan || (m.kendaraanList && m.kendaraanList[0]) || m.kendaraan_registered || 'Belum Terdaftar',
              kendaraanList: m.kendaraanList || []
            };
            matchedKey = k;
            break;
          }
        }

        if (matchedMember) {
          setCurrentMember(matchedMember);
          // Set real-time listener on this member record
          onValue(ref(database, `members/${matchedKey}`), (s) => {
            if (s.exists()) {
              const live = s.val();
              setCurrentMember(prev => prev ? { ...prev, ...live } : live);
            }
          });
          // Auto load orders for this WhatsApp
          loadMemberBookings(matchedMember.whatsapp || cleanWa, matchedMember.nama);
        } else {
          setCurrentMember(null);
          onShowModal({
            icon: '🔍',
            title: 'Member Tidak Ditemukan',
            desc: `Nomor WhatsApp atau ID <strong>${phoneInput}</strong> belum terdaftar di sistem Manajemen Bengkel DNE Auto Solution.`
          });
        }
      }
    } catch (err) {
      console.warn('Lookup member error', err);
      onShowModal({
        icon: '⚠️',
        title: 'Kendala Koneksi',
        desc: 'Gagal menghubungkan ke database member. Silakan coba kembali.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchWaInput.trim()) {
      onShowModal({
        icon: '💡',
        title: 'Nomor WhatsApp Kosong',
        desc: 'Silakan masukkan Nomor WhatsApp Anda (contoh: 085700570663).'
      });
      return;
    }
    lookupMemberByWhatsApp(searchWaInput);
  };

  const loadMemberBookings = async (whatsapp?: string, nama?: string) => {
    if (!whatsapp) return;
    const cleanWa = normalizeWhatsApp(whatsapp);

    try {
      const snap = await get(ref(database, 'bookings'));
      if (snap.exists()) {
        const all = snap.val();
        let matched: BookingData[] = [];
        Object.keys(all).forEach((k) => {
          const b = all[k];
          if (!b) return;
          const bWa = normalizeWhatsApp(b.whatsapp);
          if (bWa === cleanWa || (nama && b.nama && b.nama.toLowerCase() === nama.toLowerCase())) {
            matched.push({
              ...b,
              id: b.id || k,
              kategori: b.kategori || b.jenis_kendaraan || 'Servis'
            });
          }
        });
        matched.reverse();
        setMemberBookings(matched);
      }
    } catch {
      // ignore
    }
  };

  const getTierTheme = (level: string = 'Bronze') => {
    const l = level.toLowerCase();
    if (l.includes('plat')) {
      return {
        bg: 'from-[#1e1b2e] via-[#242238] to-[#12111d]',
        border: 'border-purple-300/80',
        badgeBg: 'bg-purple-400/20 text-purple-300 border-purple-400/50',
        glow: 'shadow-[0_10px_35px_rgba(168,85,247,0.3)]',
        accentColor: 'text-purple-300'
      };
    }
    if (l.includes('gold')) {
      return {
        bg: 'from-[#221c10] via-[#1a150c] to-[#0f0d08]',
        border: 'border-amber-400',
        badgeBg: 'bg-amber-400/20 text-amber-300 border-amber-400/50',
        glow: 'shadow-[0_10px_35px_rgba(251,191,36,0.3)]',
        accentColor: 'text-amber-400'
      };
    }
    if (l.includes('silv')) {
      return {
        bg: 'from-[#1a1f2c] via-[#141822] to-[#0d0f15]',
        border: 'border-slate-300/70',
        badgeBg: 'bg-slate-300/20 text-slate-200 border-slate-300/50',
        glow: 'shadow-[0_10px_35px_rgba(148,163,184,0.25)]',
        accentColor: 'text-slate-300'
      };
    }
    // Bronze default
    return {
      bg: 'from-[#221812] via-[#1a120e] to-[#0f0b08]',
      border: 'border-amber-600/80',
      badgeBg: 'bg-amber-600/20 text-amber-400 border-amber-600/50',
      glow: 'shadow-[0_10px_30px_rgba(217,119,6,0.25)]',
      accentColor: 'text-amber-500'
    };
  };

  const tierTheme = getTierTheme(currentMember?.level || 'Bronze');
  const levelBenefits = getBenefitsForLevel(currentMember?.level || 'Bronze', membershipSettings);
  const currentPoints = currentMember?.poin !== undefined ? Number(currentMember.poin) : 0;
  const rupiahValue = currentPoints * (membershipSettings.nilaiRupiahPerPoin || 500);

  const qrSrc = currentMember?.id
    ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(currentMember.id)}`
    : `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=DNE-MEMBER`;

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 pb-20">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-sm font-bold uppercase tracking-wider text-white">
          Pusat <span className="text-amber-400">Membership Bengkel</span>
        </h2>
        <span className="text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
          Database Terhubung
        </span>
      </div>

      <p className="text-xs text-slate-400 mb-4 leading-relaxed">
        Sistem kartu member resmi terintegrasi dengan Aplikasi Manajemen Bengkel DNE Auto Solution. Data ditarik otomatis berdasarkan Nomor WhatsApp.
      </p>

      {/* SEARCH / RETRIEVAL BOX BY WHATSAPP NUMBER */}
      <div className="bg-[#14141c] border border-[#22222e] rounded-2xl p-4 mb-5 shadow-lg">
        <label className="block text-[10px] font-semibold text-slate-300 uppercase mb-1.5 flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5 text-emerald-400" />
          <span>Tarik Data Member Berdasarkan Nomor WhatsApp</span>
        </label>

        <form onSubmit={handleManualSearch} className="flex gap-2 mb-1.5">
          <input
            type="tel"
            placeholder="Ketik Nomor WA (Contoh: 085700570663)..."
            value={searchWaInput}
            onChange={(e) => setSearchWaInput(e.target.value)}
            className="flex-1 bg-[#0b0b0e] border border-[#2a2a3c] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-600 transition-colors"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs uppercase px-4 py-2 rounded-lg flex items-center gap-1 shrink-0 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Search className="w-3.5 h-3.5" />
            <span>{loading ? 'Mencari...' : 'Tarik Data'}</span>
          </button>
        </form>
        <span className="text-[9px] text-slate-400 block">
          Penarikan kartu menggunakan nomor WA yang terdaftar di bengkel tanpa data ganda.
        </span>
      </div>

      {/* OFFICIAL MEMBER CARD (SESUAI KETENTUAN MANAJEMEN BENGKEL) */}
      {currentMember ? (
        <div className={`bg-gradient-to-br ${tierTheme.bg} border-2 ${tierTheme.border} rounded-2xl p-5 mb-5 ${tierTheme.glow} relative overflow-hidden animate-in fade-in zoom-in-95 duration-200`}>
          {/* Card Header */}
          <div className="flex justify-between items-center mb-3.5 border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-2">
              <img 
                src="https://i.ibb.co.com/XrZ9h7jC/DAS-Transparan-Presisi.png" 
                alt="Logo DNE" 
                className="h-6 w-auto"
              />
              <span className="text-[10px] font-bold text-white tracking-wider uppercase">DNE Auto Solution</span>
            </div>
            <span className={`text-[10px] font-extrabold tracking-widest uppercase px-3 py-0.5 rounded-full border ${tierTheme.badgeBg}`}>
              {currentMember.level?.toUpperCase() || 'MEMBER'}
            </span>
          </div>

          {/* Card Main Info */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-[8px] uppercase tracking-widest text-slate-400 block mb-0.5">
                NOMOR MEMBER RESMI
              </span>
              <h4 className="font-mono text-sm font-bold text-emerald-400 mb-2 tracking-wide">
                {currentMember.nomorMember || currentMember.id}
              </h4>

              <span className="text-[8px] uppercase tracking-widest text-slate-400 block mb-0.5">
                NAMA PELANGGAN
              </span>
              <h4 className="text-sm font-bold text-white mb-2">
                {currentMember.nama || currentMember.namaPelanggan}
              </h4>

              <span className="text-[8px] uppercase tracking-widest text-slate-400 block mb-0.5">
                NOMOR WHATSAPP TERDAFTAR
              </span>
              <p className="text-xs font-semibold text-emerald-300 font-mono">
                {currentMember.whatsapp || currentMember.wa}
              </p>
            </div>

            <div className="bg-white p-1.5 rounded-xl shrink-0 shadow-lg text-center">
              <img 
                src={qrSrc} 
                alt="QR Member" 
                className="w-16 h-16 object-contain mx-auto"
              />
              <span className="text-[7px] text-black font-mono font-bold block mt-0.5">SCAN DI KASIR</span>
            </div>
          </div>

          {/* Vehicle Registered in Bengkel */}
          {currentMember.kendaraan && currentMember.kendaraan !== 'Belum Terdaftar' && (
            <div className="mb-3 p-2 rounded-lg bg-black/40 border border-white/10 flex items-center gap-2 text-xs">
              <Car className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="truncate">
                <span className="text-[8px] text-slate-400 uppercase block">Kendaraan Terdaftar di Bengkel:</span>
                <span className="text-white font-medium truncate block">{currentMember.kendaraan}</span>
              </div>
            </div>
          )}

          {/* Stats Grid: Masa Berlaku, Total Kunjungan, Poin, Total Transaksi */}
          <div className="border-t border-dashed border-white/20 pt-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="bg-black/30 p-2 rounded-lg border border-white/5">
              <span className="text-[8px] text-slate-400 block uppercase">MASA BERLAKU</span>
              <strong className="text-white text-[11px] block">{currentMember.masaBerlaku || 'Seumur Hidup'}</strong>
            </div>

            <div className="bg-black/30 p-2 rounded-lg border border-white/5">
              <span className="text-[8px] text-slate-400 block uppercase">TOTAL KUNJUNGAN</span>
              <strong className="text-amber-300 text-[11px] block">
                {typeof currentMember.totalKunjungan === 'number' ? `${currentMember.totalKunjungan} Kali` : (currentMember.totalKunjungan || '0 Kali')}
              </strong>
            </div>

            <div className="bg-black/30 p-2 rounded-lg border border-white/5">
              <span className="text-[8px] text-slate-400 block uppercase">POIN AKTIF</span>
              <strong className="text-emerald-400 text-[11px] block">
                {currentPoints} Poin
              </strong>
              <span className="text-[8px] text-slate-400 block">≈ {formatRupiah(rupiahValue)}</span>
            </div>

            <div className="bg-black/30 p-2 rounded-lg border border-white/5">
              <span className="text-[8px] text-slate-400 block uppercase">TOTAL TRANSAKSI</span>
              <strong className="text-white text-[11px] block truncate">
                {typeof currentMember.totalTransaksi === 'number' ? formatRupiah(currentMember.totalTransaksi) : (currentMember.totalTransaksi || 'Rp 0')}
              </strong>
            </div>
          </div>
        </div>
      ) : (
        /* Empty / Initial State */
        <div className="bg-[#14141c] border border-[#22222e] rounded-2xl p-6 text-center mb-5">
          <CreditCard className="w-12 h-12 text-slate-500 mx-auto mb-2 opacity-50" />
          <h3 className="text-sm font-bold text-white mb-1">Kartu Member Digital DNE</h3>
          <p className="text-xs text-slate-400 mb-4 max-w-sm mx-auto">
            Masukkan Nomor WhatsApp di atas untuk menarik data kartu member Anda yang tersimpan di sistem bengkel.
          </p>
        </div>
      )}

      {/* BENEFIT EKSKLUSIF BERDASARKAN KETENTUAN MANAJEMEN BENGKEL */}
      <div className="bg-[#14141c] border border-[#22222e] rounded-2xl p-5 mb-5 shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <Award className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            Hak Istimewa & Benefit Member <span className="text-amber-400">{currentMember?.level || 'DNE'}</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {levelBenefits.map((benefitText, idx) => (
            <div key={idx} className="bg-[#0b0b0e] border border-[#22222e] p-2.5 rounded-xl flex items-center gap-2.5 text-xs">
              <div className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span className="text-slate-200 font-medium">{benefitText}</span>
            </div>
          ))}
        </div>

        <div className="mt-3.5 pt-3 border-t border-[#1f1f2e] grid grid-cols-2 gap-2 text-[10px] text-slate-400">
          <div>
            <span className="block text-slate-500">Nilai Tukar Poin:</span>
            <strong className="text-emerald-400">1 Poin = {formatRupiah(membershipSettings.nilaiRupiahPerPoin || 500)}</strong>
          </div>
          <div>
            <span className="block text-slate-500">Minimal Penukaran Poin:</span>
            <strong className="text-amber-300">{membershipSettings.minPoinRedeem || 10} Poin</strong>
          </div>
        </div>
      </div>

      {/* RIWAYAT SERVIS KHUSUS MEMBER */}
      {currentMember && memberBookings.length > 0 && (
        <div className="bg-[#14141c] border border-[#22222e] rounded-2xl p-5 shadow-xl mb-5">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Riwayat Servis Bengkel: <span className="text-emerald-400">{currentMember.nama}</span>
            </h4>
            <span className="text-[10px] text-slate-400">{memberBookings.length} Pengerjaan</span>
          </div>

          <div className="space-y-2">
            {memberBookings.map((b) => (
              <div
                key={b.id}
                onClick={() => onSelectBookingDetail(b)}
                className="bg-[#0b0b0e] border border-[#22222e] hover:border-red-500/50 p-3 rounded-xl cursor-pointer flex justify-between items-center transition-all text-xs group"
              >
                <div>
                  <h5 className="font-bold text-white group-hover:text-red-400 transition-colors">{b.kendaraan}</h5>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{b.id} | {b.tanggal_servis}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-zinc-800 text-emerald-400 border border-emerald-500/30">
                    {b.status}
                  </span>
                  <span className="text-[10px] text-slate-500 group-hover:text-white">→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONTACT CS ADMIN ASSISTANCE */}
      <div className="bg-[#14141c] border border-[#22222e] rounded-2xl p-4 text-center shadow-md">
        <p className="text-[10px] text-slate-400 mb-2.5">
          Ada pertanyaan seputar level membership, poin servis, atau aktivasi nomor WA baru?
        </p>
        <button
          onClick={() => openWhatsAppAdmin(`Halo Admin Bengkel DNE, saya ingin bertanya seputar status kartu membership nomor WA ${currentMember?.whatsapp || ''}.`, adminPhone)}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold text-xs uppercase py-2.5 px-4 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
        >
          <Headphones className="w-3.5 h-3.5" />
          <span>Hubungi CS Membership Bengkel</span>
        </button>
      </div>
    </div>
  );
};
