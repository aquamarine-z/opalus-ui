import {Button} from "@/components/ui/button.tsx";
import {DialogHeader, DialogTitle} from "@/components/ui/dialog.tsx";
import React from "react";
import {dialog, SurfaceDialogContent} from "../../../../registry/ui/surface.tsx";


export default () => {
    const openModal = async () => {
        await dialog.custom<null>((close) => {
            return <SurfaceDialogContent closeOnClickOverlay={true} showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle>Dialog</DialogTitle>
                </DialogHeader>
                <div className={"flex flex-col gap-3"}>
                    <div>This is a custom modal dialog content.</div>
                    <div>You can design your own structure of dialog content.</div>
                    <div>Remember, the return component of the argument function must be a Shadcn
                        DialogContent or others adapted from it
                    </div>
                </div>
                <Button onClick={() => close()}>Close</Button>
            </SurfaceDialogContent>
        })
    }
    return <div className={"flex flex-col items-center gap-2"}>
        <Button variant={"outline"} onClick={openModal}>Open Modal</Button>
    </div>
}