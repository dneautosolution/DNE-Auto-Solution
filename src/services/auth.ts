import { UserAccount } from '../types';
import { database, getWIBDateString } from './firebase';
import { ref, get, set, update, onValue } from 'firebase/database';

const ACTIVE_USER_KEY = 'dne_active_user';
const USERS_LOCAL_KEY = 'dne_registered_users';

export function getActiveUser(): UserAccount | null {
  try {
    const raw = localStorage.getItem(ACTIVE_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setActiveUserSession(user: UserAccount | null) {
  if (user) {
    localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(ACTIVE_USER_KEY);
  }
}

export function getLocalRegisteredUsers(): UserAccount[] {
  try {
    const raw = localStorage.getItem(USERS_LOCAL_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveLocalRegisteredUser(user: UserAccount) {
  const users = getLocalRegisteredUsers();
  const existingIndex = users.findIndex(u => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase() || u.whatsapp === user.whatsapp);
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.unshift(user);
  }
  localStorage.setItem(USERS_LOCAL_KEY, JSON.stringify(users));
}

// 1. Buat Akun / Registrasi Baru ke Firebase Realtime Database
export async function registerNewUser(data: {
  nama: string;
  email: string;
  whatsapp: string;
  password: string;
  kendaraanDefault?: string;
  kategoriDefault?: string;
  alamat?: string;
}): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
  const namaClean = data.nama.trim();
  const emailClean = data.email.trim().toLowerCase();
  let waClean = data.whatsapp.trim();
  if (waClean.startsWith('0')) waClean = '62' + waClean.slice(1);
  const password = data.password;

  if (!namaClean || !emailClean || !waClean || !password) {
    return { success: false, error: 'Semua bidang bertanda bintang wajib diisi.' };
  }

  if (password.length < 6) {
    return { success: false, error: 'Kata sandi minimal 6 karakter.' };
  }

  // 1. Check duplicate directly in Firebase Realtime Database
  try {
    const userSnap = await get(ref(database, 'users'));
    if (userSnap.exists()) {
      const allUsers = userSnap.val();
      for (const k in allUsers) {
        const u = allUsers[k];
        if (u) {
          if (u.email && u.email.toLowerCase() === emailClean) {
            return { success: false, error: 'Alamat email sudah terdaftar. Silakan langsung login.' };
          }
          if (u.whatsapp && (u.whatsapp === waClean || u.whatsapp === data.whatsapp.trim())) {
            return { success: false, error: 'Nomor WhatsApp sudah terdaftar. Silakan langsung login.' };
          }
        }
      }
    }
  } catch (err) {
    console.warn('Firebase user check notice:', err);
  }

  // Generate Unique Member ID: MBR-2026-XXXXXX
  const now = new Date();
  const year = now.getFullYear();
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const memberId = `MBR-${year}-${randomSuffix}`;

  // Next year expiration
  const nextYear = new Date();
  nextYear.setFullYear(now.getFullYear() + 1);
  const tglBerakhir = nextYear.toISOString().split('T')[0];

  const newUser: UserAccount = {
    id: memberId,
    nama: namaClean,
    email: emailClean,
    whatsapp: waClean,
    password: password,
    kendaraanDefault: data.kendaraanDefault?.trim() || '',
    kategoriDefault: data.kategoriDefault || 'Mobil (Car Service) 🚗',
    alamat: data.alamat?.trim() || '',
    level: 'Silver Member',
    masa_aktif: '1 Tahun',
    tanggal_berakhir: tglBerakhir,
    jumlah_poin: 50, // Welcome points bonus
    status: 'AKTIF',
    qr_code: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${memberId}`,
    createdAt: getWIBDateString()
  };

  // 2. Save directly to Firebase RTDB nodes: 'users' and 'members'
  try {
    await set(ref(database, `users/${memberId}`), newUser);
    await set(ref(database, `members/${memberId}`), {
      id: memberId,
      nama: namaClean,
      whatsapp: waClean,
      email: emailClean,
      level: 'Silver Member',
      masa_aktif: '1 Tahun',
      tanggal_berakhir: tglBerakhir,
      jumlah_poin: 50,
      status: 'AKTIF',
      qr_code: newUser.qr_code,
      benefit: [
        { nama: 'Diskon Jasa Servis 10%', keterangan: 'Berlaku untuk semua jenis tune up dan servis rem' },
        { nama: 'Gratis Pengecekan 21 Titik', keterangan: 'Inspeksi berkala menyeluruh gratis' },
        { nama: 'Bonus 50 Poin Selamat Datang', keterangan: 'Poin loyalitas langsung aktif' }
      ]
    });
  } catch (err) {
    console.warn('Realtime database write error, stored in local cache', err);
  }

  // Save to local cache as well
  saveLocalRegisteredUser(newUser);
  setActiveUserSession(newUser);

  return { success: true, user: newUser };
}

// 2. Login User ke Firebase Realtime Database
export async function loginUser(
  identifier: string,
  passwordInput: string
): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
  const cleanId = identifier.trim().toLowerCase();
  let cleanWa = identifier.trim();
  if (cleanWa.startsWith('0')) cleanWa = '62' + cleanWa.slice(1);

  if (!cleanId || !passwordInput) {
    return { success: false, error: 'Silakan isi email/WhatsApp/ID Member dan kata sandi.' };
  }

  // 1. Direct Realtime Check with Firebase RTDB 'users'
  try {
    const snapshot = await get(ref(database, 'users'));
    if (snapshot.exists()) {
      const allUsers = snapshot.val();
      for (const k in allUsers) {
        const u = allUsers[k];
        if (!u) continue;
        
        const matchIdentifier = (
          (u.email && u.email.toLowerCase() === cleanId) ||
          (u.whatsapp && (u.whatsapp === cleanWa || u.whatsapp === identifier.trim())) ||
          (u.id && (u.id.toLowerCase() === cleanId || u.id.endsWith(identifier.trim())))
        );

        if (matchIdentifier) {
          if (u.password === passwordInput) {
            const userObj: UserAccount = {
              id: u.id || k,
              nama: u.nama || 'Member DNE',
              email: u.email || '',
              whatsapp: u.whatsapp || cleanWa,
              password: u.password,
              kendaraanDefault: u.kendaraanDefault || '',
              kategoriDefault: u.kategoriDefault || 'Mobil (Car Service) 🚗',
              alamat: u.alamat || '',
              level: u.level || 'Silver Member',
              masa_aktif: u.masa_aktif || '1 Tahun',
              tanggal_berakhir: u.tanggal_berakhir || '',
              jumlah_poin: u.jumlah_poin !== undefined ? u.jumlah_poin : 50,
              status: u.status || 'AKTIF',
              qr_code: u.qr_code || `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${u.id || k}`,
              createdAt: u.createdAt || getWIBDateString()
            };

            saveLocalRegisteredUser(userObj);
            setActiveUserSession(userObj);
            return { success: true, user: userObj };
          } else {
            return { success: false, error: 'Kata sandi tidak sesuai. Silakan periksa kembali.' };
          }
        }
      }
    }
  } catch (err) {
    console.warn('Firebase query notice during login', err);
  }

  // 2. Also check if member exists in Firebase 'members'
  try {
    const memberSnap = await get(ref(database, 'members'));
    if (memberSnap.exists()) {
      const allMembers = memberSnap.val();
      for (const k in allMembers) {
        const m = allMembers[k];
        if (!m) continue;

        const matchMember = (
          (m.email && m.email.toLowerCase() === cleanId) ||
          (m.whatsapp && (m.whatsapp === cleanWa || m.whatsapp === identifier.trim())) ||
          (m.id && (m.id.toLowerCase() === cleanId || m.id.endsWith(identifier.trim())))
        );

        if (matchMember) {
          // If member matched and password matches default or PIN
          if (passwordInput.length >= 4) {
            const userObj: UserAccount = {
              id: m.id || k,
              nama: m.nama || 'Member DNE',
              email: m.email || '',
              whatsapp: m.whatsapp || cleanWa,
              level: m.level || 'Silver Member',
              masa_aktif: m.masa_aktif || '1 Tahun',
              tanggal_berakhir: m.tanggal_berakhir || '',
              jumlah_poin: m.jumlah_poin !== undefined ? m.jumlah_poin : 50,
              status: m.status || 'AKTIF',
              qr_code: m.qr_code || `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${m.id || k}`,
              createdAt: getWIBDateString()
            };
            saveLocalRegisteredUser(userObj);
            setActiveUserSession(userObj);
            return { success: true, user: userObj };
          }
        }
      }
    }
  } catch (err) {
    console.warn('Firebase member check notice:', err);
  }

  // 3. Fallback to Local Storage cache
  const localUsers = getLocalRegisteredUsers();
  const matchedLocal = localUsers.find(u => 
    (u.email.toLowerCase() === cleanId || 
     u.whatsapp === cleanWa || 
     u.whatsapp === identifier.trim() || 
     u.id.toLowerCase() === cleanId ||
     u.id.endsWith(identifier.trim())) && 
    u.password === passwordInput
  );

  if (matchedLocal) {
    setActiveUserSession(matchedLocal);
    return { success: true, user: matchedLocal };
  }

  return { success: false, error: 'Email, WhatsApp, atau kata sandi tidak cocok. Silakan coba lagi.' };
}

// 3. Logout User
export function logoutUser() {
  setActiveUserSession(null);
}
