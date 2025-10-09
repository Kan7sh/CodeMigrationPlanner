import { AuthOptions } from "@/lib/authOptions";
import { FrameworkDetector } from "@/lib/framework-detector";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(AuthOptions);
    if (!session?.user.accessToken) {
      return NextResponse.json({ error: "Unauthorized", status: 401 });
    }
    const { owner, repo, branch } = await request.json();
    if (!owner || !repo) {
      return NextResponse.json(
        { error: "Owner and repo are required" },
        { status: 400 }
      );
    }
    const branchToUse = branch || "main";
    const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branchToUse}?recursive=1`;

    const treeResponse = await fetch(treeUrl, {
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!treeResponse.ok) {
      const masterTreeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/master?recursive=1`;
      const masterResponse = await fetch(masterTreeUrl, {
        headers: {
          Authorization: `Bearer ${session.user.accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (!masterResponse.ok) {
        throw new Error("Failed to fetch repository tree");
      }
      const masterTree = await masterResponse.json();
      return await analyzeTree(
        masterTree,
        owner,
        repo,
        "master",
        session.user.accessToken
      );
    }

    const tree = await treeResponse.json();
    return await analyzeTree(
      tree,
      owner,
      repo,
      branchToUse,
      session.user.accessToken
    );
  } catch (error) {
    console.log("Error analyzong repository:", error);
    return NextResponse.json(
      { error: "Failed to analyze repository" },
      { status: 500 }
    );
  }
}

async function analyzeTree(
  tree: any,
  owner: string,
  repo: string,
  branch: string,
  accessToken: string
) {
  const files = tree.tree
    .filter((items: any) => items.type == "blob")
    .map((items: any) => items.path);
  let packageJson = null;
  if (files.include("package.json")) {
    try {
      const packageResponse = await fetch(
        `https://api.github.com/repo/${owner}/${repo}/contents/package.json?ref=${branch}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );
      if (packageResponse.ok) {
        const packageData = await packageResponse.json();
        const content = Buffer.from(packageData.content, "base64").toString(
          "utf-8"
        );
        packageJson = JSON.parse(content);
      }
    } catch (error) {
      console.log("Error fetching package.json:", error);
    }
  }

  let requirementsTxt = null;
  if (files.include("requirements.txt")) {
    try {
      const reqResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/requirements.txt?ref=${branch}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );
      if (reqResponse.ok) {
        const reqData = await reqResponse.json();
        requirementsTxt = Buffer.from(reqData.content, "base64").toString(
          "utf-8"
        );
      }
    } catch (error) {
      console.error("Error fetching requirements.txt:", error);
    }
  }

  const detector = new FrameworkDetector(files, packageJson);
  const detectedTech = detector.detect();

  const structure = analyzeStructure(files);
  return NextResponse.json({
    success: true,
    data: {
      repository: {
        owner,
        repo,
        branch,
        totalFiles: files.length,
      },
      detectedTechnologies: detectedTech,
      primaryFramework: detector.getPrimaryFramework(),
      languages: detector.getLanguages(),
      frameworks: detector.getFrameworks(),
      libraries: detector.getLibraries(),
      structure,
      packageJson: packageJson
        ? {
            name: packageJson.name,
            version: packageJson.version,
            scripts: packageJson.scripts,
            dependencies: Object.keys(packageJson.dependencies || {}),
            devDependencies: Object.keys(packageJson.devDependencies || {}),
          }
        : null,
      requirementsTxt: requirementsTxt
        ? requirementsTxt.split("\n").filter((l: string) => l.trim())
        : null,
    },
  });
}

function analyzeStructure(files: string[]) {
  const structure = {
    hasDockerFile: files.some((f) => f.includes("Dockerfile")),
    hasCL: files.some(
      (f) =>
        f.includes(".github/workflows") ||
        f.includes(".gitlab-ci.yml") ||
        f.includes("jenkins")
    ),
    hasTests: files.some(
      (f) => f.includes("test") || f.includes("spec") || f.includes("__tests__")
    ),
    directories: getDirectories(files),
    fileTypes: getFileTypes(files),
  };

  return structure;
}

function getDirectories(files: string[]): string[] {
  const dirs = new Set<string>();
  files.forEach((file) => {
    const parts = file.split("/");
    if (parts.length > 1) {
      dirs.add(parts[0]);
    }
  });

  return Array.from(dirs).sort();
}

function getFileTypes(files: string[]): Record<string, number> {
  const types: Record<string, number> = {};
  files.forEach((file) => {
    const ext = file.split(".").pop() || "no-extension";
    types[ext] = (types[ext] || 0) + 1;
  });
  return types;
}
