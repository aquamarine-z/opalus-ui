import * as React from "react"
import NiceModal from "@ebay/nice-modal-react"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { Button } from "@/components/ui/button"
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { dialog, SurfaceDialogContent } from "./surface"

function renderModalProvider() {
  return render(<NiceModal.Provider />)
}

describe("surface", () => {
  it("waits for the actual exit animation before resolving", async () => {
    const user = userEvent.setup()
    renderModalProvider()

    let finishAnimation = () => {}
    const animationFinished = new Promise<void>((resolve) => {
      finishAnimation = resolve
    })
    let settled = false

    const resultPromise = dialog.custom<string>((close) => (
      <SurfaceDialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Animated dialog</DialogTitle>
        </DialogHeader>
        <Button onClick={() => void close("complete")}>Complete</Button>
      </SurfaceDialogContent>
    ))
    resultPromise.then(() => {
      settled = true
    })

    const dialogElement = await screen.findByRole("dialog", {
      name: "Animated dialog",
    })
    Object.defineProperty(dialogElement, "getAnimations", {
      configurable: true,
      value: () =>
        [
          {
            effect: {
              getComputedTiming: () => ({ iterations: 1 }),
            },
            finished: animationFinished,
            playState: "running",
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

  it("cleans up custom content that does not use SurfaceDialogContent", async () => {
    const user = userEvent.setup()
    renderModalProvider()

    const resultPromise = dialog.custom<string>((close) => (
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Raw dialog content</DialogTitle>
        </DialogHeader>
        <Button onClick={() => void close("done")}>Finish</Button>
      </DialogContent>
    ))

    await user.click(
      await screen.findByRole("button", { name: "Finish" })
    )

    await expect(resultPromise).resolves.toBe("done")
    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", { name: "Raw dialog content" })
      ).toBeNull()
    })
  })

  it("labels and submits a prompt with Enter", async () => {
    const user = userEvent.setup()
    renderModalProvider()

    const resultPromise = dialog.prompt({
      title: "Rename project",
      message: "Enter a new project name.",
      inputLabel: "Project name",
    })

    const input = await screen.findByRole("textbox", {
      name: "Project name",
    })
    await user.type(input, "Opalus{Enter}")

    await expect(resultPromise).resolves.toBe("Opalus")
  })

  it("hides the overlay only for non-modal surfaces", async () => {
    const user = userEvent.setup()
    renderModalProvider()

    const nonModalPromise = dialog.custom(
      (close) => (
        <SurfaceDialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Non-modal dialog</DialogTitle>
          </DialogHeader>
          <Button onClick={() => void close()}>Close non-modal</Button>
        </SurfaceDialogContent>
      ),
      { modal: false }
    )

    await screen.findByRole("dialog", { name: "Non-modal dialog" })
    const nonModalOverlay = document.querySelector<HTMLElement>(
      '[data-slot="dialog-overlay"]'
    )
    expect(nonModalOverlay?.hidden).toBe(true)

    await user.click(screen.getByRole("button", { name: "Close non-modal" }))
    await nonModalPromise

    const modalPromise = dialog.custom((close) => (
      <SurfaceDialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Modal dialog</DialogTitle>
        </DialogHeader>
        <Button onClick={() => void close()}>Close modal</Button>
      </SurfaceDialogContent>
    ))

    await screen.findByRole("dialog", { name: "Modal dialog" })
    const modalOverlay = document.querySelector<HTMLElement>(
      '[data-slot="dialog-overlay"]'
    )
    expect(modalOverlay?.hidden).toBe(false)

    await user.click(screen.getByRole("button", { name: "Close modal" }))
    await modalPromise
  })

  it("closes only the topmost stacked surface with Escape", async () => {
    renderModalProvider()

    const firstPromise = dialog.custom(
      () => (
        <SurfaceDialogContent>
          <DialogHeader>
            <DialogTitle>First dialog</DialogTitle>
          </DialogHeader>
        </SurfaceDialogContent>
      ),
      { dismissible: false }
    )
    const firstDialog = await screen.findByRole("dialog", {
      name: "First dialog",
    })

    const secondPromise = dialog.custom(
      () => (
        <SurfaceDialogContent>
          <DialogHeader>
            <DialogTitle>Second dialog</DialogTitle>
          </DialogHeader>
        </SurfaceDialogContent>
      ),
      { dismissible: false }
    )
    const secondDialog = await screen.findByRole("dialog", {
      name: "Second dialog",
    })

    let firstSettled = false
    firstPromise.then(() => {
      firstSettled = true
    })

    const secondCloseButton = secondDialog.querySelector("button")
    expect(secondCloseButton).not.toBeNull()
    fireEvent.keyDown(secondCloseButton as HTMLButtonElement, { key: "Escape" })
    await expect(secondPromise).resolves.toBeNull()

    expect(firstSettled).toBe(false)
    expect(
      screen.getByRole("dialog", { name: "First dialog" })
    ).toBeTruthy()

    const firstCloseButton = firstDialog.querySelector("button")
    expect(firstCloseButton).not.toBeNull()
    fireEvent.keyDown(firstCloseButton as HTMLButtonElement, { key: "Escape" })
    await expect(firstPromise).resolves.toBeNull()
  })
})
