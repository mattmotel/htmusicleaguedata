import { getDataManager, Submission } from '../../lib/data';
import { Search, Music, User, Calendar } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';

// Force dynamic rendering - don't cache this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const dataManager = await getDataManager();
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q as string || '';

  console.log(`[Search Page] Total submissions available: ${dataManager.getSubmissions().length}`);
  console.log(`[Search Page] Query: "${query}"`);

  let searchResults: Submission[] = [];
  
  if (query) {
    searchResults = dataManager.searchSubmissions(query);
    console.log(`[Search Page] Search results found: ${searchResults.length}`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <GlassCard variant="elevated" size="lg">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent mb-2">
                Search
              </h1>
              <p className="text-gray-400">Search songs, artists, albums, and submissions</p>
            </div>
          </GlassCard>

          {/* Search Form */}
          <GlassCard variant="elevated" size="lg">
            <form method="GET" className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="q"
                  placeholder="Search songs, artists, albums, or submitters..."
                  defaultValue={query}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent backdrop-blur-sm"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-emerald-400 to-emerald-500 text-gray-900 rounded-lg font-medium hover:from-emerald-300 hover:to-emerald-400 transition-all shadow-lg"
              >
                Search
              </button>
            </form>
          </GlassCard>

          {/* Search Results */}
          {query && (
            <GlassCard variant="elevated" size="lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-emerald-400">Search Results</h2>
                <span className="text-gray-400">{searchResults.length} results for &quot;{query}&quot;</span>
              </div>

              {searchResults.length > 0 ? (
                <div className="space-y-4">
                  {searchResults.map((submission, index) => (
                    <div key={index} className="bg-gray-700/50 rounded-lg p-4 hover:bg-gray-600/50 transition-colors border border-gray-600/50 backdrop-blur-sm">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <Music className="h-4 w-4 text-emerald-400 mr-2" />
                            <h3 className="text-lg font-semibold text-white">{submission.title}</h3>
                          </div>
                          <p className="text-gray-300 mb-1">by {submission.artist}</p>
                          {submission.album && (
                            <p className="text-sm text-gray-400 mb-2">Album: {submission.album}</p>
                          )}
                          <div className="flex items-center text-sm text-gray-400 mb-2">
                            <User className="h-3 w-3 mr-1" />
                            <span>Submitted by: {submission.submitterName}</span>
                            <Calendar className="h-3 w-3 ml-4 mr-1" />
                            <span>Season {submission.season}, Round {submission.roundNumber}</span>
                          </div>
                          {submission.comment && (
                            <div className="mt-2 p-2 bg-gray-600/50 rounded text-sm text-gray-200">
                              &quot;{submission.comment}&quot;
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No results found for &quot;{query}&quot;</p>
                  <p className="text-gray-500">Try searching for a different term</p>
                </div>
              )}
            </GlassCard>
          )}

          {/* Search Tips */}
          {!query && (
            <GlassCard variant="elevated" size="lg">
              <h2 className="text-2xl font-bold text-emerald-400 mb-4">Search Tips</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Search by Song</h3>
                  <p className="text-gray-400">Search for song titles to find specific tracks</p>
                  <p className="text-sm text-gray-500 mt-1">Example: &quot;Bohemian Rhapsody&quot;</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Search by Artist</h3>
                  <p className="text-gray-400">Find all submissions from a specific artist</p>
                  <p className="text-sm text-gray-500 mt-1">Example: &quot;Radiohead&quot;</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Search by Album</h3>
                  <p className="text-gray-400">Find songs from specific albums</p>
                  <p className="text-sm text-gray-500 mt-1">Example: &quot;OK Computer&quot;</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Search by Submitter</h3>
                  <p className="text-gray-400">Find all submissions from a specific person</p>
                  <p className="text-sm text-gray-500 mt-1">Example: &quot;Matt McInerney&quot;</p>
                </div>
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
