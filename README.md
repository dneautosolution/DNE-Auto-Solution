# DNE Auto Solution - Motor & Car Service

A modern, responsive React + TypeScript + Tailwind CSS application for DNE Auto Solution workshop management, service bookings, real-time status tracking, promo vouchers, and digital membership.

## Features

- **Beranda (Home)**: Hero carousel banners with automatic slide and touch swipe, workshop operational statistics, top services preview, and quick booking widget.
- **Layanan (Services)**: Comprehensive motor and car service catalog with modal breakdown of service packages and transparent pricing.
- **Promo Spesial**: Real-time promotional campaigns with WIB (Asia/Jakarta) date validation, automatic status calculation (Upcoming, Active, Expired), and one-click voucher claiming.
- **Booking Servis Terpadu**: 4-step wizard for booking schedule, vehicle specifications, active WhatsApp contact, optional GPS coordinates detection, duplicate active order prevention, and automated booking ID generator (`DNE-YYYYMMDD...`).
- **Cek Status Servis Realtime**: 4-digit last characters ID lookup with multi-result selection and detailed progress breakdown.
- **Timeline Pengerjaan**: Live 4-stage tracking (Booking Diterima -> Sedang Dikerjakan -> Menunggu Sparepart -> Selesai / Batal).
- **Pusat Membership**: Luxury gold digital membership card with live QR code generation, level badge, point tracking, and automated past order loading.
- **Customer Support Integration**: Direct WhatsApp customer service integration connecting directly to the workshop admin.

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Database / Backend**: Firebase Realtime Database
