import React from "react"

import { Button } from "@/components/ui/button.tsx"
import { drawer } from "../../../../registry/ui/surface.tsx"

export default function DrawerPromptExample() {
  const [name, setName] = React.useState<string | null>(null)

  const openPrompt = async () => {
    const value = await drawer.prompt({
      side: "left",
      title: "Rename project",
      message: "Enter the name shown across this workspace.",
      inputLabel: "Project name",
      defaultValue: "Opalus UI",
      confirmButtonContent: "Rename",
    })
    setName(value)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <Button variant="outline" onClick={() => void openPrompt()}>
        Open Prompt Drawer
      </Button>
      <p>Project name: {name ?? "not submitted"}</p>
    </div>
  )
}
