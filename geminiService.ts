
import { GoogleGenAI, Type } from "@google/genai";
import { Tune, Vocabulary, Transposition } from "./types";

/**
 * Gemini service powering 'The Shed Oracle'.
 * Strictly transposition-aware logic for jazz pedagogy.
 */

export async function getPracticeSuggestions(tune: Tune, transposition: Transposition) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const transpositionLogic = transposition === 'Bb' 
      ? "Up 2 semitones (Concert C = Your D)" 
      : transposition === 'Eb' 
      ? "Up 9 semitones or Down 3 semitones (Concert C = Your A)" 
      : "Concert Pitch (No change)";

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `You are 'The Shed Oracle', a world-class jazz educator.
      The student is practicing "${tune.title}" (Concert Key: ${tune.key}) on a ${transposition} instrument.
      
      CRITICAL MATH INSTRUCTION: 
      You must transpose ALL musical references. 
      Logic: ${transpositionLogic}.
      
      If you mention a chord or a specific note, it MUST be the note the student sees on their page. 
      Example: If the tune has a Concert Cm7 and they are on Bb Tenor, you MUST call it Dm7.
      Example: If the tune has a Concert Bbmaj7 and they are on Eb Alto, you MUST call it Gmaj7.

      Incorporate:
      1. Target Tones: Identify the 3rd or 7th of the current ${transposition} chords.
      2. The "Shed" Philosophy: Use encouraging but firm veteran language.
      3. Linear Logic: How to connect the ${transposition} scales smoothly.

      Provide exactly one focused 'Shed Idea' in JSON format.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            strategy: { type: Type.STRING, description: "Detailed strategy using transposed chord names" },
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
      model: "gemini-3-flash-preview",
      contents: `You are 'The Shed Oracle'. Analyze this musician's weekly practice log.
      Session Data: ${sessionSummary}.
      Identify if they are neglecting 'Deep Shedding' or 'Long Tones'.
      Provide constructive advice.`,
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
