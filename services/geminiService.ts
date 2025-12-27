
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
    const systemPrompt = `You are a concise Growth Coach. Analyze progress. 
    Return JSON: {
      "growthSummary": "1 short sentence of practical insight.",
      "achievementScore": 0-100,
      "lessonLearned": "One short tip.",
      "celebration": "A 5-word positive note."
    }`;
    return generateData(systemPrompt, `User Report: "${userReport}", Energy: ${energy}/5`);
};

export const consultTheMirror = async (userMessage: string, profile: any) => {
    const systemPrompt = `You are a concise AI Guide. Reflect the user's words.
    Return JSON: { 
      "reflection": "One sentence summary.", 
      "question": "One simple, short question." 
    }`;
    return generateData(systemPrompt, userMessage);
};

export const generateDailyBlueprint = async (profile: any) => {
    const systemPrompt = `You are a Personal Assistant. Plan 3 simple tasks. Keep descriptions under 10 words.
    Return JSON: { 
      "theme": "Short title",
      "objective": "Short goal",
      "morning": { "task": "Task", "why": "Short benefit" },
      "afternoon": { "task": "Task", "why": "Short benefit" },
      "evening": { "task": "Task", "why": "Short benefit" },
      "affirmation": "Short positive phrase."
    }`;
    return generateData(systemPrompt, `Profile context: ${JSON.stringify(profile)}`);
};

export const generateDailyAffirmation = async (profile: any) => {
    const systemPrompt = `Generate 1 short, powerful daily affirmation. Max 10 words.
    Return JSON: { "affirmation": "Text", "context": "3-word explanation." }`;
    return generateData(systemPrompt, `Profile context: ${JSON.stringify(profile)}`);
};

export const generateIkigaiInsight = async (love: string, goodAt: string, worldNeeds: string, paidFor: string) => {
    const systemPrompt = `You are a Purpose Coach. BE EXTREMELY CONCISE.
    REQUIRED SCHEMA:
    {
      "title": "Path Name",
      "summary": "ONE punchy sentence.",
      "description": "Max 60 words analysis.",
      "strengths": ["3 short bullets"],
      "weaknesses": ["2 short points"],
      "careerAlignment": ["3 roles"],
      "immediateAction": "One clear first step.",
      "wayForward": ["3-step roadmap"]
    }`;
    return generateData(systemPrompt, `Love: ${love}, Good At: ${goodAt}, Needs: ${worldNeeds}, Paid: ${paidFor}`);
};

export const analyzePersonality = async (quizAnswers: string, selfDescription: string) => {
    const systemPrompt = `You are a Behavioral Psychologist. Analyze personality quiz results. 
    KEEP IT CONCISE AND PUNCHY.
    REQUIRED SCHEMA:
    {
      "title": "Archetype Name",
      "tagline": "A short catchphrase",
      "summary": "ONE powerful sentence.",
      "description": "Max 60 words deep dive.",
      "strengths": ["4 short superpowers"],
      "weaknesses": ["3 short blind spots"],
      "socialDynamics": "One sentence interaction style.",
      "stressManagement": "One specific short technique.",
      "careerAlignment": "One sentence description.",
      "wayForward": "Actionable advice in one sentence."
    }`;
    return generateData(systemPrompt, quizAnswers);
};

export const analyzeTemperament = async (quizAnswers: string, energyDescription: string) => {
    const systemPrompt = `You are an Energy Coach. Define temperament. 
    NO FLUFF.
    REQUIRED SCHEMA:
    {
      "title": "Temperament Name",
      "tagline": "Short description",
      "summary": "ONE sentence energy baseline.",
      "description": "Max 60 words focused deep dive.",
      "strengths": ["3 advantages"],
      "weaknesses": ["2 traps"],
      "productivityHack": "One short system.",
      "idealEnvironment": "One short description.",
      "socialInteraction": "One sentence recharge.",
      "wayForward": "Short routine suggestion."
    }`;
    return generateData(systemPrompt, quizAnswers);
};

export const generateLifeSynthesis = async (data: any) => {
    const systemPrompt = `You are a Strategic Architect. Synthesize into a Master Life Strategy.
    PUNCHY AND ACTION-ORIENTED.
    REQUIRED SCHEMA:
    {
      "title": "The Strategic Legacy",
      "mantra": "A short guiding principle",
      "summary": "ONE sentence identity.",
      "description": "Max 80 words holistic summary.",
      "strengths": ["4 major advantages"],
      "weaknesses": ["3 pitfalls"],
      "topPriority": "Single short goal.",
      "secondaryGoals": ["2 supporting objectives"],
      "wayForward": ["4-stage short roadmap"]
    }`;
    return generateData(systemPrompt, JSON.stringify(data), "gemini-3-pro-preview");
};

export const generateShadowWork = async (profile: any) => {
    const systemPrompt = `You are a Depth Psychology Guide. Uncover the 'Shadow'.
    BRIEF AND HIGH IMPACT.
    REQUIRED SCHEMA:
    {
      "title": "Shadow Archetype",
      "tagline": "Short description",
      "summary": "ONE sentence about repression.",
      "description": "Max 60 words analysis.",
      "strengths": ["2 hidden talents"],
      "weaknesses": ["2 repressive habits"],
      "integrationExercise": "One specific short exercise.",
      "wayForward": "Short path to acceptance."
    }`;
    return generateData(systemPrompt, JSON.stringify(profile));
};

export const generateNickname = async (context: string): Promise<string> => {
    const res = await generateData(`Generate 1 simple, short nickname. JSON: { "nickname": "Name" }`, context);
    return (res.success && res.data?.nickname) ? res.data.nickname : "Seeker";
};
