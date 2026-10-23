import React from 'react';
import { BookingData } from '../types';
import { ArrowLeft, Check, Clock, Wrench, Package, CheckCircle2 } from 'lucide-react';

interface DetailBookingSectionProps {
  booking: BookingData | null;
  onBack: () => void;
}

export const DetailBookingSection: React.FC<DetailBookingSectionProps> = ({ booking, onBack }) => {
  if (!booking) {
    return (
      <div className="w-full max-w-xl mx-auto px-4 py-8 text-center text-slate-400">
        <p className="text-xs mb-3">Data pesanan tidak ditemukan.</p>
        <button
          onClick={onBack}
          className="text-xs text-red-400 font-bold hover:underline"
        >
          ← Kembali ke Riwayat
        </button>
      </div>
    );
  }

  const status = (booking.status || 'Menunggu').toLowerCase();
  const isBatal = status === 'batal';

  const isDiterimaActive = !isBatal && ['menunggu', 'proses', 'menunggu sparepart', 'selesai'].includes(status);
  const isProsesActive = !isBatal && ['proses', 'menunggu sparepart', 'selesai'].includes(status);
  const isSparepartActive = !isBatal && ['menunggu sparepart', 'selesai'].includes(status);
  const isSelesaiActive = !isBatal && status === 'selesai';

  const getStatusBadgeClass = () => {
    if (isSelesaiActive) return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40';
    if (status === 'proses') return 'bg-blue-500/20 text-blue-400 border border-blue-500/40';
    if (status === 'menunggu sparepart') return 'bg-purple-500/20 text-purple-400 border border-purple-500/40';
    if (status === 'menunggu') return 'bg-amber-500/20 text-amber-400 border border-amber-500/40';
    return 'bg-red-500/20 text-red-400 border border-red-500/40';
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 pb-16">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-white">
          Detail <span className="text-red-600">Pengerjaan</span>
        </h2>
        <button
          onClick={onBack}
          className="text-xs text-red-400 hover:text-red-300 font-bold flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali</span>
        </button>
      </div>

      <div className="bg-[#14141c] border border-[#22222e] rounded-2xl p-5 shadow-xl">
        {/* Header Information */}
        <div className="flex justify-between items-center pb-3 border-b border-[#1f1f2e] mb-3">
          <span className="font-mono text-emerald-400 font-bold text-sm tracking-wide">
            {booking.id}
          </span>
          <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${getStatusBadgeClass()}`}>
            {booking.status}
          </span>
        </div>

        <div className="mb-5 space-y-1">
          <h3 className="text-sm font-bold text-white">
            {booking.kategori} - {booking.kendaraan}
          </h3>
          <p className="text-xs text-slate-400">
            Pemilik: <span className="text-slate-200">{booking.nama}</span> | WhatsApp: <span className="text-emerald-400">{booking.whatsapp}</span>
          </p>
          <p className="text-xs text-slate-400">
            Jadwal: <span className="text-slate-200">{booking.tanggal_servis}</span>
          </p>
          {booking.montir && (
            <p className="text-xs text-slate-400">
              Teknisi/Montir: <span className="text-emerald-400 font-semibold">{booking.montir}</span>
            </p>
          )}
          {booking.promo && booking.promo !== 'Tidak Ada' && (
            <p className="text-xs text-slate-400">
              Voucher: <span className="text-amber-400 font-semibold">{booking.promo}</span>
            </p>
          )}
        </div>

        {/* Timeline Status */}
        <h4 className="text-xs uppercase font-bold text-white mb-3">
          Timeline Status Pengerjaan Realtime
        </h4>

        {isBatal ? (
          <div className="p-3 bg-red-500/10 border border-red-500/40 rounded-xl text-xs text-red-300 mb-2">
            Pesanan ini telah berstatus <strong>Dibatalkan</strong> oleh pelanggan atau pihak bengkel.
          </div>
        ) : (
          <div className="relative pl-6 border-l-2 border-[#2a2a3c] space-y-6 my-4 ml-3">
            {/* Step 1 */}
            <div className="relative">
              <div className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 border-[#14141c] flex items-center justify-center transition-all ${
                isDiterimaActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-[#2a2a3c]'
              }`}>
                {isDiterimaActive && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
              </div>
              <div>
                <strong className="text-xs text-white block">Booking Diterima</strong>
                <span className="text-[10px] text-slate-400">Pesanan masuk ke sistem antrean bengkel</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 border-[#14141c] flex items-center justify-center transition-all ${
                isProsesActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-[#2a2a3c]'
              }`}>
                {isProsesActive && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
              </div>
              <div>
                <strong className="text-xs text-white block">Sedang Dikerjakan</strong>
                <span className="text-[10px] text-slate-400">Montir sedang melakukan inspeksi & perbaikan</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 border-[#14141c] flex items-center justify-center transition-all ${
                isSparepartActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-[#2a2a3c]'
              }`}>
                {isSparepartActive && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
              </div>
              <div>
                <strong className="text-xs text-white block">Pemeriksaan / Menunggu Sparepart</strong>
                <span className="text-[10px] text-slate-400">Pemasangan suku cadang resmi atau oli baru</span>
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative">
              <div className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 border-[#14141c] flex items-center justify-center transition-all ${
                isSelesaiActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-[#2a2a3c]'
              }`}>
                {isSelesaiActive && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
              </div>
              <div>
                <strong className="text-xs text-white block">Selesai & Quality Control</strong>
                <span className="text-[10px] text-slate-400">Kendaraan telah siap diambil atau diserahterimakan</span>
              </div>
            </div>
          </div>
        )}

        {/* Complaint & Mechanic Notes */}
        <div className="mt-5 pt-3 border-t border-[#1f1f2e] space-y-2.5">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Catatan Keluhan:</span>
            <p className="text-xs text-slate-300 bg-[#0b0b0e] p-3 rounded-lg border border-[#22222e]">
              {booking.keluhan || 'Tidak ada catatan keluhan tambahan.'}
            </p>
          </div>

          {(booking as any).catatan_mekanik && (
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">Catatan Mekanik Bengkel:</span>
              <p className="text-xs text-emerald-300 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/30 font-medium">
                {(booking as any).catatan_mekanik}
              </p>
            </div>
          )}

          {((booking as any).jasa_detail || (booking as any).sparepart_detail) && (
            <div className="bg-[#0b0b0e] p-3 rounded-lg border border-[#22222e] text-xs space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Rincian Pekerjaan & Suku Cadang:</span>
              {(booking as any).jasa_detail && (
                <p className="text-slate-200">🔧 <strong>Jasa:</strong> {(booking as any).jasa_detail}</p>
              )}
              {(booking as any).sparepart_detail && (
                <p className="text-slate-200">⚙️ <strong>Sparepart:</strong> {(booking as any).sparepart_detail}</p>
              )}
              {((booking as any).biaya_jasa || (booking as any).biaya_sparepart) && (
                <div className="pt-1.5 border-t border-[#1f1f2e] flex justify-between font-bold text-emerald-400">
                  <span>Total Biaya:</span>
                  <span>Rp {Number(((booking as any).biaya_jasa || 0) + ((booking as any).biaya_sparepart || 0)).toLocaleString('id-ID')}</span>
                </div>
              )}
            </div>
          )}

          {(booking as any).rekomendasi_kilometer && (
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-300 flex justify-between items-center">
              <span>Rekomendasi Servis Berikutnya:</span>
              <strong className="text-white">{(booking as any).rekomendasi_kilometer.toLocaleString('id-ID')} KM</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
