
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

// Fix: Always create a fresh instance of GoogleGenAI before making an API call to ensure use of the latest API key
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
    const systemPrompt = `You are a World-Class Career and Purpose Coach. Deeply analyze the intersection of the user's life pillars.
    Provide a rich, detailed analysis that feels professional yet accessible.
    REQUIRED SCHEMA:
    {
      "title": "A relatable and inspiring path title",
      "description": "A detailed 3-paragraph explanation of how their unique inputs create a specific life mission.",
      "strengths": ["4 detailed reasons why they are naturally suited for this"],
      "weaknesses": ["3 specific obstacles they might face and how to navigate them"],
      "careerAlignment": ["4 specific job roles or business types that fit"],
      "immediateAction": "The very first step they can take in the next 24 hours.",
      "wayForward": ["Step-by-step 3-part roadmap for the next 6 months"]
    }`;
    return generateData(systemPrompt, `Love: ${love}, Good At: ${goodAt}, Needs: ${worldNeeds}, Paid: ${paidFor}`);
};

export const analyzePersonality = async (quizAnswers: string, selfDescription: string) => {
    const systemPrompt = `You are a Senior Behavioral Psychologist. Analyze these quiz results to provide a deep personality profile.
    Go beyond generic labels to explain the 'Core Driver' of the user.
    REQUIRED SCHEMA:
    {
      "title": "Archetype Name",
      "tagline": "A powerful, defining catchphrase",
      "description": "A comprehensive 400-word analysis of their mental processing and decision-making style.",
      "strengths": ["5 unique superpowers based on their profile"],
      "weaknesses": ["4 specific growth areas or blind spots to monitor"],
      "socialDynamics": "How they interact with others and what they need from relationships.",
      "stressManagement": "A specific technique for them to stay grounded based on their type.",
      "careerAlignment": "The type of environment where they thrive most.",
      "wayForward": "Actionable advice on how to use these traits to succeed this week."
    }`;
    return generateData(systemPrompt, quizAnswers);
};

export const analyzeTemperament = async (quizAnswers: string, energyDescription: string) => {
    const systemPrompt = `You are a Biological Rhythms and Energy Coach. Analyze these inputs to define the user's natural temperament.
    Explain how their biology influences their daily productivity and emotional baseline.
    REQUIRED SCHEMA:
    {
      "title": "Energy Style / Temperament Name",
      "tagline": "A description of their natural frequency",
      "description": "A deep dive into their energy cycles, emotional resilience, and social battery capacity.",
      "strengths": ["4 energy-based advantages they possess"],
      "weaknesses": ["3 energy-draining traps they often fall into"],
      "productivityHack": "A specific productivity system (like Pomodoro, Time Blocking, etc.) that fits their rhythm.",
      "idealEnvironment": "The physical surroundings that maximize their focus.",
      "socialInteraction": "How they best recharge after social events.",
      "wayForward": "A specific daily routine suggestion to optimize their unique energy."
    }`;
    return generateData(systemPrompt, quizAnswers);
};

export const generateLifeSynthesis = async (data: any) => {
    const systemPrompt = `You are a Strategic Life Architect. Synthesize all psychological data into a Master Life Strategy.
    This should be the most comprehensive part of the app. Provide deep, long-term strategic value.
    REQUIRED SCHEMA:
    {
      "title": "The Strategic Legacy",
      "mantra": "A powerful life-guiding principle",
      "description": "A holistic 500-word summary that blends personality, energy, and purpose into a cohesive identity.",
      "strengths": ["6 major life advantages created by this unique combination"],
      "weaknesses": ["5 potential pitfalls where their traits might conflict"],
      "topPriority": "The single most important goal for their current life stage.",
      "secondaryGoals": ["3 supporting objectives for health, wealth, and relationships"],
      "wayForward": ["A detailed 5-stage roadmap for personal and professional mastery."]
    }`;
    return generateData(systemPrompt, JSON.stringify(data), "gemini-3-pro-preview");
};

export const generateShadowWork = async (profile: any) => {
    const systemPrompt = `You are a Depth Psychology Guide. Help the user uncover their 'Shadow'—the hidden aspects of their psyche.
    Be gentle but honest. Use simple language to explain complex Jungian concepts.
    REQUIRED SCHEMA:
    {
      "title": "Shadow Archetype",
      "tagline": "The hidden mirror",
      "description": "A deep explanation of the traits they tend to repress or deny.",
      "strengths": ["Hidden talents they haven't claimed yet"],
      "weaknesses": ["Habits they use to hide from growth"],
      "integrationExercise": "A specific psychological exercise to integrate these shadow traits.",
      "wayForward": "How to move from denial to self-acceptance."
    }`;
    return generateData(systemPrompt, JSON.stringify(profile));
};

export const generateNickname = async (context: string): Promise<string> => {
    const res = await generateData(`Generate 1 simple, cool nickname. Return JSON: { "nickname": "The Name" }`, context);
    return (res.success && res.data?.nickname) ? res.data.nickname : "Goal Getter";
};
