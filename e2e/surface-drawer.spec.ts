import { expect, test, type Page } from "@playwright/test"

const drawerDocsPath = "/components/surface/drawer/"

async function swipe(
  page: Page,
  start: { x: number; y: number },
  end: { x: number; y: number },
  steps = 8
) {
  const client = await page.context().newCDPSession(page)
  await client.send("Emulation.setTouchEmulationEnabled", {
    enabled: true,
    maxTouchPoints: 1,
  })
  await client.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [start],
  })

  for (let step = 1; step <= steps; step += 1) {
    const progress = step / steps
    await client.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [
        {
          x: start.x + (end.x - start.x) * progress,
          y: start.y + (end.y - start.y) * progress,
        },
      ],
    })
    await page.evaluate(
      () =>
        new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    )
  }

  await client.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  })
  await client.detach()
}

test.beforeEach(async ({ page }) => {
  await page.goto(drawerDocsPath)
})

test("keeps modal focus and scroll lock until Escape closes the drawer", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Open Confirm Drawer" }).click()

  const drawer = page.getByRole("alertdialog", { name: "Archive project?" })
  await expect(drawer).toBeVisible()
  await expect
    .poll(() =>
      page.evaluate(() => {
        const rootOverflow = getComputedStyle(document.documentElement).overflow
        const bodyOverflow = getComputedStyle(document.body).overflow
        return rootOverflow === "hidden" || bodyOverflow === "hidden"
      })
    )
    .toBe(true)

  for (let index = 0; index < 6; index += 1) {
    await page.keyboard.press("Tab")
    await expect
      .poll(() =>
        drawer.evaluate((element) => element.contains(document.activeElement))
      )
      .toBe(true)
  }

  await page.keyboard.press("Escape")
  await expect(drawer).toBeHidden()
  await expect
    .poll(() =>
      page.evaluate(() => {
        const rootOverflow = getComputedStyle(document.documentElement).overflow
        const bodyOverflow = getComputedStyle(document.body).overflow
        return rootOverflow !== "hidden" && bodyOverflow !== "hidden"
      })
    )
    .toBe(true)
})

test("keeps a non-modal drawer open while the page remains interactive", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Open Non-modal Drawer" }).click()

  const drawer = page.getByRole("dialog", { name: "Non-modal drawer" })
  await expect(drawer).toBeVisible()
  await expect(page.locator('[data-slot="drawer-overlay"]')).toHaveCount(0)

  await page.getByRole("button", { name: "Background clicks: 0" }).click()
  await expect(
    page.getByRole("button", { name: "Background clicks: 1" })
  ).toBeVisible()
  await expect(drawer).toBeVisible()

  await drawer.getByRole("button", { name: "Close" }).click()
  await expect(drawer).toBeHidden()
})

test("dismisses a bottom drawer with a swipe gesture", async ({ page }) => {
  await page.getByRole("button", { name: "Bottom", exact: true }).click()

  const drawer = page.getByRole("dialog", { name: "Bottom drawer" })
  await expect(drawer).toBeVisible()

  const handle = page.locator('[data-slot="drawer-swipe-handle"]')
  const box = await handle.boundingBox()
  expect(box).not.toBeNull()
  if (!box) return

  const centerX = box.x + box.width / 2
  const centerY = box.y + box.height / 2
  await swipe(
    page,
    { x: centerX, y: centerY },
    { x: centerX, y: centerY + 240 },
    4
  )

  await expect(drawer).toBeHidden()
})

test("expands the final snap point with both close actions visible", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1304, height: 634 })
  await page.getByRole("button", { name: "Open Snap Points Drawer" }).click()

  const drawer = page.getByRole("dialog", { name: "Snap points" })
  const popup = page.locator('[data-slot="drawer-popup"]')
  const handle = page.locator('[data-slot="drawer-swipe-handle"]')
  await expect(drawer).toBeVisible()
  await expect(drawer.getByLabel("Close")).toBeVisible()

  const box = await handle.boundingBox()
  expect(box).not.toBeNull()
  if (!box) return

  const centerX = box.x + box.width / 2
  const centerY = box.y + box.height / 2
  await swipe(
    page,
    { x: centerX, y: centerY },
    { x: centerX, y: 100 },
    20
  )

  await expect
    .poll(() =>
      popup.evaluate((element) =>
        getComputedStyle(element).getPropertyValue("--drawer-snap-point-offset")
      )
    )
    .toBe("0px")

  const footerClose = drawer.getByText("Close", { exact: true })
  await expect(footerClose).toBeVisible()
  const footerBox = await footerClose.boundingBox()
  expect(footerBox).not.toBeNull()
  expect((footerBox?.y ?? 0) + (footerBox?.height ?? 0)).toBeLessThanOrEqual(634)
})
