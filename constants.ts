
import { Tune, Vocabulary, Chord, Variant } from './types';

// Helper to parse bar strings like "Cm7 F7" or "Bbmaj7"
const parseBar = (barStr: string): Chord[] => {
  const chords = barStr.trim().split(/\s+/);
  if (chords.length === 1) return [{ symbol: chords[0], duration: 4 }];
  return chords.map(c => ({ symbol: c, duration: 4 / chords.length }));
};

const createSections = (data: Record<string, string[]>): any[] => {
  return Object.entries(data).map(([name, bars]) => ({
    id: `sec-${name}-${Math.random()}`,
    name,
    chords: bars.flatMap(parseBar)
  }));
};

export const JAZZ_SHAPES = [
  { name: '1 2 3 5', description: 'The fundamental melodic building block. High rhythmic flexibility.' },
  { name: '7 1 3 5', description: 'Emphasizes the color of the chord while anchoring the root.' },
  { name: '3 5 1 7', description: 'Strong chordal identity. Great for descending lines.' },
  { name: 'Enclosures', description: 'Surrounding a target note (usually a chord tone) with chromatic or diatonic neighbors.' }
];

export const SCALE_DATA = [
  { name: 'Major Bebop', intervals: '1 2 3 4 5 b6 6 7', description: 'Major scale with a passing tone between 5 and 6.' },
  { name: 'Harmonic Minor', intervals: '1 2 b3 4 5 b6 7', description: 'Essential for minor ii-V-i progressions.' },
  { name: 'Melodic Minor', intervals: '1 2 b3 4 5 6 7', description: 'The "Jazz Minor". Used for altered dominants.' }
];

