'use client';

import {DialogHeader, DialogTitle} from "@/components/ui/dialog.tsx";
import {Button} from "@/components/ui/button.tsx";
import React from "react";
import {Input} from "@/components/ui/input.tsx";
import {dialog, SurfaceDialogContent} from "../../../../registry/ui/surface.tsx";

type CascadeDialogContentProps = {
    close: (result?: number) => Promise<void>;
    level: number;
    openNext: (level: number) => Promise<number | undefined>;
};

function CascadeDialogContent({close, level, openNext}: CascadeDialogContentProps) {
    const nextLevel = level + 1;
    const [returnValue, setReturnValue] = React.useState<number | undefined>(level);

    return <SurfaceDialogContent className="sm:max-w-sm">
        <DialogHeader>
            <DialogTitle>Cascade Modals</DialogTitle>
        </DialogHeader>
        <div className={"flex flex-col items-center gap-2"}>
            <p className={"mb-4"}>This is modal level {level}. You can open the next level modal or close this
                one.</p>
            {level > 5 &&
                <p className={"mb-4 text-red-600"}>Warning: You have opened more than 5 levels of modals.The
                    memory usage will increase. Be cautious!</p>}
            <Input value={returnValue}
                   onChange={e => setReturnValue(parseInt(e.target.value))}
                   placeholder={"Please input the return value"}/>
        </div>
        {returnValue !== undefined && <p className={"mb-4"}>Returned value from next level: {returnValue}</p>}
        <div className={"flex gap-2 items-center flex-row justify-center"}>
            <Button
                className={"px-4 py-2 text-white rounded "}
                onClick={async () => {
                    const result = await openNext(nextLevel);
                    if (result !== undefined) setReturnValue(result);
                }}
            >
                Open Next Level
            </Button>
            <Button
                className={"px-4 py-2 text-white rounded "}
                onClick={() => void close(returnValue)}
            >
                Close This Level
            </Button>
        </div>
    </SurfaceDialogContent>
}

export default () => {
    const openCascadeModal = async (level: number = 0) => {
        return await dialog.custom<number>((close) => (
            <CascadeDialogContent close={close} level={level} openNext={openCascadeModal}/>
        ))
    }
    return <Button onClick={() => openCascadeModal(0)}>
        Open Cascade Modals (Level 0)
    </Button>

}
