export interface DetectionRule {
  name: string;
  type: "framework" | "language" | "library" | "tool";
  files: string[];
  packageJsonKeys?: string[];
  filePatterns?: RegExp[];
  priority: number;
  icon?: string;
}

export interface DetectedTech {
  name: string;
  type: string;
  confidence: number;
  version?: string;
  evidence: string[];
}

export const DETECTION_RULES: DetectionRule[] = [
  {
    name: "Next.js",
    type: "framework",
    files: ["next.config.js", "next.config.mjs", "next.config.ts"],
    packageJsonKeys: ["next"],
    priority: 100,
    icon: "⚡",
  },
  {
    name: "React",
    type: "framework",
    files: [],
    packageJsonKeys: ["react", "react-dom"],
    priority: 90,
    icon: "⚛️",
  },
  {
    name: "Vue.js",
    type: "framework",
    files: ["vue.config.js"],
    packageJsonKeys: ["vue"],
    filePatterns: [/\.vue$/],
    priority: 90,
    icon: "💚",
  },
  {
    name: "Angular",
    type: "framework",
    files: ["angular.json"],
    packageJsonKeys: ["@angular/core"],
    priority: 90,
    icon: "🅰️",
  },
  {
    name: "Svelte",
    type: "framework",
    files: ["svelte.config.js"],
    packageJsonKeys: ["svelte"],
    filePatterns: [/\.svelte$/],
    priority: 90,
    icon: "🔥",
  },
  {
    name: "Nuxt.js",
    type: "framework",
    files: ["nuxt.config.js", "nuxt.config.ts"],
    packageJsonKeys: ["nuxt"],
    priority: 95,
    icon: "💚",
  },
  {
    name: "Express.js",
    type: "framework",
    files: [],
    packageJsonKeys: ["express"],
    priority: 80,
    icon: "🚂",
  },
  {
    name: "NestJS",
    type: "framework",
    files: ["nest-cli.json"],
    packageJsonKeys: ["@nestjs/core"],
    priority: 85,
    icon: "🐱",
  },
  {
    name: "Django",
    type: "framework",
    files: ["manage.py", "settings.py"],
    packageJsonKeys: [],
    priority: 90,
    icon: "🎸",
  },
  {
    name: "Flask",
    type: "framework",
    files: ["app.py"],
    packageJsonKeys: [],
    priority: 85,
    icon: "🧪",
  },
  {
    name: "FastAPI",
    type: "framework",
    files: ["main.py"],
    packageJsonKeys: [],
    priority: 85,
    icon: "⚡",
  },
  {
    name: "Spring Boot",
    type: "framework",
    files: ["pom.xml", "build.gradle"],
    packageJsonKeys: [],
    priority: 90,
    icon: "🍃",
  },
  {
    name: "Webpack",
    type: "tool",
    files: ["webpack.config.js"],
    packageJsonKeys: ["webpack"],
    priority: 70,
    icon: "📦",
  },
  {
    name: "Vite",
    type: "tool",
    files: ["vite.config.js", "vite.config.ts"],
    packageJsonKeys: ["vite"],
    priority: 75,
    icon: "⚡",
  },
  {
    name: "Turbopack",
    type: "tool",
    files: [],
    packageJsonKeys: ["turbo"],
    priority: 70,
    icon: "🚀",
  },
  {
    name: "TypeScript",
    type: "language",
    files: ["tsconfig.json"],
    packageJsonKeys: ["typescript"],
    filePatterns: [/\.tsx?$/],
    priority: 80,
    icon: "📘",
  },
  {
    name: "JavaScript",
    type: "language",
    files: ["package.json"],
    filePatterns: [/\.jsx?$/],
    priority: 70,
    icon: "📜",
  },
  {
    name: "Python",
    type: "language",
    files: ["requirements.txt", "Pipfile", "pyproject.toml"],
    filePatterns: [/\.py$/],
    priority: 80,
    icon: "🐍",
  },
  {
    name: "Redux",
    type: "library",
    files: [],
    packageJsonKeys: ["redux", "@reduxjs/toolkit"],
    priority: 60,
    icon: "🔄",
  },
  {
    name: "Zustand",
    type: "library",
    files: [],
    packageJsonKeys: ["zustand"],
    priority: 60,
    icon: "🐻",
  },
  {
    name: "Pinia",
    type: "library",
    files: [],
    packageJsonKeys: ["pinia"],
    priority: 60,
    icon: "🍍",
  },
  {
    name: "Tailwind CSS",
    type: "library",
    files: ["tailwind.config.js", "tailwind.config.ts"],
    packageJsonKeys: ["tailwindcss"],
    priority: 65,
    icon: "🎨",
  },
  {
    name: "Bootstrap",
    type: "library",
    files: [],
    packageJsonKeys: ["bootstrap"],
    priority: 60,
    icon: "🅱️",
  },

  {
    name: "Prisma",
    type: "library",
    files: ["prisma/schema.prisma"],
    packageJsonKeys: ["prisma", "@prisma/client"],
    priority: 70,
    icon: "🔷",
  },
  {
    name: "MongoDB",
    type: "library",
    files: [],
    packageJsonKeys: ["mongodb", "mongoose"],
    priority: 65,
    icon: "🍃",
  },
];

