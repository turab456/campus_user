import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { getSeverityColor, getSpamLevel } from '../utils/detectionAlgorithms';

interface ScoreIndicatorProps {
  score: number;
  label?: string;
  showReasons?: string[];
}

export const ScoreIndicator: React.FC<ScoreIndicatorProps> = ({
  score,
  label = 'Score',
  showReasons = []
}) => {
  const level = getSpamLevel(score);
  const color = getSeverityColor(score);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${color}`}>
          {score}/100 - {level}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all ${
            score >= 70 ? 'bg-red-600' :
            score >= 40 ? 'bg-orange-500' :
            score >= 20 ? 'bg-yellow-500' :
            'bg-green-600'
          }`}
          style={{ width: `${score}%` }}
        />
      </div>

      {showReasons.length > 0 && (
        <div className="mt-3 space-y-2">
          <p className="text-xs font-semibold text-gray-600 uppercase">Reasons:</p>
          <div className="space-y-1">
            {showReasons.map((reason, idx) => (
              <div key={idx} className="flex gap-2 text-xs text-gray-600">
                <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                <span>{reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
