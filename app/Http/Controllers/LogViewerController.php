<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Crypt;

class LogViewerController extends Controller
{
    protected $logPath;

    public function __construct()
    {
        $this->logPath = storage_path('logs');
    }

    /**
     * Display the log viewer web interface
     *
     * @param Request $request
     * @return \Illuminate\View\View
     */
    public function index(Request $request)
    {
        try {
            // Handle file download
            if ($request->has('download')) {
                return $this->downloadFile($request->get('download'));
            }

            // Get log files
            $files = $this->getLogFiles();

            // Get current file from request
            $currentFile = $request->get('l');
            if ($currentFile) {
                $currentFile = Crypt::decrypt($currentFile);
            } else {
                $currentFile = !empty($files) ? $files[0] : null;
            }

            // Get current folder (if any)
            $currentFolder = $request->get('f');
            if ($currentFolder) {
                $currentFolder = Crypt::decrypt($currentFolder);
            }

            // Get log content if file is selected
            $logContent = null;
            if ($currentFile) {
                $filePath = $this->logPath . '/' . $currentFile;
                if (file_exists($filePath)) {
                    $lines = $request->get('lines', 100);
                    $lines = min($lines, 1000);

                    $content = file_get_contents($filePath);
                    $linesArray = explode("\n", $content);
                    $logContent = implode("\n", array_slice($linesArray, -$lines));
                }
            }

            // Prepare folders (empty for now, can be extended)
            $folders = [];
            $structure = [];

            // Parse log content for display
            $logs = null;
            $standardFormat = true;

            if ($logContent) {
                $logs = $this->parseLogContent($logContent);
            }

            return view('logs.index', [
                'files' => $files,
                'current_file' => $currentFile,
                'log_content' => $logContent,
            ]);

        } catch (\Exception $e) {
            return view('logs.index', [
                'files' => [],
                'current_file' => null,
                'log_content' => null,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Handle log file operations (delete, etc.)
     *
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request)
    {
        try {
            // Handle delete single file
            if ($request->has('del')) {
                $file = Crypt::decrypt($request->get('del'));
                $filePath = $this->logPath . '/' . $file;

                if (file_exists($filePath)) {
                    unlink($filePath);
                    return redirect()->back()->with('success', 'Log file deleted successfully');
                }
            }

            // Handle delete all files
            if ($request->has('delall')) {
                $files = $this->getLogFiles();
                $deletedCount = 0;

                foreach ($files as $file) {
                    $filePath = $this->logPath . '/' . $file;
                    if (file_exists($filePath) && unlink($filePath)) {
                        $deletedCount++;
                    }
                }

                return redirect()->back()->with('success', "Deleted {$deletedCount} log files");
            }

            return redirect()->back();

        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error: ' . $e->getMessage());
        }
    }

    /**
     * Get list of log files
     *
     * @return array
     */
    protected function getLogFiles()
    {
        $files = [];

        if (is_dir($this->logPath)) {
            $files = collect(File::files($this->logPath))
                ->filter(function ($file) {
                    return $file->getExtension() === 'log';
                })
                ->map(function ($file) {
                    return [
                        'name' => $file->getFilename(),
                        'modified' => $file->getMTime(),
                        'size' => $file->getSize(),
                        'path' => $file->getPathname(),
                    ];
                })
                ->sort(function ($a, $b) {
                    // First sort by modification time (descending)
                    $timeCompare = $b['modified'] <=> $a['modified'];
                    if ($timeCompare !== 0) {
                        return $timeCompare;
                    }
                    // If same time, sort by size (descending) for more recent activity
                    $sizeCompare = $b['size'] <=> $a['size'];
                    if ($sizeCompare !== 0) {
                        return $sizeCompare;
                    }
                    // If same time and size, sort by name (ascending) for consistency
                    return $a['name'] <=> $b['name'];
                })
                ->pluck('name')
                ->values()
                ->toArray();
        }

        return $files;
    }

    /**
     * Download a log file
     *
     * @param string $filename
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse
     */
    public function downloadFile($filename)
    {
        $filePath = $this->logPath . '/' . $filename;

        if (!File::exists($filePath) || File::extension($filePath) !== 'log') {
            abort(404, 'Log file not found');
        }

        return response()->download($filePath, $filename);
    }

    /**
     * Parse log content for display
     *
     * @param string $content
     * @return array|null
     */
    protected function parseLogContent($content)
    {
        $logs = [];
        $lines = explode("\n", $content);

        foreach ($lines as $line) {
            if (empty(trim($line))) {
                continue;
            }

            // Simple log parsing - you can enhance this based on your log format
            $logs[] = [
                'context' => '',
                'level' => 'info',
                'date' => date('Y-m-d H:i:s'),
                'text' => $line,
                'in_file' => '',
                'stack' => '',
            ];
        }

        return $logs;
    }
}
