"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ArrowLeft, LogOut } from "lucide-react";
import RepositoryAnalyzer from "@/components/repository-analyzer";
import RepositoryList from "@/components/repository-list";

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

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  useEffect(() => {
    if (status == "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  const handleRepoSelect = (repo: Repository) => {
    setSelectedRepo(repo);
    setAnalysisResult(null);
  };

  const handleBackToList = () => {
    setSelectedRepo(null);
    setAnalysisResult(null);
  };

  const handleAnalysisComplete = (result: any) => {
    setAnalysisResult(result);
  };

  if (status == "loading") {
    return (
      <div className="flex  items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        {" "}
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {selectedRepo && (
              <button
                onClick={handleBackToList}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-medium">Back to Repositories</span>
              </button>
            )}
            {!selectedRepo && (
              <h1 className="text-2xl font-bold">Code Migration Planner</h1>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <img
                src={session.user?.image || ""}
                alt={session.user?.name || "User"}
                className="w-8 h-8 rounded-full"
              />
              <div className="text-sm">
                <p className="font-medium">{session.user?.name}</p>
                <p className="text-gray-500 text-xs">{session.user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-8">
        {!selectedRepo ? (
          <RepositoryList onSelectRepo={handleRepoSelect} />
        ) : (
          <RepositoryAnalyzer
            repository={selectedRepo}
            onAnalysisComplete={handleAnalysisComplete}
          />
        )}
        {analysisResult && (
          <div className="mt-8 max-w-6xl mx-auto px-6">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">
                {" "}
                Ready for Migration Planning
              </h2>
              <p className="text-gray-600 mb-6">
                We've successfully analyzed your repository. Now select the
                framework you want to migrate to.
              </p>
              <div className="bg-white rounded-lg p-6">
                <h3 className="font-semibold mb-4">Select Target Framework:</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    "React",
                    "Vue.js",
                    "Angular",
                    "Svelte",
                    "Next.js",
                    "Nuxt.js",
                    "SvelteKit",
                    "Astro",
                  ].map((framework) => (
                    <button
                      key={framework}
                      className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-center font-medium"
                    >
                      {framework}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-6 flex gap-4">
                <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium">
                  Generate Migration Plan
                </button>
                <button className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
                  View Detailed Analysis
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <footer className="border-1 mt-16 py-8 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-500 text-sm">
          <p>
            Code Migration Planner - Analyze and plan your framework migrations
          </p>
        </div>
      </footer>
    </div>
  );
}
