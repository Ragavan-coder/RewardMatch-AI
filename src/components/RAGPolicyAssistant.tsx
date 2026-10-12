import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  ExternalLink,
  ShieldCheck,
  FileText,
  Loader2,
  HelpCircle,
} from 'lucide-react';
import { queryPolicyRAG, type RAGResponse } from '../services/api';

export const RAGPolicyAssistant: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [response, setResponse] = useState<RAGResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const sampleQuestions = [
    'Which card has the best verified reward rate for groceries?',
    'Which of my supported cards earns rewards on eligible UPI merchant payments?',
    'Does this offer exclude wallet loading?',
    'What are the lounge visit rules for HDFC Regalia Gold?',
  ];

  const handleAsk = async (textToAsk?: string) => {
    const q = textToAsk || query;
    if (!q.trim()) return;
    setIsLoading(true);
    setQuery(q);
    try {
      const res = await queryPolicyRAG(q);
      setResponse(res);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* HEADER BANNER */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#18080a] via-[#100406] to-[#070707] border border-[#FF3038]/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#E5B567] uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-[#FF3038]" />
            FastAPI + Sentence Transformers Policy RAG
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            AI Policy & Eligibility Assistant
          </h2>
          <p className="text-xs text-[#A6A6A6] mt-1 max-w-2xl">
            Ask any financial policy question. Grounded in indexed bank Schedule of Charges (MITC) and NPCI circulars with zero hallucination.
          </p>
        </div>
      </div>

      {/* SEARCH BOX */}
      <div className="p-5 rounded-3xl bg-[#120808]/90 border border-white/10 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#A6A6A6] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
              placeholder="Ask a policy question (e.g. 'Which card earns rewards on UPI merchant payments?')..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#FF3038]"
            />
          </div>

          <button
            onClick={() => handleAsk()}
            disabled={isLoading || !query.trim()}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#FF3038] to-[#A30016] text-white text-xs font-bold shadow-[0_0_15px_rgba(255,48,56,0.5)] cursor-pointer flex items-center gap-2 disabled:opacity-50 whitespace-nowrap"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Analyzing Policy...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-[#E5B567]" />
                Ask RAG Engine
              </>
            )}
          </button>
        </div>

        {/* QUICK QUESTIONS PILLS */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-[11px] text-[#A6A6A6] font-medium mr-1 flex items-center gap-1">
            <HelpCircle className="w-3 h-3" /> Quick Prompts:
          </span>
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleAsk(q)}
              className="px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-[11px] transition-colors cursor-pointer text-left"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* RAG RESPONSE SECTION */}
      {response && (
        <div className="p-6 rounded-3xl bg-gradient-to-b from-[#18080a] to-[#0c0406] border border-[#FF3038]/50 shadow-2xl space-y-5 animate-fadeIn">
          {/* Header Badges */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Official Bank Policy Verification
              </span>
              <h3 className="text-lg font-black text-white mt-1">
                {response.verified_recommendation || 'Policy Verification Complete'}
              </h3>
            </div>

            {response.deterministic_rule_match && (
              <span className="text-[11px] font-mono px-3 py-1 rounded-xl bg-white/10 text-[#E5B567] border border-white/10">
                {response.deterministic_rule_match}
              </span>
            )}
          </div>

          {/* Answer Text */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 text-xs text-white/95 leading-relaxed whitespace-pre-line">
            {response.answer}
          </div>

          {/* Citations List */}
          {response.citations && response.citations.length > 0 && (
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#FF3038]" /> Official Source Citations ({response.citations.length})
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {response.citations.map((cite, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between text-xs space-y-2 hover:border-[#FF3038]/40 transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-[#A6A6A6] font-mono mb-1">
                        <span>{cite.publisher}</span>
                        <span className="text-[#E5B567]">Score: {cite.relevance_score}</span>
                      </div>
                      <h4 className="font-bold text-white text-xs line-clamp-1">{cite.source_title}</h4>
                      <p className="text-[11px] text-white/70 italic mt-1 line-clamp-3 leading-relaxed">
                        "{cite.passage_snippet}"
                      </p>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px]">
                      <span className="text-[#A6A6A6]">{cite.effective_dates}</span>
                      <a
                        href={cite.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#FF5E66] hover:text-[#FF3038] font-bold flex items-center gap-1"
                      >
                        Verify URL <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
