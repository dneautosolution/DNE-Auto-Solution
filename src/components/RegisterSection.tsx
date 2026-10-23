import React, { useState } from 'react';
import { PageType, UserAccount, NotificationModal } from '../types';
import { registerNewUser } from '../services/auth';
import { User, Mail, Phone, Lock, Car, MapPin, Eye, EyeOff, UserPlus, Gift, ArrowLeft } from 'lucide-react';

interface RegisterSectionProps {
  onRegisterSuccess: (user: UserAccount) => void;
  onNavigate: (page: PageType) => void;
  onShowModal: (modal: Omit<NotificationModal, 'show'>) => void;
}

export const RegisterSection: React.FC<RegisterSectionProps> = ({
  onRegisterSuccess,
  onNavigate,
  onShowModal
}) => {
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [kategori, setKategori] = useState('Mobil (Car Service) 🚗');
  const [kendaraan, setKendaraan] = useState('');
  const [alamat, setAlamat] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nama.trim() || !email.trim() || !whatsapp.trim() || !password) {
      onShowModal({
        icon: '💡',
        title: 'Data Belum Lengkap',
        desc: 'Mohon isi semua bidang yang bertanda bintang (*).'
      });
      return;
    }

    if (password.length < 6) {
      onShowModal({
        icon: '⚠️',
        title: 'Kata Sandi Terlalu Pendek',
        desc: 'Kata sandi minimal harus terdiri dari 6 karakter.'
      });
      return;
    }

    if (password !== confirmPassword) {
      onShowModal({
        icon: '⚠️',
        title: 'Kata Sandi Tidak Cocok',
        desc: 'Konfirmasi kata sandi tidak sama dengan kata sandi yang Anda masukkan.'
      });
      return;
    }

    setIsLoading(true);
    const res = await registerNewUser({
      nama,
      email,
      whatsapp,
      password,
      kendaraanDefault: kendaraan,
      kategoriDefault: kategori,
      alamat
    });
    setIsLoading(false);

    if (res.success && res.user) {
      onRegisterSuccess(res.user);
      if (res.isExistingLinked) {
        onShowModal({
          icon: '🔗',
          title: 'Nomor WA Terverifikasi di Bengkel!',
          desc: `Nomor WhatsApp <strong>${res.user.whatsapp}</strong> telah terdaftar di database manajemen bengkel dengan ID Member resmi <strong>${res.user.id}</strong> (Level: <strong>${res.user.level}</strong>, Total Kunjungan: <strong>${res.user.totalKunjungan || 0}</strong>). Akun Anda berhasil ditautkan tanpa data ganda!`
        });
      } else {
        onShowModal({
          icon: '🎉',
          title: 'Pendaftaran Member Berhasil!',
          desc: `Selamat <strong>${res.user.nama}</strong>! ID Member resmi bengkel Anda adalah <strong>${res.user.id}</strong> dengan level <strong>${res.user.level}</strong>. Data Anda telah disinkronkan ke manajemen bengkel.`
        });
      }
    } else {
      onShowModal({
        icon: '❌',
        title: 'Pendaftaran Gagal',
        desc: res.error || 'Terjadi kendala saat mendaftar. Silakan coba kembali.'
      });
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-6 pb-20">
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => onNavigate('akun')}
          className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h2 className="text-sm font-bold uppercase tracking-wider text-white">
          Pendaftaran / <span className="text-red-600">Buat Akun Baru</span>
        </h2>
      </div>

      <div className="bg-[#14141c] border border-[#22222e] rounded-2xl p-6 shadow-2xl animate-in fade-in duration-200">
        {/* Welcome Incentive Banner */}
        <div className="bg-gradient-to-r from-amber-500/15 to-red-600/15 border border-amber-500/30 rounded-xl p-3 mb-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-amber-300">Bonus 50 Poin & Kartu Member Instan</h4>
            <p className="text-[10px] text-slate-300">
              Buat akun sekarang untuk mendapatkan diskon servis, booking cepat tanpa isi ulang data, dan pelacakan riwayat otomatis.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[10px] font-semibold text-slate-300 uppercase mb-1">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Masukkan nama lengkap Anda"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="w-full bg-[#0b0b0e] border border-[#2a2a3c] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-600 transition-colors"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-slate-300 uppercase mb-1">
                Nomor WhatsApp Aktif <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  placeholder="081234567890"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full bg-[#0b0b0e] border border-[#2a2a3c] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-600 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-300 uppercase mb-1">
                Alamat Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="contoh@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0b0b0e] border border-[#2a2a3c] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-600 transition-colors"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-slate-300 uppercase mb-1">
                Kata Sandi <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0b0b0e] border border-[#2a2a3c] rounded-lg pl-9 pr-10 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-600 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-300 uppercase mb-1">
                Ulangi Kata Sandi <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Ketik ulang kata sandi"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#0b0b0e] border border-[#2a2a3c] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-600 transition-colors"
                  required
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#1f1f2e]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
              Data Kendaraan Anda (Opsional):
            </span>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-semibold text-slate-300 uppercase mb-1">
                  Kategori Kendaraan
                </label>
                <select
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  className="w-full bg-[#0b0b0e] border border-[#2a2a3c] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600 transition-colors"
                >
                  <option value="Mobil (Car Service) 🚗">Mobil (Car Service) 🚗</option>
                  <option value="Motor (Motor Service) 🏍️">Motor (Motor Service) 🏍️</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-300 uppercase mb-1">
                  Merek & Model Kendaraan, Plat Nomor
                </label>
                <div className="relative">
                  <Car className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Contoh: Toyota Avanza 1.3 / R 1234 DNE"
                    value={kendaraan}
                    onChange={(e) => setKendaraan(e.target.value)}
                    className="w-full bg-[#0b0b0e] border border-[#2a2a3c] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-600 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-300 uppercase mb-1">
                  Alamat Rumah / Domisili
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Nama jalan atau kawasan tempat tinggal"
                    value={alamat}
                    onChange={(e) => setAlamat(e.target.value)}
                    className="w-full bg-[#0b0b0e] border border-[#2a2a3c] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-600 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 mt-4"
          >
            <UserPlus className="w-4 h-4" />
            <span>{isLoading ? 'Mendaftarkan Akun...' : 'Daftar & Buat Akun Sekarang'}</span>
          </button>
        </form>

        {/* Link to Login */}
        <div className="mt-5 text-center pt-3 border-t border-[#1f1f2e]">
          <p className="text-xs text-slate-400">
            Sudah memiliki akun?{' '}
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="text-red-400 hover:text-red-300 font-bold hover:underline cursor-pointer"
            >
              Masuk / Login di sini
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
