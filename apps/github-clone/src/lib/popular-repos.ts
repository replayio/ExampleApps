// Curated list of popular public repositories, derived from a GitHub
// stars export and sorted by star count (descending). Shown to logged-out
// visitors so they can browse popular public repos without signing in.
// Regenerate with: gh api --paginate "user/starred?per_page=100" ...

export interface PopularRepo {
  fullName: string
  owner: string
  name: string
  description: string | null
  language: string | null
  stargazersCount: number
  forksCount: number
  htmlUrl: string
}

export const POPULAR_REPOS: PopularRepo[] = [
  {
    "description": "A complete computer science study plan to become a software engineer.",
    "forksCount": 83559,
    "fullName": "jwasham/coding-interview-university",
    "htmlUrl": "https://github.com/jwasham/coding-interview-university",
    "language": null,
    "name": "coding-interview-university",
    "owner": "jwasham",
    "stargazersCount": 352251
  },
  {
    "description": "The library for web and native user interfaces.",
    "forksCount": 51058,
    "fullName": "react/react",
    "htmlUrl": "https://github.com/react/react",
    "language": "JavaScript",
    "name": "react",
    "owner": "react",
    "stargazersCount": 245877
  },
  {
    "description": "An Open Source Machine Learning Framework for Everyone",
    "forksCount": 75185,
    "fullName": "tensorflow/tensorflow",
    "htmlUrl": "https://github.com/tensorflow/tensorflow",
    "language": "C++",
    "name": "tensorflow",
    "owner": "tensorflow",
    "stargazersCount": 195676
  },
  {
    "description": "Visual Studio Code",
    "forksCount": 40441,
    "fullName": "microsoft/vscode",
    "htmlUrl": "https://github.com/microsoft/vscode",
    "language": "TypeScript",
    "name": "vscode",
    "owner": "microsoft",
    "stargazersCount": 186341
  },
  {
    "description": "AutoGPT is the vision of accessible AI for everyone, to use and to build on. Our mission is to provide the tools, so that you can focus on what matters.",
    "forksCount": 46139,
    "fullName": "Significant-Gravitas/AutoGPT",
    "htmlUrl": "https://github.com/Significant-Gravitas/AutoGPT",
    "language": "Python",
    "name": "AutoGPT",
    "owner": "Significant-Gravitas",
    "stargazersCount": 184959
  },
  {
    "description": "A book series (2 published editions) on the JS language.",
    "forksCount": 33521,
    "fullName": "getify/You-Dont-Know-JS",
    "htmlUrl": "https://github.com/getify/You-Dont-Know-JS",
    "language": null,
    "name": "You-Dont-Know-JS",
    "owner": "getify",
    "stargazersCount": 184532
  },
  {
    "description": "Python tool for converting files and office documents to Markdown.",
    "forksCount": 10651,
    "fullName": "microsoft/markitdown",
    "htmlUrl": "https://github.com/microsoft/markitdown",
    "language": "Python",
    "name": "markitdown",
    "owner": "microsoft",
    "stargazersCount": 154037
  },
  {
    "description": "FULL Augment Code, Claude Code, Cluely, CodeBuddy, Comet, Cursor, Devin AI, Junie, Kiro, Leap.new, Lovable, Manus, NotionAI, Orchids.app, Perplexity, Poke, Qoder, Replit, Same.dev, Trae, Traycer AI, VSCode Agent, Warp.dev, Windsurf, Xcode, Z.ai Code, Dia & v0. (And other Open Sourced) System Prompts, Internal Tools & AI Models",
    "forksCount": 34693,
    "fullName": "x1xhlol/system-prompts-and-models-of-ai-tools",
    "htmlUrl": "https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools",
    "language": null,
    "name": "system-prompts-and-models-of-ai-tools",
    "owner": "x1xhlol",
    "stargazersCount": 140558
  },
  {
    "description": "Curated coding interview preparation materials for busy software engineers",
    "forksCount": 16622,
    "fullName": "yangshun/tech-interview-handbook",
    "htmlUrl": "https://github.com/yangshun/tech-interview-handbook",
    "language": "TypeScript",
    "name": "tech-interview-handbook",
    "owner": "yangshun",
    "stargazersCount": 140320
  },
  {
    "description": "The agent engineering platform.",
    "forksCount": 23101,
    "fullName": "langchain-ai/langchain",
    "htmlUrl": "https://github.com/langchain-ai/langchain",
    "language": "Python",
    "name": "langchain",
    "owner": "langchain-ai",
    "stargazersCount": 139390
  },
  {
    "description": "Virtual whiteboard for sketching hand-drawn like diagrams",
    "forksCount": 14030,
    "fullName": "excalidraw/excalidraw",
    "htmlUrl": "https://github.com/excalidraw/excalidraw",
    "language": "TypeScript",
    "name": "excalidraw",
    "owner": "excalidraw",
    "stargazersCount": 125403
  },
  {
    "description": "Production-Grade Container Scheduling and Management",
    "forksCount": 43218,
    "fullName": "kubernetes/kubernetes",
    "htmlUrl": "https://github.com/kubernetes/kubernetes",
    "language": "Go",
    "name": "kubernetes",
    "owner": "kubernetes",
    "stargazersCount": 123035
  },
  {
    "description": "Node.js JavaScript runtime ✨🐢🚀✨",
    "forksCount": 35692,
    "fullName": "nodejs/node",
    "htmlUrl": "https://github.com/nodejs/node",
    "language": "JavaScript",
    "name": "node",
    "owner": "nodejs",
    "stargazersCount": 117786
  },
  {
    "description": "LLM inference in C/C++",
    "forksCount": 19606,
    "fullName": "ggml-org/llama.cpp",
    "htmlUrl": "https://github.com/ggml-org/llama.cpp",
    "language": "C++",
    "name": "llama.cpp",
    "owner": "ggml-org",
    "stargazersCount": 116675
  },
  {
    "description": "Bring data to life with SVG, Canvas and HTML. :bar_chart::chart_with_upwards_trend::tada:",
    "forksCount": 22719,
    "fullName": "d3/d3",
    "htmlUrl": "https://github.com/d3/d3",
    "language": "Shell",
    "name": "d3",
    "owner": "d3",
    "stargazersCount": 113094
  },
  {
    "description": "TypeScript is a superset of JavaScript that compiles to clean JavaScript output.",
    "forksCount": 13437,
    "fullName": "microsoft/TypeScript",
    "htmlUrl": "https://github.com/microsoft/TypeScript",
    "language": "TypeScript",
    "name": "TypeScript",
    "owner": "microsoft",
    "stargazersCount": 109262
  },
  {
    "description": "Set up a modern web app by running one command.",
    "forksCount": 26995,
    "fullName": "react/create-react-app",
    "htmlUrl": "https://github.com/react/create-react-app",
    "language": "JavaScript",
    "name": "create-react-app",
    "owner": "react",
    "stargazersCount": 103326
  },
  {
    "description": "Robust Speech Recognition via Large-Scale Weak Supervision",
    "forksCount": 12540,
    "fullName": "openai/whisper",
    "htmlUrl": "https://github.com/openai/whisper",
    "language": "Python",
    "name": "whisper",
    "owner": "openai",
    "stargazersCount": 102786
  },
  {
    "description": "Deliver web apps with confidence 🚀",
    "forksCount": 27178,
    "fullName": "angular/angular",
    "htmlUrl": "https://github.com/angular/angular",
    "language": "TypeScript",
    "name": "angular",
    "owner": "angular",
    "stargazersCount": 100347
  },
  {
    "description": "Material UI: Comprehensive React component library that implements Google's Material Design. Free forever.",
    "forksCount": 32600,
    "fullName": "mui/material-ui",
    "htmlUrl": "https://github.com/mui/material-ui",
    "language": "JavaScript",
    "name": "material-ui",
    "owner": "mui",
    "stargazersCount": 98408
  },
  {
    "description": "An enterprise-class UI design language and React UI library",
    "forksCount": 54620,
    "fullName": "ant-design/ant-design",
    "htmlUrl": "https://github.com/ant-design/ant-design",
    "language": "TypeScript",
    "name": "ant-design",
    "owner": "ant-design",
    "stargazersCount": 98359
  },
  {
    "description": "Lightweight coding agent that runs in your terminal",
    "forksCount": 13475,
    "fullName": "openai/codex",
    "htmlUrl": "https://github.com/openai/codex",
    "language": "Rust",
    "name": "codex",
    "owner": "openai",
    "stargazersCount": 91248
  },
  {
    "description": "Storybook is the industry standard workshop for building, documenting, and testing UI components in isolation",
    "forksCount": 10130,
    "fullName": "storybookjs/storybook",
    "htmlUrl": "https://github.com/storybookjs/storybook",
    "language": "TypeScript",
    "name": "storybook",
    "owner": "storybookjs",
    "stargazersCount": 90355
  },
  {
    "description": "A high-throughput and memory-efficient inference and serving engine for LLMs",
    "forksCount": 18090,
    "fullName": "vllm-project/vllm",
    "htmlUrl": "https://github.com/vllm-project/vllm",
    "language": "Python",
    "name": "vllm",
    "owner": "vllm-project",
    "stargazersCount": 82957
  },
  {
    "description": "🍿 A cross-browser library of CSS animations. As easy to use as an easy thing.",
    "forksCount": 15981,
    "fullName": "animate-css/animate.css",
    "htmlUrl": "https://github.com/animate-css/animate.css",
    "language": "CSS",
    "name": "animate.css",
    "owner": "animate-css",
    "stargazersCount": 82610
  },
  {
    "description": "Free monospaced font with programming ligatures",
    "forksCount": 3186,
    "fullName": "tonsky/FiraCode",
    "htmlUrl": "https://github.com/tonsky/FiraCode",
    "language": "Clojure",
    "name": "FiraCode",
    "owner": "tonsky",
    "stargazersCount": 81745
  },
  {
    "description": "Open-Source API Development Ecosystem • https://hoppscotch.io • Offline, On-Prem & Cloud • Web, Desktop & CLI • Open-Source Alternative to Postman, Insomnia",
    "forksCount": 5918,
    "fullName": "hoppscotch/hoppscotch",
    "htmlUrl": "https://github.com/hoppscotch/hoppscotch",
    "language": "TypeScript",
    "name": "hoppscotch",
    "owner": "hoppscotch",
    "stargazersCount": 79541
  },
  {
    "description": ":link: Some useful websites for programmers.",
    "forksCount": 8564,
    "fullName": "sdmg15/Best-websites-a-programmer-should-visit",
    "htmlUrl": "https://github.com/sdmg15/Best-websites-a-programmer-should-visit",
    "language": null,
    "name": "Best-websites-a-programmer-should-visit",
    "owner": "sdmg15",
    "stargazersCount": 76141
  },
  {
    "description": "Apache Superset is a Data Visualization and Data Exploration Platform",
    "forksCount": 17613,
    "fullName": "apache/superset",
    "htmlUrl": "https://github.com/apache/superset",
    "language": "TypeScript",
    "name": "superset",
    "owner": "apache",
    "stargazersCount": 73304
  },
  {
    "description": "A curated list of awesome Machine Learning frameworks, libraries and software.",
    "forksCount": 15490,
    "fullName": "josephmisiti/awesome-machine-learning",
    "htmlUrl": "https://github.com/josephmisiti/awesome-machine-learning",
    "language": "Python",
    "name": "awesome-machine-learning",
    "owner": "josephmisiti",
    "stargazersCount": 72846
  }
]
