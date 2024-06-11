document.addEventListener('DOMContentLoaded', () => {
    const songForm = document.getElementById('songForm');
    const songList = document.getElementById('songList');
    const filterInput = document.getElementById('filter');
    const chordFilterDiv = document.getElementById('chordFilter');
    const songDetail = document.getElementById('songDetail');

    let allSongs = [];
    let chordFilter = [];
    let allChords = [];

    const fetchSongs = () => {
        fetch('./php/get_songs.php')
            .then(response => response.json())
            .then(data => {
                allSongs = data;
                displaySongs(allSongs);
                allChords = extractAllUniqueChords(allSongs);
                populateChordFilter(allChords);
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
                    <a href="./php/detail.php?id=${song.id}" target="_blank"><button class="btn-add">Mehr anzeigen</button></a>
                </div>
            `;
            songList.innerHTML += songContent;

            const deleteBtn = songList.querySelector('.output-content:last-child .delete-btn');
            deleteBtn.addEventListener('click', () => deleteSong(song.id));
        });
    };

    const displaySongDetail = (song) => {
        if (song.error) {
            songDetail.innerHTML = `<p>${song.error}</p>`;
            return;
        }

        const formattedText = formatChordsInText(song.text);

        const songContent = `
            <div class="output-content detail">
                <a href="../"><button class="btn-back top">🔙</button></a>
                <button class="editButton top">🛠</button>
                <div id="columnButtons" class="hidden-content">
                    <button id="oneColumnButton">1 Spalte</button>
                    <button id="twoColumnsButton">2 Spalten</button>
                    <button id="threeColumnsButton">3 Spalten</button>
                </div>
                <h1 id="songTitle">${song.title}</h1>
                <p id="songArtist" class="artist-paragraph">${song.artist}</p>
                <pre id="songText">${formattedText}</pre>
                <div id="editForm" class="hidden-content">
                    <input type="text" id="editTitle" value="${song.title}" />
                    <input type="text" id="editArtist" value="${song.artist}" />
                    <textarea id="editText" rows="30">${song.text}</textarea>
                    <button id="saveButton">💾</button>
                    <button id="cancelButton">❎</button>
                </div>
                <button class="editButton bottom">🛠</button>
                <a href="../"><button id="backButton" class="btn-back bottom">🔙</button></a>
            </div>
        `;
        songDetail.innerHTML = songContent;

        initializeDetailPage(song);
    };

    const initializeDetailPage = (song) => {
        const editButtons = document.querySelectorAll('.editButton');
        const editForm = document.getElementById('editForm');
        const editTitle = document.getElementById('editTitle');
        const editArtist = document.getElementById('editArtist');
        const editText = document.getElementById('editText');
        const saveButton = document.getElementById('saveButton');
        const cancelButton = document.getElementById('cancelButton');
        const columnButtons = document.getElementById('columnButtons');
        const oneColumnButton = document.getElementById('oneColumnButton');
        const twoColumnsButton = document.getElementById('twoColumnsButton');
        const threeColumnsButton = document.getElementById('threeColumnsButton');
        const songText = document.getElementById('songText');

        updateColumnButtonsVisibility();

        window.addEventListener('resize', updateColumnButtonsVisibility);

        editButtons.forEach(editButton => {
            editButton.addEventListener('click', () => {
                toggleEditFormVisibility(true, editButtons);
            });
        });

        cancelButton.addEventListener('click', () => {
            displaySongDetail(song);
        });

        saveButton.addEventListener('click', () => {
            const updatedTitle = editTitle.value;
            const updatedArtist = editArtist.value;
            const updatedText = editText.value;
            saveSongDetail(song.id, updatedTitle, updatedArtist, updatedText);
        });

        oneColumnButton.addEventListener('click', () => {
            setColumnCount(songText, 1, oneColumnButton, twoColumnsButton, threeColumnsButton);
        });

        twoColumnsButton.addEventListener('click', () => {
            setColumnCount(songText, 2, twoColumnsButton, oneColumnButton, threeColumnsButton);
        });

        threeColumnsButton.addEventListener('click', () => {
            setColumnCount(songText, 3, threeColumnsButton, oneColumnButton, twoColumnsButton);
        });
    };

    const toggleEditFormVisibility = (show, editButtons) => {
        document.getElementById('songTitle').classList.toggle('hidden-content', show);
        document.getElementById('songArtist').classList.toggle('hidden-content', show);
        document.getElementById('songText').classList.toggle('hidden-content', show);
        document.getElementById('backButton').classList.toggle('hidden-content', show);
        columnButtons.classList.toggle('hidden-content', show);
        editButtons.forEach(button => button.classList.toggle('hidden-content', show));
        document.getElementById('editForm').classList.toggle('hidden-content', !show);
    };

    const updateColumnButtonsVisibility = () => {
        const viewportWidth = window.innerWidth;
        if (viewportWidth >= 1600) {
            columnButtons.classList.remove('hidden-content');
            oneColumnButton.classList.add('hidden-content');
            twoColumnsButton.classList.remove('hidden-content');
            threeColumnsButton.classList.remove('hidden-content');
        } else if (viewportWidth >= 1200) {
            columnButtons.classList.remove('hidden-content');
            oneColumnButton.classList.add('hidden-content');
            twoColumnsButton.classList.remove('hidden-content');
            threeColumnsButton.classList.add('hidden-content');
        } else {
            columnButtons.classList.add('hidden-content');
        }
    };

    const setColumnCount = (element, count, hideButton, ...showButtons) => {
        element.style.columnCount = count;
        element.style.columnRule = count === 1 ? "unset" : "dotted";
        hideButton.classList.add('hidden-content');
        showButtons.forEach(button => button.classList.remove('hidden-content'));
    };

    const saveSongDetail = (id, title, artist, text) => {
        fetch('./php/update_song.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id, title, artist, text })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                const updatedSong = { id, title, artist, text };
                displaySongDetail(updatedSong);
            } else {
                console.error('Error updating song:', data.error);
            }
        })
        .catch(error => console.error('Error updating song:', error));
    };

    const deleteSong = (id) => {
        fetch(`./php/delete_song.php?id=${id}`, { method: 'DELETE' })
            .then(response => response.json())
            .then(() => {
                allSongs = allSongs.filter(song => song.id !== id);
                filterSongs();
            })
            .catch(error => console.error('Error deleting song:', error));
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
        const currentChordFilter = new Set(chordFilter);
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
            if (currentChordFilter.has(chord)) {
                input.checked = true;
            }
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

    const formatChordsInText = (text) => {
        return text.replace(/\[([A-G][#b]?(maj|min|m|sus|dim|aug)?[0-9]*)\]/g, '<span class="chord">$1</span>');
    };

    if (songForm) {
        songForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const artist = document.getElementById('artist').value;
            const title = document.getElementById('title').value;
            const text = document.getElementById('text').value;

            fetch('./php/add_song.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ artist, title, text })
            })
            .then(response => response.json())
            .then(data => {
                allSongs.push(data);
                filterSongs();
                songForm.reset();
            })
            .catch(error => console.error('Error adding song:', error));
        });

        filterInput.addEventListener('input', filterSongs);

        fetchSongs();
    }

    if (songData) {
        displaySongDetail(songData);
    }
});
