import { Submission } from '@/lib/data';
import { Clock } from 'lucide-react';

interface RecentSubmissionsProps {
  submissions: Submission[];
}

export default function RecentSubmissions({ submissions }: RecentSubmissionsProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center space-x-2 mb-4">
        <Clock className="w-5 h-5 text-green-400" />
        <h3 className="text-lg font-semibold text-white">Recent Submissions</h3>
      </div>
      
      <div className="space-y-3">
        {submissions.map((submission, index) => (
          <div key={index} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="text-white font-medium">
                  {submission.title} - {submission.artist}
                </div>
                <div className="text-gray-400 text-sm mt-1">
                  Season {submission.season} • {submission.submitterName}
                </div>
              </div>
              {submission.spotifyUri && (
                <a
                  href={submission.spotifyUri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-4 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  ▶️
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
