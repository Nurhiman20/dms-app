# dms-app

Aplikasi DMS (Distributor Management System) berbasis Vue 3 + Quasar dengan PWA dan mode offline. Proyek ini dirancang untuk tetap berfungsi dengan baik di kondisi jaringan tidak stabil, dengan cache data lokal dan antrean sinkronisasi.

## Fitur Utama

- **Autentikasi (mock) dengan role**: Login menggunakan pilihan peran `Admin` atau `Sales` dengan token dummy untuk simulasi alur auth (`src/services/authApi.ts`).
- **Dashboard**: Ringkasan chart penjualan dan outlet (halaman `src/pages/DashboardPage.vue`).
- **Manajemen Outlet**:
  - Daftar outlet (`src/pages/OutletListPage.vue`).
  - Detail outlet (`src/pages/OutletDetailPage.vue`).
- **Penjualan (Sales)**:
  - Dialog tambah penjualan baru (`src/components/NewSaleDialog.vue`).
  - Penyimpanan dan cache data penjualan ke dalam IndexedDB (`src/stores/sales.ts`).
- **PWA (Progressive Web App)**:
  - Instalable ke home screen, offline-first, service worker otomatis dari `vite-plugin-pwa` (lihat `vite.config.ts`, `public/manifest.json`).
- **Mode Offline**:
  - Cache data lokal ke IndexedDB (Dexie) untuk `outlets`, `sales`, dan `dashboardStats` (`src/utils/db.ts`).
  - Antrean sinkronisasi saat offline → otomatis disinkronkan saat online (`src/utils/offlineQueue.ts`).
  - Indikator status jaringan UI (`src/components/OfflineIndicator.vue`) dan notifikasi proses sync (Quasar Notify).
- **Routing & Guard**: Navigasi menggunakan `vue-router` dengan perlindungan akses (route-guard).
- **State Management**: Pinia stores untuk outlet dan sales (`src/stores/outlet.ts`, `src/stores/sales.ts`).
- **Pengujian Unit**: Vitest (`src/__tests__/App.spec.ts`).

## Alasan Pemilihan Stack

- **Vue 3 + TypeScript**:
  - Composition API memudahkan modularisasi dan reuse logic.
  - TypeScript meningkatkan maintainability.
- **Vite**:
  - Hot Module Replacement (HMR) membuat proses development lebih cepat karene pembaruan konten secara real-time tanpa harus memuat ulang seluruh halaman.
  - Build lebih ringan.
- **Quasar Framework**:
  - Banyak component tersedia sehingga mempercepat pengembangan.
  - Memudahkan responsive design di web dan mobile.
- **Pinia**:
  - Lebih mudah di-debug dan diorganisasi.
- **IndexedDB via Dexie**:
  - Definisi skema, versi, dan migrasi bersifat deklaratif dan ringkas.
  - Query dan indeks lebih mudah (mis. `where`, `anyOf`, compound index).
  - Developer experience lebih baik dengan dukungan TypeScript yang kuat.
- **PWA (Workbox via vite-plugin-pwa)**:
  - Tidak perlu konfigurasi service worker manual
  - Otomatis generate manifest & caching rules
- **Vitest**:
  - Runner cepat untuk unit test, kompatibel dengan ekosistem Vite/Vue.

## Arsitektur Singkat

- **Halaman**: `DashboardPage.vue`, `OutletListPage.vue`, `OutletDetailPage.vue`, `LoginPage.vue`.
- **Komponen**: `DashboardSidebar.vue`, `DashboardNavbar.vue`, `NewSaleDialog.vue`, `OfflineIndicator.vue`, `AccessDeniedCard.vue`.
- **State (Pinia)**: `stores/outlet.ts`, `stores/sales.ts` (termasuk inisialisasi cache untuk offline).
- **Utilitas**:
  - `utils/db.ts`: Skema IndexedDB (Dexie) + layanan cache dan statistik.
  - `utils/offlineQueue.ts`: Antrean operasi (create/update/delete) yang diproses ulang saat online.
  - `utils/networkStatus.ts`: Listener status jaringan dan helper `isOnline`.
- **Service/Api**: `services/authApi.ts` (mock), `services/outletApi.ts`, `services/salesApi.ts`, `services/dashboardApi.ts`.
- **PWA**: `vite.config.ts` (konfigurasi plugin PWA), `public/manifest.json`.

## Cara Menjalankan

```sh
npm install
npm run dev
```

Akses pada `http://localhost:5173` (default Vite). Gunakan peran `Admin` atau `Sales` di halaman login untuk simulasi.

## Build Produksi

```sh
npm run build
```

Hasil build tersedia di folder `dist/`. PWA service worker akan ter-generate otomatis.

## Pengujian

```sh
npm run test:unit
```

## Perilaku Offline & Sinkronisasi

- Data dari halaman dashboard/outlet/sales akan dicache ke IndexedDB agar dapat diakses saat offline.
- Saat melakukan aksi ketika offline (mis. membuat penjualan), operasi akan masuk ke antrian (`offlineQueue`).
- Ketika koneksi kembali online, antrian akan diproses otomatis dan pengguna mendapat notifikasi hasil sinkronisasi.

## Praktik Pengembangan yang Disarankan

- Gunakan **Vue Devtools** untuk debugging komponen dan Pinia store.
- Pastikan perubahan terkait PWA/Service Worker melakukan hard refresh setelah build agar SW terbaru aktif.

## Lisensi

Proyek ini untuk kebutuhan internal. Silakan sesuaikan ketentuan lisensi sesuai kebutuhan organisasi Anda.
