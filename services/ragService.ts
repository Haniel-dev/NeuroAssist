import { KNOWLEDGE_BASE } from '../data/knowledgeBase';
import { Resource } from '../types';

/**
 * Simulates a RAG retrieval system.
 * In a real app, this would call a vector database or search API.
 * Here, we use a weighted keyword scoring system with slightly fuzzy matching.
 */
export const retrieveResources = (query: string): Resource[] => {
  const normalizedQuery = query.toLowerCase();
  // Split by non-alphanumeric chars to get clean tokens
  const queryTerms = normalizedQuery.split(/[^a-z0-9]+/).filter(t => t.length > 2);

  const scoredResources = KNOWLEDGE_BASE.map(resource => {
    let score = 0;

    const normTitle = resource.title.toLowerCase();
    const normDesc = resource.description.toLowerCase();
    const normCat = resource.category.toLowerCase();

    // 1. Direct phrase match in title (Highest weight)
    if (normTitle.includes(normalizedQuery)) score += 15;

    // 2. Tag matching (High weight)
    resource.tags.forEach(tag => {
      const normTag = tag.toLowerCase();
      // Exact tag match or query contains tag
      if (normalizedQuery.includes(normTag) || normTag.includes(normalizedQuery)) {
        score += 6;
      }
      // Partial word match in tags
      queryTerms.forEach(term => {
        if (normTag.includes(term)) score += 2;
      });
    });

    // 3. Category matching (Medium weight)
    if (normCat.includes(normalizedQuery)) score += 8;
    queryTerms.forEach(term => {
      if (normCat.includes(term)) score += 3;
    });

    // 4. Description keyword matching (Low weight)
    queryTerms.forEach(term => {
      if (normDesc.includes(term)) score += 2;
      if (normTitle.includes(term)) score += 3; // Individual words in title
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