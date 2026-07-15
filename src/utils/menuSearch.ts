import { match as pinyinMatch } from 'pinyin-pro';

export interface MenuSearchItem {
  path: string;
  title: string;
  leafTitle: string;
}

interface MatchQuality {
  fieldPriority: number;
  matchType: number;
  longestContinuousRun: number;
  gapCount: number;
  span: number;
  start: number;
  fieldLength: number;
}

interface RankedMenuItem<T extends MenuSearchItem> {
  item: T;
  quality: MatchQuality;
  sourceIndex: number;
}

function getMatchIndices(text: string, query: string): number[] | null {
  const normalizedText = text.toLowerCase();
  const directIndex = normalizedText.indexOf(query);

  if (directIndex >= 0) {
    return Array.from({ length: Array.from(query).length }, (_, index) => directIndex + index);
  }

  return pinyinMatch(text, query);
}

function getMatchQuality(text: string, query: string, fieldPriority: number): MatchQuality | null {
  const normalizedText = text.toLowerCase();
  const indices = getMatchIndices(text, query);
  if (!indices || indices.length === 0) {
    return null;
  }

  let longestContinuousRun = 1;
  let currentRun = 1;
  for (let index = 1; index < indices.length; index += 1) {
    if (indices[index] === indices[index - 1] + 1) {
      currentRun += 1;
      longestContinuousRun = Math.max(longestContinuousRun, currentRun);
    } else {
      currentRun = 1;
    }
  }

  const start = indices[0];
  const span = indices.at(-1)! - start + 1;
  const directIndex = normalizedText.indexOf(query);
  const matchType = normalizedText === query ? 0 : directIndex === 0 ? 1 : directIndex > 0 ? 2 : 3;

  return {
    fieldPriority,
    matchType,
    longestContinuousRun,
    gapCount: span - indices.length,
    span,
    start,
    fieldLength: Array.from(text).length,
  };
}

function compareQuality(left: MatchQuality, right: MatchQuality): number {
  return (
    left.fieldPriority - right.fieldPriority ||
    left.matchType - right.matchType ||
    right.longestContinuousRun - left.longestContinuousRun ||
    left.gapCount - right.gapCount ||
    left.span - right.span ||
    left.start - right.start ||
    left.fieldLength - right.fieldLength
  );
}

function getBestMatch(item: MenuSearchItem, query: string): MatchQuality | null {
  const candidates = [
    getMatchQuality(item.leafTitle, query, 0),
    getMatchQuality(item.title, query, 1),
    getMatchQuality(item.path, query, 2),
  ].filter((quality): quality is MatchQuality => quality !== null);

  return candidates.sort(compareQuality)[0] ?? null;
}

export function searchMenuItems<T extends MenuSearchItem>(
  items: readonly T[],
  input: string,
  limit = 20,
): T[] {
  const query = input.trim().toLowerCase();
  if (!query || limit <= 0) {
    return [];
  }

  return items
    .map((item, sourceIndex): RankedMenuItem<T> | null => {
      const quality = getBestMatch(item, query);
      return quality ? { item, quality, sourceIndex } : null;
    })
    .filter((entry): entry is RankedMenuItem<T> => entry !== null)
    .sort(
      (left, right) =>
        compareQuality(left.quality, right.quality) || left.sourceIndex - right.sourceIndex,
    )
    .slice(0, limit)
    .map((entry) => entry.item);
}
