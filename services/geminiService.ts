
import { GoogleGenAI, Type } from "@google/genai";

// Initialize safely to prevent app crash if env var is missing during load
let ai: GoogleGenAI | null = null;
try {
    if (process.env.API_KEY) {
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    } else {
        console.warn("Gemini Service: API_KEY is missing. AI features will be disabled.");
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
  
  if (msg.includes('safety') || msg.includes('blocked')) return "Response blocked by safety filters. Please try slightly different inputs.";
  if (msg.includes('quota') || msg.includes('429')) return "The Sanctuary is currently busy. Please try again in a moment.";
  if (msg.includes('json') || msg.includes('parse')) return "The Oracle's vision was clouded (Data Error). Please try again.";
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
        return { success: false, error: "System Configuration Error: API Key missing." };
    }

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
        if (!text) throw new Error("Empty response from AI");
        
        return { success: true, data: safeParseJSON(text) };

    } catch (error) {
        return { success: false, error: handleGeminiError(error) };
    }
};

export const generateIkigaiInsight = async (love: string, goodAt: string, worldNeeds: string, paidFor: string) => {
    const systemPrompt = `You are an Ikigai Master. Analyze the 4 pillars to find the user's true purpose intersection. 
    Focus on specific strengths and how they manifest in a career.
    Return JSON: { "title": "Archetypal Title", "insight": "Deep synthesis of purpose", "careers": ["Career 1", "Career 2"], "skillsToDevelop": ["Skill 1", "Skill 2"], "learningPath": ["Step 1", "Step 2"], "actionableStep": "One immediate next step" }`;
    const prompt = `1. Love: ${love}\n2. Good At: ${goodAt}\n3. World Needs: ${worldNeeds || "Infer based on skills"}\n4. Paid For: ${paidFor || "Infer based on skills"}`;
    return generateData(systemPrompt, prompt);
};

export const analyzePersonality = async (quizAnswers: string, selfDescription: string) => {
    const systemPrompt = `You are a Jungian Analyst. Determine the user's psychological Archetype.
    Return JSON: { "archetype": "Name", "tagline": "A mystical quote", "description": "Deep analysis of the psyche", "strengths": ["Strength 1", "Strength 2"], "shadowSide": ["Blind spot 1", "Weakness 2"], "relationships": "Style of connection", "workStyle": "Method of productivity", "famousExamples": ["Person 1", "Person 2"], "coreWound": "The underlying fear", "growthKey": "The primary advice for growth" }`;
    return generateData(systemPrompt, `Quiz: ${quizAnswers}. Self-Report: ${selfDescription}.`);
};

export const analyzeTemperament = async (quizAnswers: string, energyDescription: string) => {
    const systemPrompt = `You are an Energy Coach. Analyze temperament (Choleric, Sanguine, Melancholic, Phlegmatic).
    Return JSON: { "temperament": "Primary Type", "element": "Associated Element (Fire/Air/Earth/Water)", "description": "Energy pattern analysis", "strengths": ["Bio-strength 1"], "stressTriggers": ["Trigger 1"], "emotionalNeeds": "What they need to feel safe", "chronotype": "Optimal sleep/wake advice", "idealEnvironment": "Setting where they thrive", "rechargeStrategy": "Best way to recover energy" }`;
    return generateData(systemPrompt, `Quiz: ${quizAnswers}. Energy: ${energyDescription}.`);
};

export const generateLifeSynthesis = async (data: any) => {
    const systemPrompt = `You are a Holistic Life Strategist. Synthesize Archetype + Temperament + Ikigai into a MASTER roadmap for moving ahead in life.
    Explicitly identify the core Strength to leverage and the primary Weakness to bridge.
    Return JSON: { 
      "mantra": "A powerful affirmation", 
      "strengthAnalysis": "Synthesis of your greatest assets", 
      "interactionDepth": "How your personality and energy work together", 
      "leverageStrategy": "How to use your strengths for success", 
      "careerPath": "Most aligned career direction", 
      "blindSpot": "Your biggest psychological pitfall", 
      "stopDoing": "One habit to quit immediately", 
      "startDoing": "One habit to start immediately", 
      "dailyRoutine": ["Step 1", "Step 2", "Step 3"],
      "roadmap": [
        { "phase": "Immediate (0-3 months)", "goal": "Primary objective", "actions": ["Task 1", "Task 2"] },
        { "phase": "Intermediate (6-12 months)", "goal": "Growth objective", "actions": ["Task 1", "Task 2"] },
        { "phase": "Long Term (2+ years)", "goal": "Visionary objective", "actions": ["Task 1", "Task 2"] }
      ]
    }`;
    const userPrompt = `Profile Synthesis Request:
    - Archetype: ${data.archetype?.archetype} (${data.archetype?.tagline})
    - Temperament: ${data.temperament?.temperament} (Element: ${data.temperament?.element})
    - Ikigai: ${data.ikigai?.title}
    - Additional Context: Age ${data.age}, Principles: ${data.principles}, Likes: ${data.likes}, Dislikes: ${data.dislikes}.`;
    return generateData(systemPrompt, userPrompt, "gemini-3-pro-preview", true);
};

export const getDailyOracleReflection = async (userData: any) => {
    const systemPrompt = `You are the Sanctuary Oracle. Provide a short, poetic, and highly personalized daily reflection based on the user's profile.
    Return JSON: { "quote": "The reflection", "focus": "Theme for today", "affirmation": "Personal affirmation" }`;
    const prompt = `Profile: ${JSON.stringify(userData)}`;
    return generateData(systemPrompt, prompt);
};

export const generateNickname = async (context: string): Promise<string> => {
    const res = await generateData(`Generate 1 mystical nickname. Return JSON: { "nickname": "The Name" }`, `Context: ${context}`);
    return (res.success && res.data?.nickname) ? res.data.nickname : "The Seeker";
};
