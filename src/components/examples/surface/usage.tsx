import {Button} from "@/components/ui/button.tsx";
import {dialog, SurfaceDialogContent} from "../../../../registry/ui/surface.tsx";
import {DialogHeader, DialogTitle} from "@/components/ui/dialog.tsx";
import React from "react";
import {Input} from "@/components/ui/input.tsx";

export default () => {
    const [dialogResult, setDialogResult] = React.useState<string | null>(null);
    const openDialog = async () => {
        const value = await dialog.custom<string>((close) => {
            return <SurfaceDialogContent showCloseButton={false}>
                <form className="contents" onSubmit={event => {
                    event.preventDefault();
                    const data = new FormData(event.currentTarget);
                    void close(String(data.get("result") ?? ""));
                }}>
                    <DialogHeader>
                        <DialogTitle>Dialog</DialogTitle>
                    </DialogHeader>
                    <div className={"py-4"}>This is a custom modal dialog content.</div>
                    <Input name="result" aria-label="Dialog result"/>
                    <Button type="submit">Submit</Button>
                </form>
            </SurfaceDialogContent>
        }, {
            modal: false,
            dismissible: true,
        })
        setDialogResult(value ?? null);
    }
    return <div className={"flex flex-col items-center gap-2"}>
        <Button variant={"outline"} onClick={openDialog}>Open Dialog</Button>
        <div>Dialog text result:{dialogResult}</div>
    </div>
}
