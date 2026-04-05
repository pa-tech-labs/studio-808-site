import { useEffect, useRef, useState } from 'react'
import { ACCENT, BG, BORDER, F_BODY, MUTED, SURF, TEXT } from '../styles'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const GREETING = "Hi! I'm the Studio 808 assistant. Ask me anything about our studios, pricing, or how to book — I'm here to help."

const CONTACT_TRIGGERS = [
  'speak to someone', 'talk to someone', 'human', 'real person',
  'contact you', 'email you', 'phone', 'call you', "can't help",
  "cannot help", 'more information', 'get in touch',
]

function needsContactButton(text: string): boolean {
  const lower = text.toLowerCase()
  return CONTACT_TRIGGERS.some(t => lower.includes(t))
}

// Chat bubble icon
function ChatIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}

export default function ChatWidget() {
  const [open, setOpen]         = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [showContact, setShowContact] = useState(false)
  const [visible, setVisible]   = useState(false) // for animation
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLTextAreaElement>(null)

  // Animate open/close
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => setVisible(true))
      setTimeout(() => inputRef.current?.focus(), 150)
    } else {
      setVisible(false)
    }
  }, [open])

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage() {
    const text = input.trim()
    if (!text || loading) return

    const newMessages: Message[] = [...messages, { role: 'user', content: text }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })
      const data = await res.json()
      const reply: string = data.reply ?? "Sorry, I couldn't get a response. Please try again or email admin@studio-808.com."
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
      if (needsContactButton(reply)) setShowContact(true)
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting right now. Please email admin@studio-808.com and we'll get back to you." }])
      setShowContact(true)
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const panelStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '88px',
    right: '24px',
    width: '360px',
    maxWidth: 'calc(100vw - 32px)',
    height: '520px',
    maxHeight: 'calc(100vh - 120px)',
    background: SURF,
    border: `1px solid ${BORDER}`,
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
    fontFamily: F_BODY,
    zIndex: 9999,
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.97)',
    transition: 'opacity 0.2s ease, transform 0.2s ease',
    pointerEvents: open ? 'auto' : 'none',
  }

  return (
    <>
      {/* Chat panel */}
      <div style={panelStyle} aria-hidden={!open}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 18px', borderBottom: `1px solid ${BORDER}`,
          background: BG,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ChatIcon />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: TEXT, lineHeight: 1.2 }}>Studio 808</div>
              <div style={{ fontSize: '11px', color: MUTED }}>AI assistant</div>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED, padding: '4px', display: 'flex', borderRadius: '6px' }}
            aria-label="Close chat"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Greeting */}
          <AssistantBubble text={GREETING} />

          {messages.map((m, i) => (
            m.role === 'user'
              ? <UserBubble key={i} text={m.content} />
              : <AssistantBubble key={i} text={m.content} />
          ))}

          {loading && (
            <div style={{ display: 'flex', gap: '5px', padding: '10px 0 4px' }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  width: '7px', height: '7px', borderRadius: '50%',
                  background: MUTED,
                  animation: `chatDot 1.2s ease-in-out ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
          )}

          {showContact && !loading && (
            <div style={{ marginTop: '4px' }}>
              <a
                href="mailto:admin@studio-808.com?subject=Studio%20808%20Enquiry"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '8px 14px', borderRadius: '8px',
                  background: 'transparent', border: `1px solid ${ACCENT}`,
                  color: ACCENT, fontSize: '13px', fontWeight: 600,
                  textDecoration: 'none', transition: 'background 0.15s',
                }}
              >
                Email us →
              </a>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '12px 14px', borderTop: `1px solid ${BORDER}`, display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about studios, pricing, booking…"
            rows={1}
            disabled={loading}
            style={{
              flex: 1, resize: 'none', background: BG,
              border: `1px solid ${BORDER}`, borderRadius: '10px',
              padding: '10px 12px', fontFamily: F_BODY,
              fontSize: '14px', color: TEXT, outline: 'none',
              lineHeight: 1.5, maxHeight: '100px', overflowY: 'auto',
              opacity: loading ? 0.6 : 1,
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            style={{
              width: '38px', height: '38px', borderRadius: '10px',
              background: ACCENT, border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', flexShrink: 0,
              opacity: (!input.trim() || loading) ? 0.4 : 1,
              transition: 'opacity 0.15s',
            }}
            aria-label="Send"
          >
            <SendIcon />
          </button>
        </div>
      </div>

      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close chat' : 'Open chat'}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: ACCENT,
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          boxShadow: '0 4px 20px rgba(232,53,90,0.45)',
          zIndex: 10000,
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)'
          ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 28px rgba(232,53,90,0.6)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
          ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(232,53,90,0.45)'
        }}
      >
        <div style={{ transition: 'opacity 0.15s, transform 0.15s', opacity: open ? 0 : 1, transform: open ? 'scale(0.7) rotate(20deg)' : 'scale(1)', position: 'absolute' }}>
          <ChatIcon />
        </div>
        <div style={{ transition: 'opacity 0.15s, transform 0.15s', opacity: open ? 1 : 0, transform: open ? 'scale(1)' : 'scale(0.7) rotate(-20deg)', position: 'absolute' }}>
          <CloseIcon />
        </div>
      </button>

      {/* Dot animation keyframes */}
      <style>{`
        @keyframes chatDot {
          0%, 80%, 100% { opacity: 0.25; transform: scale(0.8); }
          40%            { opacity: 1;    transform: scale(1);   }
        }
      `}</style>
    </>
  )
}

function UserBubble({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{
        background: ACCENT,
        color: '#fff',
        borderRadius: '14px 14px 4px 14px',
        padding: '9px 13px',
        fontSize: '14px',
        lineHeight: 1.55,
        maxWidth: '85%',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}>
        {text}
      </div>
    </div>
  )
}

function AssistantBubble({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
      <div style={{
        background: 'rgba(240,237,232,0.06)',
        color: TEXT,
        borderRadius: '14px 14px 14px 4px',
        padding: '9px 13px',
        fontSize: '14px',
        lineHeight: 1.55,
        maxWidth: '92%',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        border: `1px solid ${BORDER}`,
      }}>
        {text}
      </div>
    </div>
  )
}
