import {Button} from "@/components/ui/button.tsx";
import {dialog, SurfaceDialogContent} from "../../../../registry/ui/surface.tsx";
import NiceModal from "@ebay/nice-modal-react";
import {DialogHeader, DialogTitle} from "@/components/ui/dialog.tsx";
import React from "react";
import {Input} from "@/components/ui/input.tsx";

export default () => {
    const [dialogResult, setDialogResult] = React.useState<string | null>(null);
    const openDialog = async () => {
        const value = await dialog.custom<string>((close) => {
            const [result, setResult] = React.useState<string>("");
            return <SurfaceDialogContent closeOnClickOverlay={true} showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle>Dialog</DialogTitle>
                </DialogHeader>
                <div className={"py-4"}>This is a custom modal dialog content.</div>
                <Input value={result} onChange={e => setResult(e.target.value)}/>
                <Button onClick={async () => {
                    await close(result);
                }}>Submit</Button>
            </SurfaceDialogContent>
        }, {
            modal: true,
        })
        setDialogResult(value || null);
    }
    return <NiceModal.Provider>
        <div className={"flex flex-col items-center gap-2"}>
            <Button variant={"outline"} onClick={openDialog}>Open Dialog</Button>
            <div>Dialog text result:{dialogResult}</div>
        </div>
    </NiceModal.Provider>
}