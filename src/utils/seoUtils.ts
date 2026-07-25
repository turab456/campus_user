export const padOrTruncateDescription = (desc: string, minLen = 140, maxLen = 160): string => {
  if (desc.length >= minLen && desc.length <= maxLen) {
    return desc;
  }
  
  if (desc.length > maxLen) {
    const truncated = desc.substring(0, maxLen - 3);
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > minLen) {
      return truncated.substring(0, lastSpace) + '...';
    }
    return truncated + '...';
  }

  // If too short, pad with helpful campus marketplace descriptions
  const paddingText = " Find affordable textbooks, cycles, lab coats, and other study gear directly from peers on your campus.";
  let padded = desc + paddingText;
  if (padded.length >= minLen && padded.length <= maxLen) {
    return padded;
  }
  if (padded.length > maxLen) {
    const truncated = padded.substring(0, maxLen - 3);
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > minLen) {
      return truncated.substring(0, lastSpace) + '...';
    }
    return truncated + '...';
  }

  // If still too short, add more details
  const extraPadding = " Safe, fast, and completely free to use for university students.";
  padded = padded + extraPadding;
  if (padded.length > maxLen) {
    const truncated = padded.substring(0, maxLen - 3);
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > minLen) {
      return truncated.substring(0, lastSpace) + '...';
    }
    return truncated + '...';
  }

  return padded;
};

export const getMetaDescription = (type: string, details?: string): string => {
  let desc = '';
  switch (type) {
    case 'home':
      desc = 'RevoShelf is the ultimate student-to-student marketplace. Buy and sell textbooks, notes, cycles, and hostel gear directly on campus with zero commission.';
      break;
    case 'marketplace':
      desc = 'Explore the RevoShelf student marketplace. Find great deals on used textbooks, college calculators, lab coats, and hostel essentials from verified peers.';
      break;
    case 'login':
      desc = 'Log in to RevoShelf to browse college textbooks, cycles, and student gear. Connect with verified sellers on campus for safe, face-to-face transactions.';
      break;
    case 'signup':
      desc = 'Create your RevoShelf student account today. Buy and sell textbooks, notes, lab equipment, and cycles directly with peers on campus. Completely free.';
      break;
    case 'profile':
      desc = `View the student profile and active listings of ${details || 'our member'} on RevoShelf. Find textbooks, instruments, and college gear posted by this verified member.`;
      break;
    case 'category':
      desc = `Browse verified student listings for ${details || 'college essentials'} on RevoShelf. Find affordable study gear, textbooks, and cycles listed by peers at your university.`;
      break;
    case 'listing':
      desc = `Buy ${details || 'college essential'} from verified students at affordable prices.`;
      break;
    default:
      desc = 'RevoShelf is a secure peer-to-peer campus marketplace. Buy and sell textbooks, study guides, instruments, and other college essentials directly with peers.';
  }
  return padOrTruncateDescription(desc);
};

export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-');         // Replace multiple - with -
};
