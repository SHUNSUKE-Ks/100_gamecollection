
import { GoogleGenAI, Type } from "@google/genai";
import type { PlotCard, PlotLine, CastSlot } from './PlotService';

// Use Vite's env variable convention
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

// Model version management - configurable via .env
// Options: gemini-2.5-flash, gemini-3-flash, gemini-2.5-flash-lite
const DEFAULT_MODEL = 'gemini-2.5-flash'; // Updated to available model
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || DEFAULT_MODEL;

// --- Types ported from SampleApp ---
export interface OrderList {
    ORDER_INFO: {
        ORDER_DATE: string;
        TYPE: string;
        STATUS: string;
    };
    CHARACTERS: {
        ID: string;
        NAME: string;
        DESCRIPTION: string;
        VISUAL_REFERENCE: {
            AGE: string;
            HAIR: string;
            EYES: string;
            BUILD: string;
            OUTFIT: string;
            PERSONALITY: string;
        };
        ASSETS: {
            STANDING: {
                ID: string;
                POSE: string;
                FILENAME: string;
            }[];
            FACES: {
                ID: string;
                EXPRESSION: string;
                FILENAME: string;
            }[];
            CGS: {
                ID: string;
                SCENE: string;
                FILENAME: string;
            }[];
        };
    }[];
    TECHNICAL_SPECS: {
        STANDING_SIZE: string;
        FACE_SIZE: string;
        CG_SIZE: string;
        FORMAT: string;
    };
}

export interface AnalysisResult {
    id: string;
    name: string;
    description: string;
    tags: string[];
    visualStyle: string;
    keyFeatures: string[];
    assets: GeneratedAsset[];
}

export interface GeneratedAsset {
    id: number;
    filename: string;
    type: 'STANDING' | 'FACE' | 'CG';
    description: string;
    prompt: string;
    imageUrl?: string;
}

const SYSTEM_INSTRUCTION = `
# Role
You are "NANOBANANAPRO", an expert AI character design director and asset generator for game development.

# Objective
Your task is to analyze a provided "Reference Character Image" and a "JSON Order List". Based on these inputs, you must define the precise visual details to generate consistent game assets (Standing art, Expressions, Event CGs).

# Rules & Constraints
1. **Character Consistency**: The physical features (hair style, eye color, face shape, accessories) and costume design must strictly match the "Reference Character Image". Do not hallucinate new features unless specified by the order.
2. **Metadata Generation**: You must generate a concise character ID (snake_case), localized Name (Japanese if possible), a brief background Description, and relevant Tags (e.g., ADVENTURER, MAGE, ALLY).
3. **Asset Types**:
   - **Standing**: Full body or knee-up, neutral or specific pose, transparent or simple background.
   - **Expression**: Close-up on the face, preserving the exact angle/lighting of the standing art but changing facial features.
   - **CG**: Cinematic composition, specific lighting, background included.
4. **Output Format**: You must output the result in a valid JSON format as defined by the responseSchema.
`;

