import { KNOWLEDGE_BASE } from '../data/knowledgeBase';
import { Resource } from '../types';

/**
 * Simulates a RAG retrieval system.
 * In a real app, this would call a vector database or search API.
 * Here, we use a weighted keyword scoring system.
 */
export const retrieveResources = (query: string): Resource[] => {
  const normalizedQuery = query.toLowerCase();
  const queryTerms = normalizedQuery.split(/\s+/).filter(t => t.length > 2); // Filter short words

  const scoredResources = KNOWLEDGE_BASE.map(resource => {
    let score = 0;

    // Check tags (High weight)
    resource.tags.forEach(tag => {
      if (normalizedQuery.includes(tag.toLowerCase())) score += 5;
    });

    // Check Title (High weight)
    if (resource.title.toLowerCase().includes(normalizedQuery)) score += 10;

    // Check Description terms (Medium weight)
    queryTerms.forEach(term => {
      if (resource.description.toLowerCase().includes(term)) score += 2;
      if (resource.category.toLowerCase().includes(term)) score += 3;
    });

    return { resource, score };
  });

  // Filter results with a score > 0 and sort by score
  const results = scoredResources
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.resource);

  // Return top 3 matches
  return results.slice(0, 3);
};