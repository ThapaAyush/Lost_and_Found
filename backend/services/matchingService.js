import Item from '../models/Item.js';

// Common stop words to exclude from keyword extraction
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'from',
  'of', 'my', 'is', 'was', 'it', 'that', 'this', 'near', 'around', 'about', 'some',
  'please', 'help', 'lost', 'found', 'item', 'has', 'have', 'had', 'been', 'there',
]);

const tokenize = (text) => {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
};

export const calculateMatchScore = (sourceItem, targetItem) => {
  let score = 0;
  const reasons = [];

  // 1. Category match (Weight: 30%)
  if (sourceItem.category && targetItem.category && sourceItem.category === targetItem.category) {
    score += 30;
    reasons.push(`Exact category match: "${sourceItem.category}" (+30%)`);
  }

  // 2. Title & Description keyword similarity (Weight: 25%)
  const sourceTokens = new Set([
    ...tokenize(sourceItem.title),
    ...tokenize(sourceItem.description),
    ...tokenize(sourceItem.distinguishingFeatures),
  ]);

  const targetTokens = new Set([
    ...tokenize(targetItem.title),
    ...tokenize(targetItem.description),
    ...tokenize(targetItem.distinguishingFeatures),
  ]);

  if (sourceTokens.size > 0 && targetTokens.size > 0) {
    const commonTokens = [...sourceTokens].filter((t) => targetTokens.has(t));
    if (commonTokens.length > 0) {
      // Overlap ratio scaled to 25 points
      const ratio = commonTokens.length / Math.min(sourceTokens.size, targetTokens.size);
      const textScore = Math.min(25, Math.round(ratio * 25));
      score += textScore;
      reasons.push(
        `Shared keywords (${commonTokens.slice(0, 4).join(', ')}) (+${textScore}%)`
      );
    }
  }

  // 3. Brand match (Weight: 15%)
  if (sourceItem.brand && targetItem.brand) {
    if (sourceItem.brand.trim().toLowerCase() === targetItem.brand.trim().toLowerCase()) {
      score += 15;
      reasons.push(`Matching brand: "${sourceItem.brand}" (+15%)`);
    }
  } else if (sourceItem.brand && targetItem.title.toLowerCase().includes(sourceItem.brand.toLowerCase())) {
    score += 10;
    reasons.push(`Brand "${sourceItem.brand}" mentioned in listing (+10%)`);
  } else if (targetItem.brand && sourceItem.title.toLowerCase().includes(targetItem.brand.toLowerCase())) {
    score += 10;
    reasons.push(`Brand "${targetItem.brand}" mentioned in listing (+10%)`);
  }

  // 4. Color match (Weight: 10%)
  if (sourceItem.color && targetItem.color) {
    const sourceColors = sourceItem.color.toLowerCase().split(/[,\s/]+/);
    const targetColors = targetItem.color.toLowerCase().split(/[,\s/]+/);
    const matchedColors = sourceColors.filter((c) => c && targetColors.includes(c));
    if (matchedColors.length > 0) {
      score += 10;
      reasons.push(`Matching color: "${matchedColors.join(', ')}" (+10%)`);
    }
  } else if (
    sourceItem.color &&
    (targetItem.description.toLowerCase().includes(sourceItem.color.toLowerCase()) ||
      targetItem.title.toLowerCase().includes(sourceItem.color.toLowerCase()))
  ) {
    score += 6;
    reasons.push(`Color "${sourceItem.color}" referenced (+6%)`);
  }

  // 5. Date proximity (Weight: 10%)
  if (sourceItem.incidentDate && targetItem.incidentDate) {
    const sourceDate = new Date(sourceItem.incidentDate).getTime();
    const targetDate = new Date(targetItem.incidentDate).getTime();
    const diffDays = Math.abs(targetDate - sourceDate) / (1000 * 60 * 60 * 24);

    if (diffDays <= 2) {
      score += 10;
      reasons.push(`Dates within 2 days (+10%)`);
    } else if (diffDays <= 7) {
      score += 7;
      reasons.push(`Dates within 1 week (+7%)`);
    } else if (diffDays <= 14) {
      score += 4;
      reasons.push(`Dates within 2 weeks (+4%)`);
    } else if (diffDays <= 30) {
      score += 2;
      reasons.push(`Dates within 1 month (+2%)`);
    }
  }

  // 6. Location similarity (Weight: 10%)
  if (sourceItem.locationDescription && targetItem.locationDescription) {
    const loc1Tokens = tokenize(sourceItem.locationDescription);
    const loc2Tokens = tokenize(targetItem.locationDescription);
    const sharedLoc = loc1Tokens.filter((t) => loc2Tokens.includes(t));
    if (sharedLoc.length > 0) {
      score += 10;
      reasons.push(`Similar location landmark: "${sharedLoc.join(', ')}" (+10%)`);
    }
  }

  // Cap score between 0 and 100
  const totalScore = Math.min(100, Math.max(0, score));

  return {
    score: totalScore,
    reasons: reasons.length > 0 ? reasons : ['General category resemblance'],
  };
};

/**
 * Find candidate matches for a specific item
 */
export const findMatchesForItem = async (itemId, minScore = 20) => {
  const sourceItem = await Item.findById(itemId);
  if (!sourceItem) return [];

  // If source is lost, look for found items; if found, look for lost items
  const oppositeType = sourceItem.type === 'lost' ? 'found' : 'lost';

  // Candidate query: eligible statuses, not prohibited, not owned by same user
  const candidates = await Item.find({
    type: oppositeType,
    status: oppositeType,
    isProhibited: false,
    _id: { $ne: sourceItem._id },
    owner: { $ne: sourceItem.owner },
  }).populate('owner', 'name avatar');

  const matches = [];
  for (const candidate of candidates) {
    const { score, reasons } = calculateMatchScore(sourceItem, candidate);
    if (score >= minScore) {
      matches.push({
        item: candidate,
        score,
        reasons,
      });
    }
  }

  // Sort descending by match score
  matches.sort((a, b) => b.score - a.score);
  return matches;
};

/**
 * Find all high-relevance matches for the current user's active reports
 */
export const findMatchesForUser = async (userId, minScore = 25) => {
  const userItems = await Item.find({
    owner: userId,
    status: { $in: ['lost', 'found'] },
    isProhibited: false,
  });

  const results = [];
  for (const myItem of userItems) {
    const candidates = await findMatchesForItem(myItem._id, minScore);
    if (candidates.length > 0) {
      results.push({
        myReport: myItem,
        candidateMatches: candidates,
      });
    }
  }

  return results;
};

/**
 * Find all active community cross-matches (lost items matching found items)
 */
export const findCommunityMatches = async (minScore = 20, limit = 20) => {
  const lostItems = await Item.find({
    type: 'lost',
    status: 'lost',
    isProhibited: false,
  }).populate('owner', 'name avatar');

  const matches = [];
  for (const lostItem of lostItems) {
    const candidateFoundItems = await findMatchesForItem(lostItem._id, minScore);
    for (const match of candidateFoundItems) {
      matches.push({
        lostItem,
        foundItem: match.item,
        score: match.score,
        reasons: match.reasons,
      });
    }
  }

  // Sort descending by match score
  matches.sort((a, b) => b.score - a.score);
  return matches.slice(0, limit);
};
