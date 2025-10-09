"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Github, Zap, Shield, GitBranch } from "lucide-react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  const signInWithGithub = async () => {
    await signIn("github", { callbackUrl: "/dashboard" });
  };

  if (status === "loading") {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Code Migration Planner
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Analyze your codebase, detect frameworks, and plan seamless
            migrations with AI-powered insights
          </p>

          <button
            onClick={signInWithGithub}
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-xl text-lg font-semibold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl"
          >
            <Github className="h-6 w-6" />
            <span>Sign in with GitHub</span>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">Instant Analysis</h3>
            <p className="text-gray-600">
              Automatically detect frameworks, languages, and dependencies in
              seconds
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">Smart Detection</h3>
            <p className="text-gray-600">
              AI-powered technology detection with confidence scoring and
              evidence
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <GitBranch className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">Migration Plans</h3>
            <p className="text-gray-600">
              Generate step-by-step migration strategies for any framework
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: "1",
                title: "Connect GitHub",
                desc: "Sign in with your GitHub account",
              },
              {
                step: "2",
                title: "Select Repository",
                desc: "Choose a repo from your account",
              },
              {
                step: "3",
                title: "Analyze Code",
                desc: "We detect all frameworks and tech",
              },
              {
                step: "4",
                title: "Plan Migration",
                desc: "Get AI-powered migration strategy",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Start?</h2>
            <p className="text-lg mb-8 opacity-90">
              Analyze your first repository for free
            </p>
            <button
              onClick={signInWithGithub}
              className="px-8 py-4 bg-white text-blue-600 rounded-xl text-lg font-semibold hover:bg-gray-100 transition inline-flex items-center gap-3"
            >
              <Github className="h-6 w-6" />
              Get Started Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
