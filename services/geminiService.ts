import { GoogleGenAI } from "@google/genai";

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
        // 1. Attempt direct parse (Gemini usually returns clean JSON with responseMimeType)
        return JSON.parse(text);
    } catch (e) {
        // 2. Fallback cleaning for Markdown or extra whitespace
        let clean = text.replace(/```json/gi, '').replace(/```/g, '').trim();
        
        // Find outer braces to handle potential conversational text
        const first = clean.indexOf('{');
        const last = clean.lastIndexOf('}');
        
        if (first !== -1 && last !== -1) {
            clean = clean.substring(first, last + 1);
            try {
                return JSON.parse(clean);
            } catch (inner) {
                // Formatting issue
            }
        }
        
        console.error("JSON Parsing Failed. Raw text:", text);
        throw new Error("Response was incomplete or malformed.");
    }
};

const generateData = async (systemPrompt: string, userPrompt: string) => {
    if (!ai) {
        return { success: false, error: "System Configuration Error: API Key missing." };
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: userPrompt,
            config: {
                responseMimeType: "application/json", // Enforce JSON output
                temperature: 0.5,
                maxOutputTokens: 4000, // High limit to prevent truncation
                systemInstruction: systemPrompt
            }
        });

        const text = response.text;
        if (!text) throw new Error("Empty response from AI");
        
        return { success: true, data: safeParseJSON(text) };

    } catch (error) {
        return { success: false, error: handleGeminiError(error) };
    }
};

// --- 1. IKIGAI MODULE (Refined for Standard 4 Circles) ---
export const generateIkigaiInsight = async (
    love: string, 
    goodAt: string, 
    worldNeeds: string, 
    paidFor: string
) => {
    const systemPrompt = `
    You are an Ikigai Master.
    Analyze the 4 pillars provided by the user to find their true purpose intersection.
    
    Data Provided:
    1. What they Love (Passion)
    2. What they are Good At (Profession)
    3. What the World Needs (Mission)
    4. What they can be Paid For (Vocation)

    Return JSON.
    Structure:
    {
        "title": "The Japanese Concept Title (e.g. The Empathetic Creator)",
        "insight": "Deep synthesis of how these 4 areas overlap (max 3 sentences)",
        "careers": ["Specific Role 1", "Specific Role 2", "Specific Role 3"],
        "skillsToDevelop": ["Gap Skill 1", "Gap Skill 2"],
        "learningPath": ["Book/Course 1", "Actionable Resource 2"],
        "actionableStep": "Immediate next step to align these pillars"
    }`;
    
    // If simple mode (teaser) is used, worldNeeds/paidFor might be empty/inferred
    const prompt = `
    1. Love: ${love}
    2. Good At: ${goodAt}
    3. World Needs: ${worldNeeds || "Infer based on Love/Good At"}
    4. Paid For: ${paidFor || "Infer based on Good At"}
    `;
    
    return generateData(systemPrompt, prompt);
};

// --- 2. PERSONALITY MODULE ---
export const analyzePersonality = async (quizAnswers: string, selfDescription: string) => {
    const systemPrompt = `
    You are a Jungian Analyst.
    Analyze the user to determine their Archetype.
    Return JSON.

    Structure:
    {
        "archetype": "Archetype Name",
        "tagline": "Short essence quote",
        "description": "Psychological analysis (max 3 sentences)",
        "strengths": ["Strength 1", "Strength 2", "Strength 3"],
        "shadowSide": ["Weakness 1", "Weakness 2", "Weakness 3"],
        "relationships": "Connection style (max 2 sentences)",
        "workStyle": "Leadership style (max 2 sentences)",
        "famousExamples": ["Person 1", "Person 2"],
        "coreWound": "Fundamental fear",
        "growthKey": "Actionable advice (max 2 sentences)"
    }`;

    return generateData(systemPrompt, `Quiz: ${quizAnswers}. Self-Report: ${selfDescription}.`);
};

// --- 3. TEMPERAMENT MODULE ---
export const analyzeTemperament = async (quizAnswers: string, energyDescription: string) => {
    const systemPrompt = `
    You are an Energy Coach.
    Analyze temperament (Choleric, Sanguine, Melancholic, Phlegmatic).
    
    Rules:
    - Sanguine: Social, fast, optimistic.
    - Choleric: Dominant, fast, decisive.
    - Melancholic: Analytical, slow, perfectionist.
    - Phlegmatic: Calm, slow, diplomatic.
    
    Return JSON.
    Structure:
    {
        "temperament": "Dominant Type",
        "element": "Fire/Water/Air/Earth",
        "description": "Energy pattern analysis (max 3 sentences)",
        "strengths": ["Strength 1", "Strength 2"],
        "stressTriggers": ["Trigger 1", "Trigger 2"],
        "emotionalNeeds": "Safety needs (max 2 sentences)",
        "chronotype": "Sleep schedule advice",
        "idealEnvironment": "Best setting",
        "rechargeStrategy": "Recovery protocol"
    }`;

    return generateData(systemPrompt, `Quiz: ${quizAnswers}. Energy: ${energyDescription}.`);
};

// --- 4. SYNTHESIS MODULE ---
export const generateLifeSynthesis = async (data: any) => {
    const systemPrompt = `
    You are a Holistic Life Strategist & Career Coach.
    Synthesize the user's unique profile (Archetype + Temperament + Ikigai) into a deep, actionable life strategy.
    
    CRITICAL: Return ONLY valid JSON.
    
    Structure:
    {
        "mantra": "A powerful, short personal affirmation",
        "strengthAnalysis": "Brief summary of how their nature creates strength (Legacy field)",
        "interactionDepth": "A rich paragraph explaining the dynamic interplay between their cognitive Archetype, biological Temperament, and Ikigai. How do they feed each other? What is the unique 'flavor' of this person?",
        "leverageStrategy": "Strategic advice on how to use their dominant traits to navigate life and overcome their specific blind spots.",
        "careerPath": "A specific career recommendation with a rationale based on their profile.",
        "blindSpot": "The most dangerous psychological pitfall for this specific combination.",
        "stopDoing": "One specific, high-impact habit they must stop immediately.",
        "startDoing": "One specific, high-impact habit they must start immediately.",
        "dailyRoutine": [
            "Specific morning practice (e.g., 5 min journaling)",
            "Specific mid-day reset (e.g., sensory walk)",
            "Specific evening wind-down (e.g., digital sunset)"
        ],
        "optimalSchedule": {
            "morning": "Best use of morning energy (e.g., Deep work vs Creative flow)",
            "afternoon": "Best use of afternoon block (e.g., Meetings vs Admin)",
            "evening": "Best way to recharge social/emotional battery"
        }
    }`;

    const userPrompt = `
    Archetype: ${data.archetype?.archetype || 'Unknown'}.
    Temperament: ${data.temperament?.temperament || 'Unknown'}.
    Ikigai: ${data.ikigai?.title || 'Unknown'}.
    Age: ${data.age || 'N/A'}. 
    Region: ${data.region || 'N/A'}.
    Values: ${data.principles || 'N/A'}.
    `;

    return generateData(systemPrompt, userPrompt);
};

// --- 5. NICKNAME GENERATOR ---
export const generateNickname = async (context: string): Promise<string> => {
    try {
        const res = await generateData(
            `Generate 1 mystical nickname. Return JSON: { "nickname": "The Name" }`,
            `Context: ${context}`
        );
        if (res.success && res.data?.nickname) return res.data.nickname;
        return "The Seeker";
    } catch (e) {
        return "The Seeker";
    }
};