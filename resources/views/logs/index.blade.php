<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laravel Log Viewer - Professional Dashboard</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css" rel="stylesheet">
    <style>
        :root {
            --primary-color: #6366f1;
            --secondary-color: #8b5cf6;
            --success-color: #10b981;
            --warning-color: #f59e0b;
            --danger-color: #ef4444;
            --info-color: #3b82f6;
            --dark-color: #1f2937;
            --light-color: #f8fafc;
            --border-color: #e5e7eb;
            --text-muted: #6b7280;
        }

        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .main-container {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            margin: 20px;
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
            padding: 2rem;
            text-align: center;
        }

        .header h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin: 0;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .header p {
            font-size: 1.1rem;
            opacity: 0.9;
            margin: 0.5rem 0 0 0;
        }

        .stats-row {
            background: white;
            padding: 1.5rem;
            border-bottom: 1px solid var(--border-color);
        }

        .stat-card {
            text-align: center;
            padding: 1rem;
            border-radius: 12px;
            background: linear-gradient(135deg, #f8fafc, #e2e8f0);
            border: 1px solid var(--border-color);
            transition: transform 0.2s, box-shadow 0.2s;
        }

        .stat-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .stat-number {
            font-size: 2rem;
            font-weight: 700;
            color: var(--primary-color);
        }

        .stat-label {
            color: var(--text-muted);
            font-size: 0.875rem;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .content-area {
            padding: 2rem;
        }

        .file-panel {
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            border: 1px solid var(--border-color);
            overflow: hidden;
        }

        .file-panel-header {
            background: linear-gradient(135deg, #f8fafc, #e2e8f0);
            padding: 1.5rem;
            border-bottom: 1px solid var(--border-color);
        }

        .file-panel-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: var(--dark-color);
            margin: 0;
            display: flex;
            align-items: center;
        }

        .file-panel-title i {
            margin-right: 0.5rem;
            color: var(--primary-color);
        }

        .search-container {
            margin-top: 1rem;
        }

        .search-box {
            background: white;
            border: 2px solid var(--border-color);
            border-radius: 12px;
            padding: 0.75rem 1rem;
            font-size: 0.875rem;
            transition: all 0.2s ease;
            width: 100%;
        }

        .search-box:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .file-list {
            max-height: 500px;
            overflow-y: auto;
            padding: 0;
        }

        .file-item {
            padding: 1rem 1.5rem;
            border-bottom: 1px solid #f1f5f9;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .file-item:hover {
            background: linear-gradient(135deg, #f8fafc, #e2e8f0);
            transform: translateX(4px);
        }

        .file-item.active {
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
            transform: translateX(8px);
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .file-item.active .file-info small {
            color: rgba(255, 255, 255, 0.8) !important;
        }

        .file-info {
            flex: 1;
        }

        .file-name {
            font-weight: 600;
            font-size: 1rem;
            margin-bottom: 0.25rem;
        }

        .file-meta {
            font-size: 0.875rem;
            opacity: 0.7;
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .file-size {
            background: rgba(99, 102, 241, 0.1);
            color: var(--primary-color);
            padding: 0.25rem 0.5rem;
            border-radius: 6px;
            font-weight: 500;
        }

        .file-item.active .file-size {
            background: rgba(255, 255, 255, 0.2);
            color: white;
        }

        .log-panel {
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            border: 1px solid var(--border-color);
            overflow: hidden;
        }

        .log-panel-header {
            background: linear-gradient(135deg, #f8fafc, #e2e8f0);
            padding: 1.5rem;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .log-panel-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: var(--dark-color);
            margin: 0;
            display: flex;
            align-items: center;
        }

        .log-panel-title i {
            margin-right: 0.5rem;
            color: var(--primary-color);
        }

        .log-actions {
            display: flex;
            gap: 0.5rem;
        }

        .log-content {
            background: #1a1a1a;
            color: #e5e5e5;
            padding: 1.5rem;
            max-height: 600px;
            overflow-y: auto;
            font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
            font-size: 0.875rem;
            line-height: 1.6;
            white-space: pre-wrap;
            border-radius: 0 0 16px 16px;
            scroll-behavior: smooth;
        }

        .log-content::-webkit-scrollbar {
            width: 8px;
        }

        .log-content::-webkit-scrollbar-track {
            background: #2d2d2d;
        }

        .log-content::-webkit-scrollbar-thumb {
            background: #555;
            border-radius: 4px;
        }

        .log-content::-webkit-scrollbar-thumb:hover {
            background: #777;
        }

        .btn-modern {
            border-radius: 8px;
            font-weight: 500;
            padding: 0.5rem 1rem;
            transition: all 0.2s ease;
            border: none;
        }

        .btn-modern:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .btn-danger-modern {
            background: linear-gradient(135deg, var(--danger-color), #dc2626);
            color: white;
        }

        .btn-danger-modern:hover {
            background: linear-gradient(135deg, #dc2626, #b91c1c);
            color: white;
        }

        .btn-primary-modern {
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
        }

        .btn-primary-modern:hover {
            background: linear-gradient(135deg, #4f46e5, #7c3aed);
            color: white;
        }


        .empty-state {
            text-align: center;
            padding: 3rem;
            color: var(--text-muted);
        }

        .empty-state i {
            font-size: 3rem;
            margin-bottom: 1rem;
            opacity: 0.5;
        }

        .alert-modern {
            border-radius: 12px;
            border: none;
            padding: 1rem 1.5rem;
            margin-bottom: 1.5rem;
        }

        .alert-success-modern {
            background: linear-gradient(135deg, #d1fae5, #a7f3d0);
            color: #065f46;
            border-left: 4px solid var(--success-color);
        }

        .alert-danger-modern {
            background: linear-gradient(135deg, #fee2e2, #fecaca);
            color: #991b1b;
            border-left: 4px solid var(--danger-color);
        }

        .alert-info-modern {
            background: linear-gradient(135deg, #dbeafe, #bfdbfe);
            color: #1e40af;
            border-left: 4px solid var(--info-color);
        }

        .log-line {
            margin-bottom: 0.5rem;
            padding: 0.25rem 0;
        }

        .log-line.error {
            background: rgba(239, 68, 68, 0.1);
            border-left: 3px solid var(--danger-color);
            padding-left: 0.5rem;
        }

        .log-line.warning {
            background: rgba(245, 158, 11, 0.1);
            border-left: 3px solid var(--warning-color);
            padding-left: 0.5rem;
        }

        .log-line.info {
            background: rgba(59, 130, 246, 0.1);
            border-left: 3px solid var(--info-color);
            padding-left: 0.5rem;
        }

        .log-line.success {
            background: rgba(16, 185, 129, 0.1);
            border-left: 3px solid var(--success-color);
            padding-left: 0.5rem;
        }

        @media (max-width: 768px) {
            .main-container {
                margin: 10px;
                border-radius: 16px;
            }

            .header {
                padding: 1.5rem;
            }

            .header h1 {
                font-size: 2rem;
            }

            .content-area {
                padding: 1rem;
            }

            .file-item {
                padding: 0.75rem 1rem;
            }

            .log-content {
                max-height: 400px;
            }
        }
    </style>
</head>
<body>
    <div class="main-container">
        <!-- Header -->
        <div class="header">
            <h1><i class="bi bi-file-text"></i> Laravel Log Viewer</h1>
            <p>Professional Log Management Dashboard</p>
        </div>

        <!-- Stats Row -->
        <div class="stats-row">
            <div class="row">
                <div class="col-md-3">
                    <div class="stat-card">
                        <div class="stat-number">{{ count($files) }}</div>
                        <div class="stat-label">Total Files</div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card">
                        <div class="stat-number">{{ $current_file ? '1' : '0' }}</div>
                        <div class="stat-label">Active File</div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card">
                        <div class="stat-number">{{ $current_file ? number_format(strlen($log_content ?? '')) : '0' }}</div>
                        <div class="stat-label">Characters</div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card">
                        <div class="stat-number">{{ $current_file ? count(explode("\n", $log_content ?? '')) : '0' }}</div>
                        <div class="stat-label">Lines</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Content Area -->
        <div class="content-area">
            <div class="row">
                <!-- File Panel -->
                <div class="col-md-4">
                    <div class="file-panel">
                        <div class="file-panel-header">
                            <h5 class="file-panel-title">
                                <i class="bi bi-folder2-open"></i>
                                Log Files ({{ count($files) }})
                            </h5>
                            <div class="search-container">
                                <input type="text" class="search-box" id="fileSearch" placeholder="Search files...">
                            </div>
                        </div>
                        <div class="file-list" id="fileList">
                            @if(count($files) > 0)
                                @foreach($files as $file)
                                    @php
                                        $filePath = storage_path('logs/' . $file);
                                        $fileSize = \Illuminate\Support\Facades\File::size($filePath);
                                        $fileModified = \Illuminate\Support\Facades\File::lastModified($filePath);
                                    @endphp
                                    <div class="file-item {{ $current_file === $file ? 'active' : '' }}"
                                         data-filename="{{ strtolower($file) }}"
                                         onclick="window.location.href='{{ route('logs.public.index', ['l' => encrypt($file)]) }}'">
                                        <div class="file-info">
                                            <div class="file-name">{{ $file }}</div>
                                            <div class="file-meta">
                                                <span class="file-size">{{ number_format($fileSize) }} bytes</span>
                                                <span>{{ \Carbon\Carbon::createFromTimestamp($fileModified)->setTimezone(config('app.timezone'))->format('M d, Y H:i T') }}</span>
                                            </div>
                                        </div>
                                        <i class="bi bi-chevron-right"></i>
                                    </div>
                                @endforeach
                            @else
                                <div class="empty-state">
                                    <i class="bi bi-file-x"></i>
                                    <h5>No log files found</h5>
                                    <p>No log files are available in the storage directory.</p>
                                </div>
                            @endif
                        </div>
                    </div>

                    @if($current_file)
                        <div class="file-panel mt-3">
                            <div class="file-panel-header">
                                <h6 class="file-panel-title">
                                    <i class="bi bi-gear"></i>
                                    Actions
                                </h6>
                            </div>
                            <div class="p-3">
                                <button class="btn btn-danger-modern btn-modern w-100 mb-2"
                                        onclick="deleteFile('{{ encrypt($current_file) }}')">
                                    <i class="bi bi-trash"></i> Delete File
                                </button>
                                <button class="btn btn-primary-modern btn-modern w-100"
                                        onclick="downloadFile('{{ $current_file }}')">
                                    <i class="bi bi-download"></i> Download
                                </button>
                            </div>
                        </div>
                    @endif
                </div>

                <!-- Log Panel -->
                <div class="col-md-8">
                    <div class="log-panel">
                        <div class="log-panel-header">
                            <h5 class="log-panel-title">
                                <i class="bi bi-file-text"></i>
                                @if($current_file)
                                    {{ $current_file }}
                                @else
                                    Select a log file
                                @endif
                            </h5>
                            @if($current_file)
                                <div class="log-actions">
                                    <button class="btn btn-primary-modern btn-modern btn-sm" onclick="refreshLog()">
                                        <i class="bi bi-arrow-clockwise"></i> Refresh
                                    </button>
                                </div>
                            @endif
                        </div>
                        <div class="log-content" id="logContent">
                            @if($current_file && $log_content)
                                @php
                                    $lines = explode("\n", $log_content);
                                    $lastLines = array_slice($lines, -100); // Show last 100 lines
                                @endphp
                                @foreach($lastLines as $line)
                                    @php
                                        $lineClass = '';
                                        if (strpos($line, 'ERROR') !== false || strpos($line, 'CRITICAL') !== false) {
                                            $lineClass = 'error';
                                        } elseif (strpos($line, 'WARNING') !== false) {
                                            $lineClass = 'warning';
                                        } elseif (strpos($line, 'INFO') !== false) {
                                            $lineClass = 'info';
                                        } elseif (strpos($line, 'SUCCESS') !== false) {
                                            $lineClass = 'success';
                                        }
                                    @endphp
                                    <div class="log-line {{ $lineClass }}">{{ $line }}</div>
                                @endforeach
                            @elseif($current_file)
                                <div class="empty-state">
                                    <i class="bi bi-file-x"></i>
                                    <h5>Log file is empty</h5>
                                    <p>This log file contains no content or cannot be read.</p>
                                </div>
                            @else
                                <div class="empty-state">
                                    <i class="bi bi-file-text"></i>
                                    <h5>Select a log file</h5>
                                    <p>Choose a log file from the left panel to view its contents.</p>
                                </div>
                            @endif
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Alerts -->
    @if(session('success'))
        <div class="position-fixed top-0 end-0 p-3" style="z-index: 9999;">
            <div class="alert alert-success-modern alert-modern alert-dismissible fade show" role="alert">
                <i class="bi bi-check-circle"></i> {{ session('success') }}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        </div>
    @endif

    @if(session('error'))
        <div class="position-fixed top-0 end-0 p-3" style="z-index: 9999;">
            <div class="alert alert-danger-modern alert-modern alert-dismissible fade show" role="alert">
                <i class="bi bi-exclamation-triangle"></i> {{ session('error') }}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        </div>
    @endif

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // File search functionality
        document.getElementById('fileSearch').addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const fileItems = document.querySelectorAll('.file-item');

            fileItems.forEach(item => {
                const filename = item.getAttribute('data-filename');
                if (filename.includes(searchTerm)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        });

        // Delete file function
        function deleteFile(encryptedFile) {
            if (confirm('Are you sure you want to delete this log file? This action cannot be undone.')) {
                window.location.href = '{{ route("logs.handle") }}?del=' + encryptedFile;
            }
        }

        // Download file function
        function downloadFile(filename) {
            const link = document.createElement('a');
            link.href = '{{ route("logs.public.index") }}?download=' + filename;
            link.download = filename;
            link.click();
        }

        // Refresh log function
        function refreshLog() {
            window.location.reload();
        }

        // Scroll to bottom function
        function scrollToBottom() {
            const logContent = document.getElementById('logContent');
            if (logContent) {
                logContent.scrollTop = logContent.scrollHeight;
            }
        }

        // Initialize auto scroll on page load
        document.addEventListener('DOMContentLoaded', function() {
            const logContent = document.getElementById('logContent');
            if (logContent) {
                // Scroll to bottom initially
                scrollToBottom();

                // Set up mutation observer to detect new content
                const observer = new MutationObserver(function(mutations) {
                    mutations.forEach(function(mutation) {
                        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                            scrollToBottom();
                        }
                    });
                });

                observer.observe(logContent, {
                    childList: true,
                    subtree: true
                });
            }
        });

        // Auto-refresh every 30 seconds if a file is selected
        @if($current_file)
            setInterval(function() {
                refreshLog();
            }, 30000);
        @endif

        // Add keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'r':
                        e.preventDefault();
                        refreshLog();
                        break;
                    case 'f':
                        e.preventDefault();
                        document.getElementById('fileSearch').focus();
                        break;
                    case 'end':
                        e.preventDefault();
                        scrollToBottom();
                        break;
                }
            }
        });
    </script>
</body>
</html>