// Helper for retry logic
const generateContentWithRetry = async (
    ai: GoogleGenAI,
    modelName: string,
    params: any,
    retries = 3
): Promise<any> => {
    for (let i = 0; i < retries; i++) {
        try {
            return await ai.models.generateContent({
                model: modelName,
                ...params
            });
        } catch (error: any) {
            // Check for 429 (Resource Exhausted) or 503 (Service Unavailable)
            if (error?.status === 429 || error?.code === 429 || error?.status === 503) {
                if (i === retries - 1) throw error;
                const delay = Math.pow(2, i) * 2000 + Math.random() * 1000; // 2s, 4s, 8s + jitter
                console.warn(`Gemini API 429/503. Retrying in ${Math.round(delay)}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            throw error;
        }
    }
};

export const GeminiService = {
    analyzeCharacterAndOrders: async (
        base64Image: string,
        orderList: OrderList
    ): Promise<AnalysisResult> => {
        if (!API_KEY) {
            throw new Error("Gemini API Key is missing. Please set VITE_GEMINI_API_KEY in .env");
        }

        const ai = new GoogleGenAI({ apiKey: API_KEY });

        const response = await generateContentWithRetry(ai, GEMINI_MODEL, {
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            inlineData: {
                                mimeType: 'image/png',
                                data: base64Image.split(',')[1] || base64Image,
                            },
                        },
                        {
                            text: `Analyze this character and process the order: ${JSON.stringify(orderList)}. 
                    Provide metadata for a 'data.json' file including a unique snake_case ID, name in Japanese, description, and tags.`,
                        },
                    ]
                }
            ],
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING, description: "snake_case id" },
                        name: { type: Type.STRING, description: "Display name in Japanese" },
                        description: { type: Type.STRING },
                        tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                        visualStyle: { type: Type.STRING },
                        keyFeatures: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        },
                        assets: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.INTEGER },
                                    filename: { type: Type.STRING },
                                    type: { type: Type.STRING },
                                    description: { type: Type.STRING }, // Description of the asset content
                                    prompt: { type: Type.STRING }, // Generation prompt
                                },
                                required: ["id", "filename", "type", "description", "prompt"]
                            }
                        }
                    },
                    required: ["id", "name", "description", "tags", "visualStyle", "keyFeatures", "assets"]
                },
            },
        });

        try {
            // @ts-ignore
            const text = response.text; // Access as property per SDK 0.2.1
            if (typeof text === 'function') {
                // Fallback if it is a function in newer/older versions
                // @ts-ignore
                return JSON.parse(text() || '{}');
            }
            return JSON.parse(text || '{}');
        } catch (e) {
            console.error("Failed to parse analysis result", e);
            throw new Error("Invalid response from Gemini");
        }
    },

    // ── プロット手帳: ストーリー入力 → 2枚のPlotCard生成 ──────────────

    generatePlotCards: async (storyInput: string): Promise<PlotCard[]> => {
        if (!API_KEY) {
            throw new Error("Gemini API Key is missing. Please set VITE_GEMINI_API_KEY in .env");
        }

        const ai = new GoogleGenAI({ apiKey: API_KEY });

        const prompt = `
あなたはゲームシナリオライターです。
以下のストーリー概要をもとに、プロット手帳用のカードを2枚生成してください。
各カードには：タイトル・シーンタグ・4人分のキャスト名・3〜5行の台詞（話者と台詞テキスト）を含めてください。
台詞テキストは1行60文字以内で、自然な会話にしてください。

ストーリー概要:
${storyInput}
`;

        const response = await generateContentWithRetry(ai, GEMINI_MODEL, {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        cards: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING },
                                    sceneTag: { type: Type.STRING },
                                    castSlots: {
                                        type: Type.ARRAY,
                                        items: { type: Type.STRING },
                                    },
                                    lines: {
                                        type: Type.ARRAY,
                                        items: {
                                            type: Type.OBJECT,
                                            properties: {
                                                speaker: { type: Type.STRING },
                                                text: { type: Type.STRING },
                                            },
                                            required: ['speaker', 'text'],
                                        },
                                    },
                                },
                                required: ['title', 'sceneTag', 'castSlots', 'lines'],
                            },
                        },
                    },
                    required: ['cards'],
                },
            },
        });

        const text = typeof (response as any).text === 'function'
            ? (response as any).text()
            : (response as any).text;
        const parsed = JSON.parse(text || '{}');
        const rawCards: any[] = parsed.cards?.slice(0, 2) ?? [];

        const genId = () => `plot-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

        return rawCards.map((raw): PlotCard => {
            const slots = (raw.castSlots ?? []).slice(0, 4);
            while (slots.length < 4) slots.push(null);
            const castSlots = slots as [CastSlot, CastSlot, CastSlot, CastSlot];

            const lines: PlotLine[] = (raw.lines ?? []).map((l: any): PlotLine => ({
                id: genId(),
                speaker: l.speaker ?? '',
                text: (l.text ?? '').slice(0, 60),
            }));

            return {
                id: genId(),
                title: raw.title ?? '生成されたプロット',
                sceneTag: raw.sceneTag ?? '',
                castSlots,
                lines: lines.length > 0 ? lines : [{ id: genId(), speaker: '', text: '' }],
                episodeId: '',
                chapterId: '',
                status: 'idea',
            };
        });
    },

    generateAssetImage: async (
        prompt: string,
        base64Reference?: string
    ): Promise<string> => {
        if (!API_KEY) {
            throw new Error("Gemini API Key is missing.");
        }

        const ai = new GoogleGenAI({ apiKey: API_KEY });

        const parts: any[] = [{ text: prompt }];
        if (base64Reference) {
            parts.unshift({
                inlineData: {
                    mimeType: 'image/png',
                    data: base64Reference.split(',')[1] || base64Reference,
                },
            });
        }

        const response = await generateContentWithRetry(ai, GEMINI_MODEL, {
            contents: [
                { role: 'user', parts }
            ],
        });

        const candidates = response.candidates;
        if (candidates && candidates[0] && candidates[0].content && candidates[0].content.parts) {
            for (const part of candidates[0].content.parts) {
                if (part.inlineData && part.inlineData.data) {
                    return `data:image/png;base64,${part.inlineData.data}`;
                }
            }
        }

        throw new Error("No image generated");
    }
};
