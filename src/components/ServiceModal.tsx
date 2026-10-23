import React from 'react';
import { ServiceItem } from '../types';

interface ServiceModalProps {
  service: ServiceItem | null;
  onClose: () => void;
  onSelectItem: (itemName: string, itemPrice: string) => void;
}

export const ServiceModal: React.FC<ServiceModalProps> = ({ service, onClose, onSelectItem }) => {
  if (!service) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-3">
      <div className="bg-[#14141c] border border-[#2a2a3c] rounded-2xl max-w-sm w-full p-5 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="text-3xl mb-1">{service.icon || '🚗'}</div>
        <h3 className="text-sm font-bold text-white mb-1.5">{service.judul}</h3>
        <p className="text-xs text-slate-400 mb-4 leading-relaxed">{service.deskripsi}</p>

        {service.rincian && service.rincian.length > 0 && (
          <div className="mb-4 text-left">
            <h4 className="text-[10px] uppercase font-bold text-slate-300 mb-2">Pilihan Paket / Rincian:</h4>
            <div className="space-y-2">
              {service.rincian.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => onSelectItem(item.nama, item.harga)}
                  className="bg-[#0b0b0e] p-2.5 rounded-lg border border-[#22222e] hover:border-red-500/60 transition-colors flex justify-between items-center text-xs cursor-pointer group"
                >
                  <span className="font-medium text-slate-200 group-hover:text-white">{item.nama}</span>
                  <span className="text-emerald-400 font-bold shrink-0">{item.harga}</span>
                </div>
              ))}
            </div>
            <p className="text-[9px] text-slate-500 mt-2 italic text-center">Ketuk salah satu paket di atas untuk langsung booking</p>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full bg-[#27272a] hover:bg-[#3f3f46] text-white font-bold text-xs py-2 px-4 rounded-lg transition-colors cursor-pointer"
        >
          Tutup
        </button>
      </div>
    </div>
  );
};
