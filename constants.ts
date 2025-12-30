
import { Tune, Vocabulary, Chord, Variant, Section } from './types';

const parseBar = (barStr: string): Chord[] => {
  const chords = barStr.trim().split(/\s+/);
  if (chords.length === 1) return [{ symbol: chords[0], duration: 4 }];
  return chords.map(c => ({ symbol: c, duration: 4 / chords.length }));
};

const createSections = (data: Record<string, string[]>): Section[] => {
  return Object.entries(data).map(([name, bars]) => ({
    id: `sec-${name}-${Math.random()}`,
    name,
    chords: bars.flatMap(parseBar)
  }));
};

export const SCALE_DATA = [
  { name: 'Major Bebop', intervals: '1 2 3 4 5 b6 6 7', description: 'Major scale with a passing tone between 5 and 6.' },
  { name: 'Harmonic Minor', intervals: '1 2 b3 4 5 b6 7', description: 'Essential for minor ii-V-i progressions. Use on the V7alt chord.' },
  { name: 'Melodic Minor', intervals: '1 2 b3 4 5 6 7', description: 'The "Jazz Minor". Used for altered dominants.' },
  { name: 'Dorian', intervals: '1 2 b3 4 5 6 b7', description: 'The standard minor sound for ii-V-I progressions.' }
];

