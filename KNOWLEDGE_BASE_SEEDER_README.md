# 📚 Knowledge Base Seeder Documentation

## 🎯 Overview

KnowledgeBaseSeeder adalah seeder komprehensif untuk membuat data testing yang lengkap untuk modul Knowledge Base. Seeder ini akan membuat categories, tags, articles, FAQ, dan Q&A items untuk setiap organization yang ada.

## 🚀 Features

### ✅ **Categories (8 Kategori Utama)**
- **Getting Started** - Panduan awal platform
- **Technical Support** - Bantuan teknis dan troubleshooting
- **Product Information** - Informasi produk dan fitur
- **API Documentation** - Dokumentasi API dan integrasi
- **Billing & Payments** - Informasi tagihan dan pembayaran
- **Security & Privacy** - Keamanan dan privasi data
- **Integration Guides** - Panduan integrasi platform lain
- **Best Practices** - Praktik terbaik penggunaan

### ✅ **Tags (24 Tags)**
- beginner, advanced, tutorial, guide, faq, troubleshooting
- api, integration, security, billing, performance, setup
- configuration, deployment, monitoring, analytics, automation
- chatbot, ai, machine-learning, nlp, webhook, authentication

### ✅ **Content Types**
- **Articles** - Artikel lengkap dengan struktur HTML
- **FAQ** - Pertanyaan dan jawaban umum
- **Q&A Collections** - Kumpulan Q&A untuk artikel

### ✅ **Content Features**
- Multi-language support (Indonesia)
- Difficulty levels (beginner, intermediate, advanced)
- AI training data
- Analytics metrics (views, helpful, shares)
- SEO optimization
- Featured content

## 📊 Data Generated

### **Per Organization:**
- **8 Categories** dengan konfigurasi lengkap
- **24 Tags** dengan warna dan metadata
- **40+ Articles** (5 per category)
- **10 FAQ Items** dengan pertanyaan umum
- **2 Featured Articles** (Getting Started & Technical Support)
- **30-80 Q&A Items** untuk artikel (3-8 per artikel)

### **Total Data (untuk 3 organizations):**
- **24 Categories**
- **72 Tags**
- **120+ Articles**
- **30 FAQ Items**
- **6 Featured Articles**
- **90-240 Q&A Items**

## 🛠️ Usage

### **Run Complete Seeder**
```bash
php artisan db:seed --class=KnowledgeBaseSeeder
```

### **Run with Database Seeder**
```bash
php artisan db:seed
```

### **Run Specific Organization**
```php
// In tinker or custom seeder
$organization = Organization::first();
$seeder = new KnowledgeBaseSeeder();
$seeder->createCategories($organization);
```

## 📁 File Structure

```
database/seeders/
├── KnowledgeBaseSeeder.php          # Main seeder file
├── DatabaseSeeder.php               # Updated to include KB seeder
└── ChatbotSaasSeeder.php           # Existing seeder (partial KB)
```

## 🔧 Configuration

### **Categories Configuration**
```php
$mainCategories = [
    [
        'name' => 'Getting Started',
        'slug' => 'getting-started',
        'description' => 'Panduan lengkap untuk memulai menggunakan platform',
        'icon' => 'play',
        'color' => '#10B981',
    ],
    // ... more categories
];
```

### **Content Generation**
- **Titles**: Template-based dengan variasi per category
- **Content**: HTML structured dengan headings, lists, dan sections
- **Tags**: Category-specific tags dengan random selection
- **Keywords**: Auto-generated dari title dan content

## 📈 Content Quality Features

### **SEO Optimization**
- Meta titles dan descriptions
- Keywords generation
- Canonical URLs
- Structured content

### **AI Training Ready**
- AI confidence scores
- Training data generation
- Embeddings preparation
- Processing priorities

### **Analytics Integration**
- View counts
- Helpful/not helpful ratings
- Share counts
- Search hit tracking
- AI usage metrics

## 🎨 Content Templates

### **Article Template**
```html
<h1>Panduan {Category Name}</h1>
<p>Artikel ini akan membantu Anda memahami {Category Name} dengan mudah.</p>

<h2>Apa yang akan Anda pelajari</h2>
<ul>
    <li>Konsep dasar {Category Name}</li>
    <li>Langkah-langkah implementasi</li>
    <li>Best practices</li>
    <li>Troubleshooting</li>
</ul>

<h2>Persiapan</h2>
<p>Sebelum memulai, pastikan Anda telah menyiapkan:</p>
<ul>
    <li>Akun yang sudah terverifikasi</li>
    <li>Koneksi internet yang stabil</li>
    <li>Browser terbaru</li>
</ul>

<h2>Langkah-langkah</h2>
<h3>Langkah 1: Persiapan</h3>
<p>Mulai dengan mempersiapkan semua kebutuhan dasar.</p>

<h3>Langkah 2: Implementasi</h3>
<p>Implementasikan sesuai dengan panduan yang diberikan.</p>

<h3>Langkah 3: Testing</h3>
<p>Lakukan testing untuk memastikan semuanya berjalan dengan baik.</p>

<h2>Kesimpulan</h2>
<p>Dengan mengikuti panduan ini, Anda seharusnya sudah bisa memahami {Category Name} dengan baik.</p>
```

