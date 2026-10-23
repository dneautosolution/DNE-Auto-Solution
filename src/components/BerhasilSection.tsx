import React from 'react';
import { PageType } from '../types';
import { Check, ArrowRight, Home } from 'lucide-react';

interface BerhasilSectionProps {
  bookingId: string;
  onNavigate: (page: PageType) => void;
}

export const BerhasilSection: React.FC<BerhasilSectionProps> = ({ bookingId, onNavigate }) => {
  return (
    <div className="w-full max-w-md mx-auto px-4 py-8 pb-16">
      <div className="bg-[#14141c] border border-[#22222e] rounded-2xl p-6 text-center shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500 rounded-full flex items-center justify-center text-2xl mx-auto mb-3">
          <Check className="w-7 h-7 stroke-[3]" />
        </div>
        
        <h2 className="text-base font-bold text-white mb-1">Booking Berhasil Dibuat!</h2>
        <p className="text-xs text-slate-400 mb-4">
          Nomor ID Booking Unik Anda telah dicatat di sistem:
        </p>

        <div className="bg-[#0b0b0e] border border-emerald-500/30 rounded-xl py-3 px-4 mb-6">
          <span className="font-mono text-emerald-400 font-bold text-base tracking-wider select-all">
            {bookingId || 'DNE-2026-0000'}
          </span>
        </div>

        <p className="text-[11px] text-slate-400 mb-6 leading-relaxed">
          Simpan 4 digit terakhir nomor ini untuk mengecek status pengerjaan kendaraan secara berkala di menu <strong>Cek Status</strong>.
        </p>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => onNavigate('riwayat')}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded-lg shadow-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <span>Lihat Riwayat & Status</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          
          <button
            onClick={() => onNavigate('home')}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda</span>
          </button>
        </div>
      </div>
    </div>
  );
};