export class FrameworkDetector {
  private fileList: string[] = [];
  private packageJson: any = null;
  constructor(fileList: string[], packageJson: any = null) {
    this.fileList = fileList;
    this.packageJson = packageJson;
  }

  detect(): DetectedTech[] {
    const detected: DetectedTech[] = [];
    for (const rule of DETECTION_RULES) {
      const result = this.checkRule(rule);
      if (result) {
        detected.push(result);
      }
    }
    return detected.sort((a, b) => b.confidence - a.confidence);
  }

  private checkRule(rule: DetectionRule): DetectedTech | null {
    const evidence: string[] = [];
    let confidence = 0;
    if (rule.files.length > 0) {
      const foundFiles = rule.files.filter((file) => {
        this.fileList.some((f) => f.includes(file));
      });
      if (foundFiles.length > 0) {
        confidence += 40;
        evidence.push(`Found files: ${foundFiles.join(", ")}`);
      }
    }

    if (rule.packageJsonKeys && this.packageJson) {
      const deps = {
        ...this.packageJson.dependencies,
        ...this.packageJson.devDependencies,
      };

      const foundKeys = rule.packageJsonKeys.filter((key) => deps[key]);
      if (foundKeys.length > 0) {
        confidence += 50;
        evidence.push(`Found in package.json: ${foundKeys.join(", ")}`);
        const version = deps[foundKeys[0]];
        if (version) {
          evidence.push(`Version: ${version}`);
        }
      }
    }

    if (rule.filePatterns) {
      const matchingFiles = this.fileList.filter((file) =>
        rule.filePatterns?.some((pattern) => pattern.test(file))
      );
      if (matchingFiles.length > 0) {
        confidence += 30;
        evidence.push(`Found ${matchingFiles.length} matching files`);
      }
    }
    if (confidence === 0) {
      return null;
    }
    return {
      name: rule.name,
      type: rule.type,
      confidence: Math.min(confidence, 100),
      evidence,
    };
  }

  getFrameworks(): DetectedTech[] {
    return this.detect().filter((tech) => tech.type === "framework");
  }

  getLanguages(): DetectedTech[] {
    return this.detect().filter((tech) => tech.type === "language");
  }

  getLibraries(): DetectedTech[] {
    return this.detect().filter((tech) => tech.type === "library");
  }

  getPrimaryFramework(): DetectedTech | null {
    const frameworks = this.getFrameworks();
    return frameworks.length > 0 ? frameworks[0] : null;
  }
}
