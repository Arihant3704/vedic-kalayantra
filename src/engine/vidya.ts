import rawConcepts from './vidya_data.json';
import { VidyaConcept } from '../types/kalayantra';

export const VIDYA_CONCEPTS: VidyaConcept[] = (rawConcepts as any[]).map(c => ({
  id: c.id,
  category: c.category,
  title: c.title || { en: c.id, iast: c.id, devanagari: c.id },
  summary: c.summary || { en: '', iast: '', devanagari: '' },
  meaning: c.meaning || '',
  formula: c.formula || '',
  example: c.example || '',
  source: c.source || '',
  keywords: c.keywords || [],
  crossRefs: c.cross_references || c.crossRefs || [],
}));

export const VIDYA_CATEGORIES: string[] = Array.from(
  new Set(VIDYA_CONCEPTS.map(c => c.category))
).sort();

export function searchVidya(query: string, category?: string): VidyaConcept[] {
  let list = VIDYA_CONCEPTS;
  if (category && category !== 'all') {
    list = list.filter(c => c.category.toLowerCase() === category.toLowerCase());
  }

  if (!query.trim()) return list;

  const q = query.toLowerCase();
  return list.filter(c => {
    return (
      c.title.en.toLowerCase().includes(q) ||
      c.title.iast.toLowerCase().includes(q) ||
      c.title.devanagari.includes(q) ||
      c.meaning.toLowerCase().includes(q) ||
      c.formula.toLowerCase().includes(q) ||
      c.source.toLowerCase().includes(q) ||
      c.keywords.some(k => k.toLowerCase().includes(q))
    );
  });
}
