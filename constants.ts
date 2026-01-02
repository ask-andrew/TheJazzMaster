
import { Tune, Chord, Section } from './types.ts';

const createSectionDetailed = (id: string, name: string, data: { chord: string, roman?: string, note?: string }[]): Section => {
  return {
    id,
    name,
    chords: data.map(d => ({
      symbol: d.chord,
      duration: 4, 
      roman: d.roman,
      note: d.note
    }))
  };
};

const parseBar = (barStr: string): Chord[] => {
  const chords = barStr.trim().split(/\s+/);
  if (chords.length === 1) return [{ symbol: chords[0], duration: 4 }];
  return chords.map(c => ({ symbol: c, duration: 4 / chords.length }));
};

const createSectionsSimple = (data: Record<string, string[]>): Section[] => {
  return Object.entries(data).map(([name, bars]) => ({
    id: `sec-${name}-${Math.random()}`,
    name,
    chords: bars.flatMap(parseBar)
  }));
};

export const SCALE_DEGREES = [
  { name: 'Ionian (Major)', degrees: ['1', '2', '3', '4', '5', '6', '7'], tags: ['Major', 'ii-V-I'] },
  { name: 'Dorian', degrees: ['1', '2', 'b3', '4', '5', '6', 'b7'], tags: ['Minor', 'ii-V-I'] },
  { name: 'Phrygian', degrees: ['1', 'b2', 'b3', '4', '5', 'b6', 'b7'], tags: ['Minor'] },
  { name: 'Lydian', degrees: ['1', '2', '3', '#4', '5', '6', '7'], tags: ['Major', 'Maj7#11'] },
  { name: 'Mixolydian', degrees: ['1', '2', '3', '4', '5', '6', 'b7'], tags: ['Dominant', 'ii-V-I'] },
  { name: 'Aeolian', degrees: ['1', '2', 'b3', '4', '5', 'b6', 'b7'], tags: ['Minor'] },
  { name: 'Locrian', degrees: ['1', 'b2', 'b3', '4', 'b5', 'b6', 'b7'], tags: ['Half-Dim'] },
  { name: 'Locrian ♮2', degrees: ['1', '2', 'b3', '4', 'b5', 'b6', 'b7'], tags: ['Half-Dim', 'minor-ii-V'] },
  { name: 'Melodic Minor', degrees: ['1', '2', 'b3', '4', '5', '6', '7'], tags: ['Minor', 'Tonic-Minor'] },
  { name: 'Harmonic Minor', degrees: ['1', '2', 'b3', '4', '5', 'b6', '7'], tags: ['Minor', 'minor-ii-V'] },
  { name: 'Altered', degrees: ['1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7'], tags: ['Dominant', 'Altered', 'V-alt'] },
  { name: 'Bebop Major', degrees: ['1', '2', '3', '4', '5', 'b6', '6', '7'], tags: ['Major', 'Bebop'] },
  { name: 'Dorian Bebop', degrees: ['1', '2', 'b3', '3', '4', '5', '6', 'b7'], tags: ['Minor', 'Bebop'] },
  { name: 'Mixolydian Bebop', degrees: ['1', '2', '3', '4', '5', '6', 'b7', '7'], tags: ['Dominant', 'Bebop'] },
  { name: 'Major Blues', degrees: ['1', '2', 'b3', '3', '5', '6'], tags: ['Major', 'Blues'] },
  { name: 'Minor Blues', degrees: ['1', 'b3', '4', 'b5', '5', 'b7'], tags: ['Minor', 'Blues'] },
];

export const SCALE_DATA = [
  { name: 'Major Bebop', intervals: '1 2 3 4 5 b6 6 7', description: 'Major scale with a passing tone between 5 and 6.', targets: ['maj7', '6'] },
  { name: 'Harmonic Minor', intervals: '1 2 b3 4 5 b6 7', description: 'Essential for minor ii-V-i progressions. Use on the V7alt chord.', targets: ['7alt', 'm(maj7)'] },
  { name: 'Melodic Minor', intervals: '1 2 b3 4 5 6 7', description: 'The "Jazz Minor". Used for altered dominants and tonic minor.', targets: ['m6', 'm(maj7)', '7alt'] },
  { name: 'Dorian', intervals: '1 2 b3 4 5 6 b7', description: 'The standard minor sound for ii-V-I progressions.', targets: ['m7'] },
  { name: 'Major Blues', intervals: '1 2 b3 3 5 6', description: 'Sweet blues sound. Great for major standards and country-inflected jazz.', targets: ['maj7', '7'] },
  { name: 'Minor Blues', intervals: '1 b3 4 b5 5 b7', description: 'The "standard" blues scale. Universal language for tension and grit.', targets: ['7', 'm7'] }
];

