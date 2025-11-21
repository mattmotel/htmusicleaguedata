import { NextResponse } from 'next/server';
import { getDataManager } from '../../../lib/data';

export async function GET() {
  try {
    const dataManager = await getDataManager();
    const roundsMap = dataManager.getRounds();
    const submissions = dataManager.getSubmissions();
    const votes = dataManager.getVotes();
    const competitors = dataManager.getCompetitors();

    // Convert rounds map to array and enrich with data
    const roundsArray = Array.from(roundsMap.values()).map(round => {
      // Find which season this round belongs to
      const roundSubmissions = submissions.filter(s => s.roundId === round.id);
      const season = roundSubmissions[0]?.season || 0;
      const roundNumber = roundSubmissions[0]?.roundNumber || 0;
      const roundName = roundSubmissions[0]?.roundName || round.title;

      // Get submissions for this round
      const roundSubmissionsData = roundSubmissions.map(sub => ({
        spotifyUri: sub.spotifyUri,
        title: sub.title,
        album: sub.album,
        artist: sub.artist,
        submitterId: sub.submitterId,
        submitterName: sub.submitterName,
        created: sub.created,
        comment: sub.comment,
        visible: sub.visible,
      }));

      // Get votes for this round
      const roundVotesData = votes
        .filter(v => v.roundId === round.id)
        .map(vote => ({
          spotifyUri: vote.spotifyUri,
          voterId: vote.voterId,
          voterName: vote.voterName,
          created: vote.created,
          pointsAssigned: vote.pointsAssigned,
          comment: vote.comment,
        }));

      // Calculate stats
      const uniqueSubmitters = new Set(roundSubmissions.map(s => s.submitterId));
      const uniqueVoters = new Set(roundVotesData.map(v => v.voterId));
      const totalPoints = roundVotesData.reduce((sum, v) => sum + v.pointsAssigned, 0);

      return {
        id: round.id,
        timestamp: round.timestamp,
        title: round.title,
        description: round.description,
        playlistUrl: round.playlistUrl,
        season,
        roundNumber,
        roundName,
        stats: {
          submissions: roundSubmissions.length,
          votes: roundVotesData.length,
          uniqueSubmitters: uniqueSubmitters.size,
          uniqueVoters: uniqueVoters.size,
          totalPoints,
          avgPointsPerVote: roundVotesData.length > 0 ? totalPoints / roundVotesData.length : 0,
        },
        submissions: roundSubmissionsData,
        votes: roundVotesData,
      };
    });

    // Sort by timestamp (newest first)
    const sortedRounds = roundsArray.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Group by season for easier consumption
    const roundsBySeason = new Map<number, typeof sortedRounds>();
    sortedRounds.forEach(round => {
      if (!roundsBySeason.has(round.season)) {
        roundsBySeason.set(round.season, []);
      }
      roundsBySeason.get(round.season)!.push(round);
    });

    // Convert Map to object for JSON serialization
    const roundsBySeasonObj: Record<number, typeof sortedRounds> = {};
    roundsBySeason.forEach((rounds, season) => {
      roundsBySeasonObj[season] = rounds;
    });

    return NextResponse.json({
      totalRounds: sortedRounds.length,
      totalSeasons: roundsBySeason.size,
      rounds: sortedRounds,
      roundsBySeason: roundsBySeasonObj,
      competitors: Array.from(competitors.entries()).map(([id, name]) => ({ id, name })),
    });
  } catch (error) {
    console.error('Error fetching rounds data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rounds data' },
      { status: 500 }
    );
  }
}

