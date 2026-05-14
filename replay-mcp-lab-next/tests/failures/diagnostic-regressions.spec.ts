import { expect, test, type Page } from "@playwright/test";

async function waitForLabHydration(page: Page) {
  const shell = page.getByTestId("lab-shell");
  await expect(shell).toBeVisible({ timeout: 15_000 });
  await expect(shell).toHaveAttribute("data-hydrated", "true", { timeout: 15_000 });
}

test("intentional diagnostic failure captures network, storage, and console context", async ({
  page,
}) => {
  await page.goto("/happy-path");
  await waitForLabHydration(page);
  const scenario = page.getByTestId("happy-path-scenario");

  await scenario.getByRole("button", { name: "Log" }).click();
  await scenario.getByRole("button", { name: "Warn" }).click();
  await scenario.getByRole("button", { name: "Write Keys" }).click();
  await scenario.getByRole("button", { name: "Slow API" }).click();
  await expect(page.getByText("slow:450")).toBeVisible({ timeout: 15_000 });
  await scenario.getByRole("button", { name: "Error" }).click();

  await expect(page.getByTestId("storage-state")).toContainText("ord-9999", { timeout: 500 });
});

test("intentional diagnostic failure captures Redux, Zustand, and query context", async ({
  page,
}) => {
  await page.goto("/state-react");
  await waitForLabHydration(page);

  await page.getByRole("button", { name: "State Burst" }).click();
  await expect(page.getByTestId("redux-state")).toContainText("approved");
  await expect(page.getByTestId("zustand-state")).toContainText("shipped");
  await page.getByRole("button", { name: "Query Success" }).click();
  await expect(page.getByTestId("query-state")).toContainText(
    "Deterministic lab response for state-react"
  );
  await page.getByRole("button", { name: "Query Failure" }).click();
  await expect(page.getByTestId("query-state")).toContainText("query:error");

  await expect(page.getByTestId("redux-state")).toContainText("cancelled", { timeout: 500 });
});

test("intentional diagnostic failure captures layout overlap screenshot context", async ({
  page,
}) => {
  await page.goto("/dom-layout");
  await waitForLabHydration(page);

  await page.getByRole("button", { name: "Toggle Overlap" }).click();
  await expect(page.getByText('selector: [data-testid="layout-child-overlap"]')).toBeVisible();
  await page.screenshot({ path: "test-results/diagnostic-layout-overlap.png" });

  await expect(page.getByTestId("layout-child-overlap")).toHaveCSS("position", "static", {
    timeout: 500,
  });
});