### **Featured Content Template**
```html
<h1>Panduan Lengkap: {Category Name}</h1>

<div class='alert alert-info'>
<strong>Panduan Komprehensif:</strong> Artikel ini akan memberikan pemahaman mendalam tentang {Category Name}.
</div>

<h2>Daftar Isi</h2>
<ol>
    <li><a href='#pengenalan'>Pengenalan</a></li>
    <li><a href='#konsep-dasar'>Konsep Dasar</a></li>
    <li><a href='#implementasi'>Implementasi</a></li>
    <li><a href='#best-practices'>Best Practices</a></li>
    <li><a href='#troubleshooting'>Troubleshooting</a></li>
    <li><a href='#kesimpulan'>Kesimpulan</a></li>
</ol>

<!-- Detailed sections with anchors -->
```

## 🔍 Customization

### **Add New Categories**
```php
// In createCategories method
$mainCategories[] = [
    'name' => 'New Category',
    'slug' => 'new-category',
    'description' => 'Description for new category',
    'icon' => 'icon-name',
    'color' => '#HEXCODE',
];
```

### **Add New Tags**
```php
// In createTags method
$tagNames[] = 'new-tag';
```

### **Modify Content Generation**
```php
// In generateContent method
private function generateContent(KnowledgeBaseCategory $category): string
{
    // Custom content generation logic
    $content = "<h1>Custom {$category->name}</h1>\n\n";
    // ... custom content
    return $content;
}
```

### **Adjust Data Volume**
```php
// In createArticlesForCategory method
$articleCount = 10; // Increase from 5 to 10

// In createQaItems method
$qaCount = 20; // Increase from 10 to 20
```

## 🧪 Testing

### **Test Seeder**
```bash
# Test seeder without affecting production
php artisan db:seed --class=KnowledgeBaseSeeder --env=testing
```

### **Verify Data**
```php
// In tinker
$categories = KnowledgeBaseCategory::count(); // Should be 8 per org
$articles = KnowledgeBaseItem::count(); // Should be 40+ per org
$tags = KnowledgeBaseTag::count(); // Should be 24 per org
$qaItems = KnowledgeQaItem::count(); // Should be 30-80 per org
```

## 📋 Dependencies

### **Required Models**
- `Organization` - Untuk multi-tenant support
- `User` - Untuk author assignment
- `KnowledgeBaseCategory` - Categories
- `KnowledgeBaseItem` - Articles dan FAQ
- `KnowledgeBaseTag` - Tags
- `KnowledgeQaItem` - Q&A items

### **Required Seeders**
- `UserRolePermissionManagementSeeder` - Untuk organizations dan users
- `AuthTestDataSeeder` - Untuk test users

## 🚨 Important Notes

### **Multi-Tenant Support**
- Semua data di-scoped per organization
- Tags dan categories terpisah per organization
- Content isolation untuk security

### **Performance Considerations**
- Seeder menggunakan batch processing
- Memory efficient dengan chunking
- Progress reporting untuk monitoring

### **Data Consistency**
- Foreign key relationships maintained
- Soft deletes supported
- UUID primary keys used

## 🔄 Updates & Maintenance

### **Adding New Content Types**
1. Update `generateTitle()` method dengan templates baru
2. Update `generateContent()` method dengan struktur baru
3. Update `generateTagsForItem()` method dengan tag mapping baru

### **Modifying Categories**
1. Update `$mainCategories` array
2. Update title templates di `generateTitle()`
3. Update tag mapping di `generateTagsForItem()`

### **Performance Optimization**
- Use database transactions untuk consistency
- Implement chunking untuk large datasets
- Add progress reporting untuk monitoring

## 📞 Support

Untuk pertanyaan atau masalah dengan KnowledgeBaseSeeder:

1. **Check Dependencies** - Pastikan semua required seeders sudah dijalankan
2. **Verify Database** - Pastikan semua tables sudah ada
3. **Check Permissions** - Pastikan user memiliki permission yang cukup
4. **Review Logs** - Check Laravel logs untuk error details

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Author**: AI Assistant
