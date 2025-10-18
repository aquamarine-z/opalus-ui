'use client'
import {TimePicker, TimePickerContainer} from "../../../../registry/ui/time-picker.tsx";
import React from "react";

export default () => {
    const [time, setTime] = React.useState(0);
    return <div>
        <TimePickerContainer onTimeChange={(v) => setTime(v)}>
            <TimePicker
                className={"w-full"}
                timeMilliseconds={1000 * 60 * 60 * 7}
                step={1}
                maxValue={20}
                minValue={0}
                prefixLabel={<span className={"w-20 text-center"}>Week</span>}
                suffixLabel={(value) => (
                    <span className={"w-20 text-center"}>{value}w</span>
                )}
                value={0}
            />
            <TimePicker
                className={"w-full"}
                timeMilliseconds={1000 * 60 * 60 * 24}
                step={1}
                maxValue={7}
                minValue={0}
                prefixLabel={<span className={"w-20 text-center"}>Day</span>}
                suffixLabel={(value) => (
                    <span className={"w-20 text-center"}>{value}d</span>
                )}
                value={0}
            />
            <TimePicker
                className={"w-full"}
                timeMilliseconds={1000 * 60 * 60}
                step={2}
                maxValue={24}
                minValue={0}
                prefixLabel={<span className={"w-20 text-center"}>Hour</span>}
                suffixLabel={(value) => (
                    <span className={"w-20 text-center"}>{value}h</span>
                )}
                value={0}
            />
            <TimePicker
                className={"w-full"}
                timeMilliseconds={1000 * 60}
                step={1}
                maxValue={60}
                minValue={0}
                prefixLabel={<span className={"w-20 text-center"}>Minute</span>}
                suffixLabel={(value) => (
                    <span className={"w-20 text-center"}>{value}min</span>
                )}
                value={0}
            />
        </TimePickerContainer>
    </div>


}