<?php

include 'db.php';
include 'utils.php';

$stmt = $pdo->query('SELECT * FROM songs');
$songs = $stmt->fetchAll();

echo json_encode($songs);

?>
