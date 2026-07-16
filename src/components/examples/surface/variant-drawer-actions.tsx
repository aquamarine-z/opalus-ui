import React from "react"

import { Button } from "@/components/ui/button.tsx"
import { drawer } from "../../../../registry/ui/surface.tsx"

type ProjectAction = "rename" | "archive"

export default function DrawerActionsExample() {
  const [result, setResult] = React.useState<ProjectAction | null>(null)

  const openActions = async () => {
    const action = await drawer.actions<ProjectAction>({
      title: "Project actions",
      message: "Choose what to do with this project.",
      actions: [
        { value: "rename", label: "Rename" },
        {
          value: "archive",
          label: "Archive",
          buttonProps: { variant: "destructive" },
        },
      ],
    })
    setResult(action)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <Button variant="outline" onClick={() => void openActions()}>
        Open Actions Drawer
      </Button>
      <p>Selected action: {result ?? "none"}</p>
    </div>
  )
}
