
import { GoogleGenAI, Type } from "@google/genai";
import { Tune, Transposition } from "./types.ts";

/**
 * Gemini service powering 'The Shed Oracle'.
 * Using the latest Gemini 3 Flash model for low-latency, pedagogical jazz insights.
 */

const EFFICIENT_MODEL = "gemini-3-flash-preview";

export async function getPracticeSuggestions(tune: Tune, transposition: Transposition) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const transpositionLogic = transposition === 'Bb' 
      ? "Up 2 semitones (Concert C = Your D)" 
      : transposition === 'Eb' 
      ? "Up 9 semitones or Down 3 semitones (Concert C = Your A)" 
      : "Concert Pitch (No change)";

    const response = await ai.models.generateContent({
      model: EFFICIENT_MODEL,
      contents: `You are 'The Shed Oracle', a veteran jazz educator. 
      The student is practicing "${tune.title}" (Concert Key: ${tune.key}) on a ${transposition} instrument.
      
      TRANSPOSITION RULES: 
      All chord/note names MUST be transposed for the student's ${transposition} instrument.
      Logic: ${transpositionLogic}.
      
      Pedagogy:
      - Identify the 3rd or 7th of the ${transposition} chords as target tones.
      - Provide a "Shed Idea" about how to bridge these specific changes.
      - Keep it brief, grizzled, and encouraging.

      Provide the response in JSON format.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            strategy: { type: Type.STRING, description: "Strategy using transposed chord names" },
            drill: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ["title", "description"]
            }
          },
          required: ["strategy", "drill"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Oracle error:", error);
    return null;
  }
}

export async function analyzePracticeBalance(sessions: any[]) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const sessionSummary = JSON.stringify(sessions.slice(-7));
    const response = await ai.models.generateContent({
      model: EFFICIENT_MODEL,
      contents: `You are 'The Shed Oracle'. Analyze this musician's weekly practice log.
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
    return null;
  }
}
