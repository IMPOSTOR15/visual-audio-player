import lofiStudyAudio from '../audio/lofi-study.mp3'
import goodNightAudio from '../audio/good-night.mp3'
import spiritBlossomAudio from '../audio/spirit-blossom.mp3'
import watRFluidAudio from '../audio/watr-fluid.mp3'
import loFiChillAudio from '../audio/lofi-chill.mp3'

import melodicTechno03ExtendedVersionMoogify from '../audio/melodic-techno-03-extended-version-moogify.mp3'
import cyberWar from '../audio/cyber-war.mp3'
import tension from '../audio/tension.mp3'

export const audioArr = [
    {
        id: 1,
        name: 'Lofi плейлист',
        tracks: [
            {   
                id: 1,
                name: 'Lofi Study',
                artist: 'FASSounds',
                trackSrc: lofiStudyAudio,
            },
            {   
                id: 2,
                name: 'Good Night',
                artist: 'FASSounds',
                trackSrc: goodNightAudio,
            },
            {   
                id: 3,
                name: 'Spirit Blossom',
                artist: 'RomanBelov',
                trackSrc: spiritBlossomAudio,
            },
            {   
                id: 4,
                name: 'WatR - Fluid',
                artist: 'ItsWatR',
                trackSrc: watRFluidAudio,
            },
            {   
                id: 5,
                name: 'LoFi Chill (Medium Version)',
                artist: 'BoDleasons',
                trackSrc: loFiChillAudio,
            },
        ]
    },
    {
        id: 2,
        name: 'Techno плейлист',
        tracks: [
            {   
                id: 6,
                name: 'Melodic Techno #03 Extended Version - Moogify',
                artist: 'Zen_Man',
                trackSrc: melodicTechno03ExtendedVersionMoogify,
            },
            {   
                id: 7,
                name: 'Cyber War',
                artist: 'AlexiAction',
                trackSrc: cyberWar,
            },
            {   
                id: 8,
                name: 'Tension',
                artist: 'AlexiAction',
                trackSrc: tension,
            },
        ]
    }
]