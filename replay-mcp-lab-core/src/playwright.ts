import { expect, test, type Page } from "@playwright/test";

async function waitForLabHydration(page: Page) {
  await expect(page.getByTestId("lab-shell")).toHaveAttribute("data-hydrated", "true");
}

export function registerHappyPathSpec() {
  test("happy path captures console, storage, network, screenshots, and clicks", async ({ page }) => {
    await page.request.get("/api/lab/happy-path?mode=success");
    await page.request.get("/api/lab/happy-path?mode=slow");
    await page.goto("/happy-path");
    await waitForLabHydration(page);
    const scenario = page.getByTestId("happy-path-scenario");
    await expect(scenario).toBeVisible();
    await scenario.getByRole("button", { name: "Log" }).click();
    await scenario.getByRole("button", { name: "Warn" }).click();
    await scenario.getByRole("button", { name: "Write Keys" }).click();
    await scenario.getByRole("button", { name: "Fast API" }).click();
    await scenario.getByRole("button", { name: "Slow API" }).click();
    await scenario.getByRole("button", { name: "Mark Click" }).click();
    await expect(page.getByTestId("storage-state")).toContainText("ord-1001");
    await expect(page.getByText("slow:450")).toBeVisible();
    await scenario.getByRole("button", { name: "Error" }).click();
    await page.screenshot({ path: "test-results/happy-path-screenshot.png" });
  });
}

export function registerStateReactSpec() {
  test("state and React captures Redux, Zustand, TanStack Query, and render activity", async ({
    page,
  }) => {
    await page.goto("/state-react");
    await waitForLabHydration(page);
    await expect(page.getByTestId("state-react-scenario")).toBeVisible();
    await page.getByRole("button", { name: "State Burst" }).click();
    await expect(page.getByTestId("redux-state")).toContainText("approved");
    await expect(page.getByTestId("zustand-state")).toContainText("shipped");
    await page.getByRole("button", { name: "Query Success" }).click();
    await expect(page.getByTestId("query-state")).toContainText(
      "Deterministic lab response for state-react"
    );
    await page.getByRole("button", { name: "Query Failure" }).click();
    await expect(page.getByTestId("query-state")).toContainText("query:error");
  });
}

export function registerDomLayoutSpec() {
  test("DOM layout exposes inspectable ancestry and overlap target", async ({ page }) => {
    await page.goto("/dom-layout");
    await waitForLabHydration(page);
    await expect(page.getByTestId("inspectable-dom-stage")).toBeVisible();
    await expect(page.getByTestId("layout-child-primary")).toBeVisible();
    await expect(page.getByTestId("layout-child-overlap")).toBeVisible();
    await page.getByRole("button", { name: "Toggle Overlap" }).click();
    await expect(page.getByText("selector: [data-testid=\"layout-child-overlap\"]")).toBeVisible();
  });
}

export function registerSourceLogpointSpec() {
  test("source and logpoint exposes stable functions and console values", async ({ page }) => {
    await page.goto("/source-logpoint");
    await waitForLabHydration(page);
    await expect(page.getByTestId("source-code-window")).toContainText("mcpLogpointAnchor");
    await page.getByRole("button", { name: "Run Source Path" }).click();
    await expect(page.getByTestId("source-result")).toContainText("mcpLogpointAnchor");
  });
}

export function registerRuntimeExceptionSpec() {
  test("runtime exception records an uncaught browser error", async ({ page }) => {
    const pageError = page.waitForEvent("pageerror");
    await page.goto("/runtime-exception");
    await waitForLabHydration(page);
    await page.getByRole("button", { name: "Throw Runtime Exception" }).click();
    await expect(page.getByTestId("runtime-status")).toContainText("scheduled");
    await expect(await pageError).toHaveProperty(
      "message",
      "Replay MCP lab uncaught runtime exception"
    );
  });
}

export function registerReactExceptionSpec() {
  test("React exception records boundary context and component stack", async ({ page }) => {
    await page.goto("/react-exception");
    await waitForLabHydration(page);
    await expect(page.getByTestId("react-stable-widget")).toBeVisible();
    await page.getByRole("button", { name: "Trigger React Exception" }).click();
    await expect(page.getByTestId("react-boundary-output")).toContainText(
      "Replay MCP lab React render exception"
    );
  });
}

export function registerPlaywrightFailureSpec() {
  test("intentional Playwright failure exposes failing step detail", async ({ page }) => {
    await page.goto("/playwright-failure");
    await waitForLabHydration(page);
    await test.step("confirm checkout before intentional assertion failure", async () => {
      await page.getByRole("button", { name: "Confirm Checkout" }).click();
    });
    await test.step("intentional wrong total assertion", async () => {
      await expect(page.getByTestId("checkout-total")).toHaveText("$999.00", { timeout: 500 });
    });
  });
}

export function registerProfilingSpec() {
  test("profiling creates bounded CPU and dependency graph activity", async ({ page }) => {
    await page.goto("/profiling");
    await waitForLabHydration(page);
    await expect(page.getByTestId("profiling-scenario")).toBeVisible();
    await page.getByRole("button", { name: "Run Workload" }).click();
    await page.getByRole("button", { name: "Run Workload" }).click();
    await expect(page.getByText("runs")).toBeVisible();
    await expect(page.getByTestId("execution-heatmap")).toBeVisible();
  });
}
