<?php

include 'db.php';

$id = $_GET['id'];
$stmt = $pdo->prepare('DELETE FROM songs WHERE id = ?');
$stmt->execute([$id]);

echo json_encode(['message' => 'Song deleted successfully']);

?>