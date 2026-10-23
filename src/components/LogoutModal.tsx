import React from 'react';
import { LogOut } from 'lucide-react';

interface LogoutModalProps {
  show: boolean;
  userName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({
  show,
  userName,
  onConfirm,
  onCancel
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-[#14141c] border border-[#2a2a3c] rounded-2xl max-w-sm w-full p-5 text-center shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="w-12 h-12 bg-red-600/15 border border-red-600/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
          <LogOut className="w-6 h-6" />
        </div>

        <h3 className="text-sm font-bold text-white mb-1.5">Konfirmasi Keluar</h3>
        <p className="text-xs text-slate-300 mb-5 leading-relaxed">
          Apakah Anda yakin ingin keluar dari akun <strong className="text-white">{userName}</strong>?
        </p>

        <div className="flex gap-2.5">
          <button
            onClick={onCancel}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs py-2.5 px-4 rounded-lg transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs py-2.5 px-4 rounded-lg shadow-md transition-all cursor-pointer"
          >
            Ya, Keluar
          </button>
        </div>
      </div>
    </div>
  );
};
