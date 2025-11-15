import React, { useState, useRef, useEffect } from 'react';
import { Message, MessageRole, Resource } from '../types';
import { retrieveResources } from '../services/ragService';
import { generateGeminiResponse } from '../services/geminiService';
import { ResourceCard } from './ResourceCard';

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: MessageRole.Model,
      content: "Hi! I'm your NeuroResource assistant. I can help you find tools for executive function, sensory processing, workplace accommodations, and more. What are you looking for today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue.trim();
    setInputValue('');

    // Add User Message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: MessageRole.User,
      content: userText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // 1. RAG Retrieval Step
      const relevantResources = retrieveResources(userText);

      // 2. Generation Step
      const aiResponseText = await generateGeminiResponse(userText, relevantResources);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: MessageRole.Model,
        content: aiResponseText,
        timestamp: new Date(),
        relatedResources: relevantResources
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: MessageRole.System,
        content: "I encountered an error while processing your request. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleVoiceInput = () => {
    // Basic browser SpeechRecognition support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("Your browser doesn't support speech recognition.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(prev => prev + (prev ? ' ' : '') + transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  return (
    <div className="flex flex-col h-[600px] md:h-[700px]">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/50">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex flex-col ${msg.role === MessageRole.User ? 'items-end' : 'items-start'}`}
          >
            <div 
              className={`max-w-[85%] md:max-w-[75%] p-4 rounded-2xl text-base leading-relaxed shadow-sm whitespace-pre-wrap
                ${msg.role === MessageRole.User 
                  ? 'bg-indigo-600 text-white rounded-br-none' 
                  : msg.role === MessageRole.System 
                    ? 'bg-red-50 text-red-800 border border-red-200'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                }
              `}
            >
              {msg.content}
            </div>

            {/* RAG Resources Display */}
            {msg.relatedResources && msg.relatedResources.length > 0 && (
              <div className="mt-3 w-full max-w-[85%] md:max-w-[75%]">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                  Recommended Resources
                </p>
                <div className="grid gap-2">
                  {msg.relatedResources.map(resource => (
                    <ResourceCard key={resource.id} resource={resource} />
                  ))}
                </div>
              </div>
            )}

            <span className="text-xs text-slate-400 mt-1 px-1">
              {msg.role === MessageRole.User ? 'You' : 'Assistant'} • {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-center gap-2 text-slate-500 p-4 animate-pulse">
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            <span className="text-sm font-medium">Thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-slate-200 p-4 pb-6">
        <div className="max-w-4xl mx-auto relative flex gap-2 items-end">
          <div className="relative flex-1">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about tools, accommodations, or strategies..."
              className="w-full pl-4 pr-12 py-3 bg-slate-100 text-slate-900 placeholder-slate-500 border-2 border-transparent focus:border-indigo-500 rounded-2xl resize-none focus:outline-none focus:ring-0 transition-all min-h-[56px] max-h-32"
              rows={1}
              style={{ minHeight: '56px' }} // Ensure touch target size
            />
            {/* Voice Input Button */}
            <button
              onClick={toggleVoiceInput}
              className={`absolute right-2 bottom-2 p-2 rounded-xl transition-colors ${
                isListening 
                  ? 'bg-red-100 text-red-600 animate-pulse' 
                  : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
              aria-label={isListening ? "Stop listening" : "Start voice input"}
              title="Voice Input"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
          </div>

          {/* Send Button */}
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className={`p-3 rounded-2xl flex items-center justify-center transition-all ${
              !inputValue.trim() || isLoading
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
            }`}
            aria-label="Send message"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
        <p className="text-center text-xs text-slate-400 mt-2">
          AI can make mistakes. Always verify important information.
        </p>
      </div>
    </div>
  );
};