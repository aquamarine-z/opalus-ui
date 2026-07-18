import NiceModal from "@ebay/nice-modal-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  drawer,
  dialog,
  SurfaceDrawerContent,
} from "../../../registry/ui/surface"

function RadixSurfaceControls() {
  const [result, setResult] = React.useState("idle")
  const [backgroundClicks, setBackgroundClicks] = React.useState(0)

  const openDialog = async () => {
    setResult("pending")
    const value = await dialog.confirm({
      title: "Radix confirm",
      message: "Dialog powered by Radix UI.",
    })
    setResult(String(value))
  }

  const openPrompt = async () => {
    setResult("pending")
    const value = await dialog.prompt({
      title: "Required Radix prompt",
      message: "Enter a value.",
      inputProps: { required: true, minLength: 3 },
    })
    setResult(value ?? "null")
  }

  const openDrawer = async () => {
    setResult("pending")
    const value = await drawer.confirm({
      title: "Radix drawer",
      message: "Drawer powered by Vaul.",
    })
    setResult(String(value))
  }

  const openNonModalDrawer = () => {
    void drawer.custom(
      (close) => (
        <SurfaceDrawerContent showCloseButton={false}>
          <DrawerHeader>
            <DrawerTitle>Radix non-modal drawer</DrawerTitle>
            <DrawerDescription>The page remains interactive.</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button type="button" onClick={() => void close()}>
              Close non-modal drawer
            </Button>
          </DrawerFooter>
        </SurfaceDrawerContent>
      ),
      { modal: false, side: "right" }
    )
  }

  const openSnapDrawer = () => {
    void drawer.custom(
      (close) => (
        <SurfaceDrawerContent>
          <DrawerHeader>
            <DrawerTitle>Radix snap points</DrawerTitle>
            <DrawerDescription>Compact and full-height positions.</DrawerDescription>
          </DrawerHeader>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">Snap content</div>
          <DrawerFooter>
            <Button type="button" onClick={() => void close()}>
              Close snap drawer
            </Button>
          </DrawerFooter>
        </SurfaceDrawerContent>
      ),
      { side: "bottom", snapPoints: [0.35, 1] }
    )
  }

  return (
    <main className="grid min-h-[200vh] content-start gap-3 p-6">
      <output aria-label="Surface result">{result}</output>
      <Button type="button" onClick={() => void openDialog()}>
        Open Radix Dialog
      </Button>
      <Button type="button" onClick={() => void openPrompt()}>
        Open Required Radix Prompt
      </Button>
      <Button type="button" onClick={() => void openDrawer()}>
        Open Radix Drawer
      </Button>
      <Button type="button" onClick={openNonModalDrawer}>
        Open Radix Non-modal Drawer
      </Button>
      <Button type="button" onClick={openSnapDrawer}>
        Open Radix Snap Drawer
      </Button>
      <Button
        type="button"
        onClick={() => setBackgroundClicks((count) => count + 1)}
      >
        Background clicks: {backgroundClicks}
      </Button>
    </main>
  )
}

export default function RadixSurfaceFixture() {
  return (
    <NiceModal.Provider>
      <RadixSurfaceControls />
    </NiceModal.Provider>
  )
}
