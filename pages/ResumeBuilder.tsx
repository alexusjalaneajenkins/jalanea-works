
import React, { useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ResumeType } from '../types';
import { FileText, Download, Copy, Sparkles, ChevronDown, ChevronUp, Bot, ArrowRight, Settings } from 'lucide-react';
import { generateResume, recommendResumeStrategy } from '../services/geminiService';
import { MOCK_PROFILE } from './Profile';

export const ResumeBuilder: React.FC = () => {
  const [selectedType, setSelectedType] = useState<ResumeType>(ResumeType.CHRONOLOGICAL);
  const [jobDescription, setJobDescription] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');

  // Formatting State
  const [fontFamily, setFontFamily] = useState('font-serif');
  const [fontSize, setFontSize] = useState('text-sm');

  // New State for UX Improvements
  const [showAllTypes, setShowAllTypes] = useState(false);
  const [isRecommending, setIsRecommending] = useState(false);
  const [recommendation, setRecommendation] = useState<{ recommendedType: string; reasoning: string; successProbability: string } | null>(null);

  const userData = MOCK_PROFILE;

  const handleGenerate = async () => {
    if (!jobDescription) return;
    setIsGenerating(true);
    const content = await generateResume(selectedType, userData, jobDescription);
    setGeneratedContent(content);
    setIsGenerating(false);
  };

  const handlePrint = () => {
      window.print();
  };

  const handleAiRecommendation = async () => {
      if (!jobDescription) return;
      setIsRecommending(true);
      const result = await recommendResumeStrategy(userData, jobDescription);
      if (result) {
          setRecommendation(result);
          setShowAllTypes(true);
      }
      setIsRecommending(false);
  };

  const applyRecommendation = () => {
      if (recommendation) {
          const matchedType = Object.values(ResumeType).find(t => t.toLowerCase() === recommendation.recommendedType.toLowerCase());
          if (matchedType) {
              setSelectedType(matchedType);
          } else {
              setSelectedType(ResumeType.TARGETED);
          }
          setRecommendation(null);
      }
  };

  const resumeTypes = [
    { type: ResumeType.CHRONOLOGICAL, desc: "Best for showing steady career progression." },
    { type: ResumeType.FUNCTIONAL, desc: "Focuses on skills over work history. Good for career changers." },
    { type: ResumeType.COMBINATION, desc: "Mix of skills and history." },
    { type: ResumeType.TARGETED, desc: "Highly customized to a specific job description." },
    { type: ResumeType.INFOGRAPHIC, desc: "Visual-heavy. Great for designers." },
    { type: ResumeType.MINI, desc: "Brief summary for networking." },
    { type: ResumeType.FEDERAL, desc: "Detailed format for government jobs." },
  ];

  const displayedTypes = showAllTypes ? resumeTypes : resumeTypes.slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-display font-bold text-jalanea-900">AI Resume Studio</h1>
                <p className="text-jalanea-600 font-medium mt-1">Generate tailored resumes based on your Valencia degree and target roles.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Configuration Panel */}
            <div className="lg:col-span-4 space-y-6">
                <Card className="sticky top-6" variant="solid-white">
                    <h3 className="font-bold text-jalanea-900 mb-4 flex items-center gap-2">
                        <FileText size={18}/> Resume Configuration
                    </h3>
                    
                    <div className="space-y-4">
                        
                        <div>
                            <label className="block text-sm font-bold text-jalanea-900 mb-2">Target Job Description</label>
                            <textarea
                                className="w-full h-32 p-3 rounded-xl border border-jalanea-200 text-sm focus:ring-2 focus:ring-gold focus:border-transparent outline-none resize-none bg-jalanea-50"
                                placeholder="Paste the job description here..."
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                            />
                        </div>

                        {/* Formatting Controls */}
                        <div>
                            <label className="block text-sm font-bold text-jalanea-900 mb-2">Formatting</label>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-jalanea-500 uppercase block mb-1">Font</label>
                                    <select 
                                        className="w-full p-2 rounded-lg border border-jalanea-200 text-sm bg-white focus:ring-1 focus:ring-gold"
                                        value={fontFamily}
                                        onChange={(e) => setFontFamily(e.target.value)}
                                    >
                                        <option value="font-serif">Serif (Times)</option>
                                        <option value="font-sans">Sans (Arial)</option>
                                        <option value="font-mono">Mono (Code)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-jalanea-500 uppercase block mb-1">Size</label>
                                    <select 
                                        className="w-full p-2 rounded-lg border border-jalanea-200 text-sm bg-white focus:ring-1 focus:ring-gold"
                                        value={fontSize}
                                        onChange={(e) => setFontSize(e.target.value)}
                                    >
                                        <option value="text-xs">Small</option>
                                        <option value="text-sm">Medium</option>
                                        <option value="text-base">Large</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-bold text-jalanea-900">Resume Type</label>
                                <button 
                                    onClick={handleAiRecommendation}
                                    disabled={!jobDescription || isRecommending}
                                    className={`text-xs font-bold flex items-center gap-1 transition-colors ${!jobDescription ? 'text-jalanea-300 cursor-not-allowed' : 'text-gold hover:text-jalanea-900'}`}
                                >
                                    {isRecommending ? <div className="animate-spin h-3 w-3 border-2 border-gold border-t-transparent rounded-full"/> : <Bot size={14} />}
                                    Help me choose
                                </button>
                            </div>

                            {recommendation && (
                                <div className="mb-4 bg-jalanea-900 text-white p-4 rounded-xl border border-gold/30 shadow-lg animate-in fade-in slide-in-from-top-2">
                                    <div className="flex items-start gap-3">
                                        <div className="p-1.5 bg-gold/20 rounded-lg text-gold shrink-0 mt-1">
                                            <Sparkles size={16} fill="currentColor" />
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-bold text-sm text-gold">Recommended: {recommendation.recommendedType}</h4>
                                                <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded text-jalanea-200">{recommendation.successProbability} Success Rate</span>
                                            </div>
                                            <p className="text-xs text-jalanea-200 mt-1 mb-3 leading-relaxed">
                                                {recommendation.reasoning}
                                            </p>
                                            <Button size="sm" fullWidth className="h-8 text-xs bg-gold text-jalanea-950 hover:bg-white" onClick={applyRecommendation}>
                                                Use {recommendation.recommendedType} Format
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                {displayedTypes.map((rt) => (
                                    <button
                                        key={rt.type}
                                        onClick={() => setSelectedType(rt.type)}
                                        className={`w-full text-left p-3 rounded-lg border transition-all text-sm group
                                            ${selectedType === rt.type 
                                                ? 'bg-jalanea-50 border-jalanea-900 shadow-sm relative overflow-hidden' 
                                                : 'bg-white text-jalanea-600 border-jalanea-200 hover:bg-jalanea-50 hover:border-jalanea-300'}
                                        `}
                                    >
                                        {selectedType === rt.type && <div className="absolute left-0 top-0 bottom-0 w-1 bg-jalanea-900"></div>}
                                        <div className={`font-bold ${selectedType === rt.type ? 'text-jalanea-900' : ''}`}>{rt.type}</div>
                                        <div className={`text-xs mt-1 ${selectedType === rt.type ? 'text-jalanea-600' : 'text-jalanea-400'}`}>{rt.desc}</div>
                                    </button>
                                ))}
                                
                                <button 
                                    onClick={() => setShowAllTypes(!showAllTypes)}
                                    className="w-full py-2 text-xs font-bold text-jalanea-500 hover:text-jalanea-900 flex items-center justify-center gap-1 transition-colors border border-dashed border-jalanea-200 rounded-lg hover:border-jalanea-400"
                                >
                                    {showAllTypes ? (
                                        <>Show Less <ChevronUp size={14} /></>
                                    ) : (
                                        <>View {resumeTypes.length - 3} More Types <ChevronDown size={14} /></>
                                    )}
                                </button>
                            </div>
                        </div>

                        <Button 
                            fullWidth 
                            onClick={handleGenerate} 
                            disabled={!jobDescription || isGenerating}
                            icon={isGenerating ? <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"/> : <Sparkles size={16}/>}
                        >
                            {isGenerating ? 'Generating...' : 'Generate Resume'}
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Preview Panel */}
            <div className="lg:col-span-8">
                <div className="bg-white rounded-2xl border border-jalanea-200 shadow-lg min-h-[600px] flex flex-col">
                    <div className="p-4 border-b border-jalanea-200 flex justify-between items-center bg-jalanea-50/50 rounded-t-2xl">
                        <div className="flex gap-2 bg-white p-1 rounded-lg border border-jalanea-200">
                            <button 
                                onClick={() => setViewMode('preview')}
                                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${viewMode === 'preview' ? 'bg-jalanea-900 text-white' : 'text-jalanea-600 hover:bg-jalanea-100'}`}
                            >
                                Preview
                            </button>
                            <button 
                                onClick={() => setViewMode('code')}
                                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${viewMode === 'code' ? 'bg-jalanea-900 text-white' : 'text-jalanea-600 hover:bg-jalanea-100'}`}
                            >
                                Code / Text
                            </button>
                        </div>
                        <div className="flex gap-2">
                             <Button size="sm" variant="outline" icon={<Copy size={14}/>}>Copy</Button>
                             <Button size="sm" variant="primary" icon={<Download size={14}/>} onClick={handlePrint}>Print/PDF</Button>
                        </div>
                    </div>

                    <div className="flex-1 p-8 bg-white overflow-auto print:p-0">
                        {!generatedContent ? (
                            <div className="h-full flex flex-col items-center justify-center text-jalanea-400 opacity-50">
                                <FileText size={64} strokeWidth={1} />
                                <p className="mt-4 font-medium">Configure and generate to see your resume here.</p>
                            </div>
                        ) : (
                            viewMode === 'preview' ? (
                                <div className={`prose max-w-none text-jalanea-800 whitespace-pre-wrap leading-relaxed print:text-black ${fontFamily} ${fontSize}`}>
                                    {generatedContent}
                                </div>
                            ) : (
                                <pre className="font-mono text-xs bg-jalanea-950 text-jalanea-200 p-6 rounded-xl overflow-x-auto h-full">
                                    {generatedContent}
                                </pre>
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
