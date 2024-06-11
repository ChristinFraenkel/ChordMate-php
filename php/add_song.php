<?php

include 'db.php';
include 'uuid.php';

$data = json_decode(file_get_contents('php://input'), true);
$id = uuid();
$artist = $data['artist'];
$title = $data['title'];
$text = $data['text'];

$stmt = $pdo->prepare('INSERT INTO songs (id, artist, title, text) VALUES (?, ?, ?, ? )');
$stmt->execute([$id, $artist, $title, $text]);

echo json_encode(['id' => $id, 'artist' => $artist, 'title' => $title, 'text' => $text]);

?>