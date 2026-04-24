'use client';
import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Minimize2, Sparkles } from 'lucide-react';
import type { ChatMessage } from '@/lib/types';

const QUICK_QUESTIONS = [
  'What is demographic parity?',
  'How do I fix this bias?',
  'Explain disparate impact',
  'What is equal opportunity?',
];

const MOCK_RESPONSES: Record<string, string> = {
  default: "I'm analyzing your dataset's fairness metrics. Based on the results, I can see significant demographic disparities. The fairness score of 42/100 indicates **High Risk** bias. I recommend starting with data reweighting as the first mitigation step — it's the easiest to implement and offers a 28-point improvement.",
  'What is demographic parity?': "**Demographic Parity** (also called Statistical Parity) is a fairness criterion that requires a model to have equal positive prediction rates across all demographic groups.\n\nIn your dataset: Male selection rate is **72%** while Female is only **41%** — a gap of **31%**. Ideally this gap should be ≤5% for a fair model.",
  'How do I fix this bias?': "Based on your dataset, I recommend these steps in order:\n\n1. **Reweighting (Easiest)** — Assign higher weights to underrepresented groups. Estimated improvement: +28 pts\n2. **Remove proxy features** — ZIP code correlates with race in 67% of cases. Drop it.\n3. **Equalized Odds** — Apply post-processing fairness constraints for +35 pts improvement\n\nStart with #1 — it's non-invasive and gives the most bang for your buck.",
  'Explain disparate impact': "**Disparate Impact Ratio** measures whether a selection process disproportionately affects a protected group.\n\nFormula: `min_group_rate / max_group_rate`\n\nYour score: **0.68** (Female rate / Male rate = 41% / 72%)\n\nThe 80% Rule (Uniform Guidelines) states a ratio below **0.80** indicates adverse impact. Your ratio of 0.68 is below this threshold — legally actionable in many jurisdictions.",
  'What is equal opportunity?': "**Equal Opportunity Difference** measures whether your model gives equally qualified candidates from all groups the same chance of a positive outcome.\n\nYour current gap: **0.24** (24% difference in true positive rates between groups).\n\nThis means qualified female candidates are correctly identified 24% less often than equally qualified male candidates — even when controlling for qualifications.",
};

export default function ChatPanel() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'assistant',
      content: "👋 Hi! I'm your **BiasLens AI Assistant**. I can explain fairness metrics, help you understand detected bias, and suggest remediation strategies.\n\nAsk me anything about your dataset analysis!",
      timestamp: new Date(),
    },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    await new Promise((r) => setTimeout(r, 1000 + Math.random() * 800));

    const response = MOCK_RESPONSES[text] ?? MOCK_RESPONSES.default;
    const botMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: response, timestamp: new Date() };
    setMessages((prev) => [...prev, botMsg]);
    setLoading(false);
  };

  function renderText(text: string) {
    return text.split('\n').map((line, i) => {
      const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      const code = bold.replace(/`(.*?)`/g, '<code class="font-mono bg-white/10 px-1 rounded text-[#00d4ff]">$1</code>');
      return <p key={i} className="mb-1 last:mb-0 text-[12px] leading-relaxed" dangerouslySetInnerHTML={{ __html: code }} />;
    });
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-110"
          style={{ background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', boxShadow: '0 0 30px rgba(0,212,255,0.4)' }}
          aria-label="Open AI chat"
        >
          <MessageSquare size={22} className="text-white" />
          <span className="absolute top-1 right-1 w-3 h-3 bg-[#10b981] rounded-full border-2 border-[#0a0a0f]" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div
          className={`fixed bottom-6 right-6 z-50 w-[360px] rounded-2xl border border-white/[0.1] overflow-hidden transition-all duration-300 ${minimized ? 'h-[56px]' : 'h-[500px]'}`}
          style={{ background: '#0f0f1a', boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 30px rgba(0,212,255,0.1)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.07]"
            style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.08), rgba(124,58,237,0.08))' }}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #00d4ff, #7c3aed)' }}>
                <Sparkles size={14} className="text-white" />
              </div>
              <div>
                <div className="text-[13px] font-semibold text-white">BiasLens Assistant</div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                  <span className="text-[10px] text-[#10b981]">Online</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setMinimized(!minimized)} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#475569] hover:text-[#94a3b8] hover:bg-white/[0.05] transition-all">
                <Minimize2 size={13} />
              </button>
              <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#475569] hover:text-[#ef4444] hover:bg-white/[0.05] transition-all">
                <X size={13} />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{ height: 'calc(500px - 128px)' }}>
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      msg.role === 'assistant'
                        ? 'bg-gradient-to-br from-[#00d4ff] to-[#7c3aed]'
                        : 'bg-white/10'
                    }`}>
                      {msg.role === 'assistant' ? <Bot size={12} className="text-white" /> : <User size={12} className="text-[#94a3b8]" />}
                    </div>
                    <div className={`max-w-[85%] px-3 py-2 ${msg.role === 'user' ? 'chat-message-user' : 'chat-message-assistant'}`}>
                      {renderText(msg.content)}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#00d4ff] to-[#7c3aed] flex items-center justify-center">
                      <Bot size={12} className="text-white" />
                    </div>
                    <div className="chat-message-assistant px-3 py-3">
                      <div className="typing-indicator flex gap-1">
                        <span /><span /><span />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Quick questions */}
              <div className="px-3 pb-1 flex gap-1.5 overflow-x-auto">
                {QUICK_QUESTIONS.map((q) => (
                  <button key={q} onClick={() => sendMessage(q)}
                    className="flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] font-medium text-[#94a3b8] border border-white/[0.08] bg-white/[0.03] hover:border-[rgba(0,212,255,0.3)] hover:text-[#00d4ff] transition-all whitespace-nowrap">
                    {q}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="px-3 pb-3 pt-2 border-t border-white/[0.06]">
                <div className="flex gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
                    placeholder="Ask about fairness, bias, fixes..."
                    className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-[12px] text-[#f1f5f9] placeholder-[#475569] outline-none focus:border-[rgba(0,212,255,0.3)] transition-colors"
                  />
                  <button
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || loading}
                    className="w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-40 transition-all hover:scale-105"
                    style={{ background: 'linear-gradient(135deg, #00d4ff, #7c3aed)' }}
                  >
                    <Send size={13} className="text-white" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
