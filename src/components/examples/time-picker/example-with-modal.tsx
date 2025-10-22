import NiceModal from "@ebay/nice-modal-react"
import {Button} from "@/components/ui/button.tsx";
import React from "react";
import {modal} from "../../../../registry/ui/modal.tsx";
import {DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog.tsx";
import {TimePicker, TimePickerContainer} from "../../../../registry/ui/time-picker.tsx";

export default () => {
    const [timeMs, setTimeMs] = React.useState<number>(0);
    const openTimePickerModal = async () => {
        const time = await modal.custom((close) => {
            const [totalTimeMs, setTotalTimeMs] = React.useState<number>(0);
            return <DialogContent showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle>
                        Time Picker Dialog
                    </DialogTitle>
                </DialogHeader>
                <TimePickerContainer onTimeChange={v => setTotalTimeMs(v)}>
                    <TimePicker timeMilliseconds={1} maxValue={1000} prefixLabel={"Ms"}
                                suffixLabel={(v) => v.toString()}/>
                    <TimePicker timeMilliseconds={1000} maxValue={60} prefixLabel={"Sec"}
                                suffixLabel={(v) => v.toString()}/>
                    <TimePicker timeMilliseconds={60000} maxValue={60} prefixLabel={"Min"}
                                suffixLabel={(v) => v.toString()}/>
                    <TimePicker timeMilliseconds={3600000} maxValue={24} prefixLabel={"Hr"}
                                suffixLabel={(v) => v.toString()}/>
                </TimePickerContainer>
                <div className={"flex items-center justify-center flex-row"}>
                    <Button onClick={() => {
                        close(totalTimeMs);
                    }}>Submit</Button>
                </div>
            </DialogContent>
        })
        if (time) {
            setTimeMs(time);
        }
    }
    return <div className={"flex flex-col items-center gap-4"}>
        <NiceModal.Provider>
            <Button onClick={openTimePickerModal}>
                Open Time Picker Modal
            </Button>
            <span>Total time in milliseconds:{timeMs} ms</span>
        </NiceModal.Provider>
    </div>
}