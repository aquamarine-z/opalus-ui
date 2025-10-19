import {Button} from "@/components/ui/button.tsx";
import {modal} from "registry/ui/modal";
import NiceModal from "@ebay/nice-modal-react";
import React from "react";

export default () => {
    const [confirmResult, setConfirmResult] = React.useState<boolean | undefined>(undefined);
    const openAlertDialog = async () => {
        const result = await modal.confirm({
            title: "Confirm Dialog",
            message: "Are you sure to perform this operation?",
            hasCloseButton: false
        })
        await modal.alert({
            title: "Confirm Result",
            message: `You have selected: ${result}`,
            hasCloseButton: true
        })

        setConfirmResult(result);
    }
    return <NiceModal.Provider>
        <div className={"flex flex-col items-center gap-2"}>
            <Button variant={"outline"} onClick={openAlertDialog}>Open Confirm Dialog</Button>
            <div>Confirm result: {confirmResult!==undefined ? confirmResult.toString() : "undefined"}</div>
        </div>
    </NiceModal.Provider>

}