type SuggestionLike = {
  types?: string[];
};

const HEALTH_TYPES = new Set([
  'doctor',
  'hospital',
  'health',
  'dentist',
  'physiotherapist',
]);

const BUSINESS_TYPES = new Set(['establishment', 'point_of_interest']);
const ADDRESS_TYPES = new Set(['street_address', 'route', 'premise', 'subpremise']);

function scoreSuggestion(suggestion: SuggestionLike): number {
  const types = suggestion.types ?? [];

  if (types.some((type) => HEALTH_TYPES.has(type))) return 0;
  if (types.some((type) => BUSINESS_TYPES.has(type))) return 1;
  if (types.some((type) => ADDRESS_TYPES.has(type))) return 3;
  return 2;
}

export function sortPracticeSuggestions<T extends SuggestionLike>(
  suggestions: T[]
): T[] {
  return suggestions
    .map((suggestion, index) => ({
      suggestion,
      index,
      score: scoreSuggestion(suggestion),
    }))
    .sort((left, right) => {
      if (left.score !== right.score) return left.score - right.score;
      return left.index - right.index;
    })
    .map((entry) => entry.suggestion);
}
