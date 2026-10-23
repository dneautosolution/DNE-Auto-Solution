import React from 'react';
import { PageType } from '../types';
import { Home, Calendar, Tag, History, User } from 'lucide-react';

interface BottomNavProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentPage, onNavigate }) => {
  const navItems = [
    { id: 'home' as PageType, label: 'Beranda', icon: Home },
    { id: 'booking' as PageType, label: 'Booking', icon: Calendar },
    { id: 'promo' as PageType, label: 'Promo', icon: Tag },
    { id: 'riwayat' as PageType, label: 'Riwayat', icon: History },
    { id: 'akun' as PageType, label: 'Akun', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-[#121218]/98 backdrop-blur-md border-t border-[#1f1f2e] flex justify-around py-2 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentPage === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center gap-0.5 text-[9px] flex-1 py-1 transition-colors ${
              isActive ? 'text-red-600 font-semibold' : 'text-zinc-500 hover:text-red-500'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
