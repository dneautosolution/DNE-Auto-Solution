import React from 'react';
import { PageType, UserAccount } from '../types';
import { 
  ChevronRight, 
  User, 
  Car, 
  ClipboardList, 
  Tag, 
  Search, 
  Home, 
  LogIn, 
  UserPlus, 
  LogOut, 
  Award, 
  QrCode, 
  Sparkles,
  Phone,
  Mail
} from 'lucide-react';

interface AkunSectionProps {
  currentUser: UserAccount | null;
  onNavigate: (page: PageType) => void;
  onLogoutRequest: () => void;
}

export const AkunSection: React.FC<AkunSectionProps> = ({ 
  currentUser, 
  onNavigate, 
  onLogoutRequest 
}) => {
  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 pb-20">
      <h2 className="text-sm font-bold uppercase tracking-wider text-white mb-3">
        Akun <span className="text-red-600">Saya</span>
      </h2>

      {/* USER PROFILE CARD (IF LOGGED IN) */}
      {currentUser ? (
        <div className="bg-gradient-to-br from-[#1a1814] to-[#14141c] border border-amber-400/40 rounded-2xl p-5 mb-5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500/20 to-transparent w-32 h-32 pointer-events-none rounded-full blur-xl"></div>
          
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 text-black font-extrabold text-lg flex items-center justify-center shadow-md">
                {currentUser.nama.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>{currentUser.nama}</span>
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 inline-block mt-0.5">
                  {currentUser.level || 'Silver Member'}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[9px] text-slate-400 block uppercase">Poin Member</span>
              <span className="text-base font-extrabold text-emerald-400 flex items-center justify-end gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                {currentUser.jumlah_poin}
              </span>
            </div>
          </div>

          <div className="bg-[#0b0b0e]/80 rounded-xl p-3 border border-[#22222e] grid grid-cols-2 gap-2 text-xs mb-4">
            <div>
              <span className="text-[9px] text-slate-400 block">ID MEMBER</span>
              <span className="font-mono text-emerald-400 font-bold text-[11px]">{currentUser.id}</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 block">STATUS</span>
              <span className="text-amber-300 font-semibold text-[11px]">{currentUser.status || 'AKTIF'}</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 block flex items-center gap-1">
                <Phone className="w-2.5 h-2.5 text-slate-500" /> WHATSAPP
              </span>
              <span className="text-slate-200 text-[11px] truncate block">{currentUser.whatsapp}</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 block flex items-center gap-1">
                <Mail className="w-2.5 h-2.5 text-slate-500" /> EMAIL
              </span>
              <span className="text-slate-200 text-[11px] truncate block">{currentUser.email}</span>
            </div>
            {currentUser.kendaraanDefault && (
              <div className="col-span-2 pt-1 border-t border-[#1f1f2e]">
                <span className="text-[9px] text-slate-400 block flex items-center gap-1">
                  <Car className="w-2.5 h-2.5 text-slate-500" /> KENDARAAN TERSIMPAN
                </span>
                <span className="text-white font-medium text-[11px]">{currentUser.kendaraanDefault}</span>
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('membership')}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs uppercase tracking-wider py-2 px-3 rounded-lg flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Tampilkan Kartu Member & QR</span>
          </button>
        </div>
      ) : (
        /* GUEST PROMPT (NOT LOGGED IN) */
        <div className="bg-[#14141c] border border-[#22222e] rounded-2xl p-5 mb-5 shadow-xl text-center">
          <div className="w-12 h-12 bg-red-600/10 border border-red-600/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <User className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">Masuk ke Akun DNE</h3>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed max-w-sm mx-auto">
            Masuk atau buat akun baru untuk mendapatkan voucher promo, kumpulkan poin reward servis, dan kartu membership digital.
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => onNavigate('login')}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-3 rounded-lg shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Masuk</span>
            </button>
            <button
              onClick={() => onNavigate('register')}
              className="bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-amber-500/30 font-bold text-xs uppercase tracking-wider py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Buat Akun</span>
            </button>
          </div>
        </div>
      )}

      {/* NAVIGATION MENU LIST */}
      <div className="bg-[#14141c] border border-[#22222e] rounded-2xl overflow-hidden shadow-xl mb-4">
        <div
          onClick={() => onNavigate('membership')}
          className="flex justify-between items-center px-4 py-3.5 border-b border-[#1f1f2e] text-xs font-semibold text-white hover:bg-red-600/5 cursor-pointer transition-colors group"
        >
          <div className="flex items-center gap-2.5">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="group-hover:text-red-400 transition-colors">Profil & Kartu Member</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
        </div>

        <div
          onClick={() => onNavigate('booking')}
          className="flex justify-between items-center px-4 py-3.5 border-b border-[#1f1f2e] text-xs font-semibold text-white hover:bg-red-600/5 cursor-pointer transition-colors group"
        >
          <div className="flex items-center gap-2.5">
            <Car className="w-4 h-4 text-blue-400" />
            <span className="group-hover:text-red-400 transition-colors">Booking Servis Kendaraan</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
        </div>

        <div
          onClick={() => onNavigate('riwayat')}
          className="flex justify-between items-center px-4 py-3.5 border-b border-[#1f1f2e] text-xs font-semibold text-white hover:bg-red-600/5 cursor-pointer transition-colors group"
        >
          <div className="flex items-center gap-2.5">
            <ClipboardList className="w-4 h-4 text-emerald-400" />
            <span className="group-hover:text-red-400 transition-colors">Riwayat Servis Kendaraan</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
        </div>

        <div
          onClick={() => onNavigate('promo')}
          className="flex justify-between items-center px-4 py-3.5 border-b border-[#1f1f2e] text-xs font-semibold text-white hover:bg-red-600/5 cursor-pointer transition-colors group"
        >
          <div className="flex items-center gap-2.5">
            <Tag className="w-4 h-4 text-purple-400" />
            <span className="group-hover:text-red-400 transition-colors">Voucher & Promo Aktif</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
        </div>

        <div
          onClick={() => onNavigate('status')}
          className="flex justify-between items-center px-4 py-3.5 border-b border-[#1f1f2e] text-xs font-semibold text-white hover:bg-red-600/5 cursor-pointer transition-colors group"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-red-400" />
            <span className="group-hover:text-red-400 transition-colors">Cek Status Servis Realtime</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
        </div>

        {/* LOGOUT BUTTON (IF LOGGED IN) */}
        {currentUser ? (
          <div
            onClick={onLogoutRequest}
            className="flex justify-between items-center px-4 py-3.5 text-xs font-semibold text-red-500 hover:bg-red-600/10 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <LogOut className="w-4 h-4 text-red-500" />
              <span>Keluar dari Akun (Logout)</span>
            </div>
            <ChevronRight className="w-4 h-4 text-red-500" />
          </div>
        ) : (
          <div
            onClick={() => onNavigate('home')}
            className="flex justify-between items-center px-4 py-3.5 text-xs font-semibold text-slate-400 hover:bg-zinc-800 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Home className="w-4 h-4 text-slate-400" />
              <span>Ke Beranda</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        )}
      </div>
    </div>
  );
};
