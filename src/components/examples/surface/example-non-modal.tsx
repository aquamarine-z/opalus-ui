import React from "react"

import { Button } from "@/components/ui/button.tsx"
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx"
import {
  dialog,
  SurfaceDialogContent,
} from "../../../../registry/ui/surface.tsx"

type NonModalDialogContentProps = {
  close: () => Promise<void>
}

function NonModalDialogContent({ close }: NonModalDialogContentProps) {
  return (
    <SurfaceDialogContent showCloseButton={false} className="sm:max-w-sm">
      <DialogHeader>
        <DialogTitle>Non-modal dialog</DialogTitle>
        <DialogDescription>
          The page behind this dialog remains interactive.
        </DialogDescription>
      </DialogHeader>
      <div className="flex justify-end">
        <Button type="button" onClick={() => void close()}>
          Close
        </Button>
      </div>
    </SurfaceDialogContent>
  )
}

export default function NonModalDialogExample() {
  const [backgroundClicks, setBackgroundClicks] = React.useState(0)

  const openDialog = () => {
    void dialog.custom(
      (close) => <NonModalDialogContent close={close} />,
      { modal: false }
    )
  }

  return (
    <div className="relative grid size-full place-items-center">
      <Button
        className="active:translate-y-0"
        variant="outline"
        onClick={openDialog}
      >
        Open Non-modal Dialog
      </Button>
      <Button
        className="absolute right-0 bottom-0"
        variant="secondary"
        onClick={() => setBackgroundClicks((count) => count + 1)}
      >
        Background clicks: {backgroundClicks}
      </Button>
    </div>
  )
}
