import { expect, test, type Page } from "@playwright/test"

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
      () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    )
  }

  await client.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  })
  await client.detach()
}

async function expectScrollLock(page: Page, locked: boolean) {
  await expect
    .poll(() =>
      page.evaluate(() => {
        const rootOverflow = getComputedStyle(document.documentElement).overflow
        const bodyOverflow = getComputedStyle(document.body).overflow
        return rootOverflow === "hidden" || bodyOverflow === "hidden"
      })
    )
    .toBe(locked)
}

test.beforeEach(async ({ page }) => {
  await page.goto("/")
})

test("Radix Dialog traps focus, locks scroll, and settles after Escape", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Open Radix Dialog" }).click()

  const dialog = page.getByRole("alertdialog", { name: "Radix confirm" })
  await expect(dialog).toBeVisible()
  await expectScrollLock(page, true)

  for (let index = 0; index < 5; index += 1) {
    await page.keyboard.press("Tab")
    await expect
      .poll(() =>
        dialog.evaluate((element) => element.contains(document.activeElement))
      )
      .toBe(true)
  }

  await page.keyboard.press("Escape")
  await expect(dialog).toBeHidden()
  await expect(page.getByLabel("Surface result")).toHaveText("null")
  await expectScrollLock(page, false)
})

test("Radix Prompt preserves native required and minLength validation", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Open Required Radix Prompt" }).click()

  const dialog = page.getByRole("dialog", { name: "Required Radix prompt" })
  const input = dialog.getByRole("textbox", { name: "Input" })
  await expect(dialog).toBeVisible()

  await input.press("Enter")
  await expect(dialog).toBeVisible()
  await expect(input).toBeFocused()
  await expect(input).toHaveJSProperty("validity.valid", false)
  await expect(page.getByLabel("Surface result")).toHaveText("pending")

  await input.fill("ab")
  await input.press("Enter")
  await expect(dialog).toBeVisible()
  await expect(input).toHaveJSProperty("validity.valid", false)

  await input.fill("valid")
  await input.press("Enter")
  await expect(dialog).toBeHidden()
  await expect(page.getByLabel("Surface result")).toHaveText("valid")
})

test("Vaul Drawer closes with Escape and settles its result", async ({ page }) => {
  await page.getByRole("button", { name: "Open Radix Drawer" }).click()

  const drawer = page.getByRole("alertdialog", { name: "Radix drawer" })
  await expect(drawer).toBeVisible()
  await expectScrollLock(page, true)

  await page.keyboard.press("Escape")
  await expect(drawer).toBeHidden()
  await expect(page.getByLabel("Surface result")).toHaveText("null")
  await expectScrollLock(page, false)
})

test("Vaul non-modal Drawer leaves the page interactive", async ({ page }) => {
  await page
    .getByRole("button", { name: "Open Radix Non-modal Drawer" })
    .click()

  const drawer = page.getByRole("dialog", {
    name: "Radix non-modal drawer",
  })
  await expect(drawer).toBeVisible()
  await expect(page.locator('[data-slot="drawer-overlay"]')).toBeHidden()

  await page.getByRole("button", { name: "Background clicks: 0" }).click()
  await expect(
    page.getByRole("button", { name: "Background clicks: 1" })
  ).toBeVisible()
  await expect(drawer).toBeVisible()

  await drawer.getByRole("button", { name: "Close non-modal drawer" }).click()
  await expect(drawer).toBeHidden()
})

test("Vaul Drawer dismisses through a real touch swipe", async ({ page }) => {
  await page.getByRole("button", { name: "Open Radix Drawer" }).click()

  const drawer = page.getByRole("alertdialog", { name: "Radix drawer" })
  const handle = page.locator('[data-slot="drawer-swipe-handle"]')
  await expect(drawer).toBeVisible()
  await expect(handle).toBeVisible()

  const box = await handle.boundingBox()
  expect(box).not.toBeNull()
  if (!box) return

  const centerX = box.x + box.width / 2
  const centerY = box.y + box.height / 2
  await swipe(
    page,
    { x: centerX, y: centerY },
    { x: centerX, y: centerY + 260 },
    6
  )

  await expect(drawer).toBeHidden()
  await expect(page.getByLabel("Surface result")).toHaveText("null")
})

test("Vaul reaches the final snap point with both close actions visible", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1304, height: 634 })
  await page.getByRole("button", { name: "Open Radix Snap Drawer" }).click()

  const drawer = page.getByRole("dialog", { name: "Radix snap points" })
  const handle = page.locator('[data-slot="drawer-swipe-handle"]')
  await expect(drawer).toBeVisible()
  await expect(drawer.getByLabel("Close")).toBeVisible()

  const initialBox = await drawer.boundingBox()
  const handleBox = await handle.boundingBox()
  expect(initialBox).not.toBeNull()
  expect(handleBox).not.toBeNull()
  if (!initialBox || !handleBox) return

  const centerX = handleBox.x + handleBox.width / 2
  const centerY = handleBox.y + handleBox.height / 2
  await swipe(
    page,
    { x: centerX, y: centerY },
    { x: centerX, y: 80 },
    20
  )

  await expect
    .poll(async () => (await drawer.boundingBox())?.y ?? Number.POSITIVE_INFINITY)
    .toBeLessThan(initialBox.y)

  const footerClose = drawer.getByRole("button", { name: "Close snap drawer" })
  await expect(footerClose).toBeVisible()
  const footerBox = await footerClose.boundingBox()
  expect(footerBox).not.toBeNull()
  expect((footerBox?.y ?? 0) + (footerBox?.height ?? 0)).toBeLessThanOrEqual(634)
})
