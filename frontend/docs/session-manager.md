# Session Manager - Dokumentasi

## Gambaran Umum

Session Manager adalah komponen pusat komando operasional yang menggantikan modul "Inbox" lama. Komponen ini dirancang untuk memungkinkan agen dan admin mengelola seluruh siklus hidup sesi percakapan secara efisien dengan identifikasi visual yang jelas untuk setiap kanal komunikasi.

## Fitur Utama

### 1. Panel Kiri - Daftar Sesi & Filter
- **Daftar Sesi**: Menampilkan semua sesi chat dengan informasi lengkap
- **Ikon Kanal**: Identifikasi visual untuk WhatsApp, Telegram, Web, dan Facebook
- **Filter Lanjutan**:
  - Filter berdasarkan kanal (WhatsApp, Web, Telegram, Facebook)
  - Filter berdasarkan agent (termasuk sesi yang belum ditugaskan)
  - Filter berdasarkan status (Aktif, Bot, Agent, Selesai)
  - Filter berdasarkan tags
  - Pencarian berdasarkan nama pelanggan atau isi pesan

### 2. Panel Tengah - Jendela Percakapan Multi-Channel
- **Header Dinamis**: Menampilkan info pelanggan dan status sesi
- **Render Konten Multi-Type**:
  - Pesan teks dengan format yang berbeda untuk customer, bot, dan agent
  - Dukungan gambar dengan preview dan klik untuk membuka
  - Dukungan dokumen dengan link download
  - Quick replies sebagai tombol yang dapat diklik
- **Input Pesan**: 
  - Area text untuk mengetik pesan
  - Upload file untuk lampiran
  - Keyboard shortcut (Enter untuk kirim, Shift+Enter untuk baris baru)

### 3. Panel Kanan - Manajemen Sesi & Konteks
- **Tab Info Pelanggan**:
  - Detail lengkap customer (nama, email, telepon, lokasi)
  - Riwayat interaksi
  - Informasi metadata pelanggan
- **Tab Kelola Sesi**:
  - Detail sesi (waktu mulai, kanal, alasan eskalasi)
  - Assign agent dengan dropdown agent online
  - Manajemen tags (tambah/hapus)
  - Kontrol status sesi (aktifkan/tutup)

## Struktur Data

### Chat Sessions
```javascript
{
  id: number,
  customer_id: number,
  channel_config_id: number,
  agent_id: number | null,
  status: 'active' | 'bot_handled' | 'agent_handled' | 'completed',
  started_at: string,
  ended_at: string | null,
  is_active: boolean,
  tags: string[],
  handover_reason: string | null,
  metadata: object
}
```

### Messages
```javascript
{
  id: number,
  session_id: number,
  sender_type: 'customer' | 'bot' | 'agent',
  sender_id: number | null,
  message_type: 'text' | 'image' | 'document',
  content: string,
  media_url: string | null,
  quick_replies: string[] | null,
  created_at: string
}
```

### Channel Configs
```javascript
{
  id: number,
  name: string,
  channel: string,
  channel_type: 'whatsapp' | 'web' | 'telegram' | 'facebook',
  settings: object,
  is_active: boolean
}
```

### Customers
```javascript
{
  id: number,
  name: string,
  email: string,
  phone: string,
  created_at: string,
  last_seen: string,
  metadata: object
}
```

## Komponen dan Hooks

### Komponen Utama
- `SessionManager.jsx` - Komponen utama dengan layout tiga panel
- `MessageItem.jsx` - Komponen untuk render individual message

### Hooks
- `useSessionManager.js` - Custom hook untuk state management dan logika bisnis

### Utilities
- `dateUtils.js` - Fungsi utilitas untuk format tanggal dan waktu

## Identifikasi Kanal

Setiap kanal memiliki ikon dan warna yang berbeda:
- **WhatsApp**: 🟢 MessageCircle hijau
- **Website**: 🔵 Globe biru
- **Telegram**: 🔵 Send biru muda  
- **Facebook**: 🔵 Users biru tua

## Status Sesi

- **Aktif**: Sesi yang sedang berlangsung, memerlukan perhatian
- **Bot**: Sesi yang ditangani oleh bot
- **Agent**: Sesi yang ditangani oleh agent manusia
- **Selesai**: Sesi yang sudah diselesaikan

## Filter dan Pencarian

### Filter yang Tersedia:
1. **Kanal**: Semua / WhatsApp / Website / Telegram / Facebook
2. **Agent**: Semua / Belum Ditugaskan / [Nama Agent]
3. **Status**: Semua / Aktif / Bot / Agent / Selesai
4. **Tags**: Input text untuk filter berdasarkan tag
5. **Pencarian**: Input text untuk mencari berdasarkan nama atau pesan

### Pencarian Real-time:
- Pencarian dilakukan secara real-time saat user mengetik
- Mencari di nama pelanggan dan konten pesan terakhir
- Case-insensitive

## Manajemen Sesi

### Assign Agent:
- Dropdown menampilkan agent yang sedang online
- Indikator status agent (online/busy/offline)
- Update real-time ketika agent ditugaskan

### Manajemen Tags:
- Tambah tag baru dengan input text + tombol
- Hapus tag dengan klik ikon X pada badge
- Tag ditampilkan sebagai badge berwarna

### Kontrol Status:
- Tombol untuk mengaktifkan sesi
- Tombol untuk menutup sesi
- Update timestamp otomatis

## Responsive Design

- Layout responsif untuk berbagai ukuran layar
- Panel dapat di-collapse pada layar kecil
- Touch-friendly untuk mobile devices

## Integrasi API (Placeholder)

Semua aksi sudah memiliki handler function yang siap untuk integrasi API:
- `assignAgent(sessionId, agentId)`
- `updateSessionStatus(sessionId, status)`
- `addTag(sessionId, tag)`
- `removeTag(sessionId, tag)`
- `sendMessage(sessionId, content, type, mediaUrl)`

## Testing

Komponen telah ditest dengan:
- Sample data yang comprehensive
- Berbagai skenario filter dan pencarian
- Interaksi antar panel
- Responsive behavior

## Setup dan Instalasi

1. Komponen sudah terintegrasi dengan aplikasi melalui `App.jsx`
2. Menggunakan komponen UI yang sudah ada di `/components/ui`
3. Data sample tersedia di `/data/sampleData.js`
4. Tidak memerlukan dependencies tambahan

## Penggunaan

```jsx
import SessionManager from './components/inbox/SessionManager';

// Dalam routing atau menu handler
case 'inbox':
  return <SessionManager />;
```

Session Manager siap digunakan dan akan menggantikan komponen Inbox lama dengan fitur yang jauh lebih komprehensif dan user-friendly.
