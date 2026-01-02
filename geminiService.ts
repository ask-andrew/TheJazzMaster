

import { GoogleGenAI, Type } from "@google/genai";
import { Tune, Transposition } from "./types.ts";
import { transposeChord, getRootNote, getRecommendedScale, getGuideTones } from './musicUtils.ts';

/**
 * Gemini service powering 'The Shed Oracle'.
 * Using the latest Gemini 3 Flash model for low-latency, pedagogical jazz insights.
 */

const EFFICIENT_MODEL = "gemini-3-flash-preview";

export async function getPracticeSuggestions(tune: Tune, transposition: Transposition) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Dynamically generate strategy tips for the first few chords
    const chordTips = tune.sections[0].chords.slice(0, 4).map(chord => {
      const transposed = transposeChord(chord.symbol, transposition);
      const recommendedScale = getRecommendedScale(transposed);
      const guideTones = getGuideTones(transposed);
      return `For ${transposed}, consider ${recommendedScale}. Guide tones are ${guideTones.third} and ${guideTones.seventh}.`;
    }).join('\n');

    const response = await ai.models.generateContent({
      model: EFFICIENT_MODEL,
      contents: `You are 'The Shed Oracle', a grizzled, encouraging, veteran jazz educator. 
      The student is practicing "${tune.title}" (Concert Key: ${tune.key}) on a ${transposition} instrument.
      
      TRANSPOSITION RULES: 
      All chord/note names in your response MUST be transposed for the student's ${transposition} instrument.
      
      Contextual hints based on tune's start:
      ${chordTips}

      Pedagogy:
      - Provide a concise "Veteran's Wisdom" tip about approaching these changes, referencing the transposed chords.
      - Suggest a "Practice Focus" with a clear title and a short description.
      - Keep it brief, authentic to a veteran jazz player, and motivating.

      Provide the response in JSON format.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            veteransWisdom: { type: Type.STRING, description: "A concise, grizzled tip using transposed chord names for the instrument." },
            practiceFocus: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "Short, engaging title for the practice focus." },
                description: { type: Type.STRING, description: "Brief description of the practice focus." }
              },
              required: ["title", "description"]
            }
          },
          required: ["veteransWisdom", "practiceFocus"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Oracle error:", error);
    // Return a default error response in the expected format
    return {
      veteransWisdom: "The Oracle is currently taking a coffee break. Try again later, kid.",
      practiceFocus: {
        title: "API Complications",
        description: "Looks like the cosmic jazz frequencies are a bit off right now. Focus on your scales for a bit, then come back."
      }
    };
  }
}

export async function analyzePracticeBalance(sessions: any[]) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const sessionSummary = JSON.stringify(sessions.slice(-7)); // Analyze last 7 sessions
    const response = await ai.models.generateContent({
      model: EFFICIENT_MODEL,
      contents: `You are 'The Shed Oracle', a veteran jazz educator. Analyze this musician's weekly practice log.
      Session Data: ${sessionSummary}.
      Identify if they are neglecting 'Deep Shedding' or 'Long Tones'.
      Provide exactly 3 coaching points in JSON format.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: { type: Type.STRING },
            coachingPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["analysis", "coachingPoints"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Oracle analysis error:", error);
    return {
      analysis: "Looks like the crystal ball is foggy, kid. Can't quite get a read on your practice patterns right now.",
      coachingPoints: [
        "Keep logging your sessions consistently.",
        "Ensure you're connected to the main grid.",
        "Sometimes the best analysis is your own ears – how does it feel?"
      ]
    };
  }
}
