'use client';
import {modal} from "../../../../registry/ui/modal.tsx";
import {DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog.tsx";
import {Button} from "@/components/ui/button.tsx";
import React from "react";
import {Input} from "@/components/ui/input.tsx";

export default () => {
    const openCascadeModal = async (level: number = 0) => {
        return await modal.custom<number>((close) => {
            const nextLevel = level + 1;
            const [returnValue, setReturnValue] = React.useState<number | undefined>(undefined);
            return <DialogContent>
                <DialogHeader>
                    <DialogTitle>Cascade Modals</DialogTitle>
                </DialogHeader>
                <div className={"flex flex-col items-center gap-2"}>
                    <p className={"mb-4"}>This is modal level {level}. You can open the next level modal or close this
                        one.</p>
                    {level > 5 &&
                        <p className={"mb-4 text-red-600"}>Warning: You have opened more than 5 levels of modals.The
                            memory usage will increase. Be cautious!</p>}
                    <Input defaultValue={level} value={returnValue}
                           onChange={e => setReturnValue(parseInt(e.target.value))}
                           placeholder={"Please input the return value"}/>
                </div>

                {returnValue !== undefined && <p className={"mb-4"}>Returned value from next level: {returnValue}</p>}
                <div className={"flex gap-2"}>
                    <Button
                        className={"px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"}
                        onClick={async () => {
                            const result = await openCascadeModal(nextLevel);
                            //console.log("Returned from level", nextLevel, "with result:", result);
                            setReturnValue(result);
                        }}
                    >
                        Open Next Level
                    </Button>
                    <Button
                        className={"px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"}
                        onClick={async () => {
                            await close(returnValue);
                        }}
                    >
                        Close This Level
                    </Button>
                </div>

            </DialogContent>
        })
    }
    return <div>
        <Button onClick={() => openCascadeModal(0)}>
            Open Cascade Modals (Level 0)
        </Button>
    </div>
}