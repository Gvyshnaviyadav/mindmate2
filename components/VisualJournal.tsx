import React, { useState, useRef } from 'react';
import { analyzeWellnessImage, generateRelaxationVideo, generateVisionBoardImage } from '../services/geminiService';

export const VisualJournal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'analyze' | 'generate'>('analyze');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [prompt, setPrompt] = useState('');
  const [generatedMedia, setGeneratedMedia] = useState<{url: string, type: 'video' | 'image'} | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(f);
    }
  };

  const handleAnalyze = async () => {
    if (!file || !preview) return;
    setLoading(true);
    try {
      // Remove data URL prefix
      const base64Data = preview.split(',')[1];
      const result = await analyzeWellnessImage(base64Data, file.type);
      setAnalysis(result);
    } catch (e) {
      console.error(e);
      setAnalysis("Error analyzing image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (type: 'video' | 'image') => {
    if (!prompt) return;
    setLoading(true);
    setGeneratedMedia(null);
    try {
        let url = '';
        if (type === 'video') {
            url = await generateRelaxationVideo(prompt);
        } else {
            url = await generateVisionBoardImage(prompt);
        }
        setGeneratedMedia({ url, type });
    } catch (e) {
        console.error(e);
        alert(`Generation failed. ${window.aistudio?.hasSelectedApiKey() ? '' : 'Please verify API Key selection.'}`);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 min-h-[calc(100vh-140px)] flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-slate-100">
        <button 
            className={`flex-1 p-4 font-semibold text-center ${activeTab === 'analyze' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-slate-500'}`}
            onClick={() => setActiveTab('analyze')}
        >
            <i className="fas fa-eye mr-2"></i>Analyze Environment
        </button>
        <button 
            className={`flex-1 p-4 font-semibold text-center ${activeTab === 'generate' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-slate-500'}`}
            onClick={() => setActiveTab('generate')}
        >
            <i className="fas fa-wand-magic-sparkles mr-2"></i>Create Wellness
        </button>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        {activeTab === 'analyze' ? (
            <div className="max-w-2xl mx-auto space-y-6">
                <div 
                    className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center cursor-pointer hover:bg-slate-50 transition"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {preview ? (
                        <img src={preview} alt="Upload" className="max-h-64 mx-auto rounded-lg shadow-md" />
                    ) : (
                        <div className="text-slate-400">
                            <i className="fas fa-cloud-upload-alt text-4xl mb-3"></i>
                            <p>Click to upload a photo of your room or desk</p>
                        </div>
                    )}
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>

                {preview && !loading && !analysis && (
                    <button onClick={handleAnalyze} className="w-full bg-teal-600 text-white py-3 rounded-xl font-bold shadow-md hover:bg-teal-700 transition">
                        Analyze Mental Wellness Context
                    </button>
                )}

                {loading && (
                    <div className="text-center py-12">
                        <i className="fas fa-spinner fa-spin text-3xl text-teal-600"></i>
                        <p className="mt-2 text-slate-500">MindMate is analyzing your environment...</p>
                    </div>
                )}

                {analysis && (
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                        <h4 className="font-bold text-slate-800 mb-2">Analysis Result</h4>
                        <p className="text-slate-700 whitespace-pre-wrap">{analysis}</p>
                    </div>
                )}
            </div>
        ) : (
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="bg-teal-50 p-6 rounded-xl mb-6">
                    <h3 className="font-bold text-teal-800 mb-2">Generative Wellness</h3>
                    <p className="text-teal-600 text-sm">Create a vision board for your goals or a custom meditation video to relax.</p>
                </div>

                <textarea 
                    className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 h-32"
                    placeholder="Describe what you want to create (e.g., 'A peaceful forest stream with sunlight' or 'A vision board for academic success')"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                ></textarea>

                <div className="flex gap-4">
                    <button 
                        onClick={() => handleGenerate('video')}
                        disabled={loading || !prompt}
                        className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-md hover:bg-indigo-700 transition disabled:opacity-50"
                    >
                        <i className="fas fa-video mr-2"></i> Generate Video (Veo)
                    </button>
                    <button 
                        onClick={() => handleGenerate('image')}
                        disabled={loading || !prompt}
                        className="flex-1 bg-teal-600 text-white py-3 rounded-xl font-bold shadow-md hover:bg-teal-700 transition disabled:opacity-50"
                    >
                        <i className="fas fa-image mr-2"></i> Generate Image
                    </button>
                </div>

                {loading && (
                    <div className="text-center py-12">
                         <i className="fas fa-circle-notch fa-spin text-3xl text-indigo-600"></i>
                         <p className="mt-2 text-slate-500">Creating your media (this may take a moment)...</p>
                    </div>
                )}

                {generatedMedia && (
                    <div className="mt-8">
                        <h4 className="font-bold text-slate-800 mb-4">Your Creation</h4>
                        {generatedMedia.type === 'video' ? (
                            <video src={generatedMedia.url} controls className="w-full rounded-xl shadow-lg" autoPlay loop />
                        ) : (
                            <img src={generatedMedia.url} alt="Generated" className="w-full rounded-xl shadow-lg" />
                        )}
                        <a href={generatedMedia.url} download className="block text-center mt-4 text-indigo-600 font-semibold hover:underline">Download</a>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};
