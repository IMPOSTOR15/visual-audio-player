export default class Playlist {
    constructor(playlistData, player, dbManager) {
        this.dbManager = dbManager
        this.playlistData = [...playlistData];
        this.defaultPlaylists = playlistData
        this.player = player;
        this.currentPlaylist = this.playlistData[0].id;

        this.currentIndex = 0;
        this.isRepeat = false
        this.isShuffle = false
        this.currentPlaylistTracks = [];  
        this.playlistTracksElements = [];

        this.initializeDOMElements();
        this.initEventListeners();
        this.loadData();
    }

    initializeDOMElements() {
        this.createPlaylistBtnElement = document.querySelector("#create-playlist-btn");
        this.nextTrackBtnElement = document.querySelector("#next-btn");
        this.previousTrackBtnElement = document.querySelector("#previous-btn");
        this.currentTrackNameElement = document.querySelector('#player-track-name');
        this.tracksContainer = document.querySelector(".playlist__tracks");
        this.currentTrackArtistElement = document.querySelector('#player-track-artist');
        this.repeatBtnElemnt = document.querySelector('#repeat-btn');
        this.shuffleBtnElement = document.querySelector('#shuffle-btn');
    }

    async loadData() {
        try {
            const userPlaylists = await this.dbManager.getTracks();
            this.playlistData.push(...userPlaylists);
            this.renderPlaylists();
            this.renderTracks(this.playlistData[0])
        } catch (err) {
            console.error('Ошиюка загрузки плейлистов пользователей:', err);
        }
    }

    initEventListeners() {
        this.createPlaylistBtnElement.addEventListener("click", this.createPlaylist.bind(this));
        this.nextTrackBtnElement.addEventListener("click", this.nextTrack.bind(this));
        this.previousTrackBtnElement.addEventListener("click", this.prevTrack.bind(this));
        this.repeatBtnElemnt.addEventListener('click', this.toggleRepeat.bind(this));
        this.shuffleBtnElement.addEventListener('click', this.toggleShuffle.bind(this));
        this.player.wavesurfer.on('finish', this.handleTrackFinish.bind(this));
    }  

    toggleRepeat() {
        this.isRepeat = !this.isRepeat;
        this.repeatBtnElemnt.classList.toggle('player__repeat-btn_active');
    }

    handleTrackFinish() {
        this.isRepeat ? this.loadAndPlayTrack(this.currentPlaylistTracks[this.currentIndex]) : this.nextTrack();
    }

    toggleShuffle() {
        this.isShuffle = !this.isShuffle;
        this.shuffleBtnElement.classList.toggle('player__shuffle-btn_active');
    }

    async createPlaylist() {
        const playlistName = document.querySelector("#playlist-name").value;
        const files = document.querySelector("#upload-track").files;

        if (!playlistName || files.length === 0) {
            alert("Введите название и выберите треки.");
            return;
        }

        const newPlaylist = {
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
            name: playlistName,
            tracks: []
        };

        for (const file of files) {
            const blob = new Blob([await file.arrayBuffer()], { type: file.type });
            newPlaylist.tracks.push({
                id : Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
                name: file.name,
                artist: "Неизвестный",
                blob: blob
            });
        }

        this.playlistData.push(newPlaylist);
        try {
            await this.dbManager.saveTrack(newPlaylist);
        } catch (err) {
            console.error('Ошибка сохранения плейлиста:', err);
        }

        document.querySelector("#playlist-name").value = "";
        document.querySelector("#upload-track").value = "";

        this.renderPlaylists();
    }

    renderPlaylists() {
        const listContainer = document.querySelector(".playlist__list");
        listContainer.innerHTML = '';
        const playlistHeaderTemplate = document.getElementById("playlist_header_template");
      
        this.playlistData.forEach(playlist => {
            const headerClone = document.importNode(playlistHeaderTemplate.content, true);
            headerClone.querySelector(".playlist__title").textContent = playlist.name;
            headerClone.querySelector(".playlist__container").addEventListener('click', (e) => {
                if (this.currentPlaylist === playlist.id) return;
                document.querySelectorAll(".playlist__container.playing").forEach(el => el.classList.remove("playing"));
                e.currentTarget.classList.add("playing");
                this.renderTracks(playlist);
                this.currentPlaylist = playlist.id;
            });
            listContainer.appendChild(headerClone);
        });
        document.querySelector(".playlist__container").classList.add("playing")
    }
    
    renderTracks(playlist) {
        this.tracksContainer = document.querySelector(".playlist__tracks");
        this.playlistTracksElements = []
        this.tracksContainer.innerHTML = '';
        this.currentPlaylistTracks = playlist.tracks;
        const trackTemplate = document.getElementById("playlist_track_template");

        playlist.tracks.forEach(track => {
            const trackClone = document.importNode(trackTemplate.content, true);
            const trackElement = trackClone.querySelector(".playlist__track");

            if (this.player.currentTrackId === track.id) {
                trackElement.classList.add("playing");
            }

            trackElement.addEventListener('click', (e) => {
                document.querySelectorAll(".playlist__track.playing").forEach(el => el.classList.remove("playing"));
                e.currentTarget.classList.add("playing");
                if (this.player.currentTrackId === track.id) {
                    this.player.playPause();
                } else {
                    this.loadAndPlayTrack(track)
                }
            });

            trackClone.querySelector(".playlist__track-name").textContent = track.name;
            trackClone.querySelector(".playlist__track-artist").textContent = track.artist;
            this.tracksContainer.appendChild(trackClone);

            this.playlistTracksElements.push({
                id: track.id,
                trackElement: trackElement,
            })
        });
    }

    loadAndPlayTrack(track) {
        this.currentIndex = this.currentPlaylistTracks.indexOf(track);
        this.currentTrackNameElement.textContent = track.name
        this.currentTrackArtistElement.textContent = track.artist

        if (track.blob) {
            const url = URL.createObjectURL(track.blob);
            this.player.loadNewTrack(url);
        } else {
            this.player.loadNewTrack(track.trackSrc);
        }

        this.playlistTracksElements.forEach(el => el.trackElement.classList.remove("playing"))
        const currentTrackElement = this.playlistTracksElements.filter((trackElement) => trackElement.id === track.id);
        currentTrackElement[0].trackElement.classList.add("playing")
        this.player.wavesurfer.once('ready', () => {
            this.player.currentTrackId = track.id;
            this.player.play();
        });

    }

    nextTrack() {
        if (this.isShuffle) {
            let newIndex;
            do {
                newIndex = Math.floor(Math.random() * this.currentPlaylistTracks.length);
            } while (newIndex === this.currentIndex);
        
            this.currentIndex = newIndex;
            this.loadAndPlayTrack(this.currentPlaylistTracks[this.currentIndex]);
            return;
        }

        if (this.currentIndex < this.currentPlaylistTracks.length - 1) {
            this.currentIndex++;
        } else {
            this.currentIndex = 0;
        }
        this.loadAndPlayTrack(this.currentPlaylistTracks[this.currentIndex]);
    }

    prevTrack() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.loadAndPlayTrack(this.currentPlaylistTracks[this.currentIndex]);
        }
    }
}
