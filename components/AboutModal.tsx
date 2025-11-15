import React from 'react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-opacity animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-100 animate-in zoom-in-95 duration-200"
        role="dialog" 
        aria-labelledby="about-title" 
        aria-modal="true"
      >
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between sticky top-0 bg-white z-10 pb-2 border-b border-slate-50">
            <h2 id="about-title" className="text-2xl font-bold text-slate-800">
              About NeuroResource
            </h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
              aria-label="Close about modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="space-y-5 text-slate-600 leading-relaxed">
            <p>
              <strong>NeuroResource Assistant</strong> is an accessible, AI-powered tool designed to support neurodivergent individuals in finding strategies, accommodations, and resources that work for their unique brains.
            </p>

            <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-100">
              <h3 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
                How it Works
              </h3>
              <p className="text-sm text-indigo-800">
                This app uses <strong>RAG (Retrieval-Augmented Generation)</strong> technology. It combines a trusted internal database of tools with real-time Google Search capabilities to provide accurate, relevant, and safe information.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Accessibility Features
              </h3>
              <ul className="list-none space-y-2 text-sm mt-2">
                <li className="flex items-start gap-2">
                  <span className="bg-slate-100 p-1 rounded text-xs font-bold text-slate-500 mt-0.5">TTS</span>
                  <span><strong>Text-to-Speech:</strong> Listen to responses if reading is overwhelming.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-slate-100 p-1 rounded text-xs font-bold text-slate-500 mt-0.5">UI</span>
                  <span><strong>Visual Clarity:</strong> High contrast, readable fonts, and grouped resources to reduce cognitive load.</span>
                </li>
              </ul>
            </div>

            <p className="text-xs text-slate-400 pt-4 border-t border-slate-100">
              Disclaimer: This AI is a support tool, not a medical professional. Always consult with qualified specialists for medical advice.
            </p>
          </div>

          {/* Footer Action */}
          <div className="pt-2">
            <button 
              onClick={onClose}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};