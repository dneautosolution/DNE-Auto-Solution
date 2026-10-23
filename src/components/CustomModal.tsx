import React from 'react';
import { NotificationModal } from '../types';

interface CustomModalProps {
  modalData: NotificationModal;
  onClose: () => void;
}

export const CustomModal: React.FC<CustomModalProps> = ({ modalData, onClose }) => {
  if (!modalData.show) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-3">
      <div className="bg-[#14141c] border border-[#2a2a3c] rounded-2xl max-w-sm w-full p-5 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="text-3xl mb-2">{modalData.icon || '💡'}</div>
        <h3 className="text-sm font-bold text-white mb-1.5">{modalData.title}</h3>
        <div 
          className="text-xs text-slate-300 mb-5 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: modalData.desc }}
        />
        <div className="flex gap-2 justify-center">
          <button
            onClick={onClose}
            className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-[11px] uppercase tracking-wider py-2.5 px-4 rounded-lg shadow-md transition-all cursor-pointer"
          >
            Baik, Terima Kasih
          </button>
        </div>
      </div>
    </div>
  );
};
