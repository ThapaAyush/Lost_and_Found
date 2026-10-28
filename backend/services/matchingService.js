import Item from '../models/Item.js';

// Common stop words to exclude from keyword extraction
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'from',
  'of', 'my', 'is', 'was', 'it', 'that', 'this', 'near', 'around', 'about', 'some',
  'please', 'help', 'lost', 'found', 'item', 'items', 'has', 'have', 'had', 'been', 'there',
  'very', 'much', 'just', 'need', 'want', 'anyone', 'someone',
]);

const tokenize = (text) => {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length >= 2 && !STOP_WORDS.has(word));
};

export const calculateMatchScore = (sourceItem, targetItem) => {
  // If items are not opposite types (e.g. both are lost or both are found), no match
  if (sourceItem.type === targetItem.type) {
    return { score: 0, reasons: [] };
  }

  let score = 0;
  const reasons = [];

  // Extract cleaned tokens from titles and descriptions
  const sourceTitleTokens = tokenize(sourceItem.title);
  const targetTitleTokens = tokenize(targetItem.title);

  const sTitleNorm = (sourceItem.title || '').trim().toLowerCase();
  const tTitleNorm = (targetItem.title || '').trim().toLowerCase();

  const sourceDescTokens = tokenize(
    `${sourceItem.description || ''} ${sourceItem.distinguishingFeatures || ''}`
  );
  const targetDescTokens = tokenize(
    `${targetItem.description || ''} ${targetItem.distinguishingFeatures || ''}`
  );

  // Check 1: Title Direct Overlap or Substring
  const commonTitleTokens = sourceTitleTokens.filter((t) => targetTitleTokens.includes(t));
  const isExactTitle = sTitleNorm && tTitleNorm && sTitleNorm === tTitleNorm;
  const isSubstringTitle =
    (sTitleNorm.length >= 3 && tTitleNorm.includes(sTitleNorm)) ||
    (tTitleNorm.length >= 3 && sTitleNorm.includes(tTitleNorm));

  // Check 2: Brand Overlap
  const sBrand = (sourceItem.brand || '').trim().toLowerCase();
  const tBrand = (targetItem.brand || '').trim().toLowerCase();
  const isExactBrand = sBrand && tBrand && sBrand === tBrand;
  const isBrandInTitle =
    (sBrand && sBrand.length >= 2 && (tTitleNorm.includes(sBrand) || targetDescTokens.includes(sBrand))) ||
    (tBrand && tBrand.length >= 2 && (sTitleNorm.includes(tBrand) || sourceDescTokens.includes(tBrand)));

  // Check 3: Description & Distinguishing feature keyword overlap
  const allSourceTokens = new Set([...sourceTitleTokens, ...sourceDescTokens]);
  const allTargetTokens = new Set([...targetTitleTokens, ...targetDescTokens]);
  const allSharedTokens = [...allSourceTokens].filter((t) => allTargetTokens.has(t));

  // GATE CHECK: Must have an actual substantive connection!
  // If there is NO title keyword match, NO title substring, NO brand match, and fewer than 2 shared keywords:
  // These are two completely unrelated items (e.g. "hari" mask vs "Sony Headphones"). Score MUST be 0!
  const hasSubstantiveMatch =
    isExactTitle ||
    isSubstringTitle ||
    commonTitleTokens.length > 0 ||
    isExactBrand ||
    isBrandInTitle ||
    allSharedTokens.length >= 2;

  if (!hasSubstantiveMatch) {
    return { score: 0, reasons: [] };
  }

  // 1. Title Similarity (Weight: up to 35%)
  if (isExactTitle) {
    score += 35;
    reasons.push(`Exact item title match: "${sourceItem.title}" (+35%)`);
  } else if (isSubstringTitle) {
    score += 30;
    reasons.push(`Item name directly matches (+30%)`);
  } else if (commonTitleTokens.length > 0) {
    const titleScore = Math.min(28, 15 + commonTitleTokens.length * 6);
    score += titleScore;
    reasons.push(
      `Shared title keywords (${commonTitleTokens.slice(0, 3).join(', ')}) (+${titleScore}%)`
    );
  }

  // 2. Keyword & Description Overlap (Weight: up to 20%)
  if (allSharedTokens.length > 0) {
    const kwScore = Math.min(20, allSharedTokens.length * 5);
    score += kwScore;
    reasons.push(
      `Shared keywords (${allSharedTokens.slice(0, 4).join(', ')}) (+${kwScore}%)`
    );
  }

  // 3. Brand Match (Weight: up to 20%)
  if (isExactBrand) {
    score += 20;
    reasons.push(`Exact brand match: "${sourceItem.brand}" (+20%)`);
  } else if (isBrandInTitle) {
    score += 15;
    reasons.push(`Brand "${sBrand || tBrand}" confirmed in report (+15%)`);
  }

  // 4. Category Match (Weight: 15%)
  if (sourceItem.category && targetItem.category && sourceItem.category === targetItem.category) {
    score += 15;
    reasons.push(`Matching category: "${sourceItem.category}" (+15%)`);
  } else {
    // Cross-category penalty
    score -= 10;
  }

  // 5. Color Match (Weight: up to 10%)
  if (sourceItem.color && targetItem.color) {
    const sourceColors = sourceItem.color.toLowerCase().split(/[,\s/]+/);
    const targetColors = targetItem.color.toLowerCase().split(/[,\s/]+/);
    const matchedColors = sourceColors.filter((c) => c && targetColors.includes(c));
    if (matchedColors.length > 0) {
      score += 10;
      reasons.push(`Matching color: "${matchedColors.join(', ')}" (+10%)`);
    }
  }

  // 6. Location Landmark Proximity (Weight: up to 10%)
  if (sourceItem.locationDescription && targetItem.locationDescription) {
    const loc1Tokens = tokenize(sourceItem.locationDescription);
    const loc2Tokens = tokenize(targetItem.locationDescription);
    const sharedLoc = loc1Tokens.filter((t) => loc2Tokens.includes(t));
    if (sharedLoc.length > 0) {
      score += 10;
      reasons.push(`Similar location landmark: "${sharedLoc.join(', ')}" (+10%)`);
    }
  }

  // 7. Date Proximity (Weight: up to 5%)
  if (sourceItem.incidentDate && targetItem.incidentDate) {
    const sourceDate = new Date(sourceItem.incidentDate).getTime();
    const targetDate = new Date(targetItem.incidentDate).getTime();
    const diffDays = Math.abs(targetDate - sourceDate) / (1000 * 60 * 60 * 24);

    if (diffDays <= 3) {
      score += 5;
      reasons.push(`Dates within 3 days (+5%)`);
    } else if (diffDays <= 7) {
      score += 3;
      reasons.push(`Dates within 1 week (+3%)`);
    }
  }

  // Cap score between 0 and 100
  const totalScore = Math.min(100, Math.max(0, score));

  // Must achieve at least 35% match score to be presented as a genuine candidate
  if (totalScore < 35) {
    return { score: 0, reasons: [] };
  }

  return {
    score: totalScore,
    reasons: reasons.length > 0 ? reasons : ['Item attributes match'],
  };
};

/**
 * Find candidate matches for a specific item
 */
export const findMatchesForItem = async (itemId, minScore = 35) => {
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
export const findMatchesForUser = async (userId, minScore = 35) => {
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
export const findCommunityMatches = async (minScore = 35, limit = 20) => {
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
