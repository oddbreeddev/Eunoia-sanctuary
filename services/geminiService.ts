
import { GoogleGenAI, Type, Modality } from "@google/genai";

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
    if (!process.env.API_KEY) return { success: false, error: "System not ready. API Key is missing." };
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

/**
 * Transforms text affirmation into spoken audio using the Oracle's voice.
 */
export const generateAudioAffirmation = async (text: string): Promise<string | null> => {
    if (!process.env.API_KEY) return null;
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: `Say soothingly and wisely: ${text}` }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Zephyr' },
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return base64Audio || null;
    } catch (error) {
        console.error("Audio generation failed", error);
        return null;
    }
};

export const generateSoulAura = async (profileContext: string) => {
    if (!process.env.API_KEY) return { success: false, error: "API Key missing." };
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
        const prompt = `A mystical, ethereal, high-quality digital art representation of a soul aura. 
        Theme: ${profileContext}. Colors: Iridescent, cinematic lighting, spiritual, abstract, no text. 
        Style: Surrealism, 4k resolution.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: prompt }] },
            config: { imageConfig: { aspectRatio: "1:1" } },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return { success: true, data: `data:image/png;base64,${part.inlineData.data}` };
            }
        }
        throw new Error("No image data returned.");
    } catch (error) {
        return { success: false, error: handleGeminiError(error) };
    }
};

export const analyzeDailyGrowth = async (profile: any, blueprint: any, userReport: string, energy: number) => {
    const systemPrompt = `Return JSON: {"growthSummary": "One sentence.", "achievementScore": 0-100, "lessonLearned": "Short tip", "celebration": "3-word note"}`;
    return generateData(systemPrompt, `User Report: "${userReport}", Energy: ${energy}/5`);
};

export const consultTheMirror = async (userMessage: string, profile: any) => {
    const systemPrompt = `Reflect back the user's inner state concisely. Return JSON: {"reflection": "One sentence.", "question": "One deep, 5-word question."}`;
    return generateData(systemPrompt, userMessage);
};

export const generateDailyBlueprint = async (profile: any, mood: string = "calm") => {
    const systemPrompt = `Return JSON: {"theme": "2-word title", "morning": {"task": "Task"}, "afternoon": {"task": "Task"}, "evening": {"task": "Task"}, "affirmation": "Text"}`;
    return generateData(systemPrompt, `Mood: ${mood}, Context: ${JSON.stringify(profile)}`);
};

export const generateDailyAffirmation = async (profile: any) => {
    const systemPrompt = `Generate 1 powerful affirmation (max 8 words). JSON: {"affirmation": "Text"}`;
    return generateData(systemPrompt, `Context: ${JSON.stringify(profile)}`);
};

export const generateIkigaiInsight = async (love: string, goodAt: string, worldNeeds: string, paidFor: string) => {
    const systemPrompt = `Purpose Coach. Return JSON: {"title": "Name", "summary": "15 words", "description": "30 words", "strengths": ["2 bullets"], "careerAlignment": ["2 roles"], "immediateAction": "First step"}`;
    return generateData(systemPrompt, `Love: ${love}, Good At: ${goodAt}, Needs: ${worldNeeds}, Paid: ${paidFor}`);
};

export const analyzePersonality = async (quizAnswers: string, selfDescription: string) => {
    const systemPrompt = `Analyze personality. Return JSON: {"title": "Archetype", "tagline": "Catchphrase", "summary": "1 sentence", "description": "40 words", "strengths": ["3 bullets"], "weaknesses": ["2 bullets"], "wayForward": "Advice"}`;
    return generateData(systemPrompt, quizAnswers);
};

export const analyzeTemperament = async (quizAnswers: string, energyDescription: string) => {
    const systemPrompt = `Temperament. Return JSON: {"title": "Name", "tagline": "Tag", "summary": "1 sentence", "description": "40 words", "strengths": ["2 bullets"], "weaknesses": ["2 bullets"], "productivityHack": "Tip", "wayForward": "Routine"}`;
    return generateData(systemPrompt, quizAnswers);
};

export const generateLifeSynthesis = async (data: any) => {
    const systemPrompt = `Master Life Strategy. Return JSON: {"title": "The Strategic Legacy", "mantra": "Principle", "summary": "1 sentence", "description": "50 words", "topPriority": "Goal", "wayForward": ["3 steps"]}`;
    return generateData(systemPrompt, JSON.stringify(data), "gemini-3-pro-preview");
};

export const generateShadowWork = async (profile: any, journalEntry: string = "") => {
    const systemPrompt = `Shadow Work. Return JSON: {"title": "Shadow", "summary": "1 sentence", "description": "40 words", "strengths": ["2 talents"], "integrationExercise": "Exercise", "wayForward": "Advice"}`;
    return generateData(systemPrompt, `User Journal: ${journalEntry}, Profile: ${JSON.stringify(profile)}`);
};

export const generateNickname = async (context: string): Promise<string> => {
    const res = await generateData(`Generate 1 short, cool nickname. JSON: { "nickname": "Name" }`, context);
    return (res.success && res.data?.nickname) ? res.data.nickname : "Seeker";
};
