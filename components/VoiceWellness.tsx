import React, { useState, useEffect, useRef } from 'react';
import { createLiveSession } from '../services/geminiService';

export const VoiceWellness: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState("Ready to start session");
  const [transcription, setTranscription] = useState<{in: string, out: string}>({in: '', out: ''});
  
  // Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  
  // Helpers for Audio
  const createBlob = (data: Float32Array) => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    const bytes = new Uint8Array(int16.buffer);
    let binary = '';
    for(let i=0; i<bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return {
      data: btoa(binary),
      mimeType: 'audio/pcm;rate=16000'
    };
  };

  const decodeAudioData = async (base64: string, ctx: AudioContext) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const dataInt16 = new Int16Array(bytes.buffer);
    const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < channelData.length; i++) {
      channelData[i] = dataInt16[i] / 32768.0;
    }
    return buffer;
  };

  const startSession = async () => {
    try {
      setStatus("Initializing audio...");
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioCtx({ sampleRate: 24000 }); // Output rate
      const inputCtx = new AudioCtx({ sampleRate: 16000 }); // Input rate

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      setStatus("Connecting to Gemini Live...");
      
      const sessionPromise = createLiveSession(
        async (base64Audio) => {
          // Playback Logic
          if (!audioContextRef.current) return;
          const ctx = audioContextRef.current;
          nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
          
          const audioBuffer = await decodeAudioData(base64Audio, ctx);
          const source = ctx.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(ctx.destination);
          source.start(nextStartTimeRef.current);
          nextStartTimeRef.current += audioBuffer.duration;
        },
        (inText, outText) => {
            setTranscription({ in: inText, out: outText });
        }
      );

      // Setup Input Streaming
      inputSourceRef.current = inputCtx.createMediaStreamSource(stream);
      processorRef.current = inputCtx.createScriptProcessor(4096, 1, 1);
      
      processorRef.current.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmBlob = createBlob(inputData);
        sessionPromise.then(session => {
            session.sendRealtimeInput({ media: pcmBlob });
        });
      };

      inputSourceRef.current.connect(processorRef.current);
      processorRef.current.connect(inputCtx.destination);

      setIsConnected(true);
      setStatus("Session Active - I'm listening.");

    } catch (err) {
      console.error(err);
      setStatus("Failed to connect microphone or API.");
    }
  };

  const stopSession = () => {
    // In a real app, properly close the session via session.close() if exposed
    // For this pattern, we stop the audio processing
    if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current.onaudioprocess = null;
    }
    if (inputSourceRef.current) inputSourceRef.current.disconnect();
    if (audioContextRef.current) audioContextRef.current.close();
    
    setIsConnected(false);
    setStatus("Session Ended");
    window.location.reload(); // Hard reset for demo stability
  };

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-140px)] bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl text-white relative overflow-hidden">
        
        {/* Visualizer Background Effect */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
            <div className={`w-64 h-64 bg-white rounded-full blur-3xl transition-transform duration-1000 ${isConnected ? 'scale-150 animate-pulse' : 'scale-100'}`}></div>
        </div>

        <div className="z-10 text-center space-y-8 p-8 max-w-lg">
            <div>
                <h2 className="text-3xl font-bold mb-2">Voice Therapy</h2>
                <p className="text-indigo-100">{status}</p>
            </div>

            <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center transition-all duration-500 ${isConnected ? 'bg-white text-indigo-600 shadow-[0_0_40px_rgba(255,255,255,0.4)]' : 'bg-white/10 text-white border-2 border-white/20'}`}>
                <i className={`fas fa-microphone text-4xl ${isConnected ? 'animate-bounce' : ''}`}></i>
            </div>
            
            {(transcription.in || transcription.out) && (
                 <div className="bg-black/20 backdrop-blur-md p-4 rounded-xl text-left text-sm h-32 overflow-y-auto">
                    {transcription.in && <p className="opacity-70 mb-2"><strong>You:</strong> {transcription.in}</p>}
                    {transcription.out && <p className="font-semibold"><strong>MindMate:</strong> {transcription.out}</p>}
                 </div>
            )}

            {!isConnected ? (
                <button onClick={startSession} className="bg-white text-indigo-600 px-8 py-3 rounded-full font-bold text-lg hover:scale-105 transition shadow-lg">
                    Start Conversation
                </button>
            ) : (
                <button onClick={stopSession} className="bg-red-500 text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-red-600 transition shadow-lg">
                    End Session
                </button>
            )}

            <p className="text-xs text-indigo-200 mt-8">
                <i className="fas fa-shield-alt mr-1"></i> Audio is processed in real-time and not stored permanently.
            </p>
        </div>
    </div>
  );
};
