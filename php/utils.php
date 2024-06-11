<?php

function formatSongText($text) {
    return $text;
}

function extractChords($text) {
    $chordRegex = '/\[([A-G][#b]?(maj|min|m|sus|dim|aug)?[0-9]*)\]/g';
    
    preg_match_all($chordRegex, $text, $matches);
    return $matches[1];
}

?>