export const INITIAL_TUNES: Tune[] = [
  {
    id: 'autumn-leaves',
    title: 'Autumn Leaves',
    composer: 'Joseph Kosma',
    key: 'G Minor',
    form: 'AABC',
    tempo: 140,
    category: 'Medium',
    mastery: 'Learning',
    sections: createSections({
      "A": ["Cm7", "F7", "Bbmaj7", "Ebmaj7", "Am7b5", "D7alt", "Gm7", "Gm7"],
      "B": ["Am7b5", "D7alt", "Gm7", "Gm7", "Cm7", "F7", "Bbmaj7", "Ebmaj7"],
      "C": ["Am7b5", "D7alt", "Gm7", "Gm7", "Am7b5", "D7alt", "Gm7", "G7"]
    }),
    variants: [],
    patterns: []
  },
  {
    id: 'all-of-me',
    title: 'All of Me',
    composer: 'Simons & Marks',
    key: 'C Major',
    form: 'AABA',
    tempo: 160,
    category: 'Medium',
    mastery: 'Learning',
    sections: createSections({
      "A": ["C", "E7", "A7", "Dm7", "E7", "Am7", "D7", "Dm7 G7"],
      "B": ["E7", "E7", "A7", "A7", "D7", "D7", "G7", "G7"]
    }),
    variants: [
      { name: 'Basic', sections: createSections({ "A": ["C", "E7", "A7", "Dm7", "E7", "Am7", "D7", "Dm7 G7"], "B": ["E7", "E7", "A7", "A7", "D7", "D7", "G7", "G7"] }) },
      { name: 'Advanced', sections: createSections({ "A": ["C", "E7", "A7", "Dm7 G7", "C A7", "Dm7 G7", "Em7 A7", "Dm7 G7"] }) }
    ],
    patterns: []
  },
  {
    id: 'take-a-train',
    title: 'Take The A Train',
    composer: 'Billy Strayhorn',
    key: 'C Major',
    form: 'AABA',
    tempo: 170,
    category: 'Medium',
    mastery: 'Solid',
    sections: createSections({
      "A": ["C", "D7", "Dm7 G7", "C", "E7", "A7", "Dm7 G7", "C A7"],
      "B": ["D7", "D7", "G7", "G7", "C7", "C7", "D7", "G7"]
    }),
    variants: [],
    patterns: []
  },
  {
    id: 'blue-bossa',
    title: 'Blue Bossa',
    composer: 'Kenny Dorham',
    key: 'C Minor',
    form: 'AABA',
    tempo: 150,
    category: 'Latin',
    mastery: 'Solid',
    sections: createSections({
      "A": ["Cm7", "Fm7", "Dm7b5 G7", "Cm7", "Eb7", "Ab7", "Dm7b5 G7", "Cm7"],
      "B": ["Fm7", "Bb7", "Ebmaj7", "Ab7", "Dm7b5 G7", "Cm7", "Dm7b5 G7", "Cm7"]
    }),
    variants: [],
    patterns: []
  },
  {
    id: 'song-for-my-father',
    title: 'Song for My Father',
    composer: 'Horace Silver',
    key: 'F Minor',
    form: 'AABA',
    tempo: 130,
    category: 'Latin',
    mastery: 'Solid',
    sections: createSections({
      "A": ["Fm7", "Fm7", "Fm7", "Fm7", "Db7", "Db7", "Cm7", "C7"],
      "B": ["Fm7", "Bb7", "Eb7", "Ab7", "Db7", "Db7", "Cm7", "C7"]
    }),
    variants: [],
    patterns: []
  },
  {
    id: 'c-jam-blues',
    title: 'C Jam Blues',
    composer: 'Duke Ellington',
    key: 'C Major',
    form: '12-bar blues',
    tempo: 140,
    category: 'Blues',
    mastery: 'Familiar',
    sections: createSections({ "chorus": ["C7", "C7", "C7", "C7", "F7", "F7", "C7", "C7", "G7", "F7", "C7", "G7"] }),
    variants: [
      { name: 'Basic', sections: createSections({ "chorus": ["C7", "C7", "C7", "C7", "F7", "F7", "C7", "C7", "G7", "F7", "C7", "G7"] }) },
      { name: 'Advanced', sections: createSections({ "chorus": ["C7", "C7", "C7", "Dm7 G7", "F7", "F#dim", "C7 A7", "Dm7 G7", "Em7 A7", "Dm7 G7", "C7 A7", "Dm7 G7"] }) }
    ],
    patterns: []
  },
  {
    id: 'tenor-madness',
    title: 'Tenor Madness',
    composer: 'Sonny Rollins',
    key: 'Bb Major',
    form: '12-bar blues',
    tempo: 200,
    category: 'Blues',
    mastery: 'Solid',
    sections: createSections({ "chorus": ["Bb7", "Bb7", "Bb7", "Bb7", "Eb7", "Eb7", "Bb7", "Bb7", "F7", "Eb7", "Bb7", "F7"] }),
    variants: [
      { name: 'Basic', sections: createSections({ "chorus": ["Bb7", "Bb7", "Bb7", "Bb7", "Eb7", "Eb7", "Bb7", "Bb7", "F7", "Eb7", "Bb7", "F7"] }) },
      { name: 'Advanced', sections: createSections({ "chorus": ["Bb7", "Bb7", "Bb7", "Cm7 F7", "Eb7", "Edim", "Bb7 D7", "Gm7 C7", "Cm7 F7", "Bm7 E7", "Bb7 G7", "Cm7 F7"] }) }
    ],
    patterns: []
  },
  {
    id: 'all-blues',
    title: 'All Blues',
    composer: 'Miles Davis',
    key: 'G Major',
    form: '12-bar blues (3/4)',
    tempo: 120,
    category: '3/4',
    mastery: 'Familiar',
    sections: createSections({ "chorus": ["G7", "G7", "G7", "G7", "C7", "C7", "G7", "G7", "D7", "C7", "G7", "D7"] }),
    variants: [],
    patterns: []
  },
  {
    id: 'i-got-rhythm',
    title: 'I Got Rhythm',
    composer: 'George Gershwin',
    key: 'Bb Major',
    form: 'AABA',
    tempo: 220,
    category: 'Rhythm Changes',
    mastery: 'Learning',
    sections: createSections({
      "A": ["Bb6", "G7", "Cm7", "F7", "Bb6", "G7", "Cm7 F7", "Bb6 F7"],
      "B": ["D7", "D7", "G7", "G7", "C7", "C7", "F7", "F7"]
    }),
    variants: [
      { name: 'Basic', sections: createSections({ "A": ["Bb6", "G7", "Cm7", "F7", "Bb6", "G7", "Cm7 F7", "Bb6 F7"], "B": ["D7", "D7", "G7", "G7", "C7", "C7", "F7", "F7"] }) },
      { name: 'Advanced', sections: createSections({ "A": ["Bb6 G7", "Cm7 F7", "Bb6 D7", "Gm7 C7", "Cm7 F7", "Bm7 E7", "Bb6 G7", "Cm7 F7"], "B": ["D7", "G7", "C7", "F7", "Bb7", "Eb7", "Am7 D7", "Gm7 C7"] }) }
    ],
    patterns: []
  },
  {
    id: 'all-the-things',
    title: 'All The Things You Are',
    composer: 'Jerome Kern',
    key: 'Ab Major',
    form: 'AABA',
    tempo: 180,
    category: 'Medium',
    mastery: 'Learning',
    sections: createSections({
      "A": ["Fm7", "Bb7", "Ebmaj7", "Abmaj7", "Dm7b5", "G7", "Cmaj7", "Cmaj7"],
      "B": ["Em7", "A7", "Dmaj7", "Dmaj7", "Gm7", "C7", "Fmaj7", "Fmaj7"]
    }),
    variants: [],
    patterns: []
  },
  {
    id: 'mr-pc',
    title: 'Mr. P.C.',
    composer: 'John Coltrane',
    key: 'C Minor',
    form: 'Minor blues',
    tempo: 240,
    category: 'Blues',
    mastery: 'Owned',
    sections: createSections({ "chorus": ["Cm7", "Cm7", "Cm7", "Cm7", "Fm7", "Fm7", "Cm7", "Cm7", "Ab7", "G7", "Cm7", "G7"] }),
    variants: [],
    patterns: []
  }
];

export const INITIAL_VOCAB: Vocabulary[] = [];
