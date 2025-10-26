import {Button} from "@/components/ui/button.tsx";

import NiceModal from "@ebay/nice-modal-react";
import React from "react";
import {dialog} from "../../../../registry/ui/surface.tsx";

export default () => {
    const [confirmResult, setConfirmResult] = React.useState<boolean | undefined>(undefined);
    const openAlertDialog = async () => {
        const result = await dialog.confirm({
            title: "Confirm Dialog",
            message: "Are you sure to perform this operation?",
            hasCloseButton: false,
            closeOnCloseOverlay: false,
            modal: false,
        })
        await dialog.alert({
            title: "Confirm Result",
            message: `You have selected: ${result}`,
            hasCloseButton: false
        })
        setConfirmResult(result);
    }
    return <NiceModal.Provider>
        <div className={"flex flex-col items-center gap-2"}>
            <Button variant={"outline"} onClick={openAlertDialog}>Open Confirm Dialog</Button>
            <div>Confirm result: {confirmResult !== undefined ? confirmResult.toString() : "undefined"}</div>
        </div>
    </NiceModal.Provider>

}