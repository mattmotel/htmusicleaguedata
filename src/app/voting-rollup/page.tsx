import { getDataManager, Submission } from '../../lib/data';
import { Vote, Users, Star } from 'lucide-react';

export default async function VotingRollupPage() {
  const dataManager = await getDataManager();
  const submissions = dataManager.getSubmissions();
  const votes = dataManager.getVotes();

  // Group submissions by season and round
  const submissionsBySeason = new Map<number, Map<number, Submission[]>>();
  
  submissions.forEach(submission => {
    if (!submissionsBySeason.has(submission.season)) {
      submissionsBySeason.set(submission.season, new Map());
    }
    
    const seasonMap = submissionsBySeason.get(submission.season)!;
    if (!seasonMap.has(submission.roundNumber)) {
      seasonMap.set(submission.roundNumber, []);
    }
    
    seasonMap.get(submission.roundNumber)!.push(submission);
  });

  // Calculate vote counts and points for each submission
  // const submissionsWithVotes = submissions.map(submission => {
  //   const submissionVotes = votes.filter(vote => vote.spotifyUri === submission.spotifyUri);
  //   const totalPoints = submissionVotes.reduce((sum, vote) => sum + vote.pointsAssigned, 0);
  //   const voteCount = submissionVotes.length;
  //   
  //   return {
  //     ...submission,
  //     votes: submissionVotes,
  //     totalPoints,
  //     voteCount
  //   };
  // });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-green-400 mb-2">Voting Rollup</h1>
        <p className="text-gray-400">Detailed voting information and results for each round</p>
      </div>

        <div className="space-y-8">
          {Array.from(submissionsBySeason.entries())
            .sort(([a], [b]) => b - a)
            .map(([season, roundsMap]) => (
              <div key={season} className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-green-400 mb-6">Season {season}</h2>
                
                <div className="space-y-6">
                  {Array.from(roundsMap.entries())
                    .sort(([a], [b]) => a - b)
                    .map(([roundNumber, roundSubmissions]) => {
                      const roundName = roundSubmissions[0]?.roundName || `Round ${roundNumber}`;
                      const roundSubmissionsWithVotes = roundSubmissions.map(submission => {
                        const submissionVotes = votes.filter(vote => vote.spotifyUri === submission.spotifyUri);
                        const totalPoints = submissionVotes.reduce((sum, vote) => sum + vote.pointsAssigned, 0);
                        const voteCount = submissionVotes.length;
                        
                        return {
                          ...submission,
                          votes: submissionVotes,
                          totalPoints,
                          voteCount
                        };
                      }).sort((a, b) => b.totalPoints - a.totalPoints);

                      return (
                        <div key={roundNumber} className="bg-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">{roundName}</h3>
                            <span className="text-sm text-gray-400">{roundSubmissions.length} submissions</span>
                          </div>
                          
                          <div className="space-y-3">
                            {roundSubmissionsWithVotes.map((submission, index) => (
                              <div key={submission.spotifyUri} className="bg-gray-600 rounded p-4">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex-1">
                                    <div className="flex items-center mb-2">
                                      <div className="flex items-center justify-center w-6 h-6 bg-green-400 text-gray-900 rounded-full text-sm font-bold mr-3">
                                        {index + 1}
                                      </div>
                                      <div>
                                        <p className="font-medium text-white">{submission.title}</p>
                                        <p className="text-sm text-gray-300">by {submission.artist}</p>
                                        {submission.album && (
                                          <p className="text-xs text-gray-400">Album: {submission.album}</p>
                                        )}
                                      </div>
                                    </div>
                                    <p className="text-sm text-gray-400">Submitted by: {submission.submitterName}</p>
                                    {submission.comment && (
                                      <div className="mt-2 p-2 bg-gray-500 rounded text-xs text-gray-200">
                                        &quot;{submission.comment}&quot;
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="text-right ml-4">
                                    <div className="flex items-center mb-1">
                                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                                      <span className="text-lg font-bold text-green-400">{submission.totalPoints}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-400">
                                      <Vote className="h-3 w-3 mr-1" />
                                      {submission.voteCount} votes
                                    </div>
                                  </div>
                                </div>
                                
                                {submission.votes.length > 0 && (
                                  <div className="mt-3 pt-3 border-t border-gray-500">
                                    <h4 className="text-sm font-medium text-gray-300 mb-2">Votes:</h4>
                                    <div className="space-y-1">
                                      {submission.votes.map((vote, voteIndex) => (
                                        <div key={voteIndex} className="flex items-center justify-between text-xs bg-gray-500 rounded px-2 py-1">
                                          <div className="flex items-center">
                                            <Users className="h-3 w-3 mr-1 text-gray-400" />
                                            <span className="text-gray-300">{vote.voterName}</span>
                                            {vote.comment && (
                                              <span className="text-gray-400 ml-2">&quot;{vote.comment}&quot;</span>
                                            )}
                                          </div>
                                          <span className="font-medium text-green-400">{vote.pointsAssigned} pts</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
        </div>
    </div>
  );
}
