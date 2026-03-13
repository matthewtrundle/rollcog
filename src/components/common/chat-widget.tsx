/**
 * @fileoverview AI Chat Widget for roofing expert assistance
 * @module components/common/chat-widget
 */

"use client";

import { type ReactElement, useState, useRef, useEffect, type FormEvent, useCallback } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

// Engaging opening facts to hook visitors
const OPENING_FACTS = [
  "Did you know? A single roof leak can cause $10,000+ in water damage before you even notice it. When did you last have yours inspected?",
  "Fun fact: White TPO roofing can reduce your cooling costs by up to 30%. Curious if it's right for your building?",
  "Here's something most people don't know: 40% of commercial roof failures happen in the first 5 years due to poor installation. We've been doing this for 27+ years.",
  "Quick fact: The average commercial roof replacement pays for itself in energy savings within 7 years. Want to know what yours could save?",
  "Did you know? Most roof warranties are voided by skipping annual inspections. When was your last one?",
  "Interesting: A well-maintained flat roof can last 25+ years. A neglected one? Maybe 10. Which category is yours in?",
  "Here's a costly mistake we see often: Waiting until a leak appears. By then, the damage underneath is usually 10x worse. Got questions about prevention?",
  "Pro tip: The best time to replace a roof is before it fails. The worst time? During a rainstorm with inventory at risk. How's your roof holding up?",
];

function getRandomOpeningMessage(): string {
  const randomIndex = Math.floor(Math.random() * OPENING_FACTS.length);
  return OPENING_FACTS[randomIndex];
}

export function ChatWidget(): ReactElement | null {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "welcome",
      role: "assistant",
      content: getRandomOpeningMessage(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Only show chatbot on Contact and About pages
  const showChatbotPages = ["/contact", "/about"];
  const shouldShow = showChatbotPages.some(page => pathname?.startsWith(page));

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3;
      audioRef.current.play().catch(() => {
        // Autoplay may be blocked - that's okay
      });
    }
  }, []);

  // Show greeting bubble after 4 seconds (only once per session)
  useEffect(() => {
    if (!shouldShow || hasInteracted) return;

    const timer = setTimeout(() => {
      if (!isOpen && !hasInteracted) {
        setShowGreeting(true);
        playNotificationSound();
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [shouldShow, isOpen, hasInteracted, playNotificationSound]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (!shouldShow) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [shouldShow, messages]);

  // Don't render if not on a chatbot page
  if (!shouldShow) {
    return null;
  }

  const handleOpenChat = (): void => {
    setIsOpen(true);
    setShowGreeting(false);
    setHasInteracted(true);
  };

  const handleCloseChat = (): void => {
    setIsOpen(false);
  };

  const handleDismissGreeting = (): void => {
    setShowGreeting(false);
    setHasInteracted(true);
  };

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Chat API error response:", response.status, errorText);
        throw new Error(`API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          assistantContent += chunk;

          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessage.id
                ? { ...m, content: assistantContent }
                : m
            )
          );
        }
      }

      // If we got no content, show an error
      if (!assistantContent.trim()) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessage.id
              ? { ...m, content: "I apologize, but I received an empty response. Please try again." }
              : m
          )
        );
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "I apologize, but I'm having trouble connecting right now. Please try again or contact us directly for assistance.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Notification Sound - using a simple tone */}
      <audio
        ref={audioRef}
        preload="auto"
        src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2LkZSQg3VtcoCNmJqUhXZrcH6MmJqUhXZrcH6MmJqUhXVqb36LlpiVhndtcoCNmJqUhXVqb36LlpmWhndtcoCOmZuWhndscn+MmJqWh3htcn+MmJqWh3htcn+MmJqWh3htcn+MmJqWh3htcn+MmJqWh3htcn+MmZuXiHltc4CNmZuXiHluc4CNmZuXiHluc4CNmZuXiHluc4CNmZuXiXpvc4GOmpyYinpvc4GOmp2ZinpwdIKPm52ZinpwdIKPm52ZinpwdIKPm52ZinpwdIKPm52ZinpwdIKPm52ZinpwdIKPm52ZinpwdIKPm52ZinpwdIKPm52ZinpwdIKPm52ZinpwdIKPm52ZinpwdIKPm52ZinpwdIKPm52ZinpwdIKPm52Zinpvc4GOmp2ZinpwdIKPm52ZinpwdIKPm52ZinpwdIKPm52ZinpwdIKPm52ZinpwdIKPm52ZinpwdIKPm52ZinpwdIKPm52ZinpwdIKPm52ZinpwdIKPm52ZinpwdIKPm52ZinpwdIKPm52ZinpwdIKPm52ZinpwdIKPm52Zintwc4KPm52ZintwdIKPm52Zi3twdIKQnJ6ajHxxdYOQnJ6ajHxxdYOQnJ6ajHxxdYOQnJ6ajHxxdYOQnJ6ajHxxdYOQnJ6ajHxxdYOQnJ6ajHxxdYOQnJ6ajH1ydoSRnZ+bj4BzeIWTn6Gdk4N3e4iWoaSglYZ6fYqZpKajmIl9gI2cp6mmm4yAg5CfqsConpGEhpOiray"
      />

      {/* Greeting Bubble */}
      <AnimatePresence>
        {showGreeting && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-24 right-6 z-50 max-w-[280px]"
          >
            {/* Dismiss button */}
            <button
              onClick={handleDismissGreeting}
              className="absolute -top-2 -left-2 w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center shadow-md transition-colors"
              aria-label="Dismiss greeting"
            >
              <svg className="w-3 h-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Message bubble */}
            <div
              className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 cursor-pointer hover:shadow-2xl transition-shadow"
              onClick={handleOpenChat}
            >
              <p className="text-gray-800 text-sm leading-relaxed">
                <span className="inline-block animate-wave">👋</span> Quick question...
                <br />
                <span className="text-gray-600">When was your roof last inspected?</span>
              </p>
            </div>

            {/* Arrow pointing to chat button */}
            <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white border-r border-b border-gray-100 transform rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Toggle Button */}
      <motion.button
        onClick={isOpen ? handleCloseChat : handleOpenChat}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[var(--accent)] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[var(--accent-dark)] transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {/* Notification badge */}
        {showGreeting && !isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold animate-pulse [animation-iteration-count:3]">
            1
          </span>
        )}

        {isOpen ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[380px] max-w-[380px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col"
            style={{ height: "min(500px, calc(100vh - 150px))" }}
          >
            {/* Header */}
            <div className="bg-[var(--charcoal)] text-white px-4 py-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--accent)] flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-sm">Roofing Expert</p>
                <p className="text-xs text-white/60">Ask me anything about commercial roofing</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                      message.role === "user"
                        ? "bg-[var(--accent)] text-white rounded-br-sm"
                        : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm"
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-800 shadow-sm border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-gray-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about roofing..."
                  aria-label="Type your roofing question"
                  className="flex-1 px-4 py-2.5 text-sm bg-gray-100 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:bg-white transition-colors"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  aria-label="Send message"
                  className="w-10 h-10 bg-[var(--accent)] text-white rounded-full flex items-center justify-center hover:bg-[var(--accent-dark)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wave animation style */}
      <style jsx global>{`
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(20deg); }
          75% { transform: rotate(-15deg); }
        }
        .animate-wave {
          animation: wave 1.5s ease-in-out 3;
          transform-origin: 70% 70%;
          display: inline-block;
        }
      `}</style>
    </>
  );
}
