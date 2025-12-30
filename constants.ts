
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
    year: 1,
    key: 'G minor',
    form: 'AABC (32 bars)',
    tempo: 'Medium Swing',
    style: 'Ballad to medium swing',
    realBookPage: 'Vol 1, p40',
    category: 'Medium',
    mastery: 'Learning',
    sections: createSections({
      "A1": ["Cm7", "F7", "Bbmaj7", "Ebmaj7", "Am7b5", "D7", "Gm6", "Gm6"],
      "A2": ["Am7b5", "D7", "Gm6", "Gm6", "Cm7", "F7", "Bbmaj7", "Ebmaj7"],
      "B": ["Am7b5", "D7", "Gm6", "Gm6"],
      "C": ["Am7b5", "D7", "Gm6", "G7"]
    }),
    variants: [],
    patterns: [],
    practiceTools: {
      iiVChains: [
        { bars: [5, 6], targetKey: "Gm", quality: "minor ii-V" },
        { bars: [9, 10], targetKey: "Gm", quality: "minor ii-V" },
        { bars: [21, 22], targetKey: "Gm", quality: "minor ii-V" }
      ],
      recommendedLoops: [
        { name: "Opening Cycle", bars: [1, 4], focus: "Cm7-F7-Bbmaj7-Ebmaj7 voice leading" },
        { name: "Minor ii-V-i", bars: [5, 8], focus: "Am7b5-D7-Gm resolution" },
        { name: "Ending Cadence", bars: [21, 24], focus: "Final ii-V with turnaround" }
      ],
      soloingTips: [
        "Use harmonic minor and dorian over minor chords",
        "Target chord tones on beats 1 and 3",
        "Three ii-V-i patterns - great for practicing voice leading",
        "G7 at end sets up modulation to Cm for cycling"
      ]
    }
  },
  {
    id: 'blue-bossa',
    title: 'Blue Bossa',
    composer: 'Kenny Dorham',
    year: 1,
    key: 'C minor',
    form: 'AABC (16 bars)',
    tempo: '150',
    style: 'Bossa Nova',
    realBookPage: 'Vol 1, p74',
    category: 'Latin',
    mastery: 'Solid',
    sections: createSections({
      "A1": ["Cm7", "Fm7", "Dm7b5", "G7"],
      "A2": ["Cm7", "Fm7", "Dm7b5", "G7"],
      "B": ["Ebm7", "Ab7", "Dbmaj7", "Dbmaj7"],
      "C": ["Dm7b5", "G7", "Cm7", "Cm7"]
    }),
    variants: [],
    patterns: [],
    practiceTools: {
      iiVChains: [
        { bars: [3, 4], targetKey: "Cm", quality: "minor ii-V" },
        { bars: [9, 10], targetKey: "Db", quality: "major ii-V" },
        { bars: [13, 14], targetKey: "Cm", quality: "minor ii-V" }
      ],
      recommendedLoops: [
        { name: "Cm vamp", bars: [1, 4], focus: "C dorian over Cm7-Fm7" },
        { name: "Modulation", bars: [9, 12], focus: "Half-step shift to Db" },
        { name: "Turnaround", bars: [13, 16], focus: "Return to Cm" }
      ],
      soloingTips: [
        "C dorian for Cm7 and Fm7 sections",
        "Db section: shift to major sound, use Db lydian",
        "Practice smooth voice leading into half-step modulation",
        "Comp on 2 and 4 for authentic bossa feel"
      ]
    }
  },
  {
    id: 'tenor-madness',
    title: 'Tenor Madness',
    composer: 'Sonny Rollins',
    year: 1,
    key: 'Bb',
    form: '12-bar blues',
    tempo: '200',
    style: 'Bebop blues',
    realBookPage: 'Vol 1, p436',
    category: 'Blues',
    mastery: 'Solid',
    sections: createSections({
      "chorus": ["Bb7", "Bb7", "Bb7", "Bb7", "Eb7", "Eb7", "Bb7", "Bb7", "F7", "Eb7", "Bb7", "Bb7"]
    }),
    variants: [
      { 
        name: 'Basic', 
        description: 'Standard Bb blues changes',
        sections: createSections({ "chorus": ["Bb7", "Bb7", "Bb7", "Bb7", "Eb7", "Eb7", "Bb7", "Bb7", "F7", "Eb7", "Bb7", "Bb7"] }) 
      },
      { 
        name: 'Advanced', 
        description: 'Bebop blues with ii-Vs and substitutions',
        sections: createSections({ "chorus": ["Bb7", "Eb7", "Bb7", "Cm7 F7", "Eb7", "Edim7", "Bb7 D7", "Gm7 C7", "Cm7 F7", "Bm7 E7", "Bb7 G7", "Cm7 F7"] }) 
      }
    ],
    patterns: [],
    practiceTools: {
      iiVChains: [
        { bars: [4], targetKey: "Bb" },
        { bars: [8], targetKey: "F" },
        { bars: [9], targetKey: "Bb" },
        { bars: [12], targetKey: "Bb" }
      ],
      soloingTips: [
        "Target 3rds and 7ths through ii-V chains",
        "Use Bb blues vs Bb mixolydian for contrast",
        "Bars 9-12: continuous ii-V motion, practice guide tones",
        "Listen to Sonny Rollins for blues vocabulary"
      ]
    }
  },
  {
    id: 'all-blues',
    title: 'All Blues',
    composer: 'Miles Davis',
    year: 1,
    key: 'G',
    form: '12-bar blues (3/4)',
    tempo: '120',
    style: 'Modal jazz waltz',
    realBookPage: 'Vol 1, p18',
    category: 'Modal/Blues',
    mastery: 'Familiar',
    sections: createSections({
      "chorus": ["G7", "G7", "G7", "G7", "C7", "C7", "G7", "G7", "D7", "Eb7", "D7", "G7"]
    }),
    variants: [],
    patterns: [],
    practiceTools: {
      recommendedLoops: [
        { name: "G7 vamp", bars: [1, 4], focus: "G mixolydian, build phrases in 3/4" },
        { name: "IV section", bars: [5, 8], focus: "C mixolydian" },
        { name: "Chromatic turn", bars: [9, 12], focus: "D7-Eb7-D7 half-step" }
      ],
      soloingTips: [
        "Think modally: G mixolydian, not blues scale",
        "Eb7 (bar 10): chromatic approach using Eb mixolydian",
        "Build longer phrases that work in 3/4 meter",
        "Listen to Miles' phrasing on Kind of Blue"
      ]
    }
  },
  {
    id: 'i-got-rhythm',
    title: 'I Got Rhythm',
    composer: 'George Gershwin',
    year: 1,
    key: 'Bb',
    form: 'AABA (32 bars)',
    tempo: '220',
    style: 'Bebop standard',
    realBookPage: 'Vol 2, p185',
    category: 'Rhythm Changes',
    mastery: 'Learning',
    sections: createSections({
      "A": ["Bb6", "G7", "Cm7", "F7", "Bb6", "G7", "Cm7", "F7"],
      "B": ["D7", "D7", "G7", "G7", "C7", "C7", "F7", "F7"]
    }),
    variants: [
      { name: 'Basic', sections: createSections({ "A": ["Bb6", "G7", "Cm7", "F7", "Bb6", "G7", "Cm7", "F7"], "B": ["D7", "D7", "G7", "G7", "C7", "C7", "F7", "F7"] }) },
      { name: 'Advanced', sections: createSections({ "A": ["Bb6 G7", "Cm7 F7", "Dm7 G7", "Cm7 F7", "Fm7 Bb7", "Eb6 Edim7", "Bb6 G7", "Cm7 F7"], "B": ["Am7", "D7", "Dm7", "G7", "Gm7", "C7", "Cm7", "F7"] }) }
    ],
    patterns: [],
    practiceTools: {
      soloingTips: [
        "Master this form - it's the basis for Anthropology, Oleo, Moose the Mooche, etc.",
        "Bridge: descending dominants, use altered scales",
        "Practice connecting bebop scales through changes",
        "At faster tempos, think in 2-bar phrases"
      ]
    }
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
    variants: [],
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
    variants: [],
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
