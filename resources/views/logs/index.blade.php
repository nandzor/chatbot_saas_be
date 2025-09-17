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
            border-radius: 16px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            margin: 10px;
            overflow: hidden;
            height: calc(100vh - 20px);
            display: flex;
            flex-direction: column;
        }

        .header {
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
            padding: 1rem 1.5rem;
            text-align: center;
            flex-shrink: 0;
        }

        .header h1 {
            font-size: 1.5rem;
            font-weight: 700;
            margin: 0;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .header p {
            font-size: 0.875rem;
            opacity: 0.9;
            margin: 0.25rem 0 0 0;
        }


        .content-area {
            padding: 1rem;
            flex: 1;
            display: flex;
            gap: 1rem;
            overflow: hidden;
        }

        .file-panel {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            border: 1px solid var(--border-color);
            overflow: hidden;
            width: 280px;
            flex-shrink: 0;
            display: flex;
            flex-direction: column;
        }

        .file-panel-header {
            background: linear-gradient(135deg, #f8fafc, #e2e8f0);
            padding: 0.75rem 1rem;
            border-bottom: 1px solid var(--border-color);
            flex-shrink: 0;
        }

        .file-panel-title {
            font-size: 0.875rem;
            font-weight: 600;
            color: var(--dark-color);
            margin: 0;
            display: flex;
            align-items: center;
        }

        .file-panel-title i {
            margin-right: 0.375rem;
            color: var(--primary-color);
            font-size: 0.875rem;
        }

        .search-container {
            margin-top: 0.5rem;
        }

        .search-box {
            background: white;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 0.5rem 0.75rem;
            font-size: 0.75rem;
            transition: all 0.2s ease;
            width: 100%;
        }

        .search-box:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
        }

        .file-list {
            flex: 1;
            overflow-y: auto;
            padding: 0;
        }

        .file-item {
            padding: 0.5rem 0.75rem;
            border-bottom: 1px solid #f1f5f9;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .file-item:hover {
            background: linear-gradient(135deg, #f8fafc, #e2e8f0);
            transform: translateX(2px);
        }

        .file-item.active {
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
            transform: translateX(4px);
            box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
        }

        .file-item.active .file-info small {
            color: rgba(255, 255, 255, 0.8) !important;
        }

        .file-info {
            flex: 1;
            min-width: 0;
        }

        .file-name {
            font-weight: 600;
            font-size: 0.75rem;
            margin-bottom: 0.125rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .file-meta {
            font-size: 0.625rem;
            opacity: 0.7;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            flex-wrap: wrap;
        }

        .file-size {
            background: rgba(99, 102, 241, 0.1);
            color: var(--primary-color);
            padding: 0.125rem 0.375rem;
            border-radius: 4px;
            font-weight: 500;
            font-size: 0.625rem;
        }

        .file-item.active .file-size {
            background: rgba(255, 255, 255, 0.2);
            color: white;
        }

        .log-panel {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            border: 1px solid var(--border-color);
            overflow: hidden;
            flex: 1;
            display: flex;
            flex-direction: column;
        }

        .log-panel-header {
            background: linear-gradient(135deg, #f8fafc, #e2e8f0);
            padding: 0.75rem 1rem;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-shrink: 0;
        }

        .log-search-container {
            margin-top: 0.5rem;
            display: flex;
            gap: 0.5rem;
            align-items: center;
        }

        .log-search-box {
            background: white;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 0.375rem 0.75rem;
            font-size: 0.75rem;
            transition: all 0.2s ease;
            flex: 1;
        }

        .log-search-box:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
        }

        .search-results-info {
            font-size: 0.625rem;
            color: var(--text-muted);
            white-space: nowrap;
        }

        .search-highlight {
            background: #fef08a;
            color: #92400e;
            padding: 0.125rem 0.25rem;
            border-radius: 3px;
            font-weight: 600;
        }

        .search-nav {
            display: flex;
            gap: 0.25rem;
        }

        .search-nav-btn {
            background: var(--primary-color);
            color: white;
            border: none;
            border-radius: 4px;
            padding: 0.25rem 0.5rem;
            font-size: 0.625rem;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .search-nav-btn:hover {
            background: #4f46e5;
            transform: translateY(-1px);
        }

        .search-nav-btn:disabled {
            background: #d1d5db;
            cursor: not-allowed;
            transform: none;
        }

        .log-panel-title {
            font-size: 0.875rem;
            font-weight: 600;
            color: var(--dark-color);
            margin: 0;
            display: flex;
            align-items: center;
        }

        .log-panel-title i {
            margin-right: 0.375rem;
            color: var(--primary-color);
            font-size: 0.875rem;
        }

        .log-actions {
            display: flex;
            gap: 0.375rem;
        }

        .log-content {
            background: #1a1a1a;
            color: #e5e5e5;
            padding: 1rem;
            height: 500px;
            overflow-y: auto;
            font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
            font-size: 0.75rem;
            line-height: 1.4;
            white-space: pre-wrap;
            border-radius: 0 0 12px 12px;
            scroll-behavior: smooth;
        }

        .log-content::-webkit-scrollbar {
            width: 6px;
        }

        .log-content::-webkit-scrollbar-track {
            background: #2d2d2d;
        }

        .log-content::-webkit-scrollbar-thumb {
            background: #555;
            border-radius: 3px;
        }

        .log-content::-webkit-scrollbar-thumb:hover {
            background: #777;
        }

        .btn-modern {
            border-radius: 6px;
            font-weight: 500;
            padding: 0.375rem 0.75rem;
            transition: all 0.2s ease;
            border: none;
            font-size: 0.75rem;
        }

        .btn-modern:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
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

        .btn-info-modern {
            background: linear-gradient(135deg, var(--info-color), #2563eb);
            color: white;
        }

        .btn-info-modern:hover {
            background: linear-gradient(135deg, #2563eb, #1d4ed8);
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
                margin: 5px;
                border-radius: 12px;
                height: calc(100vh - 10px);
            }

            .header {
                padding: 0.75rem 1rem;
            }

            .header h1 {
                font-size: 1.25rem;
            }

            .header p {
                font-size: 0.75rem;
            }


            .content-area {
                padding: 0.5rem;
                flex-direction: column;
            }

            .file-panel {
                width: 100%;
                max-height: 200px;
                margin-bottom: 0.5rem;
            }

            .file-item {
                padding: 0.375rem 0.5rem;
            }

            .file-name {
                font-size: 0.625rem;
            }

            .file-meta {
                font-size: 0.5rem;
            }

            .log-content {
                font-size: 0.625rem;
                padding: 0.75rem;
            }

            .btn-modern {
                padding: 0.25rem 0.5rem;
                font-size: 0.625rem;
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


        <!-- Content Area -->
        <div class="content-area">
            <!-- File Panel Sidebar -->
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
                                        <span>{{ \Carbon\Carbon::createFromTimestamp($fileModified)->setTimezone(config('app.timezone'))->format('M d, H:i') }}</span>
                                    </div>
                                </div>
                                <i class="bi bi-chevron-right" style="font-size: 0.75rem;"></i>
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

            <!-- Log Panel Main Content -->
            <div class="log-panel">
                <div class="log-panel-header">
                    <div>
                        <h5 class="log-panel-title">
                            <i class="bi bi-file-text"></i>
                            @if($current_file)
                                {{ $current_file }}
                            @else
                                Select a log file
                            @endif
                        </h5>
                        @if($current_file)
                            <div class="log-search-container">
                                <input type="text" class="log-search-box" id="logSearch" placeholder="Search in log content...">
                                <div class="search-nav">
                                    <button class="search-nav-btn" id="prevBtn" onclick="searchPrevious()" disabled>
                                        <i class="bi bi-chevron-up"></i>
                                    </button>
                                    <button class="search-nav-btn" id="nextBtn" onclick="searchNext()" disabled>
                                        <i class="bi bi-chevron-down"></i>
                                    </button>
                                </div>
                                <div class="search-results-info" id="searchResults"></div>
                            </div>
                        @endif
                    </div>
                    @if($current_file)
                        <div class="log-actions">
                            <button class="btn btn-primary-modern btn-modern btn-sm" onclick="refreshLog()">
                                <i class="bi bi-arrow-clockwise"></i> Refresh
                            </button>
                            <button class="btn btn-danger-modern btn-modern btn-sm" onclick="deleteFile('{{ encrypt($current_file) }}')">
                                <i class="bi bi-trash"></i> Delete
                            </button>
                            <button class="btn btn-info-modern btn-modern btn-sm" onclick="downloadFile('{{ $current_file }}')">
                                <i class="bi bi-download"></i> Download
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

        // Search functionality
        let searchResults = [];
        let currentSearchIndex = -1;
        let searchTerm = '';

        function performSearch() {
            const searchInput = document.getElementById('logSearch');
            const logContent = document.getElementById('logContent');
            const prevBtn = document.getElementById('prevBtn');
            const nextBtn = document.getElementById('nextBtn');
            const resultsInfo = document.getElementById('searchResults');

            if (!searchInput || !logContent) return;

            searchTerm = searchInput.value.trim();

            if (searchTerm === '') {
                clearSearch();
                return;
            }

            // Clear previous highlights
            clearSearchHighlights();

            // Find all matches
            const text = logContent.textContent;
            const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
            searchResults = [];
            let match;

            while ((match = regex.exec(text)) !== null) {
                searchResults.push({
                    index: match.index,
                    length: match[0].length
                });
            }

            // Update UI
            if (searchResults.length > 0) {
                currentSearchIndex = 0;
                prevBtn.disabled = false;
                nextBtn.disabled = false;
                resultsInfo.textContent = `1 of ${searchResults.length}`;
                highlightSearchResults();
                scrollToCurrentMatch();
            } else {
                currentSearchIndex = -1;
                prevBtn.disabled = true;
                nextBtn.disabled = true;
                resultsInfo.textContent = 'No matches found';
            }
        }

        function clearSearch() {
            const prevBtn = document.getElementById('prevBtn');
            const nextBtn = document.getElementById('nextBtn');
            const resultsInfo = document.getElementById('searchResults');

            clearSearchHighlights();
            searchResults = [];
            currentSearchIndex = -1;
            searchTerm = '';

            if (prevBtn) prevBtn.disabled = true;
            if (nextBtn) nextBtn.disabled = true;
            if (resultsInfo) resultsInfo.textContent = '';
        }

        function clearSearchHighlights() {
            const highlights = document.querySelectorAll('.search-highlight');
            highlights.forEach(highlight => {
                const parent = highlight.parentNode;
                parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
                parent.normalize();
            });
        }

        function highlightSearchResults() {
            const logContent = document.getElementById('logContent');
            if (!logContent || searchResults.length === 0) return;

            const text = logContent.textContent;
            let html = '';
            let lastIndex = 0;

            searchResults.forEach((result, index) => {
                // Add text before match
                html += text.substring(lastIndex, result.index);

                // Add highlighted match
                const matchText = text.substring(result.index, result.index + result.length);
                const highlightClass = index === currentSearchIndex ? 'search-highlight' : 'search-highlight';
                html += `<span class="${highlightClass}" style="background: ${index === currentSearchIndex ? '#fbbf24' : '#fef08a'}; color: #92400e; padding: 0.125rem 0.25rem; border-radius: 3px; font-weight: 600;">${matchText}</span>`;

                lastIndex = result.index + result.length;
            });

            // Add remaining text
            html += text.substring(lastIndex);

            logContent.innerHTML = html;
        }

        function searchNext() {
            if (searchResults.length === 0) return;

            currentSearchIndex = (currentSearchIndex + 1) % searchResults.length;
            updateSearchUI();
            highlightSearchResults();
            scrollToCurrentMatch();
        }

        function searchPrevious() {
            if (searchResults.length === 0) return;

            currentSearchIndex = currentSearchIndex <= 0 ? searchResults.length - 1 : currentSearchIndex - 1;
            updateSearchUI();
            highlightSearchResults();
            scrollToCurrentMatch();
        }

        function updateSearchUI() {
            const prevBtn = document.getElementById('prevBtn');
            const nextBtn = document.getElementById('nextBtn');
            const resultsInfo = document.getElementById('searchResults');

            if (resultsInfo) {
                resultsInfo.textContent = `${currentSearchIndex + 1} of ${searchResults.length}`;
            }
        }

        function scrollToCurrentMatch() {
            if (currentSearchIndex < 0 || currentSearchIndex >= searchResults.length) return;

            const highlights = document.querySelectorAll('.search-highlight');
            if (highlights[currentSearchIndex]) {
                highlights[currentSearchIndex].scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }

        // Add search event listeners
        document.addEventListener('DOMContentLoaded', function() {
            const logSearch = document.getElementById('logSearch');
            if (logSearch) {
                logSearch.addEventListener('input', performSearch);
                logSearch.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        if (e.shiftKey) {
                            searchPrevious();
                        } else {
                            searchNext();
                        }
                    } else if (e.key === 'Escape') {
                        clearSearch();
                        logSearch.value = '';
                    }
                });
            }
        });

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
                        const fileSearch = document.getElementById('fileSearch');
                        const logSearch = document.getElementById('logSearch');
                        if (logSearch && logSearch.offsetParent !== null) {
                            logSearch.focus();
                        } else if (fileSearch) {
                            fileSearch.focus();
                        }
                        break;
                    case 'g':
                        e.preventDefault();
                        if (e.shiftKey) {
                            searchPrevious();
                        } else {
                            searchNext();
                        }
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
