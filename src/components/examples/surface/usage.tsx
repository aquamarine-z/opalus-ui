import {Button} from "@/components/ui/button.tsx";
import {dialog, SurfaceDialogContent} from "../../../../registry/ui/surface.tsx";
import NiceModal from "@ebay/nice-modal-react";
import {DialogHeader, DialogTitle} from "@/components/ui/dialog.tsx";
import React from "react";
import {Input} from "@/components/ui/input.tsx";

export default () => {
    const [modalResult, setModalResult] = React.useState<string | null>(null);
    const openModal = async () => {
        const value = await dialog.custom<string>((close) => {
            const [result, setResult] = React.useState<string>("");
            return <SurfaceDialogContent showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle>Dialog</DialogTitle>
                </DialogHeader>
                <div className={"py-4"}>This is a custom modal dialog content.</div>
                <Input value={result} onChange={e => setResult(e.target.value)}/>
                <Button onClick={async () => {
                    await close(result);
                }}>Submit</Button>
            </SurfaceDialogContent>
        }, false, false)
        setModalResult(value || null);
    }
    return <NiceModal.Provider>
        <div className={"flex flex-col items-center gap-2"}>
            <Button variant={"outline"} onClick={openModal}>Open Modal</Button>
            <div>Modal text result:{modalResult}</div>
        </div>
    </NiceModal.Provider>
}