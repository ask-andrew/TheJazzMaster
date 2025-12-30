
export type PatternType = 'ii-V-I' | 'turnaround' | 'rhythm-changes' | 'tritone-sub' | 'minor-ii-V-i' | 'custom';
export type Transposition = 'C' | 'Bb' | 'Eb';

export interface Chord {
  symbol: string;
  duration: number; // in beats
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
  sections: Section[];
}

export interface Tune {
  id: string;
  title: string;
  composer: string;
  key: string;
  form: string;
  tempo: number;
  sections: Section[]; // Current active sections
  variants: Variant[]; // Collection of available harmonic paths
  patterns: Pattern[];
  year: 1 | 2;
  category: 'Medium' | 'Latin' | 'Blues' | 'Rhythm Changes' | '3/4' | 'Ballad';
  style?: string;
  mastery: 'Learning' | 'Familiar' | 'Solid' | 'Owned';
  soloingTips?: string[];
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
