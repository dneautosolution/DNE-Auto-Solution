import React from 'react';
import { PromoItem } from '../types';
import { getWIBDateString } from '../services/firebase';

interface PromoSectionProps {
  promos: PromoItem[];
  onClaimPromo: (promoId: string, promoTitle: string, endDate?: string) => void;
  onNavigateToBooking: () => void;
}

export const PromoSection: React.FC<PromoSectionProps> = ({
  promos,
  onClaimPromo,
  onNavigateToBooking
}) => {
  const todayWIB = getWIBDateString();

  // Evaluate active promos based on WIB
  const processedPromos = promos.map(p => {
    let calculatedStatus: string = 'ACTIVE';
    if (p.status === false || p.status === 'INACTIVE' || p.status === 'Inactive') {
      calculatedStatus = 'INACTIVE';
    } else if (p.tanggal_mulai && todayWIB < p.tanggal_mulai) {
      calculatedStatus = 'UPCOMING';
    } else if (p.tanggal_berakhir && todayWIB > p.tanggal_berakhir) {
      calculatedStatus = 'EXPIRED';
    } else {
      calculatedStatus = 'ACTIVE';
    }
    return { ...p, calculatedStatus };
  });

  const activePromos = processedPromos.filter(p => p.calculatedStatus === 'ACTIVE');

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 pb-12">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-sm font-bold uppercase tracking-wider text-white">
          Promo <span className="text-red-600">Spesial</span>
        </h2>
        <button
          onClick={onNavigateToBooking}
          className="text-[10px] text-red-400 hover:text-red-300 font-semibold cursor-pointer"
        >
          Pakai Voucher
        </button>
      </div>

      <p className="text-xs text-slate-400 mb-5 leading-relaxed">
        Penawaran terbaik khusus bulan ini untuk kendaraan kesayangan Anda. Hemat lebih banyak di DNE Auto Solution!
      </p>

      {activePromos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activePromos.map((promo) => {
            const bannerImg = promo.banner || promo.url_gambar || 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?q=80&w=800';
            const title = promo.judul || promo.name || 'Promo Spesial';
            const desc = promo.deskripsi || promo.description || 'Diskon servis menarik untuk Anda';
            const periodeText = (promo.tanggal_mulai && promo.tanggal_berakhir)
              ? `${promo.tanggal_mulai} s/d ${promo.tanggal_berakhir}`
              : (promo.tanggal || 'Periode Terbatas');

            return (
              <div
                key={promo.id}
                className="bg-[#14141c] border border-[#2a2a3c] rounded-2xl overflow-hidden shadow-xl flex flex-col hover:border-red-600 transition-all hover:-translate-y-1 group"
              >
                <div className="w-full h-40 bg-[#1c1c28] overflow-hidden relative">
                  <img
                    src={bannerImg}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-red-600 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow">
                    Spesial
                  </div>
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-sm font-bold text-white mb-1.5">{title}</h3>
                  <p className="text-xs text-slate-400 mb-4 flex-1 leading-relaxed">{desc}</p>

                  <div className="flex justify-between items-center pt-3 border-t border-[#1f1f2e] mt-auto">
                    <span className="text-[9px] font-semibold bg-amber-500/10 text-amber-400 px-2 py-1 rounded-md">
                      ⏳ {periodeText}
                    </span>
                    <button
                      onClick={() => onClaimPromo(promo.id, title, promo.tanggal_berakhir)}
                      className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-[10px] uppercase tracking-wider px-3.5 py-1.5 rounded-lg shadow-md transition-all cursor-pointer"
                    >
                      Klaim
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center text-slate-400 text-xs bg-[#14141c] border border-[#22222e] rounded-2xl p-6">
          Belum ada promo aktif saat ini. Kunjungi lagi nanti untuk promo terbaru!
        </div>
      )}
    </div>
  );
};
