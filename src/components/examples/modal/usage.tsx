import {Button} from "@/components/ui/button.tsx";
import {showCustomModal} from "../../../../registry/ui/modal.tsx";
import NiceModal from "@ebay/nice-modal-react";



export default ()=>{
    const openModal = () => {
        showCustomModal(<div>Modal</div>)
    }
    return <NiceModal.Provider>
        <Button variant={"outline"} onClick={openModal}>Open Modal</Button>
    </NiceModal.Provider>
}