// Spam/Scam Detection Algorithms

const SPAM_KEYWORDS = [
  'click here', 'buy now', 'limited time', 'exclusive offer',
  'guarantee', 'no questions asked', 'act now', 'urgent',
  'free money', 'make money fast', 'work from home',
  'bitcoin', 'crypto', 'forex', 'casino', 'gambling'
];

const SCAM_PATTERNS = [
  /^[\d\-\s\(\)\+]+$/,  // Only phone numbers
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,  // Email pattern
  /\b(western union|wire transfer|moneygram|gift card|amazon code)\b/i,  // Payment method mentions
  /\b(nigerian prince|inheritance|lottery|lucky winner|claim your prize)\b/i,  // Classic scam phrases
  /\$\d{4,}/,  // Large amounts of money
];

interface SpamScore {
  score: number;
  reasons: string[];
}

export const calculateSpamScore = (text: string): SpamScore => {
  if (!text || typeof text !== 'string') {
    return { score: 0, reasons: [] };
  }

  let score = 0;
  const reasons: string[] = [];
  const lowerText = text.toLowerCase();

  // Check for spam keywords
  const keywordMatches = SPAM_KEYWORDS.filter(keyword =>
    lowerText.includes(keyword)
  );
  if (keywordMatches.length > 0) {
    score += keywordMatches.length * 15;
    reasons.push(`Found ${keywordMatches.length} spam keywords: ${keywordMatches.join(', ')}`);
  }

  // Check for scam patterns
  const scamMatches = SCAM_PATTERNS.filter(pattern => pattern.test(text));
  if (scamMatches.length > 0) {
    score += scamMatches.length * 20;
    reasons.push(`Matched ${scamMatches.length} scam patterns`);
  }

  // Check for excessive URLs
  const urlCount = (text.match(/https?:\/\/\S+/g) || []).length;
  if (urlCount > 3) {
    score += urlCount * 10;
    reasons.push(`Contains ${urlCount} URLs (excessive)`);
  }

  // Check for excessive capitalization
  const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
  if (capsRatio > 0.3) {
    score += 15;
    reasons.push('Excessive capitalization');
  }

  // Check for repeated characters
  if (/(.)\1{4,}/.test(text)) {
    score += 10;
    reasons.push('Repeated characters detected');
  }

  // Check text length
  if (text.length < 10) {
    score += 5;
    reasons.push('Very short message');
  }

  // Check for suspicious phone patterns
  const phonePattern = /(\d{3}[-.]?\d{3}[-.]?\d{4}|\d{10})/g;
  const phoneMatches = text.match(phonePattern) || [];
  if (phoneMatches.length > 2) {
    score += phoneMatches.length * 10;
    reasons.push(`Contains ${phoneMatches.length} phone numbers`);
  }

  return {
    score: Math.min(score, 100),
    reasons
  };
};

export const calculateFraudScore = (
  listing: any
): SpamScore => {
  let score = 0;
  const reasons: string[] = [];

  // Check price inconsistencies
  if (listing.originalPrice && listing.price) {
    const discount = ((listing.originalPrice - listing.price) / listing.originalPrice) * 100;
    if (discount > 70) {
      score += 30;
      reasons.push(`Suspiciously high discount: ${discount.toFixed(0)}%`);
    }
  }

  // Check price too low
  if (listing.price < 100) {
    score += 15;
    reasons.push('Price seems too low');
  }

  // Check description length
  if (!listing.description || listing.description.length < 20) {
    score += 20;
    reasons.push('Very short or no description');
  }

  // Check for spam in description
  const descSpam = calculateSpamScore(listing.description || '');
  if (descSpam.score > 30) {
    score += 20;
    reasons.push(`Spam detected in description (score: ${descSpam.score})`);
  }

  // Check for spam in title
  const titleSpam = calculateSpamScore(listing.title);
  if (titleSpam.score > 20) {
    score += 15;
    reasons.push(`Spam detected in title (score: ${titleSpam.score})`);
  }

  // Check condition
  if (!listing.condition || listing.condition === 'Acceptable') {
    score += 5;
    reasons.push('Poor or missing item condition');
  }

  // Check image count
  if (!listing.images || listing.images.length === 0) {
    score += 25;
    reasons.push('No images provided');
  } else if (listing.images.length === 1) {
    score += 10;
    reasons.push('Only one image provided');
  }

  return {
    score: Math.min(score, 100),
    reasons
  };
};

export const calculateUserRiskScore = (user: any): SpamScore => {
  let score = 0;
  const reasons: string[] = [];

  // Check rating
  if (user.rating < 3) {
    score += 30;
    reasons.push(`Low rating: ${user.rating}`);
  }

  // Check reviews
  if (user.reviewsCount < 2 && user.createdAt) {
    const accountAge = (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (accountAge > 7) {
      score += 20;
      reasons.push('Account exists for days but no reviews');
    }
  }

  // Check verification
  if (!user.isVerified) {
    score += 15;
    reasons.push('Email not verified');
  }

  // Check name
  if (user.name && user.name.length < 3) {
    score += 10;
    reasons.push('Very short name');
  }

  return {
    score: Math.min(score, 100),
    reasons
  };
};

export const getSpamLevel = (score: number): string => {
  if (score >= 70) return 'HIGH';
  if (score >= 40) return 'MEDIUM';
  if (score >= 20) return 'LOW';
  return 'SAFE';
};

export const getSeverityColor = (score: number): string => {
  if (score >= 70) return 'bg-red-100 text-red-800';
  if (score >= 40) return 'bg-orange-100 text-orange-800';
  if (score >= 20) return 'bg-yellow-100 text-yellow-800';
  return 'bg-green-100 text-green-800';
};
