import {Button} from "@/components/ui/button.tsx";
import {modal} from "../../../../registry/ui/modal.tsx";
import NiceModal from "@ebay/nice-modal-react";
import React from "react";


export default () => {
    const [modalContent, setModalContent] = React.useState<string>("");
    const openModal = async () => {
        const content = await modal.prompt({
            title: "Prompt Modal",
            message: "This is a prompt modal dialog. Please enter some text:",
            placeholder: "Enter your text here",
            hasCloseButton: true
        })
        setModalContent(content || "");
    }
    return <NiceModal.Provider>
        <div className={"flex flex-col items-center gap-2"}>
            <Button variant={"outline"} onClick={openModal}>Open Prompt Modal</Button>
            <div>The content in the modal input : {modalContent}</div>
        </div>
    </NiceModal.Provider>
}