import React from "react"

import { Button } from "@/components/ui/button.tsx"
import { drawer } from "../../../../registry/ui/surface.tsx"

export default function DrawerConfirmExample() {
  const [result, setResult] = React.useState<boolean | null>(null)

  const openConfirm = async () => {
    const confirmed = await drawer.confirm({
      side: "right",
      title: "Archive project?",
      message: "You can restore the project later.",
      confirmButtonContent: "Archive",
      confirmButtonProps: { variant: "destructive" },
    })
    setResult(confirmed)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <Button variant="outline" onClick={() => void openConfirm()}>
        Open Confirm Drawer
      </Button>
      <p>Confirmed: {result === null ? "not submitted" : String(result)}</p>
    </div>
  )
}
