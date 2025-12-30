
import { Tune, Vocabulary, Chord, Variant } from './types';

// Helper to parse bar strings like "Cm7 F7" or "Bbmaj7"
const parseBar = (barStr: string): Chord[] => {
  const chords = barStr.trim().split(/\s+/);
  if (chords.length === 1) return [{ symbol: chords[0], duration: 4 }];
  return chords.map(c => ({ symbol: c, duration: 2 }));
};

const createSections = (data: Record<string, string[]>): any[] => {
  return Object.entries(data).map(([name, bars]) => ({
    id: `sec-${name}-${Math.random()}`,
    name,
    chords: bars.flatMap(parseBar)
  }));
};

export const SAX_LEGENDS = [
  { name: 'John Coltrane', url: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/John_Coltrane_1963.jpg' },
  { name: 'Charlie Parker', url: 'https://upload.wikimedia.org/wikipedia/commons/0/00/Charlie_Parker%2C_William_P._Gottlieb_Studio%2C_N.Y.%2C_ca._Aug._1947_%28Gottlieb_06821%29.jpg' },
  { name: 'Cannonball Adderley', url: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Julian_Cannonball_Adderley_1961.jpg' },
  { name: 'Dexter Gordon', url: 'https://upload.wikimedia.org/wikipedia/commons/2/23/Dexter_Gordon%2C_1948_%28William_P._Gottlieb_03131%29.jpg' }
];

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

const autumnBasic = createSections({
  "A": ["Cm7", "F7", "Bbmaj7", "Ebmaj7", "Am7b5", "D7alt", "Gm7", "Gm7"],
  "A2": ["Cm7", "F7", "Bbmaj7", "Ebmaj7", "Am7b5", "D7alt", "Gm7", "Gm7"],
  "B": ["Am7b5", "D7alt", "Gm7", "Gm7", "Cm7", "F7", "Bbmaj7", "Ebmaj7", "Am7b5", "D7alt", "Gm7", "Gm7"]
});

const tenorBasic = createSections({
  "chorus": ["Bb7", "Eb7", "Bb7", "Bb7", "Eb7", "Eb7", "Bb7", "Bb7", "F7", "Eb7", "Bb7", "F7"]
});

const tenorAdvanced = createSections({
  "chorus": ["Bb7", "Bb7", "Bb7", "Cm7 F7", "Eb7", "Edim", "Bb7 D7", "Gm7 C7", "Cm7 F7", "Bm7 E7", "Bb7 G7", "Cm7 F7"]
});

export const INITIAL_TUNES: Tune[] = [
  {
    id: 'autumn-leaves',
    title: 'Autumn Leaves',
    composer: 'Joseph Kosma',
    key: 'G Minor',
    form: 'AAB',
    tempo: 140,
    year: 1,
    category: 'Medium',
    mastery: 'Learning',
    sections: autumnBasic,
    variants: [{ name: 'Basic', sections: autumnBasic }],
    patterns: [
      { id: 'p1', type: 'ii-V-I', key: 'Bb', startBeat: 0, endBeat: 12, chords: ['Cm7', 'F7', 'Bbmaj7'] },
      { id: 'p2', type: 'minor-ii-V-i', key: 'Gm', startBeat: 16, endBeat: 28, chords: ['Am7b5', 'D7alt', 'Gm7'] }
    ]
  },
  {
    id: 'tenor-madness',
    title: 'Tenor Madness',
    composer: 'Sonny Rollins',
    key: 'Bb Major',
    form: '12-bar blues',
    tempo: 180,
    year: 1,
    category: 'Blues',
    style: 'Straight-ahead swing',
    mastery: 'Owned',
    sections: tenorBasic,
    variants: [
      { name: 'Basic', sections: tenorBasic },
      { name: 'Advanced', sections: tenorAdvanced }
    ],
    patterns: [{ id: 'p1', type: 'ii-V-I', key: 'Bb', startBeat: 32, endBeat: 40, chords: ['Cm7', 'F7', 'Bb7'] }],
    soloingTips: [
      "Outline dominant 7ths clearly in basic mode",
      "Target 3rds and 7ths through ii–V chains",
      "Use Bb mixolydian vs Bb blues to hear contrast",
      "Practice guide-tone lines through bars 9–12"
    ]
  },
  {
    id: 'blue-bossa',
    title: 'Blue Bossa',
    composer: 'Kenny Dorham',
    key: 'C Minor',
    form: '16 Bar',
    tempo: 160,
    year: 1,
    category: 'Latin',
    mastery: 'Solid',
    sections: createSections({
      "A": ["Cm7", "Fm7", "Dm7b5 G7", "Cm7", "Eb7", "Ab7", "Dm7b5 G7", "Cm7"],
      "B": ["Fm7", "Bb7", "Ebmaj7", "Ab7", "Dm7b5 G7", "Cm7", "Dm7b5 G7", "Cm7"]
    }),
    variants: [{ name: 'Basic', sections: createSections({ "main": ["Cm7", "Fm7", "Dm7b5 G7", "Cm7", "Eb7", "Ab7", "Dm7b5 G7", "Cm7"] }) }],
    patterns: []
  },
  {
    id: 'all-of-me',
    title: 'All of Me',
    composer: 'Marks/Simons',
    key: 'C Major',
    form: 'ABAC',
    tempo: 160,
    year: 1,
    category: 'Medium',
    mastery: 'Familiar',
    sections: createSections({
      "A": ["C6", "E7", "A7", "Dm7", "E7", "Am7", "D7", "Dm7 G7"],
      "B": ["C6", "E7", "A7", "Dm7", "F6", "Fm6", "C6 A7", "Dm7 G7"]
    }),
    variants: [{ name: 'Basic', sections: createSections({ "A": ["C6", "E7", "A7", "Dm7"], "B": ["E7", "Am7", "D7", "Dm7 G7"] }) }],
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
