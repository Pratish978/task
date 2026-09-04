"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

const initialMessage: Message = {
  id: 1,
  role: "assistant",
  content:
    "Hi! 👋 I'm Schedula AI Care Assistant. I can help you with appointments, doctors, Schedula features, and general healthcare questions. How can I help you?",
};

export default function CareAssistant() {
  const [isOpen, setIsOpen] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    initialMessage,
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  /*
   * Open chatbot from buttons elsewhere on the homepage
   */
  useEffect(() => {
    const openAssistant = () => {
      setIsOpen(true);
    };

    window.addEventListener(
      "open-care-assistant",
      openAssistant
    );

    return () => {
      window.removeEventListener(
        "open-care-assistant",
        openAssistant
      );
    };
  }, []);

  /*
   * Automatically scroll to latest message
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  const sendMessage = async () => {
    const trimmedMessage = input.trim();

    if (!trimmedMessage || loading) {
      return;
    }

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: trimmedMessage,
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmedMessage,
        }),
      });

      /*
       * Get response as text first.
       * This prevents "Unexpected token <" errors
       * if Next.js returns an HTML error page.
       */
      const rawResponse = await response.text();

      console.log("API status:", response.status);
      console.log("API response:", rawResponse);

      let data: {
        reply?: string;
        error?: string;
      };

      try {
        data = JSON.parse(rawResponse);
      } catch {
        throw new Error(
          `Server returned invalid JSON. Status: ${response.status}`
        );
      }

      if (!response.ok) {
        throw new Error(
          data.error ||
            `API request failed with status ${response.status}`
        );
      }

      if (!data.reply) {
        throw new Error(
          "The AI returned an empty response."
        );
      }

      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.reply,
      };

      setMessages((previous) => [
        ...previous,
        assistantMessage,
      ]);
    } catch (error) {
      console.error("Care Assistant error:", error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to connect to the AI assistant.";

      const assistantError: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: `⚠️ ${errorMessage}`,
      };

      setMessages((previous) => [
        ...previous,
        assistantError,
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating AI Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl text-white shadow-2xl transition hover:scale-110 hover:bg-blue-700"
          aria-label="Open AI Care Assistant"
        >
          🤖
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[650px] w-[380px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-xl">
                🤖
              </div>

              <div>
                <h3 className="font-bold">
                  Schedula AI
                </h3>

                <p className="text-xs text-blue-100">
                  AI Care Assistant
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-xl transition hover:bg-white/30"
              aria-label="Close assistant"
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50 p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    message.role === "user"
                      ? "rounded-br-md bg-blue-600 text-white"
                      : "rounded-bl-md bg-white text-gray-800 shadow-sm"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md bg-white px-4 py-3 text-sm text-gray-500 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span>AI is thinking</span>

                    <span className="flex gap-1">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {!loading && messages.length <= 1 && (
            <div className="border-t bg-white px-4 py-3">
              <p className="mb-2 text-xs font-semibold text-gray-500">
                Quick questions
              </p>

              <div className="flex flex-wrap gap-2">
                {[
                  "How do I book an appointment?",
                  "What can you help me with?",
                  "How does Schedula work?",
                ].map((question) => (
                  <button
                    key={question}
                    onClick={() => {
                      setInput(question);
                    }}
                    className="rounded-full border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700 transition hover:bg-blue-100"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t bg-white p-4">
            <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 p-2 focus-within:border-blue-400">
              <input
                type="text"
                value={input}
                onChange={(event) =>
                  setInput(event.target.value)
                }
                onKeyDown={handleKeyDown}
                placeholder="Ask Schedula AI..."
                disabled={loading}
                className="flex-1 bg-transparent px-2 py-2 text-sm text-gray-800 outline-none placeholder:text-gray-400 disabled:opacity-50"
              />

              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Send message"
              >
                ➤
              </button>
            </div>

            <p className="mt-2 text-center text-[10px] text-gray-400">
              AI responses are for general information only and
              are not a substitute for professional medical advice.
            </p>
          </div>
        </div>
      )}
    </>
  );
}