
export type PatternType = 'ii-V-I' | 'turnaround' | 'rhythm-changes' | 'tritone-sub' | 'minor-ii-V-i' | 'custom';
export type Transposition = 'C' | 'Bb' | 'Eb';

export interface Chord {
  symbol: string;
  duration: number; // in beats
  roman?: string;
  note?: string;
}

export interface Section {
  id: string;
  name: string; // A, B, Bridge, etc.
  chords: Chord[];
}

export interface Pattern {
  id: string;
  type: PatternType;
  key: string;
  startBeat: number;
  endBeat: number;
  chords: string[];
}

export interface Variant {
  name: string;
  description?: string;
  sections: Section[];
}

export interface PracticeTools {
  iiVChains?: { bars: number[]; targetKey: string; quality?: string }[];
  recommendedLoops?: { name: string; bars: number[]; focus: string }[];
  soloingTips?: string[];
}

export interface Tune {
  id: string;
  title: string;
  composer: string;
  year?: number;
  key: string;
  form: string;
  tempo: number | string;
  style?: string;
  realBookPage?: string;
  sections: Section[]; 
  variants: Variant[];
  patterns: Pattern[];
  practiceTools?: PracticeTools;
  category: 'Medium' | 'Latin' | 'Blues' | 'Rhythm Changes' | '3/4' | 'Ballad' | 'Modal/Blues';
  mastery: 'Learning' | 'Familiar' | 'Solid' | 'Owned';
}

export interface Vocabulary {
  id: string;
  artist: string;
  source: string;
  patternType: PatternType;
  notation: string;
  key: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  tags: string[];
}

export interface PracticeSession {
  id: string;
  date: string;
  duration: number; // total minutes
  toneTime: number;
  techniqueTime: number;
  tunesTime: number;
  transcriptionsTime: number;
  notes: string;
}

export enum AppMode {
  PRACTICE = 'PRACTICE',
  STUDY = 'STUDY',
  LOG = 'LOG',
  LIBRARY = 'LIBRARY'
}

export enum Pillar {
  TONE = 'Tone',
  TECHNIQUE = 'Technique',
  TUNES = 'Tunes',
  TRANSCRIPTIONS = 'Transcriptions'
}
