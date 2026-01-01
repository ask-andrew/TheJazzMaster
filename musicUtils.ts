
import { Transposition, Pattern, Chord, PatternType, Tune } from './types.ts';

const notes = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

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

function normalizeNote(note: string): string {
  const map: Record<string, string> = { 'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb' };
  return map[note] || note;
}

export function getRootNote(symbol: string): string {
  const match = symbol.match(/^([A-G][b#]?)/);
  return match ? normalizeNote(match[1]) : '';
}

export function getRecommendedScale(symbol: string): string {
  const s = symbol.toLowerCase();
  const root = getRootNote(symbol);
  
  if (s.includes('m7b5')) return `${root} Locrian ♮2`;
  if (s.includes('7alt')) return `${root} Altered`;
  if (s.includes('maj7')) return `${root} Lydian / Major`;
  if (s.includes('m7')) return `${root} Dorian`;
  if (s.includes('7')) return `${root} Mixolydian`;
  if (s.includes('m')) return `${root} Melodic Minor`;
  return `${root} Major`;
}

/**
 * Returns a map of scale names found in the tune and their first occurrence measure.
 */
export function getRequiredScales(tune: Tune): Map<string, string> {
  const scaleMap = new Map<string, string>();
  let currentMeasure = 1;
  let beatCount = 0;

  tune.sections.forEach(section => {
    section.chords.forEach(chord => {
      const s = chord.symbol.toLowerCase();
      let scaleType = 'Ionian (Major)';
      
      if (s.includes('m7b5')) scaleType = 'Locrian ♮2';
      else if (s.includes('7alt') || s.includes('alt')) scaleType = 'Altered';
      else if (s.includes('maj7')) scaleType = 'Lydian';
      else if (s.includes('m7')) scaleType = 'Dorian';
      else if (s.includes('7')) scaleType = 'Mixolydian';
      else if (s.includes('m')) scaleType = 'Melodic Minor';

      if (!scaleMap.has(scaleType)) {
        scaleMap.set(scaleType, `First seen in ${section.name} (Meas. ${currentMeasure})`);
      }

      beatCount += chord.duration;
      if (beatCount >= 4) {
        currentMeasure += Math.floor(beatCount / 4);
        beatCount = beatCount % 4;
      }
    });
  });

  return scaleMap;
}

export function getScalePath(type: PatternType): string {
  switch(type) {
    case 'ii-V-I': return 'Dorian → Mixolydian → Ionian';
    case 'minor-ii-V-i': return 'Locrian ♮2 → Altered → Melodic m';
    case 'turnaround': return 'I → VI (Dom) → ii → V';
    default: return '';
  }
}

export function getGuideTones(symbol: string): { third: string, seventh: string } {
  const root = getRootNote(symbol);
  const rootIdx = notes.indexOf(root);
  const s = symbol.toLowerCase();
  
  const isMinor = s.includes('m') && !s.includes('maj');
  const isMaj7 = s.includes('maj7');
  const isDom7 = s.includes('7') && !s.includes('maj');

  const thirdIdx = (rootIdx + (isMinor ? 3 : 4)) % 12;
  const seventhIdx = (rootIdx + (isMaj7 ? 11 : (isDom7 || isMinor ? 10 : 11))) % 12;

  return {
    third: notes[thirdIdx],
    seventh: notes[seventhIdx]
  };
}

function getSemitoneDistance(rootA: string, rootB: string): number {
  const idxA = notes.indexOf(rootA);
  const idxB = notes.indexOf(rootB);
  if (idxA === -1 || idxB === -1) return -1;
  return (idxB - idxA + 12) % 12;
}

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
