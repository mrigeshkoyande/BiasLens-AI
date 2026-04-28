'use client';
import { useState, useRef, useEffect } from 'react';
import { usePipeline } from '@/lib/pipeline';
import { sendChatMessage } from '@/lib/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const QUICK_QUESTIONS = [
  'What is demographic parity?',
  'How do I fix this bias?',
  'Explain disparate impact',
  'What is equal opportunity?',
];

function renderMarkdown(text: string) {
  return text.split('\n').map((line, i) => {
    const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    const code = bold.replace(/`(.*?)`/g, '<code style="font-family:monospace;background:rgba(74,104,0,0.1);padding:1px 5px;border-radius:4px;font-size:11px;color:var(--ink)">$1</code>');
    return <p key={i} style={{ fontSize: 12, lineHeight: 1.6, marginBottom: 2 }} dangerouslySetInnerHTML={{ __html: code }} />;
  });
}

export default function ChatPanel() {
  const { analysis_id } = usePipeline();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: "👋 Hi! I'm your **BiasLens AI Assistant**. I can explain fairness metrics, help you understand detected bias, and suggest remediation strategies.\n\nAsk me anything about your dataset analysis!",
      timestamp: new Date(),
    },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (open && !minimized) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open, minimized]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await sendChatMessage(text, analysis_id || undefined);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I couldn't reach the backend. Please make sure the FastAPI server is running on port 8000.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ── Floating trigger button ── */}
      <button
        onClick={() => { setOpen((o) => !o); setMinimized(false); }}
        aria-label={open ? 'Close AI assistant' : 'Open AI assistant'}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 50,
          width: 56,
          height: 56,
          borderRadius: 999,
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: open ? 'var(--olive-deep)' : 'var(--lime)',
          boxShadow: open
            ? '0 8px 28px rgba(31,35,15,0.4)'
            : '0 8px 32px rgba(185,245,0,0.4)',
          transition: 'all 0.4s cubic-bezier(.22,1,.36,1)',
          transform: open ? 'rotate(45deg) scale(0.92)' : 'rotate(0deg) scale(1)',
        }}
      >
        <span
          className="material-symbols-outlined"
          style={{
            fontSize: 24,
            color: open ? 'var(--lime)' : 'var(--ink)',
            transition: 'color 0.3s',
          }}
        >
          {open ? 'close' : 'chat'}
        </span>

        {/* Online dot — only when closed */}
        {!open && (
          <span
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              width: 12,
              height: 12,
              borderRadius: 999,
              background: 'var(--olive-deep)',
              border: '2px solid var(--lime)',
              animation: 'pulse 2s cubic-bezier(.25,.1,.25,1) infinite',
            }}
          />
        )}
      </button>

      {/* ── Chat panel ── */}
      <div
        aria-hidden={!open}
        style={{
          position: 'fixed',
          bottom: 92,
          right: 24,
          zIndex: 50,
          width: 'min(360px, calc(100vw - 32px))',
          maxHeight: minimized ? 56 : 'min(520px, calc(100vh - 120px))',
          borderRadius: 24,
          border: '1px solid var(--line)',
          background: 'rgba(255,253,245,0.98)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.14), 0 4px 20px rgba(185,245,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          // iOS-style spring animation
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'all' : 'none',
          transform: open ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.92)',
          transition: open
            ? 'opacity 0.4s cubic-bezier(.22,1,.36,1), transform 0.4s cubic-bezier(.22,1,.36,1), max-height 0.4s cubic-bezier(.22,1,.36,1)'
            : 'opacity 0.25s cubic-bezier(.25,.1,.25,1), transform 0.25s cubic-bezier(.25,.1,.25,1), max-height 0.4s cubic-bezier(.22,1,.36,1)',
          transformOrigin: 'bottom right',
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            background: 'var(--lime)',
            borderBottom: '1px solid rgba(74,104,0,0.2)',
            minHeight: 56,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 12,
                background: 'var(--olive-deep)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--lime)' }}>
                psychology
              </span>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink)' }}>BiasLens Assistant</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 1 }}>
                <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--olive-deep)', display: 'inline-block' }} />
                <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--olive-deep)' }}>
                  {analysis_id ? 'Contextual Mode' : 'Online'}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button
              onClick={() => setMinimized((m) => !m)}
              aria-label={minimized ? 'Expand chat' : 'Minimize chat'}
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                border: 'none',
                background: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--olive-deep)',
                transition: 'background 0.2s',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                {minimized ? 'expand_less' : 'remove'}
              </span>
            </button>
            <button
              onClick={() => { setOpen(false); setMinimized(false); }}
              aria-label="Close chat"
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                border: 'none',
                background: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--olive-deep)',
                transition: 'background 0.2s',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
            </button>
          </div>
        </div>

        {/* ── Body (hidden when minimized) ── */}
        {!minimized && (
          <>
            {/* Messages area */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '12px 12px 8px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                minHeight: 0,
                scrollbarWidth: 'thin',
              }}
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    gap: 10,
                    flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                    animation: 'fadeInUp 0.3s cubic-bezier(.22,1,.36,1) both',
                  }}
                >
                  {/* Avatar */}
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 999,
                      flexShrink: 0,
                      marginTop: 2,
                      background: msg.role === 'assistant' ? 'var(--lime)' : 'var(--olive-deep)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 12, color: msg.role === 'assistant' ? 'var(--olive-deep)' : 'var(--lime)' }}
                    >
                      {msg.role === 'assistant' ? 'psychology' : 'person'}
                    </span>
                  </div>

                  {/* Bubble */}
                  <div
                    style={{
                      maxWidth: '82%',
                      padding: '8px 12px',
                      ...(msg.role === 'user'
                        ? {
                            background: 'var(--olive-deep)',
                            color: 'var(--lime)',
                            borderRadius: '16px 4px 16px 16px',
                          }
                        : {
                            background: 'var(--surface-2)',
                            border: '1px solid var(--line)',
                            color: 'var(--ink)',
                            borderRadius: '4px 16px 16px 16px',
                          }),
                    }}
                  >
                    {msg.role === 'user'
                      ? <p style={{ fontSize: 12, lineHeight: 1.6 }}>{msg.content}</p>
                      : renderMarkdown(msg.content)
                    }
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div style={{ display: 'flex', gap: 10 }}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 999,
                      background: 'var(--lime)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 12, color: 'var(--olive-deep)' }}>
                      psychology
                    </span>
                  </div>
                  <div
                    style={{
                      padding: '10px 14px',
                      background: 'var(--surface-2)',
                      border: '1px solid var(--line)',
                      borderRadius: '4px 16px 16px 16px',
                      display: 'flex',
                      gap: 4,
                      alignItems: 'center',
                    }}
                  >
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: 999,
                          background: 'var(--muted)',
                          display: 'inline-block',
                          animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* ── Quick question pills ── */}
            <div
              style={{
                flexShrink: 0,
                padding: '0 10px 8px',
                display: 'flex',
                gap: 6,
                overflowX: 'auto',
                scrollbarWidth: 'none',
              }}
            >
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  disabled={loading}
                  style={{
                    flexShrink: 0,
                    padding: '5px 10px',
                    borderRadius: 999,
                    border: '1px solid var(--line)',
                    background: 'var(--surface-2)',
                    color: 'var(--olive)',
                    fontSize: 10,
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.3s cubic-bezier(.22,1,.36,1)',
                    opacity: loading ? 0.5 : 1,
                  }}
                >
                  {q}
                </button>
              ))}
            </div>

            {/* ── Input bar ── */}
            <div
              style={{
                flexShrink: 0,
                padding: '8px 10px 12px',
                borderTop: '1px solid var(--line)',
              }}
            >
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  id="chat-query"
                  name="chat-query"
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send(input)}
                  placeholder="Ask about fairness, bias, fixes…"
                  disabled={loading}
                  style={{
                    flex: 1,
                    borderRadius: 14,
                    padding: '10px 14px',
                    fontSize: 12,
                    outline: 'none',
                    background: 'var(--surface-2)',
                    border: '1.5px solid var(--line)',
                    color: 'var(--ink)',
                    transition: 'border-color 0.3s cubic-bezier(.22,1,.36,1)',
                    fontFamily: 'inherit',
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--lime)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--line)'; }}
                />
                <button
                  onClick={() => send(input)}
                  disabled={!input.trim() || loading}
                  aria-label="Send message"
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    border: 'none',
                    background: 'var(--lime)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: !input.trim() || loading ? 'not-allowed' : 'pointer',
                    opacity: !input.trim() || loading ? 0.45 : 1,
                    transition: 'all 0.3s cubic-bezier(.22,1,.36,1)',
                    flexShrink: 0,
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--olive-deep)' }}>send</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
