import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  Box,
  Braces,
  Bug,
  CircleX,
  Database,
  Gauge,
  Layers,
  MousePointerClick,
  Network,
  Play,
  RotateCcw,
  Search,
  ShieldAlert,
  SquareStack,
  Terminal,
  Zap,
  type LucideIcon,
} from "lucide-react";
import * as React from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { getLabApiPayload, type LabApiPayload } from "./api";
import { labScenarios, getScenario, type LabScenario } from "./metadata";
import { calculateDependencyScore, mcpLogpointAnchor, runProfileWorkload } from "./scenarioMath";
import {
  labActions,
  labStore,
  useZustandLabStore,
  type LabDispatch,
  type LabRootState,
} from "./state";

type FrameworkName = "vite" | "next" | "tanstack-start";

type ReplayMcpLabAppProps = {
  basePath?: string;
  framework: FrameworkName;
  initialScenarioId?: string;
};

const scenarioIcons: Record<string, LucideIcon> = {
  "happy-path": BadgeCheck,
  "state-react": SquareStack,
  "dom-layout": Box,
  "source-logpoint": Search,
  "runtime-exception": CircleX,
  "react-exception": ShieldAlert,
  "playwright-failure": Play,
  profiling: Gauge,
};

function normalizeBasePath(basePath: string | undefined) {
  if (!basePath || basePath === "/") {
    return "";
  }
  return `/${basePath.split("/").filter(Boolean).join("/")}`;
}

function getBrowserScenarioId(basePath?: string) {
  if (typeof window === "undefined") {
    return "happy-path";
  }

  const normalizedBasePath = normalizeBasePath(basePath);
  const pathname = normalizedBasePath
    ? window.location.pathname.replace(new RegExp(`^${normalizedBasePath}`), "")
    : window.location.pathname;
  return pathname.split("/").filter(Boolean)[0] || "happy-path";
}

async function requestLabApi(scenario: string, mode: string): Promise<LabApiPayload> {
  const requestPath = `/api/lab/${scenario}?mode=${encodeURIComponent(mode)}`;

  try {
    const response = await fetch(requestPath, {
      headers: { "X-Replay-Mcp-Lab": scenario },
    });
    if (!response.ok && response.status !== 503) {
      throw new Error(`Lab API returned ${response.status}`);
    }
    const payload = (await response.json()) as LabApiPayload;
    if (isStaticPayloadMismatch(mode, payload)) {
      throw new Error(`Lab API returned a static payload for ${mode}`);
    }
    return payload;
  } catch (error) {
    console.warn("Replay MCP lab static API fallback", { scenario, mode, error });
    return getLabApiPayload(scenario, `http://localhost${requestPath}`);
  }
}

function isStaticPayloadMismatch(mode: string, payload: LabApiPayload) {
  const expectedFailure = mode.includes("fail") || mode.includes("query-fail");
  if (expectedFailure && payload.status !== "failed") {
    return true;
  }
  return mode.includes("slow") && payload.metrics.latencyMs !== 450;
}

export function ReplayMcpLabApp({ basePath, framework, initialScenarioId }: ReplayMcpLabAppProps) {
  const [queryClient] = React.useState(() => new QueryClient());

  return (
    <Provider store={labStore}>
      <QueryClientProvider client={queryClient}>
        <LabExperience
          basePath={basePath}
          framework={framework}
          initialScenarioId={initialScenarioId}
        />
      </QueryClientProvider>
    </Provider>
  );
}

