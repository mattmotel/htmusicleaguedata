'use client';

import { useState } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';

interface RoundIdeaGeneratorProps {
  existingRounds: string;
}

export default function RoundIdeaGenerator({ existingRounds }: RoundIdeaGeneratorProps) {
  const [ideas, setIdeas] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateIdeas = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/generate-round-ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ existingRounds }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIdeas(data.ideas);
      } else {
        setError(data.error || 'Failed to generate ideas');
      }
    } catch (err) {
      setError('Failed to connect to idea generator');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={generateIdeas}
        disabled={loading}
        className="w-full px-6 py-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 rounded-lg font-bold hover:from-yellow-300 hover:to-orange-300 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
      >
        {loading ? (
          <>
            <RefreshCw className="w-5 h-5 animate-spin" />
            Generating Ideas...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Generate 10 New Round Ideas
          </>
        )}
      </button>

      {error && (
        <div className="mt-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {ideas.length > 0 && (
        <div className="mt-6 space-y-3">
          {ideas.map((idea, index) => (
            <div key={index} className="p-4 bg-gray-700/50 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-yellow-400 text-gray-900 rounded-full text-sm font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <p className="text-white flex-1 leading-relaxed">{idea}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

