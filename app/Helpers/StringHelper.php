<?php

namespace App\Helpers;

class StringHelper
{
    /**
     * Clean HTML string and replace with newlines
     *
     * This function removes HTML tags and replaces block-level elements
     * with newlines to create clean text output.
     *
     * @param string $htmlString The HTML string to clean
     * @return string Cleaned string with newlines
     */
    public static function cleanHtmlAndReplaceWithNewline(string $htmlString): string
    {
        // 1. Ganti tag-tag block-level dan <br> dengan spasi lalu karakter newline
        // Penambahan spasi sebelum \n bertujuan agar kata tidak saling menempel
        $cleanedString = preg_replace('/<br\s?\/?>/i', "\n", $htmlString);
        $cleanedString = preg_replace('/<\/p>/i', "\n", $cleanedString);
        $cleanedString = preg_replace('/<\/div>/i', "\n", $cleanedString);
        $cleanedString = preg_replace('/<\/h[1-6]>/i', "\n", $cleanedString);

        // 2. Hapus semua tag HTML yang tersisa
        $cleanedString = strip_tags($cleanedString);

        // 3. Ganti beberapa entitas HTML umum (opsional)
        $cleanedString = html_entity_decode($cleanedString);

        // 4. Hapus spasi atau baris baru berlebih di awal dan akhir string
        return trim($cleanedString);
    }
}
