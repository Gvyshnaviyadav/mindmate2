import { GoogleGenAI, Type, LiveServerMessage, Modality } from "@google/genai";

// Ensure API Key availability for both Cloud/AI Studio and Local (Vite) environments
const getApiKey = () => {
  if (typeof process !== 'undefined' && process.env.API_KEY) {
    return process.env.API_KEY;
  }
  // @ts-ignore - Vite uses import.meta.env
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_KEY) {
    // @ts-ignore
    return import.meta.env.VITE_API_KEY;
  }
  return '';
};

// Helper to check for AI Studio specific features safely
const checkAiStudioKey = async () => {
  if (typeof window !== 'undefined' && (window as any).aistudio) {
    const aiStudio = (window as any).aistudio;
    if (aiStudio.hasSelectedApiKey && !await aiStudio.hasSelectedApiKey()) {
      await aiStudio.openSelectKey();
    }
  }
};

// --- Chat Therapist (Gemini 2.5 Flash) ---
export const generateTherapistResponse = async (history: { role: string; parts: string[] }[], newMessage: string) => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API Key not found");
  
  const ai = new GoogleGenAI({ apiKey });
  
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: "You are MindMate, an empathetic, professional AI student mental wellness counselor. Analyze the user's input for stress, burnout, and emotional instability. Provide supportive, actionable advice.",
    }
  });

  // Replay history
  for (const turn of history) {
    if (turn.role === 'user') {
      await chat.sendMessage({ message: turn.parts[0] });
    }
  }

  const result = await chat.sendMessage({ message: newMessage });
  return result.text;
};

// --- Fast Analysis (Gemini 2.5 Flash Lite) ---
export const analyzeQuickSentiment = async (text: string) => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const result = await ai.models.generateContent({
    model: 'gemini-2.5-flash-lite-latest',
    contents: `Analyze the sentiment of this text on a scale of 1-10 (10 being happiest) and return ONLY the number: "${text}"`,
  });
  return result.text;
};

// --- Vision Analysis (Gemini 3 Pro) ---
export const analyzeWellnessImage = async (base64Data: string, mimeType: string) => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const result = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Data, mimeType } },
        { text: "Analyze this image for signs of mental wellness context. Is the environment messy (depressive sign) or organized? Are there signs of healthy habits? Provide a wellness score 0-100 and a short assessment." }
      ]
    }
  });
  return result.text;
};

// --- Video Generation (Veo) ---
export const generateRelaxationVideo = async (prompt: string) => {
  await checkAiStudioKey();

  const ai = new GoogleGenAI({ apiKey: getApiKey() });

  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: `Calming, meditative, wellness video: ${prompt}`,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!videoUri) throw new Error("Video generation failed");
  
  return `${videoUri}&key=${getApiKey()}`;
};

// --- Image Generation (Gemini 3 Pro Image) ---
export const generateVisionBoardImage = async (prompt: string) => {
    await checkAiStudioKey();
    
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
            parts: [{ text: `A motivational vision board image representing: ${prompt}` }]
        },
        config: {
            imageConfig: {
                aspectRatio: "16:9",
                imageSize: "1K"
            }
        }
    });
    
    // Extract image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
        }
    }
    throw new Error("No image generated");
};

// --- Live API Helper Functions ---
export const createLiveSession = async (
    onAudioData: (base64: string) => void,
    onTranscription: (inText: string, outText: string) => void
) => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    
    return ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
            },
            systemInstruction: 'You are an empathetic listener. Keep responses brief, warm, and encouraging. Focus on the user\'s tone and stress levels.',
            inputAudioTranscription: {},
            outputAudioTranscription: {},
        },
        callbacks: {
            onopen: () => console.log("Live session connected"),
            onmessage: (msg: LiveServerMessage) => {
                // Audio Output
                const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                if (audioData) onAudioData(audioData);

                // Transcription
                let inText = '';
                let outText = '';
                if (msg.serverContent?.inputTranscription?.text) inText = msg.serverContent.inputTranscription.text;
                if (msg.serverContent?.outputTranscription?.text) outText = msg.serverContent.outputTranscription.text;
                
                if (inText || outText) {
                    onTranscription(inText, outText);
                }
            },
            onclose: () => console.log("Live session closed"),
            onerror: (e) => console.error("Live session error", e)
        }
    });
};