import {Button} from "@/components/ui/button.tsx";
import {modal} from "../../../../registry/ui/modal.tsx";
import NiceModal from "@ebay/nice-modal-react";
import {DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog.tsx";
import React from "react";
import {Input} from "@/components/ui/input.tsx";

export default () => {
    const [modalResult, setModalResult] = React.useState<string | null>(null);
    const openModal = async () => {
        const value = await modal.custom<string>((close) => {
            const [result, setResult] = React.useState<string>("");
            return <DialogContent showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle>Dialog</DialogTitle>
                </DialogHeader>
                <div className={"py-4"}>This is a custom modal dialog content.</div>
                <Input value={result} onChange={e => setResult(e.target.value)}/>
                <Button onClick={async () => {
                    await close(result);
                }}>Submit</Button>
            </DialogContent>
        })
        setModalResult(value || null);
    }
    return <NiceModal.Provider>
        <div className={"flex flex-col items-center gap-2"}>
            <Button variant={"outline"} onClick={openModal}>Open Modal</Button>
            <div>Modal text result:{modalResult}</div>
        </div>
    </NiceModal.Provider>
}