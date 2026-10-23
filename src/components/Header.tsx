import React from 'react';
import { PageType, BengkelSettings, UserAccount } from '../types';
import { Headphones, Bell, User, MapPin, LogIn } from 'lucide-react';
import { openWhatsAppAdmin } from '../services/firebase';

interface HeaderProps {
  settings: BengkelSettings;
  currentPage: PageType;
  currentUser: UserAccount | null;
  isFirebaseConnected?: boolean;
  onNavigate: (page: PageType) => void;
}

export const Header: React.FC<HeaderProps> = ({ settings, currentUser, isFirebaseConnected, onNavigate }) => {
  return (
    <header className="sticky top-0 z-50 w-full bg-[#0f0f12]/95 backdrop-blur-md border-b border-[#1f1f2e] px-4 py-2.5 flex justify-between items-center transition-all">
      <div className="flex items-center gap-2.5 min-w-0">
        <img 
          src="https://i.ibb.co.com/XrZ9h7jC/DAS-Transparan-Presisi.png" 
          alt="DNE Logo" 
          className="h-8 w-auto object-contain shrink-0 cursor-pointer"
          onClick={() => onNavigate('home')}
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 
              onClick={() => onNavigate('home')}
              className="text-xs font-semibold text-white truncate cursor-pointer hover:text-red-400 transition-colors"
            >
              {settings.nama_bengkel || 'DNE Auto Solution'}
            </h1>
            {isFirebaseConnected && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded-full font-medium" title="Terhubung secara realtime ke Firebase RTDB">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Firebase Sync</span>
              </span>
            )}
          </div>
          <div 
            onClick={() => onNavigate('booking')}
            className="text-[10px] text-slate-400 flex items-center gap-1 cursor-pointer truncate hover:text-slate-200"
          >
            <MapPin className="w-3 h-3 text-red-500 shrink-0" />
            <span className="truncate">{settings.lokasi || 'Purwokerto & Sekitarnya'}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button 
          onClick={() => openWhatsAppAdmin('Halo Admin, saya ingin bertanya seputar layanan di DNE Auto Solution.', settings.whatsapp_admin)}
          className="w-8 h-8 rounded-full bg-[#181822] border border-[#2a2a3c] text-white flex items-center justify-center hover:border-red-600 hover:bg-[#222230] transition-colors"
          title="Hubungi Admin"
        >
          <Headphones className="w-3.5 h-3.5 text-slate-200" />
        </button>

        <button 
          onClick={() => onNavigate('status')}
          className="w-8 h-8 rounded-full bg-[#181822] border border-[#2a2a3c] text-white flex items-center justify-center hover:border-red-600 hover:bg-[#222230] relative transition-colors"
          title="Notifikasi & Status"
        >
          <Bell className="w-3.5 h-3.5 text-slate-200" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
        </button>

        {currentUser ? (
          <button 
            onClick={() => onNavigate('akun')}
            className="h-8 px-2 rounded-full bg-amber-500/10 border border-amber-500/40 text-white flex items-center gap-1.5 hover:border-amber-400 transition-colors"
            title={`Akun: ${currentUser.nama}`}
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-black font-bold text-[10px] flex items-center justify-center">
              {currentUser.nama.charAt(0).toUpperCase()}
            </div>
            <span className="text-[10px] font-semibold text-amber-300 max-w-[60px] truncate hidden sm:inline">
              {currentUser.nama.split(' ')[0]}
            </span>
          </button>
        ) : (
          <button 
            onClick={() => onNavigate('login')}
            className="w-8 h-8 rounded-full bg-[#181822] border border-[#2a2a3c] text-white flex items-center justify-center hover:border-red-600 hover:bg-[#222230] transition-colors"
            title="Masuk / Akun"
          >
            <User className="w-3.5 h-3.5 text-slate-200" />
          </button>
        )}
      </div>
    </header>
  );
};
