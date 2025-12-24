import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Floating sparkle for AI effect around isotipo
const FloatingSparkle = ({ delay, size, duration, startX, startY, endX, endY }: {
  delay: number;
  size: number;
  duration: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}) => (
  <motion.div
    className="absolute rounded-full"
    style={{
      width: size,
      height: size,
      background: 'linear-gradient(135deg, #69E185 0%, #fff 100%)',
      boxShadow: '0 0 6px 2px rgba(105, 225, 133, 0.6)',
    }}
    initial={{ x: startX, y: startY, scale: 0, opacity: 0 }}
    animate={{
      x: [startX, endX, startX],
      y: [startY, endY, startY],
      scale: [0, 1.2, 0.8, 1, 0],
      opacity: [0, 1, 1, 0.8, 0],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  />
);

// AI sparkles orbiting around isotipo
const OrbitingSparkles = () => {
  const sparkles = [
    { delay: 0, size: 4, duration: 2.5, startX: -10, startY: -20, endX: 20, endY: -15 },
    { delay: 0.4, size: 3, duration: 2.8, startX: 25, startY: 0, endX: 30, endY: 15 },
    { delay: 0.8, size: 5, duration: 2.2, startX: 15, startY: 25, endX: -10, endY: 30 },
    { delay: 1.2, size: 3, duration: 2.6, startX: -20, startY: 10, endX: -25, endY: -5 },
    { delay: 0.2, size: 4, duration: 3, startX: 0, startY: -25, endX: 10, endY: -30 },
    { delay: 0.6, size: 3, duration: 2.4, startX: -5, startY: 30, endX: 5, endY: 25 },
  ];

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {sparkles.map((s, i) => (
        <FloatingSparkle key={i} {...s} />
      ))}
    </div>
  );
};

// Avoqado Isotipo SVG with glow effect
const Isotipo = ({ className, glowing = false }: { className?: string; glowing?: boolean }) => (
  <motion.svg
    viewBox="0 0 732.5 893.3"
    className={className}
    fill="none"
    animate={glowing ? {
      filter: ['drop-shadow(0 0 8px rgba(105, 225, 133, 0.4))', 'drop-shadow(0 0 16px rgba(105, 225, 133, 0.7))', 'drop-shadow(0 0 8px rgba(105, 225, 133, 0.4))']
    } : {}}
    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
  >
    <path
      fill="#69E185"
      d="M712.7,486.2c-3.3-83.5-37.8-157.2-99.8-213.1c-27.9-28.7-63.2-57.2-104.9-84.8c16-81.7,12.9-116.7-31.4-155.5l-2.4-2.1l-3.1-0.9c-33-9.4-58.6-7.7-78.1,5.1c-29.8,19.5-39.9,60.9-45.2,117.3c-131.6,12.1-242.1,95.5-296.3,224.2c-56.5,134-37,280.8,49.8,374.1c3.4,3.5,10.3,10.6,157,98l1.1,0.7l1.2,0.5c36,13.2,72.6,19.8,108.8,19.8c39.2,0,78.1-7.7,115.4-23.2c63.9-26.5,121.9-75.8,163.3-138.7C692.8,639.9,715.7,561.3,712.7,486.2z M580.3,507.4c-0.3,58-40.2,116.3-118.7,173.3C374.3,744.2,279.3,710,228,651.3c-43.8-50-65.3-119.8-56.1-182c4.8-32.5,20.5-77.7,68-108.3c64.6-41.7,110-56.7,144.4-56.7c45.6,0,71.8,26.4,97.4,52.4c10.4,10.5,20.2,20.4,31.3,28.6C545.7,409.4,580.5,454.2,580.3,507.4z"
    />
    <path
      fill="#C9712F"
      d="M362.2,412c-26.8,0-53.6,17.9-75.5,50.5c-18.4,27.3-30.3,61.1-30.3,86c0,49.5,47.4,89.7,105.7,89.7S468,598,468,548.5c0-24.9-11.9-58.7-30.3-86C415.8,430,389,412,362.2,412z"
    />
  </motion.svg>
);

// Animated question prompts - about Avoqado as a platform
const HOVER_QUESTIONS = [
  "¿Cuánto cuesta Avoqado?",
  "¿Qué incluye el plan Pro?",
  "¿Cómo funciona el TPV?",
  "¿Tienen prueba gratis?",
  "¿Se integra con mi POS actual?",
  "¿Qué métodos de pago aceptan?",
  "¿Cómo es el soporte técnico?",
  "¿Funciona para mi tipo de negocio?",
];

type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  source?: 'local' | 'ai' | 'fallback' | 'error';
};

const WHATSAPP_NUMBER = '525640070001';
const WHATSAPP_MESSAGE = 'Hola, me interesa saber más sobre Avoqado';
const STORAGE_KEY = 'avoqado-chat-history';
const OPEN_STATE_KEY = 'avoqado-chat-open';

