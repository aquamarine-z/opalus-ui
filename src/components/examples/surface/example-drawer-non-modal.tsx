import React from "react"

import { Button } from "@/components/ui/button.tsx"
import {
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer.tsx"
import {
  drawer,
  SurfaceDrawerContent,
} from "../../../../registry/ui/surface.tsx"

function NonModalDrawerContent({ close }: { close: () => Promise<void> }) {
  return (
    <SurfaceDrawerContent showCloseButton={false}>
      <DrawerHeader>
        <DrawerTitle>Non-modal drawer</DrawerTitle>
        <DrawerDescription>
          The page remains interactive while this drawer is open.
        </DrawerDescription>
      </DrawerHeader>
      <DrawerFooter>
        <Button type="button" onClick={() => void close()}>
          Close
        </Button>
      </DrawerFooter>
    </SurfaceDrawerContent>
  )
}

export default function NonModalDrawerExample() {
  const [backgroundClicks, setBackgroundClicks] = React.useState(0)

  const openDrawer = () => {
    void drawer.custom(
      (close) => <NonModalDrawerContent close={close} />,
      { modal: false, side: "right" }
    )
  }

  return (
    <div className="relative grid size-full place-items-center">
      <Button
        className="active:translate-y-0"
        variant="outline"
        onClick={openDrawer}
      >
        Open Non-modal Drawer
      </Button>
      <Button
        className="absolute bottom-0 left-0"
        variant="secondary"
        onClick={() => setBackgroundClicks((count) => count + 1)}
      >
        Background clicks: {backgroundClicks}
      </Button>
    </div>
  )
}
