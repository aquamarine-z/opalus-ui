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

function SnapDrawerContent({ close }: { close: () => Promise<void> }) {
  return (
    <SurfaceDrawerContent>
      <DrawerHeader>
        <DrawerTitle>Snap points</DrawerTitle>
        <DrawerDescription>
          Drag the drawer between its compact and expanded positions.
        </DrawerDescription>
      </DrawerHeader>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        The Promise remains pending while the drawer moves between snap points.
      </div>
      <DrawerFooter>
        <Button type="button" onClick={() => void close()}>
          Close
        </Button>
      </DrawerFooter>
    </SurfaceDrawerContent>
  )
}

export default function DrawerSnapPointsExample() {
  const openDrawer = () => {
    void drawer.custom(
      (close) => <SnapDrawerContent close={close} />,
      { side: "bottom", snapPoints: [0.35, 1] }
    )
  }

  return (
    <Button variant="outline" onClick={openDrawer}>
      Open Snap Points Drawer
    </Button>
  )
}
