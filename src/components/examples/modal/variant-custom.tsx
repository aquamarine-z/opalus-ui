import {Button} from "@/components/ui/button.tsx";
import {modal} from "../../../../registry/ui/modal.tsx";
import NiceModal from "@ebay/nice-modal-react";
import {DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog.tsx";
import React from "react";


export default () => {
    const openModal = async () => {
        await modal.custom<null>((close) => {
            return <DialogContent showCloseButton={false}>
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
            </DialogContent>
        })
    }
    return <NiceModal.Provider>
        <div className={"flex flex-col items-center gap-2"}>
            <Button variant={"outline"} onClick={openModal}>Open Modal</Button>
        </div>
    </NiceModal.Provider>
}