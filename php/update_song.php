<?php

header('Content-Type: application/json');
include 'db.php';

$response = [];

try{
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'];
    $title = $data['title'];
    $artist = $data['artist'];
    $text = $data['text'];

    $stmt = $pdo->prepare('UPDATE songs SET title = ?, artist = ?, text = ? WHERE id = ?');
    $stmt->execute([$title, $artist, $text, $id]);

    $response['success'] = true;
} catch (Exception $e) {
    $response['success'] = false;
    $response['error'] = $e->getMessage();
}

echo json_encode($response);

?>