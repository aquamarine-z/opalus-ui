import {Button} from "@/components/ui/button.tsx";

import NiceModal from "@ebay/nice-modal-react";
import {dialog} from "../../../../registry/ui/surface.tsx";

export default () => {
    const openAlertDialog = async () => {
        await dialog.alert({
            title: "Alert Dialog",
            message: "This is an alert dialog using the alert variant of the modal function.",
            hasCloseButton: false,
            closeOnCloseOverlay: false,
            modal: false,
        })
    }
    return <NiceModal.Provider>
        <div>
            <Button variant={"outline"} onClick={openAlertDialog}>Open Alert Dialog</Button>
        </div>
    </NiceModal.Provider>

}