function LabExperience({ basePath, framework, initialScenarioId }: ReplayMcpLabAppProps) {
  const normalizedBasePath = normalizeBasePath(basePath);
  const [scenarioId, setScenarioId] = React.useState(
    () => initialScenarioId ?? getBrowserScenarioId(normalizedBasePath)
  );
  const [hydrated, setHydrated] = React.useState(false);
  const scenario = getScenario(scenarioId);

  React.useEffect(() => {
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    const onPopState = () => setScenarioId(getBrowserScenarioId(normalizedBasePath));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [normalizedBasePath]);

  function navigate(nextScenarioId: string) {
    setScenarioId(nextScenarioId);
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", `${normalizedBasePath}/${nextScenarioId}`);
    }
  }

  return (
    <main
      className="lab-shell"
      data-framework={framework}
      data-hydrated={hydrated ? "true" : "false"}
      data-testid="lab-shell"
    >
      <aside className="lab-sidebar" aria-label="Replay MCP scenarios">
        <div className="lab-brand">
          <Activity size={22} aria-hidden="true" />
          <div>
            <strong>Replay MCP Lab</strong>
            <span>{frameworkLabel(framework)}</span>
          </div>
        </div>
        <nav className="lab-nav">
          {labScenarios.map(item => {
            const Icon = scenarioIcons[item.id] ?? Bug;
            return (
              <button
                className={item.id === scenario.id ? "active" : ""}
                data-testid={`scenario-${item.id}`}
                key={item.id}
                onClick={() => navigate(item.id)}
                title={item.title}
                type="button"
              >
                <Icon size={17} aria-hidden="true" />
                <span>{item.title}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <section className="lab-main">
        <header className="lab-topbar">
          <div>
            <p className="eyebrow">{scenario.kind}</p>
            <h1>{scenario.title}</h1>
          </div>
          <ToolCoverage scenario={scenario} />
        </header>
        <ScenarioSurface scenario={scenario} />
      </section>
    </main>
  );
}

function frameworkLabel(framework: FrameworkName) {
  if (framework === "tanstack-start") {
    return "TanStack Start";
  }
  return framework === "next" ? "Next.js" : "Vite";
}

function ToolCoverage({ scenario }: { scenario: LabScenario }) {
  return (
    <div className="tool-coverage" data-testid="tool-coverage">
      {scenario.toolsCovered.map(tool => (
        <span key={tool}>{tool}</span>
      ))}
    </div>
  );
}

function ScenarioSurface({ scenario }: { scenario: LabScenario }) {
  switch (scenario.id) {
    case "state-react":
      return <StateReactScenario />;
    case "dom-layout":
      return <DomLayoutScenario />;
    case "source-logpoint":
      return <SourceLogpointScenario />;
    case "runtime-exception":
      return <RuntimeExceptionScenario />;
    case "react-exception":
      return <ReactExceptionScenario />;
    case "playwright-failure":
      return <PlaywrightFailureScenario />;
    case "profiling":
      return <ProfilingScenario />;
    default:
      return <HappyPathScenario />;
  }
}

function HappyPathScenario() {
  const [networkState, setNetworkState] = React.useState("idle");
  const [storageState, setStorageState] = React.useState("none");
  const [interactionCount, setInteractionCount] = React.useState(0);

  async function runNetwork(mode: string) {
    setNetworkState(`fetching:${mode}`);
    const payload = await requestLabApi("happy-path", mode);
    console.info("Replay MCP lab network response", payload);
    setNetworkState(`${payload.status}:${payload.metrics.latencyMs}`);
  }

  function writeStorage() {
    localStorage.setItem("replay:mcp:lab:order", "ord-1001");
    localStorage.setItem("replay:mcp:lab:lastScenario", "happy-path");
    const stored = localStorage.getItem("replay:mcp:lab:order");
    setStorageState(stored ?? "missing");
    console.log("Replay MCP lab storage write", stored);
  }

  return (
    <div className="scenario-grid" data-testid="happy-path-scenario">
      <section className="panel wide">
        <PanelTitle icon={Terminal} title="Console And Network" />
        <div className="button-row">
          <button
            type="button"
            title="Console log"
            onClick={() => console.log("Replay MCP lab console log", { scenario: "happy-path" })}
          >
            <Terminal size={16} aria-hidden="true" />
            Log
          </button>
          <button
            type="button"
            title="Console warning"
            onClick={() => console.warn("Replay MCP lab warning", { code: "LAB_WARN_1" })}
          >
            <AlertTriangle size={16} aria-hidden="true" />
            Warn
          </button>
          <button
            type="button"
            title="Console error"
            onClick={() => console.error("Replay MCP lab console error", { code: "LAB_ERR_1" })}
          >
            <CircleX size={16} aria-hidden="true" />
            Error
          </button>
          <button type="button" title="Fetch fast API" onClick={() => void runNetwork("success")}>
            <Network size={16} aria-hidden="true" />
            Fast API
          </button>
          <button type="button" title="Fetch slow API" onClick={() => void runNetwork("slow")}>
            <Gauge size={16} aria-hidden="true" />
            Slow API
          </button>
        </div>
        <MetricStrip
          metrics={[
            ["network", networkState],
            ["storage", storageState],
            ["interactions", String(interactionCount)],
          ]}
        />
      </section>

      <section className="panel">
        <PanelTitle icon={Database} title="Local Storage" />
        <button type="button" title="Write local storage" onClick={writeStorage}>
          <Database size={16} aria-hidden="true" />
          Write Keys
        </button>
        <p className="data-line" data-testid="storage-state">
          {storageState}
        </p>
      </section>

      <section className="panel screenshot-target" data-testid="screenshot-target">
        <PanelTitle icon={MousePointerClick} title="Screenshot Target" />
        <button
          type="button"
          title="Register interaction"
          onClick={() => setInteractionCount(count => count + 1)}
        >
          <MousePointerClick size={16} aria-hidden="true" />
          Mark Click
        </button>
        <div className="visual-ledger">
          <span />
          <span />
          <span />
          <span />
        </div>
      </section>
    </div>
  );
}

function StateReactScenario() {
  const dispatch = useDispatch<LabDispatch>();
  const reduxState = useSelector((state: LabRootState) => state.lab);
  const zustandState = useZustandLabStore();
  const [queryMode, setQueryMode] = React.useState<"success" | "query-fail">("success");
  const [queryEnabled, setQueryEnabled] = React.useState(false);
  const [renderTicks, setRenderTicks] = React.useState(0);
  const queryClient = useQueryClient();
  const query = useQuery({
    enabled: queryEnabled && typeof window !== "undefined",
    queryKey: ["replay-mcp-lab-query", queryMode, renderTicks],
    queryFn: async () => {
      const payload = await requestLabApi("state-react", queryMode);
      if (payload.status === "failed") {
        throw new Error("Lab query failed with deterministic payload");
      }
      return payload;
    },
    retry: 1,
  });

  function runStateBurst() {
    dispatch(labActions.reviewOrder("ord-1001"));
    dispatch(labActions.increaseRenderPressure());
    dispatch(labActions.approveOrder());
    zustandState.setPacked();
    zustandState.shipInventory(2);
    setRenderTicks(tick => tick + 1);
    console.info("Replay MCP lab state burst", { reduxState, zustandState });
  }

  return (
    <div className="scenario-grid" data-testid="state-react-scenario">
      <section className="panel wide">
        <PanelTitle icon={Layers} title="State Timeline" />
        <div className="button-row">
          <button type="button" title="Dispatch Redux and Zustand updates" onClick={runStateBurst}>
            <Zap size={16} aria-hidden="true" />
            State Burst
          </button>
          <button
            type="button"
            title="Run successful TanStack Query"
            onClick={() => {
              setQueryMode("success");
              setQueryEnabled(true);
              void queryClient.invalidateQueries({ queryKey: ["replay-mcp-lab-query"] });
            }}
          >
            <Database size={16} aria-hidden="true" />
            Query Success
          </button>
          <button
            type="button"
            title="Run failed TanStack Query"
            onClick={() => {
              setQueryMode("query-fail");
              setQueryEnabled(true);
              void queryClient.invalidateQueries({ queryKey: ["replay-mcp-lab-query"] });
            }}
          >
            <AlertTriangle size={16} aria-hidden="true" />
            Query Failure
          </button>
          <button
            type="button"
            title="Reset local state"
            onClick={() => {
              dispatch(labActions.resetLabState());
              zustandState.reset();
              setQueryEnabled(false);
            }}
          >
            <RotateCcw size={16} aria-hidden="true" />
            Reset
          </button>
        </div>
        <RenderWasteList ticks={renderTicks} />
      </section>

      <section className="panel">
        <PanelTitle icon={SquareStack} title="Redux" />
        <dl className="state-list" data-testid="redux-state">
          <dt>order</dt>
          <dd>{reduxState.activeOrder.id}</dd>
          <dt>status</dt>
          <dd>{reduxState.activeOrder.status}</dd>
          <dt>renders</dt>
          <dd>{reduxState.renderPressure}</dd>
        </dl>
      </section>

      <section className="panel">
        <PanelTitle icon={Database} title="Zustand And Query" />
        <dl className="state-list" data-testid="zustand-state">
          <dt>store</dt>
          <dd>{zustandState.storeId}</dd>
          <dt>inventory</dt>
          <dd>{zustandState.inventoryCount}</dd>
          <dt>status</dt>
          <dd>{zustandState.shipmentStatus}</dd>
          <dt>events</dt>
          <dd>{zustandState.eventCount}</dd>
        </dl>
        <p className="data-line" data-testid="query-state">
          {query.isError
            ? "query:error"
            : query.isFetching
              ? "query:fetching"
              : query.data?.summary ?? "query:idle"}
        </p>
      </section>
    </div>
  );
}

function RenderWasteList({ ticks }: { ticks: number }) {
  const rows = Array.from({ length: 8 }, (_, index) => ({
    id: `fiber-${index + 1}`,
    value: (ticks + 1) * (index + 2),
  }));

  return (
    <div className="render-list" data-testid="render-waste-list">
      {rows.map(row => (
        <span key={row.id}>
          {row.id}: {row.value}
        </span>
      ))}
    </div>
  );
}

function DomLayoutScenario() {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div className="scenario-grid" data-testid="dom-layout-scenario">
      <section className="panel wide dom-stage" data-testid="inspectable-dom-stage">
        <PanelTitle icon={Box} title="Inspectable DOM" />
        <div className="layout-parent" data-testid="layout-parent">
          <div className="layout-child primary" data-testid="layout-child-primary">
            Primary target
          </div>
          <div
            className={expanded ? "layout-child overlap expanded" : "layout-child overlap"}
            data-testid="layout-child-overlap"
          >
            Overlap target
          </div>
        </div>
        <button type="button" title="Toggle overlap" onClick={() => setExpanded(value => !value)}>
          <Box size={16} aria-hidden="true" />
          Toggle Overlap
        </button>
      </section>
      <section className="panel">
        <PanelTitle icon={AlertTriangle} title="Layout Warnings" />
        <ul className="warning-list">
          <li>size: 320 x 180</li>
          <li>overlap: header badge</li>
          <li>selector: [data-testid="layout-child-overlap"]</li>
        </ul>
      </section>
    </div>
  );
}

function SourceLogpointScenario() {
  const [result, setResult] = React.useState("pending");

  function runSourceInspection() {
    const dependencyScore = calculateDependencyScore(67);
    const logpoint = mcpLogpointAnchor(128.4, dependencyScore);
    console.info("Replay MCP lab source result", logpoint);
    setResult(`${logpoint.anchor}:${logpoint.priority}:${logpoint.subtotal}`);
  }

  return (
    <div className="scenario-grid" data-testid="source-logpoint-scenario">
      <section className="panel wide">
        <PanelTitle icon={Braces} title="Source Target" />
        <button type="button" title="Run source inspection" onClick={runSourceInspection}>
          <Search size={16} aria-hidden="true" />
          Run Source Path
        </button>
        <pre className="code-window" data-testid="source-code-window">
          {`function mcpLogpointAnchor(orderTotal, riskScore) {
  const subtotal = Number((orderTotal * 0.82).toFixed(2));
  const priority = riskScore > 80 ? "high" : riskScore > 40 ? "medium" : "low";
  return { anchor: "mcpLogpointAnchor", subtotal, riskScore, priority };
}`}
        </pre>
        <p className="data-line" data-testid="source-result">
          {result}
        </p>
      </section>
    </div>
  );
}

function RuntimeExceptionScenario() {
  const [status, setStatus] = React.useState("armed");

  function throwUncaughtRuntimeException() {
    console.error("Replay MCP lab scheduling uncaught runtime exception");
    setStatus("scheduled");
    window.setTimeout(() => {
      throw new Error("Replay MCP lab uncaught runtime exception");
    }, 0);
  }

  return (
    <div className="scenario-grid" data-testid="runtime-exception-scenario">
      <section className="panel wide danger-panel">
        <PanelTitle icon={CircleX} title="Runtime Exception" />
        <button
          type="button"
          title="Throw runtime exception"
          onClick={throwUncaughtRuntimeException}
        >
          <CircleX size={16} aria-hidden="true" />
          Throw Runtime Exception
        </button>
        <p className="data-line" data-testid="runtime-status">
          {status}
        </p>
      </section>
    </div>
  );
}

function ReactExceptionScenario() {
  const [shouldThrow, setShouldThrow] = React.useState(false);
  const [boundaryKey, setBoundaryKey] = React.useState(0);

  return (
    <div className="scenario-grid" data-testid="react-exception-scenario">
      <section className="panel wide danger-panel">
        <PanelTitle icon={ShieldAlert} title="React Exception" />
        <div className="button-row">
          <button type="button" title="Trigger React render exception" onClick={() => setShouldThrow(true)}>
            <ShieldAlert size={16} aria-hidden="true" />
            Trigger React Exception
          </button>
          <button
            type="button"
            title="Reset React boundary"
            onClick={() => {
              setShouldThrow(false);
              setBoundaryKey(key => key + 1);
            }}
          >
            <RotateCcw size={16} aria-hidden="true" />
            Reset Boundary
          </button>
        </div>
        <LabErrorBoundary key={boundaryKey}>
          <ExplodingWidget shouldThrow={shouldThrow} />
        </LabErrorBoundary>
      </section>
    </div>
  );
}

function ExplodingWidget({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error("Replay MCP lab React render exception");
  }

  return (
    <div className="stable-widget" data-testid="react-stable-widget">
      React widget mounted
    </div>
  );
}

class LabErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error("Replay MCP lab React boundary caught", error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="boundary-output" data-testid="react-boundary-output">
          {this.state.error.message}
        </div>
      );
    }

    return this.props.children;
  }
}

