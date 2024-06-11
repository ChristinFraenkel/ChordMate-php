document.addEventListener('DOMContentLoaded', () => {
    const songList = document.getElementById('songList');
    const chordFilterDiv = document.getElementById('chordFilter');
    const filterInput = document.getElementById('filter');
    let allSongs = [];
    let chordFilter = [];

    const fetchSongs = () => {
        fetch('./php/get_songs.php')
            .then(response => response.json())
            .then(data => {
                allSongs = data;
                displaySongs(allSongs);
                const allChords = extractAllUniqueChords(allSongs);
                populateChordFilter(allChords);
            })
            .catch(error => console.error('Error fetching songs:', error));
    };

    const filterSongs = () => {
        const filter = filterInput.value.toLowerCase();
        const filtered = allSongs.filter(song => {
            const isTitleMatch = song.title.toLowerCase().includes(filter);
            const isArtistMatch = song.artist.toLowerCase().includes(filter);
            const isSongtextMatch = song.text.toLowerCase().includes(filter);
            const isChordMatch = chordFilter.every(chord => song.text.includes(chord));
            return (isTitleMatch || isArtistMatch || isSongtextMatch) && isChordMatch;
        });
        displaySongs(filtered);
        updateChordFilterVisibility(filtered);
    };

    const updateChordFilterVisibility = (songs) => {
        const visibleChords = new Set(songs.flatMap(song => extractChords(song.text)));
        const chordCheckboxes = chordFilterDiv.querySelectorAll('.chord-check-box');
        chordCheckboxes.forEach(checkbox => {
            const input = checkbox.querySelector('input');
            if (visibleChords.has(input.value)) {
                checkbox.classList.remove('hidden');
            } else {
                checkbox.classList.add('hidden');
            }
        });
    };

    const populateChordFilter = (chords) => {
        if (!chordFilterDiv) return;
        chordFilterDiv.innerHTML = '';
        chords.sort();
        chords.forEach(chord => {
            const div = document.createElement('div');
            div.classList.add('chord-check-box');
            const label = document.createElement('label');
            const input = document.createElement('input');
            input.classList.add('chord-check');
            input.type = 'checkbox';
            input.value = chord;
            input.addEventListener('change', () => {
                if (input.checked) {
                    chordFilter.push(chord);
                } else {
                    chordFilter = chordFilter.filter(c => c !== chord);
                }
                filterSongs();
            });
            div.appendChild(label);
            div.appendChild(input);
            label.appendChild(document.createTextNode(chord));
            chordFilterDiv.appendChild(div);
        });
    };

    const extractAllUniqueChords = (songs) => {
        const allChords = songs.flatMap(song => extractChords(song.text));
        return [...new Set(allChords)];
    };

    const extractChords = (text) => {
        const chordPattern = /\[([A-G][#b]?(maj|min|m|sus|dim|aug)?[0-9]*)\]/g;
        const chords = [];
        let match;
        while ((match = chordPattern.exec(text)) !== null) {
            chords.push(match[1]);
        }
        return chords;
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
