import '../assets/styles/index.css'
import Playlist from './Playlist';
import WavePlayer from './WavePlayer'

import {audioArr} from './consts'

import DatabaseManager from './DBManager';

const dbManager = new DatabaseManager('userTracks');

const player = new WavePlayer(
        audioArr[0].tracks[0].trackSrc,
        audioArr[0].tracks[0].id,
        audioArr[0].tracks[0].name,
        audioArr[0].tracks[0].artist,
    );

const playlist = new Playlist(audioArr, player, dbManager);


