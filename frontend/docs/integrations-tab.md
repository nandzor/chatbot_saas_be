# Tab Integrations - Connected Apps Documentation

## Gambaran Umum

Tab "Integrations" adalah fitur baru dalam halaman Settings yang memungkinkan pengguna untuk mengelola koneksi aplikasi pihak ketiga (Connected Apps) dengan chatbot mereka. Fitur ini menyediakan antarmuka visual berbasis kartu yang intuitif untuk mengaktifkan, mengkonfigurasi, dan mengelola berbagai integrasi.

## Penempatan dan Navigasi

- **Lokasi**: Tab ketiga dalam halaman Settings
- **Urutan Tab**: Channels | Bot Personalities | **Integrations** | Team Management | Billing & Subscription | Developer | Security
- **Judul Halaman**: "Connected Apps"
- **Subtitle**: "Connect your chatbot with third-party applications to extend its functionality."

## Fitur Utama

### 1. Dashboard Statistik Integrasi
Menampilkan 4 kartu statistik utama:
- **Active**: Jumlah integrasi yang sedang aktif
- **Inactive**: Jumlah integrasi yang tidak aktif
- **Categories**: Jumlah kategori integrasi yang tersedia
- **Configured**: Jumlah integrasi yang sudah dikonfigurasi

### 2. Kategori Integrasi
Integrasi dikelompokkan dalam 8 kategori:
- **Productivity** (Produktivitas)
- **Communication** (Komunikasi)
- **Shipping & Logistics** (Pengiriman & Logistik)
- **Notifications** (Notifikasi)
- **Security** (Keamanan)
- **Automation** (Otomasi)
- **CRM & Sales** (CRM & Penjualan)
- **Payment & Billing** (Pembayaran & Tagihan)

### 3. Grid Layout Kartu Integrasi
- Layout responsif: 1 kolom (mobile), 2 kolom (tablet), 3 kolom (desktop)
- Setiap kategori ditampilkan terpisah dengan header dan badge jumlah
- Kartu diurutkan berdasarkan kategori dan status

## Struktur Data Integrasi

### Data Schema
```javascript
{
  id: number,
  name: string,
  description: string,
  icon: string,
  category: string,
  status: 'active' | 'inactive',
  configRequired: boolean,
  config: object,
  features: string[],
  setupSteps: string[]
}
```

### Contoh Integrasi yang Tersedia:

#### 1. Google Sheets (Productivity)
- **Deskripsi**: Hubungkan ke Google Sheets untuk membaca dan menulis data pelanggan secara otomatis
- **Konfigurasi**: Google Account, Sheet ID, Sheet Name, Permissions
- **Features**: Sinkronisasi data pelanggan, Export chat history, Real-time updates

#### 2. WhatsApp Business API (Communication)
- **Deskripsi**: Integrasi resmi dengan WhatsApp Business API untuk fitur lanjutan dan analytics
- **Konfigurasi**: Business Account ID, Phone Number ID, Access Token, Webhook Verify Token
- **Features**: Verified business badge, Template messages, Rich media support, Advanced analytics

#### 3. Cek Ongkos Kirim (Shipping)
- **Deskripsi**: Integrasi dengan API pengiriman untuk cek ongkos kirim otomatis (JNE, TIKI, POS)
- **Konfigurasi**: API Keys untuk berbagai carrier, Default origin city
- **Features**: Multi-carrier support, Real-time pricing, Weight calculation, Distance estimation

#### 4. Kirim Notifikasi Pribadi (Notification)
- **Deskripsi**: Kirim notifikasi push atau email ke admin ketika ada percakapan prioritas tinggi
- **Konfigurasi**: FCM API Key, SMTP settings, Notification rules
- **Features**: Push notifications, Email alerts, Custom rules, Priority filtering

#### 5. Allow List / Whitelist Numbers (Security)
- **Deskripsi**: Batasi akses chatbot hanya untuk nomor telepon yang terdaftar dalam whitelist
- **Konfigurasi**: Enable mode, Allowed numbers list, Block message, Admin numbers
- **Features**: Number verification, Admin bypass, Custom block message, Bulk import

## Komponen Kartu Integrasi

### Visual Elements
1. **Status Badge**: Badge "Active" atau "Inactive" di pojok kanan atas
2. **Category Indicator**: Garis vertikal berwarna di sisi kiri kartu sesuai kategori
3. **Icon Area**: Ikon visual yang unik untuk setiap integrasi
4. **Name & Description**: Nama integrasi dan deskripsi singkat
5. **Features Preview**: Badge menampilkan 3 fitur utama + indikator "more"
6. **Configuration Status**: Indikator apakah integrasi sudah dikonfigurasi
7. **Action Buttons**: Tombol "Settings" dan "Activate/Deactivate"

### Status Visual
- **Active**: Border biru, ikon berwarna, badge hijau
- **Inactive**: Border abu-abu, ikon abu-abu, badge abu-abu
- **Configured**: Dot hijau dengan text "Configured"
- **Configuration Required**: Dot orange dengan text "Configuration Required"

### Color Coding per Kategori
- **Productivity**: Biru (`bg-blue-500`)
- **Communication**: Hijau (`bg-green-500`)
- **Shipping**: Orange (`bg-orange-500`)
- **Notification**: Ungu (`bg-purple-500`)
- **Security**: Merah (`bg-red-500`)
- **Automation**: Kuning (`bg-yellow-500`)
- **CRM**: Pink (`bg-pink-500`)
- **Payment**: Emerald (`bg-emerald-500`)

