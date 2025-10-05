# Google Drive API Integration

## Overview

Google Drive API integration memungkinkan aplikasi untuk mengelola file di Google Drive pengguna menggunakan OAuth 2.0 credentials. Aplikasi ini menggunakan scope yang tidak memerlukan verifikasi Google.

## OAuth Scopes

### Scope yang Digunakan

- `openid`: OpenID Connect authentication
- `profile`: User profile information
- `email`: User email address
- `https://www.googleapis.com/auth/drive`: Full access to Google Drive

### Penjelasan Scope Google Drive

- **`https://www.googleapis.com/auth/drive`**: Memberikan akses penuh ke Google Drive, termasuk kemampuan untuk membaca, membuat, memodifikasi, dan menghapus file dan folder. Scope ini memungkinkan aplikasi untuk:
  - Membaca dan menulis file
  - Membuat dan menghapus file
  - Mengelola permission file
  - Mengakses metadata file
  - Upload dan download file
  - Mengelola folder dan shared drives

## API Endpoints

### 1. Get Files

**GET** `/api/drive/files`

Mengambil daftar file dari Google Drive pengguna.

**Query Parameters:**
- `page_size` (optional): Jumlah file per halaman (default: 10)
- `page_token` (optional): Token untuk halaman berikutnya

**Response:**
```json
{
  "success": true,
  "message": "Files retrieved successfully",
  "data": {
    "nextPageToken": "next_page_token",
    "files": [
      {
        "id": "file_id",
        "name": "file_name.txt",
        "mimeType": "text/plain",
        "size": "1024",
        "createdTime": "2023-01-01T00:00:00.000Z",
        "modifiedTime": "2023-01-01T00:00:00.000Z",
        "webViewLink": "https://drive.google.com/file/d/file_id/view"
      }
    ]
  }
}
```

### 2. Get File Details

**GET** `/api/drive/files/{fileId}`

Mengambil detail file berdasarkan ID.

**Response:**
```json
{
  "success": true,
  "message": "File details retrieved successfully",
  "data": {
    "id": "file_id",
    "name": "file_name.txt",
    "mimeType": "text/plain",
    "size": "1024",
    "createdTime": "2023-01-01T00:00:00.000Z",
    "modifiedTime": "2023-01-01T00:00:00.000Z",
    "webViewLink": "https://drive.google.com/file/d/file_id/view",
    "description": "File description"
  }
}
```

### 3. Create File

**POST** `/api/drive/files`

Membuat file baru di Google Drive.

**Request Body:**
```json
{
  "file_name": "new_file.txt",
  "content": "File content here",
  "mime_type": "text/plain"
}
```

**Response:**
```json
{
  "success": true,
  "message": "File created successfully",
  "data": {
    "id": "new_file_id",
    "name": "new_file.txt",
    "mimeType": "text/plain",
    "webViewLink": "https://drive.google.com/file/d/new_file_id/view"
  }
}
```

### 4. Update File

**PUT** `/api/drive/files/{fileId}`

Memperbarui konten file yang sudah ada.

**Request Body:**
```json
{
  "content": "Updated file content",
  "mime_type": "text/plain"
}
```

**Response:**
```json
{
  "success": true,
  "message": "File updated successfully",
  "data": {
    "id": "file_id",
    "name": "file_name.txt",
    "mimeType": "text/plain"
  }
}
```

### 5. Delete File

**DELETE** `/api/drive/files/{fileId}`

Menghapus file dari Google Drive.

**Response:**
```json
{
  "success": true,
  "message": "File deleted successfully",
  "data": {
    "file_id": "file_id",
    "deleted": true
  }
}
```

### 6. Download File

**GET** `/api/drive/files/{fileId}/download`

Mengunduh konten file.

**Response:** File content sebagai binary data

### 7. Search Files

**GET** `/api/drive/search`

Mencari file berdasarkan nama.

**Query Parameters:**
- `query`: Kata kunci pencarian
- `page_size` (optional): Jumlah hasil per halaman (default: 10)

**Response:**
```json
{
  "success": true,
  "message": "Files found successfully",
  "data": {
    "files": [
      {
        "id": "file_id",
        "name": "matching_file.txt",
        "mimeType": "text/plain",
        "size": "1024",
        "createdTime": "2023-01-01T00:00:00.000Z",
        "modifiedTime": "2023-01-01T00:00:00.000Z",
        "webViewLink": "https://drive.google.com/file/d/file_id/view"
      }
    ]
  }
}
```

