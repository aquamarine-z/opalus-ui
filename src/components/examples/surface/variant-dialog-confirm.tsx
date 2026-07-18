import {Button} from "@/components/ui/button.tsx";
import React from "react";
import {dialog} from "../../../../registry/ui/surface.tsx";

export default () => {
    const [confirmResult, setConfirmResult] = React.useState<boolean | null | undefined>(undefined);
    const openAlertDialog = async () => {
        const result = await dialog.confirm({
            title: "Confirm Dialog",
            message: "Are you sure to perform this operation?",
            showCloseButton: false,
            dismissible: false,
            modal: false,
        })
        await dialog.alert({
            title: "Confirm Result",
            message: `You have selected: ${result}`,
            showCloseButton: false
        })
        setConfirmResult(result);
    }
    return <div className={"flex flex-col items-center gap-2"}>
        <Button variant={"outline"} onClick={openAlertDialog}>Open Confirm Dialog</Button>
        <div>Confirm result: {confirmResult === undefined ? "undefined" : String(confirmResult)}</div>
    </div>

}
