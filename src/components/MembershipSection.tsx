import React, { useState, useEffect } from 'react';
import { MemberData, BookingData, NotificationModal, UserAccount } from '../types';
import { database, openWhatsAppAdmin } from '../services/firebase';
import { ref, get, onValue } from 'firebase/database';
import { Search, Headphones, QrCode } from 'lucide-react';

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
  const [digit4, setDigit4] = useState('');
  const [loading, setLoading] = useState(false);
  const [memberList, setMemberList] = useState<{ key: string; data: MemberData }[]>([]);
  const [currentMember, setCurrentMember] = useState<MemberData | null>(null);
  const [memberBookings, setMemberBookings] = useState<BookingData[]>([]);

  useEffect(() => {
    if (currentUser && !currentMember) {
      const memberObj: MemberData = {
        id: currentUser.id,
        nama: currentUser.nama,
        whatsapp: currentUser.whatsapp,
        level: currentUser.level,
        masa_aktif: currentUser.masa_aktif,
        tanggal_berakhir: currentUser.tanggal_berakhir,
        jumlah_poin: currentUser.jumlah_poin,
        status: currentUser.status,
        qr_code: currentUser.qr_code,
        benefit: [
          { nama: 'Diskon Jasa Servis 10%', keterangan: 'Berlaku untuk semua jenis tune up dan servis rem' },
          { nama: 'Gratis Pengecekan 21 Titik', keterangan: 'Inspeksi berkala menyeluruh gratis' },
          { nama: 'Bonus 50 Poin Selamat Datang', keterangan: 'Poin loyalitas langsung aktif' }
        ]
      };
      setCurrentMember(memberObj);
      loadMemberBookings(currentUser.whatsapp, currentUser.nama);
    }
  }, [currentUser]);

  const handleSearchMember = async () => {
    const trimmed = digit4.trim();
    if (!trimmed || trimmed.length !== 4) {
      onShowModal({
        icon: '💡',
        title: 'Perhatian',
        desc: 'Silakan masukkan tepat 4 digit terakhir ID Member Anda ya (contoh: 1245).'
      });
      return;
    }

    setLoading(true);
    setMemberList([]);

    try {
      const snap = await get(ref(database, 'members'));
      let matched: { key: string; data: MemberData }[] = [];

      if (snap.exists()) {
        const allMembers = snap.val();
        Object.keys(allMembers).forEach((key) => {
          const m = allMembers[key];
          if (!m) return;
          const match = (
            (m.id && (m.id.endsWith(trimmed) || m.id.includes(trimmed))) ||
            (m.whatsapp && m.whatsapp.endsWith(trimmed))
          );
          if (match) {
            matched.push({ key, data: m });
          }
        });
      }

      // Also check users node if not found in members
      if (matched.length === 0) {
        const userSnap = await get(ref(database, 'users'));
        if (userSnap.exists()) {
          const allUsers = userSnap.val();
          Object.keys(allUsers).forEach((key) => {
            const u = allUsers[key];
            if (!u) return;
            const match = (
              (u.id && (u.id.endsWith(trimmed) || u.id.includes(trimmed))) ||
              (u.whatsapp && u.whatsapp.endsWith(trimmed))
            );
            if (match) {
              matched.push({
                key,
                data: {
                  id: u.id || key,
                  nama: u.nama || 'Member',
                  whatsapp: u.whatsapp,
                  level: u.level || 'Silver Member',
                  masa_aktif: u.masa_aktif || '1 Tahun',
                  tanggal_berakhir: u.tanggal_berakhir || '',
                  jumlah_poin: u.jumlah_poin !== undefined ? u.jumlah_poin : 50,
                  status: u.status || 'AKTIF',
                  qr_code: u.qr_code,
                  benefit: [
                    { nama: 'Diskon Jasa Servis 10%', keterangan: 'Berlaku untuk semua jenis tune up dan servis rem' },
                    { nama: 'Gratis Pengecekan 21 Titik', keterangan: 'Inspeksi berkala menyeluruh gratis' },
                    { nama: 'Bonus 50 Poin Selamat Datang', keterangan: 'Poin loyalitas langsung aktif' }
                  ]
                }
              });
            }
          });
        }
      }

      setLoading(false);

      if (matched.length === 1) {
        selectMember(matched[0].key, matched[0].data);
      } else if (matched.length > 1) {
        setMemberList(matched);
      } else {
        onShowModal({
          icon: '🔍',
          title: 'Member Tidak Ditemukan',
          desc: `Maaf, kami tidak menemukan data member dengan 4 digit akhir "<strong>${trimmed}</strong>".`
        });
      }
    } catch {
      setLoading(false);
      onShowModal({
        icon: '⚠️',
        title: 'Kendala Koneksi',
        desc: 'Gagal memuat data member. Silakan coba kembali.'
      });
    }
  };

  const selectMember = (memberKey: string, initialData: MemberData) => {
    setCurrentMember(initialData);
    setMemberList([]);

    // Set real-time listener for this member
    const memberRef = ref(database, `members/${memberKey}`);
    onValue(memberRef, (snapshot) => {
      if (snapshot.exists()) {
        const liveMember = snapshot.val();
        setCurrentMember(liveMember);
      }
    });

    // Auto-load history for this member
    if (initialData.whatsapp || initialData.nama) {
      loadMemberBookings(initialData.whatsapp, initialData.nama);
    }
  };

  const loadMemberBookings = async (whatsapp?: string, nama?: string) => {
    try {
      let waClean = (whatsapp || '').trim();
      if (waClean.startsWith('0')) waClean = '62' + waClean.slice(1);

      const snap = await get(ref(database, 'bookings'));
      if (snap.exists()) {
        const all = snap.val();
        let matched: BookingData[] = [];
        Object.keys(all).forEach((k) => {
          const b = all[k];
          if (b && (
            b.whatsapp === waClean || 
            b.whatsapp === whatsapp || 
            (nama && b.nama && b.nama.toLowerCase() === nama.toLowerCase())
          )) {
            matched.push(b);
          }
        });
        matched.reverse();
        setMemberBookings(matched);
      }
    } catch {
      // ignore
    }
  };

  const qrSrc = currentMember?.qr_code 
    ? currentMember.qr_code 
    : `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${currentMember?.id || 'DNE-MEMBER'}`;

  const isDitolak = (currentMember?.status || '').toUpperCase() === 'DITOLAK';

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 pb-16">
      <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-3">
        Pusat <span className="text-amber-400">Membership</span>
      </h2>

      {/* Gold Member Card Presentation */}
      <div className="bg-gradient-to-br from-[#1e1b18] via-[#14120e] to-[#0f0e0c] border-2 border-amber-400 rounded-2xl p-5 mb-5 shadow-[0_10px_30px_rgba(251,191,36,0.25)] relative overflow-hidden">
        <div className="flex justify-between items-center mb-4 border-b border-amber-400/20 pb-2.5">
          <img 
            src="https://i.ibb.co.com/XrZ9h7jC/DAS-Transparan-Presisi.png" 
            alt="Logo DNE" 
            className="h-6 w-auto"
          />
          <span className="text-[9px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-400 border border-amber-400/40">
            {currentMember?.level ? currentMember.level.toUpperCase() : 'CEK MEMBER'}
          </span>
        </div>

        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-[8px] uppercase tracking-widest text-slate-400 block mb-0.5">
              ID MEMBER
            </span>
            <h4 className="font-mono text-sm font-bold text-emerald-400 mb-2">
              {currentMember?.id || '--'}
            </h4>
            <span className="text-[8px] uppercase tracking-widest text-slate-400 block mb-0.5">
              NAMA PEMILIK
            </span>
            <h4 className="text-xs font-bold text-white">
              {currentMember?.nama || 'Silakan Cek Member di Bawah'}
            </h4>
          </div>

          <div className="bg-white p-1 rounded-lg shrink-0 shadow">
            <img 
              src={qrSrc} 
              alt="QR Member" 
              className="w-12 h-12 object-contain"
            />
          </div>
        </div>

        <div className="border-t border-dashed border-amber-400/25 pt-3 grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-[8px] text-slate-400 block uppercase">MASA AKTIF</span>
            <strong className="text-white text-[11px]">{currentMember?.masa_aktif || '-'}</strong>
          </div>
          <div>
            <span className="text-[8px] text-slate-400 block uppercase">TANGGAL BERAKHIR</span>
            <strong className="text-white text-[11px]">{currentMember?.tanggal_berakhir || '-'}</strong>
          </div>
          <div>
            <span className="text-[8px] text-slate-400 block uppercase">JUMLAH POIN</span>
            <strong className="text-emerald-400 text-[11px]">
              {currentMember?.jumlah_poin !== undefined ? currentMember.jumlah_poin : 0} Poin
            </strong>
          </div>
          <div>
            <span className="text-[8px] text-slate-400 block uppercase">STATUS KARTU</span>
            <strong className={`text-[11px] ${isDitolak ? 'text-red-400' : 'text-amber-400'}`}>
              {currentMember?.status || 'Cek Member'}
            </strong>
          </div>
        </div>

        {isDitolak && (
          <div className="mt-3 p-2.5 bg-red-500/20 border border-red-500 rounded-lg text-xs text-red-300">
            <strong>Alasan Penolakan:</strong> {currentMember?.alasan_penolakan || currentMember?.alasan || 'Tidak ada alasan spesifik.'}
          </div>
        )}
      </div>

      {/* Member Benefits Grid */}
      <div className="mb-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-2">
          Benefit Eksklusif Member
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Array.isArray(currentMember?.benefit) && currentMember.benefit.length > 0 ? (
            currentMember.benefit.map((b, idx) => (
              <div key={idx} className="bg-[#14141c] border border-[#22222e] p-3 rounded-xl text-xs">
                <strong className="text-amber-400 block mb-1">{b.nama || 'Benefit Eksklusif'}</strong>
                <span className="text-slate-300 text-[11px]">{b.keterangan || ''}</span>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-[#14141c] border border-[#22222e] p-3.5 rounded-xl text-center text-xs text-slate-300">
              <strong className="text-amber-400 block mb-1">Benefit Diskon & Servis Prioritas</strong>
              Dapatkan diskon jasa servis hingga 15%, prioritas antrean montir, dan akumulasi poin setiap servis.
            </div>
          )}
        </div>
      </div>

      {/* Check Member Card Section */}
      <div className="bg-[#14141c] border border-[#22222e] rounded-2xl p-5 shadow-xl mb-5">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
          Cek Kartu & Status Realtime
        </h4>
        <label className="block text-[10px] font-semibold text-slate-300 uppercase mb-1">
          4 Digit Terakhir ID Member
        </label>
        
        <div className="flex gap-2 mb-1.5">
          <input
            type="text"
            maxLength={4}
            placeholder="Contoh: 1245"
            value={digit4}
            onChange={(e) => setDigit4(e.target.value.replace(/\D/g, ''))}
            className="flex-1 bg-[#0b0b0e] border border-[#2a2a3c] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-600 transition-colors font-mono tracking-widest text-center"
          />
          <button
            onClick={handleSearchMember}
            disabled={loading}
            className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase px-4 py-2 rounded-lg flex items-center gap-1 shrink-0 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Search className="w-3.5 h-3.5" />
            <span>{loading ? 'Cek...' : 'Cek'}</span>
          </button>
        </div>
        <span className="text-[9px] text-slate-400 block mb-4">
          Contoh: ID MBR-2026-001245, cukup ketik 1245
        </span>

        {/* Selection list if multiple found */}
        {memberList.length > 0 && (
          <div className="space-y-2 mb-4 pt-2 border-t border-[#1f1f2e]">
            <p className="text-[11px] text-amber-400 font-medium">
              Ditemukan {memberList.length} member dengan digit "{digit4}":
            </p>
            {memberList.map((m) => (
              <div
                key={m.key}
                onClick={() => selectMember(m.key, m.data)}
                className="bg-[#0b0b0e] border border-[#22222e] hover:border-amber-400/50 p-2.5 rounded-lg cursor-pointer flex justify-between items-center text-xs"
              >
                <div>
                  <h4 className="font-bold text-white">{m.data.nama} ({m.data.id})</h4>
                  <p className="text-[10px] text-slate-400">Level: {m.data.level || 'Member'}</p>
                </div>
                <span className="text-[9px] font-bold text-amber-400 uppercase">{m.data.status || 'AKTIF'}</span>
              </div>
            ))}
          </div>
        )}

        <div className="pt-3 border-t border-[#1f1f2e] text-center">
          <p className="text-[10px] text-slate-400 mb-2.5">
            Ada kendala aktivasi atau pertanyaan seputar membership DNE?
          </p>
          <button
            onClick={() => openWhatsAppAdmin('Halo Kak, saya ingin dibantu terkait kendala pendaftaran atau status membership saya di DNE Auto Solution.', adminPhone)}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold text-xs uppercase py-2.5 px-4 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>Hubungi Admin CS Member</span>
          </button>
        </div>
      </div>

      {/* Associated Bookings for Member */}
      {currentMember && memberBookings.length > 0 && (
        <div className="bg-[#14141c] border border-[#22222e] rounded-2xl p-5 shadow-xl">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
            Riwayat Servis Member: <span className="text-emerald-400">{currentMember.nama}</span>
          </h4>
          <div className="space-y-2 mt-3">
            {memberBookings.map((b) => (
              <div
                key={b.id}
                onClick={() => onSelectBookingDetail(b)}
                className="bg-[#0b0b0e] border border-[#22222e] hover:border-red-500/50 p-3 rounded-xl cursor-pointer flex justify-between items-center transition-all text-xs"
              >
                <div>
                  <h5 className="font-bold text-white">{b.kendaraan}</h5>
                  <p className="text-[10px] text-slate-400">{b.id} | {b.tanggal_servis}</p>
                </div>
                <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-zinc-800 text-emerald-400 border border-emerald-500/30">
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