// Fix: Explicitly type INITIAL_TUNES as Tune[] to ensure type checking
export const INITIAL_TUNES: Tune[] = [
  {
    id: 'autumn-leaves',
    title: 'Autumn Leaves',
    composer: 'Joseph Kosma',
    year: 1945,
    key: 'G minor',
    form: 'AABC (32 bars)',
    tempo: 140,
    style: 'Medium Swing',
    category: 'Medium',
    mastery: 'Learning',
    sections: [
      createSectionDetailed("al-a1", "A1", [
        { chord: "Cm7" }, { chord: "F7" }, { chord: "Bbmaj7" }, { chord: "Ebmaj7" },
        { chord: "Am7b5" }, { chord: "D7alt" }, { chord: "Gm6" }, { chord: "Gm6" }
      ]),
      createSectionDetailed("al-a2", "A2", [
        { chord: "Cm7" }, { chord: "F7" }, { chord: "Bbmaj7" }, { chord: "Ebmaj7" },
        { chord: "Am7b5" }, { chord: "D7alt" }, { chord: "Gm6" }, { chord: "Gm6" }
      ]),
      createSectionDetailed("al-b", "B", [
        { chord: "Am7b5" }, { chord: "D7alt" }, { chord: "Gm6" }, { chord: "Gm6" },
        { chord: "Cm7" }, { chord: "F7" }, { chord: "Bbmaj7" }, { chord: "Ebmaj7" }
      ]),
      createSectionDetailed("al-c", "C", [
        { chord: "Am7b5" }, { chord: "D7alt" }, { chord: "Gm6" }, { chord: "G7alt" }
      ])
    ],
    variants: [
      {
        name: 'Basic Changes',
        description: 'Simplified diatonic movement without extensions.',
        sections: createSectionsSimple({
          "A": ["Cm7", "F7", "Bbmaj7", "Ebmaj7", "Am7b5", "D7", "Gm", "Gm"],
          "B": ["Am7b5", "D7", "Gm", "Gm", "Cm7", "F7", "Bbmaj7", "Ebmaj7"]
        })
      }
    ],
    patterns: [],
    practiceTools: {
      recommendedLoops: [{ name: "Minor ii-V-i", bars: [5, 8], focus: "Internalizing Locrian Natural 2 to Altered" }],
      soloingTips: ["Connect the 7th of F7 (Eb) to the 3rd of Bbmaj7 (D)."]
    }
  },
  {
    id: 'blue-bossa',
    title: 'Blue Bossa',
    composer: 'Kenny Dorham',
    year: 1963,
    key: 'C minor',
    form: '16-bar form',
    tempo: 160,
    style: 'Bossa Nova',
    category: 'Latin',
    mastery: 'Solid',
    sections: [
      createSectionDetailed("bb-a", "Chorus", [
        { chord: "Cm7" }, { chord: "Fm7" }, { chord: "Dm7b5" }, { chord: "G7alt" },
        { chord: "Cm7" }, { chord: "Fm7" }, { chord: "Dm7b5" }, { chord: "G7alt" },
        { chord: "Ebm7" }, { chord: "Ab7" }, { chord: "Dbmaj7" }, { chord: "Dbmaj7" },
        { chord: "Dm7b5" }, { chord: "G7alt" }, { chord: "Cm7" }, { chord: "C7alt" }
      ])
    ],
    variants: [
      {
        name: 'Standard (Clean)',
        description: 'No altered turnarounds.',
        sections: createSectionsSimple({
          "Chorus": ["Cm7", "Fm7", "Dm7b5", "G7", "Cm7", "Fm7", "Dm7b5", "G7", "Ebm7", "Ab7", "Dbmaj7", "Dbmaj7", "Dm7b5", "G7", "Cm7", "G7"]
        })
      }
    ],
    patterns: [],
    practiceTools: {
      recommendedLoops: [{ name: "The Modulation", bars: [9, 12], focus: "Half step shift up to Db Major" }],
      soloingTips: ["C Dorian works for most of the tune except the Db section."]
    }
  },
  {
    id: 'all-the-things',
    title: 'All The Things You Are',
    composer: 'Jerome Kern',
    year: 1939,
    key: 'Ab major',
    form: 'AA\'BA\'\' (36 bars)',
    tempo: 180,
    category: 'Medium',
    mastery: 'Learning',
    sections: [
      createSectionDetailed("atta-a1", "A1", [
        { chord: "Fm7" }, { chord: "Bbm7" }, { chord: "Eb7" }, { chord: "Abmaj7" },
        { chord: "Dbmaj7" }, { chord: "Dm7" }, { chord: "G7" }, { chord: "Cmaj7" }
      ]),
      createSectionDetailed("atta-a2", "A2", [
        { chord: "Cm7" }, { chord: "Fm7" }, { chord: "Bb7" }, { chord: "Ebmaj7" },
        { chord: "Abmaj7" }, { chord: "Am7" }, { chord: "D7" }, { chord: "Gmaj7" }
      ]),
      createSectionDetailed("atta-b", "B", [
        { chord: "Am7" }, { chord: "D7" }, { chord: "Gmaj7" }, { chord: "Gmaj7" },
        { chord: "F#m7" }, { chord: "B7" }, { chord: "Emaj7" }, { chord: "C7alt" }
      ]),
      createSectionDetailed("atta-a3", "A3", [
        { chord: "Fm7" }, { chord: "Bbm7" }, { chord: "Eb7" }, { chord: "Abmaj7" },
        { chord: "Dbmaj7" }, { chord: "Dbm7" }, { chord: "Cm7" }, { chord: "Bdim7" },
        { chord: "Bbm7" }, { chord: "Eb7" }, { chord: "Abmaj7" }, { chord: "G7alt" }
      ])
    ],
    variants: [
      {
        name: 'Basic Changes',
        description: 'Simplified diatonic movement for easier navigation.',
        sections: createSectionsSimple({
          "A": ["Fm7", "Bbm7", "Eb7", "Abmaj7", "Dbmaj7", "G7", "Cmaj7", "Cmaj7"],
          "B": ["Am7", "D7", "Gmaj7", "Gmaj7", "F#m7", "B7", "Emaj7", "C7"]
        })
      }
    ],
    patterns: [],
    practiceTools: {
      recommendedLoops: [{ name: "Chromatic Ending", bars: [29, 32], focus: "Dbmaj7-Dbm7-Cm7-Bdim7" }],
      soloingTips: ["The bridge modulates to G then E major."]
    }
  },
  {
    id: 'fly-me',
    title: 'Fly Me To The Moon',
    composer: 'Bart Howard',
    year: 1954,
    key: 'C major',
    form: 'AB (32 bars)',
    tempo: 120,
    style: 'Swing / Bossa',
    category: 'Medium',
    mastery: 'Learning',
    sections: createSectionsSimple({
      "A": ["Am7", "Dm7", "G7", "Cmaj7", "Fmaj7", "Bm7b5", "E7alt", "Am7 A7"],
      "B": ["Dm7", "G7", "Cmaj7", "Am7", "Dm7", "G7", "Cmaj7", "Bm7b5 E7"]
    }),
    variants: [
      {
        name: 'Basic Changes',
        description: 'Simplified diatonic chords.',
        sections: createSectionsSimple({
          "A": ["Am7", "Dm7", "G7", "Cmaj7", "Fmaj7", "Dm7", "G7", "Cmaj7"],
          "B": ["Dm7", "G7", "Cmaj7", "Am7", "Dm7", "G7", "Cmaj7", "Cmaj7"]
        })
      }
    ],
    patterns: [],
    practiceTools: {
      recommendedLoops: [{ name: "Diatonic Cycle", bars: [1, 5], focus: "Walking through the key of C" }],
      soloingTips: ["Great for practicing standard ii-V-I resolutions."]
    }
  },
  {
    id: 'take-the-a-train',
    title: 'Take The A Train',
    composer: 'Billy Strayhorn',
    year: 1939,
    key: 'C major',
    form: 'AABA (32 bars)',
    tempo: 160,
    style: 'Swing',
    category: 'Medium',
    mastery: 'Familiar',
    sections: createSectionsSimple({
      "A1": ["Cmaj7", "Cmaj7", "D7b5", "D7b5", "Dm7", "G7", "Cmaj7", "Dm7 G7"],
      "A2": ["Cmaj7", "Cmaj7", "D7b5", "D7b5", "Dm7", "G7", "Cmaj7", "C7"],
      "B": ["Fmaj7", "Fmaj7", "Fmaj7", "Fmaj7", "D7", "D7", "Dm7", "G7"],
      "A3": ["Cmaj7", "Cmaj7", "D7b5", "D7b5", "Dm7", "G7", "Cmaj7", "G7alt"]
    }),
    variants: [
      {
        name: 'Basic Changes',
        description: 'Standard diatonic ii-V-I progressions.',
        sections: createSectionsSimple({
          "A": ["Cmaj7", "Cmaj7", "Dm7", "G7", "Cmaj7", "Cmaj7", "Dm7", "G7"],
          "B": ["Fmaj7", "Fmaj7", "Fmaj7", "Fmaj7", "D7", "D7", "G7", "G7"]
        })
      }
    ],
    patterns: [],
    practiceTools: {
      recommendedLoops: [{ name: "Whole Tone Zone", bars: [3, 4], focus: "D Whole Tone over D7b5" }]
    }
  },
  {
    id: 'satin-doll',
    title: 'Satin Doll',
    composer: 'Duke Ellington',
    year: 1953,
    key: 'C major',
    form: 'AABA (32 bars)',
    tempo: 110,
    category: 'Medium',
    mastery: 'Learning',
    sections: createSectionsSimple({
      "A": ["Dm7 G7", "Dm7 G7", "Em7 A7", "Em7 A7", "Am7 D7", "Abm7 Db7", "Cmaj7", "Dm7 G7"],
      "B": ["Gm7 C7", "Gm7 C7", "Fmaj7", "Fmaj7", "Am7 D7", "Am7 D7", "G7", "G7"]
    }),
    variants: [
      {
        name: 'Basic Changes',
        description: 'Simplified ii-V chains.',
        sections: createSectionsSimple({
          "A": ["Dm7 G7", "Dm7 G7", "Em7 A7", "Em7 A7", "Dm7 G7", "Cmaj7", "Cmaj7", "Dm7 G7"],
          "B": ["Gm7 C7", "Gm7 C7", "Fmaj7", "Fmaj7", "Dm7 G7", "Dm7 G7", "Cmaj7", "Cmaj7"]
        })
      }
    ],
    patterns: [],
    practiceTools: {
      soloingTips: ["Tune consists almost entirely of 'ii-V' chains."]
    }
  },
  {
    id: 'girl-ipanema',
    title: 'The Girl From Ipanema',
    composer: 'Antonio Carlos Jobim',
    year: 1962,
    key: 'F major',
    form: 'AABA (40 bars)',
    tempo: 130,
    style: 'Bossa Nova',
    category: 'Latin',
    mastery: 'Learning',
    // Fix: Wrap createSectionDetailed in an array as `sections` expects `Section[]`
    sections: [createSectionDetailed("gfi-a", "A", [
      { chord: "Fmaj7" }, { chord: "Fmaj7" }, { chord: "G7" }, { chord: "G7" }, 
      { chord: "Gm7" }, { chord: "Gb7" }, { chord: "Fmaj7" }, { chord: "Gb7" }, 
      { chord: "Gbmaj7" }, { chord: "Gbmaj7" }, { chord: "B7" }, { chord: "B7" }, 
      { chord: "F#m7" }, { chord: "F#m7" }, { chord: "D7" }, { chord: "D7" }, 
      { chord: "Gm7" }, { chord: "Gm7" }, { chord: "Eb7" }, { chord: "Eb7" }, 
      { chord: "Am7" }, { chord: "D7alt" }, { chord: "Gm7" }, { chord: "C7alt" }
    ])],
    variants: [
      {
        name: 'Basic Changes',
        description: 'Simplified harmonic rhythm.',
        sections: createSectionsSimple({
          "A": ["Fmaj7", "Fmaj7", "Gm7", "C7", "Gm7", "C7", "Fmaj7", "Fmaj7"],
          "B": ["Gbmaj7", "B7", "F#m7", "B7", "Gm7", "C7", "Fmaj7", "C7"]
        })
      }
    ],
    patterns: [],
    practiceTools: {
      recommendedLoops: [{ name: "The Bridge", bars: [17, 32], focus: "Complex modulations in major 3rds" }]
    }
  },
  {
    id: 'summertime',
    title: 'Summertime',
    composer: 'George Gershwin',
    year: 1934,
    key: 'A minor',
    form: 'AB (16 bars)',
    tempo: 90,
    category: 'Ballad',
    mastery: 'Familiar',
    sections: createSectionsSimple({
      "A": ["Am7", "Bm7 E7alt", "Am7", "Am7", "Dm7", "Dm7", "Bm7b5", "E7alt"],
      "B": ["Am7", "Bm7 E7alt", "Cmaj7", "D7", "Am7", "Bm7 E7alt", "Am7", "Bm7 E7alt"]
    }),
    variants: [
      {
        name: 'Basic Changes',
        description: 'Simplified minor harmony.',
        sections: createSectionsSimple({
          "A": ["Am", "Dm", "Am", "Am", "Dm", "Dm", "Am", "E7"],
          "B": ["Am", "Dm", "Am", "E7", "Am", "Dm", "Am", "E7"]
        })
      }
    ],
    patterns: [],
    practiceTools: {
      soloingTips: ["Use A Minor Blues for a soulful, classic feel."]
    }
  },
  {
    id: 'black-orpheus',
    title: 'Black Orpheus',
    composer: 'Luiz Bonfá',
    year: 1959,
    key: 'A minor',
    form: 'AAB (32 bars)',
    tempo: 140,
    style: 'Bossa Nova',
    category: 'Latin',
    mastery: 'Learning',
    sections: createSectionsSimple({
      "A": ["Am7", "Bm7b5 E7alt", "Am7", "Bm7b5 E7alt", "Dm7", "G7", "Cmaj7", "Fmaj7"],
      "B": ["Bm7b5", "E7alt", "Am7", "Am7", "Bm7b5", "E7alt", "Am7", "Bm7b5 E7alt"]
    }),
    variants: [
      {
        name: 'Basic Changes',
        description: 'Simplified minor ii-V-i.',
        sections: createSectionsSimple({
          "A": ["Am7", "E7", "Am7", "E7", "Dm7", "G7", "Cmaj7", "Fmaj7"],
          "B": ["Dm7", "G7", "Cmaj7", "Am7", "Dm7", "G7", "Cmaj7", "E7"]
        })
      }
    ],
    patterns: [],
    practiceTools: {
      soloingTips: ["Focus on the minor ii-V-i resolutions."]
    }
  },
  {
    id: 'blues-alice',
    title: 'Blues For Alice',
    composer: 'Charlie Parker',
    year: 1951,
    key: 'F',
    form: '12-bar Bird Blues',
    tempo: 180,
    style: 'Bebop',
    category: 'Blues',
    mastery: 'Learning',
    sections: createSectionsSimple({
      "Chorus": ["Fmaj7", "Em7b5 A7", "Dm7 G7", "Cm7 F7", "Bb7", "Bbm7 Eb7", "Am7 D7", "Abm7 Db7", "Gm7", "C7", "Fmaj7 D7", "Gm7 C7"]
    }),
    variants: [
      {
        name: 'Basic 12-Bar',
        description: 'Standard F blues for beginner practice.',
        sections: createSectionsSimple({
          "Chorus": ["F7", "Bb7", "F7", "F7", "Bb7", "Bb7", "F7", "D7", "Gm7", "C7", "F7", "C7"]
        })
      }
    ],
    patterns: [],
    practiceTools: {
      recommendedLoops: [{ name: "Bebop Descent", bars: [2, 5], focus: "Em7b5-A7-Dm7-G7-Cm7-F7" }]
    }
  },
  {
    id: 'tenor-madness',
    title: 'Tenor Madness',
    composer: 'Sonny Rollins',
    year: 1956,
    key: 'Bb',
    form: '12-bar blues',
    tempo: 220,
    category: 'Blues',
    mastery: 'Solid',
    sections: createSectionsSimple({
      "chorus": ["Bb7", "Eb7", "Bb7", "Fm7 Bb7", "Eb7", "Edim7", "Bb7", "Gm7 C7", "Cm7", "F7", "Bb7 G7", "Cm7 F7"]
    }),
    variants: [
      { 
        name: 'Basic Blues', 
        description: 'Standard 1-4-5 Bb blues changes',
        sections: createSectionsSimple({
          "Chorus": ["Bb7", "Eb7", "Bb7", "Bb7", "Eb7", "Eb7", "Bb7", "Bb7", "F7", "Eb7", "Bb7", "F7"]
        })
      }
    ],
    patterns: [],
    practiceTools: {
      soloingTips: ["Bb Blues scale vs Bb Mixolydian."]
    }
  }
];