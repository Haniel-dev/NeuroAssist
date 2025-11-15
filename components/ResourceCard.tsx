import React from 'react';
import { Resource } from '../types';

interface ResourceCardProps {
  resource: Resource;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({ resource }) => {
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Sensory': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Executive Function': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Workplace': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Mental Health': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-200 mb-3">
      <div className="flex justify-between items-start mb-2">
        <span className={`px-2 py-1 rounded-md text-xs font-semibold border ${getCategoryColor(resource.category)}`}>
          {resource.category}
        </span>
      </div>
      <h4 className="text-lg font-bold text-slate-900 mb-1">{resource.title}</h4>
      <p className="text-slate-600 text-sm mb-3 leading-relaxed">{resource.description}</p>
      
      <div className="flex flex-wrap gap-2 mb-3">
        {resource.tags.map(tag => (
          <span key={tag} className="text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
            #{tag}
          </span>
        ))}
      </div>

      <a 
        href={resource.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium text-sm"
        aria-label={`Visit ${resource.title} (opens in new tab)`}
      >
        Visit Resource
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    </div>
  );
};