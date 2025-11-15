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
      content: "Hi! I'm your NeuroResource assistant. I can help you find tools for executive function, sensory processing, and I can now search the web for health and academic resources. What are you looking for today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue.trim();
    setInputValue('');
    
    // Cancel any ongoing speech when user sends a message
    window.speechSynthesis.cancel();
    setSpeakingMessageId(null);

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
      // 1. Local RAG Retrieval Step (Curated DB)
      const localResources = retrieveResources(userText);

      // 2. Generation Step (Includes Web Search Grounding)
      const { text: aiResponseText, webResources } = await generateGeminiResponse(userText, localResources);

      // 3. Combine Resources (Unique by URL)
      const combinedResources: Resource[] = [...localResources];
      
      // Only add web resources if they don't duplicate local ones
      webResources.forEach(webRes => {
        if (!combinedResources.some(r => r.url === webRes.url)) {
          combinedResources.push(webRes);
        }
      });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: MessageRole.Model,
        content: aiResponseText,
        timestamp: new Date(),
        relatedResources: combinedResources
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

  const handleSpeak = (text: string, messageId: string) => {
    if (speakingMessageId === messageId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);
    
    setSpeakingMessageId(messageId);
    window.speechSynthesis.speak(utterance);
  };

  const handleClearChat = () => {
    if (window.confirm("Start a new conversation? This will clear the current history.")) {
      window.speechSynthesis.cancel();
      setMessages([{
        id: Date.now().toString(),
        role: MessageRole.Model,
        content: "I'm ready for a fresh start. I can search for health, academic, and support resources for you. What's on your mind?",
        timestamp: new Date()
      }]);
      setSpeakingMessageId(null);
    }
  };

  return (
    <div className="flex flex-col h-[600px] md:h-[700px] relative">
      {/* Toolbar */}
      <div className="absolute top-4 right-6 z-10">
        <button 
          onClick={handleClearChat}
          className="text-xs font-medium text-slate-400 hover:text-red-500 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-200 shadow-sm transition-colors flex items-center gap-1"
          title="Clear conversation history"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Reset Chat
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/50 scroll-smooth">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex flex-col ${msg.role === MessageRole.User ? 'items-end' : 'items-start'}`}
          >
            <div className="flex gap-2 items-end max-w-[90%] md:max-w-[80%]">
              {/* Message Bubble */}
              <div 
                className={`p-4 rounded-2xl text-base leading-relaxed shadow-sm whitespace-pre-wrap relative group
                  ${msg.role === MessageRole.User 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : msg.role === MessageRole.System 
                      ? 'bg-red-50 text-red-800 border border-red-200'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                  }
                `}
              >
                {msg.content}
                
                {/* TTS Button for Assistant Messages */}
                {msg.role === MessageRole.Model && (
                  <button 
                    onClick={() => handleSpeak(msg.content, msg.id)}
                    className={`absolute -right-10 bottom-0 p-2 rounded-full bg-white border border-slate-100 shadow-sm text-slate-400 hover:text-indigo-600 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 ${speakingMessageId === msg.id ? 'opacity-100 text-indigo-600 ring-2 ring-indigo-100' : ''}`}
                    aria-label={speakingMessageId === msg.id ? "Stop reading" : "Read aloud"}
                    title={speakingMessageId === msg.id ? "Stop reading" : "Read aloud"}
                  >
                    {speakingMessageId === msg.id ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 animate-pulse" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* RAG Resources Display */}
            {msg.relatedResources && msg.relatedResources.length > 0 && (
              <div className="mt-3 w-full max-w-[90%] md:max-w-[80%]">
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
          <div className="flex items-center gap-2 text-slate-500 p-4 animate-pulse bg-slate-100/50 rounded-xl w-fit">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="text-sm font-medium">Searching web & database...</span>
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