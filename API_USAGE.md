# Rounds API Usage Guide

## Endpoint
`GET /api/rounds`

## Description
Returns all rounds data including submissions, votes, stats, and competitor information across all seasons.

## Response Structure

```json
{
  "totalRounds": 245,
  "totalSeasons": 25,
  "rounds": [
    {
      "id": "round-id",
      "timestamp": "2024-01-01T12:00:00Z",
      "title": "Round Title",
      "description": "Round description",
      "playlistUrl": "https://open.spotify.com/playlist/...",
      "season": 25,
      "roundNumber": 1,
      "roundName": "Round Name",
      "stats": {
        "submissions": 10,
        "votes": 90,
        "uniqueSubmitters": 10,
        "uniqueVoters": 10,
        "totalPoints": 1800,
        "avgPointsPerVote": 20.0
      },
      "submissions": [
        {
          "spotifyUri": "spotify:track:...",
          "title": "Song Title",
          "album": "Album Name",
          "artist": "Artist Name",
          "submitterId": "user-id",
          "submitterName": "Submitter Name",
          "created": "2024-01-01T12:00:00Z",
          "comment": "Submission comment",
          "visible": "true"
        }
      ],
      "votes": [
        {
          "spotifyUri": "spotify:track:...",
          "voterId": "user-id",
          "voterName": "Voter Name",
          "created": "2024-01-01T12:00:00Z",
          "pointsAssigned": 5,
          "comment": "Vote comment"
        }
      ]
    }
  ],
  "roundsBySeason": {
    "25": [...],
    "24": [...],
    "23": [...]
  },
  "competitors": [
    {
      "id": "user-id",
      "name": "Competitor Name"
    }
  ]
}
```

## Usage Examples

### Fetch All Rounds (Next.js Server Component)
```typescript
async function getRoundsData() {
  const response = await fetch('http://localhost:3000/api/rounds', {
    cache: 'no-store' // or 'force-cache' for static data
  });
  const data = await response.json();
  return data;
}
```

### Fetch All Rounds (Client Component)
```typescript
'use client';

import { useEffect, useState } from 'react';

function RoundsList() {
  const [rounds, setRounds] = useState(null);

  useEffect(() => {
    fetch('/api/rounds')
      .then(res => res.json())
      .then(data => setRounds(data));
  }, []);

  if (!rounds) return <div>Loading...</div>;

  return (
    <div>
      <h1>Total Rounds: {rounds.totalRounds}</h1>
      {rounds.rounds.map(round => (
        <div key={round.id}>
          <h2>{round.title}</h2>
          <p>Season {round.season}, Round {round.roundNumber}</p>
        </div>
      ))}
    </div>
  );
}
```

### Fetch Rounds by Season
```typescript
const response = await fetch('/api/rounds');
const data = await response.json();

// Access rounds for a specific season
const season25Rounds = data.roundsBySeason[25];
console.log(`Season 25 has ${season25Rounds.length} rounds`);
```

### Fetch from External App
```typescript
// From another Next.js app or external service
const response = await fetch('https://htmusicleaguedata.vercel.app/api/rounds');
const data = await response.json();
```

### Get All Submissions for a Round
```typescript
const response = await fetch('/api/rounds');
const data = await response.json();

// Find a specific round
const round = data.rounds.find(r => r.id === 'round-id');

// Get all submissions for that round
const submissions = round.submissions;
console.log(`${submissions.length} submissions in this round`);
```

### Get All Votes for a Round
```typescript
const response = await fetch('/api/rounds');
const data = await response.json();

const round = data.rounds.find(r => r.id === 'round-id');
const votes = round.votes;
console.log(`${votes.length} votes cast in this round`);
```

### Calculate Round Statistics
```typescript
const response = await fetch('/api/rounds');
const data = await response.json();

// Get stats for all rounds
data.rounds.forEach(round => {
  console.log(`${round.title}:`);
  console.log(`  Submissions: ${round.stats.submissions}`);
  console.log(`  Votes: ${round.stats.votes}`);
  console.log(`  Total Points: ${round.stats.totalPoints}`);
  console.log(`  Avg Points/Vote: ${round.stats.avgPointsPerVote.toFixed(2)}`);
});
```

### Get All Competitors
```typescript
const response = await fetch('/api/rounds');
const data = await response.json();

const competitors = data.competitors;
console.log(`Total competitors: ${competitors.length}`);
```

## Data Fields Explained

### Round Object
- `id`: Unique round identifier
- `timestamp`: When the round was created
- `title`: Round title/theme
- `description`: Round description/instructions
- `playlistUrl`: Spotify playlist URL
- `season`: Season number
- `roundNumber`: Round number within season
- `roundName`: Round name
- `stats`: Aggregated statistics for the round
- `submissions`: Array of all submissions for this round
- `votes`: Array of all votes for this round

### Submission Object
- `spotifyUri`: Spotify track URI
- `title`: Song title
- `album`: Album name
- `artist`: Artist name
- `submitterId`: ID of person who submitted
- `submitterName`: Name of person who submitted
- `created`: When submission was created
- `comment`: Submission comment
- `visible`: Whether submission is visible

### Vote Object
- `spotifyUri`: Spotify track URI being voted on
- `voterId`: ID of person who voted
- `voterName`: Name of person who voted
- `created`: When vote was cast
- `pointsAssigned`: Points given (typically 1-5)
- `comment`: Vote comment

### Stats Object
- `submissions`: Total number of submissions
- `votes`: Total number of votes cast
- `uniqueSubmitters`: Number of unique people who submitted
- `uniqueVoters`: Number of unique people who voted
- `totalPoints`: Sum of all points assigned
- `avgPointsPerVote`: Average points per vote

## Notes

- All rounds are sorted by timestamp (newest first)
- `roundsBySeason` is an object where keys are season numbers (as strings) and values are arrays of rounds
- The API returns ALL data - all rounds, all submissions, all votes, all seasons
- Data is fetched fresh on each request (no caching by default)
- For production, consider adding caching headers if needed

