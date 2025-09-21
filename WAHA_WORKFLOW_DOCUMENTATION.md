# WAHA Workflow Documentation - Mang Kirik Chatbot

## Overview
Workflow WAHA "Mang Kirik" adalah chatbot WhatsApp yang menggunakan persona juragan warung nasi jamblang dengan dialek Cirebon. Workflow ini terintegrasi dengan N8N, Google Gemini AI, dan WAHA API untuk memberikan pengalaman chat yang autentik dan fungsional.

## Workflow Details

### Basic Information
- **N8N Workflow ID**: `apTqbajgYt2EH9ce`
- **Database ID**: `0102ce0a-4a4c-456a-af34-721e2b31ec35`
- **Name**: `workflow_wahamangkirik001`
- **Status**: `active`
- **Webhook ID**: `04ab3138-09cc-4dfb-8589-8b0715b31db4`
- **Created**: 2025-09-21T17:47:21.000000Z
- **Created By**: Admin (ID: 8ed0bd0b-20b8-428c-be3c-8e23141a7075)

### Workflow Architecture

```
WAHA Trigger → Start Typing → AI Agent → Stop Typing → Send Message
                    ↓
            Google Gemini Chat Model
                    ↓
            Simple Memory Buffer
```

### Node Configuration

#### 1. WAHA Trigger
- **Type**: `@devlikeapro/n8n-nodes-waha.wahaTrigger`
- **Version**: 202502
- **Webhook ID**: `04ab3138-09cc-4dfb-8589-8b0715b31db4`
- **Purpose**: Menerima pesan WhatsApp dari WAHA server

#### 2. Start Typing
- **Type**: `@devlikeapro/n8n-nodes-waha.WAHA`
- **Operation**: Start Typing
- **Purpose**: Menampilkan indikator "sedang mengetik" di WhatsApp

#### 3. Google Gemini Chat Model
- **Type**: `@n8n/n8n-nodes-langchain.lmChatGoogleGemini`
- **Model**: `models/gemini-2.0-flash`
- **Max Output Tokens**: 2048
- **Temperature**: 0.1
- **Credentials**: Google Gemini(PaLM) Api account

#### 4. AI Agent
- **Type**: `@n8n/n8n-nodes-langchain.agent`
- **Version**: 2
- **Purpose**: Memproses pesan dengan persona "Mang Kirik"
- **System Message**: Persona lengkap dengan 7 bagian detail

#### 5. Simple Memory
- **Type**: `@n8n/n8n-nodes-langchain.memoryBufferWindow`
- **Version**: 1.3
- **Session Key**: `={{ $('WAHA Trigger').item.json.session }}`
- **Purpose**: Menyimpan konteks percakapan

#### 6. Stop Typing
- **Type**: `@devlikeapro/n8n-nodes-waha.WAHA`
- **Operation**: Stop Typing
- **Purpose**: Menghentikan indikator "sedang mengetik"

#### 7. Send Text Message
- **Type**: `@devlikeapro/n8n-nodes-waha.WAHA`
- **Operation**: Send Text
- **Session**: `={{ $('WAHA Trigger').item.json.session }}`
- **Chat ID**: `={{ $('WAHA Trigger').item.json.payload.from }}`
- **Text**: `={{ $('AI Agent2').item.json.output }}`

## Persona "Mang Kirik" Features

### Kepribadian
- **Nama**: Mang Kirik
- **Umur**: 28 tahun
- **Pekerjaan**: Juragan Warung Nasi Jamblang
- **Dialek**: Cirebon Dermayon (Jawa Cirebonan)
- **Gaya Bahasa**: Kasar, informal, ceplas-ceplos

### Kemampuan Khusus

#### 1. Menu & Harga
- Sega Jamblang: Rp 2.000,-
- Sate Kentang: Rp 2.000,-
- Semur Ati: Rp 5.000,-
- Daging Sapi: Rp 17.000,-
- Tahu Sayur: Rp 2.000,-
- Perkedel: Rp 2.000,-
- Sambel Jamblang: Rp 1.000,-
- Cumi Ireng: Rp 13.000,-
- Es Teh: Rp 3.000,-
- Dan menu lainnya...

