<?php
include 'db.php';

// Check if the ID is present in the query parameters
if (isset($_GET['id'])) {
    // Retrieve the ID from the query parameters
    $id = $_GET['id'];

    // SQL query to fetch the song with the specified ID
    $stmt = $pdo->prepare('SELECT * FROM songs WHERE id = ?');
    $stmt->execute([$id]);
    $song = $stmt->fetch(PDO::FETCH_ASSOC);

    // Check if a song with the specified ID was found
    if ($song) {
        $songJson = json_encode($song);
    } else {
        $songJson = json_encode(['error' => 'The song was not found.']);
    }
} else {
    $songJson = json_encode(['error' => 'No song ID was provided.']);
}
?>

<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ChordMate - Detail</title>
    <link rel="icon" type="image/png" href="../assets/e-guitar-512x512.png">
    <link rel="stylesheet" href="../css/styles.css">
</head>
<body>
    <div id="app">
        <div id="songDetail" class="song-card"></div>
    </div>
    <script>
        const songData = <?php echo $songJson; ?>;
    </script>
    <script src="../js/scripts.js"></script>
</body>
</html>