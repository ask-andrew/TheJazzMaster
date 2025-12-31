
import { Transposition, Pattern, Chord, PatternType } from './types.ts';

const notes = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

/**
 * Formats musical strings for display (e.g., Bb7 -> B♭7, F#m -> F♯m)
 */
export function formatMusical(text: string | undefined): string {
  if (!text) return '';
  return text
    .replace(/([A-G1-9])b/g, '$1♭')
    .replace(/([A-G1-9])#/g, '$1♯');
}

export function transposeChord(chordSymbol: string, to: Transposition): string {
  if (to === 'C' || !chordSymbol) return chordSymbol;
  const match = chordSymbol.match(/^([A-G][b#]?)(.*)$/);
  if (!match) return chordSymbol;
  const root = match[1];
  const extension = match[2];
  let semitones = 0;
  if (to === 'Bb') semitones = 2;
  if (to === 'Eb') semitones = 9;
  const rootIndex = notes.indexOf(normalizeNote(root));
  if (rootIndex === -1) return chordSymbol;
  const newIndex = (rootIndex + semitones) % 12;
  return notes[newIndex] + extension;
}

export function normalizeNote(note: string): string {
  const map: Record<string, string> = { 'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb' };
  return map[note] || note;
}

export function getRootNote(symbol: string): string {
  const match = symbol.match(/^([A-G][b#]?)/);
  return match ? normalizeNote(match[1]) : '';
}

function getSemitoneDistance(rootA: string, rootB: string): number {
  const idxA = notes.indexOf(rootA);
  const idxB = notes.indexOf(rootB);
  if (idxA === -1 || idxB === -1) return -1;
  return (idxB - idxA + 12) % 12;
}

/**
 * Checks if a given key string indicates a minor key.
 * @param key The key string (e.g., "G minor", "Cm").
 * @returns True if the key is minor, false otherwise.
 */
export function isMinorKey(key: string): boolean {
  const lowerKey = key.toLowerCase();
  return lowerKey.includes('minor') || lowerKey.endsWith('m');
}

/**
 * Gets the root note of the V7 chord for a given minor key.
 * @param minorKeyRoot The root note of the minor key (concert pitch).
 * @returns The root note of the V7 chord (concert pitch).
 */
export function getV7RootForMinorKey(minorKeyRoot: string): string {
  const rootIndex = notes.indexOf(normalizeNote(minorKeyRoot));
  if (rootIndex === -1) return '';
  // V7 is 7 semitones up from the root (perfect fifth)
  const v7RootIndex = (rootIndex + 7) % 12;
  return notes[v7RootIndex];
}

/**
 * Gets the root note of the ii chord for a given major key.
 * @param majorKeyRoot The root note of the major key (concert pitch).
 * @returns The root note of the ii chord (concert pitch).
 */
export function getIiRootForMajorKey(majorKeyRoot: string): string {
  const rootIndex = notes.indexOf(normalizeNote(majorKeyRoot));
  if (rootIndex === -1) return '';
  // ii is 2 semitones up from the root (major second)
  const iiRootIndex = (rootIndex + 2) % 12;
  return notes[iiRootIndex];
}


/**
 * The "Rules Engine": Automatically identifies jazz harmonic patterns.
 */
export function analyzeHarmony(chords: Chord[]): Pattern[] {
  const patterns: Pattern[] = [];
  let currentBeat = 0;

  for (let i = 0; i < chords.length; i++) {
    const c1 = chords[i];
    const c2 = chords[i + 1];
    const c3 = chords[i + 2];

    if (!c1 || !c2) {
      if (c1) currentBeat += c1.duration;
      continue;
    }

    const r1 = getRootNote(c1.symbol);
    const r2 = getRootNote(c2.symbol);
    const s1 = c1.symbol.toLowerCase();
    const s2 = c2.symbol.toLowerCase();

    // Minor ii-V-i detection (m7b5 -> 7alt/7 -> m7/m)
    if (c3 && (s1.includes('m7b5') || s1.includes('dim'))) {
      const r3 = getRootNote(c3.symbol);
      const s3 = c3.symbol.toLowerCase();
      if (getSemitoneDistance(r1, r2) === 5 && getSemitoneDistance(r2, r3) === 5 && (s3.includes('m') || s3.includes('m7'))) {
        patterns.push({
          id: `auto-min-${i}`,
          type: 'minor-ii-V-i',
          key: r3,
          startBeat: currentBeat,
          endBeat: currentBeat + c1.duration + c2.duration + c3.duration,
          chords: [c1.symbol, c2.symbol, c3.symbol]
        });
        currentBeat += c1.duration;
        continue;
      }
    } 
    
    // Major ii-V-I detection (m7 -> 7 -> maj7/6/7)
    // Inclusive of dominant 7th resolutions for blues (e.g., Cm7 F7 -> Bb7)
    if (c3 && s1.includes('m7') && !s1.includes('b5') && (s2.endsWith('7') || s2.includes('alt'))) {
      const r3 = getRootNote(c3.symbol);
      const s3 = c3.symbol.toLowerCase();
      const isResolution = s3.includes('maj') || s3.includes('6') || (s3.endsWith('7') && !s3.includes('m7'));
      
      if (isResolution && getSemitoneDistance(r1, r2) === 5 && getSemitoneDistance(r2, r3) === 5) {
        patterns.push({
          id: `auto-maj-${i}`,
          type: 'ii-V-I',
          key: r3,
          startBeat: currentBeat,
          endBeat: currentBeat + c1.duration + c2.duration + c3.duration,
          chords: [c1.symbol, c2.symbol, c3.symbol]
        });
        currentBeat += c1.duration;
        continue;
      }
    }

    // Turnaround detection (m7 -> 7)
    // If not already part of a ii-V-I, mark it as a turnaround
    if (s1.includes('m7') && (s2.endsWith('7') || s2.includes('alt')) && getSemitoneDistance(r1, r2) === 5) {
      const alreadyPatterned = patterns.some(p => currentBeat >= p.startBeat && currentBeat < p.endBeat);
      if (!alreadyPatterned) {
        patterns.push({
          id: `auto-turn-${i}`,
          type: 'turnaround',
          key: r2,
          startBeat: currentBeat,
          endBeat: currentBeat + c1.duration + c2.duration,
          chords: [c1.symbol, c2.symbol]
        });
      }
    }

    currentBeat += c1.duration;
  }

  return patterns;
}

export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}
