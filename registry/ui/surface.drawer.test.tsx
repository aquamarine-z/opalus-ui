import * as React from "react"
import NiceModal from "@ebay/nice-modal-react"
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { Button } from "@/components/ui/button"
import { DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { drawer, SurfaceDrawerContent } from "./surface"

function renderModalProvider(children?: React.ReactNode) {
  return render(<NiceModal.Provider>{children}</NiceModal.Provider>)
}

describe("surface drawer", () => {
  it.each([
    ["top", "up"],
    ["right", "right"],
    ["bottom", "down"],
    ["left", "left"],
  ] as const)("maps the %s side to the %s swipe direction", async (side, swipe) => {
    const user = userEvent.setup()
    renderModalProvider()

    const resultPromise = drawer.custom(
      (close) => (
        <SurfaceDrawerContent showCloseButton={false}>
          <DrawerHeader>
            <DrawerTitle>{side} drawer</DrawerTitle>
          </DrawerHeader>
          <Button onClick={() => void close(side)}>Close {side}</Button>
        </SurfaceDrawerContent>
      ),
      { side }
    )

    await screen.findByRole("dialog", { name: `${side} drawer` })
    const popup = document.querySelector<HTMLElement>(
      '[data-slot="drawer-popup"]'
    )
    expect(popup?.dataset.swipeDirection).toBe(swipe)

    await user.click(screen.getByRole("button", { name: `Close ${side}` }))
    await expect(resultPromise).resolves.toBe(side)
  })

  it("waits for the drawer exit animation before resolving", async () => {
    const user = userEvent.setup()
    renderModalProvider()

    let playState: AnimationPlayState = "running"
    let finishAnimation = () => {}
    const animationFinished = new Promise<void>((resolve) => {
      finishAnimation = () => {
        playState = "finished"
        resolve()
      }
    })
    let settled = false

    const resultPromise = drawer.custom<string>((close) => (
      <SurfaceDrawerContent showCloseButton={false}>
        <DrawerHeader>
          <DrawerTitle>Animated drawer</DrawerTitle>
        </DrawerHeader>
        <Button onClick={() => void close("complete")}>Complete</Button>
      </SurfaceDrawerContent>
    ))
    resultPromise.then(() => {
      settled = true
    })

    const drawerElement = await screen.findByRole("dialog", {
      name: "Animated drawer",
    })
    Object.defineProperty(drawerElement, "getAnimations", {
      configurable: true,
      value: () =>
        [
          {
            effect: {
              getComputedTiming: () => ({ iterations: 1 }),
            },
            finished: animationFinished,
            get playState() {
              return playState
            },
            playbackRate: 1,
          },
        ] as unknown as Animation[],
    })

    await user.click(screen.getByRole("button", { name: "Complete" }))
    await act(
      () =>
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => resolve())
        })
    )
    expect(settled).toBe(false)

    await act(async () => {
      finishAnimation()
      await animationFinished
    })
    await expect(resultPromise).resolves.toBe("complete")
  })

  it("preserves native drawer prompt validation when Enter submits", async () => {
    const user = userEvent.setup()
    renderModalProvider()
    let settled = false

    const resultPromise = drawer.prompt({
      title: "Required project name",
      inputLabel: "Project name",
      inputProps: { required: true },
    })
    resultPromise.then(() => {
      settled = true
    })

    const input = await screen.findByRole("textbox", { name: "Project name" })
    await user.click(input)
    await user.keyboard("{Enter}")

    expect(settled).toBe(false)
    expect(screen.getByRole("dialog", { name: "Required project name" })).toBeTruthy()

    await user.type(input, "Opalus{Enter}")
    await expect(resultPromise).resolves.toBe("Opalus")
  })

  it("returns selected actions, confirmation, and prompt values", async () => {
    const user = userEvent.setup()
    renderModalProvider()

    const actionPromise = drawer.actions({
      title: "Project actions",
      actions: [
        { value: "rename", label: "Rename" },
        { value: "archive", label: "Archive" },
      ],
    })
    await user.click(await screen.findByRole("button", { name: "Archive" }))
    await expect(actionPromise).resolves.toBe("archive")

    const confirmPromise = drawer.confirm({ title: "Confirm archive" })
    await user.click(await screen.findByRole("button", { name: "Confirm" }))
    await expect(confirmPromise).resolves.toBe(true)

    const promptPromise = drawer.prompt({
      title: "Rename project",
      inputLabel: "Project name",
    })
    const input = await screen.findByRole("textbox", { name: "Project name" })
    await user.type(input, "Opalus{Enter}")
    await expect(promptPromise).resolves.toBe("Opalus")
  })

  it("keeps a non-dismissible drawer open until an explicit action", async () => {
    const user = userEvent.setup()
    renderModalProvider()

    const resultPromise = drawer.custom(
      (close) => (
        <SurfaceDrawerContent showCloseButton={false}>
          <DrawerHeader>
            <DrawerTitle>Persistent drawer</DrawerTitle>
          </DrawerHeader>
          <Button onClick={() => void close()}>Finish</Button>
        </SurfaceDrawerContent>
      ),
      { dismissible: false }
    )

    const drawerElement = await screen.findByRole("dialog", {
      name: "Persistent drawer",
    })
    fireEvent.keyDown(drawerElement, { key: "Escape" })
    await act(async () => Promise.resolve())
    expect(
      screen.getByRole("dialog", { name: "Persistent drawer" })
    ).toBeTruthy()

    await user.click(screen.getByRole("button", { name: "Finish" }))
    await expect(resultPromise).resolves.toBeNull()
  })

  it("keeps the page interactive and removes the overlay when non-modal", async () => {
    const user = userEvent.setup()
    let backgroundClicks = 0
    renderModalProvider(
      <Button onClick={() => backgroundClicks++}>Background action</Button>
    )

    const resultPromise = drawer.custom(
      (close) => (
        <SurfaceDrawerContent showCloseButton={false}>
          <DrawerHeader>
            <DrawerTitle>Non-modal drawer</DrawerTitle>
          </DrawerHeader>
          <Button onClick={() => void close()}>Close drawer</Button>
        </SurfaceDrawerContent>
      ),
      { modal: false }
    )

    await screen.findByRole("dialog", { name: "Non-modal drawer" })
    const overlay = document.querySelector<HTMLElement>(
      '[data-slot="drawer-overlay"]'
    )
    expect(overlay === null || overlay.hidden).toBe(true)

    const backgroundRoot = screen
      .getByRole("button", { name: "Background action" })
      .parentElement
    expect(backgroundRoot).not.toBeNull()
    backgroundRoot?.setAttribute("data-aria-hidden", "true")
    backgroundRoot?.setAttribute("aria-hidden", "true")
    await waitFor(() => {
      expect(backgroundRoot?.hasAttribute("aria-hidden")).toBe(false)
    })

    await user.click(screen.getByRole("button", { name: "Background action" }))
    expect(backgroundClicks).toBe(1)

    await user.click(screen.getByRole("button", { name: "Close drawer" }))
    await resultPromise
  })

  it("passes snap points without resolving while the drawer remains open", async () => {
    const user = userEvent.setup()
    renderModalProvider()
    let settled = false

    const resultPromise = drawer.custom(
      (close) => (
        <SurfaceDrawerContent showCloseButton={false}>
          <DrawerHeader>
            <DrawerTitle>Snap drawer</DrawerTitle>
          </DrawerHeader>
          <Button onClick={() => void close()}>Close snap drawer</Button>
        </SurfaceDrawerContent>
      ),
      { snapPoints: [0.35, 0.8] }
    )
    resultPromise.then(() => {
      settled = true
    })

    await screen.findByRole("dialog", { name: "Snap drawer" })
    const popup = document.querySelector<HTMLElement>(
      '[data-slot="drawer-popup"]'
    )
    expect(popup?.hasAttribute("data-snap-points")).toBe(true)
    expect(popup?.style.height).toBe("100dvh")
    expect(popup?.style.maxHeight).toBe("100dvh")
    expect(settled).toBe(false)

    await user.click(
      screen.getByRole("button", { name: "Close snap drawer" })
    )
    await resultPromise
  })
})
