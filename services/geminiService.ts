
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
  if (msg.includes('key')) return "Sanctuary configuration missing. Admin must check the API environment.";
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
    if (!ai) {
        // Fallback initialization in case of environment delay
        if (process.env.API_KEY) {
            ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        } else {
            return { success: false, error: "Sanctuary not initialized." };
        }
    }
    try {
        const config: any = {
            responseMimeType: "application/json",
            temperature: 0.7,
            systemInstruction: systemPrompt
        };
        
        // Use optimized thinking budgets for production pro models
        if (useThinking) {
            const budget = model.includes('pro') ? 32000 : 24000;
            config.thinkingConfig = { thinkingBudget: budget };
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

export const analyzeDailyGrowth = async (profile: any, blueprint: any, userReport: string, energy: number) => {
    const systemPrompt = `You are a "Growth Psychologist." Analyze the user's progress today.
    
    Context:
    - Archetype: ${profile.archetype?.archetype || 'Seeker'}
    - Daily Blueprint was: "${blueprint?.theme || 'Standard Initiation'}"
    - User's Energy Level: ${energy}/5
    - User's Report: "${userReport}"

    Provide a summary that combines empathy with psychological precision.
    Return JSON: {
      "growthSummary": "2-3 sentences of deep psychological insight.",
      "achievementScore": 0-100 (number),
      "lessonLearned": "One profound lesson.",
      "celebration": "A short note"
    }`;
    return generateData(systemPrompt, `Synthesize today's cycle.`);
};

export const consultTheMirror = async (userMessage: string, profile: any) => {
    const systemPrompt = `You are "The Mirror," a Socratic AI. 
    User Profile: Archetype ${profile.archetype?.archetype || 'Unknown'}, Temperament ${profile.temperament?.temperament || 'Fluid'}.
    
    Rule: Never give generic advice. Reflect the user's statement back as a piercing question that reveals hidden motivations.
    
    Return JSON: { 
      "reflection": "Poetic reflection", 
      "question": "The piercing question" 
    }`;
    return generateData(systemPrompt, userMessage);
};

export const generateDailyBlueprint = async (profile: any) => {
    const systemPrompt = `You are a "Life Architect." Generate a daily blueprint based on their profile.
    Return JSON: { 
      "theme": "Title",
      "objective": "Goal",
      "morning": { "task": "Task", "why": "Reason", "action": "Action" },
      "afternoon": { "task": "Task", "why": "Reason", "action": "Action" },
      "evening": { "task": "Task", "why": "Reason", "action": "Action" },
      "mindsetShift": { "from": "Pitfall", "to": "Target" },
      "affirmation": "Mantra"
    }`;
    return generateData(systemPrompt, `Profile: ${JSON.stringify(profile)}`);
};

export const generateIkigaiInsight = async (love: string, goodAt: string, worldNeeds: string, paidFor: string) => {
    const systemPrompt = `You are an Ikigai Master. Return JSON: { "title": "Archetypal Title", "insight": "Deep synthesis", "careers": [], "skillsToDevelop": [], "learningPath": [], "actionableStep": "Step" }`;
    const prompt = `1. Love: ${love}\n2. Good At: ${goodAt}\n3. World Needs: ${worldNeeds}\n4. Paid For: ${paidFor}`;
    return generateData(systemPrompt, prompt);
};

export const analyzePersonality = async (quizAnswers: string, selfDescription: string) => {
    const systemPrompt = `You are a Jungian Analyst. Return JSON: { "archetype": "Name", "tagline": "Quote", "description": "Analysis", "strengths": [], "shadowSide": [], "growthKey": "Advice" }`;
    return generateData(systemPrompt, `Quiz Answers: ${quizAnswers}.`);
};

export const analyzeTemperament = async (quizAnswers: string, energyDescription: string) => {
    const systemPrompt = `You are an Energy Coach. Return JSON: { "temperament": "Type", "element": "Element", "description": "Analysis", "strengths": [], "stressTriggers": [], "rechargeStrategy": "Advice" }`;
    return generateData(systemPrompt, `Quiz Answers: ${quizAnswers}.`);
};

export const generateLifeSynthesis = async (data: any) => {
    const systemPrompt = `You are a Holistic Life Strategist. Analyze the interaction between their Jungian archetype and biological temperament.
    Return JSON: { "mantra": "Affirmation", "strengthAnalysis": "Synthesis", "weaknessAnalysis": "Conflict points", "roadmap": [{ "phase": "P", "goal": "G", "actions": [] }] }`;
    return generateData(systemPrompt, JSON.stringify(data), "gemini-3-pro-preview", true);
};

export const getDailyOracleReflection = async (userData: any) => {
    const systemPrompt = `You are the Sanctuary Oracle. Provide a daily reflection.
    Return JSON: { "quote": "Reflection", "focus": "Theme", "affirmation": "Personal affirmation", "dailyRite": "Action" }`;
    return generateData(systemPrompt, `Profile context: ${JSON.stringify(userData)}`);
};

export const generateShadowWork = async (profile: any) => {
    const systemPrompt = `You are a Shadow Work Guide. Return JSON: { "shadowTraits": ["Trait 1", "Trait 2"], "theMirrorExercise": "Description", "journalPrompts": ["Prompt 1", "Prompt 2"], "integrationMantra": "Mantra" }`;
    return generateData(systemPrompt, `Profile: ${JSON.stringify(profile)}`);
};

export const generateNickname = async (context: string): Promise<string> => {
    const res = await generateData(`Generate 1 mystical nickname. Return JSON: { "nickname": "The Name" }`, `Context: ${context}`);
    return (res.success && res.data?.nickname) ? res.data.nickname : "The Seeker";
};
