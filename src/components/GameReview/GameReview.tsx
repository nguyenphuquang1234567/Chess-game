import React, { useState } from 'react';
import { analyzeGame } from './analyzeGame';
import { ReviewSummary } from './types';
import { FaChessKing, FaChessKing as FaChessKingBlack } from 'react-icons/fa';

interface GameReviewProps {
  moves: string[] | string;
  depth?: number;
}

const MOVE_COLORS: Record<string, string> = {
  brilliant: 'text-blue-300 font-bold', // Lighter blue for Brilliant
  best: 'text-green-400',
  excellent: 'text-green-400',
  good: 'text-green-200', // Fader green
  inaccuracy: 'text-yellow-300',
  mistake: 'text-orange-400',
  blunder: 'text-red-500 font-bold',
  miss: 'text-pink-400',
};

const GameReview: React.FC<GameReviewProps> = ({ moves, depth = 12 }) => {
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeGame(moves, '/stockfish.js', 3, depth);
      setSummary(result);
      setHasAnalyzed(true);
    } catch (e: any) {
      setError(e.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  if (!hasAnalyzed) {
    return (
      <div id="analysis-results" className="p-2 bg-gray-900 rounded-lg text-xs w-full space-y-2 shadow-md border border-gray-700">
        <div className="text-base font-bold">Game Review</div>
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded font-medium transition-colors"
        >
          {loading ? 'Analyzing...' : 'Analyze Game'}
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div id="analysis-results" className="p-2 bg-red-800 rounded-lg text-xs w-full">
        Error: {error}
        <button
          onClick={handleAnalyze}
          className="mt-2 w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
        >
          Retry Analysis
        </button>
      </div>
    );
  }

  if (!summary) return null;

  const moveTypes = [
    'brilliant', 'best', 'excellent', 'good', 'inaccuracy', 'mistake', 'blunder', 'miss'
  ];

  return (
    <div id="analysis-results" className="p-4 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-700 max-w-md mx-auto space-y-4">
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center mb-2">
          <div className="text-lg font-bold tracking-wide text-white flex items-center gap-2">
            <span className="inline-block text-2xl"><FaChessKing className="text-white drop-shadow" /></span>
            Game Review
          </div>
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg text-xs font-semibold shadow transition-colors"
          >
            {loading ? 'Analyzing...' : 'Re-analyze'}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {/* White Stats */}
          <div className="bg-white/10 rounded-xl p-3 flex flex-col items-center shadow-inner">
            <div className="flex items-center gap-2 mb-1">
              <FaChessKing className="text-white bg-gradient-to-br from-gray-200 to-gray-400 rounded-full p-1 text-2xl shadow" />
              <span className="font-bold text-white text-base">White</span>
            </div>
            <span className="text-green-300 font-bold text-lg mb-2">{summary.accuracyWhite}%</span>
            <div className="flex flex-wrap gap-1 justify-center">
              {moveTypes.map(type => (
                <span key={type} className={`px-2 py-1 rounded-full font-semibold text-xs shadow-sm ${MOVE_COLORS[type] || ''} bg-white/20`}>{type.charAt(0).toUpperCase() + type.slice(1)}: {summary.moveCountsWhite ? summary.moveCountsWhite[type as keyof typeof summary.moveCountsWhite] : 0}</span>
              ))}
            </div>
          </div>
          {/* Black Stats */}
          <div className="bg-white/10 rounded-xl p-3 flex flex-col items-center shadow-inner">
            <div className="flex items-center gap-2 mb-1">
              <FaChessKingBlack className="text-black bg-gradient-to-br from-gray-700 to-gray-900 rounded-full p-1 text-2xl shadow" />
              <span className="font-bold text-white text-base">Black</span>
            </div>
            <span className="text-blue-300 font-bold text-lg mb-2">{summary.accuracyBlack}%</span>
            <div className="flex flex-wrap gap-1 justify-center">
              {moveTypes.map(type => (
                <span key={type} className={`px-2 py-1 rounded-full font-semibold text-xs shadow-sm ${MOVE_COLORS[type] || ''} bg-white/20`}>{type.charAt(0).toUpperCase() + type.slice(1)}: {summary.moveCountsBlack ? summary.moveCountsBlack[type as keyof typeof summary.moveCountsBlack] : 0}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameReview; 