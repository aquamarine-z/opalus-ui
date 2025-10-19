import {Dialog, DialogTrigger} from "@/components/ui/dialog.tsx";
import {OpalusDialogContent} from "../../../../registry/ui/opalus-dialog-content.tsx";
import {Button} from "@/components/ui/button.tsx";

export default () => {
    return <div>
        <Dialog>
            <DialogTrigger asChild>
                <Button variant={"outline"}>Open Custom Dialog</Button>

            </DialogTrigger>
            <OpalusDialogContent closeButton={false}>
                <h2 className="text-lg font-medium">Custom Dialog Content</h2>
                <p className="text-sm text-gray-600">
                    This is an example of using OpalusDialogContent without the default close button.
                </p>
            </OpalusDialogContent>
        </Dialog>
    </div>
}