#### 2. Sistem Perhitungan
- Konfirmasi pesanan
- Perhitungan otomatis dengan format tabel
- Estimasi waktu pesanan (2-5 menit)
- Promo/diskon spontan
- Integrasi QRIS untuk pembayaran

#### 3. Penolakan Konteks
- Menolak pertanyaan di luar konteks warung
- Formula 3 langkah: Ekspresi kaget → Sebut identitas → Redirect
- Topik yang ditolak: Politik, teknologi, PR sekolah, dll.

## Technical Implementation

### Credentials Required
1. **WAHA API**: `cTu115OvlKgDzLhL`
2. **Google Gemini API**: `tnQDvZ8b8o4meGRV`

### Environment Variables
- `N8N_API_KEY`: API key untuk N8N server
- `N8N_BASE_URL`: URL N8N server (localhost:5678)
- Database connection settings

### Database Integration
- Workflow tersimpan di tabel `n8n_workflows`
- Status tracking dan execution history
- User management dan permissions

## API Endpoints

### Workflow Management
- `POST /api/n8n/workflows` - Create workflow
- `GET /api/n8n/workflows` - List workflows
- `POST /api/n8n/workflows/{id}/activate` - Activate workflow
- `POST /api/n8n/workflows/{id}/deactivate` - Deactivate workflow
- `DELETE /api/n8n/workflows/{id}` - Delete workflow

### Webhook Integration
- Webhook URL: `http://localhost:5678/webhook/04ab3138-09cc-4dfb-8589-8b0715b31db4`
- Method: POST
- Content-Type: application/json

## Production Considerations

### Security
- Input validation untuk webhook
- Rate limiting
- Sanitasi input sebelum AI processing

### Performance
- Memory buffer optimization
- Connection pooling
- Caching untuk response yang sering digunakan

### Monitoring
- Error handling dan logging
- Execution tracking
- Performance metrics

### Scalability
- Queue system untuk high volume
- Load balancing
- Database indexing

## Testing

### Manual Testing
1. Kirim pesan ke WhatsApp number yang terhubung WAHA
2. Test berbagai skenario:
   - Pesan menu
   - Perhitungan pesanan
   - Pertanyaan di luar konteks
   - Promo spontan

### Automated Testing
- Unit tests untuk setiap node
- Integration tests untuk workflow
- Performance tests untuk load testing

## Maintenance

### Regular Tasks
- Monitor execution logs
- Update menu dan harga
- Backup workflow configuration
- Update AI model jika diperlukan

### Troubleshooting
- Check N8N server status
- Verify WAHA connection
- Monitor Google Gemini API usage
- Check database connectivity

## Future Enhancements

### Planned Features
1. **Menu Management System**: CRUD operations untuk menu
2. **Dynamic Pricing**: Update harga real-time
3. **Order Tracking**: History dan status pesanan
4. **Multi-language Support**: Bahasa Indonesia formal
5. **Analytics Dashboard**: Usage statistics dan insights
6. **Payment Integration**: QRIS dan payment gateway
7. **Inventory Management**: Stock tracking
8. **Customer Preferences**: Learning dari chat history

### Technical Improvements
1. **Error Recovery**: Automatic retry mechanisms
2. **Performance Optimization**: Caching dan optimization
3. **Security Enhancements**: Advanced validation
4. **Monitoring**: Real-time alerts dan notifications
5. **Backup & Recovery**: Disaster recovery procedures

## Support & Contact

- **Developer**: Admin Team
- **Created**: 2025-09-21
- **Last Updated**: 2025-09-21
- **Version**: 1.0.0
- **Status**: Production Ready

---

*Dokumentasi ini akan diupdate sesuai dengan perkembangan workflow dan kebutuhan bisnis.*
