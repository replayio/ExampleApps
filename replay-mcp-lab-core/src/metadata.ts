export const replayMcpTools = [
  "RecordingOverview",
  "ConsoleMessages",
  "DescribePoint",
  "Evaluate",
  "GetStack",
  "GetPointComponent",
  "InspectElement",
  "LocalStorage",
  "Logpoint",
  "NetworkRequest",
  "ReactComponentTree",
  "ReactRenders",
  "UserInteractions",
  "ReduxActions",
  "ZustandStores",
  "TanStackQueries",
  "ReactException",
  "UncaughtException",
  "ListSources",
  "ReadSource",
  "SearchSources",
  "ExecutionDelay",
  "GetPointLink",
  "Screenshot",
  "PlaywrightSteps",
  "ProfileStatements",
  "ProfileSampling",
  "ProfileGraph",
] as const;

export type ReplayMcpTool = (typeof replayMcpTools)[number];

export type LabScenario = {
  id: string;
  title: string;
  kind: "passing" | "diagnostic-failure";
  testFile: string;
  toolsCovered: ReplayMcpTool[];
};

export const labScenarios: LabScenario[] = [
  {
    id: "happy-path",
    title: "Happy Path",
    kind: "passing",
    testFile: "tests/passing/happy-path.spec.ts",
    toolsCovered: [
      "RecordingOverview",
      "Screenshot",
      "GetPointLink",
      "PlaywrightSteps",
      "ConsoleMessages",
      "NetworkRequest",
      "LocalStorage",
      "UserInteractions",
    ],
  },
  {
    id: "state-react",
    title: "State And React",
    kind: "passing",
    testFile: "tests/passing/state-react.spec.ts",
    toolsCovered: [
      "DescribePoint",
      "Evaluate",
      "GetStack",
      "GetPointComponent",
      "ReactComponentTree",
      "ReactRenders",
      "ReduxActions",
      "ZustandStores",
      "TanStackQueries",
    ],
  },
  {
    id: "dom-layout",
    title: "DOM Layout",
    kind: "passing",
    testFile: "tests/passing/dom-layout.spec.ts",
    toolsCovered: ["InspectElement", "Screenshot", "ReactComponentTree"],
  },
  {
    id: "source-logpoint",
    title: "Source And Logpoints",
    kind: "passing",
    testFile: "tests/passing/source-logpoint.spec.ts",
    toolsCovered: [
      "ListSources",
      "ReadSource",
      "SearchSources",
      "Logpoint",
      "DescribePoint",
      "Evaluate",
      "GetStack",
      "ExecutionDelay",
      "GetPointLink",
    ],
  },
  {
    id: "runtime-exception",
    title: "Runtime Exception",
    kind: "diagnostic-failure",
    testFile: "tests/failures/runtime-exception.spec.ts",
    toolsCovered: ["UncaughtException", "ConsoleMessages", "GetStack", "ReadSource"],
  },
  {
    id: "react-exception",
    title: "React Exception",
    kind: "diagnostic-failure",
    testFile: "tests/failures/react-exception.spec.ts",
    toolsCovered: ["ReactException", "ReactComponentTree", "ReactRenders", "ReadSource"],
  },
  {
    id: "playwright-failure",
    title: "Playwright Failure",
    kind: "diagnostic-failure",
    testFile: "tests/failures/playwright-failure.spec.ts",
    toolsCovered: ["PlaywrightSteps", "Screenshot", "ConsoleMessages"],
  },
  {
    id: "profiling",
    title: "Profiling",
    kind: "passing",
    testFile: "tests/passing/profiling.spec.ts",
    toolsCovered: ["ProfileStatements", "ProfileSampling", "ProfileGraph", "ExecutionDelay"],
  },
  {
    id: "stale-closure",
    title: "Stale Closure",
    kind: "diagnostic-failure",
    testFile: "tests/failures/stale-closure.spec.ts",
    toolsCovered: ["DescribePoint", "Evaluate", "GetStack", "ReactRenders", "ConsoleMessages"],
  },
  {
    id: "async-race",
    title: "Async Race",
    kind: "diagnostic-failure",
    testFile: "tests/failures/async-race.spec.ts",
    toolsCovered: ["NetworkRequest", "ExecutionDelay", "GetStack", "ReactRenders", "ConsoleMessages"],
  },
  {
    id: "index-key-list",
    title: "Index-Keyed List",
    kind: "diagnostic-failure",
    testFile: "tests/failures/index-key-list.spec.ts",
    toolsCovered: ["ReactComponentTree", "ReactRenders", "DescribePoint", "GetPointComponent"],
  },
];

export const toolGroups = {
  overview: ["RecordingOverview", "Screenshot", "GetPointLink", "PlaywrightSteps"],
  point: [
    "ConsoleMessages",
    "DescribePoint",
    "Evaluate",
    "GetStack",
    "Logpoint",
    "ListSources",
    "ReadSource",
    "SearchSources",
    "ExecutionDelay",
  ],
  domReact: [
    "InspectElement",
    "GetPointComponent",
    "ReactComponentTree",
    "ReactRenders",
    "ReactException",
  ],
  runtimeStateNetwork: [
    "UncaughtException",
    "NetworkRequest",
    "LocalStorage",
    "ReduxActions",
    "ZustandStores",
    "TanStackQueries",
  ],
  profiling: ["ProfileStatements", "ProfileSampling", "ProfileGraph"],
} satisfies Record<string, ReplayMcpTool[]>;

export function getScenario(id: string | undefined): LabScenario {
  return labScenarios.find(scenario => scenario.id === id) ?? labScenarios[0];
}

export function getScenarioPath(id: string): string {
  return `/${id}`;
}

export function getAllCoveredTools(): ReplayMcpTool[] {
  return Array.from(new Set(labScenarios.flatMap(scenario => scenario.toolsCovered)));
}
