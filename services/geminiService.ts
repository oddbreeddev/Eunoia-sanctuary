
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
    const systemPrompt = `You are a simple, friendly Growth Coach. Analyze the user's progress. Use plain English.
    Return JSON: {
      "growthSummary": "2 short sentences of practical insight.",
      "achievementScore": 0-100,
      "lessonLearned": "One helpful tip.",
      "celebration": "A positive note."
    }`;
    return generateData(systemPrompt, `User Report: "${userReport}", Energy: ${energy}/5`);
};

export const consultTheMirror = async (userMessage: string, profile: any) => {
    const systemPrompt = `You are a helpful AI Guide. Reflect the user's words back to help them think better. Use simple language. No mystical terms.
    Return JSON: { 
      "reflection": "A short summary of what they said.", 
      "question": "A simple question to help them move forward." 
    }`;
    return generateData(systemPrompt, userMessage);
};

export const generateDailyBlueprint = async (profile: any) => {
    const systemPrompt = `You are a Personal Assistant. Plan 3 simple tasks for the day based on their psychological profile.
    Return JSON: { 
      "theme": "A clear title",
      "objective": "A simple goal",
      "morning": { "task": "Task", "why": "Why it helps" },
      "afternoon": { "task": "Task", "why": "Why it helps" },
      "evening": { "task": "Task", "why": "Why it helps" },
      "affirmation": "A short positive phrase."
    }`;
    return generateData(systemPrompt, `Profile context: ${JSON.stringify(profile)}`);
};

export const generateDailyAffirmation = async (profile: any) => {
    const systemPrompt = `You are a supportive Growth Coach. Generate 1 short, powerful daily affirmation for the user. 
    Use plain, encouraging English. Ground it in their strengths if possible.
    Return JSON: { "affirmation": "The affirmation text.", "context": "A 5-word explanation of why this fits today." }`;
    return generateData(systemPrompt, `Profile context: ${JSON.stringify(profile)}`);
};

export const generateIkigaiInsight = async (love: string, goodAt: string, worldNeeds: string, paidFor: string) => {
    const systemPrompt = `You are a Purpose Coach. Analyze the user's inputs. 
    BE CONCISE. Avoid fluff.
    REQUIRED SCHEMA:
    {
      "title": "Path Title",
      "summary": "ONE punchy sentence summarizing their path.",
      "description": "A focused 150-word analysis.",
      "strengths": ["4 bullet points"],
      "weaknesses": ["3 points"],
      "careerAlignment": ["4 roles"],
      "immediateAction": "One clear first step.",
      "wayForward": ["3-part roadmap"]
    }`;
    return generateData(systemPrompt, `Love: ${love}, Good At: ${goodAt}, Needs: ${worldNeeds}, Paid: ${paidFor}`);
};

export const analyzePersonality = async (quizAnswers: string, selfDescription: string) => {
    const systemPrompt = `You are a Behavioral Psychologist. Analyze these quiz results. 
    Focus on quality over quantity. Keep it punchy.
    REQUIRED SCHEMA:
    {
      "title": "Archetype Name",
      "tagline": "A defining catchphrase",
      "summary": "ONE powerful sentence defining their core driver.",
      "description": "A high-impact 150-word deep dive.",
      "strengths": ["5 unique superpowers"],
      "weaknesses": ["4 blind spots"],
      "socialDynamics": "Short summary of interactions.",
      "stressManagement": "One specific technique.",
      "careerAlignment": "Ideal environment description.",
      "wayForward": "Actionable advice for this week."
    }`;
    return generateData(systemPrompt, quizAnswers);
};

export const analyzeTemperament = async (quizAnswers: string, energyDescription: string) => {
    const systemPrompt = `You are an Energy Coach. Define the user's natural temperament.
    REQUIRED SCHEMA:
    {
      "title": "Temperament Name",
      "tagline": "Natural frequency description",
      "summary": "ONE sentence about their energy baseline.",
      "description": "A focused 150-word deep dive.",
      "strengths": ["4 advantages"],
      "weaknesses": ["3 traps"],
      "productivityHack": "One specific system.",
      "idealEnvironment": "Optimal focus space.",
      "socialInteraction": "Recharge method.",
      "wayForward": "Routine suggestion."
    }`;
    return generateData(systemPrompt, quizAnswers);
};

export const generateLifeSynthesis = async (data: any) => {
    const systemPrompt = `You are a Strategic Life Architect. Synthesize data into a Master Life Strategy.
    KEEP IT ACTION-ORIENTED.
    REQUIRED SCHEMA:
    {
      "title": "The Strategic Legacy",
      "mantra": "A powerful guiding principle",
      "summary": "ONE sentence that captures their combined identity.",
      "description": "A 200-word holistic summary.",
      "strengths": ["6 major advantages"],
      "weaknesses": ["5 pitfalls"],
      "topPriority": "Single most important goal.",
      "secondaryGoals": ["3 supporting objectives"],
      "wayForward": ["5-stage roadmap"]
    }`;
    return generateData(systemPrompt, JSON.stringify(data), "gemini-3-pro-preview");
};

export const generateShadowWork = async (profile: any) => {
    const systemPrompt = `You are a Depth Psychology Guide. Help the user uncover their 'Shadow'.
    REQUIRED SCHEMA:
    {
      "title": "Shadow Archetype",
      "tagline": "The hidden mirror",
      "summary": "ONE sentence about what they tend to repress.",
      "description": "A 150-word focused analysis.",
      "strengths": ["Hidden talents"],
      "weaknesses": ["Repressive habits"],
      "integrationExercise": "One specific exercise.",
      "wayForward": "Path to self-acceptance."
    }`;
    return generateData(systemPrompt, JSON.stringify(profile));
};

export const generateNickname = async (context: string): Promise<string> => {
    const res = await generateData(`Generate 1 simple, cool nickname. Return JSON: { "nickname": "The Name" }`, context);
    return (res.success && res.data?.nickname) ? res.data.nickname : "Goal Getter";
};
