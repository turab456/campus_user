import React from 'react';
import { Check } from 'lucide-react';

const indicators = [
  'Verified Students',
  'No Listing Fees',
  'Campus Pickup',
  'Secure Messaging',
];

export const TrustIndicators: React.FC = () => (
  <div className="flex flex-wrap gap-x-4 gap-y-2 mt-5">
    {indicators.map((text) => (
      <div key={text} className="flex items-center space-x-1.5 text-xs text-textSec">
        <span className="w-1 h-1 rounded-full bg-muted flex-shrink-0" />
        <span>{text}</span>
      </div>
    ))}
  </div>
);
