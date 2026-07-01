import { RegExpMatcher, englishDataset, englishRecommendedTransformers } from "obscenity";

const baseMatcher = new RegExpMatcher({
  ...englishDataset.build(),
  ...englishRecommendedTransformers,
});

export function isMessageBlocked(body: string, customBlocklist: string[] = []): boolean {
  if (baseMatcher.hasMatch(body)) return true;

  const lower = body.toLowerCase();
  return customBlocklist.some((word) => word.trim() && lower.includes(word.trim().toLowerCase()));
}

export const CHAT_CHAR_LIMIT = 60;
