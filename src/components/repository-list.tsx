import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Loader2, GitBranch, Star, Eye, AlertCircle } from "lucide-react";

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  watchers_count: number;
  default_branch: string;
  private: boolean;
  updated_at: string;
}

interface RepositoryListProps {
  onSelectRepo: (repo: Repository) => void;
}

export default function RepositoryList({ onSelectRepo }: RepositoryListProps) {
  const { data: session } = useSession();
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);

  useEffect(() => {
    if (session?.user.accessToken) {
      fetchRepositories();
    }
  }, [session]);

  const fetchRepositories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/github/repositories");
      if (!response.ok) {
        throw new Error("Failed to fetch repositories");
      }
      const data = await response.json();
      setRepos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An Error occured");
    } finally {
      setLoading(false);
    }
  };

  const filteredRepos = repos.filter(
    (repo) =>
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRepoSelect = (repo: Repository) => {
    setSelectedRepo(repo);
    onSelectRepo(repo);
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500"> Please sign in to view repositories</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-gray-600">Loading your repositories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2">Select Repository</h2>
        <p className="text-gray-600">
          Choose a repository to analyze and plan migration
        </p>
      </div>
      <div className="mb-6">
        <input
          type="Text"
          placeholder="Search repositories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRepos.map((repo) => (
          <div
            key={repo.id}
            onClick={() => handleRepoSelect(repo)}
            className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
              selectedRepo?.id === repo.id
                ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500"
                : "border-gray-200 hover:border-blue-300"
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-bold text-lg truncate" title={repo.name}>
                  {repo.name}
                </h3>
                <p className="text-xs text-gray-500">{repo.full_name}</p>
              </div>
              {repo.private && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                  Private
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-[40px]">
              {repo.description || "No description available"}
            </p>

            <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
              {repo.language && (
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                  <span>{repo.language}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                <span>{repo.stargazers_count}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{repo.watchers_count}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <GitBranch className="h-3 w-3" />
              <span>{repo.default_branch}</span>
            </div>
            <div className="mt-2 text-xs text-gray-400">
              Updated: {new Date(repo.updated_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
      {filteredRepos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No repositories found</p>
        </div>
      )}
    </div>
  );
}
