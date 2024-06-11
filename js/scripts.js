document.addEventListener('DOMContentLoaded', () => {

    const fetchSongs = () => {
        fetch('./php/get_songs.php')
            .then(response => response.json())
            .then(data => {
                allSongs = data;
                displaySongs(allSongs);
               
                })
                .catch(error => console.error('Error fetching songs:', error));
                
    };

    const displaySongs = (songs) => {
        if (!songList) return;
        songList.innerHTML = '';
        songs.forEach(song => {
            const firstEightLines = song.text.split('\n').slice(0, 8).join('\n');
            const formattedText = formatChordsInText(firstEightLines);

            const songContent = `
                <div class="output-content">
                    <div class="garbageIcon">
                        <button class="delete-btn">❌</button>
                    </div>
                    <h3>${song.title}</h3>
                    <p class="artist-paragraph">${song.artist}</p>
                    <pre>${formattedText}...</pre>
                    <a href="detail.php?id=${song.id}" target="_blank"><button class="btn-add">Mehr anzeigen</button></a>
                </div>
            `;
           
            songList.innerHTML += songContent;
           
        });
    };


    const formatChordsInText = (text) => {
        return text.replace(/\[([A-G][#b]?(maj|min|m|sus|dim|aug)?[0-9]*)\]/g, '<span class="chord">$1</span>');
    };


    fetchSongs();


});