export const INITIAL_TUNES: Tune[] = [
  {
    id: 'autumn-leaves',
    title: 'Autumn Leaves',
    composer: 'Joseph Kosma',
    key: 'G Minor',
    form: 'AAB',
    tempo: 140,
    category: 'Medium',
    mastery: 'Learning',
    sections: createSections({
      "A": ["Cm7", "F7", "Bbmaj7", "Ebmaj7", "Am7b5", "D7alt", "Gm7", "Gm7"],
      "B": ["Am7b5", "D7alt", "Gm7", "Gm7", "Cm7", "F7", "Bbmaj7", "Ebmaj7", "Am7b5", "D7alt", "Gm7", "Gm7"]
    }),
    variants: [],
    patterns: [{ id: 'p1', type: 'ii-V-I', key: 'Bb', startBeat: 0, endBeat: 12, chords: ['Cm7', 'F7', 'Bbmaj7'] }]
  },
  {
    id: 'blue-bossa',
    title: 'Blue Bossa',
    composer: 'Kenny Dorham',
    key: 'C Minor',
    form: '16 Bar',
    tempo: 160,
    category: 'Latin',
    mastery: 'Solid',
    sections: createSections({
      "main": ["Cm7", "Fm7", "Dm7b5 G7", "Cm7", "Ebm7", "Ab7", "Dbmaj7", "Dbmaj7", "Dm7b5", "G7", "Cm7", "Cm7"]
    }),
    variants: [],
    patterns: []
  },
  {
    id: 'summertime',
    title: 'Summertime',
    composer: 'George Gershwin',
    key: 'A Minor',
    form: 'AB',
    tempo: 110,
    category: 'Latin',
    mastery: 'Familiar',
    sections: createSections({ "A": ["Am7", "Bm7b5 E7alt", "Am7", "Am7", "Dm7", "Dm7", "Bb9", "E7alt"] }),
    variants: [],
    patterns: []
  },
  {
    id: 'tenor-madness',
    title: 'Tenor Madness',
    composer: 'Sonny Rollins',
    key: 'Bb Major',
    form: '12-bar blues',
    tempo: 190,
    category: 'Blues',
    mastery: 'Owned',
    sections: createSections({ "blues": ["Bb7", "Eb7", "Bb7", "Bb7", "Eb7", "Eb7", "Bb7", "Bb7", "F7", "Eb7", "Bb7", "F7"] }),
    variants: [],
    patterns: []
  },
  {
    id: 'satin-doll',
    title: 'Satin Doll',
    composer: 'Duke Ellington',
    key: 'C Major',
    form: 'AABA',
    tempo: 125,
    category: 'Medium',
    mastery: 'Learning',
    sections: createSections({ "A": ["Dm7 G7", "Dm7 G7", "Em7 A7", "Em7 A7", "Am7 D7", "Abm7 Db7", "Cmaj7", "Cmaj7"] }),
    variants: [],
    patterns: []
  },
  {
    id: 'take-the-a-train',
    title: "Take The 'A' Train",
    composer: 'Billy Strayhorn',
    key: 'C Major',
    form: 'AABA',
    tempo: 165,
    category: 'Medium',
    mastery: 'Learning',
    sections: createSections({ "A": ["C6", "C6", "D7b5", "D7b5", "Dm7", "G7", "C6", "Dm7 G7"] }),
    variants: [],
    patterns: []
  },
  {
    id: 'black-orpheus',
    title: 'Black Orpheus',
    composer: 'Luiz Bonfá',
    key: 'A Minor',
    form: 'AABC',
    tempo: 140,
    category: 'Latin',
    mastery: 'Familiar',
    sections: createSections({ "A": ["Am7", "Bm7b5 E7", "Am7", "Bm7b5 E7", "Am7", "Dm7 G7", "Cmaj7", "Bm7b5 E7"] }),
    variants: [],
    patterns: []
  },
  {
    id: 'fly-me-to-the-moon',
    title: 'Fly Me To The Moon',
    composer: 'Bart Howard',
    key: 'C Major',
    form: 'AB',
    tempo: 130,
    category: 'Medium',
    mastery: 'Solid',
    sections: createSections({ "A": ["Am7", "Dm7", "G7", "Cmaj7", "Fmaj7", "Bm7b5", "E7", "Am7 A7"] }),
    variants: [],
    patterns: []
  },
  {
    id: 'solar',
    title: 'Solar',
    composer: 'Miles Davis',
    key: 'C Minor',
    form: '12 Bar',
    tempo: 175,
    category: 'Medium',
    mastery: 'Learning',
    sections: createSections({ "chorus": ["Cm6", "Cm6", "Gm7", "C7", "Fmaj7", "Fmaj7", "Fm7", "Bb7", "Ebmaj7", "Dm7b5", "G7", "Cm6"] }),
    variants: [],
    patterns: []
  },
  {
    id: 'song-for-my-father',
    title: 'Song For My Father',
    composer: 'Horace Silver',
    key: 'F Minor',
    form: 'AAB',
    tempo: 130,
    category: 'Latin',
    mastery: 'Solid',
    sections: createSections({ "A": ["Fm7", "Fm7", "Eb7", "Eb7", "Db7", "C7alt", "Fm7", "Fm7"] }),
    variants: [],
    patterns: []
  },
  {
    id: 'straight-no-chaser',
    title: 'Straight, No Chaser',
    composer: 'Thelonious Monk',
    key: 'F Major',
    form: '12-bar blues',
    tempo: 160,
    category: 'Blues',
    mastery: 'Familiar',
    sections: createSections({ "blues": ["F7", "Bb7", "F7", "F7", "Bb7", "Bb7", "F7", "D7alt", "Gm7", "C7", "F7", "C7alt"] }),
    variants: [],
    patterns: []
  },
  {
    id: 'oleo',
    title: 'Oleo',
    composer: 'Sonny Rollins',
    key: 'Bb Major',
    form: 'AABA',
    tempo: 240,
    category: 'Rhythm Changes',
    mastery: 'Learning',
    sections: createSections({ "A": ["Bb G7", "Cm7 F7", "Bb G7", "Cm7 F7", "Fm7 Bb7", "Eb7 Edim", "Bb F7", "Bb"] }),
    variants: [],
    patterns: []
  },
  {
    id: 'giant-steps',
    title: 'Giant Steps',
    composer: 'John Coltrane',
    key: 'B Major',
    form: '16 Bar',
    tempo: 280,
    category: 'Medium',
    mastery: 'Learning',
    sections: createSections({ "main": ["Bmaj7 D7", "Gmaj7 Bb7", "Ebmaj7", "Am7 D7", "Gmaj7 Bb7", "Ebmaj7 F#7", "Bmaj7", "Fm7 Bb7"] }),
    variants: [],
    patterns: []
  },
  {
    id: 'lady-bird',
    title: 'Lady Bird',
    composer: 'Tadd Dameron',
    key: 'C Major',
    form: '16 Bar',
    tempo: 180,
    category: 'Medium',
    mastery: 'Learning',
    sections: createSections({ "main": ["Cmaj7", "Cmaj7", "Fm7", "Bb7", "Cmaj7", "Cmaj7", "Bbm7", "Eb7", "Am7", "D7", "Dm7", "G7", "Cmaj7 Eb7", "Abmaj7 Db7", "Cmaj7", "G7"] }),
    variants: [],
    patterns: []
  },
  {
    id: 'st-thomas',
    title: 'St. Thomas',
    composer: 'Sonny Rollins',
    key: 'C Major',
    form: '16 Bar',
    tempo: 170,
    category: 'Latin',
    mastery: 'Familiar',
    sections: createSections({ "main": ["C6", "C6", "G7", "C6", "C6", "Fmaj7", "Em7 A7", "Dm7 G7", "C6", "C6", "G7", "C6", "C6", "Fmaj7", "Em7 A7", "Dm7 G7"] }),
    variants: [],
    patterns: []
  },
  {
    id: 'recorda-me',
    title: 'Recorda Me',
    composer: 'Joe Henderson',
    key: 'A Minor',
    form: '16 Bar',
    tempo: 160,
    category: 'Latin',
    mastery: 'Learning',
    sections: createSections({ "main": ["Am7", "Am7", "Am7", "Am7", "Cm7", "Cm7", "F7", "F7", "Bbmaj7", "Bbmaj7", "Ebm7", "Ab7", "Dbmaj7", "Gm7b5", "C7alt", "Fm7"] }),
    variants: [],
    patterns: []
  },
  {
    id: 'blue-train',
    title: 'Blue Train',
    composer: 'John Coltrane',
    key: 'Eb Major',
    form: '12-bar blues',
    tempo: 140,
    category: 'Blues',
    mastery: 'Solid',
    sections: createSections({ "blues": ["Eb7", "Ab7", "Eb7", "Eb7", "Ab7", "Ab7", "Eb7", "Eb7", "Bbm7", "Eb7", "Ab7", "Eb7"] }),
    variants: [],
    patterns: []
  },
  {
    id: 'all-the-things',
    title: 'All The Things You Are',
    composer: 'Jerome Kern',
    key: 'Ab Major',
    form: 'AABA',
    tempo: 150,
    category: 'Medium',
    mastery: 'Learning',
    sections: createSections({ "A": ["Fm7", "Bbm7", "Eb7", "Abmaj7", "Dbmaj7", "Dm7", "G7", "Cmaj7"] }),
    variants: [],
    patterns: []
  },
  {
    id: 'well-you-neednt',
    title: "Well You Needn't",
    composer: 'Thelonious Monk',
    key: 'F Major',
    form: 'AABA',
    tempo: 180,
    category: 'Medium',
    mastery: 'Learning',
    sections: createSections({ "A": ["F7", "Gb7", "F7", "Gb7", "F7", "Gb7", "F7", "Gb7"] }),
    variants: [],
    patterns: []
  },
  {
    id: 'cantaloupe-island',
    title: 'Cantaloupe Island',
    composer: 'Herbie Hancock',
    key: 'F Minor',
    form: '16 Bar',
    tempo: 120,
    category: 'Medium',
    mastery: 'Solid',
    sections: createSections({ "main": ["Fm7", "Fm7", "Fm7", "Fm7", "Db7", "Db7", "Db7", "Db7", "Dm7", "Dm7", "Dm7", "Dm7", "Fm7", "Fm7", "Fm7", "Fm7"] }),
    variants: [],
    patterns: []
  }
];

export const INITIAL_VOCAB: Vocabulary[] = [
  {
    id: 'v1',
    artist: 'Charlie Parker',
    source: 'Confirmation',
    patternType: 'ii-V-I',
    notation: 'G A Bb B C D E F G',
    key: 'C',
    difficulty: 3,
    tags: ['Bebop', 'Scalar', '1235']
  }
];
