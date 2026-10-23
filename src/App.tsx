import React, { useState, useEffect } from 'react';
import { 
  PageType, 
  BengkelSettings, 
  HeroBannerItem, 
  ServiceItem, 
  PromoItem, 
  BookingData, 
  NotificationModal,
  UserAccount
} from './types';
import { 
  database, 
  defaultSettings, 
  defaultBanners, 
  defaultServices, 
  defaultPromos, 
  getWIBDateString,
  subscribeToFirebaseConnection,
  subscribeToLiveSettings 
} from './services/firebase';
import { getActiveUser, logoutUser } from './services/auth';
import { ref, onValue } from 'firebase/database';

import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { CustomModal } from './components/CustomModal';
import { ServiceModal } from './components/ServiceModal';
import { HomeSection } from './components/HomeSection';
import { LayananSection } from './components/LayananSection';
import { PromoSection } from './components/PromoSection';
import { BookingSection } from './components/BookingSection';
import { BerhasilSection } from './components/BerhasilSection';
import { StatusSection } from './components/StatusSection';
import { RiwayatSection } from './components/RiwayatSection';
import { DetailBookingSection } from './components/DetailBookingSection';
import { MembershipSection } from './components/MembershipSection';
import { AkunSection } from './components/AkunSection';
import { LoginSection } from './components/LoginSection';
import { RegisterSection } from './components/RegisterSection';
import { LogoutModal } from './components/LogoutModal';
import { Footer } from './components/Footer';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [settings, setSettings] = useState<BengkelSettings>(defaultSettings);
  const [banners, setBanners] = useState<HeroBannerItem[]>(defaultBanners);
  const [services, setServices] = useState<ServiceItem[]>(Object.values(defaultServices));
  const [promos, setPromos] = useState<PromoItem[]>(Object.values(defaultPromos));
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);

  // User Authentication State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => getActiveUser());
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Modals & sub-flows
  const [selectedServiceModal, setSelectedServiceModal] = useState<ServiceItem | null>(null);
  const [claimedPromo, setClaimedPromo] = useState<{ id: string; title: string } | null>(null);
  const [selectedBookingForDetail, setSelectedBookingForDetail] = useState<BookingData | null>(null);
  const [createdBookingId, setCreatedBookingId] = useState<string>('');
  const [prefilledKeluhan, setPrefilledKeluhan] = useState<string>('');

  // Quick booking prefill
  const [quickBookingData, setQuickBookingData] = useState<{ kategori: string; tanggal: string; jam: string } | null>(null);

  // Friendly alert notification
  const [notificationModal, setNotificationModal] = useState<NotificationModal>({
    icon: '💡',
    title: 'Informasi',
    desc: '',
    show: false
  });

  const showNotification = (modal: Omit<NotificationModal, 'show'>) => {
    setNotificationModal({
      ...modal,
      show: true
    });
  };

  const closeNotification = () => {
    setNotificationModal(prev => ({ ...prev, show: false }));
  };

  // Real-time synchronization with Firebase Database
  useEffect(() => {
    // 0. Live Connection Monitor
    const unsubConn = subscribeToFirebaseConnection((connected) => {
      setIsFirebaseConnected(connected);
    });

    // 1. Settings & App Settings Live Listener
    const unsubSettings = subscribeToLiveSettings((liveSettings) => {
      setSettings(liveSettings);
    });

    // 2. Banner listener
    const bannerRef = ref(database, 'hero_banner');
    const unsubBanners = onValue(bannerRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list: HeroBannerItem[] = [];
        Object.keys(data).forEach((key) => {
          const item = data[key];
          if (item) {
            list.push({
              ...item,
              id: key,
              url_gambar: item.displayImageUrl || item.url_gambar || item.banner,
              link_tujuan: item.action_url || item.actionTarget || item.link_tujuan
            });
          }
        });
        list.sort((a, b) => parseInt(String(a.nomor_urut || 0)) - parseInt(String(b.nomor_urut || 0)));
        if (list.length > 0) setBanners(list);
      }
    }, () => {});

    // 3. Services listener
    const servicesRef = ref(database, 'services');
    const unsubServices = onValue(servicesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list: ServiceItem[] = [];
        Object.keys(data).forEach((key) => {
          const item = data[key];
          if (item && item.status !== 'Inactive') {
            list.push({ ...item, id: key });
          }
        });
        if (list.length > 0) setServices(list);
      }
    }, () => {});

    // 4. Promos listener
    const promosRef = ref(database, 'promos');
    const unsubPromos = onValue(promosRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list: PromoItem[] = [];
        Object.keys(data).forEach((key) => {
          const item = data[key];
          if (item) {
            list.push({
              ...item,
              id: key,
              banner: item.displayBannerUrl || item.banner || item.url_gambar,
              tanggal_mulai: item.tanggal_aktif || item.tanggal_mulai
            });
          }
        });
        if (list.length > 0) setPromos(list);
      }
    }, () => {});

    return () => {
      unsubConn();
      unsubSettings();
      unsubBanners();
      unsubServices();
      unsubPromos();
    };
  }, []);

  // Real-time synchronization for logged in User (points, tier, status updates)
  useEffect(() => {
    if (!currentUser?.id) return;

    const userRef = ref(database, `users/${currentUser.id}`);
    const unsubUser = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const liveUser = snapshot.val();
        setCurrentUser(prev => {
          if (!prev) return liveUser;
          const merged: UserAccount = { ...prev, ...liveUser };
          localStorage.setItem('dne_active_user', JSON.stringify(merged));
          return merged;
        });
      }
    }, () => {});

    const memberRef = ref(database, `members/${currentUser.id}`);
    const unsubMember = onValue(memberRef, (snapshot) => {
      if (snapshot.exists()) {
        const liveMember = snapshot.val();
        setCurrentUser(prev => {
          if (!prev) return null;
          const merged: UserAccount = {
            ...prev,
            jumlah_poin: liveMember.jumlah_poin !== undefined ? liveMember.jumlah_poin : prev.jumlah_poin,
            level: liveMember.level || prev.level,
            status: liveMember.status || prev.status
          };
          localStorage.setItem('dne_active_user', JSON.stringify(merged));
          return merged;
        });
      }
    }, () => {});

    return () => {
      unsubUser();
      unsubMember();
    };
  }, [currentUser?.id]);

  const navigateTo = (page: PageType) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClaimPromo = (promoId: string, promoTitle: string, endDate?: string) => {
    const todayWIB = getWIBDateString();
    if (endDate && todayWIB > endDate) {
      showNotification({
        icon: '⚠️',
        title: 'Promo Sudah Berakhir',
        desc: `Maaf, voucher <strong>${promoTitle}</strong> sudah melewati masa berlaku dan berstatus <strong>EXPIRED</strong>.`
      });
      return;
    }

    setClaimedPromo({ id: promoId, title: promoTitle });
    navigateTo('booking');
    showNotification({
      icon: '🎟️',
      title: 'Voucher Berhasil Dipasang!',
      desc: `Wah, voucher <strong>${promoTitle}</strong> berhasil dipasang ke form booking Anda. Silakan lanjutkan pengisian data ya!`
    });
  };

  const handleSelectPackageItem = (itemName: string, itemPrice: string) => {
    setSelectedServiceModal(null);
    setPrefilledKeluhan(`Pilihan Layanan: ${itemName} (Estimasi: ${itemPrice})`);
    navigateTo('booking');
  };

  const handleQuickBook = (kategori: string, tanggal: string, jam: string) => {
    setQuickBookingData({ kategori, tanggal, jam });
    navigateTo('booking');
  };

  const handleBookingSuccess = (id: string) => {
    setCreatedBookingId(id);
    // If logged in, award points
    if (currentUser) {
      const updatedUser: UserAccount = {
        ...currentUser,
        jumlah_poin: (currentUser.jumlah_poin || 0) + 10
      };
      setCurrentUser(updatedUser);
      localStorage.setItem('dne_active_user', JSON.stringify(updatedUser));
    }
    navigateTo('berhasil');
  };

  const handleSelectBookingDetail = (booking: BookingData) => {
    setSelectedBookingForDetail(booking);
    navigateTo('detail_booking');
  };

  // Auth Handlers
  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    navigateTo('akun');
  };

  const handleRegisterSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    navigateTo('akun');
  };

  const handleLogoutConfirm = () => {
    logoutUser();
    setCurrentUser(null);
    setShowLogoutConfirm(false);
    showNotification({
      icon: '👋',
      title: 'Berhasil Keluar',
      desc: 'Anda telah berhasil keluar dari akun DNE Auto Solution.'
    });
    navigateTo('home');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0b0e] text-white">
      {/* Top Sticky Header */}
      <Header
        settings={settings}
        currentPage={currentPage}
        currentUser={currentUser}
        isFirebaseConnected={isFirebaseConnected}
        onNavigate={navigateTo}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {currentPage === 'home' && (
          <HomeSection
            banners={banners}
            services={services}
            settings={settings}
            onNavigate={navigateTo}
            onOpenService={(srv) => setSelectedServiceModal(srv)}
            onQuickBook={handleQuickBook}
          />
        )}

        {currentPage === 'layanan' && (
          <LayananSection
            services={services}
            onOpenService={(srv) => setSelectedServiceModal(srv)}
          />
        )}

        {currentPage === 'promo' && (
          <PromoSection
            promos={promos}
            onClaimPromo={handleClaimPromo}
            onNavigateToBooking={() => navigateTo('booking')}
          />
        )}

        {currentPage === 'booking' && (
          <BookingSection
            initialKategori={quickBookingData?.kategori}
            initialTanggal={quickBookingData?.tanggal}
            initialJam={quickBookingData?.jam}
            claimedPromo={claimedPromo}
            currentUser={currentUser}
            onClearPromo={() => setClaimedPromo(null)}
            onBookingSuccess={handleBookingSuccess}
            onShowModal={showNotification}
            prefilledKeluhan={prefilledKeluhan}
          />
        )}

        {currentPage === 'berhasil' && (
          <BerhasilSection
            bookingId={createdBookingId}
            onNavigate={navigateTo}
          />
        )}

        {currentPage === 'status' && (
          <StatusSection
            onSelectBookingForDetail={handleSelectBookingDetail}
            onShowModal={showNotification}
          />
        )}

        {currentPage === 'riwayat' && (
          <RiwayatSection
            currentUser={currentUser}
            onSelectBooking={handleSelectBookingDetail}
            onNavigateToBooking={() => navigateTo('booking')}
          />
        )}

        {currentPage === 'detail_booking' && (
          <DetailBookingSection
            booking={selectedBookingForDetail}
            onBack={() => navigateTo('riwayat')}
          />
        )}

        {currentPage === 'membership' && (
          <MembershipSection
            currentUser={currentUser}
            onShowModal={showNotification}
            onSelectBookingDetail={handleSelectBookingDetail}
            adminPhone={settings.whatsapp_admin}
          />
        )}

        {currentPage === 'akun' && (
          <AkunSection 
            currentUser={currentUser} 
            onNavigate={navigateTo} 
            onLogoutRequest={() => setShowLogoutConfirm(true)}
          />
        )}

        {currentPage === 'login' && (
          <LoginSection
            onLoginSuccess={handleLoginSuccess}
            onNavigate={navigateTo}
            onShowModal={showNotification}
          />
        )}

        {currentPage === 'register' && (
          <RegisterSection
            onRegisterSuccess={handleRegisterSuccess}
            onNavigate={navigateTo}
            onShowModal={showNotification}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Fixed Bottom Navigation */}
      <BottomNav
        currentPage={currentPage}
        onNavigate={navigateTo}
      />

      {/* Service Detail Modal */}
      <ServiceModal
        service={selectedServiceModal}
        onClose={() => setSelectedServiceModal(null)}
        onSelectItem={handleSelectPackageItem}
      />

      {/* Custom Notification Modal */}
      <CustomModal
        modalData={notificationModal}
        onClose={closeNotification}
      />

      {/* Logout Confirmation Modal */}
      <LogoutModal
        show={showLogoutConfirm}
        userName={currentUser?.nama || ''}
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
};

export default App;
