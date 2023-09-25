import WaveSurfer from 'wavesurfer.js'

export default class WavePlayer {
    constructor(audioFile, id, trackName, trackArtist) {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.isPlay = false

        this.currentTrackId = id
        this.trackName = trackName
        this.trackArtist = trackArtist
        
        this.rewindBtn = document.getElementById('rewind-btn');
        this.playBtn = document.getElementById('play-btn');
        this.fastForwardBtn = document.getElementById('fast-forward-btn');
        this.volumeBtn = document.getElementById('volume-btn');
        this.volumeSlider = document.getElementById('volume-slider');

        this.trackNameElement = document.querySelector('#player-track-name');
        this.trackArtistElement = document.querySelector('#player-track-artist');

        this.waveGradient = this._createWaveGradient();
        this.progressGradient = this._createProgressGradient();
        this.wavesurfer = this._createWaveSurfer(audioFile);

        this.rewindInterval = null;
        this.fastForwardInterval = null;

        this._setupButtonListeners();
        this._setupVolumeControls();
        this._setupHoverEffect();
        this._setupTimeDisplay();
    }

    _createWaveGradient() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height * 1.35);
        gradient.addColorStop(0, '#656666');
        gradient.addColorStop((this.canvas.height * 0.7) / this.canvas.height, '#656666');
        gradient.addColorStop((this.canvas.height * 0.7 + 1) / this.canvas.height, '#ffffff');
        gradient.addColorStop((this.canvas.height * 0.7 + 2) / this.canvas.height, '#ffffff');
        gradient.addColorStop((this.canvas.height * 0.7 + 3) / this.canvas.height, '#B1B1B1');
        gradient.addColorStop(1, '#B1B1B1');
        return gradient;
    }

    _createProgressGradient() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height * 1.35);
        gradient.addColorStop(0, '#EE772F');
        gradient.addColorStop((this.canvas.height * 0.7) / this.canvas.height, '#EB4926');
        gradient.addColorStop((this.canvas.height * 0.7 + 1) / this.canvas.height, '#ffffff');
        gradient.addColorStop((this.canvas.height * 0.7 + 2) / this.canvas.height, '#ffffff');
        gradient.addColorStop((this.canvas.height * 0.7 + 3) / this.canvas.height, '#F6B094');
        gradient.addColorStop(1, '#F6B094');
        return gradient;
    }

    _createWaveSurfer(audioFile, ) {
        document.querySelector('#player-track-name').textContent = this.trackName
        document.querySelector('#player-track-artist').textContent = this.trackArtist
        return WaveSurfer.create({
            container: '#waveform',
            height: 70,
            waveColor: this.waveGradient,
            progressColor: this.progressGradient,
            barWidth: 2,
            url: audioFile
        });
    }

    _setupHoverEffect() {
        const hover = document.querySelector('#hover');
        const waveform = document.querySelector('#waveform');
        waveform.addEventListener('pointermove', (e) => (hover.style.width = `${e.offsetX}px`));
    }

    _setupTimeDisplay() {
        const formatTime = (seconds) => {
            const minutes = Math.floor(seconds / 60);
            const secondsRemainder = Math.round(seconds) % 60;
            const paddedSeconds = `0${secondsRemainder}`.slice(-2);
            return `${minutes}:${paddedSeconds}`;
        }

        const timeEl = document.querySelector('#time');
        const durationEl = document.querySelector('#duration');
        this.wavesurfer.on('decode', (duration) => (durationEl.textContent = formatTime(duration)));
        this.wavesurfer.on('timeupdate', (currentTime) => (timeEl.textContent = formatTime(currentTime)));
    }

    _setupButtonListeners() {
        this.playBtn.addEventListener('click', () => {
            this.playPause();
        });

        this.rewindBtn.addEventListener('mousedown', () => {
            this.startRewinding();
        });

        this.rewindBtn.addEventListener('mouseup', () => {
            this.stopRewinding();
        });

        this.fastForwardBtn.addEventListener('mousedown', () => {
            this.startFastForwarding();
        });

        this.fastForwardBtn.addEventListener('mouseup', () => {
            this.stopFastForwarding();
        });
    }

    _setupVolumeControls() {
        this.volumeBtn.addEventListener('mouseenter', () => {
            this.volumeSlider.style.display = 'block';
        });

        this.volumeSlider.addEventListener('mouseleave', () => {
            this.volumeSlider.style.display = 'none';
        });

        this.volumeSlider.addEventListener('input', (e) => {
            const volume = parseFloat(e.target.value);
            this.wavesurfer.setVolume(volume);
            if (volume === 0) {
                this.volumeBtn.classList.remove('player__volume-btn')
                this.volumeBtn.classList.add('player__muted-btn')
            } else {
                this.volumeBtn.classList.remove('player__muted-btn')
                this.volumeBtn.classList.add('player__volume-btn')
            }
        });

        this.volumeBtn.addEventListener('click', () => {
            const currentVolume = this.wavesurfer.getVolume();
            if (currentVolume > 0) {
                this.wavesurfer.setVolume(0);
                this.volumeSlider.value = 0;
                this.volumeBtn.classList.remove('player__volume-btn')
                this.volumeBtn.classList.add('player__muted-btn')
            } else {
                this.wavesurfer.setVolume(1);
                this.volumeSlider.value = 1;
                this.volumeBtn.classList.remove('player__muted-btn')
                this.volumeBtn.classList.add('player__volume-btn')
            }
        });
    }

    rewind(seconds) {
        const currentTime = this.wavesurfer.getCurrentTime();
        const newTime = Math.max(0, currentTime - seconds);
        this.wavesurfer.seekTo(newTime / this.wavesurfer.getDuration());
    }

    fastForward(seconds) {
        const currentTime = this.wavesurfer.getCurrentTime();
        const newTime = Math.min(this.wavesurfer.getDuration(), currentTime + seconds);
        this.wavesurfer.seekTo(newTime / this.wavesurfer.getDuration());
    }

    startRewinding() {
        if (this.rewindInterval) clearInterval(this.rewindInterval);
        this.rewindInterval = setInterval(() => {
            this.rewind(0.5);
        }, 100);
    }

    stopRewinding() {
        if (this.rewindInterval) {
            clearInterval(this.rewindInterval);
            this.rewindInterval = null;
        }
    }

    startFastForwarding() {
        if (this.fastForwardInterval) clearInterval(this.fastForwardInterval);
        this.fastForwardInterval = setInterval(() => {
            this.fastForward(0.5);
        }, 100);
    }

    stopFastForwarding() {
        if (this.fastForwardInterval) {
            clearInterval(this.fastForwardInterval);
            this.fastForwardInterval = null;
        }
    }

    playPause() {
        this.isPlay = !this.isPlay
        this.wavesurfer.playPause();
        if (this.isPlay) {
            this.playBtn.classList.add('player__pause-btn')
        } else {
            this.playBtn.classList.remove('player__pause-btn')
        }
        
    }

    play() {
        this.isPlay = true
        this.playBtn.classList.add('player__pause-btn')
        this.wavesurfer.play();
    }

    pause() {
        this.wavesurfer.pause();
    }

    loadNewTrack(audioFile) {
        this.wavesurfer.load(audioFile);
    }
}
