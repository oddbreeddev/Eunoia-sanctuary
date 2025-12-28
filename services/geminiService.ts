
import { GoogleGenAI, Type } from "@google/genai";

export interface GeminiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const handleGeminiError = (error: any): string => {
  console.error("Gemini API Error:", error);
  const msg = (error?.message || '').toLowerCase();
  if (msg.includes('safety')) return "Response blocked. Please try simpler inputs.";
  if (msg.includes('quota')) return "The system is busy. Please try again soon.";
  return "Connection failed. Please check your internet.";
};

const safeParseJSON = (text: string) => {
    try {
        return JSON.parse(text);
    } catch (e) {
        let clean = text.replace(/```json/gi, '').replace(/```/g, '').trim();
        const first = clean.indexOf('{');
        const last = clean.lastIndexOf('}');
        if (first !== -1 && last !== -1) {
            clean = clean.substring(first, last + 1);
            try {
                return JSON.parse(clean);
            } catch (inner) {}
        }
        throw new Error("Response was malformed.");
    }
};

const generateData = async (systemPrompt: string, userPrompt: string, model: string = "gemini-3-flash-preview") => {
    if (!process.env.API_KEY) {
        return { success: false, error: "System not ready. API Key is missing." };
    }
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: userPrompt,
            config: {
                responseMimeType: "application/json",
                temperature: 0.7,
                systemInstruction: systemPrompt
            }
        });
        
        const text = response.text;
        if (!text) throw new Error("Empty response");
        return { success: true, data: safeParseJSON(text) };
    } catch (error) {
        return { success: false, error: handleGeminiError(error) };
    }
};

export const analyzeDailyGrowth = async (profile: any, blueprint: any, userReport: string, energy: number) => {
    const systemPrompt = `You are a minimalist Growth Coach. 
    Return JSON: {
      "growthSummary": "One punchy sentence of insight.",
      "achievementScore": 0-100,
      "lessonLearned": "One short tip (max 10 words).",
      "celebration": "3-word positive note."
    }`;
    return generateData(systemPrompt, `User Report: "${userReport}", Energy: ${energy}/5`);
};

export const consultTheMirror = async (userMessage: string, profile: any) => {
    const systemPrompt = `You are a concise AI Guide. 
    Return JSON: { 
      "reflection": "One short sentence reflecting the user's core emotion.", 
      "question": "One deep, 5-word question." 
    }`;
    return generateData(systemPrompt, userMessage);
};

export const generateDailyBlueprint = async (profile: any) => {
    const systemPrompt = `Plan 3 minimalist tasks.
    Return JSON: { 
      "theme": "2-word title",
      "objective": "Short goal",
      "morning": { "task": "Short task" },
      "afternoon": { "task": "Short task" },
      "evening": { "task": "Short task" },
      "affirmation": "Max 7 words."
    }`;
    return generateData(systemPrompt, `Profile context: ${JSON.stringify(profile)}`);
};

export const generateDailyAffirmation = async (profile: any) => {
    const systemPrompt = `Generate 1 powerful affirmation (max 8 words).
    Return JSON: { "affirmation": "Text" }`;
    return generateData(systemPrompt, `Profile context: ${JSON.stringify(profile)}`);
};

export const generateIkigaiInsight = async (love: string, goodAt: string, worldNeeds: string, paidFor: string) => {
    const systemPrompt = `You are a Purpose Coach. BE RUTHLESSLY CONCISE.
    REQUIRED SCHEMA:
    {
      "title": "Path Name",
      "summary": "One powerful 15-word sentence.",
      "description": "Max 30 words analysis.",
      "strengths": ["2 short bullets"],
      "careerAlignment": ["2 roles"],
      "immediateAction": "One clear first step."
    }`;
    return generateData(systemPrompt, `Love: ${love}, Good At: ${goodAt}, Needs: ${worldNeeds}, Paid: ${paidFor}`);
};

export const analyzePersonality = async (quizAnswers: string, selfDescription: string) => {
    const systemPrompt = `Analyze personality. KEEP IT PUNCHY.
    REQUIRED SCHEMA:
    {
      "title": "Archetype Name",
      "tagline": "Short catchphrase",
      "summary": "ONE sentence identity statement.",
      "description": "Max 40 words deep dive.",
      "strengths": ["3 primary superpowers"],
      "weaknesses": ["2 primary blind spots"],
      "wayForward": "Actionable advice in one short sentence."
    }`;
    return generateData(systemPrompt, quizAnswers);
};

export const analyzeTemperament = async (quizAnswers: string, energyDescription: string) => {
    const systemPrompt = `Define temperament. NO FLUFF.
    REQUIRED SCHEMA:
    {
      "title": "Temperament Name",
      "tagline": "Short description",
      "summary": "ONE sentence energy baseline.",
      "description": "Max 40 words focused deep dive.",
      "strengths": ["2 major advantages"],
      "weaknesses": ["2 major traps"],
      "productivityHack": "One short system (max 10 words).",
      "wayForward": "Short routine suggestion."
    }`;
    return generateData(systemPrompt, quizAnswers);
};

export const generateLifeSynthesis = async (data: any) => {
    const systemPrompt = `Synthesize into a Master Life Strategy. ACTION-ORIENTED.
    REQUIRED SCHEMA:
    {
      "title": "The Strategic Legacy",
      "mantra": "Short guiding principle",
      "summary": "ONE sentence core identity.",
      "description": "Max 50 words holistic summary.",
      "topPriority": "Single short goal.",
      "wayForward": ["3-stage short roadmap"]
    }`;
    return generateData(systemPrompt, JSON.stringify(data), "gemini-3-pro-preview");
};

export const generateShadowWork = async (profile: any) => {
    const systemPrompt = `Uncover the Shadow. BRIEF AND IMPACTFUL.
    REQUIRED SCHEMA:
    {
      "title": "Shadow Archetype",
      "summary": "ONE sentence about the hidden self.",
      "description": "Max 40 words analysis.",
      "strengths": ["2 hidden talents"],
      "integrationExercise": "One specific short exercise.",
      "wayForward": "Short path to acceptance."
    }`;
    return generateData(systemPrompt, JSON.stringify(profile));
};

export const generateNickname = async (context: string): Promise<string> => {
    const res = await generateData(`Generate 1 short, cool nickname. JSON: { "nickname": "Name" }`, context);
    return (res.success && res.data?.nickname) ? res.data.nickname : "Seeker";
};
