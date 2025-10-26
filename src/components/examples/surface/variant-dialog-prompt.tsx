import {Button} from "@/components/ui/button.tsx";
import React from "react";
import {dialog} from "../../../../registry/ui/surface.tsx";


export default () => {
    const [modalContent, setModalContent] = React.useState<string>("");
    const openModal = async () => {
        const content = await dialog.prompt({
            title: "Prompt Modal",
            message: "This is a prompt modal dialog. Please enter some text:",
            placeholder: "Enter your text here",
            hasCloseButton: false
        })
        setModalContent(content || "");
    }
    return <div className={"flex flex-col items-center gap-2"}>
        <Button variant={"outline"} onClick={openModal}>Open Prompt Modal</Button>
        <div>The content in the modal input : {modalContent}</div>
    </div>
}