### 8. Get Storage Info

**GET** `/api/drive/storage`

Mengambil informasi penyimpanan Google Drive pengguna.

**Response:**
```json
{
  "success": true,
  "message": "Storage info retrieved successfully",
  "data": {
    "storageQuota": {
      "limit": "15000000000",
      "usage": "1000000000",
      "usageInDrive": "500000000",
      "usageInDriveTrash": "100000000"
    },
    "user": {
      "displayName": "User Name",
      "emailAddress": "user@example.com"
    }
  }
}
```

## Authentication

Semua endpoint memerlukan authentication dengan middleware:
- `unified.auth`: JWT token authentication
- `permission:automations.manage`: Permission untuk mengelola automations
- `organization`: Organization context

## Error Handling

Semua endpoint mengembalikan error response dalam format:

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information",
  "timestamp": "2023-01-01T00:00:00.000Z",
  "request_id": "req_unique_id"
}
```

## Usage Examples

### Frontend Integration (React)

```javascript
// Get files
const getFiles = async (pageSize = 10, pageToken = null) => {
  const response = await fetch(`/api/drive/files?page_size=${pageSize}&page_token=${pageToken}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};

// Create file
const createFile = async (fileName, content, mimeType = 'text/plain') => {
  const response = await fetch('/api/drive/files', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      file_name: fileName,
      content: content,
      mime_type: mimeType
    })
  });
  return response.json();
};

// Search files
const searchFiles = async (query) => {
  const response = await fetch(`/api/drive/search?query=${encodeURIComponent(query)}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};
```

### Frontend Integration (Vue.js)

```javascript
// Vue.js composable
export const useGoogleDrive = () => {
  const getFiles = async (pageSize = 10, pageToken = null) => {
    const { data } = await $fetch(`/api/drive/files`, {
      params: { page_size: pageSize, page_token: pageToken },
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  };

  const createFile = async (fileName, content, mimeType = 'text/plain') => {
    const { data } = await $fetch('/api/drive/files', {
      method: 'POST',
      body: { file_name: fileName, content, mime_type: mimeType },
      headers: { Authorization: `Bearer ${token}` }
    });
    return data;
  };

  return { getFiles, createFile };
};
```

## Testing

### Manual Testing

```bash
# Get files
curl -X GET "http://localhost:9000/api/drive/files" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"

# Create file
curl -X POST "http://localhost:9000/api/drive/files" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "file_name": "test.txt",
    "content": "Hello World",
    "mime_type": "text/plain"
  }'

# Search files
curl -X GET "http://localhost:9000/api/drive/search?query=test" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Automated Testing

```php
// PHPUnit test example
public function testGetFiles()
{
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->getJson('/api/drive/files');
    
    $response->assertStatus(200)
        ->assertJsonStructure([
            'success',
            'message',
            'data' => [
                'files' => [
                    '*' => [
                        'id',
                        'name',
                        'mimeType',
                        'size',
                        'createdTime',
                        'modifiedTime',
                        'webViewLink'
                    ]
                ]
            ]
        ]);
}
```

## Security Considerations

1. **OAuth Credentials**: Credentials disimpan dengan aman di database dan dienkripsi
2. **Access Control**: Semua endpoint memerlukan authentication dan permission
3. **Rate Limiting**: Google Drive API memiliki rate limit yang harus diperhatikan
4. **File Validation**: Validasi tipe file dan ukuran sebelum upload
5. **Error Logging**: Semua error dicatat untuk monitoring dan debugging

## Limitations

1. **Scope Restrictions**: Hanya dapat mengakses file yang dibuat atau dibuka oleh aplikasi
2. **Rate Limits**: Google Drive API memiliki rate limit (100 requests per 100 seconds per user)
3. **File Size**: Batasan ukuran file untuk upload (5TB untuk Google Drive)
4. **MIME Types**: Hanya dapat mengakses file dengan MIME type yang didukung

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Pastikan JWT token valid dan tidak expired
2. **403 Forbidden**: Pastikan user memiliki permission `automations.manage`
3. **404 Not Found**: Pastikan file ID valid dan file ada
4. **429 Too Many Requests**: Rate limit exceeded, tunggu sebelum request berikutnya

### Debug Steps

1. Check OAuth credentials in database
2. Verify JWT token validity
3. Check Google Drive API quota
4. Review application logs for detailed error information
