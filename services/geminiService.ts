
import { GoogleGenAI, Type } from "@google/genai";

let ai: GoogleGenAI | null = null;
try {
    if (process.env.API_KEY) {
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
} catch (e) {
    console.error("Gemini Service Initialization Error:", e);
}

export interface GeminiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const handleGeminiError = (error: any): string => {
  console.error("Gemini API Error:", error);
  const msg = (error?.message || '').toLowerCase();
  if (msg.includes('safety')) return "Response blocked by safety filters. Please try different inputs.";
  if (msg.includes('quota')) return "The Sanctuary is busy. Please try again in a moment.";
  return "Connection to the Sanctuary failed. Please check your internet.";
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

const generateData = async (systemPrompt: string, userPrompt: string, model: string = "gemini-3-flash-preview", useThinking: boolean = false) => {
    if (!ai) return { success: false, error: "API Key missing." };
    try {
        const config: any = {
            responseMimeType: "application/json",
            temperature: 0.7,
            systemInstruction: systemPrompt
        };
        if (useThinking) {
            config.thinkingConfig = { thinkingBudget: 4000 };
        }
        const response = await ai.models.generateContent({
            model: model,
            contents: userPrompt,
            config: config
        });
        const text = response.text;
        if (!text) throw new Error("Empty response");
        return { success: true, data: safeParseJSON(text) };
    } catch (error) {
        return { success: false, error: handleGeminiError(error) };
    }
};

export const generateIkigaiInsight = async (love: string, goodAt: string, worldNeeds: string, paidFor: string) => {
    const systemPrompt = `You are an Ikigai Master. Analyze the 4 pillars to find the user's true purpose intersection. 
    Return JSON: { "title": "Archetypal Title", "insight": "Deep synthesis", "careers": [], "strengths": [], "weaknesses": [], "learningPath": [], "actionableStep": "Step" }`;
    const prompt = `1. Love: ${love}\n2. Good At: ${goodAt}\n3. World Needs: ${worldNeeds}\n4. Paid For: ${paidFor}`;
    return generateData(systemPrompt, prompt);
};

export const analyzePersonality = async (quizAnswers: string, selfDescription: string) => {
    const systemPrompt = `You are a Jungian Analyst. Determine the user's psychological Archetype.
    Return JSON: { "archetype": "Name", "tagline": "Quote", "description": "Analysis", "strengths": [], "shadowSide": [], "growthKey": "Advice" }`;
    return generateData(systemPrompt, `Quiz: ${quizAnswers}. Self-Report: ${selfDescription}.`);
};

export const analyzeTemperament = async (quizAnswers: string, energyDescription: string) => {
    const systemPrompt = `You are an Energy Coach. Analyze temperament.
    Return JSON: { "temperament": "Type", "element": "Element", "description": "Analysis", "strengths": [], "stressTriggers": [], "rechargeStrategy": "Advice" }`;
    return generateData(systemPrompt, `Quiz: ${quizAnswers}. Energy: ${energyDescription}.`);
};

export const generateLifeSynthesis = async (data: any) => {
    const systemPrompt = `You are a Holistic Life Strategist. Synthesize Archetype + Temperament + Ikigai into a MASTER roadmap.
    Return JSON: { 
      "mantra": "Affirmation", 
      "strengthAnalysis": "Synthesis", 
      "weaknessAnalysis": "Pitfalls",
      "interactionDepth": "Synergy", 
      "careerPath": "Direction", 
      "roadmap": [
        { "phase": "Immediate", "goal": "Goal", "actions": [] },
        { "phase": "Intermediate", "goal": "Goal", "actions": [] },
        { "phase": "Long Term", "goal": "Goal", "actions": [] }
      ]
    }`;
    const userPrompt = `Archetype: ${data.archetype?.archetype}, Temperament: ${data.temperament?.temperament}, Ikigai: ${data.ikigai?.title}. Context: Age ${data.age}, Principles: ${data.principles}.`;
    return generateData(systemPrompt, userPrompt, "gemini-3-pro-preview", true);
};

export const getDailyOracleReflection = async (userData: any) => {
    const systemPrompt = `You are the Sanctuary Oracle. Provide a short, poetic daily reflection and a "Daily Rite" (actionable ritual).
    Return JSON: { "quote": "Reflection", "focus": "Theme", "affirmation": "Personal affirmation", "dailyRite": "A specific, small action to perform today" }`;
    return generateData(systemPrompt, `User Profile: ${JSON.stringify(userData)}`);
};

export const consultTheMirror = async (userMessage: string, profile: any) => {
    const systemPrompt = `You are "The Mirror," an AI designed to reflect the user's inner truth back to them. 
    Use the user's profile (Archetype: ${profile.archetype?.archetype}, Temperament: ${profile.temperament?.temperament}, Ikigai: ${profile.ikigai?.title}) to respond to their life questions. 
    Be supportive, analytical, and slightly mystical. 
    Return JSON: { "response": "The reflection/advice", "reflectionQuestion": "A question for the user to ponder" }`;
    return generateData(systemPrompt, `User Message: ${userMessage}`);
};

export const generateShadowWork = async (profile: any) => {
    const systemPrompt = `You are a Shadow Work Guide. Based on the user's profile, identify their most challenging traits and provide integration exercises.
    Return JSON: { "shadowTraits": ["Trait 1", "Trait 2"], "theMirrorExercise": "Description", "journalPrompts": ["Prompt 1", "Prompt 2"], "integrationMantra": "Mantra" }`;
    return generateData(systemPrompt, `Profile: ${JSON.stringify(profile)}`);
};

export const generateNickname = async (context: string): Promise<string> => {
    const res = await generateData(`Generate 1 mystical nickname. Return JSON: { "nickname": "The Name" }`, `Context: ${context}`);
    return (res.success && res.data?.nickname) ? res.data.nickname : "The Seeker";
};