function PlaywrightFailureScenario() {
  return (
    <div className="scenario-grid" data-testid="playwright-failure-scenario">
      <section className="panel wide">
        <PanelTitle icon={Play} title="Playwright Steps" />
        <div className="checkout-strip">
          <span>Checkout total</span>
          <strong data-testid="checkout-total">$128.40</strong>
        </div>
        <button type="button" title="Confirm checkout" onClick={() => console.info("Checkout confirmed")}>
          <BadgeCheck size={16} aria-hidden="true" />
          Confirm Checkout
        </button>
      </section>
    </div>
  );
}

function ProfilingScenario() {
  const [checksum, setChecksum] = React.useState(0);
  const [runs, setRuns] = React.useState(0);

  function runProfile() {
    const nextChecksum = runProfileWorkload(12000 + runs * 250);
    setChecksum(Number(nextChecksum.toFixed(2)));
    setRuns(count => count + 1);
    console.info("Replay MCP lab profile workload", { nextChecksum, runs });
  }

  return (
    <div className="scenario-grid" data-testid="profiling-scenario">
      <section className="panel wide profile-stage">
        <PanelTitle icon={Gauge} title="Profiler Workload" />
        <button type="button" title="Run profiler workload" onClick={runProfile}>
          <Gauge size={16} aria-hidden="true" />
          Run Workload
        </button>
        <MetricStrip
          metrics={[
            ["runs", String(runs)],
            ["checksum", String(checksum)],
            ["coverage", "0.95"],
          ]}
        />
        <div className="heatmap" data-testid="execution-heatmap">
          {Array.from({ length: 28 }, (_, index) => (
            <span key={index} style={{ opacity: 0.24 + ((index + runs) % 8) / 10 }} />
          ))}
        </div>
      </section>
    </div>
  );
}

function PanelTitle({
  icon: Icon,
  title,
}: {
  icon: LucideIcon;
  title: string;
}) {
  return (
    <h2 className="panel-title">
      <Icon size={18} aria-hidden="true" />
      {title}
    </h2>
  );
}

function MetricStrip({ metrics }: { metrics: Array<[string, string]> }) {
  return (
    <dl className="metric-strip">
      {metrics.map(([label, value]) => (
        <React.Fragment key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
}
