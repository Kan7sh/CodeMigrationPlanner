"use client";

import { useState } from "react";
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  Code,
  Package,
  Layers,
  FileCode,
  GitBranch,
  Shield,
  TestTube,
} from "lucide-react";

interface Repository {
  id: number;
  name: string;
  full_name: string;
  default_branch: string;
}

interface DetectedTech {
  name: string;
  type: string;
  confidence: number;
  evidence: string[];
  version?: string;
}

interface AnalysisResult {
  repository: {
    owner: string;
    repo: string;
    branch: string;
    totalFiles: number;
  };
  detectedTechnologies: DetectedTech[];
  primaryFramework: DetectedTech | null;
  languages: DetectedTech[];
  frameworks: DetectedTech[];
  libraries: DetectedTech[];
  structure: {
    hasDockerfile: boolean;
    hasCI: boolean;
    hasTests: boolean;
    directories: string[];
    fileTypes: Record<string, number>;
  };
  packageJson: any;
}

interface RepositoryAnalyzerProps {
  repository: Repository;
  onAnalysisComplete?: (result: AnalysisResult) => void;
}

export default function RepositoryAnalyzer({
  repository,
  onAnalysisComplete,
}: RepositoryAnalyzerProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState(
    repository.default_branch
  );

  const analyzeRepository = async () => {
    setAnalyzing(true);
    setError(null);
    try {
      const [owner, repo] = repository.full_name.split("/");
      const response = await fetch("/api/analyze/repository", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          owner,
          repo,
          branch: selectedBranch,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze repository");
      }

      const result = await response.json();
      setAnalysis(result.data);
      onAnalysisComplete?.(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setAnalyzing(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-600 bg-green-100";
    if (confidence >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-orange-600 bg-orange-100";
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2">Analyze Repository</h2>
        <p className="text-gray-600">{repository.full_name}</p>
      </div>
      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">
              Select Branch
            </label>
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-gray-500" />
              <input
                type="text"
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-blue-500"
                placeholder="Branch name(e.g., main,master)"
              />
            </div>
          </div>
          <div className="flex items-end">
            <button
              onClick={analyzeRepository}
              disabled={analyzing}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {analyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Code className="h-4 w-4" />
                  Analyze Repository
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-800">Analysis Failed</h3>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      {analysis && (
        <div className="space-y-6">
          {analysis.primaryFramework && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="h-6 w-6 text-blue-600" />
                <h3 className="text-xl font-bold">
                  Primary Framework Detected
                </h3>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold">
                    {analysis.primaryFramework.name}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${getConfidenceColor(
                      analysis.primaryFramework.confidence
                    )}`}
                  >
                    {analysis.primaryFramework.confidence}% Confidence
                  </span>
                </div>
                <div className="space-y-1">
                  {analysis.primaryFramework.evidence.map((ev, idx) => (
                    <p className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-blue-500">•</span>
                      <span>{ev}</span>
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <FileCode className="h-5 w-5 text-blue-500" />
                <h4 className="font-semibold"> Total Files</h4>
              </div>
              <p className="text-3xl font-bold">
                {analysis.repository.totalFiles}
              </p>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Package className="h-5 w-5 text-green-500" />
                <h4 className="font-semibold">Technologies</h4>
              </div>
              <p className="text-3xl font-bold">
                {analysis.detectedTechnologies.length}
              </p>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Layers className="h-5 w-5 text-purple-500" />
                <h4 className="font-semibold">Framework</h4>
              </div>
              <p className="text-3xl font-bold">{analysis.frameworks.length}</p>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4">Project Features</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div
                className={`flex items-center gap-2 p-3 rounded-lg ${
                  analysis.structure.hasDockerfile
                    ? "bg-green-50 text-green-700"
                    : "bg-gray-50 text-gray-400"
                }`}
              >
                <Shield className="h-5 w-5" />
                <span className="text-sm font-medium">Docker</span>
              </div>
              <div
                className={`flex items-center gap-2 p-3 rounded-lg ${
                  analysis.structure.hasCI
                    ? "bg-green-50 text-green-700"
                    : "bg-gray-50 text-gray-400"
                }`}
              >
                <GitBranch className="h-5 w-5" />
                <span className="text-sm font-medium">CI/CD</span>
              </div>
              <div
                className={`flex items-center gap-2 p-3 rounded-lg ${
                  analysis.structure.hasTests
                    ? "bg-green-50 text-green-700"
                    : "bg-gray-50 text-gray-400"
                }`}
              >
                <TestTube className="h-5 w-5" />
                <span className="text-sm font-medium">Tests</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 text-blue-700">
                <Code className="h-5 w-5" />
                <span className="text-sm font-medium">
                  {analysis.structure.directories.length} Dirs
                </span>
              </div>
            </div>
          </div>
          {/* Detected Technologies Grid */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4">
              All Detected Technologies
            </h3>

            {/* Languages */}
            {analysis.languages.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-500 mb-3">
                  Languages
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {analysis.languages.map((tech, idx) => (
                    <TechCard
                      key={idx}
                      tech={tech}
                      getConfidenceColor={getConfidenceColor}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Frameworks */}
            {analysis.frameworks.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-500 mb-3">
                  Frameworks
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {analysis.frameworks.map((tech, idx) => (
                    <TechCard
                      key={idx}
                      tech={tech}
                      getConfidenceColor={getConfidenceColor}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Libraries */}
            {analysis.libraries.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-500 mb-3">
                  Libraries & Tools
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {analysis.libraries.map((tech, idx) => (
                    <TechCard
                      key={idx}
                      tech={tech}
                      getConfidenceColor={getConfidenceColor}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4">File Types Distribution</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {Object.entries(analysis.structure.fileTypes)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 12)
                .map(([ext, count]) => (
                  <div key={ext} className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500 mb-1">.{ext}</div>
                    <div className="text-xl font-bold">{count}</div>
                  </div>
                ))}
            </div>
          </div>

          {analysis.packageJson && (
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-bold mb-4">Package Information</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 mb-2">
                    Dependencies (
                    {analysis.packageJson.dependencies?.length || 0})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.packageJson.dependencies
                      ?.slice(0, 10)
                      .map((dep: string) => (
                        <span
                          key={dep}
                          className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                        >
                          {dep}
                        </span>
                      ))}
                    {analysis.packageJson.dependencies?.length > 10 && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                        +{analysis.packageJson.dependencies.length - 10} more
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-500 mb-2">
                    Dev Dependencies (
                    {analysis.packageJson.devDependencies?.length || 0})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.packageJson.devDependencies
                      ?.slice(0, 10)
                      .map((dep: string) => (
                        <span
                          key={dep}
                          className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm"
                        >
                          {dep}
                        </span>
                      ))}
                    {analysis.packageJson.devDependencies?.length > 10 && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                        {" "}
                        +{analysis.packageJson.devDependencies.length - 10} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TechCard({
  tech,
  getConfidenceColor,
}: {
  tech: DetectedTech;
  getConfidenceColor: (c: number) => string;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="border rounded-lg p-4 hover:shadow-md transition cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold">{tech.name}</h4>
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${getConfidenceColor(
            tech.confidence
          )}`}
        >
          {tech.confidence}%
        </span>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t space-y-1">
          {tech.evidence.map((ev, idx) => (
            <p
              key={idx}
              className="text-xs text-gray-600 flex items-start gap-1"
            >
              <span className="text-blue-500">•</span>
              <span>{ev}</span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
