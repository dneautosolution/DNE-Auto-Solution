import React, { useState, useEffect, useRef } from 'react';
import { PageType, HeroBannerItem, ServiceItem, BengkelSettings } from '../types';
import { getWIBDateString } from '../services/firebase';

interface HomeSectionProps {
  banners: HeroBannerItem[];
  services: ServiceItem[];
  settings: BengkelSettings;
  onNavigate: (page: PageType) => void;
  onOpenService: (service: ServiceItem) => void;
  onQuickBook: (kategori: string, tanggal: string, jam: string) => void;
}

export const HomeSection: React.FC<HomeSectionProps> = ({
  banners,
  services,
  settings,
  onNavigate,
  onOpenService,
  onQuickBook
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [quickKategori, setQuickKategori] = useState("Mobil (Car Service) 🚗");
  const [quickTanggal, setQuickTanggal] = useState("");
  const [quickJam, setQuickJam] = useState("09:00");
  const touchStartXRef = useRef<number>(0);

  const todayStr = getWIBDateString();

  useEffect(() => {
    if (!quickTanggal) {
      setQuickTanggal(todayStr);
    }
  }, [todayStr, quickTanggal]);

  // Filter active banners by date if available
  const activeBanners = banners.filter(b => {
    if (b.status === false || b.status === 'Inactive') return false;
    if (b.tanggal_aktif && b.tanggal_berakhir) {
      if (todayStr < b.tanggal_aktif || todayStr > b.tanggal_berakhir) return false;
    }
    return true;
  });

  // Display at least one placeholder if no banners
  const displayBanners = activeBanners.length > 0 ? activeBanners : [
    {
      id: 'default',
      url_gambar: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?q=80&w=1200',
      link_tujuan: 'booking'
    }
  ];

  // Auto slide
  useEffect(() => {
    if (displayBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex(prev => (prev + 1) % displayBanners.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [displayBanners.length]);

  const handleBannerClick = (link?: string) => {
    if (!link || link.trim() === '' || link.trim() === '#') return;
    const cleanLink = link.trim().toLowerCase();
    if (cleanLink.startsWith('http://') || cleanLink.startsWith('https://')) {
      window.open(link.trim(), '_blank');
    } else if (cleanLink.includes('booking')) {
      onNavigate('booking');
    } else if (cleanLink.includes('member')) {
      onNavigate('membership');
    } else if (cleanLink.includes('promo')) {
      onNavigate('promo');
    } else if (cleanLink.includes('layanan')) {
      onNavigate('layanan');
    } else if (cleanLink.includes('riwayat')) {
      onNavigate('riwayat');
    } else if (cleanLink.includes('status')) {
      onNavigate('status');
    } else if (cleanLink.includes('akun')) {
      onNavigate('akun');
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (displayBanners.length <= 1) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        setCurrentSlideIndex(prev => (prev + 1) % displayBanners.length);
      } else {
        setCurrentSlideIndex(prev => (prev - 1 + displayBanners.length) % displayBanners.length);
      }
    }
  };

  const handleQuickBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onQuickBook(quickKategori, quickTanggal, quickJam);
  };

  return (
    <div className="w-full max-w-5xl mx-auto pb-8">
      {/* Hero Banner Slider */}
      <section className="px-4 py-4">
        <div 
          className="relative bg-[#14141c] border border-[#2a2a3c] rounded-2xl overflow-hidden shadow-2xl min-h-[200px] md:min-h-[380px] w-full"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div 
            className="flex transition-transform duration-500 ease-out h-[200px] md:h-[380px] cursor-pointer"
            style={{ transform: `translateX(-${currentSlideIndex * 100}%)` }}
          >
            {displayBanners.map((banner, idx) => {
              const bgImg = banner.url_gambar || banner.banner || 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?q=80&w=1200';
              return (
                <div
                  key={banner.id || idx}
                  onClick={() => handleBannerClick(banner.link_tujuan || banner.link || banner.url)}
                  className="min-w-full w-full h-full bg-cover bg-center flex flex-col items-start justify-end p-6 relative group"
                  style={{ backgroundImage: `url('${bgImg}')` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  <div className="relative z-10">
                    <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-red-600 text-white">
                      DNE Auto Solution
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dots Indicator */}
          {displayBanners.length > 1 && (
            <div className="absolute bottom-3 right-4 flex gap-1.5 z-20">
              {displayBanners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSlideIndex(idx);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentSlideIndex 
                      ? 'w-5 bg-red-600' 
                      : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Stats Cards */}
      <section className="px-4 mb-5">
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-[#14141c] border border-[#22222e] rounded-xl p-2.5 flex flex-col items-center text-center shadow-md">
            <div className="text-sm bg-red-600/10 w-7 h-7 rounded-lg flex items-center justify-center mb-1">⭐</div>
            <h4 className="text-[11px] font-bold text-white truncate w-full">{settings.rating || '4.9/5'}</h4>
            <p className="text-[8px] text-slate-400 uppercase tracking-wider truncate w-full">Rating</p>
          </div>

          <div className="bg-[#14141c] border border-[#22222e] rounded-xl p-2.5 flex flex-col items-center text-center shadow-md">
            <div className="text-sm bg-red-600/10 w-7 h-7 rounded-lg flex items-center justify-center mb-1">🚗</div>
            <h4 className="text-[11px] font-bold text-white truncate w-full">{settings.jumlah_kendaraan || '1.000+'}</h4>
            <p className="text-[8px] text-slate-400 uppercase tracking-wider truncate w-full">Kendaraan</p>
          </div>

          <div className="bg-[#14141c] border border-[#22222e] rounded-xl p-2.5 flex flex-col items-center text-center shadow-md">
            <div className="text-sm bg-red-600/10 w-7 h-7 rounded-lg flex items-center justify-center mb-1">⏱️</div>
            <h4 className="text-[11px] font-bold text-white truncate w-full">{settings.pengalaman || '10+'}</h4>
            <p className="text-[8px] text-slate-400 uppercase tracking-wider truncate w-full">Pengalaman</p>
          </div>

          <div className="bg-[#14141c] border border-[#22222e] rounded-xl p-2.5 flex flex-col items-center text-center shadow-md">
            <div className="text-sm bg-red-600/10 w-7 h-7 rounded-lg flex items-center justify-center mb-1">🛡️</div>
            <h4 className="text-[11px] font-bold text-white truncate w-full">{settings.garansi || '100%'}</h4>
            <p className="text-[8px] text-slate-400 uppercase tracking-wider truncate w-full">Garansi</p>
          </div>
        </div>
      </section>

      {/* Services Section Preview */}
      <section className="mb-6">
        <div className="px-4 flex justify-between items-center mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            Layanan <span className="text-red-600">Kami</span>
          </h3>
          <button
            onClick={() => onNavigate('layanan')}
            className="text-[10px] text-red-400 hover:text-red-300 font-semibold cursor-pointer"
          >
            Lihat Semua
          </button>
        </div>

        <div className="px-4 grid grid-cols-3 sm:grid-cols-6 gap-2.5">
          {services.slice(0, 6).map((srv) => (
            <div
              key={srv.id}
              onClick={() => onOpenService(srv)}
              className="bg-[#14141c] border border-[#22222e] hover:border-red-600 rounded-xl p-3 text-center cursor-pointer transition-all hover:-translate-y-0.5 shadow-sm group"
            >
              <div className="text-xl bg-red-600/10 group-hover:bg-red-600/20 w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 transition-colors">
                {srv.icon || '🚗'}
              </div>
              <span className="text-[10px] text-slate-200 font-medium block truncate group-hover:text-white">
                {srv.judul}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Booking Box */}
      <section className="px-4 mb-4">
        <div className="bg-[#14141c] border border-[#22222e] rounded-2xl p-5 shadow-xl">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-amber-400 text-sm">⚡</span>
            <h3 className="text-sm font-bold text-white">Booking Cepat</h3>
          </div>
          <p className="text-[11px] text-slate-400 mb-4">
            Isi data singkat di bawah untuk langsung menjadwalkan servis tanpa antre.
          </p>

          <form onSubmit={handleQuickBookingSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[10px] font-semibold text-slate-300 uppercase mb-1">
                Kategori Kendaraan
              </label>
              <select
                value={quickKategori}
                onChange={(e) => setQuickKategori(e.target.value)}
                className="w-full bg-[#0b0b0e] border border-[#2a2a3c] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600 transition-colors"
                required
              >
                <option value="Mobil (Car Service) 🚗">Mobil (Car Service) 🚗</option>
                <option value="Motor (Motor Service) 🏍️">Motor (Motor Service) 🏍️</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-300 uppercase mb-1">
                Tanggal & Jam Kunjungan
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  min={todayStr}
                  value={quickTanggal}
                  onChange={(e) => setQuickTanggal(e.target.value)}
                  className="flex-1 bg-[#0b0b0e] border border-[#2a2a3c] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600 transition-colors"
                  required
                />
                <input
                  type="time"
                  value={quickJam}
                  onChange={(e) => setQuickJam(e.target.value)}
                  className="w-24 bg-[#0b0b0e] border border-[#2a2a3c] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600 transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded-lg shadow-lg hover:shadow-red-600/30 transition-all cursor-pointer"
            >
              Booking Sekarang
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};
