import { OverallStats } from '@/lib/data';

interface StatsCardsProps {
  stats: OverallStats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      label: 'Total Submissions',
      value: stats.totalSubmissions.toLocaleString(),
      color: 'text-green-400'
    },
    {
      label: 'Unique Artists',
      value: stats.uniqueArtists.toLocaleString(),
      color: 'text-blue-400'
    },
    {
      label: 'Unique Albums',
      value: stats.uniqueAlbums.toLocaleString(),
      color: 'text-purple-400'
    },
    {
      label: 'Rounds',
      value: stats.uniqueRounds.toLocaleString(),
      color: 'text-orange-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div key={index} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className={`text-3xl font-bold ${card.color} mb-2`}>
            {card.value}
          </div>
          <div className="text-gray-400 text-sm">
            {card.label}
          </div>
        </div>
      ))}
    </div>
  );
}