const SUGGESTED_QUESTIONS = [
  '¿Qué es Avoqado?',
  '¿Cuánto cuesta?',
  '¿Qué sectores?',
];

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  content: '¡Hola! 👋 Pregúntame lo que quieras sobre Avoqado: qué hace la plataforma, precios, funcionalidades, sectores, y más.',
  role: 'assistant',
  source: 'local'
};

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  // Check mobile state
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Simple scroll lock for mobile - don't fight iOS keyboard behavior
  useEffect(() => {
    if (!isOpen || !isMobile) return;

    // Simple approach: hide overflow on html and body
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyOverflow = document.body.style.overflow;
    
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    return () => {
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overflow = originalBodyOverflow;
    };
  }, [isOpen, isMobile]);

  // Load chat state from localStorage on mount
  useEffect(() => {
    try {
      // Load open state
      const wasOpen = localStorage.getItem(OPEN_STATE_KEY);
      if (wasOpen === 'true') {
        setIsOpen(true);
      }
      
      // Load messages
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch (e) {
      console.error('Error loading chat state:', e);
    }
  }, []);

  // Save open state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(OPEN_STATE_KEY, isOpen ? 'true' : 'false');
    } catch (e) {
      console.error('Error saving open state:', e);
    }
  }, [isOpen]);

  // Save chat history to localStorage when messages change
  useEffect(() => {
    try {
      if (messages.length > 1) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      }
    } catch (e) {
      console.error('Error saving chat history:', e);
    }
  }, [messages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Rotate through questions when hovered
  useEffect(() => {
    if (isHovered && !isOpen) {
      const interval = setInterval(() => {
        setQuestionIndex((prev) => (prev + 1) % HOVER_QUESTIONS.length);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [isHovered, isOpen]);

  // Cleanup hover timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    // Small delay before hiding to prevent flickering
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 150);
  };

  const clearHistory = () => {
    setMessages([WELCOME_MESSAGE]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: content.trim(),
      role: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const currentMessages = messages.filter(m => m.id !== 'welcome');
      const history = [...currentMessages, userMessage].map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: content.trim(),
          history: history.slice(-6)
        })
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        content: data.answer || 'Lo siento, no pude procesar tu pregunta.',
        role: 'assistant',
        source: data.source
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        content: 'Hubo un error. Intenta de nuevo o contáctanos por WhatsApp.',
        role: 'assistant',
        source: 'error'
      }]);
    } finally {
      setIsLoading(false);
      // Refocus input after response
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  // Parse markdown links [text](url) and render as clickeable, also handle newlines
  const renderMessageContent = (content: string, role: 'user' | 'assistant') => {
    // Split by newlines first to preserve line breaks
    const lines = content.split('\n');
    
    return lines.map((line, lineIndex) => {
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      const parts: React.ReactNode[] = [];
      let lastIndex = 0;
      let match;

      while ((match = linkRegex.exec(line)) !== null) {
        // Add text before the link
        if (match.index > lastIndex) {
          parts.push(line.slice(lastIndex, match.index));
        }
        // Add the link
        const [, text, url] = match;
        parts.push(
          <a
            key={`${lineIndex}-${match.index}`}
            href={url}
            className={`underline hover:opacity-80 ${role === 'user' ? 'text-black font-medium' : 'text-avoqado-green'}`}
          >
            {text}
          </a>
        );
        lastIndex = match.index + match[0].length;
      }

      // Add remaining text
      if (lastIndex < line.length) {
        parts.push(line.slice(lastIndex));
      }

      // Return the line with a line break if not the last line
      return (
        <span key={lineIndex}>
          {parts.length > 0 ? parts : line}
          {lineIndex < lines.length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <>
      {/* Floating Button Container */}
      <div
        className={`fixed bottom-6 right-6 z-50 cursor-pointer transition-opacity duration-300 ${isOpen && isMobile ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Hover Tooltip - appears above the button, HIDDEN on mobile */}
        <AnimatePresence>
          {isHovered && !isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="hidden lg:block absolute bottom-full right-0 mb-4 origin-bottom-right"
            >
              <div className="relative bg-gray-950/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl shadow-black/50 min-w-[240px] cursor-pointer" onClick={() => setIsOpen(true)}>
                {/* Glow effect behind card */}
                <div className="absolute -inset-1 bg-gradient-to-r from-avoqado-green/20 via-transparent to-avoqado-green/10 rounded-2xl blur-lg opacity-50" />

                <div className="relative flex items-start gap-4">
                  {/* Isotipo with sparkles */}
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <Isotipo className="w-full h-full" glowing />
                    <OrbitingSparkles />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-avoqado-green">Avoqado AI</span>
                      <motion.span
                        className="w-2 h-2 rounded-full bg-avoqado-green"
                        animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    </div>

                    {/* Rotating question */}
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={questionIndex}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.3 }}
                        className="text-white text-sm font-medium leading-snug"
                      >
                        {HOVER_QUESTIONS[questionIndex]}
                      </motion.p>
                    </AnimatePresence>

                    <p className="text-gray-500 text-xs mt-1.5">
                      Click para preguntar
                    </p>
                  </div>
                </div>

                {/* Arrow pointer */}
                <div className="absolute -bottom-2 right-6 w-4 h-4 bg-gray-950/95 border-r border-b border-white/10 rotate-45" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Button */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-14 h-14 rounded-full bg-black text-white shadow-lg shadow-black/50 flex items-center justify-center active:scale-95 transition-transform duration-200 border border-white/20 cursor-pointer"
          whileHover={{ scale: 1.1, rotate: isOpen ? 0 : 15 }}
          aria-label={isOpen ? 'Cerrar chat' : 'Abrir chat de ayuda'}
          style={{
            animation: isOpen ? 'none' : 'subtle-pulse 3s ease-in-out infinite'
          }}
        >
          {/* Glow ring on hover */}
          <AnimatePresence>
            {isHovered && !isOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(105, 225, 133, 0.3) 0%, transparent 70%)',
                  filter: 'blur(4px)',
                }}
              />
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.svg
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                className="w-6 h-6 relative z-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </motion.svg>
            ) : (
              <motion.svg
                key="sparkle"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="w-7 h-7 relative z-10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                <path d="M20 3v4" />
                <path d="M22 5h-4" />
                <path d="M4 17v2" />
                <path d="M5 18H3" />
              </motion.svg>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Pulse animation */}
      <style>{`
        @keyframes subtle-pulse {
          0%, 100% { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 0 0 0 rgba(255, 255, 255, 0.1); }
          50% { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 0 0 8px rgba(255, 255, 255, 0); }
        }
      `}</style>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-window"
            ref={chatContainerRef}
            initial={isMobile ? { y: '100%' } : { opacity: 0, y: 20, scale: 0.95 }}
            animate={isMobile ? { y: 0 } : { opacity: 1, y: 0, scale: 1 }}
            exit={isMobile ? { y: '100%' } : { opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`
              flex flex-col bg-gray-950 border border-white/10 shadow-2xl shadow-black/50 overflow-hidden z-[500]
              ${isMobile 
                ? 'fixed inset-0 w-full h-full rounded-none' 
                : 'fixed bottom-24 right-4 left-4 sm:left-auto sm:right-6 sm:w-96 max-w-md rounded-2xl'
              }
            `}
            style={!isMobile ? { maxHeight: 'min(70vh, 500px)' } : undefined}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-avoqado-green/20 to-emerald-600/10 border-b border-white/10 px-4 py-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-avoqado-green/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-avoqado-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                  <path d="M20 3v4" />
                  <path d="M22 5h-4" />
                  <path d="M4 17v2" />
                  <path d="M5 18H3" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-white font-medium text-sm">¿Dudas sobre Avoqado?</h3>
                <p className="text-gray-400 text-xs">Pregúntame sobre precios, funciones, sectores...</p>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 1 && (
                  <button
                    onClick={clearHistory}
                    className="text-gray-500 hover:text-white transition-colors p-1"
                    aria-label="Limpiar historial"
                    title="Limpiar historial"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-white transition-colors p-1"
                  aria-label="Cerrar chat"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px]">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-avoqado-green text-black rounded-br-md'
                        : 'bg-white/10 text-white rounded-bl-md'
                    }`}
                  >
                    {renderMessageContent(msg.content, msg.role)}
                    {msg.role === 'assistant' && msg.source === 'ai' && (
                      <span className="block text-[10px] text-gray-500 mt-1 opacity-60">✨ IA</span>
                    )}
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="bg-white/10 px-4 py-3 rounded-2xl rounded-bl-md">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions */}
            {messages.length <= 2 && !isLoading && (
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-xs bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white px-3 py-1.5 rounded-full border border-white/10 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="border-t border-white/10 p-3">
              <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2 focus-within:ring-1 focus-within:ring-avoqado-green/50 transition-all">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribe tu pregunta..."
                  disabled={isLoading}
                  style={{
                    fontSize: '16px',  // Prevents iOS zoom
                    transform: 'scale(0.875)',  // Visually ~14px
                    transformOrigin: 'left center',
                  }}
                  className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none disabled:opacity-50"
                />
                <button
                  onClick={() => sendMessage(inputValue)}
                  disabled={!inputValue.trim() || isLoading}
                  className={`p-2 rounded-lg transition-all ${
                    inputValue.trim() && !isLoading
                      ? 'bg-avoqado-green text-black hover:scale-105'
                      : 'bg-white/5 text-gray-600 cursor-not-allowed'
                  }`}
                  aria-label="Enviar mensaje"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                </button>
              </div>
            </div>

            {/* WhatsApp Footer */}
            <div className="border-t border-white/10 px-4 py-3 bg-white/5">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white transition-colors group"
              >
                <svg className="w-5 h-5 text-[#25D366] group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span>¿Prefieres hablar por WhatsApp?</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