## Modal Konfigurasi

### Struktur Modal
1. **Header**: Nama integrasi, deskripsi, tombol close
2. **Setup Progress**: Visual progress steps dengan indikator current step
3. **Configuration Form**: Form spesifik untuk setiap integrasi
4. **Features List**: Daftar fitur yang akan didapat
5. **Action Buttons**: Previous/Next step, Cancel, Save Configuration

### Form Konfigurasi Spesifik

#### Google Sheets
- Google Account connection status
- Google Sheet ID input
- Sheet name selection
- Permissions checkboxes (read/write)

#### WhatsApp Business API
- Business Account ID
- Phone Number ID
- Access Token (dengan show/hide)
- Webhook Verify Token (dengan show/hide)

#### Allow List (Whitelist Numbers)
- Enable/disable toggle
- Textarea untuk daftar nomor (satu per baris)
- Custom block message
- Admin numbers list

#### Kirim Notifikasi Pribadi
- Push Notification API Key
- Email provider selection (SMTP/SendGrid/Mailgun)
- SMTP configuration (host, port, username, password)
- Notification rules dengan toggle per trigger

### Security Features
- Sensitive data fields menggunakan password type dengan toggle show/hide
- API keys dan tokens di-mask secara default
- Validation untuk format nomor telepon dan email

## Fungsionalitas

### State Management
- **Local State**: Menggunakan React useState untuk mengelola status integrasi
- **Real-time Updates**: Perubahan status dan konfigurasi langsung terrefleksi di UI
- **Persistence**: Konfigurasi disimpan ke state dan siap untuk integrasi dengan API

### Actions
1. **Configure Integration**: Membuka modal konfigurasi untuk integrasi tertentu
2. **Save Configuration**: Menyimpan konfigurasi ke state aplikasi
3. **Toggle Status**: Mengaktifkan/menonaktifkan integrasi
4. **Validation**: Memastikan konfigurasi lengkap sebelum aktivasi

### Business Logic
- Integrasi hanya bisa diaktifkan jika sudah dikonfigurasi (untuk yang memerlukan)
- Status badge dan tombol berubah secara real-time
- Warning ditampilkan untuk integrasi yang belum dikonfigurasi
- Form validation untuk input yang diperlukan

## Responsive Design

### Breakpoints
- **Mobile (< 768px)**: 1 kolom grid, stack layout
- **Tablet (768px - 1024px)**: 2 kolom grid
- **Desktop (> 1024px)**: 3 kolom grid

### Mobile Optimizations
- Touch-friendly button sizes
- Swipe gestures untuk navigation modal
- Condensed card layout
- Bottom sheet modal untuk mobile

## Extensibility

### Menambah Integrasi Baru
1. Tambahkan data di `integrationsData` di `sampleData.js`
2. Definisikan ikon di `IntegrationCard.jsx`
3. Implementasi form konfigurasi di `IntegrationModal.jsx`
4. Tambahkan kategori baru jika diperlukan

### Custom Configuration Forms
Setiap integrasi dapat memiliki form konfigurasi yang unik dengan:
- Input fields yang berbeda
- Validation rules khusus
- Multi-step setup process
- Dynamic form fields

## Performance Considerations

### Optimizations
- Lazy loading untuk modal konfigurasi
- Memoization untuk expensive calculations
- Debounced search dan filter
- Virtual scrolling untuk list yang panjang (future enhancement)

### Bundle Size
- Icon components di-load secara dynamic
- Modal components menggunakan React.lazy
- Minimal external dependencies

## Testing Strategy

### Unit Tests
- Component rendering tests
- State management tests
- Form validation tests
- Integration toggle functionality

### Integration Tests
- Modal open/close flow
- Configuration save flow
- Status change propagation
- Error handling scenarios

### E2E Tests
- Complete integration setup flow
- Multi-step configuration process
- Responsive behavior testing
- Accessibility compliance

## Future Enhancements

### Planned Features
1. **Search & Filter**: Pencarian integrasi dan filter berdasarkan kategori/status
2. **Integration Templates**: Template konfigurasi untuk setup cepat
3. **Bulk Operations**: Activate/deactivate multiple integrations
4. **Integration Marketplace**: Browse dan install integrasi baru
5. **Usage Analytics**: Statistik penggunaan per integrasi
6. **Integration Logs**: Log aktivitas dan error per integrasi

### API Integration
- REST API endpoints untuk CRUD operations
- WebSocket untuk real-time status updates
- OAuth flows untuk third-party authentications
- Webhook management untuk event-driven integrations

## Security Considerations

### Data Protection
- Sensitive configuration data encryption
- Secure API key storage
- Token rotation mechanisms
- Audit logging untuk configuration changes

### Access Control
- Role-based permissions untuk manage integrations
- Integration-specific permissions
- Admin approval untuk sensitive integrations
- Rate limiting untuk API calls

## Conclusion

Tab Integrations menyediakan solusi komprehensif untuk mengelola koneksi aplikasi pihak ketiga dalam chatbot platform. Dengan interface yang intuitif, konfigurasi yang fleksibel, dan design yang extensible, fitur ini memungkinkan pengguna untuk dengan mudah memperluas fungsionalitas chatbot mereka.
