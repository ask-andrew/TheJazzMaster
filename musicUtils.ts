
import { Transposition } from './types';

const notes = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

export function transposeChord(chordSymbol: string, to: Transposition): string {
  if (to === 'C') return chordSymbol;

  // Simplified regex for jazz chords: Root + rest
  const match = chordSymbol.match(/^([A-G][b#]?)(.*)$/);
  if (!match) return chordSymbol;

  const root = match[1];
  const extension = match[2];

  let semitones = 0;
  if (to === 'Bb') semitones = 2; // Tenor/Soprano: Concert C is their D
  if (to === 'Eb') semitones = 9; // Alto/Bari: Concert C is their A

  const rootIndex = notes.indexOf(normalizeNote(root));
  if (rootIndex === -1) return chordSymbol;

  const newIndex = (rootIndex + semitones) % 12;
  return notes[newIndex] + extension;
}

function normalizeNote(note: string): string {
  if (note === 'C#') return 'Db';
  if (note === 'D#') return 'Eb';
  if (note === 'F#') return 'Gb';
  if (note === 'G#') return 'Ab';
  if (note === 'A#') return 'Bb';
  return note;
}

export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}
