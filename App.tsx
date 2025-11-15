import React, { useState } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { AboutModal } from './components/AboutModal';

const App: React.FC = () => {
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Accessible Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 leading-tight">NeuroResource</h1>
              <p className="text-xs text-slate-500 font-medium">AI-Powered Support Assistant</p>
            </div>
          </div>
          
          {/* About Button */}
          <button 
            onClick={() => setIsAboutOpen(true)}
            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="About NeuroResource"
            title="About NeuroResource"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col max-w-5xl mx-auto w-full p-4 md:p-6">
        <div className="flex-1 bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden flex flex-col relative">
           <ChatInterface />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-slate-400 text-sm">
        <p>© 2024 NeuroResource. Designed for accessibility.</p>
      </footer>

      {/* About Modal */}
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </div>
  );
};

export default App;