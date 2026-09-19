import React, { useState } from 'react';
import { Sparkles, RefreshCw, Copy, Check, Send } from 'lucide-react';

interface AICaptionGeneratorProps {
  onApplyCaption: (caption: string, hashtags: string) => void;
}

export const AICaptionGenerator: React.FC<AICaptionGeneratorProps> = ({ onApplyCaption }) => {
  const [topicPrompt, setTopicPrompt] = useState('');
  const [generatedCaption, setGeneratedCaption] = useState('');
  const [generatedHashtags, setGeneratedHashtags] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicPrompt.trim()) return;

    setIsGenerating(true);

    try {
      const response = await fetch('/api/ai/generate-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: topicPrompt })
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedCaption(data.caption);
        setGeneratedHashtags(data.hashtags);
      } else {
        // High quality fallback generation
        setGeneratedCaption(`🚀 Milestone Achieved: ${topicPrompt}. Passionate about bringing quality craftsmanship and sustainable trade solutions to our community. Every project is built with precision, dedication, and attention to detail!`);
        setGeneratedHashtags('#SkillHub #SouthAfrica #Craftsmanship #YouthSkills #TradeExcellence');
      }
    } catch (err) {
      setGeneratedCaption(`🚀 Project Spotlight: ${topicPrompt}. Building lasting value through practical skills and dedicated execution!`);
      setGeneratedHashtags('#SkillHub #SouthAfrica #Craftsmanship #YouthSkills');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-[#121212] border border-emerald-500/30 rounded-2xl p-4 text-white space-y-3">
      <div className="flex items-center gap-2 text-emerald-400">
        <Sparkles className="w-4 h-4" />
        <h4 className="text-xs font-black uppercase tracking-wider">AI Post & Caption Enhancer</h4>
      </div>

      <form onSubmit={handleGenerate} className="space-y-2">
        <input
          type="text"
          placeholder="e.g. Installed 5kW solar inverter in Soweto or completed React bootcamp"
          value={topicPrompt}
          onChange={(e) => setTopicPrompt(e.target.value)}
          className="w-full bg-[#1e1e1e] border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
        />

        <button
          type="submit"
          disabled={isGenerating || !topicPrompt.trim()}
          className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Generating AI Caption...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate AI Caption & Hashtags</span>
            </>
          )}
        </button>
      </form>

      {generatedCaption && (
        <div className="p-3 bg-[#1e1e1e] border border-neutral-800 rounded-xl space-y-2 animate-in fade-in duration-200">
          <p className="text-xs text-neutral-200 leading-relaxed font-medium">{generatedCaption}</p>
          <p className="text-xs text-emerald-400 font-bold">{generatedHashtags}</p>

          <div className="pt-2 flex justify-end gap-2">
            <button
              onClick={() => {
                onApplyCaption(generatedCaption, generatedHashtags);
              }}
              className="px-3 py-1.5 bg-emerald-500 text-slate-950 font-black text-xs rounded-lg flex items-center gap-1"
            >
              <Send className="w-3 h-3" />
              <span>Apply to Post</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
