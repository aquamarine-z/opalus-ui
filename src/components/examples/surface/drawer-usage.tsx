import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button.tsx"
import {
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer.tsx"
import {
  drawer,
  type DrawerSide,
  SurfaceDrawerContent,
} from "../../../../registry/ui/surface.tsx"

const directions = [
  { icon: ArrowUpIcon, label: "Top", side: "top" },
  { icon: ArrowRightIcon, label: "Right", side: "right" },
  { icon: ArrowDownIcon, label: "Bottom", side: "bottom" },
  { icon: ArrowLeftIcon, label: "Left", side: "left" },
] satisfies Array<{
  icon: typeof ArrowUpIcon
  label: string
  side: DrawerSide
}>

function DirectionDrawerContent({
  close,
  label,
}: {
  close: () => Promise<void>
  label: string
}) {
  return (
    <SurfaceDrawerContent>
      <DrawerHeader>
        <DrawerTitle>{label} drawer</DrawerTitle>
        <DrawerDescription>
          This content uses the installed shadcn Drawer.
        </DrawerDescription>
      </DrawerHeader>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        Drawer content can contain any shadcn components.
      </div>
      <DrawerFooter>
        <Button type="button" onClick={() => void close()}>
          Close
        </Button>
      </DrawerFooter>
    </SurfaceDrawerContent>
  )
}

export default function DrawerUsageExample() {
  const openDrawer = (side: DrawerSide, label: string) => {
    void drawer.custom(
      (close) => <DirectionDrawerContent close={close} label={label} />,
      { side }
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-center gap-3">
        {directions.slice(0, 2).map(({ icon: Icon, label, side }) => (
          <Button
            key={side}
            variant="outline"
            className="w-28 justify-center gap-2 !m-0"
            onClick={() => openDrawer(side, label)}
          >
            <Icon className="size-4" aria-hidden="true" />
            {label}
          </Button>
        ))}
      </div>
      <div className="flex items-center justify-center gap-3">
        {directions.slice(2).map(({ icon: Icon, label, side }) => (
          <Button
            key={side}
            variant="outline"
            className="w-28 justify-center gap-2 !m-0"
            onClick={() => openDrawer(side, label)}
          >
            <Icon className="size-4" aria-hidden="true" />
            {label}
          </Button>
        ))}
      </div>
    </div>
  )
}
