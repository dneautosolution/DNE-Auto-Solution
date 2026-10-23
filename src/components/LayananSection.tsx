import React, { useState } from 'react';
import { ServiceItem } from '../types';
import { Search } from 'lucide-react';

interface LayananSectionProps {
  services: ServiceItem[];
  onOpenService: (service: ServiceItem) => void;
}

export const LayananSection: React.FC<LayananSectionProps> = ({ services, onOpenService }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredServices = services.filter(srv => 
    srv.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (srv.deskripsi && srv.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 pb-12">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-sm font-bold uppercase tracking-wider text-white">
          Seluruh <span className="text-red-600">Layanan</span>
        </h2>
      </div>

      <p className="text-xs text-slate-400 mb-4 leading-relaxed">
        Ketuk salah satu layanan di bawah untuk melihat rincian paket, komponen perbaikan, dan estimasi biaya terjangkau.
      </p>

      {/* Search Filter */}
      <div className="relative mb-5">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cari layanan (misal: Oli, Rem, Tune Up, AC)..."
          className="w-full bg-[#14141c] border border-[#2a2a3c] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-600 transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
        {filteredServices.map((service) => (
          <div
            key={service.id}
            onClick={() => onOpenService(service)}
            className="bg-[#14141c] border border-[#22222e] hover:border-red-600/70 rounded-2xl p-4 cursor-pointer transition-all hover:-translate-y-1 shadow-md flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center gap-3 mb-2.5">
                <div className="text-2xl bg-red-600/10 group-hover:bg-red-600/20 w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors">
                  {service.icon || '🔧'}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white group-hover:text-red-400 transition-colors">
                    {service.judul}
                  </h3>
                  <span className="text-[10px] text-emerald-400 font-medium">
                    {service.rincian?.length ? `${service.rincian.length} Pilihan Paket` : 'Estimasi Terjangkau'}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
                {service.deskripsi}
              </p>
            </div>

            <div className="pt-2 border-t border-[#1f1f2e] flex justify-between items-center text-[10px] text-slate-400">
              <span>Garansi Pengerjaan</span>
              <span className="text-red-500 font-semibold group-hover:underline">Lihat Rincian →</span>
            </div>
          </div>
        ))}

        {filteredServices.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs">
            Tidak ada layanan yang sesuai dengan pencarian "{searchTerm}".
          </div>
        )}
      </div>
    </div>
  );
};
