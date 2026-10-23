import React, { useState } from 'react';
import { PageType, UserAccount, NotificationModal } from '../types';
import { loginUser } from '../services/auth';
import { Lock, Mail, Eye, EyeOff, LogIn, UserPlus, Sparkles, ArrowLeft } from 'lucide-react';

interface LoginSectionProps {
  onLoginSuccess: (user: UserAccount) => void;
  onNavigate: (page: PageType) => void;
  onShowModal: (modal: Omit<NotificationModal, 'show'>) => void;
}

export const LoginSection: React.FC<LoginSectionProps> = ({
  onLoginSuccess,
  onNavigate,
  onShowModal
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      onShowModal({
        icon: '💡',
        title: 'Form Belum Lengkap',
        desc: 'Silakan masukkan Email / No. WhatsApp dan kata sandi Anda.'
      });
      return;
    }

    setIsLoading(true);
    const res = await loginUser(identifier, password);
    setIsLoading(false);

    if (res.success && res.user) {
      onLoginSuccess(res.user);
      onShowModal({
        icon: '👋',
        title: 'Selamat Datang Kembali!',
        desc: `Halo <strong>${res.user.nama}</strong>, Anda berhasil masuk ke akun DNE Auto Solution.`
      });
    } else {
      onShowModal({
        icon: '❌',
        title: 'Gagal Masuk',
        desc: res.error || 'Email atau kata sandi tidak cocok. Silakan coba lagi.'
      });
    }
  };

  // Demo / Quick 1-click login for convenience
  const handleQuickDemoLogin = async () => {
    setIsLoading(true);
    // 1. Try to login with the registered Firebase account
    let res = await loginUser('didinurefendi@gmail.com', 'Sayangku1929');
    if (!res.success) {
      res = await loginUser('budi@dne.com', 'dne12345');
    }

    if (res.success && res.user) {
      setIsLoading(false);
      onLoginSuccess(res.user);
      onShowModal({
        icon: '✨',
        title: 'Login Berhasil',
        desc: `Berhasil masuk ke akun: <strong>${res.user.nama}</strong> (${res.user.id}).`
      });
    } else {
      // Auto-register demo account
      const { registerNewUser } = await import('../services/auth');
      const reg = await registerNewUser({
        nama: 'Budi Pratama (Demo)',
        email: 'budi@dne.com',
        whatsapp: '081234567890',
        password: 'dne12345',
        kendaraanDefault: 'Honda HR-V / R 8888 DNE',
        kategoriDefault: 'Mobil (Car Service) 🚗',
        alamat: 'Jl. Jenderal Soedirman No. 45, Purwokerto'
      });
      setIsLoading(false);
      if (reg.success && reg.user) {
        onLoginSuccess(reg.user);
        onShowModal({
          icon: '✨',
          title: 'Akun Demo Siap Digunakan',
          desc: `Berhasil masuk dengan akun demo: <strong>${reg.user.nama}</strong>.`
        });
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-6 pb-20">
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => onNavigate('akun')}
          className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h2 className="text-sm font-bold uppercase tracking-wider text-white">
          Masuk / <span className="text-red-600">Login</span>
        </h2>
      </div>

      <div className="bg-[#14141c] border border-[#22222e] rounded-2xl p-6 shadow-2xl animate-in fade-in duration-200">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-600/30 flex items-center justify-center mx-auto mb-2 text-red-500">
            <LogIn className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Selamat Datang di DNE</h3>
          <p className="text-xs text-slate-400 mt-1">
            Masuk untuk mengakses kartu member, riwayat servis, dan booking instan.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-semibold text-slate-300 uppercase mb-1">
              Email / No. WhatsApp / ID Member
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="nama@email.com atau 0812345..."
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full bg-[#0b0b0e] border border-[#2a2a3c] rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-600 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-300 uppercase mb-1">
              Kata Sandi (Password)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Masukkan kata sandi akun"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0b0b0e] border border-[#2a2a3c] rounded-lg pl-9 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-600 transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 mt-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{isLoading ? 'Memeriksa Akun...' : 'Masuk Sekarang'}</span>
          </button>
        </form>

        {/* Quick Demo Login Option */}
        <div className="mt-4 pt-4 border-t border-[#1f1f2e] text-center">
          <button
            type="button"
            onClick={handleQuickDemoLogin}
            disabled={isLoading}
            className="w-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Masuk Cepat dengan Akun Percobaan</span>
          </button>
        </div>

        {/* Link to Register */}
        <div className="mt-5 text-center">
          <p className="text-xs text-slate-400">
            Belum memiliki akun?{' '}
            <button
              type="button"
              onClick={() => onNavigate('register')}
              className="text-red-400 hover:text-red-300 font-bold hover:underline cursor-pointer inline-flex items-center gap-1"
            >
              <span>Buat Akun Baru</span>
              <UserPlus className="w-3 h-3" />
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
